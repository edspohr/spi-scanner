import React from 'react';
import { CountryCode, RegulatorySector, OpportunityType, UrgencyLevel } from '../types';
import { Search, Filter, X } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCountry: CountryCode | 'ALL';
  setSelectedCountry: (country: CountryCode | 'ALL') => void;
  selectedSector: RegulatorySector | 'ALL';
  setSelectedSector: (sector: RegulatorySector | 'ALL') => void;
  selectedType: OpportunityType | 'ALL';
  setSelectedType: (type: OpportunityType | 'ALL') => void;
  selectedUrgency: UrgencyLevel | 'ALL';
  setSelectedUrgency: (urgency: UrgencyLevel | 'ALL') => void;
  onResetFilters: () => void;
}

const COUNTRIES: Array<{ code: CountryCode | 'ALL'; label: string; flag: string }> = [
  { code: 'ALL', label: 'Todos los Países', flag: '🌎' },
  { code: 'CO', label: 'Colombia', flag: '🇨🇴' },
  { code: 'MX', label: 'México', flag: '🇲🇽' },
  { code: 'BR', label: 'Brasil', flag: '🇧🇷' },
  { code: 'AR', label: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', label: 'Chile', flag: '🇨🇱' },
  { code: 'PE', label: 'Perú', flag: '🇵🇪' },
];

const SECTORS: Array<{ code: RegulatorySector | 'ALL'; label: string }> = [
  { code: 'ALL', label: 'Todos los Sectores' },
  { code: 'pharma', label: 'Farmacéutico' },
  { code: 'medical_devices', label: 'Dispositivos Médicos' },
  { code: 'food_beverages', label: 'Alimentos & Bebidas' },
  { code: 'cosmetics_hygiene', label: 'Cosméticos & Aseo' },
  { code: 'supplements', label: 'Suplementos Dietarios' },
  { code: 'intellectual_property', label: 'Propiedad Intelectual (PI)' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCountry,
  setSelectedCountry,
  selectedSector,
  setSelectedSector,
  selectedType,
  setSelectedType,
  selectedUrgency,
  setSelectedUrgency,
  onResetFilters
}) => {
  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCountry !== 'ALL' ||
    selectedSector !== 'ALL' ||
    selectedType !== 'ALL' ||
    selectedUrgency !== 'ALL';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 mb-6 shadow-sm space-y-4">
      {/* Barra de Búsqueda y Filtros Rápidos */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por normativa, entidad (INVIMA, COFEPRIS, ANVISA...), palabra clave o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tipo de Oportunidad */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-lg text-xs font-medium">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedType === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setSelectedType('commercial_opportunity')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
              selectedType === 'commercial_opportunity'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span>💼</span> Oportunidad de Venta
          </button>
          <button
            onClick={() => setSelectedType('mandatory_compliance')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
              selectedType === 'mandatory_compliance'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            <span>🛡️</span> Cumplimiento Mandatorio
          </button>
        </div>

        {/* Urgencia */}
        <select
          value={selectedUrgency}
          onChange={(e) => setSelectedUrgency(e.target.value as UrgencyLevel | 'ALL')}
          aria-label="Filtrar por nivel de urgencia"
          className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="ALL">Cualquier Urgencia</option>
          <option value="critical">🚨 Crítica (&lt;30 días)</option>
          <option value="high">⚠️ Alta (30-90 días)</option>
          <option value="medium">🟡 Media</option>
          <option value="low">🟢 Baja</option>
        </select>
      </div>

      {/* Selector de Países con Banderas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" /> País:
        </span>
        {COUNTRIES.map((c) => (
          <button
            key={c.code}
            onClick={() => setSelectedCountry(c.code)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCountry === c.code
                ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-600/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <span>{c.flag}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Selector de Sectores */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Sector:</span>
        {SECTORS.map((s) => (
          <button
            key={s.code}
            onClick={() => setSelectedSector(s.code)}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedSector === s.code
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 font-semibold hover:bg-rose-50 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Limpiar Filtros
          </button>
        )}
      </div>
    </div>
  );
};
