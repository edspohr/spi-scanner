# SPI Regulatory Scanner & Opportunity Radar (LatAm)
### Sistema de Vigilancia Regulatoria y Propiedad Intelectual con Firebase & Gemini en Vertex AI

Diseñado a la medida para **SPI Américas**, este sistema automatiza la vigilancia de cambios normativos en agencias sanitarias y oficinas de propiedad industrial de América Latina (**Colombia, México, Brasil, Argentina, Chile y Perú**), transformando resoluciones, decretos y gacetas en **oportunidades de venta de servicios y acciones preventivas de cumplimiento** asignables al equipo de consultores de SPI.

---

## 🎯 Capacidades Principales

1. **Filtro de Ruido & Inteligencia SPI (Gemini en Vertex AI):**
   - Descarta automáticamente revocaciones aisladas o trámites administrativos de rutina.
   - Clasifica cada hallazgo entre:
     - 💼 **Oportunidad Comercial (Venta de Servicios):** Trámites de migración (ej. *INVIMA Ágil*), carril rápido por equivalencia (ej. *COFEPRIS*), blindaje marcario y adecuación de expedientes.
     - 🛡️ **Cumplimiento Mandatorio:** Plazos legales perentorios para evitar sanciones, suspensiones aduaneras o revocación de registros sanitarios.
2. **Cálculo de Urgencia & Fechas Clave:**
   - Detecta fecha de publicación, entrada en vigor y fecha límite de regímenes de transición con cálculo de días restantes.
   - Clasificación por criticidad: `Crítica (<30 días)`, `Alta (30-90 días)`, `Media`, `Baja`.
3. **Citas y Fundamento Legal Exacto:**
   - Extrae el número de artículo/sección, la cita literal entrecomillada y la interpretación técnica para los clientes.
4. **CRM de Asignación a Consultores SPI:**
   - Asignación de oportunidades a miembros del equipo (Farma, Dispositivos Médicos, Alimentos/Cosméticos, Propiedad Intelectual).
   - Gestión de estados en tiempo real: `Nueva` ➔ `En Evaluación` ➔ `Asignada` ➔ `Contactando Clientes` ➔ `Cerrada`.
   - Bitácora interna de gestiones comerciales y regulatorias.
5. **Reporte Diario Ejecutivo ("Zero-Noise"):**
   - Emite diariamente un briefing con novedades destacadas de urgencia crítica/alta.
   - **Regla de Cero Ruido:** Si en la jornada no se registran novedades de alto impacto, el reporte emite una constancia expresa de "Sin novedades críticas hoy", permitiendo certeza al equipo sin saturación.

---

## 🌎 Cobertura de Fuentes Oficiales (Núcleo LatAm)

| País | Agencias Sanitarias y Salud | Propiedad Intelectual (PI) | Diario Oficial |
| :--- | :--- | :--- | :--- |
| 🇨🇴 **Colombia** | **INVIMA** (Normatividad, INVIMA Ágil), **MinSalud** | **SIC** (Gaceta de la Propiedad Industrial) | Imprenta Nacional |
| 🇲🇽 **México** | **COFEPRIS** (Acuerdos, Guías de Registro, NOMs) | **IMPI** (Gaceta de Marcas y Patentes) | DOF (Diario Oficial de la Federación) |
| 🇧🇷 **Brasil** | **ANVISA** (RDC - Resoluções de Diretoria Colegiada) | **INPI Brasil** (RPI - Revista de PI) | DOU (Diário Oficial da União) |
| 🇦🇷 **Argentina** | **ANMAT** (INAME, INAL, Tecnología Médica) | **INPI Argentina** (Boletín de Marcas) | Boletín Oficial |
| 🇨🇱 **Chile** | **ISP Chile** (ANAMED, Resoluciones Sanitarias) | **INAPI** (Boletín Marcario) | Diario Oficial de Chile |
| 🇵🇪 **Perú** | **DIGEMID**, **DIGESA** | **INDECOPI** (Gaceta Electrónica de PI) | El Peruano |

---

## 🏗️ Arquitectura Técnica

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons (Empaquetado optimizado para **Firebase Hosting**).
- **Backend & Ingesta:** Firebase Cloud Functions 2nd Gen (Node 20 / TypeScript).
- **Inteligencia Artificial:** **Vertex AI in Firebase** (`@google-cloud/vertexai`) con modelo **Gemini 1.5 Flash / Pro**, estructurado mediante `responseSchema` JSON estricto.
- **Base de Datos:** Cloud Firestore con colecciones indexadas:
  - `regulatory_opportunities`: Fichas normativas y planes de acción SPI.
  - `official_sources`: Catálogo de fuentes y feeds oficiales.
  - `team_members`: Directorio de consultores de SPI.
  - `daily_digests`: Historial de reportes ejecutivos diarios.

---

## 🚀 Despliegue en Firebase

### 1. Requisitos Previos
Asegúrate de contar con Node.js v20+, npm y el CLI de Firebase instalado:
```bash
npm install -g firebase-tools
firebase login
```

### 2. Configurar el Proyecto Firebase
Vincula tu proyecto de Firebase creado en la consola:
```bash
firebase use --add <TU-PROJECT-ID-FIREBASE>
```

Habilita las APIs necesarias en Google Cloud Console para tu proyecto:
1. **Vertex AI API** (`aiplatform.googleapis.com`)
2. **Cloud Firestore API**
3. **Cloud Functions API & Cloud Build**

### 3. Configurar Variables de Entorno del Frontend
En `client/.env.local`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=<tu-proyecto>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<tu-proyecto>
VITE_FIREBASE_STORAGE_BUCKET=<tu-proyecto>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Compilar y Desplegar
```bash
# Compilar frontend
cd client && npm run build && cd ..

# Desplegar todo a Firebase (Hosting, Firestore Rules y Functions)
firebase deploy
```

O desplegar de forma granular:
```bash
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore
```

---

## 💻 Ejecución Local / Modo Desarrollo

Para correr la aplicación web localmente:
```bash
cd client
npm run dev
```
La aplicación abrirá en `http://localhost:3000` con el set completo de datos iniciales representativos de SPI Américas, simulador de escaneo y evaluador interactivo de Gemini.
