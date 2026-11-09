/**
 * deduplicator.ts
 * Evita re-analizar documentos que ya fueron procesados.
 * Usa una colección Firestore `processed_documents` como registro de hashes.
 */
import * as admin from 'firebase-admin';
import { createHash } from 'crypto';

const db = () => admin.firestore();
const COLLECTION = 'processed_documents';

/**
 * Genera un hash SHA-256 del ID de documento (URL-based) para evitar duplicados.
 */
export function hashDocumentId(documentId: string): string {
  return createHash('sha256').update(documentId).digest('hex');
}

/**
 * Verifica si un documento ya fue procesado anteriormente.
 */
export async function isAlreadyProcessed(documentId: string): Promise<boolean> {
  const hash = hashDocumentId(documentId);
  const doc = await db().collection(COLLECTION).doc(hash).get();
  return doc.exists;
}

/**
 * Verifica múltiples documentos en batch (máximo 30 por limitación de Firestore).
 * Retorna un Set con los IDs ya procesados.
 */
export async function filterAlreadyProcessed(documentIds: string[]): Promise<Set<string>> {
  if (documentIds.length === 0) return new Set();

  const alreadyProcessed = new Set<string>();
  const BATCH_SIZE = 30;

  for (let i = 0; i < documentIds.length; i += BATCH_SIZE) {
    const batch = documentIds.slice(i, i + BATCH_SIZE);
    const hashes = batch.map(id => hashDocumentId(id));

    const refs = hashes.map(hash => db().collection(COLLECTION).doc(hash));
    const snapshots = await db().getAll(...refs);

    snapshots.forEach((snap, idx) => {
      if (snap.exists) {
        alreadyProcessed.add(batch[idx]);
      }
    });
  }

  return alreadyProcessed;
}

/**
 * Marca un documento como procesado en Firestore.
 */
export async function markAsProcessed(
  documentId: string,
  metadata: { sourceId: string; title: string; country: string }
): Promise<void> {
  const hash = hashDocumentId(documentId);
  await db().collection(COLLECTION).doc(hash).set({
    documentId,
    hash,
    sourceId: metadata.sourceId,
    title: metadata.title,
    country: metadata.country,
    processedAt: new Date().toISOString(),
  });
}

/**
 * Elimina registros de procesamiento más antiguos que N días (mantenimiento).
 * Llamar periódicamente para evitar acumulación infinita.
 */
export async function cleanupOldRecords(olderThanDays = 90): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();
  const snapshot = await db().collection(COLLECTION)
    .where('processedAt', '<', cutoff)
    .limit(500)
    .get();

  if (snapshot.empty) return 0;

  const batch = db().batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  return snapshot.docs.length;
}
