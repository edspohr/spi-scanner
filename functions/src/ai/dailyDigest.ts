import { VertexAI } from '@google-cloud/vertexai';
import { DailyDigest, RegulatoryOpportunity } from '../sources/types';

const PROJECT_ID = process.env.GCP_PROJECT || process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG || '{}').projectId : 'spi-scanner';
const LOCATION = process.env.VERTEX_LOCATION || 'us-central1';

export async function generateDailyExecutiveDigest(
  allOpportunities: RegulatoryOpportunity[],
  dateStr: string = new Date().toISOString().split('T')[0]
): Promise<DailyDigest> {
  // Filtrar estrictamente solo novedades de alta relevancia (critical o high)
  const highlightedOpps = allOpportunities.filter(
    (opp) => opp.urgency === 'critical' || opp.urgency === 'high'
  );

  const totalScanned = allOpportunities.length;
  const criticalCount = highlightedOpps.filter((o) => o.urgency === 'critical').length;
  const highCount = highlightedOpps.filter((o) => o.urgency === 'high').length;

  // REGLA SOLICITADA: Si no hay novedades críticas o destacadas, el reporte queda en estado vacío/informativo sin spam
  if (highlightedOpps.length === 0) {
    return {
      id: `digest-${dateStr}`,
      digestDate: dateStr,
      createdAt: new Date().toISOString(),
      hasCriticalUpdates: false,
      totalScanned,
      relevantCount: 0,
      criticalCount: 0,
      highCount: 0,
      opportunities: [],
      executiveBriefingText: `REPORTE DIARIO DE VIGILANCIA REGULATORIA Y PI - SPI AMÉRICAS\nFecha: ${dateStr}\n\nEstatus: Sin novedades críticas reportadas en la jornada.\n\nEl escaneo automático en las fuentes oficiales prioritarias (Colombia, México, Brasil, Argentina, Chile y Perú) no detectó nuevas disposiciones, plazos perentorios o reformas de alto impacto en las últimas 24 horas.\n\nNo se requieren gestiones comerciales ni preventivas extraordinarias el día de hoy.`
    };
  }

  // Generar resumen ejecutivo de alto nivel con Vertex AI Gemini
  let briefingText = '';
  try {
    const vertex = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    const model = vertex.getGenerativeModel({
      model: 'gemini-1.5-flash-002',
      generationConfig: { temperature: 0.2 }
    });

    const itemsSummary = highlightedOpps.map((opp, idx) => `
${idx + 1}. [${opp.country}] [${opp.entityName}] (${opp.urgency.toUpperCase()}) - ${opp.title}
- Tipo: ${opp.opportunityType === 'commercial_opportunity' ? 'Oportunidad Comercial SPI' : 'Gestión de Cumplimiento Mandatorio'}
- Resumen: ${opp.executiveSummary}
- Acción Clientes: ${opp.spiActionPlan.whatClientsNeedToDo}
- Oportunidad SPI: ${opp.spiActionPlan.howSpiCanHelp}
- Plazo límite: ${opp.transitionalDeadline || opp.effectiveDate || 'Inmediato'}
`).join('\n');

    const prompt = `
Eres el Director de Estrategia de SPI Américas. Redacta el Briefing Ejecutivo Diario para los socios y consultores de la firma.
Fecha: ${dateStr}
Se han detectado ${highlightedOpps.length} novedades normativas de alto impacto en LatAm.

NOVEDADES DETECTADAS:
${itemsSummary}

INSTRUCCIONES DE FORMATO:
- Debe ser directo, profesional y enfocado 100% en negocio (oportunidades de venta para SPI y riesgos para clientes).
- Incluye:
  1. Titular general del día.
  2. Resumen condensado por país/sector clave.
  3. Llamado a la acción para el equipo comercial y técnico de SPI.
`;

    const res = await model.generateContent(prompt);
    briefingText = res.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('Error generando texto con Vertex AI para digest diario:', error);
    briefingText = `Se han identificado ${highlightedOpps.length} novedades destacadas que requieren atención del equipo de SPI Américas. Revise el detalle de cada oportunidad en la plataforma.`;
  }

  return {
    id: `digest-${dateStr}`,
    digestDate: dateStr,
    createdAt: new Date().toISOString(),
    hasCriticalUpdates: true,
    totalScanned,
    relevantCount: highlightedOpps.length,
    criticalCount,
    highCount,
    opportunities: highlightedOpps.map((o) => ({
      id: o.id,
      title: o.title,
      country: o.country,
      entityName: o.entityName,
      urgency: o.urgency,
      opportunityType: o.opportunityType,
      executiveSummary: o.executiveSummary,
      actionNeeded: o.spiActionPlan.whatClientsNeedToDo,
      sourceUrl: o.sourceUrl
    })),
    executiveBriefingText: briefingText
  };
}
