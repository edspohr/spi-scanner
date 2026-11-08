import { VertexAI, SchemaType } from '@google-cloud/vertexai';
import { RawRegulatoryDocument, RegulatoryOpportunity, UrgencyLevel, OpportunityType } from '../sources/types';

const PROJECT_ID = process.env.GCP_PROJECT || process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG || '{}').projectId : 'spi-regulatory-scanner';
const LOCATION = process.env.VERTEX_LOCATION || 'us-central1';

// Inicialización de Vertex AI
let vertexAIClient: VertexAI | null = null;

function getVertexAI(): VertexAI {
  if (!vertexAIClient) {
    vertexAIClient = new VertexAI({
      project: PROJECT_ID || 'spi-regulatory-scanner',
      location: LOCATION,
    });
  }
  return vertexAIClient;
}

export const SPI_ANALYZER_SYSTEM_PROMPT = `
Eres el Director Senior de Asuntos Regulatorios y Propiedad Intelectual de "SPI Américas", una firma líder de consultoría que asesora a empresas farmacéuticas, de dispositivos médicos, alimentos, suplementos, cosméticos y titulares de marcas en Latinoamérica (Colombia, México, Brasil, Argentina, Chile, Perú).

Tu misión es analizar documentos normativos, resoluciones, acuerdos, gacetas de propiedad industrial y circulares oficiales de agencias como INVIMA, COFEPRIS, ANVISA, ANMAT, ISP, DIGEMID, SIC, IMPI e INPI.

CRITERIOS ESTRICTOS DE EVALUACIÓN SPI:
1. FILTRO DE RUIDO:
   - Descarta asuntos puramente individuales o de rutina que NO creen una oportunidad de consultoría ni una obligación general (ej. retiro de un lote puntual por contaminación física, trámites internos de personal de la agencia).
   - Relevante: Nuevas regulaciones técnicas, modificaciones de requisitos para registro, cambios en plataformas digitales (ej. INVIMA Ágil), actualizaciones de tarifas, plazos de transición de etiquetado o fórmulas, o publicaciones de marcas en gacetas que requieran oposición/vigilancia.

2. CLASIFICACIÓN DEL TIPO DE OPORTUNIDAD:
   - 'commercial_opportunity': Novedades donde SPI puede VENDER un nuevo servicio, consultoría de adecuación, auditoría, migración de expedientes o registro/blindaje de activos intangibles.
   - 'mandatory_compliance': Obligaciones perentorias que los clientes de SPI DEBEN cumplir para no perder registros, no ser sancionados o no quedar bloqueados en aduanas/puertos.

3. URGENCIA Y FECHAS:
   - 'critical': Plazo de cumplimiento o transición menor a 30 días, o riesgo inminente de cancelación de registro sanitario/marca.
   - 'high': Plazo de 30 a 90 días, requiere preparación de dossiers técnicos o reformulaciones.
   - 'medium': Plazos de 90 a 180 días.
   - 'low': Plazos mayores o consultas públicas sin fecha fija.

4. ACCIÓN PRÁCTICA SPI:
   - Define exactamente qué deben hacer los clientes ('whatClientsNeedToDo').
   - Define la oferta o propuesta de servicio de SPI ('howSpiCanHelp').
   - Perfil de clientes afectados ('affectedClientProfile').

5. CITAS TEXTUALES:
   - Extrae el número de artículo o sección y la cita literal que sustenta la obligación o el cambio.
`;

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    isRelevant: { type: SchemaType.BOOLEAN, description: 'True si es relevante para clientes de SPI o representa oportunidad de negocio' },
    sectors: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Sectores afectados: pharma, medical_devices, food_beverages, cosmetics_hygiene, supplements, intellectual_property'
    },
    opportunityType: {
      type: SchemaType.STRING,
      description: 'commercial_opportunity o mandatory_compliance'
    },
    urgency: {
      type: SchemaType.STRING,
      description: 'critical, high, medium, o low'
    },
    executiveSummary: {
      type: SchemaType.STRING,
      description: 'Resumen ejecutivo claro en 1-2 párrafos sobre qué cambió y por qué importa.'
    },
    detailedAnalysis: {
      type: SchemaType.STRING,
      description: 'Explicación técnica detallada del cambio normativo.'
    },
    effectiveDate: { type: SchemaType.STRING, description: 'Fecha de entrada en vigor en formato YYYY-MM-DD si se menciona' },
    transitionalDeadline: { type: SchemaType.STRING, description: 'Fecha límite de transición en formato YYYY-MM-DD si aplica' },
    commentsDeadline: { type: SchemaType.STRING, description: 'Fecha límite para comentarios en consulta pública si aplica' },
    spiActionPlan: {
      type: SchemaType.OBJECT,
      properties: {
        whatClientsNeedToDo: { type: SchemaType.STRING, description: 'Qué deben hacer los clientes para cumplir' },
        howSpiCanHelp: { type: SchemaType.STRING, description: 'Qué servicio ofrece SPI para capitalizarlo' },
        affectedClientProfile: { type: SchemaType.STRING, description: 'Qué empresas o industrias específicas son afectadas' },
        recommendedServiceOffering: { type: SchemaType.STRING, description: 'Nombre comercial sugerido del servicio SPI' }
      },
      required: ['whatClientsNeedToDo', 'howSpiCanHelp', 'affectedClientProfile']
    },
    citations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          articleOrSection: { type: SchemaType.STRING },
          quoteText: { type: SchemaType.STRING },
          interpretation: { type: SchemaType.STRING }
        },
        required: ['articleOrSection', 'quoteText', 'interpretation']
      }
    }
  },
  required: ['isRelevant', 'sectors', 'opportunityType', 'urgency', 'executiveSummary', 'spiActionPlan', 'citations']
};

export async function analyzeRegulatoryDocument(
  doc: RawRegulatoryDocument
): Promise<RegulatoryOpportunity | null> {
  const vertex = getVertexAI();
  const generativeModel = vertex.getGenerativeModel({
    model: 'gemini-1.5-flash-002',
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: responseSchema as any,
    },
    systemInstruction: SPI_ANALYZER_SYSTEM_PROMPT
  });

  const prompt = `
DOCUMENTO OFICIAL PARA ANÁLISIS:
País: ${doc.country}
Entidad: ${doc.entityName}
Título: ${doc.title}
Número de documento: ${doc.documentNumber || 'No especificado'}
Fecha de publicación: ${doc.publicationDate}
Enlace oficial: ${doc.sourceUrl}

TEXTO DEL DOCUMENTO / NORMATIVA:
${doc.rawContent}
`;

  try {
    const result = await generativeModel.generateContent(prompt);
    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.warn(`No response from Gemini for doc ${doc.id}`);
      return null;
    }

    const parsed = JSON.parse(responseText);

    if (!parsed.isRelevant) {
      console.log(`Documento ${doc.id} descartado por baja relevancia para SPI.`);
      return null;
    }

    const opportunity: RegulatoryOpportunity = {
      id: `opp-${doc.country.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      documentId: doc.id,
      title: doc.title,
      country: doc.country,
      entityName: doc.entityName,
      sectors: parsed.sectors || ['pharma'],
      sourceUrl: doc.sourceUrl,
      publicationDate: doc.publicationDate,
      documentNumber: doc.documentNumber,
      isRelevant: true,
      opportunityType: parsed.opportunityType as OpportunityType,
      urgency: parsed.urgency as UrgencyLevel,
      executiveSummary: parsed.executiveSummary,
      detailedAnalysis: parsed.detailedAnalysis || parsed.executiveSummary,
      effectiveDate: parsed.effectiveDate,
      transitionalDeadline: parsed.transitionalDeadline,
      commentsDeadline: parsed.commentsDeadline,
      spiActionPlan: parsed.spiActionPlan,
      citations: parsed.citations || [],
      status: 'nueva',
      lastUpdated: new Date().toISOString()
    };

    return opportunity;
  } catch (error) {
    console.error(`Error procesando documento ${doc.id} con Gemini:`, error);
    return null;
  }
}
