import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './firebaseConfig';

const ALLOWED_DOMAIN = 'spiamericas.com';

const provider = new GoogleAuthProvider();
// Forzar selección de cuenta siempre
provider.setCustomParameters({ prompt: 'select_account' });

/**
 * Inicia sesión con Google. Verifica que el email sea @spiamericas.com.
 * Lanza un error si el dominio no está permitido.
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, provider);
  const email = result.user.email ?? '';

  if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    // Desloguear inmediatamente si el dominio no es válido
    await firebaseSignOut(auth);
    throw new Error(
      `Acceso restringido. Solo cuentas @${ALLOWED_DOMAIN} pueden ingresar. Email utilizado: ${email}`
    );
  }

  return result.user;
}

/**
 * Cierra la sesión actual.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Suscripción al estado de autenticación. Devuelve la función de desuscripción.
 */
export function onAuthChanged(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Retorna el usuario actualmente autenticado (o null).
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
