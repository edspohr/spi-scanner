import type { RegulatoryOpportunity } from '../types';

export type PracticeArea = 'regulatory' | 'intellectual_property';
export type AreaView = PracticeArea | 'all';

// Industry tags describe affected clients. An IP matter stays with the IP team
// even when pharmaceutical, cosmetics or device clients are affected.
export function getPracticeArea(opportunity: Pick<RegulatoryOpportunity, 'sectors'>): PracticeArea {
  return opportunity.sectors.includes('intellectual_property') ? 'intellectual_property' : 'regulatory';
}

export function groupByPracticeArea(opportunities: RegulatoryOpportunity[]): Record<PracticeArea, RegulatoryOpportunity[]> {
  return opportunities.reduce<Record<PracticeArea, RegulatoryOpportunity[]>>((groups, opportunity) => {
    groups[getPracticeArea(opportunity)].push(opportunity);
    return groups;
  }, {regulatory:[],intellectual_property:[]});
}

export function areaFromHash(hash: string): AreaView {
  if (hash === '#radar/regulatorio') return 'regulatory';
  if (hash === '#radar/pi') return 'intellectual_property';
  return 'all';
}

export function areaHash(area: AreaView): string {
  return area === 'all' ? '#radar' : area === 'regulatory' ? '#radar/regulatorio' : '#radar/pi';
}
