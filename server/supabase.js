import { canonicalDate,localDate } from './calendar.js';
export const PROJECT_URL='https://gdnzpassbdavkzqbutxg.supabase.co';
export async function supa(env,path,method='GET',body){
 const response=await fetch((env.SUPABASE_URL||PROJECT_URL)+'/rest/v1/'+path,{method,headers:{apikey:env.SUPABASE_SECRET_KEY,...(env.SUPABASE_SECRET_KEY.startsWith('eyJ')?{Authorization:'Bearer '+env.SUPABASE_SECRET_KEY}:{}),'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 const data=await response.json().catch(()=>null);if(!response.ok){const e=new Error(data?.message||'SUPABASE_ERROR');e.code=data?.code;e.status=response.status;throw e}return data;
}
export const rpc=(env,name,data)=>supa(env,'rpc/'+name,'POST',data);
const iso=value=>new Date(value).toISOString();
const appointment=e=>({...e,starts_at:iso(e.starts_at),duration:Math.round((Date.parse(e.ends_at)-Date.parse(e.starts_at))/60000)});
async function config(env){return (await supa(env,'settings?id=eq.1&select=data'))[0].data}
const available=(start,duration,events)=>!events.some(e=>Date.parse(e.starts_at)<Date.parse(start)+duration*60000&&Date.parse(e.ends_at)>Date.parse(start));
async function events(env){return supa(env,"calendar_events?status=neq.Cancelada&select=*")}
function notice(kind,contact,start,previous){const time=s=>new Date(s).toLocaleString('es-NI',{timeZone:'America/Managua',dateStyle:'full',timeStyle:'short'});return{id:crypto.randomUUID(),payload:{subject:'Infinia · '+kind,text:[kind,'Contacto: '+contact.name,'Servicio: '+contact.service,'Fecha: '+time(start)+' (Nicaragua, UTC−6)',previous?'Fecha anterior: '+time(previous):'', 'Correo: '+contact.email,'WhatsApp: '+contact.phone].filter(Boolean).join('\n')}}}
export async function sendSupaNotice(env,id){
 const row=(await supa(env,'email_notifications?id=eq.'+encodeURIComponent(id)))[0];if(!row)return 'No encontrado';if(row.status==='Enviado')return 'Enviado';
 if(!env.RESEND_API_KEY||!env.EMAIL_FROM||!/^\S+@\S+\.\S+$/.test(env.NOTIFY_EMAIL||''))return 'Sin configurar';
 if(Date.now()-Date.parse(row.created_at)>23*3600000)return 'Vencido';
 let status='Fallido';try{const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'infinia-'+id},body:JSON.stringify({from:env.EMAIL_FROM,to:[env.NOTIFY_EMAIL],...row.payload}),signal:AbortSignal.timeout(8000)});if(r.ok)status='Enviado'}catch{}
 await supa(env,'email_notifications?id=eq.'+id,'PATCH',{status});return status;
}
export async function supabaseAPI(context,helpers){
 const {request,env,params}=context,{authorized,signature,json,clean,cookie,slotsFor}=helpers;
 const path=Array.isArray(params.path)?params.path.join('/'):params.path||'',method=request.method,url=new URL(request.url);
 try{
 if(!env.SUPABASE_SECRET_KEY||!env.ADMIN_PASSWORD||!env.SESSION_SECRET)return json({error:'Falta configurar el acceso de Supabase en Cloudflare.'},503);
 if(method!=='GET'&&request.headers.get('Origin')!==url.origin)return json({error:'Origen no permitido'},403);
 if((path==='login'||path==='book')&&method==='POST'){const key=path+':'+await signature(env.SESSION_SECRET,request.headers.get('CF-Connecting-IP')||'unknown')+':'+Math.floor(Date.now()/3600000);const count=await rpc(env,'infinia_rate',{p_key:key});if(count>(path==='login'?10:15))return json({error:'Demasiados intentos. Intenta en una hora.'},429)}
 if(path==='login'&&method==='POST'){const b=await request.json();const a=await signature(env.SESSION_SECRET,clean(b.password,256)),bhash=await signature(env.SESSION_SECRET,env.ADMIN_PASSWORD);if(a!==bhash)return json({error:'Contraseña incorrecta'},401);const exp=String(Date.now()+28800000);return json({ok:true},200,{'Set-Cookie':cookie(exp+'.'+await signature(env.SESSION_SECRET,exp))})}
 if(path==='logout'&&method==='POST')return json({ok:true},200,{'Set-Cookie':'infinia_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'});
 const isAdmin=await authorized(request,env);
 if(path==='slots'&&method==='GET'){const c=await config(env),date=url.searchParams.get('date')||'';if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return json({error:'Fecha inválida'},400);let duration=c.duration,exclude=url.searchParams.get('appointment')||'';if(exclude){if(!isAdmin)return json({error:'Inicia sesión'},401);const e=(await supa(env,'calendar_events?id=eq.'+encodeURIComponent(exclude)+'&kind=eq.appointment'))[0];if(!e)return json({error:'Cita no encontrada'},404);duration=appointment(e).duration}const occupied=(await events(env)).filter(e=>e.id!==exclude);return json({timezone:c.timezone,duration,slots:slotsFor(date,{...c,duration}).filter(s=>available(s,duration,occupied))})}
 if(path==='book'&&method==='POST'){
 const b=await request.json(),name=clean(b.name,100),email=clean(b.email,160),phone=clean(b.phone,40),service=clean(b.service,100),start=canonicalDate(b.starts_at),c=await config(env);
 if(!name||!/^\S+@\S+\.\S+$/.test(email)||!phone||!service||b.consent!==true)return json({error:'Completa tus datos y acepta la política de privacidad.'},400);
 if(!start||!slotsFor(localDate(start),c).includes(start))return json({error:'Horario no disponible'},400);
 const id=crypto.randomUUID(),notification=notice('Nueva cita',{name,email,phone,service},start);
 await rpc(env,'infinia_appointment',{p_action:'public',p_data:{id,contact_id:crypto.randomUUID(),name,email,phone,service,notes:clean(b.notes,2000),starts_at:start,duration:c.duration,notification}});
 await sendSupaNotice(env,notification.id).catch(()=>{});return json({ok:true,id,starts_at:start});
 }
 if(!isAdmin)return json({error:'Inicia sesión para entrar al panel.'},401);
 if(path==='session')return json({ok:true});
 if(path==='dashboard'&&method==='GET'){
 const [contacts,ev,tasks,c,notifications]=await Promise.all([supa(env,'contacts?order=created_at.desc'),supa(env,'calendar_events?select=*,contacts(name,email,phone,service)&order=starts_at'),supa(env,'tasks?order=done.asc,due_date.asc,created_at.desc'),config(env),supa(env,'email_notifications?select=id,appointment_id,status,created_at&order=created_at.desc&limit=30')]);
 return json({contacts,appointments:ev.filter(e=>e.kind==='appointment').map(e=>({...appointment(e),...e.contacts})),blocks:ev.filter(e=>e.kind==='block'&&e.status!=='Cancelada').map(e=>({...e,starts_at:iso(e.starts_at),ends_at:iso(e.ends_at),active:1})),tasks,settings:c,notifications,email:{configured:Boolean(env.RESEND_API_KEY&&env.EMAIL_FROM&&env.NOTIFY_EMAIL),recipient:env.NOTIFY_EMAIL||''},backend:'supabase'});
 }
 const b=method==='GET'?{}:await request.json();
 if(path==='contacts'&&method==='POST'){if(!clean(b.name,100))return json({error:'Escribe el nombre.'},400);await supa(env,'contacts','POST',{name:clean(b.name,100),email:clean(b.email,160),phone:clean(b.phone,40),service:clean(b.service,100),source:clean(b.source,100)||'Manual',notes:clean(b.notes,2000)});return json({ok:true})}
 if(path.startsWith('contacts/')&&method==='PATCH'){await supa(env,'contacts?id=eq.'+encodeURIComponent(path.split('/')[1]),'PATCH',{stage:b.stage,notes:clean(b.notes,2000)});return json({ok:true})}
 if(path==='tasks'&&method==='POST'){await supa(env,'tasks','POST',{title:clean(b.title,200),due_date:clean(b.due_date,10)});return json({ok:true})}
 if(path.startsWith('tasks/')&&method==='PATCH'){await supa(env,'tasks?id=eq.'+encodeURIComponent(path.split('/')[1]),'PATCH',{done:b.done?1:0});return json({ok:true})}
 if(path==='blocks'&&method==='POST'){const start=canonicalDate(b.starts_at),end=canonicalDate(b.ends_at);if(!start||!end||end<=start)return json({error:'Revisa las fechas del bloqueo.'},400);await supa(env,'calendar_events','POST',{kind:'block',starts_at:start,ends_at:end,reason:clean(b.reason,200)});return json({ok:true})}
 if(path.startsWith('blocks/')&&method==='DELETE'){await supa(env,'calendar_events?id=eq.'+encodeURIComponent(path.split('/')[1])+'&kind=eq.block','PATCH',{status:'Cancelada'});return json({ok:true})}
 if((path==='appointments'&&method==='POST')||(path.startsWith('appointments/')&&method==='PATCH')){
 const create=method==='POST',id=create?crypto.randomUUID():path.split('/')[1];
 const previous=create?null:(await supa(env,'calendar_events?id=eq.'+encodeURIComponent(id)+'&kind=eq.appointment'))[0];if(!create&&!previous)return json({error:'Cita no encontrada'},404);
 const c=await config(env),contact=(await supa(env,'contacts?id=eq.'+encodeURIComponent(create?b.contact_id:previous.contact_id)))[0];if(!contact)return json({error:'Selecciona un contacto'},400);
 const start=create||b.starts_at?canonicalDate(b.starts_at):iso(previous.starts_at),duration=create?c.duration:appointment(previous).duration;
 if(create||b.starts_at){if(!start||!slotsFor(localDate(start),{...c,duration}).includes(start))return json({error:'Selecciona un horario disponible.'},400);if(!create&&previous.status!=='Agendada')return json({error:'Solo puedes reprogramar citas agendadas.'},400)}
 const status=create||b.starts_at?'Agendada':b.status||previous.status;
 const kind=create?'Nueva cita manual':b.starts_at?'Cita reprogramada':status==='Cancelada'?'Cita cancelada':null;
 const notification=kind?notice(kind,contact,start,b.starts_at&&!create?previous.starts_at:null):null;
 await rpc(env,'infinia_appointment',{p_action:create?'manual':'update',p_data:{id,contact_id:contact.id,starts_at:start,duration,status,expected_start:previous?.starts_at,notification}});
 return json({ok:true,notification:notification?await sendSupaNotice(env,notification.id).catch(()=>'Fallido'):null});
 }
 if(path==='settings'&&method==='PUT'){const c={days:b.days,start:Number(b.start),end:Number(b.end),duration:Number(b.duration),timezone:'America/Managua'};if(!Array.isArray(c.days)||!c.days.length||c.days.some(d=>!Number.isInteger(d)||d<0||d>6)||!Number.isInteger(c.start)||!Number.isInteger(c.end)||c.start<0||c.end>24||c.start>=c.end||![15,30,60].includes(c.duration))return json({error:'Revisa los horarios.'},400);await supa(env,'settings?id=eq.1','PATCH',{data:c});return json({ok:true})}
 if(path.startsWith('notifications/')&&method==='POST')return json({ok:true,notification:await sendSupaNotice(env,path.split('/')[1])});
 return json({error:'Ruta no disponible'},404);
 }catch(e){if(e.code==='23P01'||e.message.includes('STALE_APPOINTMENT'))return json({error:'El horario está ocupado o cambió. Actualiza la agenda y elige otro.'},409);return json({error:'No pudimos completar la operación en Supabase. Revisa la configuración e inténtalo otra vez.'},e.code==='23514'?400:500)}
}
