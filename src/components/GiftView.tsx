"use client";

import { useState } from "react";
import ShareBar from "./ShareBar";
import { youtubeEmbedUrl } from "@/lib/youtube";

export default function GiftView({
  nomePai,
  mensagem,
  nomeRemetente,
  youtubeId,
  fotos,
  link,
}: {
  nomePai: string;
  mensagem: string;
  nomeRemetente: string | null;
  youtubeId: string | null;
  fotos: string[];
  link: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="gift">
      {/* INTRO — gatilho da surpresa: nome + abrir, e só então a música começa */}
      <div className={`gift-intro${aberto ? " hide" : ""}`} aria-hidden={aberto}>
        <p className="small">Alguém preparou algo especial pra você</p>
        <h1 className="serif">
          {nomePai}, <em>isso é pra você</em>
        </h1>
        <button className="open-btn" onClick={() => setAberto(true)}>
          Abrir meu presente
        </button>
        <div className="pulse" />
      </div>

      {/* CONTEÚDO */}
      {aberto && (
        <>
          <header className="gift-hero">
            <p className="small">Feito com amor pra você</p>
            <h1 className="serif">
              Feliz Dia dos Pais,
              <br />
              <em>{nomePai}</em>
            </h1>
          </header>

          {youtubeId && (
            <div className="gift-music">
              <div className="yt">
                <iframe
                  src={youtubeEmbedUrl(youtubeId, true)}
                  title="Música"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div className="gift-message">
            <p className="mtext serif">{mensagem}</p>
            {nomeRemetente && <p className="from">— {nomeRemetente}</p>}
          </div>

          {fotos.length > 0 && (
            <div className="gift-gallery">
              {fotos.map((src, i) => (
                <div
                  key={i}
                  className={`ph${i % 5 === 0 ? " tall" : ""}`}
                >
                  <img src={src} alt={`Foto ${i + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          )}

          <ShareBar link={link} nomePai={nomePai} />
        </>
      )}
    </div>
  );
}
