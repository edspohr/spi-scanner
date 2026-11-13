# Documentación de SPI Regulatory Scanner

El [README raíz](../README.md) contiene instalación, módulos, comandos de validación y fuentes de verdad.

| Documento | Alcance |
| --- | --- |
| [Política técnica](politica-tecnica.md) | Estándar compartido para personas, Codex y Claude Code. |
| [Arquitectura](architecture.md) | Contratos vigentes de datos, acceso, fuentes e IA. |
| [ADR](adr/README.md) | Decisiones aceptadas, historial y plantilla. |
| [Deuda técnica](deuda-tecnica.md) | Riesgos verificables, responsables y condiciones de cierre. |
| [Operación](operacion.md) | Entornos, despliegue, datos, recuperación e incidentes. |
| [Backlog](backlog.md) | Ideas de producto, separadas de deuda técnica. |
| [Dominio regulatorio](regulatory-domain.md) | Sectores y taxonomía de negocio. |
| [Matriz inicial de fuentes](sources-matrix.md) | Referencia de agencias; no sustituye el catálogo vivo de Firestore. |
| [Diagnóstico de fuentes](source-diagnostics-2026-11-13.md) | Evidencia fechada, no estado en tiempo real. |

Una decisión durable requiere un nuevo ADR. Una limitación técnica comprobada se registra en deuda; una nueva función se registra en backlog. El runbook debe acompañar cambios que afecten la operación. No se actualiza `registry.ts` como requisito para agregar una fuente desde la aplicación: el catálogo vivo es `official_sources` ([ADR-0005](adr/0005-mvp-datos-reales-y-acceso.md)).
