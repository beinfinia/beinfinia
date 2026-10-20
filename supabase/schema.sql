create extension if not exists btree_gist with schema extensions;
create table public.contacts (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 100), email text not null default '', phone text not null default '', service text not null default '',
 stage text not null default 'Nuevo' check(stage in ('Nuevo','Contactado','Cita agendada','Propuesta enviada','Ganado','Perdido')), source text not null default 'Manual', notes text not null default '', created_at timestamptz not null default now()
);
create table public.calendar_events (
 id uuid primary key default gen_random_uuid(), kind text not null check(kind in ('appointment','block')), contact_id uuid references public.contacts(id),
 starts_at timestamptz not null, ends_at timestamptz not null, status text not null default 'Agendada' check(status in ('Agendada','Realizada','Cancelada','No asistió')), reason text not null default '', created_at timestamptz not null default now(),
 check(ends_at>starts_at), check((kind='appointment' and contact_id is not null) or (kind='block' and contact_id is null)),
 exclude using gist (tstzrange(starts_at,ends_at,'[)') with &&) where (status != 'Cancelada')
);
create index calendar_contact on public.calendar_events(contact_id);
create table public.tasks (id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 1 and 200), due_date text not null default '', done integer not null default 0 check(done in (0,1)), created_at timestamptz not null default now());
create table public.settings (id integer primary key check(id=1), data jsonb not null);
insert into public.settings values(1,'{"days":[1,2,3,4,5],"start":9,"end":17,"duration":30,"timezone":"America/Managua"}');
create table public.email_notifications (id uuid primary key default gen_random_uuid(), appointment_id uuid not null references public.calendar_events(id), payload jsonb not null, status text not null default 'Pendiente', created_at timestamptz not null default now());
create index notification_appointment on public.email_notifications(appointment_id);
create table public.rate_limits (key text primary key, count integer not null default 1, expires_at timestamptz not null default now()+interval '1 hour');
create table public.migration_receipts (id text primary key, result jsonb not null, created_at timestamptz not null default now());
create table public.blog_posts (
 id uuid primary key default gen_random_uuid(), slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), title text not null check(length(title) between 1 and 160), excerpt text not null default '', content text not null default '', category text not null default 'Estrategia', author text not null default 'Equipo Infinia', cover_url text not null default '', seo_title text not null default '', seo_description text not null default '', status text not null default 'draft' check(status in ('draft','published')), published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(status!='published' or published_at is not null)
);
create index blog_published on public.blog_posts(published_at desc) where status='published';
alter table public.contacts enable row level security;
alter table public.calendar_events enable row level security;
alter table public.tasks enable row level security;
alter table public.settings enable row level security;
alter table public.email_notifications enable row level security;
alter table public.rate_limits enable row level security;
alter table public.migration_receipts enable row level security;
alter table public.blog_posts enable row level security;
revoke all on public.contacts,public.calendar_events,public.tasks,public.settings,public.email_notifications,public.rate_limits,public.migration_receipts,public.blog_posts from anon,authenticated;
grant select,insert,update,delete on public.contacts,public.calendar_events,public.tasks,public.settings,public.email_notifications,public.rate_limits,public.migration_receipts,public.blog_posts to service_role;
grant select on public.blog_posts to anon,authenticated;
create policy published_blog_read on public.blog_posts for select to anon,authenticated using(status='published' and published_at<=now());

-- Only the authenticated Pages server can invoke these functions. They never elevate privileges.
create function public.infinia_rate(p_key text) returns integer language plpgsql security invoker set search_path='' as $$
declare n integer; begin
 delete from public.rate_limits where expires_at<now();
 insert into public.rate_limits(key,count) values(p_key,1) on conflict(key) do update set count=public.rate_limits.count+1 returning count into n;return n;
end $$;
create function public.infinia_appointment(p_action text,p_data jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare cid uuid; eid uuid; nid uuid; duration integer; start_at timestamptz; old_start timestamptz; next_status text; notification jsonb;
begin
 start_at:=(p_data->>'starts_at')::timestamptz;
 if p_action='public' then
  cid:=(p_data->>'contact_id')::uuid;
  insert into public.contacts(id,name,email,phone,service,stage,source,notes) values(cid,p_data->>'name',p_data->>'email',p_data->>'phone',p_data->>'service','Cita agendada','Página de citas',p_data->>'notes');
 else cid:=(p_data->>'contact_id')::uuid; end if;
 eid:=(p_data->>'id')::uuid;duration:=(p_data->>'duration')::integer;
 if p_action in ('public','manual') then
  insert into public.calendar_events(id,kind,contact_id,starts_at,ends_at) values(eid,'appointment',cid,start_at,start_at+duration*interval '1 minute');
  update public.contacts set stage='Cita agendada' where id=cid and stage not in ('Ganado','Perdido');
 elsif p_action='update' then
  select starts_at into old_start from public.calendar_events where id=eid and kind='appointment' for update;
  if not found then raise exception 'NOT_FOUND';end if;
  if old_start != (p_data->>'expected_start')::timestamptz then raise exception 'STALE_APPOINTMENT';end if;
  next_status:=p_data->>'status';
  update public.calendar_events set starts_at=start_at,ends_at=start_at+duration*interval '1 minute',status=next_status where id=eid;
 else raise exception 'INVALID_ACTION'; end if;
 notification:=p_data->'notification';
 if notification is not null and notification!='null'::jsonb then
  nid:=(notification->>'id')::uuid;
  insert into public.email_notifications(id,appointment_id,payload) values(nid,eid,notification->'payload');
 end if;
 return jsonb_build_object('id',eid,'notification_id',nid);
end $$;
create function public.infinia_import(p_data jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare receipt_id text:=md5(p_data::text); result jsonb; row jsonb;
begin
 perform pg_advisory_xact_lock(7321691);
 select r.result into result from public.migration_receipts r where r.id=receipt_id;
 if found then return result;end if;
 if exists(select 1 from public.contacts) or exists(select 1 from public.calendar_events) or exists(select 1 from public.tasks) or exists(select 1 from public.email_notifications) then raise exception 'TARGET_NOT_EMPTY';end if;
 insert into public.contacts(id,name,email,phone,service,stage,source,notes,created_at)
 select id,name,email,phone,service,stage,source,notes,created_at from jsonb_to_recordset(p_data->'contacts') as x(id uuid,name text,email text,phone text,service text,stage text,source text,notes text,created_at timestamptz);
 insert into public.tasks(id,title,due_date,done,created_at) select id,title,due_date,done,created_at from jsonb_to_recordset(p_data->'tasks') as x(id uuid,title text,due_date text,done integer,created_at timestamptz);
 for row in select * from jsonb_array_elements(p_data->'appointments') loop
  insert into public.calendar_events(id,kind,contact_id,starts_at,ends_at,status,created_at) values((row->>'id')::uuid,'appointment',(row->>'contact_id')::uuid,(row->>'starts_at')::timestamptz,(row->>'starts_at')::timestamptz+(row->>'duration')::integer*interval '1 minute',row->>'status',(row->>'created_at')::timestamptz);
 end loop;
 for row in select * from jsonb_array_elements(p_data->'blocks') loop
  insert into public.calendar_events(id,kind,starts_at,ends_at,status,reason,created_at) values((row->>'id')::uuid,'block',(row->>'starts_at')::timestamptz,(row->>'ends_at')::timestamptz,case when (row->>'active')::integer=1 then 'Agendada' else 'Cancelada' end,row->>'reason',(row->>'created_at')::timestamptz);
 end loop;
 insert into public.email_notifications(id,appointment_id,payload,status,created_at) select id,appointment_id,payload,status,created_at from jsonb_to_recordset(p_data->'notifications') as x(id uuid,appointment_id uuid,payload jsonb,status text,created_at timestamptz);
 if p_data->'settings' is not null then update public.settings set data=p_data->'settings' where id=1;end if;
 result:=jsonb_build_object('contacts',(select count(*) from public.contacts),'appointments',(select count(*) from public.calendar_events where kind='appointment'),'blocks',(select count(*) from public.calendar_events where kind='block'),'tasks',(select count(*) from public.tasks),'notifications',(select count(*) from public.email_notifications),'receipt',receipt_id);
 insert into public.migration_receipts(id,result) values(receipt_id,result);return result;
end $$;
revoke execute on function public.infinia_rate(text),public.infinia_appointment(text,jsonb),public.infinia_import(jsonb) from public,anon,authenticated;
grant execute on function public.infinia_rate(text),public.infinia_appointment(text,jsonb),public.infinia_import(jsonb) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('blog-covers','blog-covers',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
