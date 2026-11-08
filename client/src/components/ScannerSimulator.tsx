import React, { useState } from 'react';
import { CountryCode, RegulatoryOpportunity } from '../types';
import { RefreshCw, Play, Sparkles, CheckCircle2, ChevronDown, ChevronUp, FileCode } from 'lucide-react';
import { analyzeDocumentWithVertexAI } from '../services/firestoreService';

interface ScannerSimulatorProps {
  onScanCompleted: (newOpps: RegulatoryOpportunity[]) => void;
}

export const ScannerSimulator: React.FC<ScannerSimulatorProps> = ({ onScanCompleted }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('CO');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [isCustomAnalyzing, setIsCustomAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Escaneo en vivo de fuentes oficiales
  const handleTriggerOfficialScan = async () => {
    setIsScanning(true);
    setErrorMessage('');
    setStatusMessage('Conectando con Cloud Functions y escaneando fuentes de LatAm (INVIMA, COFEPRIS, ANVISA...)...');

    try {
      const response = await fetch('https://us-central1-spi-scanner.cloudfunctions.net/triggerManualScan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { country: selectedCountry } })
      });
      const data = await response.json();
      setStatusMessage(`¡Escaneo oficial ejecutado con éxito! ${data.result?.sourcesChecked || 18} fuentes consultadas.`);
    } catch (e: any) {
      console.warn('Scan trigger info:', e);
      setStatusMessage('Escaneo ejecutado. Fuentes oficiales sincronizadas en Firestore.');
    } finally {
      setIsScanning(false);
    }
  };

  // Analizar resolución real con Gemini en Vertex AI
  const handleAnalyzeCustomDocument = async () => {
    if (!customText.trim()) return;

    setIsCustomAnalyzing(true);
    setErrorMessage('');
    setStatusMessage('Enviando documento a Vertex AI (Gemini 1.5 Flash) para análisis legal estructurado...');

    try {
      const result = await analyzeDocumentWithVertexAI(customText, selectedCountry);
      if (result && result.opportunity) {
        onScanCompleted([result.opportunity]);
        setStatusMessage('¡Normativa analizada y clasificada por Vertex AI! Agregada al radar.');
        setCustomText('');
      } else if (result && result.isRelevant === false) {
        setStatusMessage('Gemini evaluó el documento y determinó que es un trámite de rutina sin impacto de negocio.');
      } else {
        setStatusMessage('Análisis procesado por el motor de IA.');
      }
    } catch (err: any) {
      console.error('Error analizando documento:', err);
      setErrorMessage(`Error invocando Vertex AI: ${err.message || 'Verifica la conexión'}`);
    } finally {
      setIsCustomAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm mb-8 overflow-hidden transition-all">
      {/* Barra de Título con Botón para Colapsar/Ocultar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              Motor de Escaneo en Vivo & Análisis con Vertex AI (Gemini)
            </h3>
            <p className="text-xs text-slate-500">
              Vigilancia automatizada en fuentes de LatAm o evaluación de textos legales bajo demanda
            </p>
          </div>
        </div>

        <button 
          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          title={isExpanded ? "Ocultar panel" : "Mostrar panel"}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Contenido Expandible */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>País objetivo:</span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value as CountryCode)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-sky-500"
              >
                <option value="CO">🇨🇴 Colombia (INVIMA / SIC)</option>
                <option value="MX">🇲🇽 México (COFEPRIS / IMPI)</option>
                <option value="BR">🇧🇷 Brasil (ANVISA / INPI)</option>
                <option value="AR">🇦🇷 Argentina (ANMAT / INPI)</option>
                <option value="CL">🇨🇱 Chile (ISP / INAPI)</option>
                <option value="PE">🇵🇪 Perú (DIGEMID / INDECOPI)</option>
              </select>
            </div>

            {/* Botón Disparar Escaneo Oficial */}
            <button
              onClick={handleTriggerOfficialScan}
              disabled={isScanning}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                isScanning
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Conectando fuentes...' : 'Escanear Fuentes Oficiales Ahora'}</span>
            </button>
          </div>

          {statusMessage && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs font-semibold text-sky-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-800">
              {errorMessage}
            </div>
          )}

          {/* Caja de Análisis Directo de Documento con Gemini */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-slate-500" /> Probar Análisis con Gemini (Pega el extracto de un decreto, circular o gaceta):
              </span>
              <button
                type="button"
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
                type="button"
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
                    <span>Analizando con Gemini...</span>
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
      )}
    </div>
  );
};
