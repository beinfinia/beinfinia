import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/*
  ============================================================
  Política de privacidad — infinia
  ============================================================
  Contenido genérico pensado para cumplir con lo que pide Meta al
  crear formularios de leads (recolección de nombre, correo,
  teléfono, uso de Meta Pixel/Ads).

  SUSTITUIR / REVISAR ANTES DE PUBLICAR:
  - Esto NO es asesoría legal. Es un punto de partida razonable,
    no un documento certificado por un abogado. Si vas a recolectar
    datos de personas en EE. UU. (CCPA), Nicaragua u otros países,
    te recomiendo que un abogado lo revise antes de operar con
    tráfico pagado a gran escala.
  - Actualiza "Última actualización" cada vez que cambies el texto.
  - Si en el futuro agregas Google Analytics, TikTok Pixel, etc.,
    súmalos a la sección "Publicidad y cookies".
  ============================================================
*/

const LAST_UPDATED = '2 de agosto de 2026';

export default function PrivacyPolicy() {
  return (
    <div className="pp-root">
      <Helmet>
        <title>Política de Privacidad | infinia</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <style>{`
        html, body{ margin:0; padding:0; width:100%; max-width:none; min-width:0; }
        #root{ max-width:none !important; margin:0 !important; padding:0 !important; width:100%; display:block !important; text-align:left !important; }

        .pp-root{
          --void:#0a0a0e;
          --panel:#141018;
          --violet:#8b5cf6;
          --green:#22c55e;
          --lilac:#dccbff;
          --white:#f6f4f8;
          --line: rgba(246,244,248,0.12);
          background:var(--void);
          color:rgba(246,244,248,0.82);
          font-family:'Inter', sans-serif;
          min-height:100vh;
        }
        .pp-root *{ box-sizing:border-box; }
        .pp-wrap{ max-width:760px; margin:0 auto; padding:64px 24px 96px; }
        .pp-back{
          display:inline-flex; align-items:center; gap:8px;
          color:var(--lilac); text-decoration:none; font-size:0.9rem;
          margin-bottom:32px;
        }
        .pp-root h1{
          font-family:'Space Grotesk', sans-serif;
          color:var(--white);
          font-size:clamp(1.8rem,4vw,2.4rem);
          margin:0 0 8px;
        }
        .pp-updated{ font-size:0.85rem; color:rgba(246,244,248,0.5); margin-bottom:40px; }
        .pp-root h2{
          font-family:'Space Grotesk', sans-serif;
          color:var(--white);
          font-size:1.25rem;
          margin:36px 0 12px;
        }
        .pp-root p, .pp-root li{ line-height:1.7; font-size:0.98rem; }
        .pp-root ul{ padding-left:20px; }
        .pp-root a{ color:var(--green); }
        .pp-root strong{ color:var(--white); }
      `}</style>

      <div className="pp-wrap">
        <Link to="/" className="pp-back">
          <ArrowLeft size={16} />
          Volver a infinia
        </Link>

        <h1>Política de Privacidad</h1>
        <p className="pp-updated">Última actualización: {LAST_UPDATED}</p>

        <p>
          En <strong>infinia</strong> ("nosotros") respetamos tu privacidad y
          nos comprometemos a proteger los datos personales que compartes con
          nosotros a través de este sitio, nuestros formularios de contacto y
          nuestros anuncios en redes sociales.
        </p>

        <h2>1. Qué datos recopilamos</h2>
        <p>Cuando solicitas una propuesta o nos escribes, podemos recopilar:</p>
        <ul>
          <li>Nombre y datos de contacto (correo electrónico, número de WhatsApp o teléfono).</li>
          <li>Información sobre tu negocio (nombre de la marca, tipo de negocio, lo que nos cuentes sobre tus objetivos).</li>
          <li>Datos técnicos básicos de navegación (páginas visitadas, dispositivo, origen del tráfico) a través de herramientas como el Meta Pixel.</li>
        </ul>

        <h2>2. Cómo usamos tus datos</h2>
        <p>Usamos la información que nos das únicamente para:</p>
        <ul>
          <li>Responder tu solicitud y preparar una propuesta de servicios.</li>
          <li>Comunicarnos contigo por correo o WhatsApp sobre tu solicitud.</li>
          <li>Medir el rendimiento de nuestras campañas de publicidad (por ejemplo, saber si un anuncio generó un contacto real).</li>
          <li>Mejorar este sitio y nuestros servicios.</li>
        </ul>
        <p>No vendemos tus datos personales a terceros.</p>

        <h2>3. Publicidad y cookies</h2>
        <p>
          Este sitio utiliza el <strong>Meta Pixel</strong> (Facebook/Instagram) para
          medir la efectividad de nuestras campañas y mostrarte anuncios
          relevantes en esas plataformas. Meta puede recopilar datos de tu
          visita según su propia{' '}
          <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">
            Política de Datos
          </a>
          . Puedes gestionar tus preferencias de anuncios directamente desde
          la configuración de tu cuenta de Facebook o Instagram.
        </p>

        <h2>4. Con quién compartimos tu información</h2>
        <p>
          Compartimos datos únicamente con proveedores que nos ayudan a
          operar (por ejemplo, Meta para publicidad, o herramientas de
          correo/WhatsApp para comunicarnos contigo). No compartimos tu
          información con terceros para fines distintos a los descritos en
          esta política.
        </p>

        <h2>5. Tus derechos</h2>
        <p>
          Puedes pedirnos en cualquier momento que te digamos qué datos
          tenemos sobre ti, que los corrijamos, o que los eliminemos de
          nuestros registros. Para ejercer cualquiera de estos derechos,
          escríbenos a <a href="mailto:hola@beinfinia.com">hola@beinfinia.com</a>.
        </p>

        <h2>6. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta política ocasionalmente. Si hacemos
          cambios importantes, actualizaremos la fecha al inicio de esta
          página.
        </p>

        <h2>7. Contacto</h2>
        <p>
          Si tienes preguntas sobre esta política o sobre cómo usamos tus
          datos, escríbenos a{' '}
          <a href="mailto:hola@beinfinia.com">hola@beinfinia.com</a> o por
          WhatsApp al +505 8182 0910.
        </p>
      </div>
    </div>
  );
}
