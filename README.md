# MedUp — Landing Page

Landing page do **MedUp**, app de gamificação comportamental para estudantes de medicina, desenvolvido no Projetos 4 da CESAR School (2026).

## Stack

- HTML / CSS / JS puros (sem build)
- GSAP + ScrollTrigger (via CDN, com SRI)
- Fontes Satoshi + Cabinet Grotesk (via Fontshare)

## Rodando localmente

Basta abrir `index.html` no navegador. Conexão com a internet é necessária para fontes, animações e imagens.

## Deploy

Publicado via GitHub Pages — branch `main`, raiz do repositório.

## Coleta de e-mails (Supabase)

O formulário da waitlist grava os e-mails numa tabela do Supabase via REST API
(sem backend próprio). Para ativar:

1. Crie um projeto em [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → cole o conteúdo de [`supabase-setup.sql`](supabase-setup.sql) → **Run**.
3. **Project Settings → API** → copie o **Project URL** e a **publishable key**
   (`sb_publishable_…`).
4. Em [`landing.js`](landing.js), no topo do arquivo, preencha `SUPABASE_URL` e
   `SUPABASE_ANON_KEY` com esses dois valores.
5. Abra a landing, envie um e-mail de teste e confira em
   **Table Editor → waitlist** no painel.

A publishable key é **pública por design** — pode ir pro repositório/HTML. A
proteção é o RLS no banco: anônimos só podem **inserir**, nunca ler a lista.
Nunca use a *secret key* (`sb_secret_…`) aqui.
