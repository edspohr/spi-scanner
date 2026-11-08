# Matriz de Fuentes Oficiales — Núcleo LatAm (Fase 1)

Esta matriz documenta el catálogo de fuentes oficiales monitoreadas por el escáner, los tipos de actos administrativos publicados y sus particularidades técnicas de extracción.

---

## 🇨🇴 Colombia

| Entidad | Portal Oficial | Tipo de Acto / Contenido | Formato / Método | Frecuencia |
| :--- | :--- | :--- | :--- | :--- |
| **INVIMA** | `https://www.invima.gov.co/normatividad` | Resoluciones, Circulares Externas, Actas de Salas Especializadas (Medicamentos, Dispositivos, Alimentos). | RSS / HTML Scraper | Cada 6 horas |
| **MinSalud Colombia** | `https://www.minsalud.gov.co/Normatividad_Nuevo` | Decretos del Presidente, Resoluciones ministeriales generales de salud pública y tarifas. | RSS Feed XML | Cada 12 horas |
| **SIC (Propiedad Industrial)** | `https://sipi.sic.gov.co` | Gaceta de la Propiedad Industrial (Publicación quincenal de marcas, patentes y diseños en trámite). | PDF estructurado / SIPI | Cada 24 horas |
| **Diario Oficial Colombia** | `https://www.imprenta.gov.co` | Separata de leyes, decretos reglamentarios y actos de gobierno nacional. | Portal HTML / PDF | Diario |

---

## 🇲🇽 México

| Entidad | Portal Oficial | Tipo de Acto / Contenido | Formato / Método | Frecuencia |
| :--- | :--- | :--- | :--- | :--- |
| **COFEPRIS** | `https://www.gob.mx/cofepris` | Acuerdos de equivalencia, guías para trámites de insumos para la salud, avisos de comités consultivos. | Portal gob.mx / Artículos | Cada 6 horas |
| **IMPI** | `https://siga.impi.gob.mx/content/gaceta` | Gaceta de la Propiedad Industrial (Solicitudes de registro marcario, oposiciones, títulos concedidos). | Portal SIGA / Gaceta Electrónica | Diario |
| **Diario Oficial de la Federación (DOF)** | `https://www.dof.gob.mx` | Normas Oficiales Mexicanas (NOMs), reformas a la Ley General de Salud, decretos presidenciales. | RSS / Secciones DOF | Cada 12 horas |

---

## 🇧🇷 Brasil

| Entidad | Portal Oficial | Tipo de Acto / Contenido | Formato / Método | Frecuencia |
| :--- | :--- | :--- | :--- | :--- |
| **ANVISA** | `https://www.gov.br/anvisa/pt-br` | Resoluções da Diretoria Colegiada (RDCs), Instruções Normativas (INs), Consultas Públicas. | RSS Noticias / LegisWeb | Cada 6 horas |
| **INPI Brasil** | `https://revistas.inpi.gov.br/rpi/` | Revista da Propriedade Industrial (RPI - Marcas, Patentes, Desenhos Industriais). | PDF semanal / Portal RPI | Semanal |
| **Diário Oficial da União (DOU)** | `https://www.in.gov.br` | Seção 1 (Publicação de atos normativos e resoluções ministeriais de saúde). | Portal Imprensa Nacional | Cada 12 horas |

---

## 🇦🇷 Argentina

| Entidad | Portal Oficial | Tipo de Acto / Contenido | Formato / Método | Frecuencia |
| :--- | :--- | :--- | :--- | :--- |
| **ANMAT** | `https://www.argentina.gob.ar/anmat` | Disposiciones INAME (farma), INAL (alimentos), Tecnología Médica (dispositivos) y Cosméticos. | RSS Normativa / HTML | Cada 6 horas |
| **INPI Argentina** | `https://portaltramites.inpi.gob.ar/boletines` | Boletines de Marcas y Patentes (oposiciones y publicaciones de solicitudes). | Portal Trámites INPI | Diario |
| **Boletín Oficial de la República Argentina** | `https://www.boletinoficial.gob.ar` | Primera Sección (Legislación y Avisos Oficiales del Poder Ejecutivo). | Portal BORA | Diario |

---

## 🇨🇱 Chile

| Entidad | Portal Oficial | Tipo de Acto / Contenido | Formato / Método | Frecuencia |
| :--- | :--- | :--- | :--- | :--- |
| **ISP Chile** | `https://www.ispch.cl/normativa` | Resoluciones Exentas ANAMED, aranceles sanitarios, directrices de bioequivalencia y dispositivos. | RSS / Portal ISP | Cada 6 horas |
| **INAPI Chile** | `https://www.inapi.cl/boletin-oficial` | Boletín de Marcas del Diario Oficial (publicación de solicitudes y plazos de oposición). | Portal INAPI / Diario Oficial | Semanal |
| **Diario Oficial de Chile** | `https://www.diarioficial.cl` | Decretos supremos y resoluciones de salud del Ministerio de Salud (MINSAL). | Portal Diario Oficial | Diario |

---

## 🇵🇪 Perú

| Entidad | Portal Oficial | Tipo de Acto / Contenido | Formato / Método | Frecuencia |
| :--- | :--- | :--- | :--- | :--- |
| **DIGEMID / DIGESA** | `https://www.digemid.minsa.gob.pe` | Resoluciones Directorales, Decretos Supremos MINSA, manuales de buenas prácticas de almacenamiento y farmacovigilancia. | Portal DIGEMID / RSS | Cada 6 horas |
| **INDECOPI** | `https://servicio.indecopi.gob.pe/gaceta/` | Gaceta Electrónica de Propiedad Intelectual (Dirección de Signos Distintivos y Patentes). | Gaceta Electrónica | Diario |
| **Diario Oficial El Peruano** | `https://elperuano.pe/normaslegales` | Separata de Normas Legales del Estado Peruano. | RSS / Buscador El Peruano | Diario |

---

## ⚠️ Estrategias de Resiliencia ante Fallos en Portales Gubernamentales

1. **Protección contra Timeouts & Sitios Caídos:** Los portales de agencias sanitarias en LatAm experimentan caídas periódicas. El crawler implementa backoff exponencial y reintentos (máximo 3) sin bloquear el procesamiento del resto de las fuentes.
2. **Gestión de CAPTCHAs y Bloqueos:** En sitios donde se presenten barreras anti-bot o páginas dinámicas pesadas (ASP.NET), la ingesta utiliza conectores basados en Playwright / Puppeteer headless desacoplados vía Cloud Functions.
3. **Control de Duplicados:** Cada documento extraído genera un hash SHA-256 de su contenido y número de resolución, impidiendo que el motor de Gemini re-analice normas ya procesadas.
