import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getPilar } from "../pillars";

export default function PilarPage() {
  const { slug } = useParams();
  const pilar = slug ? getPilar(slug) : undefined;

  if (!pilar) {
    return (
      <div className="animar-surgir">
        <p className="text-bruma">Essa area ainda nao existe.</p>
        <Link to="/" className="mt-3 inline-block text-salvia-escuro underline">
          Voltar ao inicio
        </Link>
      </div>
    );
  }

  const Icone = pilar.icone;

  return (
    <div className="animar-surgir space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-bruma transition hover:text-musgo"
      >
        <ArrowLeft size={16} /> Inicio
      </Link>

      <header className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-suave bg-salvia/15 text-salvia-escuro">
          <Icone size={28} strokeWidth={1.7} />
        </span>
        <div>
          <h1 className="font-display text-4xl text-musgo">{pilar.nome}</h1>
          <p className="text-bruma">{pilar.descricao}</p>
        </div>
      </header>

      {/* Areas que vao morar aqui dentro */}
      <section className="rounded-suave border border-dashed border-salvia/40 bg-white/40 p-6">
        <p className="text-sm font-medium uppercase tracking-wide text-bruma">
          O que vai viver aqui
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {pilar.areas.map((area) => (
            <span
              key={area}
              className="rounded-full bg-areia/60 px-4 py-1.5 text-sm text-musgo"
            >
              {area}
            </span>
          ))}
        </div>
        <p className="mt-6 max-w-xl text-carvao/70">
          Essa sala ainda esta vazia, e e proposital. Quando voce quiser, a gente
          monta essa pagina juntas: voce me diz o que precisa ver e registrar aqui,
          e eu construo do seu jeito.
        </p>
      </section>
    </div>
  );
}
