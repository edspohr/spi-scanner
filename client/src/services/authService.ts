import {
  GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword,
  sendPasswordResetEmail, sendEmailVerification,
  signOut as firebaseSignOut, onAuthStateChanged, User
} from 'firebase/auth';
import { auth } from './firebaseConfig';

const ALLOWED_DOMAINS = ['spiamericas.com', 'spohr.cl'];
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });
auth.languageCode = 'es';

export function isAllowedEmail(email: string | null): boolean {
  return ALLOWED_DOMAINS.includes((email ?? '').trim().toLowerCase().split('@')[1] ?? '');
}

export function canAccessApp(user: User): boolean {
  return isAllowedEmail(user.email) && user.emailVerified;
}

function checkEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!isAllowedEmail(normalized)) {
    throw new Error('Acceso restringido a cuentas @spiamericas.com y @spohr.cl.');
  }
  return normalized;
}

async function validateUser(user: User): Promise<User> {
  if (!isAllowedEmail(user.email) || !user.emailVerified) {
    await firebaseSignOut(auth);
    checkEmail(user.email ?? '');
    throw new Error('Debes verificar tu correo antes de ingresar. Usa «Enviar verificación» y luego vuelve a iniciar sesión.');
  }
  return user;
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, provider);
  return validateUser(result.user);
}

export async function signInWithPassword(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, checkEmail(email), password);
  return validateUser(result.user);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, checkEmail(email));
}

export async function resendVerification(email: string, password: string): Promise<void> {
  const result = await signInWithEmailAndPassword(auth, checkEmail(email), password);
  try {
    if (!result.user.emailVerified) await sendEmailVerification(result.user);
  } finally {
    await firebaseSignOut(auth);
  }
}

export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Correo o contraseña incorrectos. Si usabas Google, ingresa con Google o usa «Olvidé mi contraseña».',
    'auth/wrong-password': 'Correo o contraseña incorrectos.',
    'auth/user-not-found': 'Correo o contraseña incorrectos.',
    'auth/invalid-email': 'Ingresa un correo válido.',
    'auth/missing-password': 'Ingresa tu contraseña.',
    'auth/popup-closed-by-user': 'Se cerró la ventana de Google. Inténtalo nuevamente.',
    'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e intenta nuevamente.',
    'auth/cancelled-popup-request': 'Ya hay un ingreso con Google en curso.',
    'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase Authentication. Agrégalo en Configuración → Dominios autorizados.',
    'auth/operation-not-allowed': 'Este método de ingreso no está habilitado en Firebase Authentication.',
    'auth/account-exists-with-different-credential': 'Este correo ya usa otro método de ingreso. Ingresa con tu contraseña.',
    'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos antes de volver a intentar.',
    'auth/network-request-failed': 'No se pudo conectar con Firebase. Revisa tu conexión.',
    'auth/user-disabled': 'Esta cuenta está deshabilitada. Contacta al administrador.'
  };
  return (code && messages[code]) || (error instanceof Error && !code ? error.message : 'No se pudo completar la solicitud. Inténtalo nuevamente.');
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthChanged(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
