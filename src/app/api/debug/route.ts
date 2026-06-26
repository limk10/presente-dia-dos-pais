import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(não definido)";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const serviceKeyHint = serviceKey
    ? `${serviceKey.substring(0, 12)}…(${serviceKey.length} chars)`
    : "(não definido)";

  let rows: unknown = null;
  let dbError: unknown = null;

  try {
    const supa = supabaseAdmin();
    const { data, error } = await supa
      .from("presentes")
      .select("slug, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    rows = data;
    dbError = error;
  } catch (err: unknown) {
    dbError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(
    { supabaseUrl, serviceKeyHint, rows, dbError },
    { headers: { "Cache-Control": "no-store" } }
  );
}
