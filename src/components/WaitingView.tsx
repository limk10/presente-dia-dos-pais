"use client";

import { useEffect, useState } from "react";

const CAKTO_URL =
  process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ||
  "https://pay.cakto.com.br/cbwju7a_944001";
const PRECO = process.env.NEXT_PUBLIC_PRECO || "29";

export default function WaitingView({ slug }: { slug: string }) {
  const [tentou, setTentou] = useState(false);
  const [verificando, setVerificando] = useState(false);

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
          // Força navegação limpa, sem cache do browser
          window.location.href = window.location.pathname;
        }
      } catch {}
      if (!cancelado) setTentou(true);
    }

    // Primeira verificação em 2s, depois a cada 2s
    const id = setInterval(verificar, 2000);
    const primeiro = setTimeout(verificar, 1000);

    return () => {
      cancelado = true;
      clearInterval(id);
      clearTimeout(primeiro);
    };
  }, [slug]);

  async function verificarManual() {
    setVerificando(true);
    try {
      const res = await fetch(`/api/status/${slug}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const json = await res.json();
      if (json.status === "ativo") {
        window.location.href = window.location.pathname;
        return;
      }
    } catch {}
    setVerificando(false);
    alert("Pagamento ainda não confirmado. Aguarde alguns instantes.");
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
    </div>
  );
}
