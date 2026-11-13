import React from 'react';
import { CountryCode, RegulatorySector, OpportunityType, UrgencyLevel } from '../types';
import { Search, X } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string; setSearchQuery: (query:string)=>void;
  selectedCountry: CountryCode | 'ALL'; setSelectedCountry: (country:CountryCode | 'ALL')=>void;
  selectedSector: RegulatorySector | 'ALL'; setSelectedSector: (sector:RegulatorySector | 'ALL')=>void;
  selectedType: OpportunityType | 'ALL'; setSelectedType: (type:OpportunityType | 'ALL')=>void;
  selectedUrgency: UrgencyLevel | 'ALL'; setSelectedUrgency: (urgency:UrgencyLevel | 'ALL')=>void;
  onResetFilters: ()=>void;
}
const SELECT = 'w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500';
export const FilterBar: React.FC<FilterBarProps> = props => {
  const {searchQuery,setSearchQuery,selectedCountry,setSelectedCountry,selectedSector,setSelectedSector,selectedType,setSelectedType,selectedUrgency,setSelectedUrgency,onResetFilters} = props;
  const active = !!searchQuery || selectedCountry !== 'ALL' || selectedSector !== 'ALL' || selectedType !== 'ALL' || selectedUrgency !== 'ALL';
  return <div className="rounded-xl border border-slate-200 bg-white p-3 mb-4">
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
      <label className="relative col-span-2 sm:col-span-3 xl:col-span-2"><span className="sr-only">Buscar oportunidades</span><Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" /><input type="search" placeholder="Buscar por tema, entidad o cliente" value={searchQuery} onChange={event=>setSearchQuery(event.target.value)} className={`${SELECT} pl-9`} /></label>
      <select aria-label="Filtrar por país" value={selectedCountry} onChange={event=>setSelectedCountry(event.target.value as CountryCode | 'ALL')} className={SELECT}><option value="ALL">Todos los países</option><option value="CO">Colombia</option><option value="MX">México</option><option value="BR">Brasil</option><option value="AR">Argentina</option><option value="CL">Chile</option><option value="PE">Perú</option></select>
      <select aria-label="Filtrar por industria afectada" value={selectedSector} onChange={event=>setSelectedSector(event.target.value as RegulatorySector | 'ALL')} className={SELECT}><option value="ALL">Todas las industrias</option><option value="pharma">Farmacéutica</option><option value="medical_devices">Dispositivos médicos</option><option value="food_beverages">Alimentos y bebidas</option><option value="cosmetics_hygiene">Cosméticos y aseo</option><option value="supplements">Suplementos</option></select>
      <select aria-label="Filtrar por tipo de oportunidad" value={selectedType} onChange={event=>setSelectedType(event.target.value as OpportunityType | 'ALL')} className={SELECT}><option value="ALL">Todos los tipos</option><option value="commercial_opportunity">Oportunidad comercial</option><option value="mandatory_compliance">Cumplimiento</option></select>
      <select aria-label="Filtrar por urgencia" value={selectedUrgency} onChange={event=>setSelectedUrgency(event.target.value as UrgencyLevel | 'ALL')} className={SELECT}><option value="ALL">Cualquier urgencia</option><option value="critical">Crítica</option><option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option></select>
    </div>
    {active && <div className="flex justify-end mt-2"><button onClick={onResetFilters} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600"><X className="h-3 w-3" />Limpiar filtros</button></div>}
  </div>;
};
