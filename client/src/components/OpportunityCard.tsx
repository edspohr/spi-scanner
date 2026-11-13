import React from 'react';
import { RegulatoryOpportunity } from '../types';
import { CountryBadge } from './CountryBadge';
import { CalendarDays, Clock3, ArrowUpRight, UserRoundPlus, ChevronRight } from 'lucide-react';
import { getPracticeArea } from '../utils/opportunityAreas';
import { AREA_THEMES } from '../utils/areaThemes';
import { getNextDeadline } from '../utils/opportunityPriorities';

interface OpportunityCardProps {
  opportunity: RegulatoryOpportunity;
  onSelect: (opportunity: RegulatoryOpportunity) => void;
  onAssign: (opportunity: RegulatoryOpportunity) => void;
}
const URGENCY: Record<string, {label:string;badge:string}> = {
  critical:{label:'Crítica',badge:'bg-rose-50 text-rose-700 ring-rose-100'},
  high:{label:'Alta',badge:'bg-amber-50 text-amber-700 ring-amber-100'},
  medium:{label:'Media',badge:'bg-slate-100 text-slate-500 ring-slate-100'},
  low:{label:'Baja',badge:'bg-slate-50 text-slate-400 ring-slate-100'}
};
const STATUS: Record<string,string> = {nueva:'Nueva',en_evaluacion:'En evaluación',asignada:'Asignada',contactando_clientes:'Contactando clientes',cerrada:'Cerrada'};
const INDUSTRIES: Record<string,string> = {pharma:'Farma',medical_devices:'Dispositivos',food_beverages:'Alimentos',cosmetics_hygiene:'Cosméticos',supplements:'Suplementos'};
const formatDate=(value:string)=>value.split('-').reverse().join('/');

export const OpportunityCard: React.FC<OpportunityCardProps> = ({opportunity,onSelect,onAssign}) => {
  const urgency=URGENCY[opportunity.urgency] || URGENCY.medium;
  const theme=AREA_THEMES[getPracticeArea(opportunity)];
  const industries=opportunity.sectors.filter(sector=>sector !== 'intellectual_property');
  const deadline=getNextDeadline(opportunity);
  const open=opportunity.status !== 'cerrada';
  const overdue=!!deadline && deadline.daysRemaining < 0 && open;
  const soon=!!deadline && deadline.daysRemaining >= 0 && deadline.daysRemaining <= 30 && open;
  const action=opportunity.spiActionPlan.howSpiCanHelp?.trim();
  const owner=opportunity.assignedTo?.name;
  const initials=owner?.split(' ').filter(Boolean).slice(0,2).map(word=>word[0]).join('');
  const deadlineTone=overdue?'text-rose-700':soon?'text-amber-700':'text-slate-700';
  return <article className={`group min-w-0 overflow-hidden bg-white rounded-2xl shadow-sm shadow-slate-900/[0.03] ring-1 ring-slate-200/60 hover:shadow-md transition-all duration-150 ${theme.card}`}>
    <div className="p-3.5 pb-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${theme.muted}`}>{opportunity.opportunityType === 'commercial_opportunity'?'Oportunidad comercial':'Cumplimiento'}</span>
        <div className="flex items-center gap-2"><span className="text-[10px] text-slate-400">{STATUS[opportunity.status] || opportunity.status}</span><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${urgency.badge}`}>{urgency.label}</span></div>
      </div>
      <h3><button onClick={()=>onSelect(opportunity)} className={`w-full text-left text-[15px] font-semibold text-slate-900 leading-[1.4] tracking-[-0.01em] line-clamp-2 hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-sm`} title={opportunity.title}>{opportunity.title}</button></h3>
      <div className={`mt-3 rounded-xl px-3 py-2.5 ${theme.soft}`}>
        <p className={`text-[9px] uppercase tracking-[0.12em] font-bold mb-1 ${theme.muted}`}>Qué debe hacer SPI</p>
        <p className={`text-xs leading-[1.5] line-clamp-2 ${theme.text}`} title={action}>{action || 'Acción por definir.'}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <button onClick={()=>onAssign(opportunity)} className="min-w-0 text-left rounded-lg group/owner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" title="Asignar responsable o cambiar estado" aria-label={`Gestionar responsable de ${opportunity.title}`}>
          <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Responsable</span>
          <span className="flex items-center gap-1.5 min-w-0"><span className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ${owner ? `${theme.count}` : 'bg-slate-100 text-slate-400'}`}>{owner?initials:<UserRoundPlus className="h-3 w-3" />}</span><span className={`truncate text-xs font-semibold ${owner?'text-slate-700':theme.muted}`}>{owner || 'Asignar responsable'}</span><ChevronRight className="h-3 w-3 shrink-0 text-slate-300 group-hover/owner:text-slate-600" /></span>
        </button>
        <div className="min-w-0" title={deadline ? `Plazo de ${deadline.label.toLowerCase()}` : 'No hay una fecha de plazo informada'}>
          <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 mb-1">{overdue?'Plazo vencido':!open?'Plazo registrado':'Próximo plazo'}</p>
          <p className={`flex items-center gap-1.5 text-xs font-semibold min-h-[24px] ${deadline?deadlineTone:'text-slate-400 font-normal'}`}><Clock3 className="h-3.5 w-3.5 shrink-0" />{deadline?formatDate(deadline.date):'Sin plazo informado'}{deadline?.daysRemaining === 0 && open && <span className="text-[9px]">Hoy</span>}</p>
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between gap-2 px-4 py-2 bg-slate-50/60 text-[10px]">
      <div className="min-w-0 flex items-center flex-wrap gap-x-2 gap-y-0.5 text-slate-400">
        <CountryBadge country={opportunity.country} muted />
        <span className="truncate max-w-[140px]" title={opportunity.entityName}>{opportunity.entityName}</span>
        {opportunity.publicationDate && <span className="inline-flex items-center gap-1" title="Fecha de publicación"><CalendarDays className="h-3 w-3" />{opportunity.publicationDate}</span>}
        {!!industries.length && <span className="truncate max-w-[130px]" title={industries.map(sector=>INDUSTRIES[sector] || sector).join(', ')}>{INDUSTRIES[industries[0]] || industries[0]}{industries.length>1?` +${industries.length-1}`:''}</span>}
      </div>
      <button onClick={()=>onSelect(opportunity)} className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.button}`} aria-label={`Ver análisis de ${opportunity.title}`}>Detalle<ArrowUpRight className="w-3 h-3" /></button>
    </div>
  </article>;
};
