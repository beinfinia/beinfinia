# Infinia Panel · Cloudflare Pages

Rutas: `/panel` (administración privada) y `/cita` (reservas públicas). La landing permanece en `/`.

## Activación en el proyecto Pages actual

1. En Cloudflare > Storage & Databases > D1, crear `infinia-ops`.
2. Ejecutar el contenido completo de `database/schema.sql` en la consola de esa base.
3. En Pages > proyecto Infinia > Settings > Bindings, agregar un binding D1 llamado **DB**, conectado a `infinia-ops`.
4. En Settings > Variables and Secrets agregar como secretos **ADMIN_PASSWORD** (contraseña larga exclusiva del panel) y **SESSION_SECRET** (valor aleatorio de al menos 32 caracteres). No ponerlos en GitHub ni en variables VITE_.
5. Desplegar el último commit de `main` con `npm run build` y salida `dist`. Cloudflare detecta `functions/` automáticamente. Configurar los mismos bindings/secretos en preview solo si se necesita, usando una base separada.
6. Abrir `/panel`, iniciar sesión y ajustar Configuración > Disponibilidad. Abrir `/cita`, completar una reserva y comprobar que aparece en contactos, pipeline y calendario.

Sin bindings o secretos, la API devuelve un aviso de configuración y no acepta reservas. La interfaz nunca usa datos ficticios ni almacenamiento local para contactos.

## Alcance

Contactos con búsqueda, origen, notas y etapas; pipeline; agenda diaria; estados de citas; tareas con vencimiento; días y horas de disponibilidad. Sesión de administrador de 8 horas en cookie Secure/HttpOnly. API privada protegida en servidor. Límites por IP para login y reservas; prevención de solapamientos transaccional en SQLite. Las cancelaciones liberan el horario; duración de citas ya creadas se conserva al cambiar disponibilidad.

Hora fija America/Managua, reuniones virtuales sin enlace automático, sin correo de confirmación. Compartir contraseñas no equivale a usuarios individuales: roles e invitaciones no están implementados. Tampoco hay sincronización Google Calendar, bloqueos de fechas individuales, adjuntos, edición de datos básicos, borrado de contactos ni historial de cambios. El Pixel de la landing se conserva; no se agregan eventos de reserva ni integración Meta Leads en esta etapa.

Los contactos requieren datos personales; revisar que la política publicada describa citas, finalidad y medio para solicitar eliminación. No cargar archivos ni datos sensibles en notas. La página pública admite reservas sin login y no permite leer contactos.

## Verificación

Sintaxis del backend; compilación JSX y renderizado de pantallas sin sesión; esquema SQLite y triggers de solapamiento. La instalación completa de las dependencias originales y despliegue quedan sujetos al entorno de Cloudflare. No se afirma que la agenda esté activa antes de completar los pasos de configuración.
