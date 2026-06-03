import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, Check, Stethoscope, Dumbbell,
  Sparkles, Scale, Apple, CalendarClock,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { feitaNoPeriodo, ROTULO_FREQ, ORDEM_FREQ } from "../lib/recorrencia";
import {
  SEMENTE_SKINCARE_MANHA, SEMENTE_SKINCARE_NOITE, SEMENTE_ALIMENTACAO,
} from "../data/seeds";

type Freq = "diaria" | "semanal" | "mensal" | "pontual";

const ABAS = [
  { id: "saude", rotulo: "Saude", icone: Stethoscope },
  { id: "movimento", rotulo: "Movimento", icone: Dumbbell },
  { id: "skincare", rotulo: "Skincare", icone: Sparkles },
  { id: "peso", rotulo: "Peso", icone: Scale },
  { id: "alimentacao", rotulo: "Alimentacao", icone: Apple },
] as const;

export default function CorpoPage() {
  const [aba, setAba] = useState<(typeof ABAS)[number]["id"]>("saude");

  return (
    <div className="animar-surgir space-y-7">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-bruma transition hover:text-musgo">
        <ArrowLeft size={16} /> Inicio
      </Link>

      <header>
        <h1 className="font-display text-4xl text-musgo">Corpo</h1>
        <p className="text-bruma">Sua saude fisica e o jeito que voce se cuida por fora</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {ABAS.map((t) => {
          const I = t.icone;
          return (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={`flex items-center gap-2 rounded-suave px-4 py-2 text-sm font-medium transition ${
                aba === t.id ? "bg-musgo text-creme" : "bg-areia/50 text-carvao/70 hover:bg-areia"
              }`}
            >
              <I size={16} /> {t.rotulo}
            </button>
          );
        })}
      </div>

      {aba === "saude" && <Saude />}
      {aba === "movimento" && <Movimento />}
      {aba === "skincare" && <Skincare />}
      {aba === "peso" && <Peso />}
      {aba === "alimentacao" && <Alimentacao />}
    </div>
  );
}

/* ============================== SAUDE ============================== */
type Evento = {
  id: string; titulo: string; tipo: "consulta" | "exame" | "checkup" | "lembrete";
  data: string | null; feito: boolean; recorrencia: "unica" | "anual";
};
const TIPO_ROTULO = { consulta: "Consulta", exame: "Exame", checkup: "Check-up", lembrete: "Lembrete" };

function Saude() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [itens, setItens] = useState<Evento[]>([]);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<Evento["tipo"]>("consulta");
  const [data, setData] = useState("");
  const [recorrencia, setRecorrencia] = useState<Evento["recorrencia"]>("unica");

  async function carregar() {
    const { data: d } = await supabase
      .from("saude_eventos")
      .select("id, titulo, tipo, data, feito, recorrencia")
      .order("data", { nullsFirst: false });
    setItens((d as Evento[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function adicionar() {
    if (!titulo.trim() || !uid) return;
    await supabase.from("saude_eventos").insert({
      user_id: uid, titulo: titulo.trim(), tipo, data: data || null, recorrencia,
    });
    setTitulo(""); setData(""); setRecorrencia("unica"); setTipo("consulta");
    carregar();
  }
  async function alternar(e: Evento) {
    await supabase.from("saude_eventos").update({ feito: !e.feito }).eq("id", e.id);
    carregar();
  }
  async function remover(id: string) {
    await supabase.from("saude_eventos").delete().eq("id", id);
    carregar();
  }

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const diasAte = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso + "T00:00:00");
    return Math.round((d.getTime() - hoje.getTime()) / 86400000);
  };

  const pendentes = itens.filter((e) => !e.feito);
  const feitos = itens.filter((e) => e.feito);

  return (
    <div className="space-y-5">
      <p className="text-sm text-bruma">
        Consultas, exames e o check-up anual. O que estiver chegando perto ganha um aviso.
      </p>

      <div className="space-y-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
        <input
          value={titulo} onChange={(e) => setTitulo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Ex: Dermatologista, hemograma, check-up anual..."
          className="w-full rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select value={tipo} onChange={(e) => setTipo(e.target.value as Evento["tipo"])}
            className="rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none">
            <option value="consulta">Consulta</option>
            <option value="exame">Exame</option>
            <option value="checkup">Check-up</option>
            <option value="lembrete">Lembrete</option>
          </select>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)}
            className="rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none" />
          <select value={recorrencia} onChange={(e) => setRecorrencia(e.target.value as Evento["recorrencia"])}
            className="rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none">
            <option value="unica">Uma vez</option>
            <option value="anual">Todo ano</option>
          </select>
          <button onClick={adicionar} className="ml-auto rounded-lg bg-salvia p-2 text-creme transition hover:bg-salvia-escuro">
            <Plus size={18} />
          </button>
        </div>
      </div>

      <ul className="space-y-1.5">
        {pendentes.map((e) => {
          const dias = diasAte(e.data);
          const perto = dias !== null && dias >= 0 && dias <= 14;
          const passou = dias !== null && dias < 0;
          return (
            <li key={e.id} className="group flex items-center gap-3 rounded-suave bg-white/50 px-3 py-2.5 ring-1 ring-areia/50">
              <button onClick={() => alternar(e)}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-bruma/50 transition hover:border-salvia" />
              <div className="flex-1">
                <span className="text-[15px] text-carvao">{e.titulo}</span>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-areia/60 px-2 py-0.5 text-bruma">{TIPO_ROTULO[e.tipo]}</span>
                  {e.recorrencia === "anual" && <span className="rounded-full bg-salvia/15 px-2 py-0.5 text-salvia-escuro">todo ano</span>}
                  {e.data && (
                    <span className={`flex items-center gap-1 ${perto ? "text-terracota" : passou ? "text-terracota/70" : "text-bruma"}`}>
                      <CalendarClock size={12} />
                      {new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR")}
                      {perto && dias === 0 && " · e hoje"}
                      {perto && dias! > 0 && ` · em ${dias} dias`}
                      {passou && " · ja passou"}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => remover(e.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100">
                <Trash2 size={16} />
              </button>
            </li>
          );
        })}
      </ul>

      {feitos.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-bruma">Concluidos ({feitos.length})</summary>
          <ul className="mt-2 space-y-1.5">
            {feitos.map((e) => (
              <li key={e.id} className="group flex items-center gap-3 rounded-suave bg-white/30 px-3 py-2">
                <button onClick={() => alternar(e)}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-salvia bg-salvia text-creme">
                  <Check size={15} />
                </button>
                <span className="flex-1 text-carvao/50 line-through">{e.titulo}</span>
                <button onClick={() => remover(e.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}

      {itens.length === 0 && <p className="text-center text-bruma">Adicione sua primeira consulta ou exame aqui em cima.</p>}
    </div>
  );
}

/* ===================== MOVIMENTO (exercicios) ===================== */
type Exer = { id: string; titulo: string; frequencia: Freq; concluido_em: string | null };

function Movimento() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [itens, setItens] = useState<Exer[]>([]);
  const [novo, setNovo] = useState("");
  const [freq, setFreq] = useState<Freq>("semanal");

  async function carregar() {
    const { data } = await supabase.from("exercicios").select("id, titulo, frequencia, concluido_em").order("ordem");
    setItens((data as Exer[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function adicionar() {
    if (!novo.trim() || !uid) return;
    await supabase.from("exercicios").insert({ user_id: uid, titulo: novo.trim(), frequencia: freq, ordem: itens.length });
    setNovo(""); carregar();
  }
  async function alternar(e: Exer) {
    const feito = feitaNoPeriodo(e.frequencia, e.concluido_em);
    await supabase.from("exercicios").update({ concluido_em: feito ? null : new Date().toISOString() }).eq("id", e.id);
    carregar();
  }
  async function remover(id: string) {
    await supabase.from("exercicios").delete().eq("id", id); carregar();
  }

  if (itens.length === 0) {
    return (
      <div className="space-y-4">
        <Form novo={novo} setNovo={setNovo} freq={freq} setFreq={setFreq} adicionar={adicionar} placeholder="Ex: Caminhada, musculacao, alongar..." />
        <p className="text-center text-bruma">Monte aqui os exercicios que voce quer fazer e marque conforme cuida do seu corpo.</p>
      </div>
    );
  }
  const feitos = itens.filter((e) => feitaNoPeriodo(e.frequencia, e.concluido_em)).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-salvia-escuro">{feitos} de {itens.length} em dia. Cada movimento conta, no seu ritmo.</p>
      <Form novo={novo} setNovo={setNovo} freq={freq} setFreq={setFreq} adicionar={adicionar} placeholder="Ex: Caminhada, musculacao, alongar..." />
      <ul className="space-y-1.5">
        {itens.map((e) => {
          const feito = feitaNoPeriodo(e.frequencia, e.concluido_em);
          return (
            <li key={e.id} className="group flex items-center gap-3 rounded-suave bg-white/50 px-3 py-2.5 ring-1 ring-areia/50">
              <button onClick={() => alternar(e)}
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border transition ${feito ? "border-salvia bg-salvia text-creme" : "border-bruma/50 hover:border-salvia"}`}>
                {feito && <Check size={15} />}
              </button>
              <span className={`flex-1 text-[15px] ${feito ? "text-bruma line-through" : "text-carvao"}`}>{e.titulo}</span>
              <span className="rounded-full bg-areia/60 px-2 py-0.5 text-[10px] uppercase text-bruma">{ROTULO_FREQ[e.frequencia]}</span>
              <button onClick={() => remover(e.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100">
                <Trash2 size={16} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Form({ novo, setNovo, freq, setFreq, adicionar, placeholder }: any) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
      <input value={novo} onChange={(e) => setNovo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()}
        placeholder={placeholder} className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma" />
      <select value={freq} onChange={(e) => setFreq(e.target.value)}
        className="rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none">
        {ORDEM_FREQ.map((f) => <option key={f} value={f}>{ROTULO_FREQ[f]}</option>)}
      </select>
      <button onClick={adicionar} className="rounded-lg bg-salvia p-2 text-creme transition hover:bg-salvia-escuro"><Plus size={18} /></button>
    </div>
  );
}

/* ========================== SKINCARE ========================== */
type Skin = { id: string; periodo: "manha" | "noite"; titulo: string; concluido_em: string | null };

function Skincare() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [itens, setItens] = useState<Skin[]>([]);
  const [novoManha, setNovoManha] = useState("");
  const [novoNoite, setNovoNoite] = useState("");

  async function carregar() {
    const { data } = await supabase.from("skincare_itens").select("id, periodo, titulo, concluido_em").order("ordem");
    setItens((data as Skin[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function adicionar(periodo: "manha" | "noite", titulo: string) {
    if (!titulo.trim() || !uid) return;
    const n = itens.filter((i) => i.periodo === periodo).length;
    await supabase.from("skincare_itens").insert({ user_id: uid, periodo, titulo: titulo.trim(), ordem: n });
    setNovoManha(""); setNovoNoite(""); carregar();
  }
  async function alternar(s: Skin) {
    const feito = feitaNoPeriodo("diaria", s.concluido_em);
    await supabase.from("skincare_itens").update({ concluido_em: feito ? null : new Date().toISOString() }).eq("id", s.id);
    carregar();
  }
  async function remover(id: string) {
    await supabase.from("skincare_itens").delete().eq("id", id); carregar();
  }
  async function semear() {
    if (!uid) return;
    await supabase.from("skincare_itens").insert([
      ...SEMENTE_SKINCARE_MANHA.map((t, i) => ({ user_id: uid, periodo: "manha", titulo: t, ordem: i })),
      ...SEMENTE_SKINCARE_NOITE.map((t, i) => ({ user_id: uid, periodo: "noite", titulo: t, ordem: i })),
    ]);
    carregar();
  }

  if (itens.length === 0) {
    return (
      <div className="rounded-suave border border-dashed border-salvia/40 bg-white/40 p-8 text-center">
        <p className="font-display text-xl text-musgo">Quer comecar com uma rotina basica?</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-bruma">Monto um esqueleto de manha e noite, e voce ajusta com os seus produtos.</p>
        <button onClick={semear} className="mt-5 rounded-suave bg-musgo px-5 py-2.5 font-medium text-creme transition hover:bg-salvia-escuro">
          Criar rotina de partida
        </button>
      </div>
    );
  }

  const bloco = (periodo: "manha" | "noite", titulo: string, novo: string, setNovo: any) => {
    const lista = itens.filter((i) => i.periodo === periodo);
    const feitos = lista.filter((s) => feitaNoPeriodo("diaria", s.concluido_em)).length;
    return (
      <div className="rounded-suave bg-white/50 p-4 ring-1 ring-areia/60">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg text-musgo">{titulo}</h3>
          <span className="text-xs text-bruma">{feitos}/{lista.length} hoje</span>
        </div>
        <ul className="space-y-1.5">
          {lista.map((s) => {
            const feito = feitaNoPeriodo("diaria", s.concluido_em);
            return (
              <li key={s.id} className="group flex items-center gap-3">
                <button onClick={() => alternar(s)}
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition ${feito ? "border-salvia bg-salvia text-creme" : "border-bruma/50 hover:border-salvia"}`}>
                  {feito && <Check size={13} />}
                </button>
                <span className={`flex-1 text-sm ${feito ? "text-bruma line-through" : "text-carvao"}`}>{s.titulo}</span>
                <button onClick={() => remover(s.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"><Trash2 size={14} /></button>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex items-center gap-2">
          <input value={novo} onChange={(e) => setNovo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar(periodo, novo)}
            placeholder="Adicionar passo..." className="flex-1 rounded-lg bg-areia/30 px-3 py-1.5 text-sm text-carvao outline-none placeholder:text-bruma" />
          <button onClick={() => adicionar(periodo, novo)} className="rounded-lg bg-salvia p-1.5 text-creme transition hover:bg-salvia-escuro"><Plus size={16} /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-bruma">Sua rotina de pele, manha e noite. Reinicia todo dia, leve e sem peso.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {bloco("manha", "Manha", novoManha, setNovoManha)}
        {bloco("noite", "Noite", novoNoite, setNovoNoite)}
      </div>
    </div>
  );
}

/* ============================ PESO ============================ */
type Peso = { id: string; dia: string; valor: number };

function Peso() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [itens, setItens] = useState<Peso[]>([]);
  const [valor, setValor] = useState("");

  async function carregar() {
    const { data } = await supabase.from("peso_registros").select("id, dia, valor").order("dia");
    setItens((data as Peso[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function registrar() {
    const v = parseFloat(valor.replace(",", "."));
    if (!v || !uid) return;
    await supabase.from("peso_registros").upsert(
      { user_id: uid, dia: new Date().toISOString().slice(0, 10), valor: v },
      { onConflict: "user_id,dia" }
    );
    setValor(""); carregar();
  }
  async function remover(id: string) {
    await supabase.from("peso_registros").delete().eq("id", id); carregar();
  }

  const ultimos = useMemo(() => itens.slice(-12), [itens]);
  const spark = useMemo(() => {
    if (ultimos.length < 2) return "";
    const vals = ultimos.map((i) => i.valor);
    const min = Math.min(...vals), max = Math.max(...vals);
    const range = max - min || 1;
    return ultimos.map((i, idx) => {
      const x = (idx / (ultimos.length - 1)) * 100;
      const y = 30 - ((i.valor - min) / range) * 28 - 1;
      return `${x},${y}`;
    }).join(" ");
  }, [ultimos]);

  const atual = itens.length ? itens[itens.length - 1].valor : null;

  return (
    <div className="space-y-5">
      <p className="text-sm text-bruma">
        Um acompanhamento gentil, no seu ritmo. Aqui nao tem meta nem cobranca, so a sua tendencia ao longo do tempo, pra voce se conhecer.
      </p>

      <div className="flex items-center gap-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
        <input value={valor} onChange={(e) => setValor(e.target.value)} onKeyDown={(e) => e.key === "Enter" && registrar()}
          inputMode="decimal" placeholder="Peso de hoje (kg)"
          className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma" />
        <button onClick={registrar} className="rounded-lg bg-salvia px-4 py-2 text-sm font-medium text-creme transition hover:bg-salvia-escuro">Registrar</button>
      </div>

      {itens.length === 0 ? (
        <p className="text-center text-bruma">Quando quiser, registre seu peso. Sem pressao, no dia que fizer sentido pra voce.</p>
      ) : (
        <div className="rounded-suave bg-white/50 p-5 ring-1 ring-areia/60">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-bruma">Ultimo registro</p>
              <p className="font-display text-3xl text-musgo">{atual} <span className="text-lg text-bruma">kg</span></p>
            </div>
            {spark && (
              <svg viewBox="0 0 100 30" className="h-12 w-40" preserveAspectRatio="none">
                <polyline points={spark} fill="none" stroke="#7C9082" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <ul className="mt-4 divide-y divide-areia/50 text-sm">
            {[...itens].reverse().slice(0, 8).map((p) => (
              <li key={p.id} className="group flex items-center justify-between py-1.5">
                <span className="text-bruma">{new Date(p.dia + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                <span className="flex items-center gap-3 text-carvao">
                  {p.valor} kg
                  <button onClick={() => remover(p.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"><Trash2 size={14} /></button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ========================= ALIMENTACAO ========================= */
type Habito = { id: string; titulo: string; concluido_em: string | null };

function Alimentacao() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [plano, setPlano] = useState("");
  const [planoSalvo, setPlanoSalvo] = useState(true);
  const [novo, setNovo] = useState("");

  async function carregar() {
    const [h, c] = await Promise.all([
      supabase.from("alimentacao_habitos").select("id, titulo, concluido_em").order("ordem"),
      supabase.from("config_usuario").select("valor").eq("chave", "plano_alimentar").maybeSingle(),
    ]);
    setHabitos((h.data as Habito[]) ?? []);
    if (c.data?.valor) setPlano(c.data.valor);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function salvarPlano() {
    if (!uid) return;
    await supabase.from("config_usuario").upsert(
      { user_id: uid, chave: "plano_alimentar", valor: plano, atualizado_em: new Date().toISOString() },
      { onConflict: "user_id,chave" }
    );
    setPlanoSalvo(true);
  }
  async function alternar(h: Habito) {
    const feito = feitaNoPeriodo("diaria", h.concluido_em);
    await supabase.from("alimentacao_habitos").update({ concluido_em: feito ? null : new Date().toISOString() }).eq("id", h.id);
    carregar();
  }
  async function adicionar() {
    if (!novo.trim() || !uid) return;
    await supabase.from("alimentacao_habitos").insert({ user_id: uid, titulo: novo.trim(), ordem: habitos.length });
    setNovo(""); carregar();
  }
  async function remover(id: string) {
    await supabase.from("alimentacao_habitos").delete().eq("id", id); carregar();
  }
  async function semear() {
    if (!uid) return;
    await supabase.from("alimentacao_habitos").insert(
      SEMENTE_ALIMENTACAO.map((titulo, i) => ({ user_id: uid, titulo, ordem: i }))
    );
    carregar();
  }

  const feitos = habitos.filter((h) => feitaNoPeriodo("diaria", h.concluido_em)).length;

  return (
    <div className="space-y-6">
      <p className="text-sm text-bruma">
        Sem dieta, sem culpa. Aqui voce guarda seu plano e cuida de uns habitos gentis que ajudam a equilibrar o doce.
      </p>

      {/* habitos do dia */}
      <div>
        <h3 className="mb-2 font-display text-lg text-musgo">Habitos de hoje</h3>
        {habitos.length === 0 ? (
          <div className="rounded-suave border border-dashed border-salvia/40 bg-white/40 p-6 text-center">
            <p className="text-sm text-bruma">Quer comecar com os habitos gentis que a gente conversou?</p>
            <button onClick={semear} className="mt-4 rounded-suave bg-musgo px-5 py-2.5 text-sm font-medium text-creme transition hover:bg-salvia-escuro">
              Trazer os habitos
            </button>
          </div>
        ) : (
          <>
            <p className="mb-2 text-sm text-salvia-escuro">{feitos} de {habitos.length} hoje. Um passo de cada vez.</p>
            <ul className="space-y-1.5">
              {habitos.map((h) => {
                const feito = feitaNoPeriodo("diaria", h.concluido_em);
                return (
                  <li key={h.id} className="group flex items-center gap-3 rounded-suave bg-white/50 px-3 py-2.5 ring-1 ring-areia/50">
                    <button onClick={() => alternar(h)}
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border transition ${feito ? "border-salvia bg-salvia text-creme" : "border-bruma/50 hover:border-salvia"}`}>
                      {feito && <Check size={15} />}
                    </button>
                    <span className={`flex-1 text-[15px] ${feito ? "text-bruma line-through" : "text-carvao"}`}>{h.titulo}</span>
                    <button onClick={() => remover(h.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"><Trash2 size={16} /></button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 flex items-center gap-2">
              <input value={novo} onChange={(e) => setNovo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()}
                placeholder="Adicionar um habito..." className="flex-1 rounded-lg bg-white/50 px-3 py-1.5 text-sm text-carvao outline-none ring-1 ring-areia/60 placeholder:text-bruma" />
              <button onClick={adicionar} className="rounded-lg bg-salvia p-1.5 text-creme transition hover:bg-salvia-escuro"><Plus size={16} /></button>
            </div>
          </>
        )}
      </div>

      {/* plano alimentar (texto livre) */}
      <div>
        <h3 className="mb-2 font-display text-lg text-musgo">Meu plano alimentar</h3>
        <textarea
          value={plano}
          onChange={(e) => { setPlano(e.target.value); setPlanoSalvo(false); }}
          rows={6}
          placeholder="Anote aqui seu plano, ideias de refeicoes, ou o que a nutri passar. Este espaco e seu."
          className="w-full rounded-suave bg-white/50 p-4 text-sm text-carvao outline-none ring-1 ring-areia/60 placeholder:text-bruma"
        />
        <div className="mt-2 flex items-center gap-3">
          <button onClick={salvarPlano} disabled={planoSalvo}
            className="rounded-lg bg-musgo px-4 py-2 text-sm font-medium text-creme transition hover:bg-salvia-escuro disabled:opacity-50">
            {planoSalvo ? "Salvo" : "Salvar plano"}
          </button>
          {!planoSalvo && <span className="text-xs text-bruma">alteracoes nao salvas</span>}
        </div>
      </div>
    </div>
  );
}
