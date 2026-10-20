import {supa} from '../server/supabase.js';
import {escapeHTML,origin} from '../server/site-html.js';
export async function onRequestGet({env}){
 const paths=['/','/servicios','/servicios/campanas-ads','/servicios/seguimiento','/servicios/paginas-web','/servicios/google-business-profile','/servicios/redes-sociales','/blog','/cita','/politica-de-privacidad'];
 if(env.SUPABASE_SECRET_KEY){try{const posts=await supa(env,'blog_posts?select=slug&status=eq.published&published_at=lte.'+encodeURIComponent(new Date().toISOString()));paths.push(...posts.map(p=>'/blog/'+p.slug))}catch{return new Response('Sitemap temporalmente no disponible',{status:503})}}
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(path=>'<url><loc>'+escapeHTML(origin+path)+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml','Cache-Control':'public, max-age=300'}});
}
