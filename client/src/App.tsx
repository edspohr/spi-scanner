import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
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
import { subscribeToOpportunities, subscribeToLatestDigest, subscribeToTeam, updateOpportunityInFirestore } from './services/firestoreService';
import { AuthGuard } from './components/AuthGuard';
import { Navbar } from './components/Navbar';
import { MetricCards } from './components/MetricCards';
import { FilterBar } from './components/FilterBar';
import { OpportunityBoard } from './components/OpportunityBoard';
import { AreaView, areaFromHash, areaHash, groupByPracticeArea } from './utils/opportunityAreas';
import { AREA_THEMES } from './utils/areaThemes';
import { OpportunityPriority, matchesPriority } from './utils/opportunityPriorities';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { AssignmentModal } from './components/AssignmentModal';
import { DailyDigestModal } from './components/DailyDigestModal';
import { SourcesPage } from './components/SourcesPage';
import { OfficialScanner } from './components/OfficialScanner';
import { LayoutGrid, ShieldCheck, Scale } from 'lucide-react';

// AppContent recibe el usuario autenticado desde AuthGuard
function AppContent({ user }: { user: User }) {
  const [view, setView] = useState(window.location.hash === '#fuentes' ? 'sources' : 'radar');
  const [area, setArea] = useState<AreaView>(()=>areaFromHash(window.location.hash));
  const [priority,setPriority] = useState<OpportunityPriority>('all');
  useEffect(() => {
    const onHashChange = () => {
      setView(window.location.hash === '#fuentes' ? 'sources' : 'radar');
      if (window.location.hash !== '#fuentes') setArea(areaFromHash(window.location.hash));
    };
    window.addEventListener('hashchange',onHashChange);
    return () => window.removeEventListener('hashchange',onHashChange);
  }, []);
  const [opportunities, setOpportunities] = useState<RegulatoryOpportunity[]>([]);
  const [teamMembers, setTeamMembers] = useState<SpiTeamMember[]>([]);
  const [dailyDigest, setDailyDigest] = useState<DailyDigest | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

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

  useEffect(() => {
    const reportError = (error: Error) => {
      console.error('Error consultando datos reales:', error);
      setDataError('No se pudieron cargar todos los datos. Revisa la conexión y los permisos de tu cuenta.');
    };
    const unsubOpps = subscribeToOpportunities((items) => {
      setOpportunities(items);
      setLoading(false);
      setIsLiveConnected(true);
    }, (error) => { setLoading(false); setIsLiveConnected(false); reportError(error); });
    const unsubTeam = subscribeToTeam(setTeamMembers, reportError);
    const unsubDigest = subscribeToLatestDigest(setDailyDigest, reportError);
    return () => { unsubOpps(); unsubTeam(); unsubDigest(); };
  }, []);

  const handleSaveAssignment = async (opportunityId: string, member: SpiTeamMember | null, status: OpportunityStatus, note?: string) => {
    await updateOpportunityInFirestore(opportunityId, member, status, note);
  };

  // Reset de Filtros
  const handleResetFilters = () => {
    setPriority('all');
    setSearchQuery('');
    setSelectedCountry('ALL');
    setSelectedSector('ALL');
    setSelectedType('ALL');
    setSelectedUrgency('ALL');
  };

  // Filtrado reactivo de oportunidades
  const matchingOpportunities = useMemo(() => {
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

  const areaGroups = useMemo(()=>groupByPracticeArea(matchingOpportunities),[matchingOpportunities]);
  const areaOpportunities = area === 'all' ? matchingOpportunities : areaGroups[area];
  const priorityOpportunities = matchingOpportunities.filter(opportunity=>matchesPriority(opportunity,priority));
  const grouped = groupByPracticeArea(priorityOpportunities);
  const visibleOpportunities = area === 'all' ? priorityOpportunities : grouped[area];
  const areaOptions = [
    {key:'all' as const,label:'Visión general',icon:LayoutGrid,count:priorityOpportunities.length},
    {key:'regulatory' as const,label:'Regulatorio',icon:ShieldCheck,count:grouped.regulatory.length},
    {key:'intellectual_property' as const,label:'Propiedad Intelectual',icon:Scale,count:grouped.intellectual_property.length}
  ];
  const changeArea = (next: AreaView) => {setArea(next);window.location.hash=areaHash(next);};

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900 pb-16">
      {/* Navbar Superior */}
      <Navbar
        onOpenDigest={() => setIsDigestOpen(true)}
        hasCriticalUpdates={dailyDigest?.hasCriticalUpdates ?? false}
        totalOpportunities={opportunities.length}
        user={user}
      />

      <nav aria-label="Vistas del radar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex gap-2">
        <a href={areaHash(area)} aria-current={view === 'radar' ? 'page' : undefined} className={`px-4 py-2 rounded-xl text-sm font-bold ${view === 'radar' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Radar</a>
        <a href="#fuentes" aria-current={view === 'sources' ? 'page' : undefined} className={`px-4 py-2 rounded-xl text-sm font-bold ${view === 'sources' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Fuentes de revisión</a>
      </nav>
      {view === 'sources' ? <SourcesPage /> : <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {/* Cabecera Principal */}
        <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                SPI · Inteligencia LatAm
              </span>
              {isLiveConnected && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-400 ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 " />
                  Actualización automática
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-[-0.025em]">
              Radar de oportunidades
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {area === 'all' ? 'Ambas áreas en una sola vista para dirección, con el trabajo de cada equipo separado.' : area === 'regulatory' ? 'Seguimiento del equipo regulatorio: registros, requisitos sanitarios y cumplimiento.' : 'Seguimiento del equipo de PI: marcas, patentes, diseños y activos intangibles.'}
            </p>
          </div>


        </div>

        {dataError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{dataError}</p>}
        {loading && <p role="status" className="mb-4 text-sm text-slate-500">Consultando oportunidades reales...</p>}
        {!dailyDigest && <p className="mb-4 text-xs text-slate-500">Aún no hay un reporte diario disponible. Se generará al completar un escaneo.</p>}
        <div aria-label="Elegir área de trabajo" className="flex flex-wrap gap-2 mb-5">
          {areaOptions.map(({key,label,icon:Icon,count})=>{
            const theme=key === 'all'?null:AREA_THEMES[key];
            return <button key={key} onClick={()=>changeArea(key)} aria-pressed={area === key} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${area === key ? `${theme?theme.button:'bg-slate-900 hover:bg-slate-800'} text-white shadow-sm` : `${theme?`${theme.soft} ${theme.muted}`:'bg-white text-slate-600'} hover:shadow-sm`}`}><Icon className="h-4 w-4" />{label}<span className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${area === key?'bg-white/15':'bg-white/70'}`}>{count}</span></button>;
          })}
        </div>
        <MetricCards opportunities={areaOpportunities} priority={priority} area={area} onChange={setPriority} />

        {/* Motor de Escaneo & Análisis con Gemini (Colapsable) */}
        <OfficialScanner />

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

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-slate-500 px-1">
          <span><strong className="text-slate-700">{visibleOpportunities.length}</strong> oportunidades {area === 'all' ? 'entre ambas áreas' : area === 'regulatory' ? 'de Regulatorio' : 'de Propiedad Intelectual'}{priority !== 'all' && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-slate-200/60 px-2 py-0.5 text-[10px]">{{attention:'Requieren atención',unassigned:'Sin asignar',in_progress:'En gestión'}[priority]}<button onClick={()=>setPriority('all')} aria-label="Quitar filtro de prioridad" className="ml-1 font-bold text-slate-500 hover:text-slate-900">×</button></span>}</span>
          <span className="text-[11px]">Selecciona una oportunidad para ver el análisis completo.</span>
        </div>
        <OpportunityBoard opportunities={priorityOpportunities} area={area} loading={loading} onSelect={setSelectedOpportunity} onAssign={setOpportunityToAssign} />
      </main>}

      {/* Footer Oficial SPI Américas */}
      <footer className="mt-10 border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <img src="/spi-logo-blue.png" alt="SPI Américas" className="h-7 w-auto object-contain" />
            <span className="text-xs text-slate-500 font-medium sm:border-l sm:border-slate-200 sm:pl-3">
              Consultoría Regulatoria & Propiedad Intelectual en América Latina
            </span>
          </div>
          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} SPI Américas. Monitoreo oficial CO • MX • BR • AR • CL • PE
          </div>
        </div>
      </footer>

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
        isOpen={isDigestOpen}
        digest={dailyDigest}
        onClose={() => setIsDigestOpen(false)}
      />
    </div>
  );
}

// App es el punto de entrada — envuelve AppContent con AuthGuard
export function App() {
  return (
    <AuthGuard>
      {(user) => <AppContent user={user} />}
    </AuthGuard>
  );
}

export default App;
