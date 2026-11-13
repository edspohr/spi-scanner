# 0005 — MVP con datos reales, catálogo dinámico y acceso verificado

- Estado — Aceptada
- Fecha — 2026-11-13
- Relacionados — Reemplaza parcialmente ADR-0001 (runtime/modelo), ADR-0002 (alcance del reporte) y ADR-0004 (catálogo y deduplicación). Conserva la taxonomía de ADR-0003.

## Contexto

Las pruebas del MVP detectaron errores de login, sustitución de fallos por datos mock, fuentes que no entregaban texto y divergencias entre documentación y código. SPI necesita trabajo separado para Regulatorio/PI y una visión general para dirección. Los cambios de autenticación, ingesta y UI fueron solicitados y publicados durante la puesta en marcha del 12 y 13 de noviembre.

## Decisión

1. Firestore gobierna oportunidades, directorio, fuentes y reportes. El frontend muestra vacíos y errores reales; no hay datos ficticios de reserva. `registry.ts` sirve solo al aprovisionamiento inicial.
2. Firebase Auth admite Google y correo/contraseña. Clientes y callables exigen correo verificado de `spiamericas.com` o `spohr.cl`. El catálogo solo se modifica mediante un callable validado. No hay RBAC por vertical ni App Check impuesto.
3. Backend Node 22; Vertex AI configurable, `gemini-3.5-flash` en `global` por defecto. Validación estructural con Zod y eliminación de citas que no aparecen en el texto. No se promete determinismo ni fidelidad semántica completa.
4. Descarga HTTPS con resolución pública y conexión fijada, preferencia IPv4 y reintento transitorio. RSS/Atom, HTML, API pública de ANVISA y PDF textual; límites actuales: 15 MB, 20 páginas y 30.000 caracteres.
5. Fallos de un documento no descartan los válidos de la misma fuente. `health` describe extracción; `scan_runs` describe cobertura y análisis. El presupuesto de tiempo puede dejar fuentes pendientes.
6. Identidad estable por URL/fuente y `create()` de oportunidad; deduplicación de análisis exitosos, no hash de contenido. Los errores quedan reintentables. Las bajas son lógicas y preservan hallazgos.
7. El digest destaca solo urgencias crítica/alta entre oportunidades recientes y declara cobertura/errores. No demuestra ausencia de cambios legales ni envía correo automáticamente.
8. La etiqueta `intellectual_property` determina PI aunque haya industrias sanitarias afectadas. Las vistas y prioridades no cambian acceso ni datos.

Responsables de los contratos: mantenimiento técnico para implementación y SPI para criterios regulatorios y revisión humana.

## Alternativas consideradas

- Mantener mocks ante fallos: oculta indisponibilidad y produce métricas engañosas.
- Catálogo exclusivamente en código: impide gestionar fuentes desde la UI.
- Imponer permisos por vertical sin matriz acordada: podría impedir la vista general y asignaciones legítimas.
- Declarar cobertura total o procesar PDFs completos sin límites: no corresponde a las capacidades ni presupuesto vigentes.

## Consecuencias

Se puede distinguir una fuente vacía de una fallida y conservar trabajo al reintentar. Las reglas deben probarse sobre emulador y el contrato de IA con datos sintéticos. Persisten limitaciones de cobertura, tiempo, PDFs, SDK, deduplicación y evaluación semántica, registradas en [deuda](../deuda-tecnica.md). El [runbook](../operacion.md) documenta destinos, autorización y recuperación; rollback de código no revierte datos.
