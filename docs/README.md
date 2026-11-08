# Documentación Técnica & de Negocio — SPI Regulatory Scanner

Este directorio contiene la documentación viva del proyecto **SPI Regulatory Scanner & Opportunity Radar**. El objetivo es preservar el contexto de arquitectura, decisiones técnicas (ADRs), modelo de negocio y deuda técnica directamente en el repositorio de código.

---

## 📚 Índice de Contenidos

| Documento | Descripción |
| :--- | :--- |
| **[Arquitectura del Sistema](file:///Users/espohr/dev/spi-regulatory-scanner/docs/architecture.md)** | Diagramas de componentes, flujo de datos, modelo en Firestore y pipeline de Vertex AI. |
| **[Dominio Regulatorio & Modelo SPI](file:///Users/espohr/dev/spi-regulatory-scanner/docs/regulatory-domain.md)** | Contexto de negocio de SPI Américas, sectores cubiertos, taxonomía de impacto y criterio comercial. |
| **[Matriz de Fuentes Oficiales LatAm](file:///Users/espohr/dev/spi-regulatory-scanner/docs/sources-matrix.md)** | Inventario de agencias sanitarias, oficinas de PI y diarios oficiales en CO, MX, BR, AR, CL y PE. |
| **[Registro de Deuda Técnica](file:///Users/espohr/dev/spi-regulatory-scanner/docs/technical-debt.md)** | Registro vivo de deuda técnica, limitaciones actuales, riesgos operativos y plan de mitigación. |
| **[Architecture Decision Records (ADRs)](file:///Users/espohr/dev/spi-regulatory-scanner/docs/adr/README.md)** | Registro formal de decisiones de arquitectura tomadas a lo largo de la evolución del proyecto. |

---

## 🏛️ Registros de Decisiones de Arquitectura (ADR)

- **[ADR-0001: Adopción de Firebase y Gemini en Vertex AI](file:///Users/espohr/dev/spi-regulatory-scanner/docs/adr/0001-stack-firebase-vertex-ai.md)**
- **[ADR-0002: Política de "Cero Ruido" en el Reporte Diario](file:///Users/espohr/dev/spi-regulatory-scanner/docs/adr/0002-zero-noise-daily-digest-policy.md)**
- **[ADR-0003: Taxonomía Dual: Oportunidad Comercial vs. Cumplimiento Mandatorio](file:///Users/espohr/dev/spi-regulatory-scanner/docs/adr/0003-opportunity-radar-crm-taxonomy.md)**
- **[ADR-0004: Arquitectura Modular para Ingesta de Fuentes Oficiales Heterogéneas](file:///Users/espohr/dev/spi-regulatory-scanner/docs/adr/0004-modular-source-ingestion-and-resilience.md)**

---

## 🔄 Convenciones de Mantenimiento

1. **Toda decisión estructural** (nuevo servicio, cambio de base de datos, alteración del modelo de extracción de LLM) debe documentarse mediante un nuevo archivo en `docs/adr/`.
2. **Cualquier compromiso o solución temporal** tomada para acelerar una entrega debe registrarse inmediatamente en `docs/technical-debt.md` con su impacto estimado y condición de resolución.
3. **Nuevas fuentes oficiales** incorporadas deben registrarse tanto en `functions/src/sources/registry.ts` como en `docs/sources-matrix.md`.
