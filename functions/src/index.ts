import * as admin from 'firebase-admin';
import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { z } from 'zod';
import { createHash } from 'crypto';
import { getOfficialSources, sourceInput } from './sources/catalog';
import { analyzeRegulatoryDocument } from './ai/geminiAnalyzer';
import { generateDailyExecutiveDigest } from './ai/dailyDigest';
import { runFullScan } from './sources/scanner';
import { RegulatoryOpportunity, RawRegulatoryDocument } from './sources/types';
import { fetchSourceDocuments } from './sources/rssFetcher';
import { makeSourceHealth } from './sources/health';
import { OfficialSourceConfig } from './sources/types';
import { requireSpiMember } from './auth';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const countries = z.enum(['CO', 'MX', 'BR', 'AR', 'CL', 'PE']);
const scanInput = z.object({country: countries.optional(), maxItemsPerSource: z.number().int().min(1).max(5).default(3)});

async function executeScan(country?: z.infer<typeof countries>, maxItemsPerSource = 3, initiatedBy = 'scheduler') {
  const lock = db.collection('scanner_state').doc('lock');
  const runRef = db.collection('scan_runs').doc();
  await db.runTransaction(async transaction => {
    const current = await transaction.get(lock);
    if ((current.data()?.expiresAt ?? 0) > Date.now()) throw new HttpsError('already-exists', 'Ya hay un escaneo en curso. Espera a que termine.');
    transaction.set(lock, {runId: runRef.id, expiresAt: Date.now() + 600000});
    transaction.set(runRef, {status: 'running', country: country || 'ALL', startedAt: new Date().toISOString(), initiatedBy});
  });
  try {
    const result = await runFullScan({countryFilter: country, maxItemsPerSource});
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recent = await db.collection('regulatory_opportunities').where('lastUpdated', '>=', since).get();
    const digest = await generateDailyExecutiveDigest(recent.docs.map(doc => doc.data() as RegulatoryOpportunity));
    digest.totalScanned = result.documentsFound;
    digest.executiveBriefingText += `\n\nCobertura del último escaneo: ${country || 'LatAm'}. Fuentes consultadas: ${result.sourcesSucceeded}/${result.sourcesAttempted}. Documentos encontrados: ${result.documentsFound}; analizados: ${result.documentsAnalyzed}; ya procesados: ${result.documentsSkipped}; errores de análisis: ${result.documentsFailed}.`;
    if (result.errors.length) digest.executiveBriefingText += '\nConsulta incompleta. Fuentes o análisis con error: ' + result.errors.map(e => `${e.sourceId}: ${e.error}`).join('; ');
    // Never label a failed scan as a clean daily report.
    if (result.sourcesSucceeded > 0) await db.collection('daily_digests').doc(digest.id).set(digest);
    const {newOpportunities: _newOpportunities, ...summary} = result;
    const success = result.sourcesFailed === 0 && result.documentsFailed === 0 && result.sourcesSucceeded > 0;
    await runRef.update({...summary, status: success ? 'completed' : 'partial', finishedAt: new Date().toISOString()});
    return {...summary, success, runId: runRef.id};
  } catch (error) {
    await runRef.update({status: 'failed', finishedAt: new Date().toISOString()});
    throw error;
  } finally {
    await db.runTransaction(async transaction => {
      const current = await transaction.get(lock);
      if (current.data()?.runId === runRef.id) transaction.delete(lock);
    });
  }
}

export const scheduledDailyScanner = onSchedule({schedule: '0 6 * * *', timeZone: 'America/Bogota', memory: '1GiB', timeoutSeconds: 540}, async () => {
  await executeScan();
});

export const triggerManualScan = onCall({cors: true, memory: '1GiB', timeoutSeconds: 540, maxInstances: 2}, async request => {
  const user = requireSpiMember(request);
  const input = scanInput.safeParse(request.data);
  if (!input.success) throw new HttpsError('invalid-argument', 'País o límite de documentos inválido.');
  return executeScan(input.data.country, input.data.maxItemsPerSource, user.uid);
});

export const analyzeCustomDocument = onCall({cors: true, memory: '512MiB', timeoutSeconds: 120, maxInstances: 2}, async request => {
  requireSpiMember(request);
  const input = z.object({country: countries, rawContent: z.string().trim().min(100).max(50000), sourceUrl: z.string().url(), publicationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)}).safeParse(request.data);
  if (!input.success) throw new HttpsError('invalid-argument', 'Indica país, fecha de publicación, enlace oficial y al menos 100 caracteres del documento.');
  const url = new URL(input.data.sourceUrl);
  const hosts = (await getOfficialSources()).filter(s => s.country === input.data.country).flatMap(s => [new URL(s.feedUrl).hostname, new URL(s.portalUrl).hostname]).map(h => h.replace(/^www\./, ''));
  if (url.protocol !== 'https:' || !hosts.includes(url.hostname.replace(/^www\./, ''))) throw new HttpsError('invalid-argument', 'El enlace debe pertenecer a una fuente oficial del país seleccionado y usar HTTPS.');
  const document: RawRegulatoryDocument = {
    ...input.data, id: createHash('sha256').update(url.href).digest('hex'), sourceId: 'manual',
    title: input.data.rawContent.split('\n')[0].slice(0, 240), entityName: url.hostname
  };
  const analysis = await analyzeRegulatoryDocument(document);
  if (!analysis) return {isRelevant: false};
  const ref = db.collection('regulatory_opportunities').doc(analysis.id);
  try { await ref.create(analysis); } catch (error: any) { if (error.code !== 6) throw error; }
  return {isRelevant: true, opportunity: (await ref.get()).data()};
});

export const assignOpportunityToMember = onCall({cors: true}, async request => {
  const user = requireSpiMember(request);
  const input = z.object({opportunityId: z.string().min(1).max(200), memberId: z.string().nullable().optional(), status: z.enum(['nueva','en_evaluacion','asignada','contactando_clientes','cerrada']), note: z.string().trim().max(5000).optional()}).safeParse(request.data);
  if (!input.success) throw new HttpsError('invalid-argument', 'Datos de asignación inválidos.');
  const {opportunityId, memberId, status, note} = input.data;
  const ref = db.collection('regulatory_opportunities').doc(opportunityId);
  const member = memberId ? await db.collection('team_members').doc(memberId).get() : null;
  if (memberId && !member?.exists) throw new HttpsError('not-found', 'Consultor no encontrado.');
  const data = member?.data();
  const update: Record<string, unknown> = {
    status, lastUpdated: new Date().toISOString(),
    assignedTo: data ? {id: memberId, name: data.name, email: data.email, role: data.role} : admin.firestore.FieldValue.delete(),
    assignedAt: data ? new Date().toISOString() : admin.firestore.FieldValue.delete()
  };
  if (note) update.managementNotes = admin.firestore.FieldValue.arrayUnion({author: user.token.name || user.token.email, date: new Date().toISOString(), comment: note});
  await ref.update(update);
  return {success: true};
});

export const getLatestDailyReport = onRequest({cors: true}, async (req, res) => {
  try {
    const bearer = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    if (!bearer) { res.status(401).json({error: 'Inicia sesión para consultar el reporte.'}); return; }
    const decoded = await admin.auth().verifyIdToken(bearer);
    requireSpiMember({auth: {uid: decoded.uid, token: decoded}});
    const recent = await db.collection('daily_digests').orderBy('digestDate','desc').limit(1).get();
    if (recent.empty) { res.status(404).json({message:'Aún no hay un reporte generado.'}); return; }
    res.status(200).json(recent.docs[0].data());
  } catch { res.status(403).json({error:'No tienes acceso al reporte.'}); }
});


/** Source management uses the same verified SPI membership as the scanner. */
export const manageOfficialSource = onCall({cors:true, maxInstances:2}, async request => {
  const user = requireSpiMember(request);
  const action = request.data?.action;
  if (action === 'create') {
    let source;
    try { source = sourceInput.parse(request.data.source); }
    catch { throw new HttpsError('invalid-argument', 'Revisa el nombre, entidad, país y enlaces HTTPS públicos de la fuente.'); }
    const id = `src-${createHash('sha256').update(source.feedUrl).digest('hex').slice(0,24)}`;
    const ref = db.collection('official_sources').doc(id);
    let savedId = id;
    await db.runTransaction(async transaction => {
      const existing = await transaction.get(db.collection('official_sources').where('feedUrl','==',source.feedUrl));
      if (existing.docs.some(doc => !doc.data().deletedAt)) throw new HttpsError('already-exists', 'Este enlace ya está en el catálogo.');
      const destination = existing.docs[0]?.ref || ref;
      savedId = destination.id;
      transaction.set(destination,{...source,id:savedId,createdAt:new Date().toISOString(),createdBy:user.uid});
    });
    return {id:savedId};
  }
  const input = z.object({id:z.string().regex(/^[a-zA-Z0-9_-]{1,200}$/),isActive:z.boolean().optional()}).safeParse(request.data);
  if (!input.success || !['delete','setActive'].includes(action)) throw new HttpsError('invalid-argument','Operación de fuente inválida.');
  const ref = db.collection('official_sources').doc(input.data.id);
  await db.runTransaction(async transaction => {
    const current = await transaction.get(ref);
    if (!current.exists || current.data()?.deletedAt) throw new HttpsError('not-found','La fuente ya no está disponible.');
    if (action === 'delete') transaction.update(ref,{isActive:false,deletedAt:new Date().toISOString(),deletedBy:user.uid});
    else {
      if (typeof input.data.isActive !== 'boolean') throw new HttpsError('invalid-argument','Indica si la fuente debe estar activa.');
      transaction.update(ref,{isActive:input.data.isActive,updatedAt:new Date().toISOString(),updatedBy:user.uid});
    }
  });
  return {success:true};
});


export const checkOfficialSource = onCall({cors:true,memory:'512MiB',timeoutSeconds:120,maxInstances:2}, async request => {
  requireSpiMember(request);
  const input = z.object({id:z.string().regex(/^[a-zA-Z0-9_-]{1,200}$/)}).safeParse(request.data);
  if (!input.success) throw new HttpsError('invalid-argument','Indica una fuente válida.');
  const ref = db.collection('official_sources').doc(input.data.id);
  const snapshot = await ref.get();
  if (!snapshot.exists || snapshot.data()?.deletedAt) throw new HttpsError('not-found','La fuente ya no está disponible.');
  const source = {...snapshot.data(),id:snapshot.id} as OfficialSourceConfig;
  let health;
  try {
    const result = await fetchSourceDocuments(source,2);
    health = makeSourceHealth(source,result.documents,result.errors);
  } catch (error) { health = makeSourceHealth(source,[],[],error); }
  await ref.update({health});
  return health;
});
