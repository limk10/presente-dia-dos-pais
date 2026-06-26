"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import GiftView from "@/components/GiftView";

const CAKTO_URL =
  process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ||
  "https://pay.cakto.com.br/cbwju7a_944001";
const PRECO = process.env.NEXT_PUBLIC_PRECO || "29";

type GiftData = {
  nomePai: string;
  mensagem: string;
  nomeRemetente: string | null;
  youtubeId: string | null;
  fotos: string[];
  link: string;
};

export default function WaitingView({ slug }: { slug: string }) {
  const [isAtivo, setIsAtivo] = useState(false);
  const [tentou, setTentou] = useState(false);
  const [erroMsg, setErroMsg] = useState("");
  const [verificando, setVerificando] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Polling manual — propositalmente fora do React Query ──────────────────
  // O status deve ser sempre fresh: nunca cachear nem de-duplicar.
  useEffect(() => {
    async function checarStatus() {
      try {
        // Timestamp na URL garante cache miss na CDN a cada poll
        const { data } = await apiClient.get<{ status: string }>(
          `/api/status/${slug}?_=${Date.now()}`,
        );
        if (data.status === "ativo") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsAtivo(true);
        }
      } catch {
        // Erros transientes (rede, timeout) são ignorados — o próximo ciclo retenta
      }
      setTentou(true);
    }

    checarStatus();
    intervalRef.current = setInterval(checarStatus, 2000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [slug]);

  // ── React Query: busca dados completos UMA VEZ quando ativo ──────────────
  // staleTime: Infinity → nunca re-busca enquanto a aba estiver aberta.
  // Evita chamadas repetidas ao banco para um presente que não vai mudar.
  const { data: giftData } = useQuery<GiftData>({
    queryKey: ["presente", slug],
    queryFn: () =>
      apiClient.get<GiftData>(`/api/presente/${slug}`).then((r) => r.data),
    enabled: isAtivo,
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000, // mantém em cache por 1h
  });

  // Transição suave: assim que os dados chegam, renderiza GiftView inline
  // sem nenhum page reload — elimina o loop infinito de redirecionamento.
  if (isAtivo && giftData) {
    return <GiftView {...giftData} />;
  }

  // Estado intermediário: detectou ativo mas dados ainda carregando
  if (isAtivo) {
    return (
      <div className="waiting">
        <div className="spinner" />
        <p className="small">Abrindo o presente…</p>
      </div>
    );
  }

  // ── Verificação manual ────────────────────────────────────────────────────
  async function verificarManual() {
    setVerificando(true);
    setErroMsg("");
    try {
      const { data } = await apiClient.get<{ status: string }>(
        `/api/status/${slug}?_=${Date.now()}`,
      );
      if (data.status === "ativo") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsAtivo(true);
        return;
      }
      setErroMsg("Pagamento ainda não confirmado. Aguarde alguns instantes.");
    } catch {
      setErroMsg("Não foi possível verificar. Tente novamente.");
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
        <p style={{ marginTop: 12, fontSize: 13, color: "#ff9b73" }}>
          {erroMsg}
        </p>
      )}
    </div>
  );
}
