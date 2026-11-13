import React, { useState } from 'react';
import { signInWithGoogle, signInWithPassword, resetPassword, resendVerification, authErrorMessage } from '../services/authService';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      await signInWithGoogle();
      onLoginSuccess();
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAction = async (action: 'login' | 'reset' | 'verify') => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      if (action === 'reset') {
        await resetPassword(email);
        setNotice('Si existe una cuenta para este correo, recibirás instrucciones para establecer tu contraseña. Revisa también spam.');
      } else if (action === 'verify') {
        await resendVerification(email, password);
        setNotice('Si el correo estaba pendiente de verificación, enviamos un enlace. Revisa tu bandeja y luego vuelve a ingresar.');
      } else {
        await signInWithPassword(email, password);
        onLoginSuccess();
      }
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4 py-8">

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
            Acceso restringido a cuentas <span className="font-bold text-sky-200">@spiamericas.com</span> y <span className="font-bold text-sky-200">@spohr.cl</span>.
            Ingresa con Google o con tu correo y contraseña.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 w-full">
            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
          </div>
        )}

        {notice && <p role="status" className="text-xs text-emerald-300 leading-relaxed">{notice}</p>}

        <form className="w-full flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); void handleEmailAction('login'); }}>
          <label htmlFor="email" className="text-xs text-slate-200">Correo electrónico</label>
          <input id="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading}
            placeholder="nombre@spiamericas.com" className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-slate-500" />
          <label htmlFor="password" className="text-xs text-slate-200">Contraseña</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading}
            className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white" />
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? 'Procesando...' : 'Ingresar con contraseña'}
          </button>
          <div className="flex justify-between gap-3 text-xs text-sky-300">
            <button type="button" disabled={loading || !email.trim()} onClick={() => void handleEmailAction('reset')} className="hover:underline disabled:opacity-50">Olvidé mi contraseña</button>
            <button type="button" disabled={loading || !email.trim() || !password} onClick={() => void handleEmailAction('verify')} className="hover:underline disabled:opacity-50">Enviar verificación</button>
          </div>
        </form>

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
