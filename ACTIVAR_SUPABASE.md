# Infinia: inicio nuevo en Supabase

Por decisión del propietario, Infinia empieza sin importar contactos, citas ni tareas de D1. Se confirmó que Supabase no contenía datos en esas tablas ni artículos. La base antigua de D1 no se borra.

## Configuración

Conserva en Cloudflare Production:
- `SUPABASE_SECRET_KEY`: Secret key del proyecto Infinia Landing; solo del lado del servidor.
- `ADMIN_PASSWORD` y `SESSION_SECRET`: acceso privado existente.
- Variables de Resend si quieres recibir avisos.

Después de desplegar este código:
1. En Cloudflare > Infinia > Settings > Bindings, retira el vínculo `DB`. No elimines la base D1: puede conservarse como respaldo independiente.
2. Elimina `MIGRATION_MODE` y `DATA_BACKEND` si existen. Ya no se utilizan ni afectan la agenda.
3. Despliega nuevamente para aplicar la configuración.
4. Abre `/panel` y comprueba Contactos, Calendario, Tareas y Blog. No hay sección Migración ni obligación de copiar datos antiguos.

El CRM y las reservas usan directamente Supabase. El blog y las portadas también se guardan en Supabase; Cloudflare continúa alojando la web. Los datos personales y borradores están protegidos, y solo los artículos publicados tienen acceso público.

El acceso de administrador conserva la contraseña actual. No se han creado usuarios individuales de Supabase Auth ni cambiado las credenciales del propietario.

Si el panel muestra un error de conexión, ahora diferencia clave rechazada, permisos insuficientes, tablas ausentes y fallos de red, sin exponer claves.
