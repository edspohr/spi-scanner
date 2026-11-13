import React from 'react';
import { ShieldCheck, Scale, LayoutGrid } from 'lucide-react';
import { RegulatoryOpportunity } from '../types';
import { AreaView, groupByPracticeArea } from '../utils/opportunityAreas';
import { AREA_THEMES } from '../utils/areaThemes';
import { OpportunityCard } from './OpportunityCard';

interface Props {
  opportunities: RegulatoryOpportunity[];
  area: AreaView;
  loading: boolean;
  onSelect: (opportunity:RegulatoryOpportunity)=>void;
  onAssign: (opportunity:RegulatoryOpportunity)=>void;
}
export function OpportunityBoard({opportunities,area,loading,onSelect,onAssign}: Props) {
  const groups = groupByPracticeArea(opportunities);
  const columns = [
    {key:'regulatory' as const,title:'Regulatorio',description:'Registros, requisitos sanitarios y cumplimiento',icon:ShieldCheck,theme:AREA_THEMES.regulatory},
    {key:'intellectual_property' as const,title:'Propiedad Intelectual',description:'Marcas, patentes, diseños y activos intangibles',icon:Scale,theme:AREA_THEMES.intellectual_property}
  ].filter(column=>area === 'all' || area === column.key);
  return <div className={`grid gap-6 items-start ${area === 'all' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
    {columns.map(({key,title,description,icon:Icon,theme})=><section key={key} aria-labelledby={`area-${key}`} className="min-w-0">
      <div className={`flex items-center gap-3 px-4 py-3 mb-3 rounded-2xl bg-gradient-to-r ${theme.header}`}><span className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${theme.icon}`}><Icon className="h-4 w-4" /></span><div className="min-w-0 flex-1"><h2 id={`area-${key}`} className={`text-sm font-bold ${theme.text}`}>{title}</h2><p className="text-[11px] text-slate-500 mt-0.5">{description}</p></div><span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-slate-600" aria-label={`${groups[key].length} oportunidades de ${title}`}>{groups[key].length}</span></div>
      <div className={`${area !== 'all' ? 'grid xl:grid-cols-2 gap-4' : 'space-y-3.5'}`}>
        {groups[key].map(opportunity=><OpportunityCard key={opportunity.id} opportunity={opportunity} onSelect={onSelect} onAssign={onAssign} />)}
        {!groups[key].length && <div className="px-5 py-10 text-center xl:col-span-2"><LayoutGrid className="mx-auto w-6 h-6 text-slate-300 mb-2" /><p className="text-sm font-semibold text-slate-600">{loading ? 'Consultando oportunidades...' : 'Sin oportunidades para esta área con los filtros actuales'}</p><p className="text-xs text-slate-400 mt-1">{loading ? 'Los resultados aparecerán al terminar la consulta.' : 'Puedes ajustar la búsqueda o los filtros.'}</p></div>}
      </div>
    </section>)}
  </div>;
}
