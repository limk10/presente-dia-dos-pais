import crypto from "crypto";
import { TIKTOK_PIXEL_ID } from "./ttq";

// TikTok Events API (server-side). Imune a bloqueador de anúncio e mais
// confiável que o pixel no browser. Só dispara se TIKTOK_EVENTS_API_TOKEN
// estiver configurado — senão é um no-op silencioso.
const EVENTS_API_URL =
  "https://business-api.tiktok.com/open_api/v1.3/event/track/";

function sha256(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

/**
 * Envia o evento CompletePayment para o TikTok via Events API.
 * Chamado a partir do webhook do Cakto, quando o pagamento é confirmado.
 * `identificador` é usado como content_id e para deduplicar (event_id).
 */
export async function trackCompletePagamento(opts: {
  identificador: string;
  value: number;
  email?: string | null;
}): Promise<void> {
  const token = process.env.TIKTOK_EVENTS_API_TOKEN;
  if (!token) return; // não configurado — ignora

  const user: Record<string, string> = {};
  if (opts.email) user.email = sha256(opts.email);

  const body = {
    event_source: "web",
    event_source_id: TIKTOK_PIXEL_ID,
    data: [
      {
        event: "CompletePayment",
        event_time: Math.floor(Date.now() / 1000),
        event_id: `pay-${opts.identificador}`,
        user,
        properties: {
          content_type: "product",
          content_id: opts.identificador,
          content_name: "Site do Meu Pai",
          currency: "BRL",
          value: opts.value,
          quantity: 1,
        },
      },
    ],
  };

  try {
    const res = await fetch(EVENTS_API_URL, {
      method: "POST",
      headers: {
        "Access-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as {
      code?: number;
      message?: string;
    } | null;
    if (!res.ok || (json && json.code !== 0)) {
      console.error("[tiktok events] CompletePayment falhou:", res.status, json);
    }
  } catch (err) {
    console.error("[tiktok events] erro ao enviar CompletePayment:", err);
  }
}
