# Registro Vivo de Deuda Técnica & Backlog Operativo

Este documento registra los compromisos de arquitectura, áreas de mejora identificadas, riesgos operativos y tareas de refactorización necesarias a medida que el sistema evolucione hacia producción masiva.

---

## 📌 Resumen de Deuda Técnica Activa

| ID | Área | Descripción de la Deuda | Severidad | Impacto | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEBT-001** | Seguridad | Reglas de Firestore abiertas (`allow read, write: if true`) | **Alta** | Riesgo de acceso no autorizado si se conecta a producción sin Firebase Auth | Pendiente |
| **DEBT-002** | Ingesta | PDFs escaneados sin capa de texto en gacetas oficiales | **Alta** | Pérdida de resoluciones que sean publicadas exclusivamente como imagen | Pendiente |
| **DEBT-003** | Notificaciones | Despacho de email diario automatizado vía SMTP / API | **Media** | El digest diario se genera y visualiza en la app, pero no se dispara vía email saliente | Planificado |
| **DEBT-004** | IA / Costos | Documentos extremadamente largos (>150 páginas) | **Media** | Consumo elevado de tokens de entrada en resoluciones técnicas complejas | Planificado |
| **DEBT-005** | Integración | Cruce automático con cartera de clientes de SPI | **Baja** | Actualmente el perfil de clientes es textual; falta vincular con IDs de clientes reales | Backlog |

---

## 🔍 Detalle de Ítems de Deuda Técnica

### DEBT-001: Autenticación Obligatoria y RBAC en Firestore
- **Contexto:** Durante la fase de prototipado rápido y desarrollo, las reglas de Firestore en `firestore.rules` permiten lectura y escritura sin autenticación para facilitar pruebas locales y en emuladores.
- **Riesgo:** En un despliegue productivo, cualquier actor con las credenciales públicas de Firebase podría leer los análisis estratégicos de SPI o alterar asignaciones.
- **Plan de Mitigación:**
  1. Configurar Firebase Authentication con Google Workspace (restringido al dominio `@spiamericas.com`).
  2. Actualizar `firestore.rules` para exigir `request.auth != null && request.auth.token.email.matches('.*@spiamericas\\.com$')`.
  3. Añadir verificación de roles (`admin`, `consultor_farma`, `consultor_pi`).

---

### DEBT-002: Pipeline de OCR para PDFs Escaneados (Document AI)
- **Contexto:** Algunas agencias (especialmente gacetas del interior o resoluciones de emergencia firmadas a mano) publican archivos PDF que son imágenes escaneadas sin capa de texto seleccionable.
- **Riesgo:** El extractor HTML o parser de texto plano omite el contenido de la resolución, impidiendo que Gemini evalúe la norma.
- **Plan de Mitigación:**
  1. Integrar **Google Cloud Document AI (OCR Processor)** dentro de una Cloud Function con trigger de almacenamiento o pre-procesador en Cloud Run.
  2. Si un PDF tiene menos de 100 caracteres de texto nativo por página, derivar el documento al procesador OCR antes de enviarlo a Gemini.

---

### DEBT-003: Disparador Automático de Email (SendGrid / Resend / Firebase Extension)
- **Contexto:** La función programada `scheduledDailyScanner` genera y guarda el documento en la colección `daily_digests`, y la aplicación web ofrece vista previa, descarga y copiado con un clic. Falta el conector SMTP saliente.
- **Riesgo:** Los directores de SPI deben ingresar a la web app para ver el digest si no reciben el correo en su bandeja.
- **Plan de Mitigación:**
  1. Instalar la extensión oficial de Firebase `Trigger Email with Resend / SendGrid` o invocar la API de Resend dentro de `dailyDigest.ts`.
  2. Implementar la regla de envío estricta: si `hasCriticalUpdates === false`, enviar el correo con la plantilla informativa simple o suprimir el envío según preferencia del usuario.

---

### DEBT-004: Estrategia de Chunking Jerárquico para Resoluciones Extensas
- **Contexto:** Algunas resoluciones farmacopeicas o reglamentos técnicos de ANVISA o COFEPRIS superan las 150 páginas de anexos y tablas.
- **Riesgo:** Aunque Gemini 1.5 cuenta con una ventana de contexto de 1 millón de tokens, procesar documentos completos de 500 páginas incrementa innecesariamente la latencia y los costos de API.
- **Plan de Mitigación:**
  1. Implementar un filtro preliminar de secciones: extraer únicamente el *Considerando*, los *Artículos Resolutivos*, *Régimen de Transición* y *Vigencia*.
  2. Omitir anexos puramente tabulares de fórmulas químicas salvo cuando se detecte un cambio en límites máximos.

---

### DEBT-005: Matching Bidireccional con Portafolio de Registros Sanitarios de Clientes
- **Contexto:** Actualmente, el campo `spiActionPlan.affectedClientProfile` describe en lenguaje natural qué tipo de clientes se ven impactados (ej. *"Titulares de alimentos con exceso de sodio"*).
- **Oportunidad / Mejora:** Cruzar la norma con una base de datos de los registros de clientes gestionados por SPI para generar automáticamente la lista de razones sociales afectadas y enviarles un correo personalizado de advertencia preventiva.
