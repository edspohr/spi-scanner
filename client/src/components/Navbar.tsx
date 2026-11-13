import React from 'react';
import { Mail, Globe, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';
import { signOut } from '../services/authService';

interface NavbarProps {
  onOpenDigest: () => void;
  hasCriticalUpdates: boolean;
  totalOpportunities: number;
  user: User;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDigest,
  hasCriticalUpdates,
  user,
}) => {
  const handleSignOut = async () => {
    if (window.confirm('¿Cerrar sesión?')) {
      await signOut();
    }
  };

  const displayName = user.displayName ?? user.email ?? 'Usuario SPI';
  const photoURL = user.photoURL;
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Branding Oficial SPI Américas con Logo Blanco */}
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-3.5 group">
            <img
              src="/spi-logo-white.png"
              alt="SPI Américas"
              className="h-8 sm:h-9 w-auto object-contain hover:opacity-90 transition-opacity"
            />
            <div className="border-l border-slate-700/80 pl-3.5">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-sm sm:text-base">
                  AMÉRICAS
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Regulatory Radar
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block leading-tight">
                Vigilancia Regulatoria &amp; Propiedad Intelectual LatAm
              </p>
            </div>
          </a>
        </div>

        {/* Estatus & Acciones */}
        <div className="flex items-center gap-3">

          {/* Indicador de Cobertura */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>CO • MX • BR • AR • CL • PE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>

          {/* Botón Ver Reporte Diario */}
          <button
            onClick={onOpenDigest}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-sky-900/40 transition-all relative"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Reporte general</span>
            {hasCriticalUpdates && (
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 absolute -top-1 -right-1" />
            )}
          </button>

          {/* Avatar + Logout */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-700/60">
            {/* Avatar */}
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border-2 border-slate-700 shadow"
                title={displayName}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-bold border-2 border-slate-700 shadow"
                title={displayName}
              >
                {initials}
              </div>
            )}

            {/* Nombre corto (solo desktop) */}
            <div className="hidden lg:block text-right">
              <p className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
                {user.displayName?.split(' ')[0] ?? 'Usuario'}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
                {user.email}
              </p>
            </div>

            {/* Botón logout */}
            <button
              onClick={handleSignOut}
              title="Cerrar sesión"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
