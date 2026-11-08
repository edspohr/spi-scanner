export type CountryCode = 'CO' | 'MX' | 'BR' | 'AR' | 'CL' | 'PE';

export type RegulatorySector = 
  | 'pharma' 
  | 'medical_devices' 
  | 'food_beverages' 
  | 'cosmetics_hygiene' 
  | 'supplements' 
  | 'intellectual_property';

export type OpportunityType = 'commercial_opportunity' | 'mandatory_compliance';

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

export type OpportunityStatus = 
  | 'nueva' 
  | 'en_evaluacion' 
  | 'asignada' 
  | 'contactando_clientes' 
  | 'cerrada';

export interface LegalCitation {
  articleOrSection: string;
  quoteText: string;
  interpretation: string;
}

export interface SpiActionPlan {
  whatClientsNeedToDo: string;
  howSpiCanHelp: string;
  affectedClientProfile: string;
  estimatedEffortHours?: number;
  recommendedServiceOffering?: string;
}

export interface SpiTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  specialty: string[];
}

export interface RegulatoryOpportunity {
  id: string;
  documentId: string;
  title: string;
  country: CountryCode;
  entityName: string;
  sectors: RegulatorySector[];
  sourceUrl: string;
  publicationDate: string;
  documentNumber?: string;

  // Análisis de negocio e impacto
  isRelevant: boolean;
  opportunityType: OpportunityType;
  urgency: UrgencyLevel;
  executiveSummary: string;
  detailedAnalysis: string;

  // Fechas regulatorias clave
  effectiveDate?: string;
  transitionalDeadline?: string;
  commentsDeadline?: string;
  daysRemainingForAction?: number;

  // Plan SPI y Citas
  spiActionPlan: SpiActionPlan;
  citations: LegalCitation[];

  // Asignación y CRM
  status: OpportunityStatus;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assignedAt?: string;
  lastUpdated: string;
  managementNotes?: Array<{
    author: string;
    date: string;
    comment: string;
  }>;
}

export interface DailyDigest {
  id: string;
  digestDate: string;
  createdAt: string;
  hasCriticalUpdates: boolean;
  totalScanned: number;
  relevantCount: number;
  criticalCount: number;
  highCount: number;
  opportunities: Array<{
    id: string;
    title: string;
    country: CountryCode;
    entityName: string;
    urgency: UrgencyLevel;
    opportunityType: OpportunityType;
    executiveSummary: string;
    actionNeeded: string;
    sourceUrl: string;
  }>;
  executiveBriefingText: string;
}
