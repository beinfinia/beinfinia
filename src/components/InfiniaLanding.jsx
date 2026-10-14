import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  Target,
  Rocket,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  Clapperboard,
  Calendar,
  BarChart3,
  ShieldCheck,
  Headphones,
  Sparkles,
  Send,
  Check,
  Mail,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';

// Íconos de Instagram y Facebook en SVG propio — esta versión de
// lucide-react no incluye logos de marca (los retiraron por ser
// marcas registradas, no íconos genéricos). Dibujarlos aquí evita
// depender de qué íconos tenga disponibles esa librería.
function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function FacebookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.53 17.52 2 12 2S2 6.53 2 12.06c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.81 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

// El "spark" de cuadritos en cruz que acompaña al logo en el manual de
// marca (morado + verde lima alternados). Se usa como firma visual junto
// a las etiquetas de cada sección, en vez de un punto genérico — así el
// motivo de la identidad aparece en toda la página, no solo en el logo.
function BrandSpark({ size = 14, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" className={className} aria-hidden="true">
      <rect x="11" y="0" width="8" height="8" fill="var(--violet)" />
      <rect x="0" y="11" width="8" height="8" fill="var(--green)" />
      <rect x="22" y="11" width="8" height="8" fill="var(--violet)" />
      <rect x="11" y="22" width="8" height="8" fill="var(--green)" />
    </svg>
  );
}

/*
  ============================================================
  infinia — Paquetes de marketing digital
  ============================================================
  v2: SEO, copy más persuasivo, paleta morado + verde, contacto
  real (WhatsApp + correo) e interacciones inmersivas (scroll
  suave con Lenis, progreso de scroll, glow que sigue el cursor,
  tarjetas con tilt 3D).

  REQUISITOS PARA QUE FUNCIONE:
  1) react-helmet-async necesita un <HelmetProvider> en la raíz
     de tu app. En tu main.jsx:

       import { HelmetProvider } from 'react-helmet-async';
       ...
       <HelmetProvider>
         <App />
       </HelmetProvider>

  2) Si ya inicializas Lenis (scroll suave) en otro lugar de tu
     app, borra el useEffect de Lenis de este archivo para no
     duplicar el scroll suave.

  Busca "SUSTITUIR:" para los puntos que dependen de un dato tuyo
  (política de cancelación, imagen para redes sociales, etc.).
  ============================================================
*/

const WHATSAPP_NUMBER = '50581820910'; // +505 8182 0910, formato internacional sin espacios ni +
const EMAIL = 'hola@beinfinia.com';
const INSTAGRAM_URL = 'https://www.instagram.com/beinfinia_/';
// Nota: el enlace de Facebook que pegaste apuntaba a la URL de Instagram
// (probablemente un copiar/pegar cruzado). Usé la URL real de Facebook
// que coincide con tu usuario — verifica que sea la correcta.
const FACEBOOK_URL = 'https://www.facebook.com/beinfinia/';

function waLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function mailLink(subject) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
}

// Registra un evento en el Meta Pixel cuando alguien hace clic en un botón
// de contacto (WhatsApp o correo). Usa el evento estándar "Contact" para
// que Meta lo reconozca en reportes y optimización de campañas. Si el
// pixel no cargó (por un adblocker, por ejemplo) simplemente no hace nada,
// nunca rompe el clic real del botón.
function trackContact(planName) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Contact', planName ? { content_name: planName } : undefined);
  }
}

const plans = [
  {
    id: 'esencial',
    name: 'Esencial',
    icon: Rocket,
    featured: false,
    // Decisión de copy (persuasión): en vez de "para pequeños negocios"
    // (genérico), se nombra el momento exacto del negocio al que le
    // sirve — así el lector se reconoce en la frase, no solo la lee.
    description:
      'Para negocios que están empezando a tomar en serio su presencia digital y necesitan verse profesionales desde el primer post.',
    features: [
      'Estrategia mensual de contenido',
      'Diseño o actualización de línea gráfica',
      'Community Management',
      'Gestión de Meta Ads',
    ],
    deliverables: [
      { icon: FileText, value: '4', label: 'Posts' },
      { icon: ImageIcon, value: '4', label: 'Carruseles' },
      { icon: Clapperboard, value: '4', label: 'Reels' },
    ],
    includes: 'Incluye calendario mensual, reporte de resultados y soporte continuo.',
    ctaMessage: 'Hola infinia, quiero una propuesta para el plan Esencial.',
  },
  {
    id: 'profesional',
    name: 'Profesional',
    icon: TrendingUp,
    featured: true,
    description:
      'Para negocios que ya tienen presencia digital y quieren convertir esa base en más ventas, con una estrategia hecha a su medida.',
    features: [
      'Todo lo del plan Esencial',
      'Estrategia personalizada',
      'Optimización continua de Meta Ads',
      'Optimización de Google Business',
    ],
    deliverables: [
      { icon: FileText, value: '4', label: 'Posts' },
      { icon: ImageIcon, value: '8', label: 'Carruseles' },
      { icon: Clapperboard, value: '6', label: 'Reels' },
    ],
    includes: 'Incluye reportes estratégicos, soporte prioritario y seguimiento continuo.',
    ctaMessage: 'Hola infinia, quiero una propuesta para el plan Profesional.',
  },
];

const trust = [
  { icon: Target, title: 'Estrategias efectivas', text: 'Estrategias diseñadas para tus objetivos, no plantillas genéricas.' },
  { icon: BarChart3, title: 'Resultados medibles', text: 'Reportes claros que muestran exactamente qué está creciendo.' },
  { icon: Headphones, title: 'Soporte continuo', text: 'Acompañamiento constante, no solo al firmar.' },
  { icon: ShieldCheck, title: 'Enfoque en tu marca', text: 'Soluciones pensadas para tu negocio y tu comunidad.' },
];

const faqs = [
  {
    q: '¿Cuánto cuesta el servicio?',
    a: 'La inversión depende del tamaño de tu negocio y del plan que mejor se ajuste a tus objetivos. Cuéntanos de qué se trata y te preparamos una propuesta con el precio, sin compromiso.',
  },
  {
    q: '¿En cuánto tiempo se ven resultados?',
    a: 'Los primeros cambios —mejor imagen de marca, más interacción— suelen notarse desde la primera semana. El crecimiento sostenido en ventas toma más tiempo y lo vas viendo reflejado mes a mes en tu reporte de resultados.',
  },
  {
    q: '¿El contrato es de larga duración?',
    a: 'No, el contrato es por un mes, sin embargo, recomendamos un mínimo de 3 meses para que la estrategia tenga tiempo de dar resultados.',
  },
  {
    q: '¿Necesito tener redes sociales creadas ya?',
    a: 'No. Si ya tienes cuentas, trabajamos sobre ellas; si estás empezando desde cero, te las creamos y configuramos como parte del plan.',
  },
  {
    q: '¿Puedo cambiar de plan más adelante?',
    a: 'Sí, puedes subir o bajar de plan cuando tu negocio lo necesite — solo escríbenos y lo ajustamos para el siguiente mes.',
  },
];

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.2 });
  return <motion.div className="inf-progress" style={{ scaleX }} aria-hidden="true" />;
}

function TiltCard({ children, className, featured }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 6);
    rx.set(py * -6);
  }
  function handleLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45 }}
    >
      {children}
    </motion.div>
  );
}

export default function InfiniaLanding() {
  const heroRef = useRef(null);

  // Glow que sigue el cursor en el hero — refuerza la idea de "señal" /
  // alcance sin añadir movimiento constante innecesario (solo reacciona
  // a la intención real del usuario: mover el mouse).
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    function onMove(e) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      el.style.setProperty('--my', `${e.clientY - rect.top}px`);
    }
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  // Scroll suave con Lenis. Si ya lo inicializas en main.jsx / App.jsx,
  // borra este bloque para no duplicarlo.
  useEffect(() => {
    let lenis;
    let rafId;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      import('lenis').then(({ default: Lenis }) => {
        lenis = new Lenis({ duration: 1.05, easing: (t) => 1 - Math.pow(1 - t, 3) });
        function raf(time) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
      });
    }
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const blobY = useTransform(heroProgress, [0, 1], [0, 140]);
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const blobOpacity = useTransform(heroProgress, [0, 1], [0.6, 0]);

  return (
    <div className="inf-root">
      <Helmet>
        <title>infinia | Marketing Digital para Negocios Latinos en EE. UU.</title>
        <meta
          name="description"
          content="Estrategia, contenido y publicidad hechos a la medida para hacer crecer tu negocio latino en EE. UU. Solicita tu propuesta personalizada hoy."
        />
        <meta
          name="keywords"
          content="marketing digital, marketing para negocios latinos, agencia de marketing EE. UU., gestión de redes sociales, publicidad Meta Ads, community management"
        />
        <link rel="canonical" href="https://www.beinfinia.com/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="infinia" />
        <meta property="og:url" content="https://www.beinfinia.com/" />
        <meta property="og:title" content="infinia | Marketing Digital para Negocios Latinos en EE. UU." />
        <meta
          property="og:description"
          content="Estrategia, contenido y publicidad para hacer crecer tu negocio, con una propuesta personalizada según tu etapa actual."
        />
        {/* SUSTITUIR: agrega una imagen real de 1200x630px para vista previa en redes */}
        <meta property="og:image" content="https://www.beinfinia.com/og-image.jpg" />
        <meta property="og:locale" content="es_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="infinia | Marketing Digital para Negocios Latinos en EE. UU." />
        <meta
          name="twitter:description"
          content="Paquetes de marketing digital hechos a la medida. Solicita tu propuesta personalizada hoy."
        />

        {/* Datos estructurados para buscadores */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: 'infinia',
            description:
              'Agencia de marketing digital enfocada en negocios y emprendedores latinos en Estados Unidos.',
            areaServed: 'US',
            email: EMAIL,
            telephone: '+505 8182 0910',
            // No mostramos precio exacto en la página (se cotiza por
            // WhatsApp/correo), pero "priceRange" sí es útil para SEO:
            // le dice a Google que el servicio está en un rango medio,
            // sin revelar el número — ajusta "$$" si tu posicionamiento
            // cambia (rango va de "$" a "$$$$").
            priceRange: '$$',
            // Conecta esta entidad con tus perfiles reales — ayuda a
            // Google a entender que es la misma marca en todas partes
            // (relevante para el Knowledge Panel a futuro).
            sameAs: [INSTAGRAM_URL, FACEBOOK_URL],
            makesOffer: plans.map((p) => ({
              '@type': 'Offer',
              name: `Paquete ${p.name}`,
              description: p.description,
            })),
          })}
        </script>

        {/*
          Datos estructurados FAQPage — usa las mismas preguntas del
          arreglo `faqs` de abajo, así nunca se desincronizan. Esto
          habilita que Google muestre las preguntas desplegables
          directamente en el resultado de búsqueda (rich snippet).
        */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
              },
            })),
          })}
        </script>
      </Helmet>

      <ScrollProgress />
      <div className="inf-grain" aria-hidden="true" />

      <header className="inf-nav">
        <div className="inf-wrap inf-nav-inner">
          <span className="inf-nav-brand">
            <motion.img
              src="/infinia-icon.png"
              alt="infinia"
              className="inf-nav-logo"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ rotate: -6, scale: 1.06 }}
              transition={{ duration: 0.4 }}
            />
            infinia
          </span>
          <div className="inf-social-row">
            <a
              href={INSTAGRAM_URL}
              className="inf-social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="infinia en Instagram"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href={FACEBOOK_URL}
              className="inf-social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="infinia en Facebook"
            >
              <FacebookIcon size={18} />
            </a>
          </div>
        </div>
      </header>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Montserrat:wght@400;500;600;700&display=swap');

        /* Anula el max-width/padding/centrado que trae por defecto la
           plantilla de Vite en html/body/#root — si no, el contenido
           queda encerrado en una caja angosta con el fondo del body
           (más oscuro/negro) visible a los lados. */
        html, body{
          margin:0; padding:0;
          width:100%;
          max-width:none;
          min-width:0;
        }
        #root{
          max-width:none !important;
          margin:0 !important;
          padding:0 !important;
          width:100%;
          display:block !important;
          text-align:left !important;
        }

        .inf-root{
          --void:#0a0a0e;
          --panel:#141018;
          --panel-soft:#191320;
          --violet:#7e3bed;
          --violet-deep:#5b21b6;
          --lilac:#e2d4ff;
          --green:#c6ff34;
          --green-deep:#7a9e16;
          --green-soft:#eaffb0;
          --white:#f6f4f8;
          --line: rgba(246,244,248,0.12);
          --glow-v: rgba(126,59,237,0.45);
          --glow-g: rgba(198,255,52,0.35);
          background:var(--void);
          color:var(--white) !important;
          color-scheme:dark;
          font-family:'Montserrat', sans-serif;
          -webkit-font-smoothing:antialiased;
          overflow-x:hidden;
          position:relative;
          isolation:isolate;
          width:100%;
        }
        /* Aísla el componente de cualquier CSS global del proyecto host
           (por ejemplo la regla @media(prefers-color-scheme:light) que
           trae src/index.css por defecto en la plantilla de Vite, y que
           puede pintar el texto oscuro si el teléfono está en modo claro). */
        .inf-root *{ box-sizing:border-box; color-scheme:dark; }
        .inf-root h1, .inf-root h2, .inf-root h3{
          font-family:'Space Grotesk', sans-serif;
          margin:0;
          letter-spacing:-0.01em;
        }
        .inf-wrap{ max-width:1080px; margin:0 auto; padding:0 clamp(20px,5vw,48px); }
        .inf-eyebrow{
          font-family:'Montserrat', sans-serif;
          font-size:0.72rem;
          letter-spacing:0.14em;
          text-transform:uppercase;
          color:var(--lilac);
          display:inline-flex;
          align-items:center;
          gap:0.55em;
        }
        .inf-eyebrow-spark{ flex-shrink:0; filter:drop-shadow(0 0 6px var(--glow-v)); }

        .inf-progress{
          position:fixed; top:0; left:0; right:0; height:3px;
          transform-origin:0%;
          background:linear-gradient(90deg, var(--violet), var(--green));
          z-index:100;
        }

        /* Grano sutil sobre toda la página — le da textura/profundidad
           al fondo plano en vez de que se sienta un degradado digital
           liso. Es puramente decorativo (pointer-events:none) y muy
           tenue; con mix-blend-mode:overlay se funde con lo que hay
           debajo en vez de verse como una capa encima. */
        .inf-grain{
          position:fixed; inset:0; z-index:5;
          pointer-events:none;
          opacity:0.05;
          mix-blend-mode:overlay;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:140px 140px;
        }

        /* ---------- NAV ---------- */
        .inf-nav{
          position:sticky; top:0; z-index:80;
          background:rgba(10,10,14,0.7);
          backdrop-filter:blur(10px);
          -webkit-backdrop-filter:blur(10px);
          border-bottom:1px solid var(--line);
        }
        .inf-nav-inner{
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 0;
        }
        .inf-nav-brand{
          font-family:'Space Grotesk', sans-serif;
          font-weight:600;
          font-size:1.05rem;
          color:var(--white);
          display:inline-flex;
          align-items:center;
          gap:10px;
        }
        .inf-nav-logo{ height:28px; width:auto; display:block; }
        .inf-social-row{ display:flex; align-items:center; gap:10px; }
        .inf-social-link{
          width:36px; height:36px; border-radius:50%;
          border:1px solid var(--line);
          display:flex; align-items:center; justify-content:center;
          color:var(--white);
          transition:border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
        }
        .inf-social-link:hover{ border-color:var(--violet); color:var(--lilac); transform:translateY(-2px); }
        .inf-social-link:focus-visible{ outline:2px solid var(--green); outline-offset:2px; }

        /* En móvil el nav se despega del borde y se vuelve una isla
           flotante (estilo "Dynamic Island"): sigue siendo sticky, solo
           que ahora respira aire alrededor y flota con sombra + halo de
           marca en vez de ser una barra pegada de borde a borde. En
           desktop se queda como barra completa — la isla es un gesto de
           pantalla chica, no tiene sentido a 1200px de ancho. */
        @media(max-width:899px){
          .inf-nav{
            top:10px;
            margin:10px 14px 0;
            border:1px solid var(--line);
            border-radius:999px;
            background:rgba(20,16,24,0.82);
            box-shadow:
              0 12px 32px -14px rgba(0,0,0,0.6),
              0 0 0 1px rgba(126,59,237,0.14),
              0 0 26px -8px var(--glow-v);
          }
          .inf-nav-inner{ padding:8px 8px 8px 18px; }
          .inf-nav-logo{ height:24px; }
        }

        /* ---------- HERO ---------- */
        .inf-hero{
          position:relative;
          padding:clamp(88px,20vw,140px) 0 clamp(56px,10vw,110px);
          width:100%;
        }
        /* Pantalla completa solo en escritorio — en móvil el hero mide
           lo que su contenido necesita, para no dejar espacio vacío. */
        @media(min-width:900px){
          .inf-hero{
            min-height:100svh;
            min-height:100vh;
            display:flex;
            align-items:center;
            padding-top:96px;
            padding-bottom:96px;
          }
        }
        .inf-hero-cursor-glow{
          position:absolute; inset:0;
          background:radial-gradient(360px circle at var(--mx,50%) var(--my,20%), rgba(126,59,237,0.16), transparent 60%);
          pointer-events:none;
          display:none;
        }
        @media(min-width:900px){
          .inf-hero-cursor-glow{ display:block; }
        }
        .inf-hero-blob{
          position:absolute;
          top:-140px; left:50%; transform:translateX(-50%);
          width:min(680px, 140vw);
          height:460px;
          background:radial-gradient(closest-side, var(--glow-v), transparent 70%);
          filter:blur(14px);
          pointer-events:none;
          opacity:0.35;
        }
        .inf-hero-blob-2{
          position:absolute;
          top:60px; right:calc(50% - 460px);
          width:320px; height:320px;
          background:radial-gradient(closest-side, var(--glow-g), transparent 72%);
          filter:blur(20px);
          pointer-events:none;
          opacity:0.3;
          display:none;
        }
        @media(min-width:640px){
          .inf-hero-blob{ opacity:0.6; }
          .inf-hero-blob-2{ display:block; opacity:0.5; }
        }
        .inf-hero-spark{
          position:absolute;
          top:18%;
          right:calc(50% - 340px);
          display:none;
        }
        @media(min-width:760px){
          .inf-hero-spark{ display:block; }
        }
        .inf-hero-inner{ position:relative; z-index:1; text-align:center; width:100%; }
        .inf-hero h1{
          margin-top:22px;
          font-size:clamp(2rem, 8vw, 4.1rem);
          line-height:1.15;
          overflow-wrap:break-word;
          padding:0 4px;
        }
        .inf-hero h1 .inf-accent{
          display:block;
          padding-bottom:0.08em;
          background:linear-gradient(90deg, var(--violet), var(--green));
          -webkit-background-clip:text;
          background-clip:text;
          -webkit-text-fill-color:transparent;
          color:transparent;
        }
        .inf-hero p.inf-sub{
          margin:22px auto 0; max-width:54ch;
          font-size:clamp(1rem,1.6vw,1.15rem); line-height:1.6;
          color:rgba(246,244,248,0.72) !important;
        }
        .inf-hero-actions{
          margin-top:32px;
          display:flex; flex-wrap:wrap; gap:14px; justify-content:center;
        }
        .inf-hero-note{
          margin-top:26px;
          display:inline-flex; align-items:center; gap:8px;
          font-family:'Montserrat', sans-serif; font-size:0.78rem; color:var(--lilac);
          border:1px solid var(--line); padding:8px 16px; border-radius:999px;
          background:rgba(126,59,237,0.08);
        }
        .inf-hero-badges{
          margin-top:40px;
          display:flex; flex-wrap:wrap; gap:12px; justify-content:center;
        }
        .inf-mini-badge{
          font-family:'Montserrat', sans-serif;
          font-size:0.72rem;
          color:rgba(246,244,248,0.6);
          display:inline-flex; align-items:center; gap:6px;
        }
        .inf-mini-badge svg{ color:var(--green); }

        /* ---------- PLANES ---------- */
        .inf-plans{ padding:clamp(48px,8vw,72px) 0 clamp(80px,10vw,110px); position:relative; }
        .inf-plans-head{ text-align:center; max-width:58ch; margin:0 auto 48px; }
        .inf-plans-head h2{ margin-top:14px; font-size:clamp(1.8rem,3.4vw,2.4rem); }
        .inf-plans-head p{ margin-top:14px; color:rgba(246,244,248,0.68); line-height:1.6; }

        .inf-grid{ display:grid; grid-template-columns:repeat(auto-fit, minmax(280px,1fr)); gap:28px; align-items:start; }
        .inf-card{
          position:relative;
          background:var(--panel);
          border:1px solid var(--line);
          border-radius:14px;
          padding:clamp(28px,4vw,36px);
          background-image:
            linear-gradient(var(--panel), var(--panel)),
            linear-gradient(rgba(246,244,248,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(246,244,248,0.045) 1px, transparent 1px);
          background-size: 100% 100%, 28px 28px, 28px 28px;
          transform-style:preserve-3d;
          will-change:transform;
        }
        .inf-card.inf-featured{
          border-color:var(--violet);
          box-shadow:0 0 0 1px var(--violet), 0 24px 60px -20px var(--glow-v);
          background-color:var(--panel-soft);
        }
        .inf-badge{
          position:absolute; top:-14px; left:50%; transform:translateX(-50%);
          background:linear-gradient(90deg, var(--violet-deep), var(--violet));
          font-family:'Montserrat', sans-serif; font-size:0.7rem; letter-spacing:0.06em;
          padding:6px 14px; border-radius:999px;
          display:inline-flex; align-items:center; gap:6px;
        }
        .inf-card-icon{
          width:56px; height:56px; border-radius:50%; border:1px solid var(--line);
          display:flex; align-items:center; justify-content:center; color:var(--lilac);
          margin-bottom:18px;
        }
        .inf-card h3{ font-size:1.5rem; }
        .inf-card .inf-desc{ margin-top:10px; font-size:0.94rem; line-height:1.55; color:rgba(246,244,248,0.68); min-height:66px; }
        .inf-divider{ border:none; border-top:1px solid var(--line); margin:18px 0; }
        .inf-features{ list-style:none; margin:0; padding:0; display:grid; gap:12px; }
        .inf-features li{ display:flex; align-items:flex-start; gap:10px; font-size:0.92rem; color:rgba(246,244,248,0.88); }
        .inf-features svg{ flex-shrink:0; margin-top:2px; color:var(--green); }

        .inf-deliverables{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin:22px 0; }
        .inf-deliverable{ border:1px solid var(--line); border-radius:8px; padding:14px 8px; text-align:center; }
        .inf-deliverable svg{ color:var(--lilac); margin-bottom:6px; }
        .inf-deliverable .inf-d-value{ font-family:'Space Grotesk', sans-serif; font-size:1.3rem; font-weight:600; }
        .inf-deliverable .inf-d-label{ font-size:0.72rem; color:rgba(246,244,248,0.6); }

        .inf-includes{ display:flex; gap:10px; align-items:flex-start; font-size:0.86rem; color:rgba(246,244,248,0.65); line-height:1.5; }
        .inf-includes svg{ flex-shrink:0; margin-top:2px; color:var(--violet); }

        .inf-price-tag{
          font-family:'Montserrat', sans-serif; font-size:0.68rem; letter-spacing:0.1em; text-transform:uppercase;
          color:var(--green-soft); background:rgba(198,255,52,0.12);
          display:inline-block; padding:4px 12px; border-radius:999px; margin-top:24px;
        }
        .inf-price-note{ margin-top:10px; font-size:0.86rem; color:rgba(246,244,248,0.65); line-height:1.5; }

        .inf-btn{
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          padding:14px 20px; border-radius:8px;
          font-family:'Montserrat', sans-serif; font-weight:600; font-size:0.95rem;
          border:1px solid transparent; cursor:pointer;
          transition:transform 0.15s ease, filter 0.15s ease;
          text-decoration:none;
        }
        .inf-btn:hover{ filter:brightness(1.08); }
        .inf-btn:active{ transform:scale(0.98); }
        .inf-btn:focus-visible{ outline:2px solid var(--green); outline-offset:3px; }
        .inf-btn-solid{ background:linear-gradient(90deg, var(--violet-deep), var(--violet)); color:var(--white); width:100%; margin-top:24px; }
        .inf-btn-whatsapp{ background:linear-gradient(90deg, var(--green-deep), var(--green)); color:#06210f; }
        .inf-btn-outline{ background:transparent; color:var(--white); border-color:var(--line); }

        /* ---------- CONFIANZA ---------- */
        .inf-trust{ padding:clamp(56px,8vw,80px) 0; border-top:1px solid var(--line); }
        .inf-trust-head{ max-width:56ch; margin:0 auto 36px; text-align:center; }
        .inf-trust-head h2{ margin-top:14px; font-size:clamp(1.6rem,3vw,2.1rem); }
        .inf-trust-grid{ display:grid; grid-template-columns:repeat(auto-fit, minmax(210px,1fr)); gap:28px; }
        .inf-trust-item{ display:flex; gap:14px; align-items:flex-start; }
        .inf-trust-item svg{ color:var(--green); flex-shrink:0; margin-top:2px; }
        .inf-trust-item h4{ font-family:'Space Grotesk', sans-serif; font-size:1rem; margin:0 0 4px; }
        .inf-trust-item p{ margin:0; font-size:0.86rem; color:rgba(246,244,248,0.62); line-height:1.5; }

        /* ---------- FAQ ---------- */
        .inf-faq{ padding:clamp(56px,8vw,80px) 0; border-top:1px solid var(--line); }
        .inf-faq-head{ max-width:56ch; margin:0 auto 36px; text-align:center; }
        .inf-faq-head h2{ margin-top:14px; font-size:clamp(1.6rem,3vw,2.1rem); }
        .inf-faq-list{ max-width:720px; margin:0 auto; display:grid; gap:12px; }
        .inf-faq-item{
          border:1px solid var(--line); border-radius:10px; padding:6px 20px;
          background:var(--panel);
        }
        .inf-faq-item summary{
          cursor:pointer; list-style:none;
          display:flex; align-items:center; justify-content:space-between; gap:16px;
          padding:16px 0; font-family:'Space Grotesk', sans-serif; font-size:1rem; font-weight:600;
        }
        .inf-faq-item summary::-webkit-details-marker{ display:none; }
        .inf-faq-item summary svg{ transition:transform 0.2s ease; color:var(--green); flex-shrink:0; }
        .inf-faq-item[open] summary svg{ transform:rotate(180deg); }
        .inf-faq-item p{ margin:0 0 18px; font-size:0.92rem; line-height:1.6; color:rgba(246,244,248,0.68); }

        /* ---------- CTA FINAL ---------- */
        .inf-final{ text-align:center; padding:clamp(56px,9vw,88px) 0 clamp(80px,10vw,110px); }
        .inf-final-inner{
          border:1px solid var(--line); border-radius:20px;
          padding:clamp(40px,6vw,64px) clamp(24px,5vw,48px);
          background:radial-gradient(120% 140% at 50% -10%, rgba(126,59,237,0.18), transparent 60%),
                     radial-gradient(80% 100% at 100% 100%, rgba(198,255,52,0.12), transparent 60%);
        }
        .inf-final h2{ font-size:clamp(1.7rem,3.4vw,2.3rem); }
        .inf-final p{ margin-top:14px; color:rgba(246,244,248,0.68); max-width:46ch; margin-left:auto; margin-right:auto; }
        .inf-final-actions{ margin-top:26px; display:flex; flex-wrap:wrap; gap:14px; justify-content:center; }
        .inf-final-social{
          margin-top:34px; padding-top:28px; border-top:1px solid var(--line);
          display:flex; flex-direction:column; align-items:center; gap:12px;
        }

        /* ---------- WHATSAPP FLOTANTE ---------- */
        .inf-float-wa{
          position:fixed; right:20px; bottom:20px; z-index:90;
          width:56px; height:56px; border-radius:50%;
          background:linear-gradient(135deg, var(--green-deep), var(--green));
          display:flex; align-items:center; justify-content:center;
          color:#06210f;
          box-shadow:0 10px 30px -8px rgba(198,255,52,0.6);
        }
        .inf-float-wa::before{
          content:"";
          position:absolute; inset:0; border-radius:50%;
          border:2px solid var(--green);
          animation:inf-pulse 2.2s ease-out infinite;
        }
        @keyframes inf-pulse{
          0%{ transform:scale(1); opacity:0.6; }
          100%{ transform:scale(1.7); opacity:0; }
        }

        .inf-footer{ border-top:1px solid var(--line); padding:24px 0; }
        .inf-footer-inner{
          display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between;
          font-size:0.82rem; color:rgba(246,244,248,0.5);
        }
        .inf-footer-inner a{ color:rgba(246,244,248,0.5); text-decoration:none; }
        .inf-footer-inner a:hover{ color:var(--lilac); }

        @media (prefers-reduced-motion: reduce){
          .inf-root *{ animation:none!important; transition:none!important; }
          .inf-float-wa::before{ display:none; }
        }
      `}</style>

      {/*
        SUSTITUIR: titular del hero.
        Decisión de copy (persuasión): el titular usa dos frases cortas
        con un salto de línea — la primera nombra la percepción (marca
        que se nota), la segunda la valida con lógica (resultados que se
        miden). Es la estructura clásica de "promesa emocional + respaldo
        racional" para no sonar solo a eslogan.
      */}
      <section className="inf-hero" ref={heroRef}>
        <motion.div className="inf-hero-blob" style={{ y: blobY, opacity: blobOpacity }} />
        <div className="inf-hero-blob-2" />
        <div className="inf-hero-cursor-glow" />
        <motion.div
          className="inf-hero-spark"
          animate={
            prefersReducedMotion
              ? undefined
              : { opacity: [0.4, 1, 0.4], scale: [1, 1.12, 1], rotate: [0, 8, 0] }
          }
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <BrandSpark size={30} />
        </motion.div>
        <div className="inf-wrap inf-hero-inner">
          <span className="inf-eyebrow"><BrandSpark size={12} className="inf-eyebrow-spark" />infinia · marketing digital</span>
          <h1>
            Marketing digital que se nota.
            <span className="inf-accent">Resultados que se miden.</span>
          </h1>
          <p className="inf-sub">
            Diseñamos e implementamos tu estrategia de contenido, publicidad y presencia digital, orientada a un crecimiento sostenido y medible de tu negocio.
          </p>

          <div className="inf-hero-actions">
            <a href="#planes" className="inf-btn inf-btn-solid" style={{ width: 'auto', marginTop: 0 }}>
              Ver paquetes
            </a>
            <a
              href={waLink('Hola infinia, quiero información sobre los paquetes de marketing digital.')}
              className="inf-btn inf-btn-whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackContact('Hero')}
            >
              <MessageCircle size={16} />
              Escríbenos por WhatsApp
            </a>
          </div>

          <div className="inf-hero-note">
            <Sparkles size={14} />
            Propuesta personalizada — respondemos el mismo día hábil
          </div>

          <div className="inf-hero-badges" aria-label="Beneficios de trabajar con infinia">
            <span className="inf-mini-badge"><Check size={14} /> Sin letra pequeña</span>
            <span className="inf-mini-badge"><Check size={14} /> Reportes mensuales reales</span>
            <span className="inf-mini-badge"><Check size={14} /> Trato directo, en español</span>
          </div>
        </div>
      </section>

      {/*
        SUSTITUIR: si cambian entregables o descripciones, edita el
        arreglo `plans` al inicio del archivo — el diseño se ajusta solo.
        Los planes ya no muestran precio: la propuesta con precio se
        entrega por WhatsApp/correo después de conocer el negocio, así
        se captura el contacto antes de la conversación de precio.
        Decisión de copy (persuasión): cada descripción de plan nombra
        el MOMENTO del negocio al que sirve ("está empezando" vs. "ya
        tiene presencia digital"), no solo la lista de tareas — así la persona
        se autoselecciona por etapa, que vende mejor que comparar
        características sueltas.
      */}
      <section className="inf-plans" id="planes">
        <div className="inf-wrap">
          <div className="inf-plans-head">
            <span className="inf-eyebrow"><BrandSpark size={12} className="inf-eyebrow-spark" />Paquetes</span>
            <h2>Elige el nivel de acompañamiento que necesita tu marca hoy.</h2>
            <p>
              Ambos planes incluyen estrategia, contenido y publicidad activa.
              La diferencia está en cuánto quieres delegar y con qué
              frecuencia quieres publicar.
            </p>
          </div>

          <div className="inf-grid">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <TiltCard
                  key={plan.id}
                  className={`inf-card ${plan.featured ? 'inf-featured' : ''}`}
                  featured={plan.featured}
                >
                  {plan.featured && (
                    <span className="inf-badge">
                      <Sparkles size={12} /> Más elegido
                    </span>
                  )}
                  <div className="inf-card-icon">
                    <Icon size={24} />
                  </div>
                  <h3>{plan.name}</h3>
                  <p className="inf-desc">{plan.description}</p>
                  <hr className="inf-divider" />
                  <ul className="inf-features">
                    {plan.features.map((f) => (
                      <li key={f}>
                        <Check size={16} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="inf-deliverables">
                    {plan.deliverables.map((d) => {
                      const DIcon = d.icon;
                      return (
                        <div className="inf-deliverable" key={d.label}>
                          <DIcon size={18} />
                          <div className="inf-d-value">{d.value}</div>
                          <div className="inf-d-label">{d.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="inf-includes">
                    <Calendar size={16} />
                    <span>{plan.includes}</span>
                  </div>

                  <span className="inf-price-tag">Cotización personalizada</span>
                  <p className="inf-price-note">
                    La inversión se ajusta al tamaño y los objetivos de tu
                    negocio — te la confirmamos en tu propuesta.
                  </p>

                  <a
                    href={waLink(plan.ctaMessage)}
                    className="inf-btn inf-btn-solid"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackContact(`Plan ${plan.name}`)}
                  >
                    <Send size={16} />
                    Solicitar propuesta
                  </a>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      <section className="inf-trust">
        <div className="inf-wrap">
          <div className="inf-trust-head">
            <span className="inf-eyebrow"><BrandSpark size={12} className="inf-eyebrow-spark" />Por qué infinia</span>
            <h2>Marketing digital pensado para negocios como el tuyo.</h2>
          </div>
          <div className="inf-trust-grid">
            {trust.map((t, i) => {
              const TIcon = t.icon;
              return (
                <motion.div
                  className="inf-trust-item"
                  key={t.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: prefersReducedMotion ? 0 : i * 0.08 }}
                >
                  <TIcon size={22} />
                  <div>
                    <h4>{t.title}</h4>
                    <p>{t.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/*
        Decisión de copy (SEO + persuasión): las preguntas usan el mismo
        lenguaje que alguien buscaría en Google ("¿cuánto cuesta...",
        "¿trabajan con...") en vez de preguntas genéricas de agencia —
        así la sección también funciona como contenido indexable.
      */}
      <section className="inf-faq" id="preguntas">
        <div className="inf-wrap">
          <div className="inf-faq-head">
            <span className="inf-eyebrow"><BrandSpark size={12} className="inf-eyebrow-spark" />Preguntas frecuentes</span>
            <h2>Antes de escribirnos, esto puede ayudarte.</h2>
          </div>
          <div className="inf-faq-list">
            {faqs.map((item, i) => (
              <motion.details
                className="inf-faq-item"
                key={item.q}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.35, delay: prefersReducedMotion ? 0 : i * 0.06 }}
              >
                <summary>
                  {item.q}
                  <ChevronDown size={18} />
                </summary>
                <p>{item.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/*
        SUSTITUIR: CTA de cierre.
        Decisión de copy: ofrece dos canales (WhatsApp y correo) en vez
        de forzar uno solo — reduce la fricción para quien prefiere
        escribir un correo formal frente a quien prefiere WhatsApp.
      */}
      <section className="inf-final">
        <div className="inf-wrap">
          <motion.div
            className="inf-final-inner"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45 }}
          >
            <span className="inf-eyebrow"><BrandSpark size={12} className="inf-eyebrow-spark" />infinia</span>
            <h2 style={{ marginTop: 14 }}>Impulsa tu marca al siguiente nivel.</h2>
            <p>
              Cuéntanos sobre tu negocio y te preparamos una propuesta con el
              plan que mejor se ajusta a tu etapa actual. Respondemos el
              mismo día hábil.
            </p>
            <div className="inf-final-actions">
              <a
                href={waLink('Hola infinia, quiero una propuesta de marketing digital para mi negocio.')}
                className="inf-btn inf-btn-whatsapp"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContact('CTA final - WhatsApp')}
              >
                <MessageCircle size={16} />
                Escríbenos por WhatsApp
              </a>
              <a
                href={mailLink('Quiero una propuesta de marketing digital')}
                className="inf-btn inf-btn-outline"
                onClick={() => trackContact('CTA final - Correo')}
              >
                <Mail size={16} />
                {EMAIL}
              </a>
            </div>

            <div className="inf-final-social">
              <span className="inf-eyebrow" style={{ marginBottom: 0 }}><BrandSpark size={12} className="inf-eyebrow-spark" />Síguenos</span>
              <div className="inf-social-row">
                <a
                  href={INSTAGRAM_URL}
                  className="inf-social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="infinia en Instagram"
                >
                  <InstagramIcon size={18} />
                </a>
                <a
                  href={FACEBOOK_URL}
                  className="inf-social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="infinia en Facebook"
                >
                  <FacebookIcon size={18} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <a
        href={waLink('Hola infinia, quiero información sobre los paquetes de marketing digital.')}
        className="inf-float-wa"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir por WhatsApp"
        onClick={() => trackContact('Botón flotante')}
      >
        <MessageCircle size={24} />
      </a>

      <footer className="inf-footer">
        <div className="inf-wrap inf-footer-inner">
          <span>© {new Date().getFullYear()} infinia</span>
          <Link to="/politica-de-privacidad">Política de privacidad</Link>
        </div>
      </footer>
    </div>
  );
}