import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Eventos da Cakto que significam "pagamento confirmado".
const EVENTOS_APROVADOS = new Set([
  "purchase_approved",
  "purchase_paid",
  "purchase_completed",
]);

/**
 * Tenta encontrar o nosso slug no payload da Cakto.
 * Passamos o slug como ?src=<slug> no link do checkout; a Cakto costuma
 * devolver isso em algum campo de tracking. Procuramos em vários lugares
 * porque o nome exato pode variar. Ajuste aqui se necessário depois de
 * inspecionar um payload real (logado abaixo).
 */
function extrairSlug(payload: any): string | null {
  const d = payload?.data ?? payload ?? {};
  const candidatos = [
    d.src,
    d.tracking,
    d.utm_content,
    d.ref,
    payload?.src,
    d.offer?.src,
    d.checkout?.src,
  ];
  for (const c of candidatos) {
    if (typeof c === "string" && /^[a-z0-9]{5,12}$/.test(c.trim())) {
      return c.trim();
    }
  }
  // Procura ?src= dentro de qualquer URL presente no payload.
  const urls = [d.checkoutUrl, d.checkout_url, d.url].filter(
    (u): u is string => typeof u === "string",
  );
  for (const u of urls) {
    const m = u.match(/[?&]src=([a-z0-9]{5,12})/i);
    if (m) return m[1];
  }
  return null;
}

function extrairEmail(payload: any): string | null {
  const d = payload?.data ?? {};
  const email = d.customer?.email ?? d.buyer?.email ?? d.email;
  return typeof email === "string" ? email.trim().toLowerCase() : null;
}

async function ativarPorSlug(slug: string): Promise<boolean> {
  const supa = supabaseAdmin();
  const { data, error } = await supa
    .from("presentes")
    .update({ status: "ativo", activated_at: new Date().toISOString() })
    .eq("slug", slug)
    .eq("status", "pendente")
    .select("id");
  return !error && !!data && data.length > 0;
}

async function ativarPorEmail(email: string): Promise<boolean> {
  const supa = supabaseAdmin();
  // Ativa o presente pendente mais recente desse e-mail.
  const { data } = await supa
    .from("presentes")
    .select("id")
    .eq("status", "pendente")
    .ilike("email_comprador", email)
    .order("created_at", { ascending: false })
    .limit(1);
  if (!data || data.length === 0) return false;
  const { error } = await supabaseAdmin()
    .from("presentes")
    .update({ status: "ativo", activated_at: new Date().toISOString() })
    .eq("id", data[0].id);
  return !error;
}

export async function POST(req: NextRequest) {
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  // Log do payload cru — inspecione no Vercel (Functions > Logs) para
  // confirmar a estrutura real e ajustar extrairSlug se preciso.
  console.log("[cakto webhook]", JSON.stringify(payload));

  // Validação do secret (se configurado no ambiente).
  const secretEsperado = process.env.CAKTO_WEBHOOK_SECRET;
  if (secretEsperado) {
    const secretRecebido =
      payload?.secret ?? req.headers.get("x-cakto-secret") ?? "";
    if (secretRecebido !== secretEsperado) {
      console.warn("[cakto webhook] secret inválido");
      return NextResponse.json({ error: "não autorizado" }, { status: 401 });
    }
  }

  const evento = payload?.event ?? payload?.type ?? "";
  if (!EVENTOS_APROVADOS.has(evento)) {
    // Não é um pagamento aprovado — reconhece e ignora.
    return NextResponse.json({ ok: true, ignored: evento });
  }

  // 1) tenta casar pelo slug (src); 2) fallback pelo e-mail.
  let ativado = false;
  let via = "";

  const slug = extrairSlug(payload);
  if (slug) {
    ativado = await ativarPorSlug(slug);
    if (ativado) via = "slug";
  }
  if (!ativado) {
    const email = extrairEmail(payload);
    if (email) {
      ativado = await ativarPorEmail(email);
      if (ativado) via = "email";
    }
  }

  if (!ativado) {
    // Reconhece (200) para a Cakto não reenviar infinitamente, mas loga
    // como aviso para ativação manual se necessário.
    console.warn(
      "[cakto webhook] pagamento aprovado mas presente não encontrado",
      { slug, email: extrairEmail(payload) },
    );
    return NextResponse.json({ ok: true, matched: false });
  }

  return NextResponse.json({ ok: true, matched: true, via });
}

// Healthcheck simples (a Cakto às vezes faz GET ao validar a URL).
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "cakto-webhook" });
}
