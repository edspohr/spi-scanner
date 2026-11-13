import type { RegulatoryOpportunity } from '../types';

export type OpportunityPriority = 'all' | 'attention' | 'unassigned' | 'in_progress';
export interface OpportunityDeadline {
  date: string;
  label: 'Transición' | 'Comentarios';
  daysRemaining: number;
}

function dateDay(value: string | undefined): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0,10) !== value) return null;
  return timestamp / 86400000;
}

export function getNextDeadline(opportunity: Pick<RegulatoryOpportunity,'transitionalDeadline'|'commentsDeadline'>, now = new Date()): OpportunityDeadline | null {
  // Compare calendar days in the user's timezone, without interpreting an effective date as a deadline.
  const today = Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()) / 86400000;
  const deadlines: OpportunityDeadline[]=[];
  for (const [value,label] of [[opportunity.transitionalDeadline,'Transición'],[opportunity.commentsDeadline,'Comentarios']] as const) {
    const day=dateDay(value);
    if (day !== null && value) deadlines.push({date:value,label,daysRemaining:day-today});
  }
  const upcoming=deadlines.filter(deadline=>deadline.daysRemaining >= 0).sort((a,b)=>a.daysRemaining-b.daysRemaining);
  return upcoming[0] || deadlines.sort((a,b)=>b.daysRemaining-a.daysRemaining)[0] || null;
}

export function matchesPriority(opportunity: RegulatoryOpportunity, priority: OpportunityPriority, now = new Date()): boolean {
  if (priority === 'all') return true;
  if (opportunity.status === 'cerrada') return false;
  if (priority === 'unassigned') return !opportunity.assignedTo?.id;
  if (priority === 'in_progress') return ['en_evaluacion','asignada','contactando_clientes'].includes(opportunity.status);
  const deadline=getNextDeadline(opportunity,now);
  return ['critical','high'].includes(opportunity.urgency) || (deadline !== null && deadline.daysRemaining <= 30);
}

export function priorityCounts(opportunities: RegulatoryOpportunity[], now = new Date()): Record<OpportunityPriority,number> {
  return {
    all:opportunities.length,
    attention:opportunities.filter(opportunity=>matchesPriority(opportunity,'attention',now)).length,
    unassigned:opportunities.filter(opportunity=>matchesPriority(opportunity,'unassigned',now)).length,
    in_progress:opportunities.filter(opportunity=>matchesPriority(opportunity,'in_progress',now)).length
  };
}
