// Alfabeto sem caracteres ambíguos (0/O, 1/l/I) — bom para ler e digitar.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function gerarSlug(tamanho = 7): string {
  let s = "";
  for (let i = 0; i < tamanho; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}
