import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getPresente, getFotos } from "@/lib/db";
import { youtubeId } from "@/lib/youtube";
import GiftView from "@/components/GiftView";
import WaitingView from "@/components/WaitingView";

// Sempre busca dados frescos — status muda via webhook assíncrono.
export const dynamic = "force-dynamic";

// Garante que a URL sempre tenha protocolo (https://) e sem barra no final,
// pra o link compartilhado (WhatsApp etc.) ser absoluto e não cair em 404.
function withProtocol(url: string): string {
  // Remove espaços, caracteres parasitas no começo (ex.: "(") e barras no final.
  const cleaned = url
    .trim()
    .replace(/^[^a-z0-9]+/i, "")
    .replace(/\/+$/, "");
  if (!cleaned) return "";
  return /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
}

function baseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL)
    return withProtocol(process.env.NEXT_PUBLIC_SITE_URL);
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "";
}

export default async function PresentePage({
  params,
}: {
  params: { slug: string };
}) {
  const presente = await getPresente(params.slug).catch(() => null);

  if (!presente) notFound();

  if (presente.status !== "ativo") {
    return <WaitingView slug={presente.slug} />;
  }

  const fotos = await getFotos(presente.id).catch(() => [] as Awaited<ReturnType<typeof getFotos>>);
  const link = `${baseUrl()}/${presente.slug}`;

  return (
    <GiftView
      nomePai={presente.nome_pai}
      mensagem={presente.mensagem}
      nomeRemetente={presente.nome_remetente}
      youtubeId={youtubeId(presente.youtube_url)}
      fotos={fotos.map((f) => f.url)}
      link={link}
    />
  );
}
