import Form from "@/components/Form";
import ScrollReveal from "@/components/ScrollReveal";

const PRECO = process.env.NEXT_PUBLIC_PRECO || "29";

export default function Home() {
  return (
    <>
      <ScrollReveal />

      {/* NAV */}
      <nav id="mainnav">
        <a className="nav-logo" href="#hero">
          <img src="/logo.png" alt="Site do Meu Pai" />
          <span>Site do Meu Pai</span>
        </a>
        <a className="nav-cta" href="#criar">
          Criar agora
        </a>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hero-bg" />
        <div className="hero-inner">
          <img className="hero-logo" src="/logo.png" alt="Site do Meu Pai" />
          <p className="hero-eyebrow eyebrow">Presente de Dia dos Pais</p>
          <h1 className="hero-title">
            O presente que ele
            <br />
            <em>nunca vai esquecer</em>
          </h1>
          <p className="hero-sub">
            Um site só pra ele, com as suas fotos, a sua mensagem e a música que
            ele ama. Você faz em 5 minutos. Ele guarda pra sempre.
          </p>
          <a className="hero-cta" href="#criar">
            Criar o site do meu pai
          </a>
          <p className="hero-note">
            Pronto na hora · a partir de R$ {PRECO} · pagamento único
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como">
        <div className="wrap">
          <div className="como-head">
            <p className="eyebrow reveal">Simples assim</p>
            <h2 className="section-title reveal reveal-d1">
              Três passos. Cinco minutos.
            </h2>
          </div>
          <div className="steps">
            <div className="step reveal">
              <span className="step-num serif">01</span>
              <h3>Você preenche</h3>
              <p>
                Adicione até 10 fotos de vocês, escreva uma mensagem de verdade e
                cole o link da música favorita dele.
              </p>
            </div>
            <div className="step reveal reveal-d1">
              <span className="step-num serif">02</span>
              <h3>Vê ficando pronto</h3>
              <p>
                A prévia ao vivo mostra exatamente como o site do seu pai vai
                ficar enquanto você preenche. Sem surpresa ruim.
              </p>
            </div>
            <div className="step reveal reveal-d2">
              <span className="step-num serif">03</span>
              <h3>Manda pra ele</h3>
              <p>
                Receba um link exclusivo e envie no WhatsApp com um toque. Ele
                abre e a emoção começa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EMOÇÃO */}
      <section id="emocao">
        <div className="wrap">
          <p className="emo-quote serif reveal">
            Ele esteve em cada conquista sua, cada queda, cada recomeço.
            <br />
            <em>Você tem 5 minutos pra fazer algo por ele?</em>
          </p>
          <p className="emo-sub reveal reveal-d1">
            Não é sobre gastar muito. É sobre dar algo que diga tudo aquilo que a
            gente quase nunca fala em voz alta. Enquanto todo mundo dá meia e
            cueca, você dá uma memória que ele vai querer mostrar pra todo mundo.
          </p>
        </div>
      </section>

      {/* CRIAR */}
      <section id="criar">
        <div className="wrap">
          <div className="criar-head">
            <p className="eyebrow reveal">Criar o presente</p>
            <h2 className="section-title reveal reveal-d1">
              Comece pelo nome dele
            </h2>
          </div>
          <Form />
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section id="prova">
        <div className="wrap">
          <p className="eyebrow reveal">Quem já fez, chorou junto</p>
          <h2 className="section-title reveal reveal-d1">
            Pais não esquecem.
          </h2>
          <div className="depo-grid">
            <div className="depo reveal">
              <div className="stars">★★★★★</div>
              <p>
                “Meu pai não é de demonstrar emoção. Quando abriu o link e a
                música começou, ele ficou em silêncio e só me abraçou.”
              </p>
              <div className="who">Marina, São Paulo</div>
            </div>
            <div className="depo reveal reveal-d1">
              <div className="stars">★★★★★</div>
              <p>
                “Fiz em 4 minutos no busão indo pro trabalho. Melhor presente que
                já dei, e o mais barato também.”
              </p>
              <div className="who">Rafael, Recife</div>
            </div>
            <div className="depo reveal reveal-d2">
              <div className="stars">★★★★★</div>
              <p>
                “Ele printou a tela e colocou de papel de parede no celular. Diz
                que abre todo dia.”
              </p>
              <div className="who">Letícia, Belo Horizonte</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="faq-wrap">
          <p className="eyebrow reveal" style={{ textAlign: "center" }}>
            Perguntas
          </p>
          <h2
            className="section-title reveal reveal-d1"
            style={{ textAlign: "center", marginBottom: 50 }}
          >
            Tudo que você quer saber
          </h2>

          <div className="faq-item reveal">
            <h4>Meu pai precisa baixar ou instalar algo?</h4>
            <p>
              Não. Ele recebe um link e abre direto no navegador do celular ou
              computador. Funciona em qualquer aparelho.
            </p>
          </div>
          <div className="faq-item reveal">
            <h4>O link expira?</h4>
            <p>
              Não. É um pagamento único e o site fica no ar pra sempre. Ele pode
              voltar a abrir quando quiser.
            </p>
          </div>
          <div className="faq-item reveal">
            <h4>Como meu pai recebe?</h4>
            <p>
              Depois do pagamento, o seu link já funciona. Você manda pelo
              WhatsApp com um toque — a mensagem já vai escrita e bonita.
            </p>
          </div>
          <div className="faq-item reveal">
            <h4>Posso imprimir um QR Code?</h4>
            <p>
              Pode! Dentro do site tem a opção de gerar e baixar um QR Code pra
              colar num cartão físico ou mostrar pessoalmente.
            </p>
          </div>
          <div className="faq-item reveal">
            <h4>É seguro?</h4>
            <p>
              Sim. O pagamento é processado pela Cakto, com toda a segurança. As
              suas fotos ficam protegidas e só aparecem no link do presente.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="cta-final">
        <div className="wrap">
          <h2 className="cta-title reveal">
            O Dia dos Pais chega rápido.
            <br />A memória dura a vida toda.
          </h2>
          <a className="hero-cta reveal reveal-d1" href="#criar">
            Criar o site do meu pai
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <a className="nav-logo" href="#hero">
          <img src="/logo.png" alt="Site do Meu Pai" />
          <span>Site do Meu Pai</span>
        </a>
        <p>O presente digital que emociona. Feito com carinho, no Brasil.</p>
        <p className="copy">
          © {new Date().getFullYear()} Site do Meu Pai · Todos os direitos
          reservados
        </p>
      </footer>
    </>
  );
}
