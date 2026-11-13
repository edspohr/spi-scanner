import { OfficialSourceConfig } from './types';

export const OFFICIAL_SOURCES_REGISTRY: OfficialSourceConfig[] = [
  // --- COLOMBIA ---
  {
    id: 'co-invima-normatividad',
    name: 'INVIMA - Normatividad y Circulares Sanitarias',
    country: 'CO',
    entityName: 'INVIMA',
    category: 'sanitary',
    sectors: ['pharma', 'medical_devices', 'food_beverages', 'cosmetics_hygiene', 'supplements'],
    feedUrl: 'https://www.invima.gov.co/blog/sala-de-prensa-13',
    itemLinkPattern: '/blog/sala-de-prensa-13/.+',
    portalUrl: 'https://www.invima.gov.co/normatividad',
    frequencyHours: 6,
    isActive: true,
    notes: 'Incluye resoluciones sobre INVIMA Ágil, sistematización y salas especializadas.'
  },
  {
    id: 'co-sic-gaceta-pi',
    name: 'SIC - Gaceta de la Propiedad Industrial',
    country: 'CO',
    entityName: 'Superintendencia de Industria y Comercio (SIC)',
    category: 'intellectual_property',
    sectors: ['intellectual_property'],
    feedUrl: 'https://www.sic.gov.co/gaceta-propiedad-industrial',
    portalUrl: 'https://sipi.sic.gov.co',
    frequencyHours: 24,
    isActive: true,
    notes: 'Publicación quincenal/mensual de solicitudes de marcas, patentes y oposiciones.'
  },
  {
    id: 'co-minsalud-decretos',
    name: 'MinSalud Colombia - Decretos y Resoluciones de Salud',
    country: 'CO',
    entityName: 'Ministerio de Salud y Protección Social',
    category: 'sanitary',
    sectors: ['pharma', 'medical_devices', 'food_beverages'],
    feedUrl: 'https://www.minsalud.gov.co/Normativa/Paginas/Resoluciones.aspx',
    itemLinkPattern: '/Normatividad_Nuevo/.+|/Normativa/Resoluciones/.+',
    portalUrl: 'https://www.minsalud.gov.co/Normatividad_Nuevo',
    frequencyHours: 12,
    isActive: true
  },

  // --- MÉXICO ---
  {
    id: 'mx-cofepris-resoluciones',
    name: 'COFEPRIS - Resoluciones y Disposiciones Sanitarias',
    country: 'MX',
    entityName: 'COFEPRIS',
    category: 'sanitary',
    sectors: ['pharma', 'medical_devices', 'food_beverages', 'cosmetics_hygiene', 'supplements'],
    feedUrl: 'https://www.gob.mx/cofepris/archivo/articulos?idioma=es',
    itemLinkPattern: '/cofepris/articulos/.+',
    portalUrl: 'https://www.gob.mx/cofepris/documentos/normatividad-de-la-cofepris',
    frequencyHours: 6,
    isActive: true,
    notes: 'Actualizaciones de trámites, guías para registro de insumos para la salud y NOMs.'
  },
  {
    id: 'mx-impi-gaceta',
    name: 'IMPI - Gaceta de la Propiedad Industrial',
    country: 'MX',
    entityName: 'Instituto Mexicano de la Propiedad Industrial (IMPI)',
    category: 'intellectual_property',
    sectors: ['intellectual_property'],
    feedUrl: 'https://siga.impi.gob.mx/content/gaceta',
    portalUrl: 'https://www.gob.mx/impi',
    frequencyHours: 24,
    isActive: true,
    notes: 'Gacetas de marcas, lemas, avisos comerciales y patentes.'
  },
  {
    id: 'mx-dof-salud',
    name: 'Diario Oficial de la Federación (DOF) - Publicaciones',
    country: 'MX',
    entityName: 'Diario Oficial de la Federación (DOF)',
    category: 'official_gazette',
    sectors: ['pharma', 'medical_devices', 'food_beverages', 'intellectual_property'],
    feedUrl: 'https://dof.gob.mx/',
    itemLinkPattern: '/nota_detalle\\.php$',
    portalUrl: 'https://dof.gob.mx',
    frequencyHours: 12,
    isActive: true
  },

  // --- BRASIL ---
  {
    id: 'br-anvisa-rdc',
    name: 'ANVISA - Resoluções da Diretoria Colegiada (RDC) e Atos Normativos',
    country: 'BR',
    entityName: 'ANVISA',
    category: 'sanitary',
    sectors: ['pharma', 'medical_devices', 'food_beverages', 'cosmetics_hygiene', 'supplements'],
    feedUrl: 'https://www.gov.br/anvisa/pt-br/comunicacao/noticias',
    itemLinkPattern: '/(noticias-anvisa|comunicacao/noticias)/20[0-9]{2}/.+',
    portalUrl: 'https://www.gov.br/anvisa/pt-br/assuntos/regulamentacao/legislacao',
    frequencyHours: 6,
    isActive: true,
    notes: 'Normas RDC, consultas públicas e regras para registros na ANVISA.'
  },
  {
    id: 'br-inpi-rpi',
    name: 'INPI Brasil - Revista da Propriedade Industrial (RPI)',
    country: 'BR',
    entityName: 'Instituto Nacional da Propriedade Industrial (INPI Brasil)',
    category: 'intellectual_property',
    sectors: ['intellectual_property'],
    feedUrl: 'https://revistas.inpi.gov.br/rpi/',
    portalUrl: 'https://www.gov.br/inpi/pt-br',
    frequencyHours: 24,
    isActive: true
  },
  {
    id: 'br-dou-secao1',
    name: 'Diário Oficial da União (DOU) - Seção 1 (Atos Normativos)',
    country: 'BR',
    entityName: 'Imprensa Nacional do Brasil',
    category: 'official_gazette',
    sectors: ['pharma', 'medical_devices', 'food_beverages'],
    feedUrl: 'https://www.in.gov.br/leiturajornal?secao=dou1',
    portalUrl: 'https://www.in.gov.br',
    frequencyHours: 12,
    isActive: true
  },

  // --- ARGENTINA ---
  {
    id: 'ar-anmat-normativa',
    name: 'ANMAT - Disposiciones y Circulares Sanitarias',
    country: 'AR',
    entityName: 'ANMAT',
    category: 'sanitary',
    sectors: ['pharma', 'medical_devices', 'food_beverages', 'cosmetics_hygiene', 'supplements'],
    feedUrl: 'https://www.argentina.gob.ar/anmat/noticias',
    itemLinkPattern: '/noticias/.+',
    portalUrl: 'https://www.argentina.gob.ar/anmat/normativa',
    frequencyHours: 6,
    isActive: true,
    notes: 'Disposiciones INAME, INAL y Dirección de Tecnología Médica.'
  },
  {
    id: 'ar-inpi-boletin',
    name: 'INPI Argentina - Boletines de Marcas y Patentes',
    country: 'AR',
    entityName: 'Instituto Nacional de la Propiedad Industrial (INPI Argentina)',
    category: 'intellectual_property',
    sectors: ['intellectual_property'],
    feedUrl: 'https://portaltramites.inpi.gob.ar/boletines',
    portalUrl: 'https://www.argentina.gob.ar/inpi',
    frequencyHours: 24,
    isActive: true
  },

  // --- CHILE ---
  {
    id: 'cl-isp-resoluciones',
    name: 'ISP Chile - Resoluciones ANAMED y Dispositivos Médicos',
    country: 'CL',
    entityName: 'Instituto de Salud Pública (ISP Chile)',
    category: 'sanitary',
    sectors: ['pharma', 'medical_devices', 'cosmetics_hygiene'],
    feedUrl: 'https://www.ispch.cl/feed/',
    portalUrl: 'https://www.ispch.cl/normativa',
    frequencyHours: 6,
    isActive: true
  },
  {
    id: 'cl-inapi-marcas',
    name: 'INAPI Chile - Diario Oficial y Boletín Marcario',
    country: 'CL',
    entityName: 'Instituto Nacional de Propiedad Industrial (INAPI Chile)',
    category: 'intellectual_property',
    sectors: ['intellectual_property'],
    feedUrl: 'https://www.inapi.cl/sala-de-prensa/noticias',
    itemLinkPattern: '/sala-de-prensa/detalle-noticia/.+',
    portalUrl: 'https://www.inapi.cl',
    frequencyHours: 24,
    isActive: true
  },

  // --- PERÚ ---
  {
    id: 'pe-digemid-normas',
    name: 'DIGEMID / DIGESA - Normas Sanitarias y Resoluciones Directorales',
    country: 'PE',
    entityName: 'DIGEMID - MINSA',
    category: 'sanitary',
    sectors: ['pharma', 'medical_devices', 'food_beverages', 'cosmetics_hygiene'],
    feedUrl: 'https://www.digemid.minsa.gob.pe/webDigemid/normas-legales/',
    portalUrl: 'https://www.digemid.minsa.gob.pe',
    frequencyHours: 6,
    isActive: true
  },
  {
    id: 'pe-indecopi-gaceta',
    name: 'INDECOPI - Gaceta Electrónica de Propiedad Intelectual',
    country: 'PE',
    entityName: 'INDECOPI',
    category: 'intellectual_property',
    sectors: ['intellectual_property'],
    feedUrl: 'https://servicio.indecopi.gob.pe/gaceta/rss',
    portalUrl: 'https://www.indecopi.gob.pe',
    frequencyHours: 24,
    isActive: true
  },
  {
    id: 'pe-el-peruano',
    name: 'Diario Oficial El Peruano - Separata de Normas Legales',
    country: 'PE',
    entityName: 'El Peruano',
    category: 'official_gazette',
    sectors: ['pharma', 'medical_devices', 'food_beverages', 'intellectual_property'],
    feedUrl: 'https://elperuano.pe/rss/normaslegales.xml',
    portalUrl: 'https://elperuano.pe/normaslegales',
    frequencyHours: 12,
    isActive: true
  }
];
