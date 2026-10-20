import {supabaseAPI} from '../../server/supabase.js';
import {blogAPI} from '../../server/blog-api.js';
import { localDate, canonicalDate, occupiedSlots, slotAvailable, emailStatement, emailReady, deliverNotification } from '../../server/calendar.js';
const stages = ['Nuevo','Contactado','Cita agendada','Propuesta enviada','Ganado','Perdido'];
const encoder = new TextEncoder();
const json = (data,status=200,headers={}) => new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
const clean = (value,max=500) => String(value ?? '').trim().slice(0,max);
async function signature(secret,value) {const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');}
function equal(a,b) {let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0;}
async function authorized(request,env) {const token=(request.headers.get('Cookie')||'').match(/(?:^|;\s*)infinia_session=([^;]+)/)?.[1];if(!token)return false;const [expiry,sig]=token.split('.');return Number(expiry)>Date.now() && equal(sig||'',await signature(env.SESSION_SECRET,expiry));}
const cookie = value => `infinia_session=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`;
async function settings(db) {return JSON.parse((await db.prepare('SELECT data FROM settings WHERE id=1').first()).data);}
function slotsFor(date,config) {if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return [];const day=new Date(date+'T12:00:00-06:00');if(!Number.isFinite(day.getTime()) || day.toISOString().slice(0,10)!==date || !config.days.includes(day.getUTCDay()))return [];const slots=[];for(let m=config.start*60;m+config.duration<=config.end*60;m+=config.duration){const iso=new Date(`${date}T${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}:00-06:00`).toISOString();if(new Date(iso).getTime()>Date.now()+3600000 && new Date(iso).getTime()<Date.now()+90*86400000)slots.push(iso);}return slots;}
async function legacyRequest({request,env,params}) {
 try {
  if(!env.DB || !env.ADMIN_PASSWORD || !env.SESSION_SECRET)return json({error:'La agenda aún no está activada. Falta configurar la base de datos y el acceso en Cloudflare.'},503);
  const path=Array.isArray(params.path)?params.path.join('/'):params.path||'';const method=request.method;const url=new URL(request.url);
  if(method!=='GET' && request.headers.get('Origin')!==url.origin)return json({error:'Origen no permitido'},403);
  if((path==='login'||path==='book') && method==='POST'){const ip=request.headers.get('CF-Connecting-IP')||'unknown';const bucket=Math.floor(Date.now()/3600000);const key=path+':'+await signature(env.SESSION_SECRET,ip)+':'+bucket;const row=await env.DB.prepare('INSERT INTO rate_limits(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key).first();if(row.count>(path==='login'?10:15))return json({error:'Demasiados intentos. Vuelve a intentar en una hora.'},429);}
  if(path==='login' && method==='POST') {const body=await request.json();const hash=await signature(env.SESSION_SECRET,clean(body.password,256));const expected=await signature(env.SESSION_SECRET,env.ADMIN_PASSWORD);if(!equal(hash,expected))return json({error:'Contraseña incorrecta'},401);const expiry=String(Date.now()+28800000);return json({ok:true},200,{'Set-Cookie':cookie(expiry+'.'+await signature(env.SESSION_SECRET,expiry))});}
  if(path==='logout' && method==='POST')return json({ok:true},200,{'Set-Cookie':'infinia_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'});
  if(path==='slots' && method==='GET') {
   const config=await settings(env.DB),date=url.searchParams.get('date')||'';
   if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || !canonicalDate(date+'T00:00:00-06:00'))return json({error:'Fecha inválida'},400);
   let duration=config.duration,exclude='';
   if(url.searchParams.has('appointment')) {
    if(!await authorized(request,env))return json({error:'Inicia sesión'},401);
    exclude=url.searchParams.get('appointment');const a=await env.DB.prepare('SELECT duration FROM appointments WHERE id=?').bind(exclude).first();
    if(!a)return json({error:'Cita no encontrada'},404);duration=a.duration;
   }
   const occupied=await occupiedSlots(env.DB,date,exclude);
   return json({timezone:config.timezone,duration,slots:slotsFor(date,{...config,duration}).filter(s=>slotAvailable(s,duration,occupied))});
  }
  if(path==='book' && method==='POST') {
   const body=await request.json();const name=clean(body.name,100),email=clean(body.email,160),phone=clean(body.phone,40),service=clean(body.service,100);if(!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone || !service || body.consent!==true)return json({error:'Completa tus datos y acepta la política de privacidad.'},400);
   const config=await settings(env.DB);const start=clean(body.starts_at,30);const date=new Date(start);if(!Number.isFinite(date.getTime()) || !slotsFor(new Date(date.getTime()-6*3600000).toISOString().slice(0,10),config).includes(start))return json({error:'Ese horario no está disponible.'},400);
   const id=crypto.randomUUID(),appointmentId=crypto.randomUUID(),notificationId=crypto.randomUUID();try {await env.DB.batch([env.DB.prepare("INSERT INTO contacts(id,name,email,phone,service,stage,source,notes) VALUES(?,?,?,?,?,'Cita agendada','Página de citas',?)").bind(id,name,email,phone,service,clean(body.notes,2000)),env.DB.prepare('INSERT INTO appointments(id,contact_id,starts_at,duration) VALUES(?,?,?,?)').bind(appointmentId,id,start,config.duration),emailStatement(env.DB,notificationId,appointmentId,'Nueva cita',{name,email,phone,service},start)]);}catch(e){if(String(e).includes('UNIQUE') || String(e).includes('SLOT_CONFLICT') || String(e).includes('BLOCK_CONFLICT'))return json({error:'Alguien acaba de reservar ese horario. Elige otro.'},409);throw e;}await deliverNotification(env,notificationId).catch(()=>{});return json({ok:true,id:appointmentId,starts_at:start});
  }
  if(!await authorized(request,env))return json({error:'Inicia sesión para entrar al panel.'},401);
  if(path==='session')return json({ok:true});
  if(path==='dashboard' && method==='GET'){const [contacts,appointments,tasks,config,blocks,notifications]=await Promise.all([env.DB.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all(),env.DB.prepare('SELECT a.*,c.name,c.email,c.phone,c.service FROM appointments a JOIN contacts c ON c.id=a.contact_id ORDER BY starts_at').all(),env.DB.prepare('SELECT * FROM tasks ORDER BY done,due_date,created_at DESC').all(),settings(env.DB),env.DB.prepare('SELECT * FROM calendar_blocks WHERE active=1 ORDER BY starts_at').all(),env.DB.prepare('SELECT id,appointment_id,status,created_at FROM email_notifications ORDER BY created_at DESC LIMIT 30').all()]);return json({contacts:contacts.results,appointments:appointments.results,tasks:tasks.results,settings:config,blocks:blocks.results,notifications:notifications.results,email:{configured:emailReady(env),recipient:env.NOTIFY_EMAIL||''}});}
  const body=method==='GET'?{}:await request.json();
  if(path==='contacts' && method==='POST'){const name=clean(body.name,100);if(!name)return json({error:'Escribe el nombre.'},400);await env.DB.prepare('INSERT INTO contacts(id,name,email,phone,service,source,notes) VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(),name,clean(body.email,160),clean(body.phone,40),clean(body.service,100),clean(body.source,100)||'Manual',clean(body.notes,2000)).run();return json({ok:true});}
  if(path.startsWith('contacts/') && method==='PATCH'){if(!stages.includes(body.stage))return json({error:'Etapa inválida'},400);await env.DB.prepare('UPDATE contacts SET stage=?,notes=? WHERE id=?').bind(body.stage,clean(body.notes,2000),path.split('/')[1]).run();return json({ok:true});}
  if(path==='tasks' && method==='POST'){if(!clean(body.title,200))return json({error:'Escribe la tarea.'},400);await env.DB.prepare('INSERT INTO tasks(id,title,due_date) VALUES(?,?,?)').bind(crypto.randomUUID(),clean(body.title,200),clean(body.due_date,10)).run();return json({ok:true});}
  if(path.startsWith('tasks/') && method==='PATCH'){await env.DB.prepare('UPDATE tasks SET done=? WHERE id=?').bind(body.done?1:0,path.split('/')[1]).run();return json({ok:true});}
  if(path==='blocks' && method==='POST') {
   const start=canonicalDate(body.starts_at),end=canonicalDate(body.ends_at);
   if(!start||!end||end<=start)return json({error:'La fecha final debe ser posterior al inicio.'},400);
   await env.DB.prepare('INSERT INTO calendar_blocks(id,starts_at,ends_at,reason) VALUES(?,?,?,?)').bind(crypto.randomUUID(),start,end,clean(body.reason,200)).run();return json({ok:true});
  }
  if(path.startsWith('blocks/') && method==='DELETE') {
   await env.DB.prepare('UPDATE calendar_blocks SET active=0 WHERE id=?').bind(path.split('/')[1]).run();return json({ok:true});
  }
  if(path==='appointments' && method==='POST') {
   const contact=await env.DB.prepare('SELECT * FROM contacts WHERE id=?').bind(clean(body.contact_id,80)).first();
   if(!contact)return json({error:'Selecciona un contacto existente.'},400);
   const config=await settings(env.DB),start=canonicalDate(body.starts_at);
   if(!start||!slotsFor(localDate(start),config).includes(start))return json({error:'Selecciona un horario de atención disponible.'},400);
   const id=crypto.randomUUID(),notificationId=crypto.randomUUID();
   await env.DB.batch([env.DB.prepare('INSERT INTO appointments(id,contact_id,starts_at,duration) VALUES(?,?,?,?)').bind(id,contact.id,start,config.duration),env.DB.prepare("UPDATE contacts SET stage='Cita agendada' WHERE id=? AND stage NOT IN ('Ganado','Perdido')").bind(contact.id),emailStatement(env.DB,notificationId,id,'Nueva cita manual',contact,start)]);
   const notification=await deliverNotification(env,notificationId).catch(()=>'Fallido');return json({ok:true,notification});
  }
  if(path.startsWith('appointments/') && method==='PATCH') {
   const id=path.split('/')[1];const previous=await env.DB.prepare('SELECT a.*,c.name,c.email,c.phone,c.service FROM appointments a JOIN contacts c ON c.id=a.contact_id WHERE a.id=?').bind(id).first();
   if(!previous)return json({error:'Cita no encontrada'},404);
   let start=previous.starts_at,status=body.status||previous.status;
   if(!['Agendada','Realizada','Cancelada','No asistió'].includes(status))return json({error:'Estado inválido'},400);
   if(body.starts_at) {
    if(previous.status!=='Agendada')return json({error:'Solo puedes reprogramar una cita agendada.'},400);
    start=canonicalDate(body.starts_at);const config=await settings(env.DB);
    if(!start||!slotsFor(localDate(start),{...config,duration:previous.duration}).includes(start))return json({error:'Elige un horario de atención disponible.'},400);
    status='Agendada';
   }
   if(start===previous.starts_at && status===previous.status)return json({ok:true});
   const kind=start!==previous.starts_at?'Cita reprogramada':status==='Cancelada'?'Cita cancelada':null;
   const notificationId=crypto.randomUUID();const statements=[env.DB.prepare('UPDATE appointments SET starts_at=?,status=? WHERE id=?').bind(start,status,id)];
   if(kind)statements.push(emailStatement(env.DB,notificationId,id,kind,previous,start,start!==previous.starts_at?previous.starts_at:''));
   await env.DB.batch(statements);
   const notification=kind?await deliverNotification(env,notificationId).catch(()=>'Fallido'):null;
   return json({ok:true,notification});
  }
  if(path.startsWith('notifications/') && method==='POST')return json({ok:true,notification:await deliverNotification(env,path.split('/')[1])});
  if(path==='settings' && method==='PUT'){const config={days:body.days,start:Number(body.start),end:Number(body.end),duration:Number(body.duration),timezone:'America/Managua'};if(!Array.isArray(config.days)||!config.days.length||config.days.some(d=>!Number.isInteger(d)||d<0||d>6)||!Number.isInteger(config.start)||!Number.isInteger(config.end)||config.start<0||config.end>24||config.start>=config.end||![15,30,60].includes(config.duration))return json({error:'Revisa los horarios.'},400);await env.DB.prepare('UPDATE settings SET data=? WHERE id=1').bind(JSON.stringify(config)).run();return json({ok:true});}
  return json({error:'Ruta no disponible'},404);
 } catch(error) {if(String(error).includes('no such table: calendar_blocks')||String(error).includes('no such table: email_notifications'))return json({error:'Actualiza D1 ejecutando database/migrations/002_calendar.sql y vuelve a intentar.'},503);if(String(error).includes('BLOCK_HAS_APPOINTMENTS'))return json({error:'Hay citas en ese rango. Reprográmalas o cancélalas antes de bloquear.'},409);if(String(error).includes('BLOCK_CONFLICT'))return json({error:'Ese horario está bloqueado. Elige otro.'},409);if(String(error).includes('SLOT_CONFLICT')||String(error).includes('UNIQUE constraint failed: appointments'))return json({error:'Ese horario coincide con otra cita. Elige otro estado u horario.'},409);return json({error:'No pudimos completar la operación. Revisa la configuración o vuelve a intentar.'},500);}
}

export async function onRequest(context){
 const path=Array.isArray(context.params.path)?context.params.path.join('/'):context.params.path||'';
 const helpers={authorized,signature,json,clean,cookie,slotsFor};
 if(context.env.MIGRATION_MODE==='1'&&context.request.method!=='GET'&&!['login','logout'].includes(path)&&!path.startsWith('migration/')&&!path.startsWith('blog/'))return json({error:'Estamos actualizando la agenda. Intenta nuevamente en unos minutos.'},503);
 if(path.startsWith('blog/')||path.startsWith('migration/'))return blogAPI(context,helpers);
 if(context.env.DATA_BACKEND==='supabase')return supabaseAPI(context,helpers);
 return legacyRequest(context);
}
