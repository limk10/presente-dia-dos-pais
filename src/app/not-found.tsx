import Link from "next/link";

export default function NotFound() {
  return (
    <div className="waiting">
      <p className="small">Ops</p>
      <h1 className="serif">Esse presente não foi encontrado</h1>
      <p>
        O link pode estar incorreto ou o presente ainda não foi criado. Que tal
        criar um agora para o seu pai?
      </p>
      <Link className="pay-btn" style={{ maxWidth: 320 }} href="/">
        Criar o site do meu pai
      </Link>
    </div>
  );
}
