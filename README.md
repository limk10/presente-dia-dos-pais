# Site do Meu Pai

Presente digital de Dia dos Pais: o filho cria um site personalizado (fotos,
mensagem e música do YouTube) com **prévia ao vivo**, paga via Cakto, e recebe
um link único para mandar pro pai. A página do pai tem compartilhamento por
**WhatsApp**, **QR Code** e **copiar link**.

- **App + webhook:** Next.js 14 (App Router) — hospedado na **Vercel**
- **Banco + fotos:** **Supabase** (Postgres + Storage)
- **Checkout:** **Cakto** (link + webhook)

---

## Como funciona o fluxo

```
1. Filho preenche o formulário (/) → prévia ao vivo
2. POST /api/presentes → sobe fotos no Storage, cria registro (status: pendente, slug único)
3. Filho clica "Liberar" → vai pro Cakto com ?src=<slug>&email=<email>
4. Pagamento aprovado → Cakto chama POST /api/webhook/cakto
5. Webhook casa a venda pelo src (slug) [ou e-mail] → status: ativo
6. /[slug] passa a exibir o presente (antes disso, mostra tela de espera que faz polling)
```

---

## 1. Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha os valores (ver abaixo)
npm run dev                  # http://localhost:3000
```

A home (`/`) funciona sem env. As rotas de banco (`/[slug]`, `/api/*`) exigem
as variáveis do Supabase configuradas.

## 2. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (plano free serve).
2. **SQL Editor → New query** → cole o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql) → **Run**.
   Isso cria as tabelas `presentes` e `fotos`, o bucket público `fotos` e as policies.
3. **Project Settings → API** → copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key (secreta!) → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Deploy na Vercel

1. Suba este diretório (`site/`) num repositório Git e importe na
   [Vercel](https://vercel.com), **ou** use a CLI:
   ```bash
   npm i -g vercel
   vercel            # primeira vez: cria o projeto
   vercel --prod     # publica
   ```
2. Em **Project Settings → Environment Variables**, adicione todas as variáveis
   abaixo (use a URL `*.vercel.app` que a Vercel te der em `NEXT_PUBLIC_SITE_URL`).
3. Redeploy após salvar as variáveis.

### Variáveis de ambiente

| Variável | Onde usar | Valor |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | client + server | `https://seu-app.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | server | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | **server (secreto)** | service_role key |
| `NEXT_PUBLIC_CAKTO_CHECKOUT_URL` | client | `https://pay.cakto.com.br/cbwju7a_944001` |
| `CAKTO_WEBHOOK_SECRET` | server | secret do webhook (opcional, recomendado) |
| `NEXT_PUBLIC_PRECO` | client | `29` |

## 4. Configurar o webhook na Cakto

1. No painel da Cakto, abra o produto → **Webhooks**.
2. Adicione a URL: `https://seu-app.vercel.app/api/webhook/cakto`
3. Evento: **Compra Aprovada** (`purchase_approved`).
4. Se a Cakto fornecer um **secret**, copie-o para a env `CAKTO_WEBHOOK_SECRET`
   (o webhook valida `payload.secret` contra essa variável).

### Como a venda é casada com o presente

O link de checkout é aberto com `?src=<slug>`. O webhook procura esse `src` no
payload e ativa o presente correspondente. Se não achar, faz fallback pelo
**e-mail** do comprador (campo opcional do formulário, também pré-enviado à Cakto).

> **Importante — valide com uma venda real de teste.** Toda chamada do webhook
> loga o payload cru: na Vercel, **Deployments → Functions → Logs**, procure por
> `[cakto webhook]`. Confirme em qual campo a Cakto devolve o `src`. Se o nome do
> campo for diferente, ajuste a função `extrairSlug` em
> [`src/app/api/webhook/cakto/route.ts`](./src/app/api/webhook/cakto/route.ts)
> (é só adicionar o campo na lista de candidatos).

### Ativação manual (fallback de emergência)

Se uma venda não ativar sozinha, rode no **SQL Editor** do Supabase:

```sql
update presentes set status = 'ativo', activated_at = now()
where slug = 'SLUG_AQUI';
```

---

## Estrutura

```
src/
├── app/
│   ├── page.tsx                  Landing page
│   ├── [slug]/page.tsx           Página do pai (ou tela de espera se pendente)
│   ├── not-found.tsx
│   └── api/
│       ├── presentes/route.ts    POST: cria presente + upload de fotos
│       ├── webhook/cakto/route.ts POST: ativa via src/e-mail
│       └── status/[slug]/route.ts GET: status p/ polling
├── components/
│   ├── Form.tsx                  Formulário + estado "link gerado"
│   ├── Preview.tsx               Prévia ao vivo (dentro do "celular")
│   ├── GiftView.tsx              Intro-surpresa + galeria + música
│   ├── ShareBar.tsx              WhatsApp / QR Code / copiar
│   ├── WaitingView.tsx           Espera com polling
│   └── ScrollReveal.tsx          Animações de scroll + nav
└── lib/
    ├── supabase.ts  slug.ts  youtube.ts
supabase/schema.sql               Rode no Supabase
```

## Notas de segurança

- A `service_role` só é usada server-side. RLS fica ligado sem policies públicas,
  então a chave anon (não usada) não leria nada caso vazasse.
- O bucket `fotos` é público por leitura (necessário para exibir no link do pai).
  Os caminhos são prefixados pelo slug aleatório — não são adivinháveis na prática.
- `audit`: os alertas restantes (`postcss`, build-time) só "somem" migrando para o
  Next 16 (breaking). A linha 14.2.35 já corrige a falha crítica de runtime.
