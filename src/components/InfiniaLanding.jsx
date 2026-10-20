import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowUpRight, ArrowRight, Check, Rocket, TrendingUp, FileText, Image as ImageIcon, Clapperboard, Calendar, MessageCircle, Menu, X, Target, BarChart3, Layers, Mail, ChevronDown } from 'lucide-react';
import './InfiniaLanding.css';

const EMAIL = 'hola@beinfinia.com';
const INSTAGRAM_URL = 'https://www.instagram.com/beinfinia_/';
const waLink = (message = 'Hola Infinia, quiero captar clientes potenciales para mi negocio.') => 'https://wa.me/50581820910?text=' + encodeURIComponent(message + '\n\n¿A qué se dedica tu negocio?\nRespuesta: \n\n¿Qué te gustaría lograr?\nRespuesta: ');
function trackContact(name) { if (typeof window.fbq === 'function') window.fbq('track', 'Contact', { content_name: name }); }
const plans = [
 {id:'captacion',name:'Captación',icon:Rocket,featured:false,description:'Para negocios que quieren comenzar a recibir consultas con una campaña enfocada en su servicio.',features:['Estrategia de oferta y audiencia','Configuración y gestión de campañas Meta Ads','Creativos publicitarios según propuesta','Formulario de captación de contactos','Revisión de resultados y optimización'],deliverables:[{icon:Target,value:'Ads',label:'Campañas'},{icon:FileText,value:'Leads',label:'Formulario'},{icon:BarChart3,value:'Datos',label:'Resultados'}],includes:'Alcance, frecuencia de revisión y entregables definidos antes de comenzar.',ctaMessage:'Hola Infinia, me interesa el paquete Captación.'},
 {id:'conversion',name:'Conversión',icon:TrendingUp,featured:true,description:'Para conectar tus anuncios con una página que explique tu oferta y facilite consultas o reservas.',features:['Todo lo de Captación','Landing enfocada en una oferta','Formulario y conexión con agenda','Configuración de medición de acciones','Revisión del recorrido del visitante'],deliverables:[{icon:Target,value:'Ads',label:'Atracción'},{icon:Layers,value:'Web',label:'Landing'},{icon:Calendar,value:'Citas',label:'Agenda'}],includes:'Diseño, integraciones y mantenimiento se delimitan en la propuesta.',ctaMessage:'Hola Infinia, me interesa el paquete Conversión.'},
 {id:'seguimiento',name:'Seguimiento',icon:Layers,featured:false,description:'Para negocios que necesitan ordenar sus oportunidades y dar continuidad a cada contacto.',features:['Todo lo de Conversión','Organización de contactos en CRM','Etapas de seguimiento comercial','Automatizaciones acordadas según el proceso','Reportes de captación y seguimiento'],deliverables:[{icon:Target,value:'Leads',label:'Captación'},{icon:Layers,value:'CRM',label:'Organización'},{icon:TrendingUp,value:'Flujo',label:'Seguimiento'}],includes:'Canales, automatizaciones y costos de herramientas se acuerdan antes de activar.',ctaMessage:'Hola Infinia, me interesa el paquete Seguimiento.'}
];
const services = [
 {icon:Target,title:'Campañas que abren conversaciones',text:'Estrategia, creativos y gestión de Meta Ads para presentar tu oferta y captar personas interesadas.',tag:'01 / Campañas Ads',href:'/servicios/campanas-ads'},
 {icon:Layers,title:'Una página para dar el siguiente paso',text:'Landing pages con una oferta clara, formularios y llamadas a la acción para tus campañas.',tag:'02 / Landing pages',href:'/servicios/paginas-web'},
 {icon:BarChart3,title:'Cada oportunidad, en su lugar',text:'Organización de contactos, agenda y seguimiento según el proceso comercial de tu negocio.',tag:'03 / CRM y seguimiento',href:'/servicios/seguimiento'},
 {icon:TrendingUp,title:'Una presencia que respalda tu oferta',text:'Páginas web, contenido y Perfil de Negocio en Google como servicios complementarios.',tag:'04 / Presencia digital',href:'/servicios/google-business-profile'}
];
const faqs = [
  { q: '¿Con qué negocios trabajan?', a: 'Trabajamos con negocios de servicios que buscan generar consultas y organizar su seguimiento comercial.' },
  { q: '¿Cuánto cuesta el servicio?', a: 'La inversión se define según el plan y los objetivos de tu negocio. Solicita una propuesta para conocer el alcance y el precio antes de comenzar.' },
  { q: '¿El presupuesto de anuncios está incluido?', a: 'La propuesta detalla por separado el alcance de la gestión y el presupuesto recomendado para anuncios, para que conozcas la inversión antes de aprobarla.' },
  { q: '¿En cuánto tiempo se ven resultados?', a: 'Depende del punto de partida, la oferta, el mercado y la inversión. Revisamos el desempeño mes a mes; no prometemos una cantidad fija de ventas.' },
  { q: '¿Qué necesito para comenzar?', a: 'Si ya tienes activos publicitarios, revisamos su configuración. Si comienzas desde cero, definimos los accesos y la preparación necesarios en la propuesta.' },
  { q: '¿Puedo cambiar de plan?', a: 'Podemos revisar el alcance según tus necesidades. Los cambios, plazos y condiciones se acuerdan en tu propuesta.' }
];
function Contact({ children, className = '', name, message }) { return <a className={className} href={waLink(message)} target="_blank" rel="noopener noreferrer" onClick={() => trackContact(name)}>{children}</a>; }
function Label({ children }) { return <span className="inf-label"><span aria-hidden="true">✦</span>{children}</span>; }

export default function InfiniaLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const schema = { '@context': 'https://schema.org', '@type': 'Organization', '@id': 'https://www.beinfinia.com/#organization', name: 'infinia', url: 'https://www.beinfinia.com/', logo: 'https://www.beinfinia.com/infinia-icon.png', email: EMAIL, telephone: '+50581820910', sameAs: [INSTAGRAM_URL], description: 'Campañas publicitarias y captación de clientes potenciales para negocios.' };
  return <div className="inf-root">
    <Helmet>
      <title>Campañas Ads y generación de leads para negocios | Infinia</title>
      <meta name="description" content="Campañas Meta Ads, landing pages y seguimiento de clientes potenciales. Conoce los paquetes de Infinia y solicita una propuesta para tu negocio." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.beinfinia.com/" />
      <meta property="og:type" content="website" /><meta property="og:site_name" content="infinia" />
      <meta property="og:url" content="https://www.beinfinia.com/" /><meta property="og:title" content="Más oportunidades para tu negocio | Infinia" />
      <meta property="og:description" content="Conectamos campañas, páginas y seguimiento para facilitar nuevas consultas y citas." />
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
            <h1 id="hero-title">Más oportunidades<br />para tu <span>negocio.</span></h1>
            <p className="inf-hero-sub">Creamos campañas que conectan tus servicios con personas interesadas y facilitamos el camino hacia una consulta o cita.</p>
            <div className="inf-actions"><Contact className="inf-btn inf-btn-lime" name="Hero">Quiero captar oportunidades <ArrowUpRight size={19} /></Contact><Link className="inf-text-link" to="/cita">Agendar una conversación <Calendar size={17} /></Link></div>
            <div className="inf-hero-note"><span /><span>Estrategia a tu medida. Trato directo, en español.</span></div>
          </div>
          <div className="inf-scene" aria-label="Campañas, captación y seguimiento conectados">
            <div className="inf-orbit inf-orbit-one" aria-hidden="true" /><div className="inf-orbit inf-orbit-two" aria-hidden="true" />
            <div className="inf-core" aria-hidden="true"><img src="/infinia-icon.png" width="180" height="180" alt="" /></div>
            <div className="inf-scene-chip inf-chip-top"><Target size={18} /><div><small>EL PUNTO DE PARTIDA</small><strong>Tu estrategia</strong></div></div>
            <div className="inf-scene-card"><div className="inf-scene-card-top"><span className="inf-live-dot" />Tu sistema de captación<Layers size={16} /></div><div className="inf-scene-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div><div className="inf-scene-card-bottom"><span>Anuncios + seguimiento</span><ArrowUpRight size={18} /></div><p>De la consulta al siguiente paso.</p></div>
            <div className="inf-scene-chip inf-chip-bottom"><Clapperboard size={18} /><div><small>CONTACTOS CON DIRECCIÓN</small><strong>Captación con intención</strong></div></div>
            <span className="inf-scene-caption">ESTRATEGIA / CREATIVIDAD / CONEXIÓN</span>
          </div>
        </div>
      </section>
      <div className="inf-service-strip"><div className="inf-container"><span>Generación de leads</span><b aria-hidden="true">✦</b><span>Landing pages</span><b aria-hidden="true">✦</b><span>Meta Ads</span><b aria-hidden="true">✦</b><span>CRM y seguimiento</span></div></div>
      <section className="inf-section" id="servicios"><div className="inf-container">
        <div className="inf-section-head"><div><Label>Un sistema, muchas posibilidades</Label><h2>Todo conectado.<br /><span>Todo con propósito.</span></h2></div><p>Conectamos tu oferta, tus anuncios y el seguimiento para que cada consulta tenga un siguiente paso.</p></div>
        <div className="inf-services">{services.map(({icon: Icon, title, text, tag, href}, i) => <article className={'inf-service inf-service-' + i} key={title}><span className="inf-tag">{tag}</span><Icon className="inf-service-icon" size={30} /><h3>{title}</h3><p>{text}</p><a className="inf-service-link" href={href}>Conocer el servicio ↗</a><span className="inf-service-arrow" aria-hidden="true"><ArrowUpRight size={22} /></span></article>)}</div>
      </div></section>
      <section className="inf-section inf-process-section" id="proceso"><div className="inf-container"><Label>De la idea a la acción</Label><h2>Un siguiente paso.<br /><span>Sin complicaciones.</span></h2><div className="inf-process">
        {[['01','Conocemos tu negocio','Hablamos de tu marca, tus objetivos y el punto desde el que comienzas.'],['02','Diseñamos la dirección','Preparamos una propuesta con alcance, entregables y una estrategia ajustada a tu etapa.'],['03','Creamos y medimos','Lanzamos las campañas, revisamos las consultas y ajustamos la estrategia según los datos.']].map(([n,t,d]) => <article key={n}><span className="inf-step">{n}</span><h3>{t}</h3><p>{d}</p></article>)}
      </div></div></section>
      <section className="inf-section" id="planes"><div className="inf-container"><div className="inf-section-head"><div><Label>Paquetes de captación</Label><h2>El impulso correcto<br /><span>para tu etapa.</span></h2></div><p>Tres formas de conectar publicidad, captación y seguimiento según la etapa de tu negocio.</p></div>
        <div className="inf-plans">{plans.map(plan => {const Icon = plan.icon; return <article className={'inf-plan ' + (plan.featured ? 'inf-plan-featured' : '')} key={plan.id}>
          <div className="inf-plan-top"><Icon size={27} /><span>{plan.featured ? 'Campaña + landing' : 'A tu medida'}</span></div><h3>{plan.name}</h3><p className="inf-plan-description">{plan.description}</p>
          <div className="inf-plan-deliverables">{plan.deliverables.map(({icon: DIcon,value,label}) => <div key={label}><DIcon size={19} /><strong>{value}</strong><span>{label}</span></div>)}</div>
          <ul>{plan.features.map(f => <li key={f}><Check size={16} />{f}</li>)}</ul><p className="inf-plan-includes"><Calendar size={17} />{plan.includes}</p>
          <div className="inf-plan-footer"><span>Cotización personalizada</span><Contact className={'inf-btn ' + (plan.featured ? 'inf-btn-lime' : 'inf-btn-outline')} name={'Plan ' + plan.name} message={plan.ctaMessage}>Solicitar propuesta <ArrowUpRight size={18} /></Contact></div>
        </article>;})}</div><p className="inf-plan-footnote">La gestión y la inversión publicitaria se cotizan por separado. Los leads son contactos interesados: no equivalen a citas ni a ventas garantizadas.</p>
      </div></section>
      <section className="inf-section inf-faq-section" id="preguntas"><div className="inf-container inf-faq-layout"><div><Label>Hablemos claro</Label><h2>Buenas preguntas.<br /><span>Respuestas directas.</span></h2><p>Si tu negocio necesita algo diferente, conversemos sobre una propuesta a tu medida.</p><Contact className="inf-text-link" name="Preguntas">Cuéntanos tu idea <ArrowUpRight size={18} /></Contact></div><div className="inf-faq">{faqs.map(item => <details key={item.q}><summary>{item.q}<ChevronDown size={19} /></summary><p>{item.a}</p></details>)}</div></div></section>
      <section className="inf-section inf-journal"><div className="inf-container"><Label>Infinia Journal</Label><div className="inf-section-head"><div><h2>Ideas para tu<br /><span>próximo paso.</span></h2></div><p>Ideas prácticas sobre campañas, generación de leads, páginas web y seguimiento comercial.</p></div><a className="inf-btn inf-btn-outline" href="/blog">Explorar el blog <ArrowUpRight size={18} /></a></div></section><section className="inf-section inf-contact-section" id="contacto"><div className="inf-container"><div className="inf-contact"><Label>El próximo capítulo de tu marca</Label><h2>Hagamos espacio<br />para <span>lo que viene.</span></h2><p>Cuéntanos dónde estás y hacia dónde quieres llevar tu negocio. La siguiente idea comienza con una conversación.</p><div className="inf-actions"><Contact className="inf-btn inf-btn-lime" name="Contacto final"><MessageCircle size={19} />Hablemos por WhatsApp <ArrowUpRight size={18} /></Contact><a className="inf-text-link" href={'mailto:' + EMAIL} onClick={() => trackContact('Correo')}><Mail size={17} />{EMAIL}</a></div></div></div></section>
    </main>
    <footer className="inf-footer"><div className="inf-container"><div className="inf-footer-top"><a className="inf-brand" href="/">infinia<span className="inf-brand-dot">✦</span></a><p>Ideas con dirección.<br />Marcas con dimensión.</p><a className="inf-text-link" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">@beinfinia_ <ArrowUpRight size={17} /></a></div><div className="inf-footer-bottom"><span>© {new Date().getFullYear()} infinia</span><span>Marketing digital en español</span><Link to="/politica-de-privacidad">Política de privacidad</Link></div></div></footer>
    <Contact className="inf-floating" name="WhatsApp flotante"><MessageCircle size={23} /><span className="inf-sr-only">Contactar por WhatsApp</span></Contact>
  </div>;
}
