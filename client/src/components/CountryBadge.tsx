import React from 'react';
import { CountryCode } from '../types';

interface CountryBadgeProps {
  country: CountryCode;
  showName?: boolean;
  className?: string;
  muted?: boolean;
}

const COUNTRY_METADATA: Record<CountryCode, { name: string; flag: string; bg: string; text: string }> = {
  CO: { name: 'Colombia', flag: '🇨🇴', bg: 'bg-yellow-50 border-yellow-200', text: 'text-amber-900' },
  MX: { name: 'México', flag: '🇲🇽', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-900' },
  BR: { name: 'Brasil', flag: '🇧🇷', bg: 'bg-green-50 border-green-200', text: 'text-green-900' },
  AR: { name: 'Argentina', flag: '🇦🇷', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-900' },
  CL: { name: 'Chile', flag: '🇨🇱', bg: 'bg-red-50 border-red-200', text: 'text-red-900' },
  PE: { name: 'Perú', flag: '🇵🇪', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-900' }
};

export const CountryBadge: React.FC<CountryBadgeProps> = ({ country, showName = true, className = '', muted = false }) => {
  const meta = COUNTRY_METADATA[country] || { name: country, flag: '🌐', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-800' };

  return (
    <span className={`inline-flex items-center gap-1 ${muted ? 'text-[10px] text-slate-400' : `px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.bg} ${meta.text}`} ${className}`}>
      <span className={muted ? "text-xs leading-none" : "text-sm leading-none"}>{meta.flag}</span>
      {showName && <span>{meta.name}</span>}
    </span>
  );
};
