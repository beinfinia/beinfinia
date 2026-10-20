# Infinia: solo Supabase

El panel, las citas, el calendario, las tareas y el blog utilizan Supabase. Ya no existe selección entre D1 y Supabase: `DATA_BACKEND` no se usa.

## Activación simplificada

1. Mantén `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET` y las variables de Resend en Cloudflare Production. La URL de Infinia Landing ya está en el código.
2. Para la primera copia, conserva temporalmente el vínculo `DB` de D1 y `MIGRATION_MODE=1`. La versión previa pausa las escrituras en D1 con esa variable.
3. Despliega esta versión y entra a `/panel`. Al cargar los datos con tu sesión, se toma una copia transaccional de D1 y se importa a Supabase. Se comprueban los recuentos de contactos, citas, bloqueos, tareas y avisos. La copia es idempotente y no sobrescribe datos diferentes en el destino.
4. En Migración verás **Supabase es la única base activa. La copia de D1 está verificada.** Las reservas ya utilizan Supabase; la variable de mantenimiento anterior deja de pausarlas después de verificar la copia.
5. Solo entonces, en Cloudflare > Infinia > Settings > Bindings, retira el vínculo **DB**. Esto desconecta D1 del sitio; no borres la base antigua. Puedes quitar también `MIGRATION_MODE` y `DATA_BACKEND` si existe. Despliega para aplicar la configuración y verifica `/panel` y una reserva en `/cita`.

No elimines DB antes de la primera copia: si no hay registro de migración, la aplicación se detiene para evitar perder los datos anteriores. Si hay rangos solapados o datos diferentes en Supabase, se muestra un error y D1 permanece intacta.

## Blog y servicios

El blog incluye editor, borradores, categorías, portadas, autor y SEO. Las páginas `/blog`, `/blog/slug` y `/servicios` se entregan como HTML. El sitemap contiene únicamente artículos publicados. No se publican textos automáticamente. Las imágenes del bucket `blog-covers` son públicas: solo sube imágenes destinadas a difusión.

La sesión de administrador sigue usando las credenciales existentes. No se han creado cuentas individuales de Supabase Auth. Los avisos de correo mantienen la configuración de Resend.

## Validación

12 pruebas automáticas de acceso, migración automática, bloqueos de seguridad, HTML y publicación. Se comprobó que, con copia verificada, la aplicación funciona sin vínculo D1. La copia real y el despliegue todavía deben verificarse en el sitio: desde este entorno no hay acceso al panel de Cloudflare ni a sus secretos.
