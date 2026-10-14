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

Hora fija America/Managua, reuniones virtuales sin enlace automático, sin correo de confirmación al cliente; los avisos al administrador requieren configurar Resend. Compartir contraseñas no equivale a usuarios individuales: roles e invitaciones no están implementados. Tampoco hay sincronización Google Calendar, adjuntos, edición de datos básicos, borrado de contactos ni historial de cambios. El Pixel de la landing se conserva; no se agregan eventos de reserva ni integración Meta Leads en esta etapa.

Los contactos requieren datos personales; revisar que la política publicada describa citas, finalidad y medio para solicitar eliminación. No cargar archivos ni datos sensibles en notas. La página pública admite reservas sin login y no permite leer contactos.

## Verificación

Sintaxis del backend; compilación JSX y renderizado de pantallas sin sesión; esquema SQLite y triggers de solapamiento. La instalación completa de las dependencias originales y despliegue quedan sujetos al entorno de Cloudflare. No se afirma que la agenda esté activa antes de completar los pasos de configuración.


## Actualizar un panel existente: calendario y avisos

Antes de desplegar esta actualización, ejecutar **database/migrations/002_calendar.sql** en Console de `infinia-ops`. Agrega tablas y controles de bloqueos sin borrar datos existentes. No es necesario volver a ejecutar todo el esquema. Si falta la migración, las rutas de agenda muestran un aviso para ejecutarla.

Calendario permite bloquear un rango de horas, un día completo o varios días; liberar un bloqueo; crear una cita con un contacto existente; reprogramar una cita agendada conservando su duración, contacto y notas. Los horarios públicos, las citas manuales y las reprogramaciones respetan disponibilidad y bloqueos. Un bloqueo no puede cubrir una cita existente: primero cancelarla o reprogramarla. Los bloques son globales para la única agenda actual. No hay vistas semanal/mensual ni tiempo extra entre citas todavía.

### Activar avisos al equipo por correo

1. Crear una cuenta en https://resend.com y verificar el dominio de envío (puede ser un subdominio dedicado, por ejemplo `avisos.beinfinia.com`) con los registros DNS que entrega Resend. Conservar los registros de correo existentes.
2. Crear una API key de envío para ese dominio.
3. En Pages > Infinia > Settings > Variables and Secrets > Production, guardar:
   - `RESEND_API_KEY`: clave de Resend, tipo Secret.
   - `EMAIL_FROM`: remitente del dominio verificado, por ejemplo `Infinia <citas@avisos.beinfinia.com>`.
   - `NOTIFY_EMAIL`: dirección del administrador que recibirá los avisos (Gmail, Outlook o correo de la empresa).
4. Desplegar nuevamente el último commit para aplicar las variables. Confirmar Configuración > Avisos por correo y crear una cita de prueba.

Los avisos se generan al crear una cita pública o manual, reprogramarla o cancelarla. Incluyen nombre, servicio, fecha y datos de contacto, y solo se envían al destinatario definido por `NOTIFY_EMAIL`. No hace falta dar acceso a la bandeja de ese destinatario. No hay envío al cliente ni recordatorio antes de la hora de la reunión. No se ha configurado una cuenta ni enviado un correo real desde este entorno.

El panel distingue aviso pendiente, aceptado por el proveedor y fallido. La aceptación del proveedor no garantiza entrega en la bandeja de entrada. Una falla de envío conserva la cita; los avisos pueden reintentarse desde Configuración durante las primeras 23 horas, con la misma clave de idempotencia para evitar duplicados. No hay reintento automático ni programador en esta versión.

### Pruebas de calendario

Con Node 24: `node --test tests/calendar.test.mjs`. Usa SQLite en memoria y un proveedor de email simulado: no envía mensajes reales. Cubre migraciones repetibles, bloqueos, reprogramación, disponibilidad pública, rollback en reservas rechazadas, cancelaciones, aviso fallido y reintentos.
