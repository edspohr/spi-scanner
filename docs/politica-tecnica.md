# Política técnica de Growth Buddies

Aplica a cambios realizados por personas, Codex y Claude Code. El README es el punto de entrada del proyecto. Los ADR aceptados documentan las decisiones vigentes y el runbook describe la operación. Si dos documentos vigentes discrepan, identifica la discrepancia con sus rutas y aclárala antes de cambiar el comportamiento afectado.

## Antes del cambio

- Lee las instrucciones del área y los ADR relacionados. Identifica el alcance, los criterios de aceptación y los comandos del README.
- Conserva los cambios de otros colaboradores. Reutiliza las convenciones y componentes del proyecto.
- Identifica los límites relevantes, como aislamiento por cliente, autorización, propiedad de datos o integraciones externas. Conserva los contratos vigentes salvo que la tarea autorice modificarlos.

## Durante el cambio

- Mantén código, configuración, pruebas y documentación afectados en el mismo cambio.
- Crea un ADR cuando cambie una decisión duradera sobre datos, permisos, integraciones, despliegue o arquitectura. Si reemplaza uno previo, enlaza ambos y actualiza el índice.
- Registra deuda verificable con impacto, prioridad, estado y condición de cierre. Vincula la mitigación o el PR cuando exista. Registra las ideas y mejoras de producto en el backlog del proyecto.
- Usa datos sintéticos en pruebas. Mantén credenciales y datos de clientes fuera de fixtures, documentación y logs. Usa emuladores o staging para validar escrituras externas. Ejecuta despliegues, migraciones o escrituras de producción dentro del alcance autorizado y con el procedimiento del runbook.

## Validación y entrega

- Ejecuta las comprobaciones aplicables del README. Para cambios de comportamiento, verifica el flujo afectado y agrega una prueba si falta cobertura de la regresión.
- En PR, configura CI con instalación reproducible y los controles aplicables de lint, tipos, pruebas y build. Añade emulador para reglas de acceso, variantes para configuraciones soportadas y evaluaciones reproducibles cuando cambie comportamiento de IA.
- Usa las mismas comprobaciones locales y de CI cuando sea viable. Documenta cualquier requisito de entorno. Mantén separadas las evaluaciones que consumen servicios reales.
- En la entrega, indica qué cambió, qué comandos ejecutaste y sus resultados. Identifica comprobaciones pendientes y cualquier paso de operación o reversión que corresponda.
