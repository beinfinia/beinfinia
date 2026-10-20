import {supabaseAPI,supabaseFailure} from '../../server/supabase.js';
import {blogAPI} from '../../server/blog-api.js';
const encoder=new TextEncoder();
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
const clean=(value,max=500)=>String(value??'').trim().slice(0,max);
async function signature(secret,value){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('')}
function equal(a,b){let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0}
async function authorized(request,env){if(!env.SESSION_SECRET)return false;const token=(request.headers.get('Cookie')||'').match(/(?:^|;\s*)infinia_session=([^;]+)/)?.[1];if(!token)return false;const [expiry,sig]=token.split('.');return Number(expiry)>Date.now()&&equal(sig||'',await signature(env.SESSION_SECRET,expiry))}
const cookie=value=>`infinia_session=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`;
function slotsFor(date,config) {if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return [];const day=new Date(date+'T12:00:00-06:00');if(!Number.isFinite(day.getTime()) || day.toISOString().slice(0,10)!==date || !config.days.includes(day.getUTCDay()))return [];const slots=[];for(let m=config.start*60;m+config.duration<=config.end*60;m+=config.duration){const iso=new Date(`${date}T${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}:00-06:00`).toISOString();if(new Date(iso).getTime()>Date.now()+3600000 && new Date(iso).getTime()<Date.now()+90*86400000)slots.push(iso);}return slots;}

export async function onRequest(context){
 const path=Array.isArray(context.params.path)?context.params.path.join('/'):context.params.path||'';
 const helpers={authorized,signature,json,clean,cookie,slotsFor};
 if(path.startsWith('blog/'))return blogAPI(context,helpers);
 return supabaseAPI(context,helpers);
}
