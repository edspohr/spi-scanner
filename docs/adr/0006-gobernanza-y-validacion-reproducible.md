# 0006 — Política compartida y validación reproducible

- Estado — Aceptada
- Fecha — 2026-11-13
- Relacionados — Plantilla Growth Buddies aportada por el usuario; ADR-0005.

## Contexto

El usuario solicita aplicar el estándar técnico de Growth Buddies al repositorio y subir todos los cambios acumulados a Git. Existían decisiones y documentos, pero sin política compartida, runbook, CI, lint ni pruebas de reglas. Varias afirmaciones históricas ya no describían el comportamiento desplegado.

## Decisión

- Adoptar `docs/politica-tecnica.md`, `AGENTS.md`, `CLAUDE.md`, plantilla de PR y plantilla de ADR como puntos de entrada comunes.
- Hacer del README raíz la guía de instalación, estructura, fuentes de verdad y validación. Conservar documentos históricos y enlazar reemplazos explícitos; mantener un único registro canónico de deuda y separar el backlog.
- Instalar dependencias con los tres lockfiles. No convertir los módulos existentes en workspaces en este cambio.
- Fijar Node 22.19.0 / npm 10.9.3 y Java 21 para reglas. CI usa el mismo `npm run validate` que local, sin credenciales ni despliegue automático.
- Exigir lint, tipos, pruebas de comportamiento, build, enlaces internos, reglas en `demo-spi-scanner` y evaluaciones deterministas del contrato de IA. Las pruebas de reglas abortan si no existe un emulador.
- Mantener evaluaciones reales de IA y escrituras externas separadas de CI, dentro de alcance autorizado. Las evaluaciones locales no se presentan como medida de precisión del modelo.
- Permitir temporalmente `any` existente como deuda explícita; el resto de reglas de lint y el tipado estricto se exigen sin ocultar fallos.

Mantenimiento técnico conserva estos comandos y sus contratos; SPI acuerda criterios de producto, cobertura y autorización de operaciones reales.

## Alternativas consideradas

- Copiar documentos con campos sin completar: da apariencia de estándar sin controles ejecutables.
- Añadir CI diferente de local: produce resultados difíciles de reproducir.
- Ejecutar producción o Gemini en cada PR: mezcla validación de código con costos, credenciales y datos reales.
- Reestructurar todo el repositorio o corregir toda la deuda histórica: amplía el alcance sin necesidad para adoptar el estándar.

## Consecuencias

Cada PR puede verificar acceso y regresiones sin usar servicios productivos. La instalación de CI es más pesada por Firebase CLI/Java. La comprobación de navegación visual y la calidad semántica de IA siguen requiriendo evidencia separada. La reversión de esta decisión consiste en retirar los controles y documentos del cambio, conservando las decisiones y versiones previas; no requiere migrar Firestore ni desplegar la aplicación.
