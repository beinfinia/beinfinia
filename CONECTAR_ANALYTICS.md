# Analytics del panel Infinia

La sección Analíticas consulta la propiedad GA4 **559672037** desde el servidor. Las métricas de contactos y citas se consultan por separado en Supabase. No se mezclan las fuentes ni se calcula una tasa de conversión entre registros sin atribución.

## Activar lectura de GA4

1. En Google Cloud, selecciona o crea un proyecto para Infinia.
2. Activa **Google Analytics Data API**.
3. En IAM y administración → Cuentas de servicio, crea una cuenta de servicio. No necesita roles de administración del proyecto.
4. En Google Analytics → Administrar → Gestión de accesos a la propiedad 559672037, agrega el correo exacto de esa cuenta con rol **Lector**.
5. En la cuenta de servicio → Claves, genera una clave JSON.
6. En Cloudflare Pages → Settings → Variables and Secrets → Production, crea el secreto **GA_SERVICE_ACCOUNT_JSON**. Pega el contenido completo del JSON, sin envolverlo en comillas adicionales. No lo subas a GitHub ni lo pegues en conversaciones.
7. Vuelve a desplegar el proyecto y abre Panel → Analíticas → Actualizar.

El servidor utiliza únicamente el alcance `analytics.readonly`. El token y la clave privada no se envían al navegador. Esta configuración permite leer informes; no instala otra etiqueta ni duplica el seguimiento existente en GTM.

## Interpretación

- Filtros: 7, 30 y 90 días, incluyendo hoy.
- CRM: fecha de creación en calendario de Nicaragua. Ganados y canceladas son estados actuales de registros creados durante el período, no eventos históricos de cambio de estado.
- GA4: calendario de la propiedad. Configura su zona horaria en Nicaragua para comparar períodos.
- La autorización pendiente o un fallo de Google se muestra explícitamente, sin sustituirlo por cero visitas.
- El tráfico comienza con la recopilación efectiva de la etiqueta; la integración no recupera visitas anteriores a su instalación.
- Los resultados de CRM se paginan. Si el período supera 50.000 registros por tabla, el informe falla en lugar de mostrar un total parcial.

Referencias oficiales:
- https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart
- https://developers.google.com/identity/protocols/oauth2/service-account
