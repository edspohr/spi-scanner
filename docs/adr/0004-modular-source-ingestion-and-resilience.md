# ADR-0004: Ingesta Modular y Resiliencia en Fuentes Oficiales LatAm

> Documento histórico: [ADR-0005](0005-mvp-datos-reales-y-acceso.md) reemplaza parcialmente esta decisión y documenta el contrato vigente.

## Estado
**Aceptado**

## Fecha
2026-11-07

## Contexto
El panorama tecnológico de las entidades gubernamentales en Latinoamérica es altamente heterogéneo e inestable:
- Algunas agencias sanitarias (como MinSalud o DOF) disponen de canales RSS actualizados.
- Otras (como INVIMA, ANVISA o ISP) utilizan portales dinámicos con buscadores internos y caídas periódicas de servidor.
- Las oficinas de Propiedad Intelectual (como SIC, IMPI o INPI) publican gacetas oficiales en PDFs periódicos (quincenales o semanales).

Un diseño monolítico donde un solo fallo de conexión en un portal interrumpiera el escaneo de toda la región dejaría sin cobertura a SPI.

## Decisión
Se implementó un patrón de arquitectura modular y desacoplada:

1. **Catálogo Declarativo de Fuentes (`registry.ts`):** Cada fuente es un objeto de configuración independiente con su propia URL de consulta, frecuencia de escaneo, categoría y sectores asignados.
2. **Esquema Normalizado (`RawRegulatoryDocument`):** La capa de scraping traduce cualquier formato de entrada (HTML, XML, texto de PDF) a una estructura unificada antes de enviarla al analizador de IA.
3. **Aislamiento de Fallos:** El escáner ejecuta las solicitudes de forma independiente. Si un portal gubernamental (ej. DIGEMID en Perú) responde con timeout o error 503, se registra el incidente y el proceso continúa sin interrupción para Colombia, México, Brasil, etc.
4. **Deduplicación por Hash de Contenido:** Para no incurrir en costos redundantes de tokens de Vertex AI, cada documento procesado almacena un identificador y hash. Documentos idénticos no vuelven a ejecutarse en el modelo generativo.

## Consecuencias

### Positivas
- **Extensibilidad Inmediata:** Agregar un nuevo país (ej. Ecuador con ARCSA o Costa Rica con Ministerio de Salud) solo requiere agregar un nuevo objeto en `OFFICIAL_SOURCES_REGISTRY`.
- **Tolerancia a Fallos:** La fragilidad de los servidores gubernamentales no compromete la disponibilidad global del sistema.
- **Control de Costos de IA:** Se evita enviar a Vertex AI documentos previamente evaluados.

### Compromisos (*Trade-offs*)
- Para portales protegidos por Cloudflare avanzado o CAPTCHAs dinámicos, se requerirá desplegar conectores basados en Playwright / Puppeteer en workers desacoplados en Cloud Run (documentado en `docs/technical-debt.md` como DEBT-002).
