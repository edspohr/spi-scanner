import { RegulatoryOpportunity, SpiTeamMember, DailyDigest } from '../types';

export const INITIAL_SPI_TEAM: SpiTeamMember[] = [
  {
    id: 'spi-user-1',
    name: 'Dra. Laura Gómez',
    email: 'laura.gomez@spiamericas.com',
    role: 'Líder Regulatorio Farma & Dispositivos (Colombia & Región Andina)',
    specialty: ['pharma', 'medical_devices']
  },
  {
    id: 'spi-user-2',
    name: 'Carlos Méndez',
    email: 'carlos.mendez@spiamericas.com',
    role: 'Director de Propiedad Intelectual & Marcas LatAm',
    specialty: ['intellectual_property']
  },
  {
    id: 'spi-user-3',
    name: 'Valentina Restrepo',
    email: 'valentina.restrepo@spiamericas.com',
    role: 'Especialista en Alimentos, Bebidas & Cosméticos',
    specialty: ['food_beverages', 'cosmetics_hygiene', 'supplements']
  },
  {
    id: 'spi-user-4',
    name: 'Rodrigo Silva',
    email: 'rodrigo.silva@spiamericas.com',
    role: 'Coordinador de Asociados Cono Sur & Brasil',
    specialty: ['pharma', 'medical_devices', 'food_beverages']
  }
];

export const INITIAL_OPPORTUNITIES: RegulatoryOpportunity[] = [
  {
    id: 'opp-co-invima-agil-2026',
    documentId: 'doc-invima-res-2026-892',
    title: 'Migración y Sistematización Obligatoria a "INVIMA Ágil" para Registros Sanitarios de Alimentos y Dispositivos',
    country: 'CO',
    entityName: 'INVIMA',
    sectors: ['food_beverages', 'medical_devices'],
    sourceUrl: 'https://www.invima.gov.co/normatividad/resolucion-invima-agil-2026',
    publicationDate: '2026-10-28',
    documentNumber: 'Circular Externa 014-2026',
    isRelevant: true,
    opportunityType: 'commercial_opportunity',
    urgency: 'critical',
    executiveSummary: 'El INVIMA formalizó la obligatoriedad de la "sistematización" (traslado estructurado de datos de expedientes existentes a la nueva plataforma INVIMA Ágil) como requisito sine qua non para radicaciones de renovación y modificaciones técnicas. Los tiempos de procesamiento han aumentado a 30-45 días debido al volumen manual de carga.',
    detailedAnalysis: 'La medida impacta directamente a titulares extranjeros y locales cuyos registros vencen en los próximos 6 meses. Si no se inicia la sistematización con antelación, cualquier trámite de modificación de fórmula, empaque o renovación quedará suspendido automáticamente en ventanilla digital.',
    effectiveDate: '2026-11-01',
    transitionalDeadline: '2026-12-15',
    daysRemainingForAction: 38,
    spiActionPlan: {
      whatClientsNeedToDo: 'Auditar su portafolio de registros sanitarios vigentes en Colombia, compilar la documentación técnica en el estándar estructurado de INVIMA Ágil y radicar la sistematización de manera preventiva antes de necesitar una modificación urgente.',
      howSpiCanHelp: 'SPI ofrece el servicio de "Sistematización Preventiva & Depuración de Dossiers INVIMA Ágil": extracción de datos de resoluciones históricas, validación de coherencia técnica, carga digital en plataforma y seguimiento hasta expedición de constancia.',
      affectedClientProfile: 'Fabricantes extranjeros de alimentos y dispositivos médicos que comercializan en Colombia a través de distribuidores o con registros propios.',
      recommendedServiceOffering: 'Pack de Migración y Blindaje INVIMA Ágil (por lote de registros)',
      estimatedEffortHours: 25
    },
    citations: [
      {
        articleOrSection: 'Artículo 4 - Requisito de Sistematización Previa',
        quoteText: 'Ninguna solicitud de modificación sustancial o renovación ordinaria podrá ser radicada en el sistema sin que el registro sanitario cuente con su ficha técnica plenamente sistematizada y homologada en el aplicativo INVIMA Ágil.',
        interpretation: 'Establece un bloqueo operativo automático en plataforma si no se completó la sistematización previa.'
      },
      {
        articleOrSection: 'Parágrafo 2 - Plazos de Transición',
        quoteText: 'Se concede un plazo de gracia improrrogable que culminará el 15 de diciembre de 2026 para que los titulares adelanten el saneamiento informativo.',
        interpretation: 'Fecha límite estricta que exige actuar de inmediato durante el mes en curso.'
      }
    ],
    status: 'en_evaluacion',
    assignedTo: {
      id: 'spi-user-1',
      name: 'Dra. Laura Gómez',
      email: 'laura.gomez@spiamericas.com',
      role: 'Líder Regulatorio Farma & Dispositivos'
    },
    assignedAt: '2026-10-29T14:30:00Z',
    lastUpdated: '2026-11-01T10:15:00Z',
    managementNotes: [
      {
        author: 'Dra. Laura Gómez',
        date: '2026-10-30T11:00:00Z',
        comment: 'Identificamos 12 clientes de dispositivos médicos con registros por vencer en Q1-2027. Preparando propuesta comercial de migración en bloque.'
      }
    ]
  },
  {
    id: 'opp-mx-cofepris-nom241-2026',
    documentId: 'doc-cofepris-nom241-rev',
    title: 'Actualización de Criterios de Equivalencia y Registro Homologado para Insumos de la Salud en COFEPRIS',
    country: 'MX',
    entityName: 'COFEPRIS',
    sectors: ['medical_devices', 'pharma'],
    sourceUrl: 'https://www.gob.mx/cofepris/acciones-y-programas/acuerdo-equivalencias-2026',
    publicationDate: '2026-11-02',
    documentNumber: 'Acuerdo DOF 02/11/2026',
    isRelevant: true,
    opportunityType: 'commercial_opportunity',
    urgency: 'high',
    executiveSummary: 'COFEPRIS emitió una nueva resolución simplificando los trámites de registro sanitario para dispositivos médicos clase II y III provenientes de EE. UU. (FDA 510k/PMA), Unión Europea (MDR CE) y Japón, reduciendo los tiempos de respuesta de 180 a 45 días hábiles si se presenta el expediente bajo el nuevo formato digital unificado.',
    detailedAnalysis: 'La apertura del carril rápido por equivalencia representa una ventana estratégica para empresas extranjeras que tenían demorados sus lanzamientos en México. Exige que el titular cuente con un representante legal calificado en México y traducción pericial de rotulado.',
    effectiveDate: '2026-12-01',
    transitionalDeadline: '2027-02-28',
    daysRemainingForAction: 112,
    spiActionPlan: {
      whatClientsNeedToDo: 'Evaluar el catálogo de productos con certificación FDA/CE que aún no han ingresado a México y armar el dossier simplificado conforme al nuevo índice de COFEPRIS.',
      howSpiCanHelp: 'Servicio "Fast-Track México": SPI asume la representación regulatoria local (Hosting de Registro), adecuación del dossier técnico y radicación bajo la vía de equivalencia homologada.',
      affectedClientProfile: 'Empresas biomédicas globales sin filial física en México que buscan comercializar a través de distribuidores locales independientes.',
      recommendedServiceOffering: 'Representación Legal & Fast-Track COFEPRIS por Equivalencia'
    },
    citations: [
      {
        articleOrSection: 'Numeral 3.1 - Vía de Reconocimiento Mutuo',
        quoteText: 'Las solicitudes que cuenten con certificación de comercialización libre expedida por agencias de alta vigilancia sanitaria reconocidas serán dictaminadas en un plazo máximo de cuarenta y cinco días hábiles.',
        interpretation: 'Permite reducir a una cuarta parte el tiempo de llegada al mercado mexicano.'
      }
    ],
    status: 'nueva',
    lastUpdated: '2026-11-03T09:00:00Z'
  },
  {
    id: 'opp-co-sic-marcas-clase5-2026',
    documentId: 'doc-sic-gaceta-789-2026',
    title: 'Gaceta 789 de la SIC: Publicación de Signos Distintivos con Conflicto Marcario en Productos Farmacéuticos (Clase 5)',
    country: 'CO',
    entityName: 'Superintendencia de Industria y Comercio (SIC)',
    sectors: ['intellectual_property', 'pharma'],
    sourceUrl: 'https://sipi.sic.gov.co/gaceta/789/signos-distintivos',
    publicationDate: '2026-11-04',
    documentNumber: 'Gaceta Oficial No. 789',
    isRelevant: true,
    opportunityType: 'mandatory_compliance',
    urgency: 'critical',
    executiveSummary: 'Se publicaron 14 nuevas solicitudes de registro marcario en clase 5 internacional que presentan alta similitud fonética y gráfica con marcas de medicamentos cardiovasculares y analgésicos protegidos por clientes de SPI. El plazo perentorio de 30 días hábiles para radicar oposición legal ya está corriendo.',
    detailedAnalysis: 'Si no se formula la oposición formal ante la Dirección de Signos Distintivos dentro del término de ley, el tercero podría obtener el registro, lo que forzaría posteriores demandas de nulidad sustancialmente más costosas y complejas.',
    effectiveDate: '2026-11-04',
    transitionalDeadline: '2026-12-18',
    daysRemainingForAction: 28,
    spiActionPlan: {
      whatClientsNeedToDo: 'Revisar la alerta de coincidencia marcaria enviada por SPI y autorizar de inmediato el poder para la presentación de la oposición formal.',
      howSpiCanHelp: 'SPI formula y radica el escrito de oposición motivado con pruebas de confundibilidad, uso previo y notoriedad de la marca del cliente.',
      affectedClientProfile: 'Laboratorios titulares de marcas de prescripción y OTC en Colombia y la Comunidad Andina.',
      recommendedServiceOffering: 'Defensa Marcaria & Oposición ante la SIC'
    },
    citations: [
      {
        articleOrSection: 'Decisión 486 de la CAN, Artículo 146',
        quoteText: 'Dentro de los treinta días siguientes a la fecha de la publicación, quien tenga legítimo interés podrá presentar motivada oposición contra el registro solicitado.',
        interpretation: 'Término fatal e improrrogable para impedir el registro de la marca confusa.'
      }
    ],
    status: 'asignada',
    assignedTo: {
      id: 'spi-user-2',
      name: 'Carlos Méndez',
      email: 'carlos.mendez@spiamericas.com',
      role: 'Director de Propiedad Intelectual & Marcas LatAm'
    },
    assignedAt: '2026-11-05T08:15:00Z',
    lastUpdated: '2026-11-05T12:00:00Z'
  },
  {
    id: 'opp-br-anvisa-rdc-samd-2026',
    documentId: 'doc-anvisa-rdc-samd-2026',
    title: 'ANVISA RDC: Nuevos Requisitos de Ciberseguridad y Validación Clínica para Software como Dispositivo Médico (SaMD)',
    country: 'BR',
    entityName: 'ANVISA',
    sectors: ['medical_devices'],
    sourceUrl: 'https://www.gov.br/anvisa/pt-br/assuntos/regulamentacao/legislacao/rdc-samd-2026',
    publicationDate: '2026-10-25',
    documentNumber: 'RDC Nº 912/2026',
    isRelevant: true,
    opportunityType: 'mandatory_compliance',
    urgency: 'high',
    executiveSummary: 'ANVISA formalizó la exigencia de dossiê de cibersegurança e evidências de validação clínica local para aplicativos e softwares que auxiliam em diagnóstico ou terapêutica médica (SaMD). Aplica tanto para novos registros quanto para renovações em território brasileiro.',
    detailedAnalysis: 'La norma establece que los fabricantes de software médico deben contar con un sistema de gestión de riesgos conforme a la ISO 14971 y auditorías de penetración de seguridad actualizadas semestralmente.',
    effectiveDate: '2027-01-01',
    transitionalDeadline: '2027-06-30',
    daysRemainingForAction: 234,
    spiActionPlan: {
      whatClientsNeedToDo: 'Mapear todos los algoritmos de software médico comercializados en Brasil y preparar el reporte de conformidad de ciberseguridad.',
      howSpiCanHelp: 'SPI coordina con sus asociados en São Paulo la auditoría de brechas regulatorias y la adecuación del expediente ante ANVISA.',
      affectedClientProfile: 'Desarrolladores internacionales de plataformas de salud digital, telemedicina y dispositivos diagnósticos conectados.',
      recommendedServiceOffering: 'Auditoría de Brecha & Regularización SaMD ANVISA'
    },
    citations: [
      {
        articleOrSection: 'Artigo 12 - Requisitos de Cibersegurança',
        quoteText: 'O fabricante deve demonstrar que o software possui barreiras de proteção contra ameaças cibernéticas e integridade dos dados clínicos transmitidos.',
        interpretation: 'Obliga a certificar protocolos de cifrado y auditorías de código.'
      }
    ],
    status: 'nueva',
    lastUpdated: '2026-10-26T16:00:00Z'
  },
  {
    id: 'opp-ar-anmat-suplementos-2026',
    documentId: 'doc-anmat-disp-884-2026',
    title: 'ANMAT: Actualización de Límites Máximos de Micronutrientes y Rotulado de Alérgenos en Suplementos Dietarios',
    country: 'AR',
    entityName: 'ANMAT - INAL',
    sectors: ['supplements', 'food_beverages'],
    sourceUrl: 'https://www.argentina.gob.ar/anmat/normativa/disposicion-inal-884-2026',
    publicationDate: '2026-10-15',
    documentNumber: 'Disposición ANMAT 884/2026',
    isRelevant: true,
    opportunityType: 'mandatory_compliance',
    urgency: 'medium',
    executiveSummary: 'El Instituto Nacional de Alimentos (INAL) ajustó las tablas de ingesta diaria recomendada (IDR) y límites superiores tolerables para vitaminas y minerales en suplementos dietarios importados. Productos con formulaciones superiores deberán tramitarse como medicamentos o reformularse.',
    detailedAnalysis: 'Afecta a importadores de suplementos procedentes de Norteamérica cuyas concentraciones de vitamina D3 y zinc superan el nuevo tope argentino.',
    effectiveDate: '2027-03-01',
    transitionalDeadline: '2027-08-31',
    daysRemainingForAction: 296,
    spiActionPlan: {
      whatClientsNeedToDo: 'Revisar la tabla nutricional de sus SKUs comercializados en Argentina para identificar excesos de formulación frente al nuevo umbral.',
      howSpiCanHelp: 'SPI realiza la revisión de fórmula, gestión de reformulación o trámite de modificación de rótulo ante INAL/ANMAT.',
      affectedClientProfile: 'Marcas de suplementos deportivos y multivitamínicos importados.',
      recommendedServiceOffering: 'Revisión Técnica de Fórmulas & Rótulos INAL'
    },
    citations: [
      {
        articleOrSection: 'Artículo 2 - Límites Máximos',
        quoteText: 'Los suplementos dietarios cuya concentración de nutrientes supere el 100% del nivel máximo fijado en el Anexo I perderán su carácter de alimento y deberán regirse por la Ley de Medicamentos 16.463.',
        interpretation: 'Riesgo inminente de reclasificación forzosa a medicamento si no se reformula.'
      }
    ],
    status: 'nueva',
    lastUpdated: '2026-10-16T11:20:00Z'
  },
  {
    id: 'opp-cl-isp-arancel-2026',
    documentId: 'doc-isp-arancel-res-44',
    title: 'ISP Chile: Aprobación del Nuevo Tarifario Oficial para Registro de Medicamentos y Modificaciones ANAMED',
    country: 'CL',
    entityName: 'ISP Chile',
    sectors: ['pharma', 'cosmetics_hygiene'],
    sourceUrl: 'https://www.ispch.cl/anamed/arancel-prestaciones-2026',
    publicationDate: '2026-10-20',
    documentNumber: 'Resolución Exenta 442/2026',
    isRelevant: true,
    opportunityType: 'commercial_opportunity',
    urgency: 'medium',
    executiveSummary: 'El Instituto de Salud Pública de Chile fijó el incremento semestral de tasas para prestaciones sanitarias y solicitudes de bioequivalencia in vitro, con entrada en vigencia el 1 de enero de 2027. Radicar trámites antes del 31 de diciembre representa un ahorro del 18% en aranceles estatales para los clientes.',
    detailedAnalysis: 'La resolución crea una ventana de oportunidad comercial inmediata para incentivar a clientes con proyectos de registro pendientes en Chile a radicar antes del cierre de año fiscal.',
    effectiveDate: '2027-01-01',
    transitionalDeadline: '2026-12-31',
    daysRemainingForAction: 54,
    spiActionPlan: {
      whatClientsNeedToDo: 'Adelantar el pago de aranceles y la presentación formal de expedientes pendientes antes del cambio tarifario.',
      howSpiCanHelp: 'Campaña de radicación temprana de expedientes en Chile coordinada por SPI para optimizar costos de tasas.',
      affectedClientProfile: 'Laboratorios extranjeros con portafolios en proceso de expansión hacia Chile.',
      recommendedServiceOffering: 'Gestión Acelerada de Radicación ANAMED Chile'
    },
    citations: [
      {
        articleOrSection: 'Artículo 1 - Vigencia del Reajuste',
        quoteText: 'Las tarifas actualizadas regirán a contar del primer día hábil del mes de enero de 2027 para todas las solicitudes ingresadas a partir de esa fecha.',
        interpretation: 'Trámites pagados y radicados antes del 31 de diciembre mantienen el arancel anterior.'
      }
    ],
    status: 'en_evaluacion',
    assignedTo: {
      id: 'spi-user-4',
      name: 'Rodrigo Silva',
      email: 'rodrigo.silva@spiamericas.com',
      role: 'Coordinador Cono Sur'
    },
    assignedAt: '2026-10-22T09:00:00Z',
    lastUpdated: '2026-10-22T10:00:00Z'
  },
  {
    id: 'opp-pe-digemid-bpf-2026',
    documentId: 'doc-digemid-ds-012-2026',
    title: 'DIGEMID Perú: Plazo Improrrogable para Certificación de Buenas Prácticas de Farmacovigilancia en Droguerías',
    country: 'PE',
    entityName: 'DIGEMID - MINSA',
    sectors: ['pharma', 'medical_devices'],
    sourceUrl: 'https://www.digemid.minsa.gob.pe/normatividad/ds-012-2026-minsa',
    publicationDate: '2026-10-18',
    documentNumber: 'Decreto Supremo 012-2026-SA',
    isRelevant: true,
    opportunityType: 'mandatory_compliance',
    urgency: 'high',
    executiveSummary: 'MINSA y DIGEMID establecieron un cronograma estricto para que todos los titulares de registros y droguerías importadoras certifiquen sus sistemas de farmacovigilancia y tecnovigilancia mediante auditoría formal de la autoridad sanitaria.',
    detailedAnalysis: 'El incumplimiento de este requisito acarrea el cierre temporal del establecimiento y la suspensión automática de despacho de aduanas para los productos médicos importados.',
    effectiveDate: '2026-11-01',
    transitionalDeadline: '2027-01-31',
    daysRemainingForAction: 84,
    spiActionPlan: {
      whatClientsNeedToDo: 'Realizar una pre-auditoría interna de su sistema de gestión de farmacovigilancia y actualizar sus Procedimientos Operativos Estándar (POEs).',
      howSpiCanHelp: 'Servicio de Pre-Auditoría & Acompañamiento en Certificación DIGEMID a través del asociado local de SPI en Lima.',
      affectedClientProfile: 'Droguerías y distribuidores de fármacos y dispositivos médicos en Perú.',
      recommendedServiceOffering: 'Auditoría & Certificación de Farmacovigilancia DIGEMID'
    },
    citations: [
      {
        articleOrSection: 'Artículo 8 - Medidas de Seguridad Sanitaria',
        quoteText: 'Las droguerías que al vencimiento del plazo señalado no cuenten con la constancia de inicio o aprobación de la certificación de BPFV serán pasibles de suspensión de actividades.',
        interpretation: 'Riesgo crítico de parálisis operativa y de importación.'
      }
    ],
    status: 'nueva',
    lastUpdated: '2026-10-19T15:00:00Z'
  }
];

export const INITIAL_DAILY_DIGEST: DailyDigest = {
  id: 'digest-2026-11-07',
  digestDate: '2026-11-07',
  createdAt: '2026-11-07T06:00:00Z',
  hasCriticalUpdates: true,
  totalScanned: 24,
  relevantCount: 2,
  criticalCount: 2,
  highCount: 0,
  opportunities: [
    {
      id: 'opp-co-invima-agil-2026',
      title: 'Migración y Sistematización Obligatoria a "INVIMA Ágil" para Registros Sanitarios',
      country: 'CO',
      entityName: 'INVIMA',
      urgency: 'critical',
      opportunityType: 'commercial_opportunity',
      executiveSummary: 'INVIMA formalizó la obligatoriedad de sistematizar expedientes existentes antes de renovar o modificar registros. Los trámites tardan de 30 a 45 días.',
      actionNeeded: 'Compilar datos de expedientes existentes y radicar la sistematización preventiva de clientes.',
      sourceUrl: 'https://www.invima.gov.co/normatividad/resolucion-invima-agil-2026'
    },
    {
      id: 'opp-co-sic-marcas-clase5-2026',
      title: 'Gaceta 789 de la SIC: Publicación de Signos Distintivos con Conflicto Marcario en Clase 5',
      country: 'CO',
      entityName: 'SIC',
      urgency: 'critical',
      opportunityType: 'mandatory_compliance',
      executiveSummary: 'Se publicaron 14 solicitudes con alta similitud marcaria para productos farmacéuticos. Plazo perentorio de 30 días para oposición.',
      actionNeeded: 'Autorizar poder y radicar escrito de oposición formal con pruebas de confundibilidad.',
      sourceUrl: 'https://sipi.sic.gov.co/gaceta/789/signos-distintivos'
    }
  ],
  executiveBriefingText: `BRIEFING EJECUTIVO DE VIGILANCIA REGULATORIA Y PI - SPI AMÉRICAS
Fecha: 07 de Noviembre de 2026

RESUMEN GENERAL:
La jornada de hoy presenta dos contingencias críticas que demandan movilización inmediata del equipo de SPI en Colombia:
1. INVIMA (Alimentos y Dispositivos): La confirmación de la obligatoriedad de INVIMA Ágil para trámites posteriores genera una oportunidad comercial prioritaria para vender el servicio de "Sistematización Preventiva". Se sugiere contactar a los 12 clientes identificados con vencimientos en 2027.
2. SIC (Propiedad Intelectual): Publicación en Gaceta 789 de signos con riesgo de dilución y confusión en clase 5 farmacéutica. Corren 28 días restantes para radicar las oposiciones.

PRIORIDADES DE ACCIÓN SPI:
- Dra. Laura Gómez: Emitir cotizaciones del paquete de migración a INVIMA Ágil a laboratorios extranjeros.
- Carlos Méndez: Presentar las objeciones marcarias ante la SIC antes del 18 de diciembre.`
};
