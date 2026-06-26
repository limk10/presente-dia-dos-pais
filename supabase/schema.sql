-- ═══════════════════════════════════════════════════════════════
-- Schema — Site do Meu Pai
-- Rode isto no Supabase: Dashboard > SQL Editor > New query > Run
-- ═══════════════════════════════════════════════════════════════

-- Tabela principal: cada presente é um site personalizado.
create table if not exists public.presentes (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  nome_pai        text not null,
  mensagem        text not null,
  nome_remetente  text,
  email_comprador text,
  youtube_url     text,
  status          text not null default 'pendente'
                    check (status in ('pendente', 'ativo')),
  created_at      timestamptz not null default now(),
  activated_at    timestamptz
);

create index if not exists presentes_status_email_idx
  on public.presentes (status, email_comprador);

create index if not exists presentes_created_at_idx
  on public.presentes (created_at desc);

-- Fotos de cada presente (até 10 por presente, controlado na aplicação).
create table if not exists public.fotos (
  id           uuid primary key default gen_random_uuid(),
  presente_id  uuid not null references public.presentes(id) on delete cascade,
  url          text not null,
  ordem        int  not null default 0
);

create index if not exists fotos_presente_idx on public.fotos (presente_id, ordem);

-- ───────────────────────────────────────────────────────────────
-- Row Level Security
-- Todo acesso da aplicação é feito server-side com a service_role,
-- que ignora RLS. Mantemos RLS LIGADO e sem policies públicas, de
-- modo que a chave anon (caso vaze) não consiga ler nada.
-- ───────────────────────────────────────────────────────────────
alter table public.presentes enable row level security;
alter table public.fotos     enable row level security;

-- ───────────────────────────────────────────────────────────────
-- Storage: bucket público de fotos
-- (público para que a página do pai exiba as imagens sem auth)
-- ───────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

-- Leitura pública das fotos (necessário para o bucket público funcionar via URL).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Fotos leitura publica'
  ) then
    create policy "Fotos leitura publica"
      on storage.objects for select
      using (bucket_id = 'fotos');
  end if;
end $$;

-- Upload/escrita continua restrito: feito server-side com service_role.
