# Architecture Decision Records (ADRs)

Este directorio documenta formalmente las decisiones arquitectónicas clave tomadas en el diseño y construcción del **SPI Regulatory Scanner & Opportunity Radar**.

Seguimos el estándar de documentación propuesto por Michael Nygard:
- **Título**: Número secuencial y descripción breve.
- **Estado**: `Propuesto`, `Aceptado`, `Reemplazado` o `Deprecado`.
- **Contexto**: Qué problema o requerimiento motivó la decisión.
- **Decisión**: Qué enfoque técnico o de diseño se adoptó.
- **Consecuencias**: Beneficios, compromisos (*trade-offs*) e impactos operacionales.

---

## 📑 Registro de Decisiones

| ADR | Título | Estado | Fecha |
| :--- | :--- | :--- | :--- |
| **[ADR-0001](file:///Users/espohr/dev/spi-regulatory-scanner/docs/adr/0001-stack-firebase-vertex-ai.md)** | Elección del Stack: Firebase (Hosting, Firestore, Functions) y Vertex AI (Gemini) | **Aceptado** | 2026-11-07 |
| **[ADR-0002](file:///Users/espohr/dev/spi-regulatory-scanner/docs/adr/0002-zero-noise-daily-digest-policy.md)** | Política de "Cero Ruido" y Estado Vacío en el Reporte Diario | **Aceptado** | 2026-11-07 |
| **[ADR-0003](file:///Users/espohr/dev/spi-regulatory-scanner/docs/adr/0003-opportunity-radar-crm-taxonomy.md)** | Taxonomía Dual: Oportunidades Comerciales vs. Cumplimiento Mandatorio | **Aceptado** | 2026-11-07 |
| **[ADR-0004](file:///Users/espohr/dev/spi-regulatory-scanner/docs/adr/0004-modular-source-ingestion-and-resilience.md)** | Arquitectura de Ingesta Modular y Resiliencia en Fuentes Oficiales LatAm | **Aceptado** | 2026-11-07 |
