import {supa,rpc} from './supabase.js';
export async function migrationState(env){const receipts=await supa(env,'migration_receipts?select=result,created_at&order=created_at.desc&limit=1');return receipts[0]||null}
export async function migrateD1(env){
 const previous=await migrationState(env);if(previous)return previous.result;
 if(env.MIGRATION_MODE!=='1')throw Error('PAUSE_D1_FIRST');
 if(!env.DB)throw Error('MISSING_D1_BACKUP');
 const tables=['contacts','appointments','tasks','calendar_blocks','email_notifications','settings'];
 const results=await env.DB.batch(tables.map(table=>env.DB.prepare('SELECT * FROM '+table)));
 const [contacts,appointments,tasks,blocks,notifications,settings]=results.map(r=>r.results);
 const payload={contacts,appointments,tasks,blocks,notifications:notifications.map(n=>({...n,payload:typeof n.payload==='string'?JSON.parse(n.payload):n.payload})),settings:typeof settings[0].data==='string'?JSON.parse(settings[0].data):settings[0].data};
 const result=await rpc(env,'infinia_import',{p_data:payload});
 for(const key of ['contacts','appointments','tasks','blocks','notifications'])if(result[key]!==payload[key].length)throw Error('COUNT_MISMATCH');
 return result;
}
