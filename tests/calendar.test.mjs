import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { onRequest } from '../functions/api/[[path]].js';
import { deliverNotification, localDate } from '../server/calendar.js';

function setup() {
 const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('../database/schema.sql',import.meta.url),'utf8'));
 sql.prepare('UPDATE settings SET data=?').run(JSON.stringify({days:[0,1,2,3,4,5,6],start:0,end:24,duration:30,timezone:'America/Managua'}));
 const db={prepare(query){let args=[];return{bind(...values){args=values;return this},async first(){return sql.prepare(query).get(...args)||null},async all(){return{results:sql.prepare(query).all(...args)}},async run(){return sql.prepare(query).run(...args)}}},async batch(statements){sql.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());sql.exec('COMMIT');return results}catch(e){sql.exec('ROLLBACK');throw e}}};
 const env={DB:db,ADMIN_PASSWORD:'test-password',SESSION_SECRET:'test-session-secret-with-32-characters'};
 let cookie='';
 async function call(path,method='GET',body,authenticated=true){const response=await onRequest({request:new Request('https://example.com/api/'+path,{method,headers:{Origin:'https://example.com','Content-Type':'application/json',...(authenticated?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined}),env,params:{path:path.split('?')[0].split('/')}});if(path==='login'&&response.ok)cookie=response.headers.get('Set-Cookie').split(';')[0];return{status:response.status,data:await response.json()};}
 return{sql,env,call};
}
const future=new Date(Date.now()+3*86400000).toISOString().slice(0,10);
const at=hour=>new Date(`${future}T${hour}:00-06:00`).toISOString();

test('migration is repeatable and preserves existing contacts',()=>{const {sql}=setup();sql.exec("INSERT INTO contacts(id,name) VALUES('saved','Existing')");const migration=readFileSync(new URL('../database/migrations/002_calendar.sql',import.meta.url),'utf8');sql.exec(migration);sql.exec(migration);assert.equal(sql.prepare('SELECT name FROM contacts WHERE id=?').get('saved').name,'Existing')});
test('blocks, manual bookings, reschedules and public availability remain consistent',async()=>{
 const {sql,call}=setup();
 assert.equal((await call('blocks','POST',{starts_at:at('10:00'),ends_at:at('11:00')},false)).status,401);
 assert.equal((await call('login','POST',{password:'test-password'})).status,200);
 sql.exec("INSERT INTO contacts(id,name) VALUES('c','Client')");
 assert.equal((await call('blocks','POST',{starts_at:at('10:00'),ends_at:at('11:00'),reason:'Private meeting'})).status,200);
 assert.equal((await call('appointments','POST',{contact_id:'c',starts_at:at('10:30')})).status,409);
 const publicBlocked=await call('slots?date='+future,'GET',null,false);assert.equal(publicBlocked.status,200);assert(!publicBlocked.data.slots.includes(at('10:00')));assert(!JSON.stringify(publicBlocked.data).includes('Private meeting'));
 assert.equal((await call('appointments','POST',{contact_id:'c',starts_at:at('09:00')})).status,200);
 const a=sql.prepare('SELECT * FROM appointments').get();
 assert.equal((await call('blocks','POST',{starts_at:at('08:30'),ends_at:at('09:15')})).status,409);
 assert.equal((await call('appointments/'+a.id,'PATCH',{starts_at:at('10:00')})).status,409);
 assert.equal(sql.prepare('SELECT starts_at FROM appointments').get().starts_at,at('09:00'));
 assert((await call('slots?date='+future+'&appointment='+a.id)).data.slots.includes(at('09:00')));
 assert.equal((await call('appointments/'+a.id,'PATCH',{starts_at:at('12:00')})).status,200);
 assert((await call('slots?date='+future,'GET',null,false)).data.slots.includes(at('09:00')));
 assert.equal(sql.prepare('SELECT contact_id FROM appointments').get().contact_id,'c');
 assert.equal((await call('appointments/'+a.id,'PATCH',{status:'Cancelada'})).status,200);
 assert((await call('slots?date='+future,'GET',null,false)).data.slots.includes(at('12:00')));
 const b=sql.prepare('SELECT id FROM calendar_blocks').get();assert.equal((await call('blocks/'+b.id,'DELETE',{})).status,200);
 assert((await call('slots?date='+future,'GET',null,false)).data.slots.includes(at('10:00')));
});
test('public booking of a blocked time rolls back contact creation',async()=>{
 const {sql,call}=setup();await call('login','POST',{password:'test-password'});await call('blocks','POST',{starts_at:at('10:00'),ends_at:at('11:00')});
 const r=await call('book','POST',{name:'Public client',email:'test@example.com',phone:'+50500000000',service:'Content',consent:true,starts_at:at('10:00')},false);
 assert.equal(r.status,409);assert.equal(sql.prepare('SELECT COUNT(*) n FROM contacts').get().n,0);
});
test('provider failures leave bookings saved, support retry and do not duplicate sent notices',async()=>{
 const {sql,call,env}=setup();await call('login','POST',{password:'test-password'});sql.exec("INSERT INTO contacts(id,name) VALUES('c','Client')");env.RESEND_API_KEY='mock-only';env.EMAIL_FROM='Infinia <citas@example.com>';env.NOTIFY_EMAIL='owner@example.com';
 const originalFetch=globalThis.fetch;let sends=0;try{globalThis.fetch=async()=>{sends++;return new Response('{}',{status:500})};
 const result=await call('appointments','POST',{contact_id:'c',starts_at:at('09:00')});assert.equal(result.status,200);assert.equal(result.data.notification,'Fallido');assert.equal(sql.prepare('SELECT COUNT(*) n FROM appointments').get().n,1);
 const id=sql.prepare('SELECT id FROM email_notifications').get().id;
 globalThis.fetch=async(url,options)=>{sends++;assert.equal(url,'https://api.resend.com/emails');assert.deepEqual(JSON.parse(options.body).to,['owner@example.com']);assert.equal(options.headers['Idempotency-Key'],'infinia-'+id);return new Response('{"id":"mock"}',{status:200})};
 assert.equal(await deliverNotification(env,id),'Enviado');assert.equal(await deliverNotification(env,id),'Enviado');assert.equal(sends,2);
 }finally{globalThis.fetch=originalFetch}
});
test('Nicaragua midnight dates remain correct',()=>assert.equal(localDate('2026-10-21T03:00:00.000Z'),'2026-10-20'));
