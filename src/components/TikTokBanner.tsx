"use client";

import { useEffect, useState } from "react";

export default function TikTokBanner() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isTikTok = /BytedanceWebview|BytedancePclient|trill|musical_ly/i.test(ua);
    if (!isTikTok) return;

    const android = /android/i.test(ua);
    setIsAndroid(android);

    if (android) {
      // Tenta abrir Chrome automaticamente via Android Intent URI.
      // TikTok/Android honra intent:// e passa para o sistema operacional.
      const host = window.location.href.replace("https://", "");
      window.location.href = `intent://${host}#Intent;scheme=https;package=com.android.chrome;end`;
      // Se continuar na página após 1.5s é porque o redirect falhou — mostra banner.
      setTimeout(() => setVisible(true), 1500);
    } else {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  // Deep link para Chrome no iOS (googlechromes = HTTPS, googlechrome = HTTP)
  const chromeUrl = pageUrl.replace("https://", "googlechromes://");

  function copyUrl() {
    navigator.clipboard?.writeText(pageUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div className="tiktok-banner" role="alert">
      <p className="tiktok-banner-msg">
        <strong>O navegador do TikTok bloqueia o upload de fotos.</strong>
        {" "}Abra no navegador do seu celular para criar o presente.
      </p>
      <div className="tiktok-banner-actions">
        {!isAndroid && (
          <a href={chromeUrl} className="tiktok-banner-btn tiktok-banner-chrome">
            Abrir no Chrome
          </a>
        )}
        <button className="tiktok-banner-btn tiktok-banner-copy" onClick={copyUrl}>
          {copied ? "Copiado!" : "Copiar link"}
        </button>
        {!isAndroid && (
          <span className="tiktok-banner-tip">
            ou toque em <strong>···</strong> → <strong>Abrir no navegador</strong>
          </span>
        )}
      </div>
    </div>
  );
}
