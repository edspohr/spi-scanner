# 0007 — Colaboradores autorizados por correo exacto

- Estado — Aceptada
- Fecha — 2026-11-22
- Relacionados — Reemplaza parcialmente el punto 2 de [ADR-0005](0005-mvp-datos-reales-y-acceso.md).

## Decisión

Por solicitud del propietario, admitir colaboradores individuales mediante una lista explícita de correos en cliente, callables y reglas Firestore. Conservan los mismos permisos de miembro y deben verificar su correo. La autorización individual no habilita al dominio completo. No cambia el resto del contrato de ADR-0005.

## Validación y reversión

Probar un colaborador sintético, correo no verificado y otra cuenta del mismo dominio en el emulador. Para revocar, retirar el correo de las tres capas, validar y desplegar backend/reglas y luego Hosting siguiendo [operación](../operacion.md).
