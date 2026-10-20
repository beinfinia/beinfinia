# Infinia: Supabase, blog y páginas de servicios

Proyecto conectado: **Infinia Landing** (`gdnzpassbdavkzqbutxg`). El esquema ya se aplicó en Supabase mediante la migración `infinia_crm_blog`. El SQL retenido está en `supabase/schema.sql`; no lo ejecutes de nuevo sobre el proyecto que ya se preparó.

## Qué cambia

- Base preparada para contactos, citas, bloqueos, tareas, ajustes y avisos de correo.
- El calendario usa una restricción PostgreSQL que impide solapamientos entre citas y bloqueos, incluso con solicitudes simultáneas.
- Blog administrable en `/panel` > Blog: borradores, publicaciones, portadas, categoría, autor, resumen, título y descripción SEO. Las imágenes admitidas son JPG, PNG y WebP de hasta 5 MB y se almacenan en Supabase Storage.
- Páginas `/servicios`, `/servicios/paginas-web`, `/servicios/google-business-profile` y `/servicios/redes-sociales`.
- Blog público `/blog` y `/blog/slug` servido como HTML por Pages Functions, con canonical, metadatos y datos estructurados. `/sitemap.xml` se genera con las publicaciones visibles.
- La landing enlaza servicios y blog. Se conservan los planes, Pixel, WhatsApp, citas y zonas horarias.

No hay artículos publicados automáticamente ni resultados/testimonios inventados. Crea tus contenidos desde el editor. Se mantiene por ahora el acceso de administrador mediante `ADMIN_PASSWORD` y `SESSION_SECRET`; este cambio migra datos, no crea cuentas Supabase Auth, roles individuales ni invitaciones.

## 1. Conectar Cloudflare con Supabase

En Supabase > Project Settings > API Keys, copia una **secret key** del proyecto (formato `sb_secret_...`; también se admite la legacy `service_role` JWT). En Cloudflare Pages > Infinia > Settings > Variables and Secrets > **Production**, guárdala como **Secret**, con nombre:

`SUPABASE_SECRET_KEY`

No la pongas en GitHub, en variables `VITE_`, ni la compartas en el chat. La clave solo la usan las funciones del servidor. La URL del proyecto ya está configurada en el código; opcionalmente puede declararse como `SUPABASE_URL`.

Mantén el binding **DB** de D1, `ADMIN_PASSWORD`, `SESSION_SECRET` y las variables existentes de Resend. **Todavía no actives DATA_BACKEND**. Despliega el código nuevo: el CRM sigue en D1 mientras el editor de blog utiliza Supabase.

No conectes un entorno de Preview a la base de producción con permisos de escritura; usa un proyecto de pruebas separado si habilitas esas variables en Preview.

## 2. Copiar D1 sin perder nuevas reservas

1. En Cloudflare configura **MIGRATION_MODE=1** y despliega. Esto pausa temporalmente reservas y cambios en el CRM; conserva el login, el blog y la herramienta de migración.
2. En `/panel` > **Migración**, descarga un respaldo D1 y guárdalo. Contiene datos personales; no lo publiques ni lo agregues al repositorio.
3. Pulsa **Copiar D1 y verificar**. La copia incluye contactos, citas, bloqueos, tareas, ajustes y avisos existentes, conservando los identificadores.
4. Revisa los recuentos y el resultado **Copia verificada**. La importación ocurre en una transacción: un error no deja datos a medias. Si hay datos diferentes en el destino, no se sobrescriben. Los bloqueos que se solapen entre sí o con citas activas harán detener la importación; corrige esos rangos en D1 antes de repetirla.
5. Sin reabrir las escrituras en D1, agrega **DATA_BACKEND=supabase** y cambia **MIGRATION_MODE=0**. Despliega nuevamente.
6. Verifica contactos, tareas, horarios bloqueados y próximas citas en el panel. Reserva una cita de prueba en `/cita` y comprueba que aparece en Supabase y que el horario deja de estar disponible.

Los cambios de variable requieren un despliegue de la versión más reciente. D1 queda intacta como respaldo. Si ya se aceptaron nuevas reservas en Supabase, no vuelvas directamente a D1: primero reconcilia esas reservas para evitar pérdidas o duplicados.

## 3. Publicar un artículo

En `/panel` > Blog, crea un artículo, completa el título y la URL, sube una portada opcional y agrega el contenido. Usa `##` para subtítulos y `-` para listas. Guarda como **Borrador** hasta revisarlo. Los borradores no se muestran en la web ni en el sitemap. Cambia a **Publicado** y guarda para hacerlo visible. Para retirarlo, vuelve a Borrador.

Las portadas del bucket `blog-covers` son públicas incluso mientras el artículo es borrador: sube únicamente imágenes destinadas a difusión. La escritura de imágenes pasa por el acceso privado del panel. El contenido no admite HTML arbitrario, scripts ni iframes.

La primera versión lista hasta 100 artículos en la página principal del blog; paginación, programación de publicaciones, redirecciones al cambiar slugs y edición colaborativa no están incluidas.

## Seguridad y pruebas

RLS habilitada en todas las tablas públicas. Solo los artículos publicados tienen acceso de lectura anónimo. Contactos, calendario, tareas, avisos y funciones de importación no tienen permisos para `anon` ni `authenticated`; el servidor verifica la sesión antes de usar su clave privilegiada. El análisis de Supabase solo indicó avisos informativos sobre tablas sin políticas, intencionalmente cerradas para uso exclusivo del servidor.

Verificado: 12 pruebas Node/SQLite y de endpoints simulados, parseo JSX/CSS/JS y pruebas transaccionales en PostgreSQL sobre solapamientos, permisos y visibilidad de borradores. Los datos de prueba en PostgreSQL se revirtieron. No se accedió a los datos reales de D1 ni se enviaron correos reales. La compilación completa y la revisión visual en el despliegue de Cloudflare siguen pendientes.
