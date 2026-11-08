import React from 'react';
import { RegulatoryOpportunity } from '../types';
import { TrendingUp, AlertTriangle, Briefcase, CheckCircle2 } from 'lucide-react';

interface MetricCardsProps {
  opportunities: RegulatoryOpportunity[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ opportunities }) => {
  const total = opportunities.length;
  const commercialCount = opportunities.filter(o => o.opportunityType === 'commercial_opportunity').length;
  const criticalCount = opportunities.filter(o => o.urgency === 'critical').length;
  const assignedCount = opportunities.filter(o => o.status === 'asignada' || o.status === 'contactando_clientes').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Oportunidades */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Oportunidades Totales</p>
          <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500 font-medium">en radar LatAm</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">Fuentes sanitarias y de PI monitoreadas</p>
      </div>

      {/* Oportunidades Comerciales */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Venta de Servicios</p>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">{commercialCount}</span>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {Math.round((commercialCount / (total || 1)) * 100)}% del total
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">Adecuaciones, fast-track y blindaje marcario</p>
      </div>

      {/* Alertas Críticas */}
      <div className="bg-white rounded-xl p-5 border border-rose-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Atención Crítica (&lt;30d)</p>
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-rose-600">{criticalCount}</span>
          <span className="text-xs text-slate-500 font-medium">plazos perentorios</span>
        </div>
        <p className="mt-2 text-xs text-rose-700/80 font-medium">Riesgo de bloqueo o vencimiento legal</p>
      </div>

      {/* En Gestión por SPI */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">En Gestión por SPI</p>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">{assignedCount}</span>
          <span className="text-xs text-slate-500 font-medium">asignadas al equipo</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">Contactando clientes o preparando ofertas</p>
      </div>
    </div>
  );
};
