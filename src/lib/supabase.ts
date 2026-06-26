import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com service_role — USO EXCLUSIVO server-side.
 * Nunca importe este arquivo em componentes client ('use client').
 */
let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export const BUCKET_FOTOS = "fotos";

export type Presente = {
  id: string;
  slug: string;
  nome_pai: string;
  mensagem: string;
  nome_remetente: string | null;
  email_comprador: string | null;
  youtube_url: string | null;
  status: "pendente" | "ativo";
  created_at: string;
  activated_at: string | null;
};

export type Foto = {
  id: string;
  presente_id: string;
  url: string;
  ordem: number;
};
