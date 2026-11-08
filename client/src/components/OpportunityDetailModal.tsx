import React from 'react';
import { RegulatoryOpportunity } from '../types';
import { CountryBadge } from './CountryBadge';
import { X, ExternalLink, Calendar, Clock, Sparkles, ShieldAlert, Quote, UserCheck, CheckCircle, FileText, Send } from 'lucide-react';

interface OpportunityDetailModalProps {
  opportunity: RegulatoryOpportunity | null;
  onClose: () => void;
  onAssign: (opportunity: RegulatoryOpportunity) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  onAssign
}) => {
  if (!opportunity) return null;

  const isCommercial = opportunity.opportunityType === 'commercial_opportunity';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CountryBadge country={opportunity.country} />
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                {opportunity.entityName}
              </span>
              {opportunity.documentNumber && (
                <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                  {opportunity.documentNumber}
                </span>
              )}
              {isCommercial ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5" /> Oportunidad Comercial SPI
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  <ShieldAlert className="w-3.5 h-3.5" /> Cumplimiento Mandatorio
                </span>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              {opportunity.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Panel de Fechas y Cronología */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Publicación Oficial</p>
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{opportunity.publicationDate}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Entrada en Vigor</p>
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Clock className="w-4 h-4 text-sky-500" />
                <span>{opportunity.effectiveDate || 'Inmediata'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Plazo Límite de Transición</p>
              <div className="flex items-center gap-1.5 font-bold text-rose-600">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>{opportunity.transitionalDeadline || 'No fijado'}</span>
                {opportunity.daysRemainingForAction && (
                  <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-semibold">
                    {opportunity.daysRemainingForAction} días
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Resumen Ejecutivo */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-600" /> Resumen Ejecutivo del Hallazgo
            </h4>
            <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-100 text-slate-800 leading-relaxed font-medium">
              {opportunity.executiveSummary}
            </div>
          </div>

          {/* Análisis Detallado */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Análisis Técnico y Alcance
            </h4>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {opportunity.detailedAnalysis}
            </p>
          </div>

          {/* Plan de Acción Estratégico SPI */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h4 className="text-sm font-bold flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 text-amber-400" /> Estrategia de Negocio para SPI Américas
              </h4>
              {opportunity.spiActionPlan.recommendedServiceOffering && (
                <span className="text-xs bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-full">
                  {opportunity.spiActionPlan.recommendedServiceOffering}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-slate-300">Qué deben hacer los clientes:</p>
                <p className="text-slate-200 leading-relaxed bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                  {opportunity.spiActionPlan.whatClientsNeedToDo}
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-emerald-300">Propuesta de Servicio SPI (Cómo monetizar o blindar):</p>
                <p className="text-emerald-100 leading-relaxed bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/60">
                  {opportunity.spiActionPlan.howSpiCanHelp}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
              <span><strong>Perfil de clientes objetivo:</strong> {opportunity.spiActionPlan.affectedClientProfile}</span>
            </div>
          </div>

          {/* Citas Oficiales y Artículos Clave */}
          {opportunity.citations && opportunity.citations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Quote className="w-4 h-4 text-slate-500" /> Citas y Fundamento Legal de la Norma
              </h4>
              <div className="space-y-2">
                {opportunity.citations.map((cite, index) => (
                  <div key={index} className="p-3.5 bg-slate-50 rounded-lg border-l-4 border-slate-400 border border-slate-200 space-y-1.5">
                    <p className="text-xs font-bold text-slate-900">{cite.articleOrSection}</p>
                    <blockquote className="text-xs italic text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                      «{cite.quoteText}»
                    </blockquote>
                    <p className="text-xs text-slate-600 font-medium">
                      <span className="font-semibold text-sky-800">Interpretación SPI:</span> {cite.interpretation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial de Gestión & Asignado */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-sky-600" /> Consultor Asignado:
              </span>
              {opportunity.assignedTo ? (
                <span className="text-xs font-semibold text-slate-800">
                  {opportunity.assignedTo.name} ({opportunity.assignedTo.role})
                </span>
              ) : (
                <span className="text-xs font-semibold text-amber-700">Sin asignar</span>
              )}
            </div>

            {opportunity.managementNotes && opportunity.managementNotes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500">Bitácora interna de gestiones:</p>
                {opportunity.managementNotes.map((note, idx) => (
                  <div key={idx} className="text-xs bg-white p-2.5 rounded border border-slate-200">
                    <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">{note.author}</span>
                      <span>{new Date(note.date).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700">{note.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Modal con Acciones */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <a
            href={opportunity.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline"
          >
            <span>Ver Norma en Portal Oficial</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onAssign(opportunity);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              <span>Asignar a Consultor SPI</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
