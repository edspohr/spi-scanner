# SPI Regulatory Scanner

Radar de oportunidades regulatorias y de propiedad intelectual para SPI Américas en Colombia, México, Brasil, Argentina, Chile y Perú. Los equipos trabajan en vistas separadas; dirección dispone de una visión general. El repositorio contiene la aplicación web, backend Firebase, reglas de acceso, pruebas y documentación de operación.

Responsables: SPI Américas define prioridades y valida los hallazgos; Growth Buddies mantiene la implementación. La IA propone análisis que requieren revisión profesional antes de usarse como asesoría.

## Inicio local

Requisitos: Node.js **22.19.0** (`.nvmrc`), npm **10.9.3**, Java **21** para el emulador de reglas y Git. Usa un JDK Temurin 21 u otro compatible y configura `JAVA_HOME`.

```bash
nvm use
npm ci
npm --prefix client ci
npm --prefix functions ci
cp client/.env.example client/.env.local
# Completar .env.local con el proyecto de desarrollo autorizado.
npm --prefix client run dev
```

Vite muestra su URL local. La aplicación usa Firebase real del proyecto configurado; no incluye datos mock ni envía automáticamente el cliente a emuladores. El fallback de configuración actual es `spi-scanner` (producción): configura explícitamente desarrollo antes de probar escrituras. Los tests de reglas usan únicamente `demo-spi-scanner` en localhost. No hay staging aprovisionado en este repositorio.

Las variables `VITE_FIREBASE_*` se describen en [el ejemplo](client/.env.example). Son configuración del cliente web, no credenciales administrativas. Tokens, claves de servicio y archivos de entorno locales quedan fuera de Git. Vertex AI utiliza la identidad de la cuenta de servicio y `VERTEX_MODEL` / `VERTEX_LOCATION`; su contrato se documenta en [arquitectura](docs/architecture.md).

## Estructura y fuentes de verdad

| Ruta | Responsabilidad |
| --- | --- |
| `client/src/components/` | Autenticación, vistas por área, prioridades, gestión y diagnóstico de fuentes. |
| `client/src/services/` | SDK Firebase y llamadas autenticadas al backend. |
| `client/src/utils/` | Clasificación de áreas, plazos y filtros de prioridades. |
| `functions/src/sources/` | Catálogo dinámico, descarga HTTPS, extracción, diagnóstico y deduplicación. |
| `functions/src/ai/` | Contrato de análisis Gemini y digest. |
| `functions/src/index.ts` / `auth.ts` | Funciones publicadas y autorización de miembros verificados. |
| `firestore.rules` / `firestore.indexes.json` | Acceso por colección e índices. |
| `client/test/` / `functions/test/` | Pruebas locales con fixtures sintéticos y dependencias externas sustituidas. |
| `test/` | Reglas sobre emulador y evaluaciones deterministas del contrato de IA. |
| `functions/scripts/` | Herramientas operativas; algunas escriben producción y requieren autorización. |
| `docs/` | Política, ADR, deuda, operación y contexto de negocio. |

**Firestore es la fuente de verdad** para oportunidades, equipo, fuentes y reportes. `official_sources` gobierna el escaneo; `registry.ts` es un catálogo inicial para aprovisionamiento, no un fallback. `scan_runs` registra cobertura y errores; `processed_documents` evita repetir análisis exitosos. Una colección vacía permanece vacía. Véase [ADR-0005](docs/adr/0005-mvp-datos-reales-y-acceso.md).

## Validación

Desde la raíz, después de instalar los tres lockfiles:

```bash
npm run validate
```

| Control | Comando local | Job de CI |
| --- | --- | --- |
| Lint | `npm run lint` | `validate` |
| Tipos de cliente y backend | `npm run typecheck` | `validate` |
| Pruebas de comportamiento | `npm test` | `validate` |
| Build de cliente y backend | `npm run build` | `validate` |
| Evaluaciones locales de IA | `npm run eval:ai` | `validate` |
| Enlaces internos de documentación | `npm run check:docs` | `validate` |
| Reglas Firestore (Java 21, puerto 8085 libre) | `npm run test:rules` | `validate` |

CI instala con `npm ci` y ejecuta el mismo `npm run validate`, sin secretos de despliegue, llamadas a Gemini ni escrituras externas. Las variantes cubiertas incluyen ambos dominios autorizados, tres vistas por área, autorización anónima/verificada/no verificada y filtros de prioridad. No hay variantes por cliente: el MVP pertenece a una sola organización. Las reglas no prueban un aislamiento multicliente que el producto no implementa.

Las evaluaciones de IA verifican formato, clasificación válida, procedencia, citas presentes en el texto, deduplicación estable y fallback del digest. **No miden la calidad semántica de un modelo real.** La evaluación profesional y las pruebas reales de Vertex AI se mantienen separadas; consumen servicios y se ejecutan bajo el procedimiento de [operación](docs/operacion.md). Sus limitaciones están en [deuda técnica](docs/deuda-tecnica.md).

## Uso del MVP

- Acceso con Google o correo/contraseña para miembros con email verificado de `spiamericas.com` o `spohr.cl`. Recuperación de clave y reenvío de verificación desde login.
- [Visión general](https://spi-scanner.web.app/#radar), [Regulatorio](https://spi-scanner.web.app/#radar/regulatorio) y [PI](https://spi-scanner.web.app/#radar/pi). Son vistas de trabajo, no permisos distintos. PI conserva su área aunque afecte a industrias sanitarias.
- Prioridades: Todas, Requieren atención, Sin asignar y En gestión. Las cerradas solo aparecen en Todas. La atención incluye críticas/altas y próximos plazos informados a 30 días o menos, incluidos vencidos.
- El próximo plazo utiliza fechas válidas de transición/comentarios; la entrada en vigor no se presenta como vencimiento. Sin fecha informada no se inventa un plazo.
- Asignaciones, estado y notas se guardan en Firestore. Las fichas destacan acción SPI, responsable y plazo; el detalle conserva el análisis completo.
- [Fuentes de revisión](https://spi-scanner.web.app/#fuentes): alta, pausa, reactivación, baja y comprobación de lectura. Cada ficha diferencia lectura correcta, parcial, feed vacío, bloqueo, caída o formato no soportado. Comprobar lectura no invoca Gemini.
- HTML, RSS/Atom, API pública de ANVISA y PDFs con texto. El límite actual es 15 MB, primeras 20 páginas y 30.000 caracteres por documento. No hay OCR ni cobertura total garantizada.
- Escaneo diario a las 06:00 `America/Bogota`; escaneo manual por país y análisis de texto oficial bajo demanda. El límite de tiempo puede dejar fuentes pendientes. El reporte general incluye cobertura y errores, no una garantía de ausencia de cambios legales.

## Gobernanza

- [Política técnica](docs/politica-tecnica.md)
- [Instrucciones de agentes](AGENTS.md) y [Claude Code](CLAUDE.md)
- [Decisiones de arquitectura](docs/adr/README.md)
- [Deuda técnica](docs/deuda-tecnica.md)
- [Operación y recuperación](docs/operacion.md)
- [Backlog de producto](docs/backlog.md)
- [Índice de documentación](docs/README.md)
