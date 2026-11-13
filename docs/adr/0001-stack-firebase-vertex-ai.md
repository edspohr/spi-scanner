# ADR-0001: Elección del Stack: Firebase y Vertex AI (Gemini)

> Documento histórico: [ADR-0005](0005-mvp-datos-reales-y-acceso.md) reemplaza parcialmente esta decisión y documenta el contrato vigente.

## Estado
**Aceptado**

## Fecha
2026-11-07

## Contexto
SPI Américas requiere una aplicación capaz de escanear fuentes oficiales en varios países de América Latina, estructurar documentos legales complejos en tiempo real y presentar un dashboard web interactivo con asignación de tareas a consultores y reportes ejecutivos diarios.
El despliegue requerido debía realizarse íntegramente en **Firebase** (tanto frontend como backend) y el modelo de lenguaje debía operar sobre **Vertex AI** en el ecosistema de Google Cloud.

## Decisión
Se seleccionó la siguiente combinación tecnológica integrada:
1. **Frontend:** React 18, Vite, TypeScript y Tailwind CSS empaquetado para **Firebase Hosting**. Provee tiempos de carga sub-segundo, tipado estricto y cero costo de servidor web en reposo.
2. **Backend & Tareas Programadas:** **Firebase Cloud Functions 2nd Gen** (Node.js 20 / TypeScript). Permite orquestar el cron diario a las 06:00 AM mediante Cloud Scheduler y exponer endpoints HTTPS/Callables con soporte nativo de CORS y autenticación.
3. **Persistencia & Estado en Tiempo Real:** **Cloud Firestore** con colecciones estructuradas para oportunidades, gacetas, miembros del equipo y reportes diarios.
4. **Inteligencia Artificial:** **Google Cloud Vertex AI SDK** (`@google-cloud/vertexai`) utilizando el modelo **Gemini 1.5 Flash** con `responseSchema` estricto en JSON para extracción determinista de entidades, citas y resúmenes ejecutivos.

## Consecuencias

### Positivas
- **Despliegue Unificado:** Un único comando (`firebase deploy`) despliega el frontend compilado, las reglas de Firestore, los índices compuestos y las funciones serverless.
- **Seguridad IAM Integrada:** La comunicación con Vertex AI desde Cloud Functions utiliza las credenciales de la cuenta de servicio de Google Cloud, eliminando la necesidad de almacenar API keys expuestas en el código.
- **Bajo Costo y Auto-escalado:** Al ser serverless, no hay costos de servidores dedicados cuando no hay escaneos activos; escala automáticamente cuando se procesan cientos de boletines.

### Compromisos (*Trade-offs*)
- **Dependencia de Plataforma:** Acoplamiento estrecho con la infraestructura de Google Cloud y Firebase.
- **Cold Starts:** Las Cloud Functions pueden experimentar una latencia inicial de 1-2 segundos tras períodos de inactividad, lo cual es perfectamente admisible para procesos batch y cron de escaneo.
