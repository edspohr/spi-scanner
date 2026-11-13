import { HttpsError } from 'firebase-functions/v2/https';

export function requireSpiMember(request: {auth?: {uid: string; token: {email?: unknown; email_verified?: unknown; name?: string}}}) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Inicia sesión para continuar.');
  const { email, email_verified } = request.auth.token;
  if (typeof email !== 'string' || !/^[^@]+@(spiamericas\.com|spohr\.cl)$/i.test(email) || email_verified !== true) {
    throw new HttpsError('permission-denied', 'Se requiere un correo SPI verificado.');
  }
  return request.auth;
}
