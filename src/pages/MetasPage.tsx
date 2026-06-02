import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  Check,
  ShoppingBag,
  Sparkles,
  Link2,
  Heart,
  Briefcase,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { feitaNoPeriodo } from "../lib/recorrencia";
import { SEMENTE_METAS_PESSOAIS, SEMENTE_METAS_PROFISSIONAIS } from "../data/seeds";

type Tipo = "pessoal" | "profissional";
type Meta = { id: string; titulo: string; tipo: Tipo; descricao: string | null };
type Passo = {
  id: string;
  meta_id: string;
  titulo: string;
  concluido: boolean;
  vinculo_tipo: "compra" | "tarefa" | null;
  vinculo_id: string | null;
};
type Compra = { id: string; titulo: string; comprado: boolean };
type Tarefa = { id: string; titulo: string; frequencia: any; concluido_em: string | null };

export default function MetasPage() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [aba, setAba] = useState<Tipo>("pessoal");
  const [metas, setMetas] = useState<Meta[]>([]);
  const [passos, setPassos] = useState<Passo[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novaMeta, setNovaMeta] = useState("");

  async function carregar() {
    const [m, p, c, t] = await Promise.all([
      supabase.from("metas").select("id, titulo, tipo, descricao").order("ordem"),
      supabase.from("meta_passos").select("id, meta_id, titulo, concluido, vinculo_tipo, vinculo_id").order("ordem"),
      supabase.from("compras_casa").select("id, titulo, comprado"),
      supabase.from("tarefas_casa").select("id, titulo, frequencia, concluido_em"),
    ]);
    setMetas((m.data as Meta[]) ?? []);
    setPassos((p.data as Passo[]) ?? []);
    setCompras((c.data as Compra[]) ?? []);
    setTarefas((t.data as Tarefa[]) ?? []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metasAba = metas.filter((m) => m.tipo === aba);

  async function adicionarMeta() {
    if (!novaMeta.trim() || !uid) return;
    await supabase.from("metas").insert({
      user_id: uid,
      titulo: novaMeta.trim(),
      tipo: aba,
      ordem: metas.length,
    });
    setNovaMeta("");
    carregar();
  }

  async function semear() {
    if (!uid) return;
    const lista = aba === "pessoal" ? SEMENTE_METAS_PESSOAIS : SEMENTE_METAS_PROFISSIONAIS;
    await supabase.from("metas").insert(
      lista.map((titulo, i) => ({ user_id: uid, titulo, tipo: aba, ordem: i }))
    );
    carregar();
  }

  return (
    <div className="animar-surgir space-y-7">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-bruma transition hover:text-musgo">
        <ArrowLeft size={16} /> Inicio
      </Link>

      <header>
        <h1 className="font-display text-4xl text-musgo">Sonhos e Metas</h1>
        <p className="text-bruma">Onde voce quer chegar, um passo de cada vez</p>
      </header>

      <div className="flex gap-2">
        {[
          { id: "pessoal", rotulo: "Pessoais", icone: Heart },
          { id: "profissional", rotulo: "Profissionais", icone: Briefcase },
        ].map((t) => {
          const I = t.icone;
          return (
            <button
              key={t.id}
              onClick={() => setAba(t.id as Tipo)}
              className={`flex items-center gap-2 rounded-suave px-4 py-2 text-sm font-medium transition ${
                aba === t.id ? "bg-musgo text-creme" : "bg-areia/50 text-carvao/70 hover:bg-areia"
              }`}
            >
              <I size={16} /> {t.rotulo}
            </button>
          );
        })}
      </div>

      {carregando ? (
        <p className="text-bruma">Carregando...</p>
      ) : metasAba.length === 0 ? (
        <div className="rounded-suave border border-dashed border-salvia/40 bg-white/40 p-8 text-center">
          <p className="font-display text-xl text-musgo">
            Quer que eu traga seus sonhos {aba === "pessoal" ? "pessoais" : "profissionais"} do caderno?
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-bruma">
            Tudo o que voce escreveu, ja como metas que voce pode abrir e desdobrar em passos.
          </p>
          <button onClick={semear} className="mt-5 rounded-suave bg-musgo px-5 py-2.5 font-medium text-creme transition hover:bg-salvia-escuro">
            Trazer meus sonhos do caderno
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
            <input
              value={novaMeta}
              onChange={(e) => setNovaMeta(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionarMeta()}
              placeholder={`Novo sonho ${aba === "pessoal" ? "pessoal" : "profissional"}...`}
              className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma"
            />
            <button onClick={adicionarMeta} className="rounded-lg bg-salvia p-2 text-creme transition hover:bg-salvia-escuro">
              <Plus size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {metasAba.map((meta) => (
              <CardMeta
                key={meta.id}
                meta={meta}
                passos={passos.filter((p) => p.meta_id === meta.id)}
                compras={compras}
                tarefas={tarefas}
                uid={uid}
                recarregar={carregar}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* --------------------------- CARD DE META --------------------------- */
function CardMeta({
  meta,
  passos,
  compras,
  tarefas,
  uid,
  recarregar,
}: {
  meta: Meta;
  passos: Passo[];
  compras: Compra[];
  tarefas: Tarefa[];
  uid?: string;
  recarregar: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [novoPasso, setNovoPasso] = useState("");
  const [vinculo, setVinculo] = useState<string>(""); // "", "compra:id", "tarefa:id"

  // estado real de um passo, considerando vinculo
  const estaFeito = (p: Passo): boolean => {
    if (p.vinculo_tipo === "compra") {
      return compras.find((c) => c.id === p.vinculo_id)?.comprado ?? false;
    }
    if (p.vinculo_tipo === "tarefa") {
      const t = tarefas.find((x) => x.id === p.vinculo_id);
      return t ? feitaNoPeriodo(t.frequencia, t.concluido_em) : false;
    }
    return p.concluido;
  };

  const feitos = passos.filter(estaFeito).length;
  const total = passos.length;
  const pct = total > 0 ? Math.round((feitos / total) * 100) : 0;

  async function alternarPasso(p: Passo) {
    const feito = estaFeito(p);
    if (p.vinculo_tipo === "compra" && p.vinculo_id) {
      await supabase.from("compras_casa").update({
        comprado: !feito,
        comprado_em: feito ? null : new Date().toISOString(),
      }).eq("id", p.vinculo_id);
    } else if (p.vinculo_tipo === "tarefa" && p.vinculo_id) {
      await supabase.from("tarefas_casa").update({
        concluido_em: feito ? null : new Date().toISOString(),
      }).eq("id", p.vinculo_id);
    } else {
      await supabase.from("meta_passos").update({ concluido: !feito }).eq("id", p.id);
    }
    recarregar();
  }

  async function adicionarPasso() {
    if (!novoPasso.trim() || !uid) return;
    let vinculo_tipo: "compra" | "tarefa" | null = null;
    let vinculo_id: string | null = null;
    if (vinculo) {
      const [tp, id] = vinculo.split(":");
      vinculo_tipo = tp as "compra" | "tarefa";
      vinculo_id = id;
    }
    await supabase.from("meta_passos").insert({
      user_id: uid,
      meta_id: meta.id,
      titulo: novoPasso.trim(),
      ordem: passos.length,
      vinculo_tipo,
      vinculo_id,
    });
    setNovoPasso("");
    setVinculo("");
    recarregar();
  }

  async function removerPasso(id: string) {
    await supabase.from("meta_passos").delete().eq("id", id);
    recarregar();
  }

  async function removerMeta() {
    await supabase.from("metas").delete().eq("id", meta.id);
    recarregar();
  }

  return (
    <div className="overflow-hidden rounded-suave bg-white/60 ring-1 ring-areia/60">
      <button onClick={() => setAberto((a) => !a)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
        <div className="flex-1">
          <p className="font-medium text-musgo">{meta.titulo}</p>
          {total > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-areia">
                <div className="h-full rounded-full bg-salvia transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-bruma">{feitos}/{total}</span>
            </div>
          )}
          {total === 0 && <p className="mt-0.5 text-xs text-bruma">Sem passos ainda. Abra pra desdobrar.</p>}
        </div>
        <ChevronDown size={18} className={`text-bruma transition ${aberto ? "rotate-180" : ""}`} />
      </button>

      {aberto && (
        <div className="border-t border-areia/60 px-4 py-4">
          {/* passos */}
          <ul className="space-y-1.5">
            {passos.map((p) => {
              const feito = estaFeito(p);
              return (
                <li key={p.id} className="group flex items-center gap-3">
                  <button
                    onClick={() => alternarPasso(p)}
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition ${
                      feito ? "border-salvia bg-salvia text-creme" : "border-bruma/50 hover:border-salvia"
                    }`}
                  >
                    {feito && <Check size={13} />}
                  </button>
                  <span className={`flex-1 text-sm ${feito ? "text-bruma line-through" : "text-carvao"}`}>
                    {p.titulo}
                  </span>
                  {p.vinculo_tipo && (
                    <span className="flex items-center gap-1 rounded-full bg-terracota/15 px-2 py-0.5 text-[10px] font-medium text-terracota">
                      {p.vinculo_tipo === "compra" ? <ShoppingBag size={10} /> : <Sparkles size={10} />}
                      {p.vinculo_tipo === "compra" ? "Compras" : "Rotina"}
                    </span>
                  )}
                  <button onClick={() => removerPasso(p.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* novo passo com vinculo */}
          <div className="mt-4 space-y-2 rounded-lg bg-areia/30 p-3">
            <input
              value={novoPasso}
              onChange={(e) => setNovoPasso(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionarPasso()}
              placeholder="Um passo pra chegar la..."
              className="w-full rounded-lg bg-white/70 px-3 py-2 text-sm text-carvao outline-none placeholder:text-bruma"
            />
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-bruma">
                <Link2 size={13} /> ligar a:
              </label>
              <select
                value={vinculo}
                onChange={(e) => setVinculo(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-xs text-carvao outline-none"
              >
                <option value="">nada (passo livre)</option>
                {compras.length > 0 && (
                  <optgroup label="Compras da casa">
                    {compras.map((c) => (
                      <option key={c.id} value={`compra:${c.id}`}>🛒 {c.titulo}</option>
                    ))}
                  </optgroup>
                )}
                {tarefas.length > 0 && (
                  <optgroup label="Rotina da casa">
                    {tarefas.map((t) => (
                      <option key={t.id} value={`tarefa:${t.id}`}>✨ {t.titulo}</option>
                    ))}
                  </optgroup>
                )}
              </select>
              <button onClick={adicionarPasso} className="rounded-lg bg-salvia px-3 py-1.5 text-xs font-medium text-creme transition hover:bg-salvia-escuro">
                Adicionar
              </button>
            </div>
            <p className="text-[11px] leading-snug text-bruma">
              Ligando a uma compra ou tarefa, esse passo se completa sozinho quando voce concluir aquilo na outra area.
            </p>
          </div>

          <button onClick={removerMeta} className="mt-4 flex items-center gap-1.5 text-xs text-bruma transition hover:text-terracota">
            <Trash2 size={13} /> remover este sonho
          </button>
        </div>
      )}
    </div>
  );
}
