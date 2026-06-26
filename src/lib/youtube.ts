/**
 * Extrai o ID de 11 caracteres de uma URL do YouTube em vários formatos:
 * youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID,
 * youtube.com/shorts/ID, music.youtube.com/watch?v=ID, ou o próprio ID.
 */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const u = url.trim();

  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/v\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = u.match(p);
    if (m) return m[1];
  }
  if (/^[\w-]{11}$/.test(u)) return u;
  return null;
}

export function youtubeEmbedUrl(id: string, autoplay: boolean): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    loop: "1",
    playlist: id,
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}
