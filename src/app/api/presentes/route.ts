import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, BUCKET_FOTOS } from "@/lib/supabase";
import { gerarSlug } from "@/lib/slug";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FOTOS = 10;
const MAX_BYTES = 8 * 1024 * 1024; // 8MB por foto

function sanitizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-40) || "foto.jpg";
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const nome_pai = String(form.get("nome_pai") || "").trim();
  const mensagem = String(form.get("mensagem") || "").trim();
  const nome_remetente = String(form.get("nome_remetente") || "").trim() || null;
  const email_comprador =
    String(form.get("email_comprador") || "").trim() || null;
  const youtube_url = String(form.get("youtube_url") || "").trim() || null;
  const fotos = form.getAll("fotos").filter((f): f is File => f instanceof File);

  if (!nome_pai) {
    return NextResponse.json({ error: "Nome do pai é obrigatório." }, { status: 400 });
  }
  if (!mensagem) {
    return NextResponse.json({ error: "Mensagem é obrigatória." }, { status: 400 });
  }
  if (fotos.length === 0) {
    return NextResponse.json({ error: "Envie pelo menos uma foto." }, { status: 400 });
  }
  if (fotos.length > MAX_FOTOS) {
    return NextResponse.json(
      { error: `Máximo de ${MAX_FOTOS} fotos.` },
      { status: 400 },
    );
  }
  for (const f of fotos) {
    if (!f.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Todos os arquivos devem ser imagens." },
        { status: 400 },
      );
    }
    if (f.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Cada foto deve ter no máximo 8MB." },
        { status: 400 },
      );
    }
  }

  const supa = supabaseAdmin();

  // Gera slug único (tenta algumas vezes em caso de colisão).
  let slug = "";
  let presenteId = "";
  for (let attempt = 0; attempt < 6; attempt++) {
    slug = gerarSlug(7);
    const { data, error } = await supa
      .from("presentes")
      .insert({
        slug,
        nome_pai,
        mensagem,
        nome_remetente,
        email_comprador,
        youtube_url,
        status: "pendente",
      })
      .select("id")
      .single();

    if (!error && data) {
      presenteId = data.id;
      break;
    }
    // 23505 = unique_violation (colisão de slug) → tenta de novo
    if (error && error.code !== "23505") {
      console.error("Erro ao criar presente:", error);
      return NextResponse.json(
        { error: "Não foi possível criar o presente. Tente novamente." },
        { status: 500 },
      );
    }
  }

  if (!presenteId) {
    return NextResponse.json(
      { error: "Não foi possível gerar o presente. Tente novamente." },
      { status: 500 },
    );
  }

  // Upload das fotos para o Storage e registro na tabela.
  const registros: { presente_id: string; url: string; ordem: number }[] = [];
  for (let i = 0; i < fotos.length; i++) {
    const file = fotos[i];
    const bytes = new Uint8Array(await file.arrayBuffer());
    const path = `${slug}/${String(i).padStart(2, "0")}-${sanitizeName(file.name)}`;

    const { error: upErr } = await supa.storage
      .from(BUCKET_FOTOS)
      .upload(path, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (upErr) {
      console.error("Erro no upload da foto:", upErr);
      // Limpa o presente parcialmente criado para não deixar lixo.
      await supa.from("presentes").delete().eq("id", presenteId);
      return NextResponse.json(
        { error: "Falha ao enviar as fotos. Tente novamente." },
        { status: 500 },
      );
    }

    const { data: pub } = supa.storage.from(BUCKET_FOTOS).getPublicUrl(path);
    registros.push({ presente_id: presenteId, url: pub.publicUrl, ordem: i });
  }

  const { error: fotosErr } = await supa.from("fotos").insert(registros);
  if (fotosErr) {
    console.error("Erro ao registrar fotos:", fotosErr);
    await supa.from("presentes").delete().eq("id", presenteId);
    return NextResponse.json(
      { error: "Falha ao salvar as fotos. Tente novamente." },
      { status: 500 },
    );
  }

  return NextResponse.json({ slug });
}
