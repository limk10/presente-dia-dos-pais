import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Geração de mensagem indisponível no momento." },
      { status: 503 },
    );
  }

  let body: { nome_pai?: string; nome_remetente?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const nomePai = String(body.nome_pai || "").trim() || "meu pai";
  const nomeRemetente = String(body.nome_remetente || "").trim();

  const assinatura = nomeRemetente
    ? `Assine a mensagem com o nome "${nomeRemetente}".`
    : "Não coloque assinatura.";

  const prompt = `Escreva uma mensagem emocionante e sincera de Dia dos Pais para "${nomePai}".
A mensagem deve ter no máximo 900 caracteres, usar tom caloroso e pessoal, falar sobre gratidão, momentos juntos e o quanto o pai é especial.
Escreva em português brasileiro. Não use clichês vazios. Seja direto e genuíno.
${assinatura}
Retorne apenas o texto da mensagem, sem aspas, sem título, sem introdução.`;

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 350,
      }),
    });

    if (!res.ok) {
      console.error("[gerar-mensagem] DeepSeek error:", res.status, await res.text());
      return NextResponse.json(
        { error: "Não foi possível gerar a mensagem. Tente novamente." },
        { status: 502 },
      );
    }

    const json = await res.json();
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
    const mensagem = raw.length > 1200 ? raw.slice(0, 1197) + "…" : raw;

    if (!mensagem || mensagem.length === 0) {
      return NextResponse.json(
        { error: "Resposta vazia da IA. Tente novamente." },
        { status: 502 },
      );
    }

    return NextResponse.json({ mensagem });
  } catch (err) {
    console.error("[gerar-mensagem] fetch error:", err);
    return NextResponse.json(
      { error: "Erro de conexão com a IA. Tente novamente." },
      { status: 502 },
    );
  }
}
