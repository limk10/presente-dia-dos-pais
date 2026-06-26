import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const runtime = "nodejs";

const deepseek = axios.create({
  baseURL: "https://api.deepseek.com",
  timeout: 20_000,
});

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

  const prompt = `Escreva uma mensagem curta e emocionante de Dia dos Pais para "${nomePai}".
Máximo absoluto: 400 caracteres. Um único parágrafo, direto e genuíno, sobre gratidão e o quanto o pai é especial.
Escreva em português brasileiro. Sem clichês.
${assinatura}
Retorne apenas o texto da mensagem, sem aspas, sem título, sem introdução.`;

  try {
    const { data } = await deepseek.post(
      "/chat/completions",
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 180,
      },
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );

    const raw: string = data.choices?.[0]?.message?.content?.trim() ?? "";
    const mensagem = raw.length > 500 ? raw.slice(0, 497) + "…" : raw;

    if (!mensagem) {
      return NextResponse.json(
        { error: "Resposta vazia da IA. Tente novamente." },
        { status: 502 },
      );
    }

    return NextResponse.json({ mensagem });
  } catch (err) {
    console.error("[gerar-mensagem] erro:", err);
    return NextResponse.json(
      { error: "Não foi possível gerar a mensagem. Tente novamente." },
      { status: 502 },
    );
  }
}
