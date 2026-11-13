import React from 'react';
import { Layers3, AlertCircle, UserRoundPlus, CircleDot, ArrowUpRight } from 'lucide-react';
import { RegulatoryOpportunity } from '../types';
import { AreaView } from '../utils/opportunityAreas';
import { AREA_THEMES } from '../utils/areaThemes';
import { OpportunityPriority, priorityCounts } from '../utils/opportunityPriorities';

interface Props {
  opportunities: RegulatoryOpportunity[];
  priority: OpportunityPriority;
  area: AreaView;
  onChange: (priority:OpportunityPriority)=>void;
}
export const MetricCards: React.FC<Props> = ({opportunities,priority,area,onChange}) => {
  const counts=priorityCounts(opportunities);
  const accent=area === 'all' ? 'text-slate-900' : AREA_THEMES[area].text;
  const selected=area === 'all' ? 'ring-slate-300 bg-white' : area === 'regulatory' ? 'ring-sky-300 bg-sky-50/70' : 'ring-violet-300 bg-violet-50/70';
  const items = [
    {key:'all' as const,label:'Todas',description:area === 'all'?'Ambas áreas de SPI':'Panorama de esta área',icon:Layers3,tone:accent,background:'bg-slate-100'},
    {key:'attention' as const,label:'Requieren atención',description:'Urgentes o con plazo próximo',icon:AlertCircle,tone:'text-amber-700',background:'bg-amber-50'},
    {key:'unassigned' as const,label:'Sin asignar',description:'Pendientes de responsable',icon:UserRoundPlus,tone:accent,background:area === 'intellectual_property'?'bg-violet-50':'bg-sky-50'},
    {key:'in_progress' as const,label:'En gestión',description:'Trabajo activo del equipo',icon:CircleDot,tone:accent,background:area === 'intellectual_property'?'bg-violet-50':'bg-sky-50'}
  ];
  return <section aria-label="Filtrar oportunidades por prioridad" className="mb-5">
    <div className="flex items-center justify-between mb-2 px-0.5"><h2 className="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400">Prioridades de trabajo</h2>{priority !== 'all' && <button onClick={()=>onChange('all')} className="text-[11px] text-slate-500 hover:text-slate-900 underline underline-offset-2">Ver todas</button>}</div>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
      {items.map(({key,label,description,icon:Icon,tone,background})=><button key={key} onClick={()=>onChange(priority === key ? 'all' : key)} aria-pressed={priority === key} title={key === 'attention'?'Asuntos abiertos de urgencia crítica o alta, o con un plazo informado próximo (hasta 30 días) o vencido.':description} className={`group text-left rounded-2xl px-4 py-3.5 ring-1 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${priority === key ? `${selected} shadow-sm` : 'bg-white/80 ring-slate-200/60 hover:bg-white hover:shadow-sm hover:ring-slate-300'}`}>
        <div className="flex items-start justify-between gap-2"><span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone} ${background}`}><Icon className="h-3.5 w-3.5" /></span><span className={`text-2xl font-bold tracking-tight tabular-nums leading-7 ${tone}`}>{counts[key]}</span></div>
        <p className="mt-2 text-xs font-semibold text-slate-800 flex items-center justify-between gap-1">{label}<ArrowUpRight className={`h-3 w-3 ${priority === key ? 'text-slate-600' : 'text-slate-300 group-hover:text-slate-500'}`} /></p>
        <p className="mt-0.5 text-[10px] leading-4 text-slate-400">{description}</p>
      </button>)}
    </div>
  </section>;
};
