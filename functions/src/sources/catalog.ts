import * as admin from 'firebase-admin';
import { z } from 'zod';
import { OfficialSourceConfig } from './types';
import { publicSourceUrl } from './publicResource';

export const sourceInput = z.object({
  name: z.string().trim().min(3).max(160),
  entityName: z.string().trim().min(2).max(160),
  country: z.enum(['CO', 'MX', 'BR', 'AR', 'CL', 'PE']),
  category: z.enum(['sanitary', 'intellectual_property', 'official_gazette']),
  feedUrl: z.string().trim().min(1).max(2048).transform(value => publicSourceUrl(value).href),
  portalUrl: z.string().trim().max(2048).optional(),
  notes: z.string().trim().max(1000).default(''),
  isActive: z.boolean().default(true)
}).transform(input => ({
  ...input,
  portalUrl: input.portalUrl ? publicSourceUrl(input.portalUrl).href : new URL(input.feedUrl).origin,
  sectors: [], frequencyHours: 24
}));

/** Firestore is the authoritative catalog, including an intentionally empty catalog. */
export async function getOfficialSources(): Promise<OfficialSourceConfig[]> {
  const snapshot = await admin.firestore().collection('official_sources').get();
  return snapshot.docs.filter(doc => !doc.data().deletedAt).map(doc => ({...doc.data(), id: doc.id} as OfficialSourceConfig));
}
