import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Site do Meu Pai — o presente que ele nunca vai esquecer",
  description:
    "Crie um site personalizado para o seu pai com fotos, mensagem e a música favorita dele. Pronto em 5 minutos. O presente perfeito para o Dia dos Pais.",
  openGraph: {
    title: "Site do Meu Pai",
    description:
      "Um presente digital que emociona: fotos, mensagem e música, num site só pra ele.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
