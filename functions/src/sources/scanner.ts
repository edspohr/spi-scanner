import * as admin from 'firebase-admin';
import { getOfficialSources } from './catalog';
import { RegulatoryOpportunity, CountryCode } from './types';
import { fetchSourceDocuments } from './rssFetcher';
import { filterAlreadyProcessed, markAsProcessed } from './deduplicator';
import { makeSourceHealth } from './health';
import { analyzeRegulatoryDocument } from '../ai/geminiAnalyzer';

export interface ScanResult {
  sourcesAttempted: number; sourcesSucceeded: number; sourcesFailed: number;
  documentsFound: number; documentsSkipped: number; documentsAnalyzed: number;
  documentsFailed: number; opportunitiesFound: number;
  errors: Array<{ sourceId: string; error: string }>;
  newOpportunities: RegulatoryOpportunity[];
}

export async function runFullScan(options: { countryFilter?: CountryCode; maxItemsPerSource?: number; maxSources?: number }, analyze = analyzeRegulatoryDocument): Promise<ScanResult> {
  let sources = (await getOfficialSources()).filter(s => s.isActive && (!options.countryFilter || s.country === options.countryFilter));
  if (options.maxSources) sources = sources.slice(0, options.maxSources);
  const result: ScanResult = {sourcesAttempted: sources.length, sourcesSucceeded: 0, sourcesFailed: 0, documentsFound: 0, documentsSkipped: 0, documentsAnalyzed: 0, documentsFailed: 0, opportunitiesFound: 0, errors: [], newOpportunities: []};
  const deadline = Date.now() + 420000;
  for (const source of sources) {
    if (Date.now() > deadline) {
      result.sourcesFailed++;
      result.errors.push({sourceId:source.id, error:'Fuente pendiente: se alcanzó el tiempo máximo del escaneo.'});
      continue;
    }
    try {
      const {documents,errors} = await fetchSourceDocuments(source, options.maxItemsPerSource ?? 3);
      await admin.firestore().collection('official_sources').doc(source.id).update({health:makeSourceHealth(source,documents,errors)});
      if (errors.length) {
        result.sourcesFailed++;
        result.errors.push(...errors.map(error=>({sourceId:source.id,error:`${error.url}: ${error.message}`})));
      } else result.sourcesSucceeded++;
      result.documentsFound += documents.length;
      const processed = await filterAlreadyProcessed(documents.map(d => d.id));
      result.documentsSkipped += processed.size;
      for (const document of documents.filter(d => !processed.has(d.id))) {
        try {
          if (Date.now() > deadline) throw new Error('Se alcanzó el tiempo máximo de análisis.');
          const analysis = await analyze(document);
          if (analysis) {
            // A deterministic ID plus create() preserves assignments on retries.
            try { await admin.firestore().collection('regulatory_opportunities').doc(analysis.id).create(analysis); }
            catch (error: any) { if (error.code !== 6) throw error; }
            result.newOpportunities.push(analysis);
            result.opportunitiesFound++;
          }
          // Failed analyses stay eligible for the next scan.
          await markAsProcessed(document.id, {sourceId: source.id, title: document.title, country: document.country});
          result.documentsAnalyzed++;
        } catch (error) {
          console.error('Document analysis failed:', document.id, error);
          result.documentsFailed++;
          result.errors.push({sourceId: source.id, error: `No se pudo analizar ${document.title}. El documento se reintentará.`});
        }
      }
    } catch (error) {
      result.sourcesFailed++;
      try { await admin.firestore().collection('official_sources').doc(source.id).update({health:makeSourceHealth(source,[],[],error)}); } catch (saveError) { console.error('Could not persist source health:',saveError); }
      result.errors.push({sourceId: source.id, error: error instanceof Error ? error.message : 'Error consultando fuente oficial.'});
    }
  }
  return result;
}
