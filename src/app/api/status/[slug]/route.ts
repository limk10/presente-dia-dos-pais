import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Usa fetch direto ao PostgREST — evita qualquer bug do cliente JS
  // com o formato sb_secret_* que não é um JWT bearer padrão
  const url = `${supabaseUrl}/rest/v1/presentes?slug=eq.${encodeURIComponent(params.slug)}&select=status&limit=1`;

  const res = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
    cache: "no-store",
  });

  const cacheHeaders = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
  };

  if (!res.ok) {
    return NextResponse.json({ status: "erro", _http: res.status }, { status: 500, headers: cacheHeaders });
  }

  const rows = await res.json();
  const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

  if (!row) {
    return NextResponse.json({ status: "nao_encontrado", _slug: params.slug }, { status: 404, headers: cacheHeaders });
  }

  return NextResponse.json({ status: row.status }, { headers: cacheHeaders });
}
