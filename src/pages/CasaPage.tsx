import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  ShoppingBag,
  Check,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import {
  feitaNoPeriodo,
  ROTULO_FREQ,
  ORDEM_FREQ,
} from "../lib/recorrencia";
import { SEMENTE_ROTINA, SEMENTE_COMPRAS } from "../data/seeds";

type Freq = "diaria" | "semanal" | "mensal" | "pontual";
type Tarefa = {
  id: string;
  titulo: string;
  frequencia: Freq;
  concluido_em: string | null;
};
type Compra = {
  id: string;
  titulo: string;
  comprado: boolean;
  prioridade: "baixa" | "media" | "alta";
};

export default function CasaPage() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [aba, setAba] = useState<"rotina" | "compras">("rotina");
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    const [t, c] = await Promise.all([
      supabase.from("tarefas_casa").select("id, titulo, frequencia, concluido_em").order("ordem"),
      supabase.from("compras_casa").select("id, titulo, comprado, prioridade").order("ordem"),
    ]);
    setTarefas((t.data as Tarefa[]) ?? []);
    setCompras((c.data as Compra[]) ?? []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="animar-surgir space-y-7">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-bruma transition hover:text-musgo">
        <ArrowLeft size={16} /> Inicio
      </Link>

      <header>
        <h1 className="font-display text-4xl text-musgo">Casa</h1>
        <p className="text-bruma">Seu espaco, sua rotina e o que mantem tudo girando</p>
      </header>

      {/* Abas */}
      <div className="flex gap-2">
        {[
          { id: "rotina", rotulo: "Rotina", icone: Sparkles },
          { id: "compras", rotulo: "Compras", icone: ShoppingBag },
        ].map((t) => {
          const I = t.icone;
          return (
            <button
              key={t.id}
              onClick={() => setAba(t.id as typeof aba)}
              className={`flex items-center gap-2 rounded-suave px-4 py-2 text-sm font-medium transition ${
                aba === t.id
                  ? "bg-musgo text-creme"
                  : "bg-areia/50 text-carvao/70 hover:bg-areia"
              }`}
            >
              <I size={16} /> {t.rotulo}
            </button>
          );
        })}
      </div>

      {carregando ? (
        <p className="text-bruma">Carregando...</p>
      ) : aba === "rotina" ? (
        <Rotina tarefas={tarefas} uid={uid} recarregar={carregar} />
      ) : (
        <Compras compras={compras} uid={uid} recarregar={carregar} />
      )}
    </div>
  );
}

/* ----------------------------- ROTINA ----------------------------- */
function Rotina({
  tarefas,
  uid,
  recarregar,
}: {
  tarefas: Tarefa[];
  uid?: string;
  recarregar: () => void;
}) {
  const [novo, setNovo] = useState("");
  const [novaFreq, setNovaFreq] = useState<Freq>("semanal");

  const porFreq = useMemo(() => {
    const m: Record<Freq, Tarefa[]> = { diaria: [], semanal: [], mensal: [], pontual: [] };
    tarefas.forEach((t) => m[t.frequencia].push(t));
    return m;
  }, [tarefas]);

  async function alternar(t: Tarefa) {
    const feito = feitaNoPeriodo(t.frequencia, t.concluido_em);
    await supabase
      .from("tarefas_casa")
      .update({ concluido_em: feito ? null : new Date().toISOString() })
      .eq("id", t.id);
    recarregar();
  }

  async function adicionar() {
    if (!novo.trim() || !uid) return;
    await supabase.from("tarefas_casa").insert({
      user_id: uid,
      titulo: novo.trim(),
      frequencia: novaFreq,
      ordem: tarefas.length,
    });
    setNovo("");
    recarregar();
  }

  async function mudarFreq(t: Tarefa, f: Freq) {
    await supabase.from("tarefas_casa").update({ frequencia: f }).eq("id", t.id);
    recarregar();
  }

  async function remover(id: string) {
    await supabase.from("tarefas_casa").delete().eq("id", id);
    recarregar();
  }

  async function semear() {
    if (!uid) return;
    await supabase.from("tarefas_casa").insert(
      SEMENTE_ROTINA.map((s, i) => ({
        user_id: uid,
        titulo: s.titulo,
        frequencia: s.frequencia,
        ordem: i,
      }))
    );
    recarregar();
  }

  if (tarefas.length === 0) {
    return <Vazio onSemear={semear} texto="Quer que eu traga sua rotina do caderno?" sub="15 tarefas, ja organizadas por frequencia. Voce ajusta tudo depois." />;
  }

  const feitasHoje = tarefas.filter((t) => feitaNoPeriodo(t.frequencia, t.concluido_em)).length;

  return (
    <div className="space-y-6">
      <p className="text-sm text-salvia-escuro">
        {feitasHoje} de {tarefas.length} em dia. {feitasHoje > 0 ? "Voce esta cuidando bem do seu espaco." : "Comece pela que pesar menos."}
      </p>

      {/* adicionar */}
      <div className="flex flex-wrap items-center gap-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Nova tarefa da casa..."
          className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma"
        />
        <select
          value={novaFreq}
          onChange={(e) => setNovaFreq(e.target.value as Freq)}
          className="rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none"
        >
          {ORDEM_FREQ.map((f) => (
            <option key={f} value={f}>{ROTULO_FREQ[f]}</option>
          ))}
        </select>
        <button onClick={adicionar} className="rounded-lg bg-salvia p-2 text-creme transition hover:bg-salvia-escuro">
          <Plus size={18} />
        </button>
      </div>

      {ORDEM_FREQ.filter((f) => porFreq[f].length > 0).map((f) => (
        <div key={f}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-bruma">{ROTULO_FREQ[f]}</h3>
          <ul className="space-y-1.5">
            {porFreq[f].map((t) => {
              const feito = feitaNoPeriodo(t.frequencia, t.concluido_em);
              return (
                <li
                  key={t.id}
                  className="group flex items-center gap-3 rounded-suave bg-white/50 px-3 py-2.5 ring-1 ring-areia/50"
                >
                  <button
                    onClick={() => alternar(t)}
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border transition ${
                      feito ? "border-salvia bg-salvia text-creme" : "border-bruma/50 hover:border-salvia"
                    }`}
                  >
                    {feito && <Check size={15} />}
                  </button>
                  <span className={`flex-1 text-[15px] ${feito ? "text-bruma line-through" : "text-carvao"}`}>
                    {t.titulo}
                  </span>
                  <select
                    value={t.frequencia}
                    onChange={(e) => mudarFreq(t, e.target.value as Freq)}
                    className="rounded-md bg-transparent px-1 py-0.5 text-xs text-bruma opacity-0 outline-none transition group-hover:opacity-100"
                  >
                    {ORDEM_FREQ.map((ff) => (
                      <option key={ff} value={ff}>{ROTULO_FREQ[ff]}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => remover(t.id)}
                    className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- COMPRAS ----------------------------- */
const COR_PRIORIDADE = {
  alta: "bg-terracota/20 text-terracota",
  media: "bg-salvia/20 text-salvia-escuro",
  baixa: "bg-areia text-bruma",
};

function Compras({
  compras,
  uid,
  recarregar,
}: {
  compras: Compra[];
  uid?: string;
  recarregar: () => void;
}) {
  const [novo, setNovo] = useState("");

  async function alternar(c: Compra) {
    await supabase
      .from("compras_casa")
      .update({ comprado: !c.comprado, comprado_em: c.comprado ? null : new Date().toISOString() })
      .eq("id", c.id);
    recarregar();
  }
  async function adicionar() {
    if (!novo.trim() || !uid) return;
    await supabase.from("compras_casa").insert({
      user_id: uid,
      titulo: novo.trim(),
      ordem: compras.length,
    });
    setNovo("");
    recarregar();
  }
  async function mudarPrioridade(c: Compra) {
    const prox = { baixa: "media", media: "alta", alta: "baixa" } as const;
    await supabase.from("compras_casa").update({ prioridade: prox[c.prioridade] }).eq("id", c.id);
    recarregar();
  }
  async function remover(id: string) {
    await supabase.from("compras_casa").delete().eq("id", id);
    recarregar();
  }
  async function semear() {
    if (!uid) return;
    await supabase.from("compras_casa").insert(
      SEMENTE_COMPRAS.map((titulo, i) => ({ user_id: uid, titulo, ordem: i }))
    );
    recarregar();
  }

  if (compras.length === 0) {
    return <Vazio onSemear={semear} texto="Quer que eu traga sua lista de compras do caderno?" sub="12 itens de decoracao e melhorias da casa." />;
  }

  const comprados = compras.filter((c) => c.comprado).length;

  return (
    <div className="space-y-5">
      <p className="text-sm text-salvia-escuro">
        {comprados} de {compras.length} ja conquistados. Cada item desses e a casa ficando mais sua.
      </p>

      <div className="flex items-center gap-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Quero comprar pra casa..."
          className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma"
        />
        <button onClick={adicionar} className="rounded-lg bg-salvia p-2 text-creme transition hover:bg-salvia-escuro">
          <Plus size={18} />
        </button>
      </div>

      <ul className="grid gap-1.5 sm:grid-cols-2">
        {compras.map((c) => (
          <li
            key={c.id}
            className="group flex items-center gap-3 rounded-suave bg-white/50 px-3 py-2.5 ring-1 ring-areia/50"
          >
            <button
              onClick={() => alternar(c)}
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border transition ${
                c.comprado ? "border-salvia bg-salvia text-creme" : "border-bruma/50 hover:border-salvia"
              }`}
            >
              {c.comprado && <Check size={15} />}
            </button>
            <span className={`flex-1 text-[15px] ${c.comprado ? "text-bruma line-through" : "text-carvao"}`}>
              {c.titulo}
            </span>
            <button
              onClick={() => mudarPrioridade(c)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${COR_PRIORIDADE[c.prioridade]}`}
            >
              {c.prioridade}
            </button>
            <button
              onClick={() => remover(c.id)}
              className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------- VAZIO ----------------------------- */
function Vazio({ onSemear, texto, sub }: { onSemear: () => void; texto: string; sub: string }) {
  return (
    <div className="rounded-suave border border-dashed border-salvia/40 bg-white/40 p-8 text-center">
      <p className="font-display text-xl text-musgo">{texto}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-bruma">{sub}</p>
      <button
        onClick={onSemear}
        className="mt-5 rounded-suave bg-musgo px-5 py-2.5 font-medium text-creme transition hover:bg-salvia-escuro"
      >
        Trazer minha lista do caderno
      </button>
    </div>
  );
}
