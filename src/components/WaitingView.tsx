"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CAKTO_URL =
  process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ||
  "https://pay.cakto.com.br/cbwju7a_944001";
const PRECO = process.env.NEXT_PUBLIC_PRECO || "29";

function abrirPresente(slug: string) {
  // Invalida o cache do router do Next.js e força GET limpo via timestamp
  // Isso garante que a CDN da Vercel não sirva o HTML cacheado do WaitingView
  window.location.replace(`/${slug}?_=${Date.now()}`);
}

export default function WaitingView({ slug }: { slug: string }) {
  const router = useRouter();
  const [tentou, setTentou] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [erroMsg, setErroMsg] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function verificar() {
      try {
        const res = await fetch(`/api/status/${slug}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelado && json.status === "ativo") {
          // 1) invalida cache do router do Next.js
          router.refresh();
          // 2) depois navega com timestamp para driblar CDN
          setTimeout(() => abrirPresente(slug), 100);
        }
      } catch {}
      if (!cancelado) setTentou(true);
    }

    // Checa imediatamente, depois a cada 2s
    verificar();
    const id = setInterval(verificar, 2000);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [slug, router]);

  async function verificarManual() {
    setVerificando(true);
    setErroMsg("");
    try {
      const res = await fetch(`/api/status/${slug}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) {
        setErroMsg(`Erro ao verificar (${res.status}). Tente recarregar a página.`);
        setVerificando(false);
        return;
      }
      const json = await res.json();
      if (json.status === "ativo") {
        router.refresh();
        setTimeout(() => abrirPresente(slug), 100);
        return;
      }
      setErroMsg("Pagamento ainda não confirmado. Aguarde alguns instantes.");
    } catch (err) {
      setErroMsg("Não foi possível verificar. Tente recarregar a página manualmente.");
    }
    setVerificando(false);
  }

  const pagar = `${CAKTO_URL}?src=${encodeURIComponent(slug)}`;

  return (
    <div className="waiting">
      <div className="spinner" />
      <p className="small">Quase lá</p>
      <h1 className="serif">Esse presente está sendo preparado</h1>
      <p>
        Assim que o pagamento for confirmado, esta página abre o presente
        automaticamente. Pode deixar aberta — ela atualiza sozinha.
      </p>
      <a
        className="pay-btn"
        style={{ maxWidth: 360 }}
        href={pagar}
        target="_blank"
        rel="noopener noreferrer"
      >
        Liberar o presente — R$ {PRECO}
      </a>
      {tentou && (
        <button
          type="button"
          className="verificar-btn"
          onClick={verificarManual}
          disabled={verificando}
        >
          {verificando ? "Verificando…" : "Já paguei → verificar agora"}
        </button>
      )}
      {erroMsg && (
        <p style={{ marginTop: 12, fontSize: 13, color: "#ff9b73" }}>{erroMsg}</p>
      )}
    </div>
  );
}
