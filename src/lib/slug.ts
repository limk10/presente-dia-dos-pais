const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function gerarSlug(tamanho = 7): string {
  let s = "";
  for (let i = 0; i < tamanho; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}

function slugificar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);
}

export function gerarSlugNomes(
  nomePai: string,
  nomeRemetente?: string | null,
): string {
  const pai = slugificar(nomePai) || "pai";
  const base = nomeRemetente
    ? `${pai}-de-${slugificar(nomeRemetente)}`
    : pai;
  return base.slice(0, 40);
}
