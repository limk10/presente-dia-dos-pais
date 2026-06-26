import { NextResponse } from "next/server";
import { getPresente, getFotos } from "@/lib/db";
import type { Foto } from "@/lib/supabase";
import { youtubeId } from "@/lib/youtube";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate" };

/**
 * Retorna os dados completos do presente para o GiftView client-side.
 * Só responde quando status === 'ativo' para evitar spoiler antes do pagamento.
 * O React Query no WaitingView cacheia essa resposta com staleTime: Infinity.
 */
export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const presente = await getPresente(params.slug).catch(() => null);

  if (!presente) {
    return NextResponse.json({ error: "Presente não encontrado." }, { status: 404, headers: NO_CACHE });
  }

  if (presente.status !== "ativo") {
    return NextResponse.json({ error: "Presente ainda não liberado." }, { status: 403, headers: NO_CACHE });
  }

  const fotos: Foto[] = await getFotos(presente.id).catch(() => []);

  // Computa o link base a partir dos headers da request (funciona em Vercel)
  const reqUrl = new URL(req.url);
  const origin = `${reqUrl.protocol}//${reqUrl.host}`;

  return NextResponse.json(
    {
      nomePai: presente.nome_pai,
      mensagem: presente.mensagem,
      nomeRemetente: presente.nome_remetente,
      youtubeId: youtubeId(presente.youtube_url),
      fotos: fotos.map((f) => f.url),
      link: `${origin}/${presente.slug}`,
    },
    { headers: NO_CACHE },
  );
}
