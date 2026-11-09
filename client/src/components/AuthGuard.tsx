import React, { useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChanged } from '../services/authService';
import { LoginPage } from './LoginPage';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: (user: User) => ReactNode;
}

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * Envuelve la app y protege el contenido hasta confirmar autenticación.
 * Mientras resuelve el estado inicial de Firebase Auth, muestra un spinner.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setAuthState('authenticated');
      } else {
        setUser(null);
        setAuthState('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  // Splash de carga inicial (Firebase resolviendo sesión persistida)
  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/spi-logo-white.png" alt="SPI Américas" className="h-10 w-auto opacity-80 animate-pulse" />
          <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
          <p className="text-xs text-slate-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  return <>{children(user!)}</>;
};
