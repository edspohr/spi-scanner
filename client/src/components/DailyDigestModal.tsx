import React, { useState, useEffect } from 'react';
import { DailyDigest } from '../types';
import { X, Copy, Check, Download, Sparkles, ShieldCheck } from 'lucide-react';
import { CountryBadge } from './CountryBadge';

interface DailyDigestModalProps {
  isOpen: boolean;
  digest: DailyDigest | null;
  onClose: () => void;
}

export const DailyDigestModal: React.FC<DailyDigestModalProps> = ({ isOpen, digest, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Si no está abierto o no hay datos, no renderizar
  if (!isOpen) return null;
  if (!digest) return <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4" onClick={onClose}>
    <div role="dialog" aria-modal="true" className="bg-white rounded-2xl p-8 max-w-md" onClick={e => e.stopPropagation()}>
      <h3 className="font-bold mb-3">Reporte diario no disponible</h3>
      <p className="text-sm text-slate-600 mb-4">Ejecuta un escaneo de fuentes oficiales para generar el primer reporte con resultados reales.</p>
      <button onClick={onClose} className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm">Cerrar</button>
    </div>
  </div>;

  const handleCopy = () => {
    navigator.clipboard.writeText(digest.executiveBriefingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([digest.executiveBriefingText], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `SPI_Boletin_Regulatorio_${digest.digestDate}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con Logo Blanco SPI */}
        <div className="p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/spi-logo-white.png" 
              alt="SPI Américas" 
              className="h-8 w-auto object-contain flex-shrink-0" 
            />
            <div className="border-l border-slate-700 pl-3.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Reporte Diario Ejecutivo de Novedades
                </h3>
                <span className="text-xs bg-sky-500/30 text-sky-300 font-semibold px-2 py-0.5 rounded border border-sky-400/30">
                  {digest.digestDate}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Filtro de alta relevancia (Solo críticas & oportunidades comerciales para SPI)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors flex-shrink-0"
            title="Cerrar (Esc)"
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Estatus General del Día */}
          {digest.hasCriticalUpdates ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    Se detectaron {digest.relevantCount} novedades de impacto prioritario
                  </p>
                  <p className="text-xs text-amber-700">
                    {digest.criticalCount} de urgencia crítica (&lt;30 días) y {digest.highCount} de urgencia alta.
                  </p>
                </div>
              </div>
              <span className="text-xs bg-rose-600 text-white font-bold px-2.5 py-1 rounded-full animate-pulse">
                Acción Requerida
              </span>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Sin hallazgos críticos en el reporte
                </p>
                <p className="text-xs text-emerald-700">
                  No hay hallazgos críticos o de urgencia alta en las oportunidades incluidas en este reporte. Revisa el detalle de cobertura del escaneo.
                </p>
              </div>
            </div>
          )}

          {/* Texto Ejecutivo para el Equipo / Clientes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Texto del Briefing Ejecutivo (Listo para envío)
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar .MD</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
              {digest.executiveBriefingText}
            </pre>
          </div>

          {/* Listado Resumido de Novedades del Reporte */}
          {digest.opportunities.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Fichas Clave del Reporte Diario
              </h4>
              <div className="space-y-2.5">
                {digest.opportunities.map((opp) => (
                  <div key={opp.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CountryBadge country={opp.country} />
                        <span className="font-semibold text-slate-700">{opp.entityName}</span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        {opp.urgency.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900">{opp.title}</p>
                    <p className="text-slate-600 leading-relaxed">{opp.executiveSummary}</p>
                    <p className="text-slate-700 font-semibold pt-1">
                      👉 <strong>Acción Requerida:</strong> {opp.actionNeeded}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
