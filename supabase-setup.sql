-- ============================================================
-- MedUp — Waitlist (coleta de e-mails da landing)
--
-- COMO USAR:
--   Supabase Dashboard > SQL Editor > New query > cole tudo > Run.
--   Seguro rodar de novo (idempotente).
-- ============================================================

-- 1) Tabela ------------------------------------------------------------------
create table if not exists public.waitlist (
    id          bigint generated always as identity primary key,
    email       text        not null,
    source      text        not null default 'landing',
    created_at  timestamptz not null default now(),

    -- impede e-mails repetidos (insert duplicado vira HTTP 409, tratado no front)
    constraint waitlist_email_unique unique (email),

    -- validação leve no próprio banco (defesa em profundidade, além do front)
    constraint waitlist_email_format check (
        char_length(email) <= 254
        and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    )
);

-- 2) Row Level Security ------------------------------------------------------
alter table public.waitlist enable row level security;

-- 3) Policy: visitante anônimo pode INSERIR (e só isso) ----------------------
--    Repare: NÃO criamos policy de SELECT/UPDATE/DELETE para 'anon'.
--    Logo, ninguém anônimo consegue LER, editar ou apagar a lista.
drop policy if exists "anon pode entrar na waitlist" on public.waitlist;
create policy "anon pode entrar na waitlist"
    on public.waitlist
    for insert
    to anon
    with check (true);

-- 4) Grants ------------------------------------------------------------------
--    Desde 2026-04-28 tabelas novas no schema public NÃO são expostas
--    automaticamente à Data API — por isso o GRANT explícito abaixo.
--    Damos apenas INSERT (sem SELECT) para que a lista não possa ser baixada.
grant usage  on schema public      to anon;
grant insert on table  public.waitlist to anon;

-- 5) Recarrega o cache de schema do PostgREST (efeito imediato) ---------------
notify pgrst, 'reload schema';

-- ============================================================
-- TESTE RÁPIDO (opcional) — rode como 'anon' para validar o RLS:
--   set role anon;
--   insert into public.waitlist (email) values ('teste@exemplo.com');  -- deve funcionar
--   select * from public.waitlist;                                      -- deve dar "permission denied"
--   reset role;
-- ============================================================
