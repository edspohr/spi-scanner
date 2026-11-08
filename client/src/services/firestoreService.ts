import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  setDoc,
  getDocs,
  limit 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { RegulatoryOpportunity, DailyDigest, OpportunityStatus, SpiTeamMember } from '../types';
import { INITIAL_OPPORTUNITIES, INITIAL_DAILY_DIGEST } from '../mock/initialData';

const FUNCTIONS_BASE_URL = 'https://us-central1-spi-scanner.cloudfunctions.net';

/**
 * Suscripción en tiempo real a las oportunidades en Cloud Firestore
 */
export function subscribeToOpportunities(
  onUpdate: (opportunities: RegulatoryOpportunity[]) => void,
  onError?: (error: any) => void
) {
  try {
    const oppsRef = collection(db, 'regulatory_opportunities');
    const q = query(oppsRef, orderBy('publicationDate', 'desc'));

    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const opps: RegulatoryOpportunity[] = snapshot.docs.map(
          (d) => ({ ...d.data(), id: d.id } as RegulatoryOpportunity)
        );
        onUpdate(opps);
      } else {
        // Si la colección está vacía, retornar datos iniciales
        onUpdate(INITIAL_OPPORTUNITIES);
      }
    }, (error) => {
      console.warn('Firestore snapshot error (usando fallback local):', error);
      if (onError) onError(error);
      onUpdate(INITIAL_OPPORTUNITIES);
    });
  } catch (err) {
    console.error('Error suscribiendo a Firestore:', err);
    onUpdate(INITIAL_OPPORTUNITIES);
    return () => {};
  }
}

/**
 * Suscripción al último Daily Digest en Cloud Firestore
 */
export function subscribeToLatestDigest(
  onUpdate: (digest: DailyDigest) => void
) {
  try {
    const digestsRef = collection(db, 'daily_digests');
    const q = query(digestsRef, orderBy('digestDate', 'desc'), limit(1));

    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        onUpdate(snapshot.docs[0].data() as DailyDigest);
      } else {
        onUpdate(INITIAL_DAILY_DIGEST);
      }
    }, (err) => {
      console.warn('Error cargando digest de Firestore:', err);
      onUpdate(INITIAL_DAILY_DIGEST);
    });
  } catch (err) {
    onUpdate(INITIAL_DAILY_DIGEST);
    return () => {};
  }
}

/**
 * Actualizar asignación o estado de una oportunidad directamente en Firestore
 */
export async function updateOpportunityInFirestore(
  opportunityId: string,
  member: SpiTeamMember | null,
  status: OpportunityStatus,
  note?: string
) {
  try {
    const docRef = doc(db, 'regulatory_opportunities', opportunityId);
    const updateData: any = {
      status,
      lastUpdated: new Date().toISOString()
    };

    if (member) {
      updateData.assignedTo = {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role
      };
      updateData.assignedAt = new Date().toISOString();
    }

    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.warn('No se pudo actualizar en Firestore, guardando localmente:', error);
    return false;
  }
}

/**
 * Ejecutar análisis real de un documento con Gemini en Vertex AI
 */
export async function analyzeDocumentWithVertexAI(rawContent: string, country: string = 'CO') {
  try {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/analyzeCustomDocument`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          id: `doc-${Date.now()}`,
          sourceId: `${country.toLowerCase()}-custom-test`,
          country,
          entityName: country === 'CO' ? 'INVIMA' : country === 'MX' ? 'COFEPRIS' : country === 'BR' ? 'ANVISA' : 'Agencia Sanitaria',
          title: 'Acto Administrativo Extraído para Análisis',
          publicationDate: new Date().toISOString().split('T')[0],
          sourceUrl: 'https://fuente.oficial.gov/normativa',
          rawContent
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Error en Cloud Function: ${response.statusText}`);
    }

    const result = await response.json();
    return result.result || result;
  } catch (error) {
    console.error('Error llamando a Vertex AI Cloud Function:', error);
    throw error;
  }
}
