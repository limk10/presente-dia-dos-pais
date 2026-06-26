import { NextResponse } from "next/server";
import { getPresente } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const presente = await getPresente(params.slug).catch(() => null);

  if (!presente) {
    return NextResponse.json({ status: "nao_encontrado" }, { status: 404, headers: NO_CACHE });
  }

  return NextResponse.json({ status: presente.status }, { headers: NO_CACHE });
}
