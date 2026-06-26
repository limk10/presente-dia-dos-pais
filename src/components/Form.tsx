"use client";

import { useEffect, useRef, useState } from "react";
import Preview from "./Preview";
import { youtubeId } from "@/lib/youtube";
import { apiClient } from "@/lib/apiClient";

const MAX_FOTOS = 10;
const CAKTO_URL =
  process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ||
  "https://pay.cakto.com.br/cbwju7a_944001";
const PRECO = process.env.NEXT_PUBLIC_PRECO || "29";

type FotoLocal = { file: File; url: string };

export default function Form() {
  const [nomePai, setNomePai] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [nomeRemetente, setNomeRemetente] = useState("");
  const [email, setEmail] = useState("");
  const [youtube, setYoutube] = useState("");
  const [fotos, setFotos] = useState<FotoLocal[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [confirmNova, setConfirmNova] = useState(false);
  const [gerandoIA, setGerandoIA] = useState(false);
  const [tentativasIA, setTentativasIA] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_TENTATIVAS_IA = 3;

  // Restaura link e tentativas de IA do localStorage.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ultimo_presente");
      if (saved) {
        const { slug: s, email: e } = JSON.parse(saved);
        if (s) { setSlug(s); setEmail(e || ""); }
      }
      const t = parseInt(localStorage.getItem("ia_tentativas") || "0", 10);
      if (!isNaN(t)) setTentativasIA(t);
    } catch {}
  }, []);

  // Limpa as object URLs ao desmontar para não vazar memória.
  useEffect(() => {
    return () => fotos.forEach((f) => URL.revokeObjectURL(f.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ytId = youtubeId(youtube);

  async function gerarMensagemIA() {
    if (tentativasIA >= MAX_TENTATIVAS_IA || gerandoIA) return;
    setGerandoIA(true);
    try {
      const { data } = await apiClient.post<{ mensagem: string }>(
        "/api/gerar-mensagem",
        {
          nome_pai: nomePai.trim() || undefined,
          nome_remetente: nomeRemetente.trim() || undefined,
        },
      );
      setMensagem(data.mensagem);
      const novas = tentativasIA + 1;
      setTentativasIA(novas);
      try { localStorage.setItem("ia_tentativas", String(novas)); } catch {}
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao gerar mensagem.");
    } finally {
      setGerandoIA(false);
    }
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const novos: FotoLocal[] = [];
    for (const file of Array.from(list)) {
      if (!file.type.startsWith("image/")) continue;
      if (fotos.length + novos.length >= MAX_FOTOS) break;
      novos.push({ file, url: URL.createObjectURL(file) });
    }
    setFotos((prev) => [...prev, ...novos].slice(0, MAX_FOTOS));
  }

  function removeFoto(i: number) {
    setFotos((prev) => {
      URL.revokeObjectURL(prev[i].url);
      return prev.filter((_, idx) => idx !== i);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!nomePai.trim()) return setErro("Conta pra gente o nome do seu pai.");
    if (!mensagem.trim()) return setErro("Escreva uma mensagem pra ele.");
    if (fotos.length === 0)
      return setErro("Adicione pelo menos uma foto de vocês.");
    if (youtube.trim() && !ytId)
      return setErro("Esse link do YouTube não parece válido.");

    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append("nome_pai", nomePai.trim());
      fd.append("mensagem", mensagem.trim());
      fd.append("nome_remetente", nomeRemetente.trim());
      fd.append("email_comprador", email.trim());
      fd.append("youtube_url", youtube.trim());
      fotos.forEach((f) => fd.append("fotos", f.file));

      const { data } = await apiClient.post<{ slug: string }>(
        "/api/presentes",
        fd,
      );
      setSlug(data.slug);
      try {
        localStorage.setItem(
          "ultimo_presente",
          JSON.stringify({ slug: data.slug, email: email.trim() }),
        );
      } catch {}
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : "Algo deu errado. Tente de novo em instantes.",
      );
    } finally {
      setEnviando(false);
    }
  }

  // ── Estado final: presente criado ───────────────────────────────
  if (slug) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/${slug}`;
    const pagar = `${CAKTO_URL}?src=${encodeURIComponent(
      slug,
    )}${email.trim() ? `&email=${encodeURIComponent(email.trim())}` : ""}`;

    return (
      <div className="done-overlay">
      <div className="done-card reveal visible">
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          Quase lá
        </div>
        <h3 className="serif">O presente do seu pai está pronto 🎁</h3>
        <p>
          Esse é o link exclusivo dele. Falta só confirmar o pagamento — assim
          que cair, o link já abre o presente. Leva menos de 1 minuto.
        </p>
        <div className="link-box">
          <input readOnly value={link} />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(link);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 1800);
            }}
          >
            {copiado ? "Copiado!" : "Copiar"}
          </button>
          <a
            className="link-open-btn"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir ↗
          </a>
        </div>
        <a
          className="pay-btn"
          href={pagar}
          target="_blank"
          rel="noopener noreferrer"
        >
          Liberar o presente — R$ {PRECO}
        </a>
        <p style={{ marginTop: 18, fontSize: 13 }}>
          Você vai ser redirecionado para o pagamento seguro. Depois é só
          mandar o link pro seu pai. 💛
        </p>

        {confirmNova ? (
          <div className="nova-confirm">
            <p>Tem certeza? O link atual ficará salvo, mas você vai criar uma homenagem nova do zero.</p>
            <div className="nova-confirm-btns">
              <button
                type="button"
                className="nova-confirm-sim"
                onClick={() => {
                  try { localStorage.removeItem("ultimo_presente"); } catch {}
                  setSlug(null);
                  setConfirmNova(false);
                  setNomePai("");
                  setMensagem("");
                  setNomeRemetente("");
                  setEmail("");
                  setYoutube("");
                  setFotos([]);
                }}
              >
                Sim, criar nova homenagem
              </button>
              <button
                type="button"
                className="nova-confirm-nao"
                onClick={() => setConfirmNova(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="nova-btn"
            onClick={() => setConfirmNova(true)}
          >
            + Criar outra homenagem
          </button>
        )}
      </div>
      </div>
    );
  }

  // ── Formulário ──────────────────────────────────────────────────
  return (
    <div className="criar-grid">
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="nomePai">Nome do seu pai</label>
          <input
            id="nomePai"
            type="text"
            value={nomePai}
            onChange={(e) => setNomePai(e.target.value)}
            placeholder="Ex: Seu Antônio, Painho, Pai…"
            maxLength={60}
          />
        </div>

        <div className="form-field">
          <label htmlFor="mensagem">
            Mensagem pra ele
            <span className="hint">o que você nunca disse em voz alta</span>
          </label>
          <textarea
            id="mensagem"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Pai, obrigado por cada…"
            maxLength={1200}
          />
          <p className="ia-hint">
            {tentativasIA < MAX_TENTATIVAS_IA
              ? <>Não sabe o que escrever? Deixa a IA criar pra você — <span>{tentativasIA}/{MAX_TENTATIVAS_IA} tentativas usadas</span></>
              : <>Você usou todas as {MAX_TENTATIVAS_IA} gerações disponíveis.</>}
          </p>
          {tentativasIA < MAX_TENTATIVAS_IA ? (
            <button
              type="button"
              className="ia-btn"
              onClick={gerarMensagemIA}
              disabled={gerandoIA}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd"/>
              </svg>
              {gerandoIA ? "Gerando…" : "Gerar mensagem automaticamente"}
            </button>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="youtube">
            Música favorita dele
            <span className="hint">link do YouTube (opcional)</span>
          </label>
          <input
            id="youtube"
            type="url"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            placeholder="https://youtube.com/watch?v=…"
          />
        </div>

        <div className="form-field">
          <label>
            Fotos de vocês
            <span className="hint">
              {fotos.length}/{MAX_FOTOS}
            </span>
          </label>
          <div
            className="dropzone"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
          >
            <p>
              <strong>Clique para escolher</strong> ou arraste as fotos aqui
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {fotos.length > 0 && (
            <div className="thumbs">
              {fotos.map((f, i) => (
                <div className="thumb" key={f.url}>
                  <img src={f.url} alt="" />
                  <button
                    type="button"
                    onClick={() => removeFoto(i)}
                    aria-label="Remover foto"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="rem">
            Seu nome
            <span className="hint">a assinatura do presente (opcional)</span>
          </label>
          <input
            id="rem"
            type="text"
            value={nomeRemetente}
            onChange={(e) => setNomeRemetente(e.target.value)}
            placeholder="Com amor, [seu nome]"
            maxLength={60}
          />
        </div>

        <div className="form-field">
          <label htmlFor="email">
            Seu e-mail
            <span className="hint">pra te avisar quando liberar (opcional)</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />
        </div>

        <button className="submit-btn" type="submit" disabled={enviando}>
          {enviando ? "Criando o presente…" : "Criar o site do meu pai →"}
        </button>
        {erro && <p className="form-error">{erro}</p>}
        <p className="form-price-note">
          Pagamento único de R$ {PRECO} · sem mensalidade · link pra sempre
        </p>
      </form>

      <div className="preview-col">
        <p className="preview-label">Prévia ao vivo — é assim que ele vai ver</p>
        <Preview
          nomePai={nomePai}
          mensagem={mensagem}
          nomeRemetente={nomeRemetente}
          youtubeId={ytId}
          fotos={fotos.map((f) => f.url)}
        />
      </div>
    </div>
  );
}
