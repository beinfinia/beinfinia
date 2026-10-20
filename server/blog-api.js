import {migrationState,migrateD1} from './migrate.js';
import {supa,PROJECT_URL} from './supabase.js';
export async function blogAPI({request,env,params},{authorized,json,clean}) {
 try{
 const path=Array.isArray(params.path)?params.path.join('/'):params.path||'';const method=request.method;
 if(!env.SUPABASE_SECRET_KEY)return json({error:'Configura SUPABASE_SECRET_KEY en Cloudflare para activar el blog.'},503);
 if(!env.SESSION_SECRET||!await authorized(request,env))return json({error:'Inicia sesión'},401);
 if(method!=='GET'&&request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Origen no permitido'},403);
 if(path==='blog/posts'&&method==='GET')return json({posts:await supa(env,'blog_posts?order=updated_at.desc')});
 if(path==='blog/upload'&&method==='POST'){
 const form=await request.formData(),file=form.get('file');if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5242880)return json({error:'Usa JPG, PNG o WebP de hasta 5 MB.'},400);
 const bytes=new Uint8Array(await file.arrayBuffer());const valid=file.type==='image/jpeg'?bytes[0]===255&&bytes[1]===216:file.type==='image/png'?bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71:String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';if(!valid)return json({error:'El archivo no es una imagen válida.'},400);
 const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type],name=crypto.randomUUID()+'.'+ext;
 const r=await fetch((env.SUPABASE_URL||PROJECT_URL)+'/storage/v1/object/blog-covers/'+name,{method:'POST',headers:{apikey:env.SUPABASE_SECRET_KEY,...(env.SUPABASE_SECRET_KEY.startsWith('eyJ')?{Authorization:'Bearer '+env.SUPABASE_SECRET_KEY}:{}),'Content-Type':file.type},body:bytes});if(!r.ok)return json({error:'No se pudo subir la portada.'},502);
 return json({url:(env.SUPABASE_URL||PROJECT_URL)+'/storage/v1/object/public/blog-covers/'+name});
 }
 if(path==='blog/posts'&&method==='POST'){
 const b=await request.json(),title=clean(b.title,160),slug=clean(b.slug,160),status=b.status==='published'?'published':'draft';
 if(!title||!slug||!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))return json({error:'Escribe el título y una URL con letras minúsculas, números y guiones.'},400);
 if(status==='published'&&clean(b.content,100000).length<100)return json({error:'Completa el artículo antes de publicarlo.'},400);
 const cover=clean(b.cover_url,1000);if(cover&&!cover.startsWith((env.SUPABASE_URL||PROJECT_URL)+'/storage/v1/object/public/blog-covers/'))return json({error:'Sube la portada desde el editor.'},400);
 const post={title,slug,status,excerpt:clean(b.excerpt,300),content:clean(b.content,100000),category:clean(b.category,80)||'Estrategia',author:clean(b.author,100)||'Equipo Infinia',cover_url:cover,seo_title:clean(b.seo_title,160),seo_description:clean(b.seo_description,300),updated_at:new Date().toISOString()};
 let previous=null;if(b.id)previous=(await supa(env,'blog_posts?id=eq.'+encodeURIComponent(b.id)))[0];
 if(b.id&&!previous)return json({error:'Artículo no encontrado'},404);
 post.published_at=status==='published'?previous?.published_at||new Date().toISOString():previous?.published_at||null;
 const rows=await supa(env,'blog_posts'+(b.id?'?id=eq.'+encodeURIComponent(b.id):''),b.id?'PATCH':'POST',post);return json({ok:true,post:rows[0]});
 }
 if(path==='migration/status'){
 const state=await migrationState(env);
 return json({backend:'supabase',ready:Boolean(env.SUPABASE_SECRET_KEY),receipts:state?[state]:[],migration_pending:!state});
 }
 if(path==='migration/export'&&method==='GET'){
 if(!env.DB)return json({error:'D1 no está vinculada.'},503);
 const tables=['contacts','appointments','tasks','calendar_blocks','email_notifications','settings'];
 const results=await env.DB.batch(tables.map(table=>env.DB.prepare('SELECT * FROM '+table)));
 return new Response(JSON.stringify(Object.fromEntries(tables.map((table,i)=>[table,results[i].results])),null,2),{headers:{'Content-Type':'application/json','Content-Disposition':'attachment; filename="infinia-d1-backup.json"','Cache-Control':'no-store'}});
 }
 if(path==='migration/run'&&method==='POST'){
 const result=await migrateD1(env);return json({ok:true,result,message:'Supabase es la única base activa. La copia de D1 está verificada.'});
 }
 return json({error:'Ruta no disponible'},404);
 }catch(e){return json({error:e.message.includes('PAUSE_D1_FIRST')?'Activa MIGRATION_MODE=1 antes de copiar D1.':e.message.includes('MISSING_D1_BACKUP')?'Conserva el vínculo DB de D1 hasta verificar la copia.':e.message.includes('TARGET_NOT_EMPTY')?'Supabase ya tiene datos diferentes. No se ha sobrescrito nada. Revisa la migración.':e.code==='23P01'?'Hay horarios superpuestos en los datos de origen. La copia se canceló sin cambios.':e.code==='23505'?'Esa URL ya existe. Elige otra.':'No se pudo completar la operación. Revisa Supabase y vuelve a intentar.'},409)}
}
