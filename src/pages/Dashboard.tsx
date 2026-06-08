import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plane } from "lucide-react";
import { PILARES } from "../pillars";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";

const HUMORES = [
  { emoji: "🌧️", rotulo: "Pesado" },
  { emoji: "☁️", rotulo: "Nublado" },
  { emoji: "🌤️", rotulo: "Ok" },
  { emoji: "☀️", rotulo: "Bem" },
  { emoji: "🌻", rotulo: "Radiante" },
];

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Dashboard() {
  const { session } = useAuth();
  const [humor, setHumor] = useState<number | null>(null);
  const [nota, setNota] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [eurotripData, setEurotripData] = useState<string | null>(null);

  // carrega o check-in de hoje, se ja existir
  useEffect(() => {
    if (!session) return;
    supabase
      .from("checkins")
      .select("humor, nota")
      .eq("dia", hojeISO())
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setHumor(data.humor);
          setNota(data.nota ?? "");
          setSalvo(true);
        }
      });
    supabase
      .from("config_usuario")
      .select("valor")
      .eq("chave", "eurotrip_data")
      .maybeSingle()
      .then(({ data }) => setEurotripData(data?.valor ?? null));
  }, [session]);

  async function salvarCheckin(novoHumor: number) {
    setHumor(novoHumor);
    setSalvo(false);
    if (!session) return;
    await supabase.from("checkins").upsert(
      {
        user_id: session.user.id,
        dia: hojeISO(),
        humor: novoHumor,
        nota,
      },
      { onConflict: "user_id,dia" }
    );
    setSalvo(true);
  }

  return (
    <div className="animar-surgir space-y-8">
      <header>
        <p className="text-sm uppercase tracking-wide text-bruma">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="mt-1 font-display text-4xl text-musgo md:text-5xl">
          {saudacao()}, Agatha
        </h1>
      </header>

      {/* Check-in do dia */}
      <section className="rounded-suave bg-white/60 p-6 shadow-suave ring-1 ring-areia/60">
        <h2 className="font-display text-2xl text-musgo">Como voce esta hoje?</h2>
        <p className="mt-1 text-sm text-bruma">
          Sem julgamento. So um registro gentil pra voce se acompanhar.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {HUMORES.map((h, i) => (
            <button
              key={i}
              onClick={() => salvarCheckin(i)}
              className={`flex flex-col items-center gap-1 rounded-suave px-5 py-3 transition ${
                humor === i
                  ? "bg-salvia/25 ring-2 ring-salvia"
                  : "bg-areia/40 hover:bg-areia/70"
              }`}
            >
              <span className="text-2xl">{h.emoji}</span>
              <span className="text-xs font-medium text-carvao/70">{h.rotulo}</span>
            </button>
          ))}
        </div>
        {humor !== null && (
          <p className="mt-4 text-sm text-salvia-escuro">
            {salvo ? "Anotado. Cuide-se bem hoje." : "Salvando..."}
          </p>
        )}
      </section>

      {/* Sonho em foco: Eurotrip */}
      <Link
        to="/eurotrip"
        className="group relative flex items-center gap-4 overflow-hidden rounded-suave bg-gradient-to-br from-salvia/20 to-terracota/10 p-5 shadow-suave ring-1 ring-salvia/25 transition hover:-translate-y-0.5"
      >
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-suave bg-white/60 text-salvia-escuro">
          <Plane size={24} strokeWidth={1.8} />
        </span>
        <div className="flex-1">
          <h3 className="font-display text-xl text-musgo">Eurotrip</h3>
          <p className="text-sm text-carvao/60">
            {(() => {
              if (!eurotripData) return "Seu sonho em foco. Bora planejar?";
              const dias = Math.ceil(
                (new Date(eurotripData + "T00:00:00").getTime() - new Date(hojeISO() + "T00:00:00").getTime()) / 86400000
              );
              if (dias > 0) return `Faltam ${dias} dias pra esse sonho.`;
              if (dias === 0) return "E hoje! Boa viagem.";
              return "Que viagem linda foi essa.";
            })()}
          </p>
        </div>
        <ArrowUpRight size={18} className="text-bruma transition group-hover:text-terracota" />
      </Link>

      {/* Os pilares */}
      <section>
        <h2 className="mb-4 font-display text-2xl text-musgo">Suas areas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILARES.map((p) => {
            const Icone = p.icone;
            return (
              <Link
                key={p.slug}
                to={`/${p.slug}`}
                className="group relative overflow-hidden rounded-suave bg-white/60 p-5 shadow-suave ring-1 ring-areia/60 transition hover:-translate-y-0.5 hover:ring-salvia/50"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-suave bg-salvia/15 text-salvia-escuro">
                    <Icone size={22} strokeWidth={1.8} />
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="text-bruma transition group-hover:text-terracota"
                  />
                </div>
                <h3 className="mt-4 font-display text-xl text-musgo">{p.nome}</h3>
                <p className="mt-1 text-sm leading-snug text-carvao/60">
                  {p.descricao}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
