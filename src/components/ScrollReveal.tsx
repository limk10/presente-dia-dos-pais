"use client";

import { useEffect } from "react";

/**
 * Ativa o efeito de reveal em qualquer elemento com a classe `.reveal`
 * e o comportamento de nav que escurece ao rolar (`#mainnav`).
 * Inclua uma vez por página.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -36px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    const nav = document.getElementById("mainnav");
    const onScroll = () => {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 48);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
