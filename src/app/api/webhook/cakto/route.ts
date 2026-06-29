import { NextRequest, NextResponse } from "next/server";
import {
  updatePresenteStatus,
  getPresentePorEmail,
  ativarPresentePorId,
} from "@/lib/db";
import { trackCompletePagamento } from "@/lib/tiktokEvents";

const PRECO = Number(process.env.NEXT_PUBLIC_PRECO || "29");

export const runtime = "nodejs";

const EVENTOS_APROVADOS = new Set([
  "purchase_approved",
  "purchase_paid",
  "purchase_completed",
]);

/**
 * Extrai o slug passado como ?src=<slug> no link do checkout.
 * Regex corrigida para capturar slugs com hífens (ex: marcos-aurelio-de-matheus-lopes).
 */
function extrairSlug(payload: unknown): string | null {
  const d = (payload as Record<string, unknown>)?.data as Record<string, unknown> ?? payload as Record<string, unknown> ?? {};
  const candidatos = [
    d.src,
    d.tracking,
    d.utm_content,
    d.ref,
    (payload as Record<string, unknown>)?.src,
    (d.offer as Record<string, unknown>)?.src,
    (d.checkout as Record<string, unknown>)?.src,
  ];
  const slugPattern = /^[a-z0-9][a-z0-9-]{2,58}$/;
  for (const c of candidatos) {
    if (typeof c === "string" && slugPattern.test(c.trim())) {
      return c.trim();
    }
  }
  // Procura ?src= dentro de qualquer URL no payload
  const urls = [d.checkoutUrl, d.checkout_url, d.url].filter(
    (u): u is string => typeof u === "string",
  );
  for (const u of urls) {
    const m = u.match(/[?&]src=([a-z0-9][a-z0-9-]{2,58})/i);
    if (m) return m[1];
  }
  return null;
}

function extrairEmail(payload: unknown): string | null {
  const d = ((payload as Record<string, unknown>)?.data ?? {}) as Record<string, unknown>;
  const email =
    (d.customer as Record<string, unknown>)?.email ??
    (d.buyer as Record<string, unknown>)?.email ??
    d.email;
  return typeof email === "string" ? email.trim().toLowerCase() : null;
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  console.log("[cakto webhook]", JSON.stringify(payload));

  const secretEsperado = process.env.CAKTO_WEBHOOK_SECRET;
  if (secretEsperado) {
    const p = payload as Record<string, unknown>;
    const secretRecebido =
      (p?.secret as string) ?? req.headers.get("x-cakto-secret") ?? "";
    if (secretRecebido !== secretEsperado) {
      console.warn("[cakto webhook] secret inválido");
      return NextResponse.json({ error: "não autorizado" }, { status: 401 });
    }
  }

  const p = payload as Record<string, unknown>;
  const evento = (p?.event ?? p?.type ?? "") as string;
  if (!EVENTOS_APROVADOS.has(evento)) {
    return NextResponse.json({ ok: true, ignored: evento });
  }

  let ativado = false;
  let via = "";
  let identificador: string | null = null;

  const slug = extrairSlug(payload);
  if (slug) {
    try {
      ativado = await updatePresenteStatus(slug, "ativo", {
        activated_at: new Date().toISOString(),
      });
      if (ativado) {
        via = "slug";
        identificador = slug;
      }
    } catch (err) {
      console.error("[cakto webhook] erro ao ativar por slug:", err);
    }
  }

  if (!ativado) {
    const email = extrairEmail(payload);
    if (email) {
      try {
        const row = await getPresentePorEmail(email);
        if (row) {
          ativado = await ativarPresentePorId(row.id);
          if (ativado) {
            via = "email";
            identificador = row.id;
          }
        }
      } catch (err) {
        console.error("[cakto webhook] erro ao ativar por email:", err);
      }
    }
  }

  // Conversão confirmada → dispara CompletePayment no TikTok (server-side).
  if (ativado && identificador) {
    await trackCompletePagamento({
      identificador,
      value: PRECO,
      email: extrairEmail(payload),
    });
  }

  if (!ativado) {
    console.warn("[cakto webhook] presente não encontrado", {
      slug,
      email: extrairEmail(payload),
    });
    return NextResponse.json({ ok: true, matched: false });
  }

  return NextResponse.json({ ok: true, matched: true, via });
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "cakto-webhook" });
}
