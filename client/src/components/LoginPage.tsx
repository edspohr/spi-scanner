import React, { useState } from 'react';
import { signInWithGoogle } from '../services/authService';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onLoginSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4">

      {/* Card central */}
      <div className="w-full max-w-sm bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6">

        {/* Logo SPI */}
        <div className="flex flex-col items-center gap-3">
          <img
            src="/spi-logo-white.png"
            alt="SPI Américas"
            className="h-12 w-auto object-contain"
          />
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest font-bold text-sky-400 mt-1">
              Regulatory Radar
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Vigilancia Regulatoria &amp; PI — LatAm
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10" />

        {/* Info de acceso restringido */}
        <div className="flex items-start gap-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-3 w-full">
          <Shield className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
          <p className="text-xs text-sky-300 leading-relaxed">
            Acceso restringido a cuentas <span className="font-bold text-sky-200">@spiamericas.com</span>.
            Inicia sesión con tu cuenta de Google corporativa.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 w-full">
            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
          </div>
        )}

        {/* Botón Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          ) : (
            /* Google SVG icon */
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.9 13.3l7.8 6C12.4 13 17.8 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
              <path fill="#FBBC05" d="M10.7 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l8.2-6z"/>
              <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.5l-7.5-5.8c-2.1 1.4-4.7 2.3-7.8 2.3-6.2 0-11.5-4.2-13.4-9.9l-8.2 6C6.7 42.6 14.7 48 24 48z"/>
            </svg>
          )}
          <span>{loading ? 'Verificando...' : 'Continuar con Google'}</span>
        </button>

      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-slate-500 text-center">
        © {new Date().getFullYear()} SPI Américas · Uso interno corporativo
      </p>
    </div>
  );
};
