-- Duo Fit v1. Exécuter dans le SQL Editor du projet Supabase.
-- Chaque compte ne peut appartenir qu’à un duo (deux comptes maximum).
create extension if not exists pgcrypto;
create table if not exists public.duofit_duos (
 id uuid primary key default gen_random_uuid(),
 invite text not null unique default encode(gen_random_bytes(24), 'hex'),
 created_at timestamptz not null default now()
);
create table if not exists public.duofit_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 duo_id uuid not null references public.duofit_duos(id) on delete cascade
);
create table if not exists public.duofit_records (
 id uuid primary key default gen_random_uuid(),
 duo_id uuid not null references public.duofit_duos(id) on delete cascade,
 kind text not null check (kind in ('session','activity')),
 payload jsonb not null check (jsonb_typeof(payload) = 'object'),
 created_at timestamptz not null default now()
);
create index if not exists duofit_records_duo_idx on public.duofit_records(duo_id);
alter table public.duofit_duos enable row level security;
alter table public.duofit_members enable row level security;
alter table public.duofit_records enable row level security;
-- Détection des membres sans récursion de policies.
create or replace function public.duofit_is_member(target uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.duofit_members where duo_id = target and user_id = (select auth.uid()));
$$;
revoke all on function public.duofit_is_member(uuid) from public;
grant execute on function public.duofit_is_member(uuid) to authenticated;
drop policy if exists duofit_members_read on public.duofit_members;
create policy duofit_members_read on public.duofit_members for select to authenticated using (public.duofit_is_member(duo_id));
drop policy if exists duofit_records_read on public.duofit_records;
create policy duofit_records_read on public.duofit_records for select to authenticated using (public.duofit_is_member(duo_id));
drop policy if exists duofit_records_insert on public.duofit_records;
create policy duofit_records_insert on public.duofit_records for insert to authenticated with check (public.duofit_is_member(duo_id));
drop policy if exists duofit_records_delete on public.duofit_records;
create policy duofit_records_delete on public.duofit_records for delete to authenticated using (public.duofit_is_member(duo_id));
-- Pas de lecture directe des codes, pas d’insertion directe des membres.
revoke all on public.duofit_duos from anon, authenticated;
revoke all on public.duofit_members from anon, authenticated;
revoke all on public.duofit_records from anon, authenticated;
grant select on public.duofit_members to authenticated;
grant select, insert, delete on public.duofit_records to authenticated;

create or replace function public.duofit_create()
returns uuid language plpgsql security definer set search_path = '' as $$
declare who uuid := auth.uid(); result uuid;
begin
 if who is null then raise exception 'Connectez-vous d’abord.'; end if;
 -- Sérialiser les créations / adhésions pour un même compte.
 perform pg_advisory_xact_lock(hashtextextended(who::text,0));
 select duo_id into result from public.duofit_members where user_id=who;
 if result is not null then return result; end if;
 insert into public.duofit_duos default values returning id into result;
 insert into public.duofit_members(user_id,duo_id) values(who,result);
 return result;
end; $$;
create or replace function public.duofit_join(invite_code text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare who uuid := auth.uid(); target uuid;
begin
 if who is null then raise exception 'Connectez-vous d’abord.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(who::text,0));
 if exists(select 1 from public.duofit_members where user_id=who) then raise exception 'Vous avez déjà un duo.'; end if;
 select id into target from public.duofit_duos where invite=trim(invite_code) for update;
 if target is null then raise exception 'Code d’invitation invalide.'; end if;
 if (select count(*) from public.duofit_members where duo_id=target)>=2 then raise exception 'Ce duo est déjà complet.'; end if;
 insert into public.duofit_members(user_id,duo_id) values(who,target);
 return target;
end; $$;
create or replace function public.duofit_get_invite()
returns text language sql stable security definer set search_path = '' as $$
 select d.invite from public.duofit_duos d join public.duofit_members m on m.duo_id=d.id where m.user_id=(select auth.uid());
$$;
revoke all on function public.duofit_create() from public;
revoke all on function public.duofit_join(text) from public;
revoke all on function public.duofit_get_invite() from public;
grant execute on function public.duofit_create() to authenticated;
grant execute on function public.duofit_join(text) to authenticated;
grant execute on function public.duofit_get_invite() to authenticated;
