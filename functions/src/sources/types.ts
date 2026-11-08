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

export interface OfficialSourceConfig {
  id: string;
  name: string;
  country: CountryCode;
  entityName: string;
  category: 'sanitary' | 'intellectual_property' | 'official_gazette';
  sectors: RegulatorySector[];
  feedUrl: string;
  portalUrl: string;
  frequencyHours: number;
  isActive: boolean;
  notes?: string;
}

export interface RawRegulatoryDocument {
  id: string;
  sourceId: string;
  country: CountryCode;
  entityName: string;
  title: string;
  documentNumber?: string;
  publicationDate: string; // ISO 8601 string
  sourceUrl: string;
  rawContent: string;
  pdfUrl?: string;
}

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
