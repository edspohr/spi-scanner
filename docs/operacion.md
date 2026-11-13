# Operación

## Entornos y configuración

| Entorno | Destino | Uso y permisos |
| --- | --- | --- |
| Local de pruebas | `demo-spi-scanner`, emulador en `127.0.0.1:8085` | Fixtures sintéticos y reglas. No usa credenciales de producción ni invoca Gemini. Java 21 requerido. |
| Local de aplicación | Proyecto indicado en `client/.env.local` | Firebase real; configurar desarrollo explícitamente. El fallback del cliente apunta a producción. |
| Staging | No aprovisionado | Pendiente en DEBT-011. No afirmar que existe. |
| Producción | Firebase/GCP `spi-scanner`, Hosting `spi-scanner.web.app`, Functions `us-central1` | Solo operadores autorizados; despliegues y escrituras deben estar dentro del alcance acordado. |

`.firebaserc` y `firebase.json` identifican destinos y servicios; `client/.env.example` describe configuración pública web. Los archivos de entorno locales, credenciales de servicio, respaldos y tokens no se suben a Git. La cuenta de servicio usa IAM para Vertex AI; no se incluyen claves privadas en el frontend. Las sesiones de Firebase CLI y gcloud son independientes.

## Validación sin servicios reales

```bash
npm ci
npm --prefix client ci
npm --prefix functions ci
npm run validate
```

La suite de reglas exige el emulador y usa un ID `demo-*`; no sustituirlo por producción. Las pruebas de backend reemplazan dependencias externas y las evaluaciones inyectan respuestas sintéticas. No se utilizan las herramientas operativas para ensayar mutaciones: su destino actual es producción.

## Despliegue

1. Revisar diff, política y ADR afectados. Ejecutar `npm run validate`. Confirmar `git status` y que el destino autorizado es `spi-scanner`.
2. Revisar índices y cambios de datos/permisos; prever compatibilidad con el cliente ya publicado.
3. Autenticar el operador con `npx firebase login --reauth` si hace falta; no registrar tokens en logs.
4. Publicar primero backend/reglas cuando cambien sus contratos; esperar que termine antes de publicar cliente.

```bash
npx firebase deploy --only firestore:rules,functions --project spi-scanner
# Si se modificaron índices, desplegarlos explícitamente.
npx firebase deploy --only firestore:indexes --project spi-scanner
# Cliente compilado por npm run build.
npx firebase deploy --only hosting --project spi-scanner
```

No es necesario desplegar servicios sin cambios. CI no despliega automáticamente. Crear/cambiar IAM, destinatarios de correo o accesos de usuarios exige un alcance autorizado específico.

### Verificación y reversión

Comprobar la versión de Hosting, login, lectura y gestión con una cuenta autorizada. Revisar `scan_runs`, `official_sources.health` y el reporte, diferenciando lectura de análisis. Una respuesta HTTP 200 del portal no basta: debe haber texto extraíble. Las pruebas que crean datos o invocan Gemini real se coordinan aparte.

Para revertir Hosting, seleccionar la versión anterior en el historial de versiones de Firebase Hosting. Para Functions/reglas, utilizar un checkout aislado del último SHA validado, instalar sus lockfiles, compilar y desplegar exclusivamente los servicios afectados al destino explícito. Conservar los cambios locales y comprobar compatibilidad de datos; un rollback de código no revierte Firestore.

## Operaciones con datos

Las siguientes herramientas son administrativas; revisar su código y destino antes de usarlas. Sus salidas de directorio pueden contener datos de personas: no adjuntarlas a PR ni fixtures.

```bash
# Lectura de inventario y diagnóstico; usa la sesión activa de gcloud.
node functions/scripts/mvp-admin.cjs inventory
node functions/scripts/mvp-admin.cjs diagnostics
# Consulta externa sin Gemini; omitir --save mantiene Firestore sin cambios.
node functions/scripts/check-sources.cjs CO
# Escritura explícita de diagnósticos, solo cuando esté autorizada.
node functions/scripts/check-sources.cjs CO --save
```

`bootstrap`, `repair-dof-link`, `sync-sources` y `run-initial-scan.cjs` son herramientas históricas de inicialización/reparación, no pasos de despliegue. `bootstrap` incluye altas de directorio y cuenta; requiere autorización de esos destinatarios y no debe repetirse como rutina. Los respaldos previos se guardan en `.local/mvp-backups/` con permisos restrictivos, fuera de Git. `repair-dof-link` conserva URLs personalizadas y estado de activación. `sync-sources` agrega solo IDs iniciales ausentes y no debe usarse para recrear un catálogo eliminado intencionalmente.

Antes de mutar, conservar un respaldo, revisar IDs y ensayar la lógica con datos sintéticos en emulador. Estas herramientas no tienen un dry-run uniforme (DEBT-012). Verificar destino y resultados después; restaurar selectivamente por ID desde el respaldo mediante Admin SDK con autorización. Las bajas de fuentes son lógicas; reactivar una fuente no borra hallazgos. El escaneo usa ID estable y registro de procesados, pero no puede garantizar que una operación abortada no necesite revisión antes de reintentar.

## Escaneos y evaluación real

El horario diario es 06:00 `America/Bogota`, no la zona horaria del ordenador. Revisar que no haya ejecución activa antes de solicitar otra. La ejecución completa consulta fuentes, consume Vertex AI y escribe datos. La comprobación por fuente de la UI no usa Gemini, pero guarda su diagnóstico.

```bash
# Ejecutar solo dentro del alcance aprobado; no forma parte de CI.
gcloud scheduler jobs run firebase-schedule-scheduledDailyScanner-us-central1 \
  --location us-central1 --project spi-scanner --quiet
```

Para evaluar un modelo real, acordar un corpus sintético revisado por SPI, criterios y presupuesto; fijar modelo, región, prompt y versión de código, y registrar precisión de relevancia, clasificación, fechas y citas. Conservar resultados agregados sin datos de clientes ni credenciales. Las evaluaciones locales prueban el contrato y no sustituyen esa medición (DEBT-006).

## Incidentes y recuperación

Responsables: mantenimiento técnico de Growth Buddies para aplicación/infraestructura; SPI para priorización y revisión del impacto regulatorio. No se configura un contacto de guardia ni alerta de disponibilidad en este repositorio.

1. Revisar `scan_runs` (estado, timestamps, errores, cobertura) y `official_sources.health` (URL, muestra, motivo). Confirmar si hay bloqueo, certificado, timeout, PDF grande, error de modelo o fuentes pendientes por presupuesto.
2. Revisar logs con `npx firebase functions:log --only scheduledDailyScanner --project spi-scanner` y la consola Google Cloud. No copiar tokens, credenciales ni datos de clientes a issues.
3. Para certificados/bloqueos, mantener HTTPS validado y buscar un canal oficial permitido; no desactivar TLS ni tratar la falla como ausencia de novedades. Pausar una fuente solo cuando la operación lo acuerde.
4. Si faltan credenciales locales, el operador renueva gcloud/Firebase. Esto no implica que los usuarios deban cambiar sus contraseñas.
5. Confirmar recuperación con una comprobación de lectura, una ejecución autorizada si aplica y verificación de datos guardados. No marcar recuperación completa si la cobertura sigue parcial; enlazar la deuda o incidencia correspondiente.
