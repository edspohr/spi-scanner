import React, { useState, useEffect, useMemo } from 'react';
import { 
  RegulatoryOpportunity, 
  CountryCode, 
  RegulatorySector, 
  OpportunityType, 
  UrgencyLevel, 
  OpportunityStatus, 
  SpiTeamMember, 
  DailyDigest 
} from './types';
import { 
  INITIAL_OPPORTUNITIES, 
  INITIAL_SPI_TEAM, 
  INITIAL_DAILY_DIGEST 
} from './mock/initialData';
import { 
  subscribeToOpportunities, 
  subscribeToLatestDigest, 
  updateOpportunityInFirestore 
} from './services/firestoreService';
import { Navbar } from './components/Navbar';
import { MetricCards } from './components/MetricCards';
import { FilterBar } from './components/FilterBar';
import { OpportunityCard } from './components/OpportunityCard';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { AssignmentModal } from './components/AssignmentModal';
import { DailyDigestModal } from './components/DailyDigestModal';
import { ScannerSimulator } from './components/ScannerSimulator';
import { SlidersHorizontal, Cloud } from 'lucide-react';

export function App() {
  const [opportunities, setOpportunities] = useState<RegulatoryOpportunity[]>(INITIAL_OPPORTUNITIES);
  const [teamMembers] = useState<SpiTeamMember[]>(INITIAL_SPI_TEAM);
  const [dailyDigest, setDailyDigest] = useState<DailyDigest>(INITIAL_DAILY_DIGEST);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Estados de Modales (ambos inician en null/false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<RegulatoryOpportunity | null>(null);
  const [opportunityToAssign, setOpportunityToAssign] = useState<RegulatoryOpportunity | null>(null);
  const [isDigestOpen, setIsDigestOpen] = useState(false);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | 'ALL'>('ALL');
  const [selectedSector, setSelectedSector] = useState<RegulatorySector | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<OpportunityType | 'ALL'>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel | 'ALL'>('ALL');

  // Conexión en tiempo real a Cloud Firestore
  useEffect(() => {
    const unsubOpps = subscribeToOpportunities((liveOpps) => {
      if (liveOpps && liveOpps.length > 0) {
        setOpportunities(liveOpps);
        setIsLiveConnected(true);
      }
    });

    const unsubDigest = subscribeToLatestDigest((liveDigest) => {
      if (liveDigest) {
        setDailyDigest(liveDigest);
      }
    });

    return () => {
      unsubOpps();
      unsubDigest();
    };
  }, []);

  // Asignar oportunidad o cambiar estado (guarda en Firestore y actualiza localmente)
  const handleSaveAssignment = async (
    opportunityId: string,
    member: SpiTeamMember | null,
    status: OpportunityStatus,
    note?: string
  ) => {
    // Actualizar en Cloud Firestore
    await updateOpportunityInFirestore(opportunityId, member, status, note);

    // Actualización optimista local
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== opportunityId) return opp;

        const newNotes = [...(opp.managementNotes || [])];
        if (note) {
          newNotes.push({
            author: member?.name || 'Equipo SPI',
            date: new Date().toISOString(),
            comment: note
          });
        }

        return {
          ...opp,
          status,
          assignedTo: member ? {
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role
          } : undefined,
          assignedAt: member ? new Date().toISOString() : opp.assignedAt,
          lastUpdated: new Date().toISOString(),
          managementNotes: newNotes
        };
      })
    );
  };

  // Agregar nuevas oportunidades detectadas por el escáner
  const handleScanCompleted = (newOpps: RegulatoryOpportunity[]) => {
    setOpportunities((prev) => [...newOpps, ...prev]);
  };

  // Reset de Filtros
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('ALL');
    setSelectedSector('ALL');
    setSelectedType('ALL');
    setSelectedUrgency('ALL');
  };

  // Filtrado reactivo de oportunidades
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(query);
        const matchesEntity = opp.entityName.toLowerCase().includes(query);
        const matchesSummary = opp.executiveSummary.toLowerCase().includes(query);
        const matchesDocNumber = opp.documentNumber?.toLowerCase().includes(query) || false;
        const matchesClient = opp.spiActionPlan.affectedClientProfile.toLowerCase().includes(query);

        if (!matchesTitle && !matchesEntity && !matchesSummary && !matchesDocNumber && !matchesClient) {
          return false;
        }
      }

      if (selectedCountry !== 'ALL' && opp.country !== selectedCountry) {
        return false;
      }

      if (selectedSector !== 'ALL' && !opp.sectors.includes(selectedSector)) {
        return false;
      }

      if (selectedType !== 'ALL' && opp.opportunityType !== selectedType) {
        return false;
      }

      if (selectedUrgency !== 'ALL' && opp.urgency !== selectedUrgency) {
        return false;
      }

      return true;
    });
  }, [opportunities, searchQuery, selectedCountry, selectedSector, selectedType, selectedUrgency]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-16">
      {/* Navbar Superior */}
      <Navbar
        onOpenDigest={() => setIsDigestOpen(true)}
        hasCriticalUpdates={dailyDigest.hasCriticalUpdates}
        totalOpportunities={opportunities.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Cabecera Principal */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                LatAm Regulatory & IP Intelligence
              </span>
              {isLiveConnected && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Firestore Live
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Radar de Oportunidades & Cumplimiento Normativo
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Monitoreo activo de actos administrativos en Colombia, México, Brasil, Argentina, Chile y Perú para SPI Américas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDigestOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 shadow-sm"
            >
              <span>Ver Digest Diario</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Métricas KPI */}
        <MetricCards opportunities={opportunities} />

        {/* Motor de Escaneo & Análisis con Gemini (Colapsable) */}
        <ScannerSimulator onScanCompleted={handleScanCompleted} />

        {/* Barra de Filtros */}
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedSector={selectedSector}
          setSelectedSector={setSelectedSector}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedUrgency={selectedUrgency}
          setSelectedUrgency={setSelectedUrgency}
          onResetFilters={handleResetFilters}
        />

        {/* Contador de Resultados */}
        <div className="flex items-center justify-between mb-4 text-xs text-slate-500 font-medium px-1">
          <span>Mostrando <strong>{filteredOpportunities.length}</strong> de {opportunities.length} oportunidades identificadas</span>
          <span className="text-[11px] text-slate-400">Actualizado automáticamente en tiempo real con Cloud Firestore</span>
        </div>

        {/* Feed de Oportunidades */}
        {filteredOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onSelect={(opp) => setSelectedOpportunity(opp)}
                onAssign={(opp) => setOpportunityToAssign(opp)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No hay oportunidades que coincidan con estos filtros</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Prueba cambiando el país, el sector o la búsqueda para ver otros hallazgos regulatorios en el radar.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </main>

      {/* Modal de Detalle Completo con Citas Legales */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        onAssign={(opp) => setOpportunityToAssign(opp)}
      />

      {/* Modal de Asignación y Gestión SPI */}
      <AssignmentModal
        opportunity={opportunityToAssign}
        teamMembers={teamMembers}
        onClose={() => setOpportunityToAssign(null)}
        onSave={handleSaveAssignment}
      />

      {/* Modal de Reporte Ejecutivo Diario */}
      <DailyDigestModal
        digest={dailyDigest}
        onClose={() => setIsDigestOpen(false)}
      />
    </div>
  );
}

export default App;
