/**
 * rssFetcher.ts
 * Fetcher genérico que soporta RSS 2.0, Atom 1.0 y HTML scraping como fallback.
 * Parsea feeds con cheerio y extrae items normalizados.
 */
import * as cheerio from 'cheerio';
import { OfficialSourceConfig, RawRegulatoryDocument, CountryCode } from './types';
import { createHash } from 'crypto';

export interface FeedItem {
  title: string;
  link: string;
  content: string;
  pubDate: string;
  documentNumber?: string;
}

/**
 * Genera un ID determinista basado en URL del documento.
 */
function makeDocumentId(sourceId: string, link: string): string {
  const hash = createHash('sha256').update(`${sourceId}::${link}`).digest('hex').slice(0, 12);
  return `${sourceId}-${hash}`;
}

/**
 * Extrae texto limpio de un string HTML.
 */
function stripHtml(html: string): string {
  const $ = cheerio.load(html);
  return $.text().replace(/\s+/g, ' ').trim();
}

/**
 * Infiere número de documento de un título o contenido regulatorio.
 * Patrones comunes: Resolución 1234, RDC 123/2024, Disposición 456-E/2024
 */
function extractDocumentNumber(text: string): string | undefined {
  const patterns = [
    /(?:Resolución|Resolucao|Resolution)\s+(?:N[°º.]?\s*)?(\d{3,6}(?:[-\/]\w+)?)/i,
    /(?:RDC|IN|RE)\s+N[°º.]?\s*(\d+(?:\/\d{4})?)/i,
    /(?:Disposición|Disposicion)\s+N[°º.]?\s*(\d+[-\w]*(?:\/\d{4})?)/i,
    /(?:Circular|Decreto)\s+(?:N[°º.]?\s*)?(\d{3,6}(?:[-\/]\w+)?)/i,
    /(?:NOM|NMX)-(\d{3}-\w+-\d{4})/i,
    /(?:Acuerdo|Acdo\.?)\s+N[°º.]?\s*(\d+(?:\/\d{4})?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return undefined;
}

/**
 * Parsea un feed RSS 2.0 con cheerio.
 */
function parseRss(xml: string): FeedItem[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const items: FeedItem[] = [];

  $('item').each((_, el) => {
    const title = $(el).find('title').first().text().trim();
    const link = $(el).find('link').first().text().trim() ||
                 $(el).find('link').first().attr('href') || '';
    const content = $(el).find('description, content\\:encoded, content').first().text().trim();
    const pubDateRaw = $(el).find('pubDate, dc\\:date, published').first().text().trim();
    const pubDate = pubDateRaw ? new Date(pubDateRaw).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    if (title && link) {
      items.push({
        title,
        link,
        content: stripHtml(content) || title,
        pubDate,
        documentNumber: extractDocumentNumber(`${title} ${content}`)
      });
    }
  });

  return items;
}

/**
 * Parsea un feed Atom 1.0 con cheerio.
 */
function parseAtom(xml: string): FeedItem[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const items: FeedItem[] = [];

  $('entry').each((_, el) => {
    const title = $(el).find('title').first().text().trim();
    const link = $(el).find('link').first().attr('href') ||
                 $(el).find('link[rel="alternate"]').attr('href') || '';
    const content = $(el).find('content, summary').first().text().trim();
    const pubDateRaw = $(el).find('updated, published').first().text().trim();
    const pubDate = pubDateRaw ? new Date(pubDateRaw).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    if (title && link) {
      items.push({
        title,
        link,
        content: stripHtml(content) || title,
        pubDate,
        documentNumber: extractDocumentNumber(`${title} ${content}`)
      });
    }
  });

  return items;
}

/**
 * Realiza el fetch del feed y parsea según formato detectado.
 * Retorna array de RawRegulatoryDocument listos para Gemini.
 */
export async function fetchSourceFeed(
  source: OfficialSourceConfig,
  maxItems = 10
): Promise<RawRegulatoryDocument[]> {
  let responseText = '';

  try {
    const response = await fetch(source.feedUrl, {
      headers: {
        'User-Agent': 'SPI-Regulatory-Scanner/1.0 (+https://spi-scanner.web.app)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*',
      },
      signal: AbortSignal.timeout(15000), // 15s timeout por fuente
    });

    if (!response.ok) {
      console.warn(`[${source.id}] HTTP ${response.status} al acceder a ${source.feedUrl}`);
      return [];
    }

    responseText = await response.text();
  } catch (err) {
    console.warn(`[${source.id}] Error de red al acceder a ${source.feedUrl}:`, err);
    return [];
  }

  // Detectar formato del feed
  let items: FeedItem[] = [];

  if (responseText.includes('<rss') || responseText.includes('<channel>')) {
    items = parseRss(responseText);
  } else if (responseText.includes('<feed') || responseText.includes('<entry>')) {
    items = parseAtom(responseText);
  } else {
    // Fallback: tratar como HTML y extraer links con texto
    const $ = cheerio.load(responseText);
    $('a[href]').each((_, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr('href') || '';
      const fullUrl = href.startsWith('http') ? href : `${new URL(source.portalUrl).origin}${href}`;
      if (title.length > 20 && fullUrl.includes('http')) {
        items.push({
          title,
          link: fullUrl,
          content: title,
          pubDate: new Date().toISOString().split('T')[0],
          documentNumber: extractDocumentNumber(title)
        });
      }
    });
    items = items.slice(0, maxItems);
  }

  // Convertir a RawRegulatoryDocument
  return items.slice(0, maxItems).map((item): RawRegulatoryDocument => ({
    id: makeDocumentId(source.id, item.link),
    sourceId: source.id,
    country: source.country as CountryCode,
    entityName: source.entityName,
    title: item.title,
    documentNumber: item.documentNumber,
    publicationDate: item.pubDate,
    sourceUrl: item.link,
    rawContent: `${item.title}\n\n${item.content}`.slice(0, 8000), // Límite seguro para Gemini
  }));
}
