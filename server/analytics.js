const PROPERTY='559672037';
const encode=value=>btoa(String.fromCharCode(...(typeof value==='string'?new TextEncoder().encode(value):new Uint8Array(value)))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
let cachedToken=null;
async function accessToken(env){
 const credentials=JSON.parse(env.GA_SERVICE_ACCOUNT_JSON);
 if(credentials.type!=='service_account'||!credentials.client_email||!credentials.private_key)throw Error('credentials');
 const identity=credentials.client_email+'|'+credentials.private_key;
 if(cachedToken?.identity===identity&&cachedToken.until>Date.now())return cachedToken.value;
 const now=Math.floor(Date.now()/1000),unsigned=encode(JSON.stringify({alg:'RS256',typ:'JWT'}))+'.'+encode(JSON.stringify({iss:credentials.client_email,scope:'https://www.googleapis.com/auth/analytics.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600}));
 const pem=credentials.private_key.replace(/-----[^-]+-----/g,'').replace(/\s/g,'');
 const key=await crypto.subtle.importKey('pkcs8',Uint8Array.from(atob(pem),c=>c.charCodeAt(0)),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
 const jwt=unsigned+'.'+encode(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(unsigned)));
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:jwt}),signal:AbortSignal.timeout(10000)});
 const data=await response.json();if(!response.ok||!data.access_token)throw Error('token');
 cachedToken={identity,value:data.access_token,until:Date.now()+Math.max(0,Number(data.expires_in||3600)-120)*1000};return data.access_token;
}
export async function googleAnalytics(env,days){
 if(!env.GA_SERVICE_ACCOUNT_JSON)return {status:'pending',property:PROPERTY,message:'Falta autorizar la lectura de Google Analytics. Las visitas todavía no están disponibles en el panel.'};
 try{
 const token=await accessToken(env);
 async function report(dimensions,metrics,limit=10){
 const r=await fetch('https://analyticsdata.googleapis.com/v1beta/properties/'+PROPERTY+':runReport',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({dateRanges:[{startDate:(days-1)+'daysAgo',endDate:'today'}],dimensions:dimensions.map(name=>({name})),metrics:metrics.map(name=>({name})),limit,orderBys:[dimensions[0]==='date'?{dimension:{dimensionName:'date'}}:{metric:{metricName:metrics[0]},desc:true}]}),signal:AbortSignal.timeout(15000)});
 if(!r.ok){const e=Error('report');e.status=r.status;throw e}const d=await r.json();return (d.rows||[]).map(row=>({label:row.dimensionValues?.map(v=>v.value).join(' / ')||'',values:row.metricValues.map(v=>Number(v.value)||0)}));
 }
 const [totals,daily,pages,sources,countries,devices]=await Promise.all([report([],['activeUsers','sessions','screenPageViews']),report(['date'],['screenPageViews'],90),report(['pagePath'],['screenPageViews']),report(['sessionDefaultChannelGroup'],['sessions']),report(['country'],['activeUsers']),report(['deviceCategory'],['activeUsers'])]);
 return {status:'connected',property:PROPERTY,totals:totals[0]?.values||[0,0,0],daily,pages,sources,countries,devices};
 }catch(e){return {status:'error',property:PROPERTY,message:e.status===403?'Google rechazó el acceso. Activa Google Analytics Data API y concede permiso de Lector a la cuenta de servicio en esta propiedad.':e.status===429?'Google alcanzó el límite temporal de consultas. Intenta más tarde.':'No pudimos leer los informes de Google. Revisa la cuenta de servicio y sus permisos e intenta nuevamente.'}}
}
export function analyticsPeriod(days,now=new Date()){
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Managua',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const start=new Date(Date.parse(today+'T00:00:00-06:00')-(days-1)*86400000).toISOString();
 return {start,end:now.toISOString(),today};
}
export async function analyticsReport(env,days,supa){
 const period=analyticsPeriod(days);
 async function all(table,select,extra=''){
 const out=[];for(let offset=0;offset<50000;offset+=1000){const rows=await supa(env,table+'?select='+select+'&created_at=gte.'+encodeURIComponent(period.start)+'&created_at=lte.'+encodeURIComponent(period.end)+extra+'&order=created_at.asc,id.asc&limit=1000&offset='+offset);out.push(...rows);if(rows.length<1000)return out}throw Error('Too many analytics rows');
 }
 const [contacts,appointments,google]=await Promise.all([all('contacts','id,created_at,stage,source'),all('calendar_events','id,created_at,status','&kind=eq.appointment'),googleAnalytics(env,days)]);
 const origins={};contacts.forEach(c=>{origins[c.source||'Sin origen']=(origins[c.source||'Sin origen']||0)+1});
 return {days,period,updated_at:new Date().toISOString(),crm:{contacts:contacts.length,appointments:appointments.length,cancelled:appointments.filter(a=>a.status==='Cancelada').length,won:contacts.filter(c=>c.stage==='Ganado').length,origins:Object.entries(origins).sort((a,b)=>b[1]-a[1])},google};
}
