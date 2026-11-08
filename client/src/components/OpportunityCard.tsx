import React from 'react';
import { RegulatoryOpportunity } from '../types';
import { CountryBadge } from './CountryBadge';
import { Clock, Calendar, ArrowRight, UserCheck, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: RegulatoryOpportunity;
  onSelect: (opportunity: RegulatoryOpportunity) => void;
  onAssign: (opportunity: RegulatoryOpportunity) => void;
}

const URGENCY_STYLES: Record<string, { label: string; badge: string; border: string; dot: string }> = {
  critical: {
    label: 'Crítica (< 30 días)',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    border: 'border-l-4 border-l-rose-500',
    dot: 'bg-rose-500'
  },
  high: {
    label: 'Alta (30 - 90 días)',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    border: 'border-l-4 border-l-amber-500',
    dot: 'bg-amber-500'
  },
  medium: {
    label: 'Media (90+ días)',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    border: 'border-l-4 border-l-blue-400',
    dot: 'bg-blue-400'
  },
  low: {
    label: 'Baja / Informativa',
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
    border: 'border-l-4 border-l-slate-300',
    dot: 'bg-slate-400'
  }
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  nueva: { label: 'Nueva', color: 'bg-emerald-100 text-emerald-800' },
  en_evaluacion: { label: 'En Evaluación', color: 'bg-amber-100 text-amber-800' },
  asignada: { label: 'Asignada', color: 'bg-sky-100 text-sky-800' },
  contactando_clientes: { label: 'Contactando Clientes', color: 'bg-purple-100 text-purple-800' },
  cerrada: { label: 'Cerrada', color: 'bg-slate-100 text-slate-700' }
};

const SECTOR_LABELS: Record<string, string> = {
  pharma: 'Farma',
  medical_devices: 'Dispositivos Médicos',
  food_beverages: 'Alimentos',
  cosmetics_hygiene: 'Cosméticos',
  supplements: 'Suplementos',
  intellectual_property: 'Propiedad Intelectual'
};

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onSelect,
  onAssign
}) => {
  const urgency = URGENCY_STYLES[opportunity.urgency] || URGENCY_STYLES.medium;
  const statusInfo = STATUS_CONFIG[opportunity.status] || STATUS_CONFIG.nueva;
  const isCommercial = opportunity.opportunityType === 'commercial_opportunity';

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all ${urgency.border} flex flex-col justify-between overflow-hidden group`}>
      <div className="p-5">
        {/* Encabezado: País, Entidad, Tipo de Oportunidad y Urgencia */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CountryBadge country={opportunity.country} />
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {opportunity.entityName}
            </span>
            {opportunity.documentNumber && (
              <span className="text-xs text-slate-500 font-mono">
                {opportunity.documentNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Badge Tipo: Oportunidad Comercial vs Cumplimiento */}
            {isCommercial ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Venta de Servicios
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" /> Cumplimiento Mandatorio
              </span>
            )}

            {/* Urgencia */}
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md border ${urgency.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
              {urgency.label}
            </span>
          </div>
        </div>

        {/* Título de la Normativa / Oportunidad */}
        <h3 
          onClick={() => onSelect(opportunity)}
          className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors cursor-pointer line-clamp-2 leading-snug"
        >
          {opportunity.title}
        </h3>

        {/* Resumen Ejecutivo */}
        <p className="mt-2.5 text-xs text-slate-600 line-clamp-3 leading-relaxed">
          {opportunity.executiveSummary}
        </p>

        {/* Caja de Acción Rápida para SPI */}
        <div className="mt-3.5 p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
          <div className="flex items-start gap-1.5">
            <span className="font-semibold text-slate-700 whitespace-nowrap">📋 Necesidad Cliente:</span>
            <span className="text-slate-600 line-clamp-1">{opportunity.spiActionPlan.whatClientsNeedToDo}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="font-semibold text-emerald-700 whitespace-nowrap">💼 Oportunidad SPI:</span>
            <span className="text-emerald-900 font-medium line-clamp-1">{opportunity.spiActionPlan.howSpiCanHelp}</span>
          </div>
        </div>

        {/* Sectores afectados */}
        <div className="mt-3 flex flex-wrap gap-1">
          {opportunity.sectors.map((s) => (
            <span key={s} className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
              {SECTOR_LABELS[s] || s}
            </span>
          ))}
        </div>
      </div>

      {/* Pie de Tarjeta: Fechas, Asignado y Botones de Acción */}
      <div className="bg-slate-50/70 border-t border-slate-100 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-slate-500">
          <div className="flex items-center gap-1" title="Fecha de publicación oficial">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{opportunity.publicationDate}</span>
          </div>

          {opportunity.transitionalDeadline && (
            <div className="flex items-center gap-1 text-rose-600 font-semibold" title="Fecha límite de transición">
              <Clock className="w-3.5 h-3.5" />
              <span>Plazo: {opportunity.transitionalDeadline}</span>
            </div>
          )}
        </div>

        {/* Responsable SPI y Botones */}
        <div className="flex items-center gap-2">
          {opportunity.assignedTo ? (
            <button
              onClick={() => onAssign(opportunity)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-sky-400 transition-colors"
              title="Reasignar o cambiar estatus"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-medium max-w-[120px] truncate">{opportunity.assignedTo.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onAssign(opportunity)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-medium hover:bg-amber-100 transition-colors"
            >
              <span>👤 Asignar a SPI</span>
            </button>
          )}

          <button
            onClick={() => onSelect(opportunity)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors shadow-sm"
          >
            <span>Ver Detalle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
