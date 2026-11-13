import React, { useState, useEffect } from 'react';
import { CountryCode } from '../types';
import { RefreshCw, Play, Sparkles, CheckCircle2, ChevronDown, ChevronUp, FileCode } from 'lucide-react';
import { analyzeDocumentWithVertexAI, triggerOfficialScan, subscribeToLatestScan, ScanRun } from '../services/firestoreService';

export const OfficialScanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('CO');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [publicationDate, setPublicationDate] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [customText, setCustomText] = useState<string>('');
  const [isCustomAnalyzing, setIsCustomAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [lastRun, setLastRun] = useState<ScanRun | null>(null);
  useEffect(() => subscribeToLatestScan(setLastRun, () => setErrorMessage('No se pudo consultar el estado del último escaneo.')), []);

  // Escaneo en vivo de fuentes oficiales
  const handleTriggerOfficialScan = async () => {
    setIsScanning(true);
    setErrorMessage('');
    setStatusMessage('Conectando con Cloud Functions y escaneando fuentes de LatAm (INVIMA, COFEPRIS, ANVISA...)...');

    try {
      const result = await triggerOfficialScan(selectedCountry);
      setStatusMessage(`${result.sourcesSucceeded}/${result.sourcesAttempted} fuentes consultadas; ${result.documentsFound} documentos encontrados, ${result.documentsAnalyzed} analizados, ${result.documentsSkipped} ya procesados y ${result.opportunitiesFound} oportunidades nuevas.`);
      if (result.errors.length) setErrorMessage('Consulta incompleta: ' + result.errors.map(e => `${e.sourceId}: ${e.error}`).join(' · '));
    } catch (error: unknown) {
      setStatusMessage('');
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo ejecutar el escaneo.');
    } finally {
      setIsScanning(false);
    }
  };

  // Analizar resolución real con Gemini en Vertex AI
  const handleAnalyzeCustomDocument = async () => {
    if (!customText.trim()) return;

    setIsCustomAnalyzing(true);
    setErrorMessage('');
    setStatusMessage('Enviando documento a Vertex AI (Gemini) para análisis legal estructurado...');

    try {
      const result = await analyzeDocumentWithVertexAI(customText, selectedCountry, sourceUrl, publicationDate);
      if (result && result.opportunity) {
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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm mb-4 overflow-hidden transition-all">
      {/* Barra de Título con Botón para Colapsar/Ocultar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Escaneo y análisis de fuentes
            </h3>
            <p className="text-xs text-slate-500">
              Consulta fuentes para ambas áreas o analiza un documento oficial.
            </p>
          </div>
        </div>

        <button 
          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          aria-expanded={isExpanded}
          aria-controls="scanner-panel"
          aria-label={isExpanded ? "Ocultar escaneo y análisis" : "Mostrar escaneo y análisis"}
          title={isExpanded ? "Ocultar panel" : "Mostrar panel"}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Contenido Expandible */}
      {isExpanded && (
        <div id="scanner-panel" className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>País objetivo:</span>
              <select
                disabled={isScanning || isCustomAnalyzing}
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
              disabled={isScanning || isCustomAnalyzing}
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

          {lastRun && <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1">
            <p className="font-semibold">Último escaneo: {lastRun.country} · {new Date(lastRun.startedAt).toLocaleString()} · {{running: 'En curso', completed: 'Completado', partial: 'Consulta incompleta', failed: 'Falló'}[lastRun.status]}</p>
            {lastRun.status !== 'running' && <p>{lastRun.sourcesSucceeded ?? 0}/{lastRun.sourcesAttempted ?? 0} fuentes consultadas · {lastRun.documentsAnalyzed ?? 0} documentos analizados · {lastRun.opportunitiesFound ?? 0} oportunidades nuevas</p>}
            {!!lastRun.errors?.length && <details><summary className="cursor-pointer text-amber-800">Ver fuentes o análisis con error ({lastRun.errors.length})</summary><ul className="mt-2 space-y-1">{lastRun.errors.map((error, index) => <li key={index}>{error.sourceId}: {error.error}</li>)}</ul></details>}
          </div>}

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
                <FileCode className="w-4 h-4 text-slate-500" /> Analizar documento oficial (pega su texto y enlace de origen):
              </span>

            </div>

            <label className="block text-xs font-semibold text-slate-600">Enlace del documento oficial
              <input type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-xs" />
            </label>
            <label className="block text-xs font-semibold text-slate-600">Fecha de publicación del documento
              <input type="date" value={publicationDate} onChange={e => setPublicationDate(e.target.value)} className="ml-2 rounded-lg border border-slate-300 p-2 text-xs" />
            </label>
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
                disabled={!customText.trim() || !sourceUrl.trim() || !publicationDate || isCustomAnalyzing || isScanning}
                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all sm:self-stretch ${
                  !customText.trim() || !sourceUrl.trim() || !publicationDate || isCustomAnalyzing || isScanning
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
