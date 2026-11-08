# ADR-0003: Taxonomía Dual: Oportunidades Comerciales vs. Cumplimiento Mandatorio

## Estado
**Aceptado**

## Fecha
2026-11-07

## Contexto
Los documentos de reuniones y entrevistas de **SPI Américas** evidencian que los cambios normativos son útiles para la firma únicamente cuando generan **trabajo concreto**:
- Entender qué cambió.
- Determinar a quién afecta en la cartera de clientes.
- Preparar y radicar trámites o recursos de defensa.
- Facturar servicios de consultoría o evitar que un cliente quede bloqueado en ventanilla de la agencia sanitaria.

Construir un lector genérico de noticias normativas no agregaba valor tangible al equipo comercial de SPI. Se requería clasificar cada hallazgo según su propósito de negocio y permitir asignarlo inmediatamente a un responsable interno.

## Decisión
Se definió en el modelo de datos (`RegulatoryOpportunity`) y en el prompt del sistema de Gemini la siguiente taxonomía obligatoria:

1. **Tipo de Oportunidad (`opportunityType`):**
   - `commercial_opportunity` (💼 Venta de Nuevos Servicios / Upsell): Casos donde el cambio normativo permite a SPI ofrecer consultorías de adecuación, auditorías de dossiers, trámites de migración preventiva (ej. *INVIMA Ágil*) o vías de homologación rápida (ej. *Fast-Track COFEPRIS*).
   - `mandatory_compliance` (🛡️ Cumplimiento Mandatorio / Retención): Obligaciones con término legal perentorio que los clientes actuales deben cumplir para no perder registros o sufrir oposiciones de marcas (ej. *Oposiciones en Gaceta SIC* o *Certificación de Farmacovigilancia DIGEMID*).

2. **Flujo de Asignación y CRM Integrado:**
   - Cada oportunidad cuenta con un estado de ciclo de vida: `nueva` ➔ `en_evaluacion` ➔ `asignada` ➔ `contactando_clientes` ➔ `cerrada`.
   - Se asigna nominalmente a un especialista de SPI (Farma, Dispositivos Médicos, Alimentos/Cosméticos o Propiedad Intelectual).
   - Bitácora interna con autor, fecha y comentarios de seguimiento.

## Consecuencias

### Positivas
- **Alineación con Ventas:** Transforma la vigilancia legal pasiva en un canal activo de prospección comercial y generación de honorarios para SPI.
- **Responsabilidad Operativa:** Elimina la ambigüedad de *"¿quién se está encargando de esta nueva circular de INVIMA?"* al vincularla a un consultor con nombre y apellido.
- **Enfoque en el Cliente:** Cada ficha identifica con precisión el campo `affectedClientProfile` (qué tipo de clientes contactar).

### Compromisos (*Trade-offs*)
- Requiere que el equipo de SPI mantenga actualizados los estados de las asignaciones en la aplicación web para que las métricas de gestión reflejen la realidad operativa.
