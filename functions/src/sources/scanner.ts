/**
 * scanner.ts
 * Orquestador principal del pipeline de escaneo regulatorio.
 *
 * Flujo por fuente:
 *   1. fetchSourceFeed()      → obtiene items del RSS/Atom/HTML
 *   2. filterAlreadyProcessed() → descarta documentos ya analizados
 *   3. analyzeRegulatoryDocument() → Gemini evalúa relevancia y extrae insights
 *   4. Si isRelevant → guarda en Firestore regulatory_opportunities
 *   5. markAsProcessed()     → registra hash para deduplicación futura
 */
import * as admin from 'firebase-admin';
import { OFFICIAL_SOURCES_REGISTRY } from './registry';
import { OfficialSourceConfig, RegulatoryOpportunity, CountryCode } from './types';
import { fetchSourceFeed } from './rssFetcher';
import { filterAlreadyProcessed, markAsProcessed } from './deduplicator';
import { analyzeRegulatoryDocument } from '../ai/geminiAnalyzer';

const db = () => admin.firestore();

export interface ScanResult {
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  documentsFound: number;
  documentsSkipped: number;  // ya procesados
  documentsAnalyzed: number;
  opportunitiesFound: number;
  errors: Array<{ sourceId: string; error: string }>;
  newOpportunities: RegulatoryOpportunity[];
}

/**
 * Escanea una fuente individual.
 * Retorna las nuevas oportunidades encontradas.
 */
async function scanSingleSource(
  source: OfficialSourceConfig,
  maxItemsPerSource = 10
): Promise<{ opportunities: RegulatoryOpportunity[]; skipped: number; failed: boolean }> {
  try {
    console.log(`[Scanner] → Escaneando: ${source.id} (${source.country})`);
    const rawDocs = await fetchSourceFeed(source, maxItemsPerSource);

    if (rawDocs.length === 0) {
      console.log(`[Scanner]   Sin documentos nuevos en ${source.id}`);
      return { opportunities: [], skipped: 0, failed: false };
    }

    // Filtrar ya procesados
    const docIds = rawDocs.map(d => d.id);
    const alreadyProcessed = await filterAlreadyProcessed(docIds);
    const newDocs = rawDocs.filter(d => !alreadyProcessed.has(d.id));

    console.log(`[Scanner]   ${source.id}: ${rawDocs.length} encontrados, ${alreadyProcessed.size} ya procesados, ${newDocs.length} a analizar`);

    const opportunities: RegulatoryOpportunity[] = [];

    for (const doc of newDocs) {
      try {
        // Analizar con Gemini
        const analysis = await analyzeRegulatoryDocument(doc);

        // Marcar como procesado independientemente del resultado
        await markAsProcessed(doc.id, {
          sourceId: source.id,
          title: doc.title,
          country: doc.country,
        });

        if (analysis && analysis.isRelevant) {
          // Guardar en Firestore
          await db().collection('regulatory_opportunities').doc(analysis.id).set(analysis);
          opportunities.push(analysis);
          console.log(`[Scanner]   ✅ Oportunidad guardada: ${analysis.title} [${analysis.urgency}]`);
        } else {
          console.log(`[Scanner]   ⚪ No relevante para SPI: ${doc.title}`);
        }

        // Pausa breve para no saturar la API de Vertex AI
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err) {
        console.error(`[Scanner]   Error analizando doc ${doc.id}:`, err);
        // No re-lanzar — continuar con el siguiente documento
      }
    }

    return { opportunities, skipped: alreadyProcessed.size, failed: false };

  } catch (err) {
    console.error(`[Scanner] Error en fuente ${source.id}:`, err);
    return { opportunities: [], skipped: 0, failed: true };
  }
}

/**
 * Escanea múltiples fuentes en secuencia (evita rate limiting).
 * Filtra por país si se especifica.
 */
export async function runFullScan(options: {
  countryFilter?: CountryCode;
  maxItemsPerSource?: number;
  maxSources?: number;
}): Promise<ScanResult> {
  const { countryFilter, maxItemsPerSource = 5, maxSources } = options;

  let sources = OFFICIAL_SOURCES_REGISTRY.filter(s => s.isActive);

  if (countryFilter) {
    sources = sources.filter(s => s.country === countryFilter);
  }

  if (maxSources) {
    sources = sources.slice(0, maxSources);
  }

  console.log(`[Scanner] Iniciando escaneo completo. Fuentes: ${sources.length}${countryFilter ? ` (filtro: ${countryFilter})` : ''}`);

  const result: ScanResult = {
    sourcesAttempted: sources.length,
    sourcesSucceeded: 0,
    sourcesFailed: 0,
    documentsFound: 0,
    documentsSkipped: 0,
    documentsAnalyzed: 0,
    opportunitiesFound: 0,
    errors: [],
    newOpportunities: [],
  };

  for (const source of sources) {
    const { opportunities, skipped, failed } = await scanSingleSource(source, maxItemsPerSource);

    if (failed) {
      result.sourcesFailed++;
      result.errors.push({ sourceId: source.id, error: 'Fallo al acceder a la fuente' });
    } else {
      result.sourcesSucceeded++;
    }

    result.documentsSkipped += skipped;
    result.documentsAnalyzed += opportunities.length;
    result.opportunitiesFound += opportunities.length;
    result.newOpportunities.push(...opportunities);

    // Pausa entre fuentes para ser buenos ciudadanos de red
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  result.documentsFound = result.documentsSkipped + result.documentsAnalyzed;

  console.log(`[Scanner] Escaneo completado. Resultados:`, {
    fuentes: `${result.sourcesSucceeded}/${result.sourcesAttempted} OK`,
    documentos: result.documentsFound,
    nuevasOportunidades: result.opportunitiesFound,
  });

  return result;
}
