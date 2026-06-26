/**
 * Camada de acesso ao banco via PostgREST (server-side only).
 *
 * Usa axios com fetch direto à API REST do Supabase em vez do supabase-js,
 * porque a chave no formato sb_secret_* não é um JWT válido para o PostgREST
 * decodificar — o gateway do Supabase precisa receber a chave pelo header
 * `apikey` para resolver o role correto antes de encaminhar ao PostgREST.
 */
import axios, { AxiosError } from "axios";
import type { Presente, Foto } from "@/lib/supabase";

function makeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não definidas.");

  const client = axios.create({
    baseURL: `${url}/rest/v1`,
    timeout: 10_000,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
  });

  client.interceptors.response.use(
    (res) => res,
    (err: AxiosError<{ code?: string; message?: string }>) => {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message ?? err.message;
      const enhanced = new Error(msg) as Error & { pgCode?: string };
      enhanced.pgCode = code;
      return Promise.reject(enhanced);
    },
  );

  return client;
}

// Instância criada em runtime (acesso às env vars server-side).
let _client: ReturnType<typeof makeClient> | null = null;
function db() {
  if (!_client) _client = makeClient();
  return _client;
}

// ── Presentes ───────────────────────────────────────────────────────────────

export async function getPresente(slug: string): Promise<Presente | null> {
  const { data } = await db().get<Presente[]>("/presentes", {
    params: { slug: `eq.${slug}`, limit: 1, select: "*" },
  });
  return data[0] ?? null;
}

export async function createPresente(
  payload: Omit<Presente, "id" | "created_at" | "activated_at">,
): Promise<{ id: string; slug: string }> {
  const { data } = await db().post<Array<{ id: string; slug: string }>>(
    "/presentes",
    payload,
    { headers: { Prefer: "return=representation" } },
  );
  return data[0];
}

export async function updatePresenteStatus(
  slug: string,
  status: "ativo",
  extra: Record<string, unknown> = {},
): Promise<boolean> {
  const { data } = await db().patch<Array<{ id: string }>>(
    "/presentes",
    { status, ...extra },
    {
      params: { slug: `eq.${slug}`, status: "eq.pendente" },
      headers: { Prefer: "return=representation" },
    },
  );
  return Array.isArray(data) && data.length > 0;
}

export async function getPresentePorEmail(
  email: string,
): Promise<{ id: string } | null> {
  const { data } = await db().get<Array<{ id: string }>>("/presentes", {
    params: {
      email_comprador: `ilike.${email}`,
      status: "eq.pendente",
      order: "created_at.desc",
      limit: 1,
      select: "id",
    },
  });
  return data[0] ?? null;
}

export async function ativarPresentePorId(id: string): Promise<boolean> {
  const { data } = await db().patch<Array<{ id: string }>>(
    "/presentes",
    { status: "ativo", activated_at: new Date().toISOString() },
    {
      params: { id: `eq.${id}` },
      headers: { Prefer: "return=representation" },
    },
  );
  return Array.isArray(data) && data.length > 0;
}

// ── Fotos ────────────────────────────────────────────────────────────────────

export async function getFotos(presenteId: string): Promise<Foto[]> {
  const { data } = await db().get<Foto[]>("/fotos", {
    params: {
      presente_id: `eq.${presenteId}`,
      order: "ordem.asc",
      select: "*",
    },
  });
  return data;
}
