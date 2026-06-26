import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const supa = supabaseAdmin();
  const { data } = await supa
    .from("presentes")
    .select("status")
    .eq("slug", params.slug)
    .maybeSingle<{ status: string }>();

  if (!data) {
    return NextResponse.json({ status: "nao_encontrado" }, { status: 404 });
  }
  return NextResponse.json({ status: data.status });
}
