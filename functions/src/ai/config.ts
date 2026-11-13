export const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT ||
  JSON.parse(process.env.FIREBASE_CONFIG || '{}').projectId || 'spi-scanner';
export const LOCATION = process.env.VERTEX_LOCATION || 'global';
export const MODEL = process.env.VERTEX_MODEL || 'gemini-3.5-flash';
