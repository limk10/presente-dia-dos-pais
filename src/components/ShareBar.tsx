"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function ShareBar({
  link,
  nomePai,
}: {
  link: string;
  nomePai: string;
}) {
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [toast, setToast] = useState("");

  const msg = `Fiz algo especial pra você, ${nomePai} ❤️\n\nClica nesse link — é o seu presente:\n${link}\n\nCom todo o meu amor 🎁`;
  const wppUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;

  useEffect(() => {
    if (!showQr) return;
    QRCode.toDataURL(link, {
      width: 720,
      margin: 2,
      color: { dark: "#2a1508", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [showQr, link]);

  function flash(t: string) {
    setToast(t);
    setTimeout(() => setToast(""), 1800);
  }

  function copiar() {
    navigator.clipboard?.writeText(link).then(() => flash("Link copiado!"));
  }

  function baixarQr() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "presente-qrcode.png";
    a.click();
  }

  return (
    <>
      <div className="sharebar">
        <a className="share-btn wpp" href={wppUrl} target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.728-.979zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
          </svg>
          <span className="lbl">Enviar no WhatsApp</span>
        </a>

        <button className="share-btn" onClick={() => setShowQr(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <line x1="14" y1="14" x2="14" y2="21" />
            <line x1="21" y1="14" x2="21" y2="21" />
            <line x1="17.5" y1="14" x2="17.5" y2="14" />
          </svg>
          <span className="lbl">QR Code</span>
        </button>

        <button className="share-btn" onClick={copiar}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" />
            <path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />
          </svg>
          <span className="lbl">Copiar link</span>
        </button>
      </div>

      {showQr && (
        <div className="modal-overlay" onClick={() => setShowQr(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="serif">QR Code do presente</h3>
            <p>Imprima num cartão ou mostre pra ele escanear pessoalmente.</p>
            <div className="qr-box">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" width={220} height={220} />
              ) : (
                <div style={{ width: 220, height: 220 }} />
              )}
            </div>
            <div className="modal-actions">
              <button className="primary" onClick={baixarQr}>
                Baixar PNG
              </button>
              <button className="ghost" onClick={() => setShowQr(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
