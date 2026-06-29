// Helper de tracking do TikTok Pixel (client-side).
// O objeto global `ttq` é injetado pelo <TikTokPixel /> no layout raiz.

// Pixel ID público do TikTok (exposto no client, como todo pixel de analytics).
export const TIKTOK_PIXEL_ID = "D9164JJC77U49J863MSG";

// Eventos padrão do TikTok que usamos no funil.
type TtqEvent =
  | "ViewContent"
  | "ClickButton"
  | "InitiateCheckout"
  | "CompleteRegistration"
  | "CompletePayment"
  | "SubmitForm"
  | "Contact";

type TtqParams = {
  content_id?: string;
  content_type?: string;
  content_name?: string;
  currency?: string;
  value?: number;
  quantity?: number;
};

declare global {
  interface Window {
    ttq?: {
      page: () => void;
      track: (
        event: string,
        params?: Record<string, unknown>,
        options?: { event_id?: string },
      ) => void;
      identify: (params: Record<string, unknown>) => void;
    };
  }
}

/**
 * Dispara um evento no TikTok Pixel de forma segura.
 * Se o pixel ainda não carregou ou foi bloqueado, ignora silenciosamente.
 * `eventId` permite deduplicar com o mesmo evento enviado server-side (Events API).
 */
export function ttqTrack(
  event: TtqEvent,
  params: TtqParams = {},
  eventId?: string,
) {
  if (typeof window === "undefined") return;
  try {
    window.ttq?.track(
      event,
      params,
      eventId ? { event_id: eventId } : undefined,
    );
  } catch {
    // pixel indisponível — não quebra a UX
  }
}
