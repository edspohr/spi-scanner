import React, { useState } from 'react';
import { CountryCode, RegulatoryOpportunity, RegulatorySector } from '../types';
import { RefreshCw, Play, Sparkles, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';

interface ScannerSimulatorProps {
  onScanCompleted: (newOpps: RegulatoryOpportunity[]) => void;
}

export const ScannerSimulator: React.FC<ScannerSimulatorProps> = ({ onScanCompleted }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | 'ALL'>('ALL');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [isCustomAnalyzing, setIsCustomAnalyzing] = useState(false);

  // Muestra de simulación de escaneo oficial
  const handleTriggerOfficialScan = () => {
    setIsScanning(true);
    setStatusMessage('Conectando con fuentes oficiales: INVIMA, COFEPRIS, ANVISA, ANMAT, ISP, DIGEMID...');

    setTimeout(() => {
      setStatusMessage('Consultando gacetas de propiedad industrial (SIC, IMPI, INPI)...');
    }, 1200);

    setTimeout(() => {
      setStatusMessage('Filtrando actos de rutina con Gemini en Vertex AI y extrayendo oportunidades...');
    }, 2400);

    setTimeout(() => {
      setIsScanning(false);
      setStatusMessage('¡Escaneo completado! Todas las fuentes sincronizadas.');
      // Simula refresco exitoso
    }, 3600);
  };

  // Analizar resolución de prueba con Gemini
  const handleAnalyzeCustomDocument = () => {
    if (!customText.trim()) return;

    setIsCustomAnalyzing(true);
    setTimeout(() => {
      const simulatedNewOpp: RegulatoryOpportunity = {
        id: `opp-custom-${Date.now()}`,
        documentId: `doc-vertex-${Math.floor(Math.random() * 1000)}`,
        title: 'Resolución de Emergencia: Actualización de Requisitos para Importación de Reactivos de Diagnóstico In Vitro',
        country: selectedCountry === 'ALL' ? 'CO' : selectedCountry,
        entityName: selectedCountry === 'MX' ? 'COFEPRIS' : selectedCountry === 'BR' ? 'ANVISA' : 'INVIMA',
        sectors: ['medical_devices', 'pharma'],
        sourceUrl: 'https://portal.oficial.gov/normatividad/2026/res-nueva',
        publicationDate: new Date().toISOString().split('T')[0],
        documentNumber: 'Resolución 2026-NUEVA',
        isRelevant: true,
        opportunityType: 'commercial_opportunity',
        urgency: 'critical',
        executiveSummary: 'Se aprobó la exigencia de presentación de certificado de calibración metrológica y dossier de estabilidad en tiempo real para todos los reactivos de diagnóstico in vitro clase III. Otorga plazo de 60 días antes de exigir bloqueo en aduanas.',
        detailedAnalysis: 'La autoridad sanitaria intensifica el control aduanero y de lote. Los distribuidores que no cuenten con las pruebas técnicas actualizadas no podrán liberar los despachos.',
        effectiveDate: new Date().toISOString().split('T')[0],
        transitionalDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daysRemainingForAction: 60,
        spiActionPlan: {
          whatClientsNeedToDo: 'Contactar al fabricante en origen para recopilar los protocolos de estabilidad y emitir declaración de conformidad traducida.',
          howSpiCanHelp: 'SPI ofrece el servicio de "Validación Técnica Acelerada de Expediente IVD": revisión documental, radicación de alcance y gestión de visto bueno aduanero.',
          affectedClientProfile: 'Laboratorios de diagnóstico clínico e importadores de kits de pruebas rápidas.',
          recommendedServiceOffering: 'Acompañamiento Técnico & Homologación de Reactivos IVD'
        },
        citations: [
          {
            articleOrSection: 'Artículo 3 - Ensayos de Estabilidad',
            quoteText: 'Será obligatorio acompañar la solicitud con estudios de estabilidad realizados bajo condiciones de Zona Climática IVB.',
            interpretation: 'Excluye estudios realizados bajo temperaturas de países fríos sin estrés térmico.'
          }
        ],
        status: 'nueva',
        lastUpdated: new Date().toISOString()
      };

      onScanCompleted([simulatedNewOpp]);
      setIsCustomAnalyzing(false);
      setCustomText('');
      alert('¡Nueva oportunidad identificada por Vertex AI Gemini agregada al Radar con éxito!');
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            Motor de Escaneo Regulatorio & IA (Vertex AI Gemini)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Ejecuta la vigilancia automatizada en las fuentes oficiales o analiza un acto normativo específico bajo demanda.
          </p>
        </div>

        {/* Botón Disparar Escaneo Oficial */}
        <button
          onClick={handleTriggerOfficialScan}
          disabled={isScanning}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
            isScanning
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Escaneando LatAm...' : 'Escanear Fuentes Oficiales Ahora'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs font-semibold text-sky-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-sky-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Caja de Análisis Directo de Documento con Gemini */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-slate-500" /> Probar Análisis con Gemini (Pega el extracto de una circular o gaceta):
          </span>
          <button
            onClick={() => {
              setCustomText('MINSALUD EXPIDE CIRCULAR 032-2026: Todos los titulares de registros sanitarios de medicamentos biológicos y biocomparables deberán actualizar sus planes de gestión de riesgo (PGR) dentro de los siguientes sesenta días calendario a la publicación de la presente. Aquellas empresas que no presenten el informe periódico de seguridad actualizado verán suspendida la comercialización.');
            }}
            className="text-[11px] text-sky-600 font-semibold hover:underline"
          >
            Cargar ejemplo de prueba
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Pega aquí el texto de un decreto, resolución de INVIMA, acuerdo de COFEPRIS o edicto marcario..."
            rows={2}
            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            onClick={handleAnalyzeCustomDocument}
            disabled={!customText.trim() || isCustomAnalyzing}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all sm:self-stretch ${
              !customText.trim() || isCustomAnalyzing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isCustomAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Evaluar con Gemini</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
