"use client";

/**
 * Mini-preview ao vivo do site do pai, renderizado dentro do "celular"
 * no formulário. Reflete os campos em tempo real. Visual simplificado
 * (sem player real, sem intro) — apenas a sensação de como vai ficar.
 */
export default function Preview({
  nomePai,
  mensagem,
  nomeRemetente,
  youtubeId,
  fotos,
}: {
  nomePai: string;
  mensagem: string;
  nomeRemetente: string;
  youtubeId: string | null;
  fotos: string[];
}) {
  const nome = nomePai.trim() || "Pai";
  const msg = mensagem.trim() || "Sua mensagem aparece aqui, do seu jeito…";

  return (
    <div className="phone">
      <div
        style={{
          height: "100%",
          overflowY: "auto",
          background: "var(--bg)",
        }}
      >
        {/* hero */}
        <div style={{ textAlign: "center", padding: "44px 18px 22px" }}>
          <div
            style={{
              fontSize: 8,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 10,
            }}
          >
            Feito com amor pra você
          </div>
          <div
            className="serif"
            style={{ fontSize: 34, lineHeight: 1.05, fontWeight: 300 }}
          >
            {nome}
          </div>
        </div>

        {/* música */}
        <div style={{ padding: "0 16px 16px" }}>
          <div
            style={{
              aspectRatio: "16 / 9",
              borderRadius: 8,
              border: "1px solid rgba(232,168,56,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg-2)",
              color: "var(--muted)",
              fontSize: 11,
              gap: 6,
              overflow: "hidden",
            }}
          >
            {youtubeId ? (
              <img
                src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <>♪ a música dele toca aqui</>
            )}
          </div>
        </div>

        {/* mensagem */}
        <div style={{ padding: "20px 22px", textAlign: "center" }}>
          <div
            className="serif"
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              fontWeight: 300,
              whiteSpace: "pre-wrap",
              color: msg ? "var(--text)" : "var(--muted)",
            }}
          >
            {msg}
          </div>
          {nomeRemetente.trim() && (
            <div
              style={{
                marginTop: 18,
                fontSize: 11,
                color: "var(--muted)",
                letterSpacing: 0.5,
              }}
            >
              — {nomeRemetente.trim()}
            </div>
          )}
        </div>

        {/* galeria */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 5,
            padding: "8px 12px 30px",
          }}
        >
          {fotos.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "3 / 4",
                    borderRadius: 5,
                    background: "var(--bg-2)",
                  }}
                />
              ))
            : fotos.map((src, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "3 / 4",
                    borderRadius: 5,
                    overflow: "hidden",
                    background: "var(--bg-2)",
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
