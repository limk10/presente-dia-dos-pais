import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { supabaseAdmin, type Presente, type Foto } from "@/lib/supabase";
import { youtubeId } from "@/lib/youtube";
import GiftView from "@/components/GiftView";
import WaitingView from "@/components/WaitingView";

// Sempre busca dados frescos (status muda via webhook).
export const dynamic = "force-dynamic";

function baseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
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
  const supa = supabaseAdmin();

  const { data: presente } = await supa
    .from("presentes")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle<Presente>();

  if (!presente) notFound();

  if (presente.status !== "ativo") {
    return <WaitingView slug={presente.slug} />;
  }

  const { data: fotos } = await supa
    .from("fotos")
    .select("*")
    .eq("presente_id", presente.id)
    .order("ordem", { ascending: true })
    .returns<Foto[]>();

  const link = `${baseUrl()}/${presente.slug}`;

  return (
    <GiftView
      nomePai={presente.nome_pai}
      mensagem={presente.mensagem}
      nomeRemetente={presente.nome_remetente}
      youtubeId={youtubeId(presente.youtube_url)}
      fotos={(fotos ?? []).map((f) => f.url)}
      link={link}
    />
  );
}
