-- Duo Fit V2 : stockage partagé SANS compte utilisateur.
-- À exécuter une fois dans le SQL Editor de votre projet Supabase.
-- N’altère ni les données FGO ni les tables Duo Fit V1.
create table if not exists public.duofit_v2_spaces (
 id uuid primary key default gen_random_uuid(),
 key_hash bytea not null unique,
 created_at timestamptz not null default now()
);
create table if not exists public.duofit_v2_data (
 id uuid primary key default gen_random_uuid(),
 space_id uuid not null references public.duofit_v2_spaces(id) on delete cascade,
 kind text not null check (kind in ('session','activity','measurement')),
 payload jsonb not null check (jsonb_typeof(payload)='object'),
 created_at timestamptz not null default now()
);
create index if not exists duofit_v2_space_idx on public.duofit_v2_data(space_id);
alter table public.duofit_v2_spaces enable row level security;
alter table public.duofit_v2_data enable row level security;
-- Aucun accès direct, y compris avec la clé publique. Le code privé est requis.
revoke all on public.duofit_v2_spaces from public, anon, authenticated;
revoke all on public.duofit_v2_data from public, anon, authenticated;

create or replace function public.duofit_v2_create(space_key text)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 if space_key is null or space_key !~ '^[a-f0-9]{64}$' then raise exception 'Code d’espace invalide.'; end if;
 insert into public.duofit_v2_spaces(key_hash) values(pg_catalog.sha256(pg_catalog.convert_to(space_key,'UTF8')));
 return true;
end; $$;

create or replace function public.duofit_v2_records(
 space_key text, action text, record_id uuid default null,
 record_kind text default null, record_payload jsonb default null
) returns jsonb language plpgsql security definer set search_path='' as $$
declare target uuid; result jsonb; kind_to_check text; value_to_check jsonb;
begin
 if space_key is null or space_key !~ '^[a-f0-9]{64}$' then raise exception 'Code d’espace invalide.'; end if;
 select s.id into target from public.duofit_v2_spaces s
 where s.key_hash=pg_catalog.sha256(pg_catalog.convert_to(space_key,'UTF8'));
 if target is null then raise exception 'Code inconnu. Vérifiez le code de partage.'; end if;
 if action='list' then
  select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'kind',d.kind,'payload',d.payload) order by d.created_at), '[]'::jsonb)
  into result from public.duofit_v2_data d where d.space_id=target;
  return result;
 elsif action in ('add','update') then
  kind_to_check:=record_kind;
  if action='update' then
   select d.kind into kind_to_check from public.duofit_v2_data d where d.id=record_id and d.space_id=target;
   if kind_to_check is null then raise exception 'Saisie introuvable.'; end if;
  end if;
  if kind_to_check is null or kind_to_check not in ('session','activity','measurement') then raise exception 'Type invalide.'; end if;
  value_to_check:=record_payload;
  if value_to_check is null or jsonb_typeof(value_to_check)<>'object' or octet_length(value_to_check::text)>10000 then raise exception 'Saisie invalide.'; end if;
  if kind_to_check in ('session','activity') then
   if coalesce(length(trim(value_to_check->>'name')),0) not between 1 and 80 then raise exception 'Nom requis (80 caractères maximum).'; end if;
   if coalesce((value_to_check->>'minutes')::numeric,0) not between 1 and 240 or (value_to_check->>'minutes')::numeric<>trunc((value_to_check->>'minutes')::numeric) then raise exception 'Durée invalide.'; end if;
  end if;
  if kind_to_check='activity' and coalesce(length(trim(value_to_check->>'description')),0) not between 1 and 1000 then raise exception 'Description requise (1000 caractères maximum).'; end if;
  if kind_to_check in ('session','measurement') then
   if coalesce(value_to_check->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' or (value_to_check->>'date')::date>(now() at time zone 'Europe/Paris')::date then raise exception 'Date invalide.'; end if;
   if coalesce(value_to_check->>'person','') not in ('julien','arina','duo') then raise exception 'Personne invalide.'; end if;
  end if;
  if kind_to_check='measurement' then
   if value_to_check->>'person'='duo' then raise exception 'Une mesure concerne une seule personne.'; end if;
   if (value_to_check->>'weight') is null and (value_to_check->>'fat') is null then raise exception 'Au moins une mesure est requise.'; end if;
   if (value_to_check->>'weight') is not null and (value_to_check->>'weight')::numeric not between 20 and 350 then raise exception 'Poids invalide.'; end if;
   if (value_to_check->>'fat') is not null and ((value_to_check->>'fat')::numeric<=0 or (value_to_check->>'fat')::numeric>=100) then raise exception 'Pourcentage invalide.'; end if;
  end if;
  if action='add' then
   insert into public.duofit_v2_data(space_id,kind,payload) values(target,kind_to_check,value_to_check)
   returning jsonb_build_array(jsonb_build_object('id',id,'kind',kind,'payload',payload)) into result;
  else
   update public.duofit_v2_data d set payload=value_to_check where d.id=record_id and d.space_id=target
   returning jsonb_build_array(jsonb_build_object('id',d.id,'kind',d.kind,'payload',d.payload)) into result;
  end if;
  return result;
 elsif action='delete' then
  delete from public.duofit_v2_data d where d.id=record_id and d.space_id=target;
  if not found then raise exception 'Saisie introuvable.'; end if;
  return '[]'::jsonb;
 end if;
 raise exception 'Action invalide.';
end; $$;
revoke all on function public.duofit_v2_create(text) from public;
revoke all on function public.duofit_v2_records(text,text,uuid,text,jsonb) from public;
grant execute on function public.duofit_v2_create(text) to anon, authenticated;
grant execute on function public.duofit_v2_records(text,text,uuid,text,jsonb) to anon, authenticated;
