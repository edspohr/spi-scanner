# ADR-0002: Política de "Cero Ruido" y Estado Vacío en el Reporte Diario

## Estado
**Aceptado**

## Fecha
2026-11-07

## Contexto
En el ámbito regulatorio latinoamericano, agencias como INVIMA, COFEPRIS o ANVISA publican diariamente docenas de actos administrativos: cambios de horario de atención, licencias de importación individuales, sustituciones de un lote por defecto menor de empaque, o trámites de personal.
La saturación con alertas triviales genera **fatiga de notificación** en los directores y consultores de SPI Américas, provocando que se pasen por alto reformas cruciales.
El usuario definió explícitamente el requisito:
> *"Debe emitir un reporte diario sólo con novedades destacadas. Cosas simples no es necesario. Si hace falta, el mail puede llegar vacío, si no hay nada relevante."*

## Decisión
Se implementó una **Política de Cero Ruido (Zero-Noise Policy)** en el generador de reportes diarios (`functions/src/ai/dailyDigest.ts` y componente `DailyDigestModal.tsx`):
1. **Filtro de Relevancia Estricto:** Solo ingresan al digest las novedades clasificadas con nivel de urgencia `critical` (<30 días de plazo perentorio / riesgo de suspensión) o `high` (30-90 días), o que representen una `commercial_opportunity` de alto valor comercial para SPI.
2. **Estado Vacío Informativo (`hasCriticalUpdates: false`):** Si en la jornada no se detecta ninguna norma de alto impacto, el sistema **no** inventa contenido ni incluye actos menores de relleno. Genera un reporte explícito indicando:
   > *"Estatus: Sin novedades críticas reportadas en la jornada. El escaneo en fuentes oficiales prioritarias no detectó reformas de alto impacto en las últimas 24 horas. No se requieren gestiones extraordinarias el día de hoy."*

## Consecuencias

### Positivas
- **Máxima Confianza Ejecutiva:** Si un consultor recibe o abre el reporte diario, sabe que cualquier punto listado requiere acción inmediata de negocio.
- **Ahorro de Tiempo:** Elimina el tiempo perdido de los socios de SPI filtrando manualmente noticias irrelevantes.
- **Cero Spam:** Respeta la bandeja de entrada del equipo.

### Compromisos (*Trade-offs*)
- **Riesgo de Falsos Negativos:** Si los criterios del prompt de IA fueran excesivamente rigurosos, una norma intermedia podría quedar excluida del digest diario (aunque sigue visible en el feed completo de la app mediante los filtros generales).
- **Mitigación:** Se utiliza una temperatura muy baja (`0.1 - 0.2`) y se audita periódicamente la clasificación con ejemplos de prueba en el simulador.
