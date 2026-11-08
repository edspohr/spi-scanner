import * as admin from 'firebase-admin';
import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { OFFICIAL_SOURCES_REGISTRY } from './sources/registry';
import { analyzeRegulatoryDocument } from './ai/geminiAnalyzer';
import { generateDailyExecutiveDigest } from './ai/dailyDigest';
import { RegulatoryOpportunity, RawRegulatoryDocument, OpportunityStatus } from './sources/types';

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * 1. Escaneo Programado Diario (Cron a las 06:00 AM UTC-5 / Colombia / México)
 */
export const scheduledDailyScanner = onSchedule({
  schedule: '0 6 * * *',
  timeZone: 'America/Bogota',
  memory: '512MiB',
  timeoutSeconds: 300,
}, async (_event) => {
  console.log('Iniciando escaneo normativo diario automático para SPI Américas...');
  
  // Obtener oportunidades de las últimas 24 horas y generar digest
  const snapshot = await db.collection('regulatory_opportunities')
    .where('publicationDate', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .get();

  const opps: RegulatoryOpportunity[] = snapshot.docs.map(doc => doc.data() as RegulatoryOpportunity);
  const digest = await generateDailyExecutiveDigest(opps);

  await db.collection('daily_digests').doc(digest.id).set(digest);
  console.log(`Digest diario guardado con éxito. ID: ${digest.id}, Relevantes: ${digest.relevantCount}`);
});

/**
 * 2. Endpoint Callable: Disparar Escaneo Manual / Simulado
 */
export const triggerManualScan = onCall({
  cors: true,
  memory: '512MiB',
  timeoutSeconds: 300,
}, async (request) => {
  const countryFilter = request.data?.country;
  console.log(`Disparando escaneo manual. Filtro país: ${countryFilter || 'TODOS'}`);

  const sources = countryFilter 
    ? OFFICIAL_SOURCES_REGISTRY.filter(s => s.country === countryFilter)
    : OFFICIAL_SOURCES_REGISTRY;

  return {
    success: true,
    sourcesChecked: sources.length,
    timestamp: new Date().toISOString()
  };
});

/**
 * 3. Endpoint Callable: Analizar Documento Bajo Demanda con Gemini
 */
export const analyzeCustomDocument = onCall({
  cors: true,
  memory: '512MiB',
  timeoutSeconds: 120,
}, async (request) => {
  const data = request.data as RawRegulatoryDocument;
  if (!data || !data.rawContent || !data.country) {
    throw new HttpsError('invalid-argument', 'El documento debe contener al menos rawContent y country.');
  }

  const analysis = await analyzeRegulatoryDocument(data);
  if (!analysis) {
    return { isRelevant: false, message: 'El documento fue evaluado pero no cumple los criterios de relevancia para SPI.' };
  }

  // Guardar en Firestore
  await db.collection('regulatory_opportunities').doc(analysis.id).set(analysis);
  return { isRelevant: true, opportunity: analysis };
});

/**
 * 4. Endpoint Callable: Asignar Oportunidad a Consultor SPI
 */
export const assignOpportunityToMember = onCall({
  cors: true,
}, async (request) => {
  const { opportunityId, memberId, memberName, memberEmail, memberRole, status, note } = request.data;

  if (!opportunityId) {
    throw new HttpsError('invalid-argument', 'Se requiere opportunityId.');
  }

  const docRef = db.collection('regulatory_opportunities').doc(opportunityId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new HttpsError('not-found', 'Oportunidad no encontrada en Firestore.');
  }

  const currentData = doc.data() as RegulatoryOpportunity;
  const updatePayload: Partial<RegulatoryOpportunity> = {
    lastUpdated: new Date().toISOString()
  };

  if (status) {
    updatePayload.status = status as OpportunityStatus;
  }

  if (memberId && memberName) {
    updatePayload.assignedTo = {
      id: memberId,
      name: memberName,
      email: memberEmail || '',
      role: memberRole || 'Consultor Regulatorio'
    };
    updatePayload.assignedAt = new Date().toISOString();
  }

  if (note) {
    const existingNotes = currentData.managementNotes || [];
    existingNotes.push({
      author: memberName || 'Sistema SPI',
      date: new Date().toISOString(),
      comment: note
    });
    updatePayload.managementNotes = existingNotes;
  }

  await docRef.update(updatePayload);
  return { success: true, updatedOpportunity: { ...currentData, ...updatePayload } };
});

/**
 * 5. Endpoint HTTPS: Obtener Reporte Diario en Formato JSON / Email Preview
 */
export const getLatestDailyReport = onRequest({
  cors: true,
}, async (_req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const digestDoc = await db.collection('daily_digests').doc(`digest-${todayStr}`).get();

    if (digestDoc.exists) {
      res.status(200).json(digestDoc.data());
      return;
    }

    // Si no existe hoy, buscar el más reciente
    const recent = await db.collection('daily_digests')
      .orderBy('digestDate', 'desc')
      .limit(1)
      .get();

    if (!recent.empty) {
      res.status(200).json(recent.docs[0].data());
      return;
    }

    res.status(200).json({
      message: 'No hay digest generado aún para hoy.',
      hasCriticalUpdates: false
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
