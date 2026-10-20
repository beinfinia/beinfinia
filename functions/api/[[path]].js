import {supabaseAPI} from '../../server/supabase.js';
import {blogAPI} from '../../server/blog-api.js';
import {migrationState,migrateD1} from '../../server/migrate.js';
const encoder=new TextEncoder();
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
const clean=(value,max=500)=>String(value??'').trim().slice(0,max);
async function signature(secret,value){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('')}
function equal(a,b){let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0}
async function authorized(request,env){if(!env.SESSION_SECRET)return false;const token=(request.headers.get('Cookie')||'').match(/(?:^|;\s*)infinia_session=([^;]+)/)?.[1];if(!token)return false;const [expiry,sig]=token.split('.');return Number(expiry)>Date.now()&&equal(sig||'',await signature(env.SESSION_SECRET,expiry))}
const cookie=value=>`infinia_session=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`;
function slotsFor(date,config) {if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return [];const day=new Date(date+'T12:00:00-06:00');if(!Number.isFinite(day.getTime()) || day.toISOString().slice(0,10)!==date || !config.days.includes(day.getUTCDay()))return [];const slots=[];for(let m=config.start*60;m+config.duration<=config.end*60;m+=config.duration){const iso=new Date(`${date}T${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}:00-06:00`).toISOString();if(new Date(iso).getTime()>Date.now()+3600000 && new Date(iso).getTime()<Date.now()+90*86400000)slots.push(iso);}return slots;}

export async function onRequest(context){
 const {request,env}=context;
 const path=Array.isArray(context.params.path)?context.params.path.join('/'):context.params.path||'';
 const helpers={authorized,signature,json,clean,cookie,slotsFor};
 if(!env.SUPABASE_SECRET_KEY)return json({error:'Configura SUPABASE_SECRET_KEY en Cloudflare.'},503);
 if(path.startsWith('blog/')||path.startsWith('migration/'))return blogAPI(context,helpers);
 if(['login','logout','session'].includes(path))return supabaseAPI(context,helpers);
 try{
  const state=await migrationState(env);
  if(!state){
   if(!await authorized(request,env))return json({error:'Estamos terminando de actualizar la agenda. Intenta en unos minutos.'},503);
   await migrateD1(env);
  }
 }catch(e){
  const message=e.message.includes('PAUSE_D1_FIRST')?'Activa MIGRATION_MODE=1 y despliega una vez para copiar D1 automáticamente al entrar al panel.':e.message.includes('MISSING_D1_BACKUP')?'Conserva el vínculo DB de D1 hasta terminar la copia de datos.':e.message.includes('TARGET_NOT_EMPTY')?'Supabase contiene datos diferentes. No se ha sobrescrito nada; revisa la migración.':'La copia automática no pudo verificarse. D1 sigue intacta. Revisa la migración antes de desconectarla.';
  return json({error:message},503);
 }
 return supabaseAPI(context,helpers);
}
