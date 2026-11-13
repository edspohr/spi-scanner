import {
  collection, onSnapshot, doc, updateDoc, query, orderBy, limit,
  arrayUnion, deleteField
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, auth, db } from './firebaseConfig';
import { RegulatoryOpportunity, DailyDigest, OpportunityStatus, SpiTeamMember, CountryCode, OfficialSource, NewOfficialSource, SourceHealth } from '../types';

const functions = getFunctions(app, 'us-central1');
type OnError = (error: Error) => void;

export function subscribeToOpportunities(onUpdate: (items: RegulatoryOpportunity[]) => void, onError: OnError) {
  return onSnapshot(query(collection(db, 'regulatory_opportunities'), orderBy('publicationDate', 'desc')),
    snapshot => onUpdate(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as RegulatoryOpportunity))), onError);
}

export function subscribeToTeam(onUpdate: (items: SpiTeamMember[]) => void, onError: OnError) {
  return onSnapshot(query(collection(db, 'team_members'), orderBy('name')),
    snapshot => onUpdate(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as SpiTeamMember))), onError);
}

export function subscribeToLatestDigest(onUpdate: (digest: DailyDigest | null) => void, onError: OnError) {
  return onSnapshot(query(collection(db, 'daily_digests'), orderBy('digestDate', 'desc'), limit(1)),
    snapshot => onUpdate(snapshot.empty ? null : { ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as DailyDigest), onError);
}

export async function updateOpportunityInFirestore(opportunityId: string, member: SpiTeamMember | null, status: OpportunityStatus, note?: string) {
  const update: Record<string, unknown> = {
    status, lastUpdated: new Date().toISOString(),
    assignedTo: member ? { id: member.id, name: member.name, email: member.email, role: member.role } : deleteField(),
    assignedAt: member ? new Date().toISOString() : deleteField()
  };
  if (note?.trim()) update.managementNotes = arrayUnion({
    author: auth.currentUser?.displayName || auth.currentUser?.email || 'Equipo SPI',
    date: new Date().toISOString(), comment: note.trim()
  });
  await updateDoc(doc(db, 'regulatory_opportunities', opportunityId), update);
}

export interface ScanResult {
  success: boolean;
  runId: string;
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  documentsFound: number;
  documentsSkipped: number;
  documentsAnalyzed: number;
  documentsFailed: number;
  opportunitiesFound: number;
  errors: Array<{ sourceId: string; error: string }>;
}

export async function triggerOfficialScan(country: CountryCode): Promise<ScanResult> {
  const call = httpsCallable<{ country: CountryCode; maxItemsPerSource: number }, ScanResult>(functions, 'triggerManualScan', { timeout: 540000 });
  return (await call({ country, maxItemsPerSource: 3 })).data;
}

export async function analyzeDocumentWithVertexAI(rawContent: string, country: CountryCode, sourceUrl: string, publicationDate: string) {
  const call = httpsCallable<unknown, { isRelevant: boolean; opportunity?: RegulatoryOpportunity }>(functions, 'analyzeCustomDocument', { timeout: 120000 });
  return (await call({ rawContent, country, sourceUrl, publicationDate })).data;
}

export interface ScanRun extends Partial<ScanResult> {
  id: string;
  status: 'running' | 'completed' | 'partial' | 'failed';
  country: CountryCode | 'ALL';
  startedAt: string;
  finishedAt?: string;
}

export function subscribeToLatestScan(onUpdate: (run: ScanRun | null) => void, onError: OnError) {
  return onSnapshot(query(collection(db, 'scan_runs'), orderBy('startedAt', 'desc'), limit(1)),
    snapshot => onUpdate(snapshot.empty ? null : { ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as ScanRun), onError);
}


export function subscribeToSources(onUpdate: (sources: OfficialSource[]) => void, onError: OnError) {
  return onSnapshot(query(collection(db, 'official_sources'), orderBy('name')),
    snapshot => onUpdate(snapshot.docs.map(doc => ({...doc.data(), id:doc.id} as OfficialSource)).filter(source => !source.deletedAt)), onError);
}

const manageSource = httpsCallable(functions, 'manageOfficialSource');
export async function createOfficialSource(source: NewOfficialSource) {
  await manageSource({action:'create',source});
}
export async function deleteOfficialSource(id: string) {
  await manageSource({action:'delete',id});
}
export async function setOfficialSourceActive(id: string, isActive: boolean) {
  await manageSource({action:'setActive',id,isActive});
}

export async function checkOfficialSource(id: string): Promise<SourceHealth> {
  const check = httpsCallable<{id:string},SourceHealth>(functions,'checkOfficialSource',{timeout:120000});
  return (await check({id})).data;
}
