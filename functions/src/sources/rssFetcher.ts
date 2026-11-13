import * as cheerio from 'cheerio';
import { OfficialSourceConfig, RawRegulatoryDocument } from './types';
import { createHash } from 'crypto';
import parsePdf from 'pdf-parse';
import { fetchPublicResource } from './publicResource';

function text(html: string): string { return cheerio.load(html).text().replace(/\s+/g, ' ').trim(); }
function publicationDate(value: string): string {
  const iso = value.match(/\b(20\d{2})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  const numeric = value.match(/\b(\d{1,2})[\/.](\d{1,2})[\/.](20\d{2})\b/);
  if (numeric) return `${numeric[3]}-${numeric[2].padStart(2,'0')}-${numeric[1].padStart(2,'0')}`;
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const named = value.toLowerCase().match(/\b(\d{1,2})\s+de\s+(\w+)\s+de\s+(20\d{2})\b/);
  if (named && months.includes(named[2])) return `${named[3]}-${String(months.indexOf(named[2])+1).padStart(2,'0')}-${named[1].padStart(2,'0')}`;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && value.length < 80 ? new Date(parsed).toISOString().slice(0,10) : '';
}
async function fetchHtml(url: string): Promise<{body: string; url: string}> {
  const response = await fetchPublicResource(url);
  if (response.contentType.includes('pdf')) {
    const data = response.body;
    const parsed = await parsePdf(Buffer.from(data), {max: 20});
    const escaped = parsed.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return {body: `<article>${escaped}</article>`, url:response.url};
  }
  let body = response.body.toString('utf8');
  // Some gob.mx listing endpoints return a JSON-encoded HTML fragment.
  try { const decoded = JSON.parse(body); if (typeof decoded === 'string') body = decoded; else if (typeof decoded.html === 'string') body = decoded.html; } catch { /* HTML or XML */ }
  const fragment = body.match(/\.append\('([\s\S]*)'\);?\s*$/);
  if (fragment) body = fragment[1].replace(/\\+["']/g, match => match.slice(-1)).replace(/\\+n/g, '\n').replace(/\\+\//g, '/');
  return {body, url:response.url};
}

export interface SourceDocuments {
  documents: RawRegulatoryDocument[];
  errors: Array<{url:string;message:string}>;
}

export async function fetchSourceDocuments(source: OfficialSourceConfig, maxItems = 3): Promise<SourceDocuments> {
  const sourceUrl = new URL(source.feedUrl);
  // ANVISA now serves a JavaScript listing. Its public Plone API exposes the same official articles.
  const anvisa = sourceUrl.hostname === 'www.gov.br' && /^\/anvisa\/pt-br\/(assuntos\/noticias-anvisa|comunicacao\/noticias)\/?$/.test(sourceUrl.pathname);
  const listUrl = anvisa ? `https://www.gov.br/anvisa/++api++/pt-br/assuntos/noticias-anvisa/@search?portal_type=News%20Item&sort_on=effective&sort_order=descending&b_size=${Math.min(maxItems,5)}` : source.feedUrl;
  const page = await fetchHtml(listUrl);
  const isFeed = /<(rss|feed)(\s|>)/i.test(page.body);
  const $ = cheerio.load(page.body, isFeed ? {xmlMode:true} : undefined);
  const candidates: Array<{title:string; link:string; content:string; date:string}> = [];
  let jsonItems: unknown;
  try { jsonItems = JSON.parse(page.body).items; } catch { /* HTML/XML listing */ }
  if (anvisa && Array.isArray(jsonItems)) {
    for (const item of jsonItems) {
      if (typeof item.title === 'string' && typeof item['@id'] === 'string') candidates.push({title:item.title,link:item['@id'],content:'',date:publicationDate(item.effective || '')});
    }
  } else if (isFeed) {
    $('item, entry').each((_, el) => {
      const item = $(el);
      const link = item.find('link[rel="alternate"]').attr('href') || item.find('link').first().attr('href') || item.find('link').first().text();
      candidates.push({title:item.find('title').first().text().trim(), link, content:text(item.find('content\\:encoded, description, content, summary').first().text()), date:publicationDate(item.find('pubDate, published, updated, dc\\:date').first().text())});
    });
  } else {
    const pattern = source.itemLinkPattern ? new RegExp(source.itemLinkPattern) : /(?:resolucion|disposicion|norma|circular|noticia|article|articulo)[^#]+/i;
    $('a[href]').each((_,el) => {
      const anchor = $(el);
      let title = anchor.find('h2,h3,.card-title,.o_blog_post_title').first().text().trim() || anchor.closest('article').find('h2,h3').first().text().trim() || anchor.text().replace(/\s+/g,' ').trim();
      try {
        const link = new URL(anchor.attr('href') || '',page.url);
        const isPdf = /\.pdf$/i.test(link.pathname);
        const rowText = anchor.closest('tr').find('th,td').map((_,cell)=>$(cell).text().replace(/\s+/g,' ').trim()).get().join(' ');
        if (isPdf && !source.itemLinkPattern && title.length < 25 && publicationDate(rowText)) title = `${source.entityName} — ${decodeURIComponent(link.pathname.split('/').pop() || '').replace(/_/g,' ')}${rowText ? ' — '+rowText.slice(0,180) : ''}`;
        if (link.protocol !== 'https:' || link.hostname.replace(/^www\./,'') !== new URL(page.url).hostname.replace(/^www\./,'') || (!pattern.test(link.pathname) && !(isPdf && !source.itemLinkPattern && publicationDate(rowText))) || title.length < 25) return;
        link.hash='';
        if (candidates.some(item => item.link === link.href)) return;
        candidates.push({title, link:link.href, content:'', date:publicationDate(rowText) || publicationDate(anchor.closest('article,.card,.panel,.o_wblog_post').find('time').first().attr('datetime') || anchor.closest('article,.card,.panel,.o_wblog_post').find('time').first().text())});
      } catch { /* Skip malformed links. */ }
    });
  }
  if (!candidates.length) {
    if (isFeed || (anvisa && Array.isArray(jsonItems))) return {documents:[],errors:[]};
    throw new Error('No se pudieron extraer documentos de este portal. Requiere revisar su formato o acceso.');
  }
  const documents: RawRegulatoryDocument[]=[];
  const failures: Array<{url:string;message:string}>=[];
  for (const item of candidates.slice(0,maxItems)) {
    try {
      const article = await fetchHtml(new URL(item.link,page.url).href);
      const doc = cheerio.load(article.body);
      const metaDate = doc('meta[property="article:published_time"],meta[name="date"],meta[name="DC.date.issued"],meta[itemprop="datePublished"]').first().attr('content') || doc('time[datetime]').first().attr('datetime') || '';
      doc('script,style,nav,header,footer,aside,noscript,form,.social-share,.breadcrumb').remove();
      const title = doc('meta[property="og:title"]').attr('content')?.replace(/\s+/g,' ').trim() || doc('main h1, article h1, .documentFirstHeading').first().text().replace(/\s+/g,' ').trim() || item.title;
      const root = doc('#parent-fieldname-text, .field-name-body, .entry-content, .blog-content, [itemprop="articleBody"], .o_wblog_post_content_field').first();
      const fallback = doc('article,main,#content-core,#content,#wrap').first();
      const content = (root.length ? root : fallback.length ? fallback : doc('body')).text().replace(/\s+/g,' ').trim();
      const rawContent = content.length >= 200 ? content : item.content;
      if (rawContent.length < 200) throw new Error('No se pudo obtener texto suficiente del documento.');
      documents.push({
        id: `${source.id}-${createHash('sha256').update(article.url).digest('hex').slice(0,16)}`,
        sourceId:source.id, country:source.country, entityName:source.entityName,
        title, sourceUrl:article.url, publicationDate: item.date || publicationDate(doc('time').first().attr('datetime') || doc('time').first().text()) || publicationDate(metaDate) || publicationDate(content.slice(0,1200)),
        rawContent:`${title}\n\n${rawContent}`.slice(0,30000)
      });
    } catch(error) { failures.push({url:item.link,message:error instanceof Error ? error.message : 'No se pudo leer un documento.'}); }
  }
  return {documents,errors:failures};
}


/** Convenience API for command-line inspections. Scans use the detailed result. */
export async function fetchSourceFeed(source: OfficialSourceConfig, maxItems = 3): Promise<RawRegulatoryDocument[]> {
  const result = await fetchSourceDocuments(source,maxItems);
  if (!result.documents.length && result.errors.length) throw new Error(result.errors.map(error=>error.message).join('; '));
  return result.documents;
}
