export const localDate = iso => new Date(new Date(iso).getTime()-6*3600000).toISOString().slice(0,10);
export function canonicalDate(value) {const d=new Date(value);return Number.isFinite(d.getTime())?d.toISOString():null;}
export async function occupiedSlots(db,date,exclude='') {
 const from=canonicalDate(date+'T00:00:00-06:00');if(!from)return [];
 const until=new Date(new Date(from).getTime()+86400000).toISOString();
 const [appointments,blocks]=await Promise.all([
 db.prepare("SELECT starts_at,duration FROM appointments WHERE status != 'Cancelada' AND id != ? AND julianday(starts_at)<julianday(?) AND julianday(starts_at)+duration/1440.0>julianday(?)").bind(exclude,until,from).all(),
 db.prepare('SELECT starts_at,ends_at FROM calendar_blocks WHERE active=1 AND starts_at < ? AND ends_at > ?').bind(until,from).all()]);
 return [...appointments.results.map(a=>({start:Date.parse(a.starts_at),end:Date.parse(a.starts_at)+a.duration*60000})),...blocks.results.map(b=>({start:Date.parse(b.starts_at),end:Date.parse(b.ends_at)}))];
}
export const slotAvailable = (start,duration,occupied) => !occupied.some(a=>a.start<Date.parse(start)+duration*60000 && a.end>Date.parse(start));
export function emailStatement(db,id,appointmentId,kind,contact,start,previous='') {
 const when=value=>new Date(value).toLocaleString('es-NI',{timeZone:'America/Managua',dateStyle:'full',timeStyle:'short'});
 const payload={subject:`Infinia · ${kind}`,text:[kind,`Contacto: ${contact.name}`,`Servicio: ${contact.service||'Por definir'}`,`Fecha: ${when(start)} (Nicaragua, UTC−6)`,previous?`Fecha anterior: ${when(previous)}`:'',`Correo: ${contact.email||'No registrado'}`,`WhatsApp: ${contact.phone||'No registrado'}`].filter(Boolean).join('\n')};
 return db.prepare('INSERT INTO email_notifications(id,appointment_id,payload) VALUES(?,?,?)').bind(id,appointmentId,JSON.stringify(payload));
}
export function emailReady(env) {return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.NOTIFY_EMAIL||''));}
export async function deliverNotification(env,id) {
 const row=await env.DB.prepare('SELECT * FROM email_notifications WHERE id=?').bind(id).first();
 if(!row || row.status==='Enviado')return row?.status||'No encontrado';
 if(!emailReady(env))return 'Sin configurar';
 // Retries are limited to 24 hours, matching Resend's idempotency retention.
 if(Date.now()-Date.parse(row.created_at.replace(' ','T')+'Z')>23*3600000)return 'Vencido';
 let status='Fallido';try{
  const payload=JSON.parse(row.payload);
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':'infinia-'+id},body:JSON.stringify({from:env.EMAIL_FROM,to:[env.NOTIFY_EMAIL],...payload}),signal:AbortSignal.timeout(8000)});
  if(response.ok)status='Enviado';
 }catch{}
 await env.DB.prepare('UPDATE email_notifications SET status=? WHERE id=?').bind(status,id).run();return status;
}
