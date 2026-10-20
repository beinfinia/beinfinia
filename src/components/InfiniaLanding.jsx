import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowUpRight, ArrowRight, Check, Rocket, TrendingUp, FileText, Image as ImageIcon, Clapperboard, Calendar, MessageCircle, Menu, X, Target, BarChart3, Layers, Mail, ChevronDown } from 'lucide-react';
import './InfiniaLanding.css';

const EMAIL = 'hola@beinfinia.com';
const INSTAGRAM_URL = 'https://www.instagram.com/beinfinia_/';
const waLink = (message = 'Hola infinia, quiero una propuesta de marketing digital para mi negocio.') => 'https://wa.me/50581820910?text=' + encodeURIComponent(message + '\n\n¿A qué se dedica tu negocio?\nRespuesta: \n\n¿Qué te gustaría lograr?\nRespuesta: ');
function trackContact(name) { if (typeof window.fbq === 'function') window.fbq('track', 'Contact', { content_name: name }); }
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


const services = [
  { icon: Target, title: 'Tu negocio, su propia web', text: 'Un sitio con identidad, información clara y una experiencia pensada para convertir interés en conversaciones.', tag: '01 / Páginas web' },
  { icon: Layers, title: 'Que te encuentren en Google', text: 'Creación y optimización de tu Perfil de Empresa: servicios, horarios, fotos y datos de contacto bien organizados.', tag: '02 / Google Business Profile' },
  { icon: TrendingUp, title: 'Publicidad con intención', text: 'Gestión y optimización de Meta Ads para acercar tu propuesta a las personas adecuadas.', tag: '03 / Publicidad' },
  { icon: BarChart3, title: 'Claridad para avanzar', text: 'Calendario, seguimiento y reportes mensuales para entender lo que funciona y orientar el siguiente paso.', tag: '04 / Seguimiento' }
];
const faqs = [
  { q: '¿Con qué negocios trabajan?', a: 'Nos enfocamos en negocios y emprendedores que necesitan estrategia, contenido y gestión de publicidad en español.' },
  { q: '¿Cuánto cuesta el servicio?', a: 'La inversión se define según el plan y los objetivos de tu negocio. Solicita una propuesta para conocer el alcance y el precio antes de comenzar.' },
  { q: '¿El presupuesto de anuncios está incluido?', a: 'La propuesta detalla por separado el alcance de la gestión y el presupuesto recomendado para anuncios, para que conozcas la inversión antes de aprobarla.' },
  { q: '¿En cuánto tiempo se ven resultados?', a: 'Depende del punto de partida, la oferta, el mercado y la inversión. Revisamos el desempeño mes a mes; no prometemos una cantidad fija de ventas.' },
  { q: '¿Necesito tener redes sociales creadas?', a: 'No. Si ya tienes cuentas, trabajamos sobre ellas. Si comienzas desde cero, contemplamos su creación y configuración dentro del plan.' },
  { q: '¿Puedo cambiar de plan?', a: 'Sí. Puedes ajustar el plan para el siguiente mes. El contrato es mensual; recomendamos al menos tres meses para desarrollar y evaluar la estrategia.' }
];
function Contact({ children, className = '', name, message }) { return <a className={className} href={waLink(message)} target="_blank" rel="noopener noreferrer" onClick={() => trackContact(name)}>{children}</a>; }
function Label({ children }) { return <span className="inf-label"><span aria-hidden="true">✦</span>{children}</span>; }

export default function InfiniaLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const schema = { '@context': 'https://schema.org', '@type': 'Organization', '@id': 'https://www.beinfinia.com/#organization', name: 'infinia', url: 'https://www.beinfinia.com/', logo: 'https://www.beinfinia.com/infinia-icon.png', email: EMAIL, telephone: '+50581820910', sameAs: [INSTAGRAM_URL], description: 'Marketing digital en español para negocios y emprendedores.' };
  return <div className="inf-root">
    <Helmet>
      <title>Marketing digital para negocios y emprendedores | infinia</title>
      <meta name="description" content="Estrategia, contenido, gestión de redes sociales y Meta Ads para negocios y emprendedores. Conoce los paquetes de infinia y solicita tu propuesta." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.beinfinia.com/" />
      <meta property="og:type" content="website" /><meta property="og:site_name" content="infinia" />
      <meta property="og:url" content="https://www.beinfinia.com/" /><meta property="og:title" content="Tu marca, con otra dimensión. | infinia" />
      <meta property="og:description" content="Estrategia, contenido y publicidad para negocios y emprendedores. Hablemos de tu próximo paso." />
      <meta property="og:image" content="https://www.beinfinia.com/infinia-icon.png" /><meta property="og:image:alt" content="Identidad de infinia" />
      <meta name="twitter:card" content="summary" /><meta name="twitter:image" content="https://www.beinfinia.com/infinia-icon.png" />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
    <a className="inf-skip" href="#contenido">Saltar al contenido</a>
    <header className="inf-nav"><div className="inf-container inf-nav-inner">
      <a className="inf-brand" href="/" aria-label="infinia, inicio"><img src="/infinia-icon.png" width="36" height="36" alt="" />infinia<span className="inf-brand-dot">✦</span></a>
      <button className="inf-menu-toggle" type="button" aria-controls="inf-menu" aria-expanded={menuOpen} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      <nav id="inf-menu" className={'inf-menu ' + (menuOpen ? 'is-open' : '')} aria-label="Navegación principal" onClick={() => setMenuOpen(false)}>
        <Link to="/servicios">Servicios</Link><a href="/blog">Blog</a><a href="#proceso">Proceso</a><a href="#planes">Paquetes</a><a href="#preguntas">Preguntas</a><Link to="/cita">Agendar cita</Link>
        <Contact className="inf-nav-cta" name="Navegación">Hablemos <ArrowUpRight size={16} /></Contact>
      </nav>
    </div></header>
    <main id="contenido">
      <section className="inf-hero" aria-labelledby="hero-title">
        <div className="inf-aurora" aria-hidden="true" />
        <div className="inf-container inf-hero-layout">
          <div className="inf-hero-copy"><Label>Marketing digital en español</Label>
            <h1 id="hero-title">Tu marca,<br />con otra <span>dimensión.</span></h1>
            <p className="inf-hero-sub">Páginas web, presencia en Google, contenido y publicidad. Conectamos los puntos para que tu negocio comunique mejor y dé su próximo paso.</p>
            <div className="inf-actions"><Contact className="inf-btn inf-btn-lime" name="Hero">Construyamos tu próximo paso <ArrowUpRight size={19} /></Contact><Link className="inf-text-link" to="/cita">Agendar una conversación <Calendar size={17} /></Link></div>
            <div className="inf-hero-note"><span /><span>Estrategia a tu medida. Trato directo, en español.</span></div>
          </div>
          <div className="inf-scene" aria-label="Estrategia, contenido y publicidad conectados en una sola dirección">
            <div className="inf-orbit inf-orbit-one" aria-hidden="true" /><div className="inf-orbit inf-orbit-two" aria-hidden="true" />
            <div className="inf-core" aria-hidden="true"><img src="/infinia-icon.png" width="180" height="180" alt="" /></div>
            <div className="inf-scene-chip inf-chip-top"><Target size={18} /><div><small>EL PUNTO DE PARTIDA</small><strong>Tu estrategia</strong></div></div>
            <div className="inf-scene-card"><div className="inf-scene-card-top"><span className="inf-live-dot" />El sistema de tu marca<Layers size={16} /></div><div className="inf-scene-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div><div className="inf-scene-card-bottom"><span>Contenido + publicidad</span><ArrowUpRight size={18} /></div><p>Una dirección. Una identidad.</p></div>
            <div className="inf-scene-chip inf-chip-bottom"><Clapperboard size={18} /><div><small>IDEAS QUE TOMAN FORMA</small><strong>Contenido con intención</strong></div></div>
            <span className="inf-scene-caption">ESTRATEGIA / CREATIVIDAD / CONEXIÓN</span>
          </div>
        </div>
      </section>
      <div className="inf-service-strip"><div className="inf-container"><span>Estrategia de marca</span><b aria-hidden="true">✦</b><span>Social media</span><b aria-hidden="true">✦</b><span>Meta Ads</span><b aria-hidden="true">✦</b><span>Contenido creativo</span></div></div>
      <section className="inf-section" id="servicios"><div className="inf-container">
        <div className="inf-section-head"><div><Label>Un sistema, muchas posibilidades</Label><h2>Todo conectado.<br /><span>Todo con propósito.</span></h2></div><p>Tu comunicación funciona mejor cuando la estrategia, el diseño y la publicidad avanzan juntos.</p></div>
        <div className="inf-services">{services.map(({icon: Icon, title, text, tag}, i) => <article className={'inf-service inf-service-' + i} key={title}><span className="inf-tag">{tag}</span><Icon className="inf-service-icon" size={30} /><h3>{title}</h3><p>{text}</p><a className="inf-service-link" href={i===0?"/servicios/paginas-web":i===1?"/servicios/google-business-profile":"/servicios/redes-sociales"}>Conocer el servicio ↗</a><span className="inf-service-arrow" aria-hidden="true"><ArrowUpRight size={22} /></span></article>)}</div>
      </div></section>
      <section className="inf-section inf-process-section" id="proceso"><div className="inf-container"><Label>De la idea a la acción</Label><h2>Un siguiente paso.<br /><span>Sin complicaciones.</span></h2><div className="inf-process">
        {[['01','Conocemos tu negocio','Hablamos de tu marca, tus objetivos y el punto desde el que comienzas.'],['02','Diseñamos la dirección','Preparamos una propuesta con alcance, entregables y una estrategia ajustada a tu etapa.'],['03','Creamos y medimos','Organizamos el contenido, gestionamos la publicidad y revisamos los resultados para ajustar.']].map(([n,t,d]) => <article key={n}><span className="inf-step">{n}</span><h3>{t}</h3><p>{d}</p></article>)}
      </div></div></section>
      <section className="inf-section" id="planes"><div className="inf-container"><div className="inf-section-head"><div><Label>Paquetes de marketing digital</Label><h2>El impulso correcto<br /><span>para tu etapa.</span></h2></div><p>Dos niveles de acompañamiento. Una misma intención: darle dirección a tu presencia digital.</p></div>
        <div className="inf-plans">{plans.map(plan => {const Icon = plan.icon; return <article className={'inf-plan ' + (plan.featured ? 'inf-plan-featured' : '')} key={plan.id}>
          <div className="inf-plan-top"><Icon size={27} /><span>{plan.featured ? 'Estrategia ampliada' : 'Una base sólida'}</span></div><h3>{plan.name}</h3><p className="inf-plan-description">{plan.description}</p>
          <div className="inf-plan-deliverables">{plan.deliverables.map(({icon: DIcon,value,label}) => <div key={label}><DIcon size={19} /><strong>{value}</strong><span>{label} / mes</span></div>)}</div>
          <ul>{plan.features.map(f => <li key={f}><Check size={16} />{f}</li>)}</ul><p className="inf-plan-includes"><Calendar size={17} />{plan.includes}</p>
          <div className="inf-plan-footer"><span>Cotización personalizada</span><Contact className={'inf-btn ' + (plan.featured ? 'inf-btn-lime' : 'inf-btn-outline')} name={'Plan ' + plan.name} message={plan.ctaMessage}>Solicitar propuesta <ArrowUpRight size={18} /></Contact></div>
        </article>;})}</div><p className="inf-plan-footnote">El alcance y la inversión se detallan en tu propuesta antes de comenzar.</p>
      </div></section>
      <section className="inf-section inf-faq-section" id="preguntas"><div className="inf-container inf-faq-layout"><div><Label>Hablemos claro</Label><h2>Buenas preguntas.<br /><span>Respuestas directas.</span></h2><p>Si tu negocio necesita algo diferente, conversemos sobre una propuesta a tu medida.</p><Contact className="inf-text-link" name="Preguntas">Cuéntanos tu idea <ArrowUpRight size={18} /></Contact></div><div className="inf-faq">{faqs.map(item => <details key={item.q}><summary>{item.q}<ChevronDown size={19} /></summary><p>{item.a}</p></details>)}</div></div></section>
      <section className="inf-section inf-journal"><div className="inf-container"><Label>Infinia Journal</Label><div className="inf-section-head"><div><h2>Ideas para tu<br /><span>próximo paso.</span></h2></div><p>Un espacio para explorar páginas web, presencia en Google y marketing con una mirada práctica.</p></div><a className="inf-btn inf-btn-outline" href="/blog">Explorar el blog <ArrowUpRight size={18} /></a></div></section><section className="inf-section inf-contact-section" id="contacto"><div className="inf-container"><div className="inf-contact"><Label>El próximo capítulo de tu marca</Label><h2>Hagamos espacio<br />para <span>lo que viene.</span></h2><p>Cuéntanos dónde estás y hacia dónde quieres llevar tu negocio. La siguiente idea comienza con una conversación.</p><div className="inf-actions"><Contact className="inf-btn inf-btn-lime" name="Contacto final"><MessageCircle size={19} />Hablemos por WhatsApp <ArrowUpRight size={18} /></Contact><a className="inf-text-link" href={'mailto:' + EMAIL} onClick={() => trackContact('Correo')}><Mail size={17} />{EMAIL}</a></div></div></div></section>
    </main>
    <footer className="inf-footer"><div className="inf-container"><div className="inf-footer-top"><a className="inf-brand" href="/">infinia<span className="inf-brand-dot">✦</span></a><p>Ideas con dirección.<br />Marcas con dimensión.</p><a className="inf-text-link" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">@beinfinia_ <ArrowUpRight size={17} /></a></div><div className="inf-footer-bottom"><span>© {new Date().getFullYear()} infinia</span><span>Marketing digital en español</span><Link to="/politica-de-privacidad">Política de privacidad</Link></div></div></footer>
    <Contact className="inf-floating" name="WhatsApp flotante"><MessageCircle size={23} /><span className="inf-sr-only">Contactar por WhatsApp</span></Contact>
  </div>;
}
