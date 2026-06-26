"use client";

import { useEffect, useState } from "react";

const CAKTO_URL =
  process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ||
  "https://pay.cakto.com.br/cbwju7a_944001";
const PRECO = process.env.NEXT_PUBLIC_PRECO || "29";

/**
 * Exibida quando o presente existe mas ainda está 'pendente'.
 * Faz polling do status; quando vira 'ativo', recarrega para mostrar o presente.
 */
export default function WaitingView({ slug }: { slug: string }) {
  const [tentou, setTentou] = useState(false);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${slug}`, { cache: "no-store" });
        const json = await res.json();
        if (json.status === "ativo") {
          clearInterval(id);
          window.location.reload();
        }
      } catch {}
      setTentou(true);
    }, 4000);
    return () => clearInterval(id);
  }, [slug]);

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
      <a className="pay-btn" style={{ maxWidth: 360 }} href={pagar} target="_blank" rel="noopener noreferrer">
        Liberar o presente — R$ {PRECO}
      </a>
      {tentou && (
        <p style={{ marginTop: 20, fontSize: 13 }}>
          Já pagou? A confirmação pode levar até 1 minuto.
        </p>
      )}
    </div>
  );
}
