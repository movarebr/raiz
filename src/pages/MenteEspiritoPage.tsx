import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, Check, HeartHandshake, Pill, Sprout,
  RefreshCw, AlertTriangle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { feitaNoPeriodo, ROTULO_FREQ, ORDEM_FREQ } from "../lib/recorrencia";

type Freq = "diaria" | "semanal" | "mensal" | "pontual";

const hojeISO = () => new Date().toISOString().slice(0, 10);
const diasEntre = (a: string, b: string) =>
  Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000);

const ABAS = [
  { id: "ansiedade", rotulo: "Ansiedade", icone: HeartHandshake },
  { id: "remedios", rotulo: "Remedios", icone: Pill },
  { id: "espiritualidade", rotulo: "Espiritualidade", icone: Sprout },
] as const;

export default function MenteEspiritoPage() {
  const [aba, setAba] = useState<(typeof ABAS)[number]["id"]>("ansiedade");
  return (
    <div className="animar-surgir space-y-7">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-bruma transition hover:text-musgo">
        <ArrowLeft size={16} /> Inicio
      </Link>
      <header>
        <h1 className="font-display text-4xl text-musgo">Mente e Espirito</h1>
        <p className="text-bruma">Seu mundo interior, o que te acalma e te sustenta</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {ABAS.map((t) => {
          const I = t.icone;
          return (
            <button key={t.id} onClick={() => setAba(t.id)}
              className={`flex items-center gap-2 rounded-suave px-4 py-2 text-sm font-medium transition ${
                aba === t.id ? "bg-musgo text-creme" : "bg-areia/50 text-carvao/70 hover:bg-areia"}`}>
              <I size={16} /> {t.rotulo}
            </button>
          );
        })}
      </div>

      {aba === "ansiedade" && <Ansiedade />}
      {aba === "remedios" && <Remedios />}
      {aba === "espiritualidade" && <Espiritualidade />}
    </div>
  );
}

/* ============================ ANSIEDADE ============================ */
type Crise = { id: string; dia: string; nota: string | null };

function Ansiedade() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [crises, setCrises] = useState<Crise[]>([]);
  const [inicio, setInicio] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState(false);
  const [nota, setNota] = useState("");

  async function carregar() {
    const [c, cfg] = await Promise.all([
      supabase.from("crises_ansiedade").select("id, dia, nota").order("dia", { ascending: false }),
      supabase.from("config_usuario").select("valor").eq("chave", "ansiedade_inicio").maybeSingle(),
    ]);
    setCrises((c.data as Crise[]) ?? []);
    if (cfg.data?.valor) {
      setInicio(cfg.data.valor);
    } else if (uid) {
      // primeira visita: marca o inicio do acompanhamento como hoje
      await supabase.from("config_usuario").upsert(
        { user_id: uid, chave: "ansiedade_inicio", valor: hojeISO() },
        { onConflict: "user_id,chave" }
      );
      setInicio(hojeISO());
    }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  const hoje = hojeISO();
  const criseHoje = crises.some((c) => c.dia === hoje);
  const ultimaCrise = crises.length ? crises[0].dia : null;
  const referencia = ultimaCrise ?? inicio ?? hoje;
  const diasSem = Math.max(0, diasEntre(referencia, hoje));

  // visao do mes
  const agora = new Date();
  const diaDoMes = agora.getDate();
  const crisesNoMes = crises.filter((c) => {
    const d = new Date(c.dia + "T00:00:00");
    return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
  }).length;
  const tranquilosNoMes = Math.max(0, diaDoMes - crisesNoMes);

  async function registrarCrise() {
    if (!uid) return;
    await supabase.from("crises_ansiedade").upsert(
      { user_id: uid, dia: hoje, nota: nota.trim() || null },
      { onConflict: "user_id,dia" }
    );
    setNota(""); setRegistrando(false); carregar();
  }
  async function desfazerHoje() {
    await supabase.from("crises_ansiedade").delete().eq("dia", hoje);
    carregar();
  }
  async function remover(id: string) {
    await supabase.from("crises_ansiedade").delete().eq("id", id); carregar();
  }

  return (
    <div className="space-y-6">
      {/* card principal */}
      {criseHoje ? (
        <div className="rounded-suave bg-terracota/10 p-6 text-center ring-1 ring-terracota/20">
          <p className="font-display text-2xl text-musgo">Hoje foi um dia mais dificil, e tudo bem.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-carvao/70">
            Ter uma crise nao apaga o seu cuidado nem o seu progresso. Amanha recomeca leve, no seu tempo. Voce esta fazendo o que pode, e isso ja e muito.
          </p>
          <button onClick={desfazerHoje} className="mt-4 text-xs text-bruma underline transition hover:text-musgo">
            na verdade, hoje foi tranquilo
          </button>
        </div>
      ) : (
        <div className="rounded-suave bg-salvia/15 p-7 text-center ring-1 ring-salvia/25">
          <p className="text-sm uppercase tracking-wide text-salvia-escuro">Voce esta ha</p>
          <p className="my-1 font-display text-6xl text-musgo">{diasSem}</p>
          <p className="text-lg text-musgo">{diasSem === 1 ? "dia" : "dias"} sem uma crise</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-carvao/60">
            {diasSem === 0
              ? "Cada dia conta, comecando por hoje."
              : "Olha o quanto voce vem se cuidando. Sem pressao pra manter, so um carinho por ver."}
          </p>
        </div>
      )}

      {/* visao do mes */}
      <div className="rounded-suave bg-white/50 p-4 ring-1 ring-areia/60">
        <p className="text-sm text-carvao/70">
          Neste mes, <b className="text-musgo">{tranquilosNoMes} {tranquilosNoMes === 1 ? "dia tranquilo" : "dias tranquilos"}</b> de {diaDoMes}.
          {crisesNoMes > 0 && ` Houve ${crisesNoMes} ${crisesNoMes === 1 ? "dia" : "dias"} mais dificeis, e faz parte.`}
        </p>
      </div>

      {/* registrar */}
      {!criseHoje && (
        registrando ? (
          <div className="space-y-2 rounded-suave bg-white/50 p-4 ring-1 ring-areia/60">
            <p className="text-sm text-carvao/70">Se quiser, anote o que voce sentiu ou o que te ajudou. So se fizer bem, e totalmente opcional.</p>
            <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3}
              placeholder="Opcional..." className="w-full rounded-lg bg-white/70 p-3 text-sm text-carvao outline-none ring-1 ring-areia placeholder:text-bruma" />
            <div className="flex gap-2">
              <button onClick={registrarCrise} className="rounded-lg bg-musgo px-4 py-2 text-sm font-medium text-creme transition hover:bg-salvia-escuro">Registrar</button>
              <button onClick={() => { setRegistrando(false); setNota(""); }} className="rounded-lg px-4 py-2 text-sm text-bruma transition hover:text-musgo">Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setRegistrando(true)} className="text-sm text-bruma underline transition hover:text-terracota">
            Tive uma crise hoje
          </button>
        )
      )}

      {/* historico acolhedor */}
      {crises.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-bruma">Dias que voce registrou ({crises.length})</summary>
          <ul className="mt-3 space-y-2">
            {crises.slice(0, 12).map((c) => (
              <li key={c.id} className="group rounded-suave bg-white/40 px-3 py-2 ring-1 ring-areia/40">
                <div className="flex items-center justify-between">
                  <span className="text-carvao">{new Date(c.dia + "T00:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}</span>
                  <button onClick={() => remover(c.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"><Trash2 size={14} /></button>
                </div>
                {c.nota && <p className="mt-1 text-carvao/60">{c.nota}</p>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/* ============================ REMEDIOS ============================ */
type Remedio = {
  id: string; nome: string; qtd_atual: number; por_dia: number; conferido_em: string; notas: string | null;
};

function Remedios() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [itens, setItens] = useState<Remedio[]>([]);
  const [nome, setNome] = useState("");
  const [qtd, setQtd] = useState("");
  const [porDia, setPorDia] = useState("1");
  const [editando, setEditando] = useState<string | null>(null);
  const [novaQtd, setNovaQtd] = useState("");

  async function carregar() {
    const { data } = await supabase.from("remedios").select("id, nome, qtd_atual, por_dia, conferido_em, notas").order("ordem");
    setItens((data as Remedio[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  function calcular(r: Remedio) {
    const consumido = Math.max(0, diasEntre(r.conferido_em, hojeISO())) * r.por_dia;
    const restante = Math.max(0, r.qtd_atual - consumido);
    const dias = Math.floor(restante / (r.por_dia || 1));
    const fim = new Date(); fim.setDate(fim.getDate() + dias);
    return { restante: Math.round(restante), dias, fim };
  }

  async function adicionar() {
    if (!nome.trim() || !uid) return;
    await supabase.from("remedios").insert({
      user_id: uid, nome: nome.trim(),
      qtd_atual: parseFloat(qtd.replace(",", ".")) || 0,
      por_dia: parseFloat(porDia.replace(",", ".")) || 1,
      conferido_em: hojeISO(), ordem: itens.length,
    });
    setNome(""); setQtd(""); setPorDia("1"); carregar();
  }
  async function atualizarQtd(r: Remedio) {
    const v = parseFloat(novaQtd.replace(",", "."));
    if (isNaN(v)) return;
    await supabase.from("remedios").update({ qtd_atual: v, conferido_em: hojeISO() }).eq("id", r.id);
    setEditando(null); setNovaQtd(""); carregar();
  }
  async function remover(id: string) {
    await supabase.from("remedios").delete().eq("id", id); carregar();
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-bruma">
        Pra nunca te pegar de surpresa. Diga quanto voce tem e quantos toma por dia, que o Raiz vai descontando sozinho e te avisa quando estiver acabando.
      </p>

      <div className="space-y-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do remedio"
          className="w-full rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma" />
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-bruma">Tenho</label>
          <input value={qtd} onChange={(e) => setQtd(e.target.value)} inputMode="decimal" placeholder="30"
            className="w-20 rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none" />
          <label className="text-xs text-bruma">comprimidos, tomo</label>
          <input value={porDia} onChange={(e) => setPorDia(e.target.value)} inputMode="decimal" placeholder="1"
            className="w-16 rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none" />
          <label className="text-xs text-bruma">por dia</label>
          <button onClick={adicionar} className="ml-auto rounded-lg bg-salvia p-2 text-creme transition hover:bg-salvia-escuro"><Plus size={18} /></button>
        </div>
      </div>

      <ul className="space-y-2">
        {itens.map((r) => {
          const { restante, dias, fim } = calcular(r);
          const acabando = dias <= 7;
          const acabou = restante <= 0;
          return (
            <li key={r.id} className={`group rounded-suave bg-white/50 p-4 ring-1 ${acabando ? "ring-terracota/40" : "ring-areia/50"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-musgo">{r.nome}</p>
                  <p className="mt-0.5 text-sm text-carvao/60">{r.por_dia} por dia</p>
                </div>
                <button onClick={() => remover(r.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"><Trash2 size={16} /></button>
              </div>

              <div className={`mt-3 flex items-center gap-2 text-sm ${acabando ? "text-terracota" : "text-salvia-escuro"}`}>
                {acabando && <AlertTriangle size={15} />}
                {acabou ? (
                  <span>Provavelmente ja acabou. Hora de repor.</span>
                ) : (
                  <span>
                    Restam cerca de <b>{restante}</b>, pra mais <b>{dias} {dias === 1 ? "dia" : "dias"}</b>.
                    Acaba por volta de {fim.toLocaleDateString("pt-BR")}.
                    {acabando && " Vale renovar a receita."}
                  </span>
                )}
              </div>

              {editando === r.id ? (
                <div className="mt-3 flex items-center gap-2">
                  <input value={novaQtd} onChange={(e) => setNovaQtd(e.target.value)} inputMode="decimal" placeholder="quantos tem agora"
                    className="w-40 rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none" />
                  <button onClick={() => atualizarQtd(r)} className="rounded-lg bg-musgo px-3 py-1.5 text-sm text-creme transition hover:bg-salvia-escuro">Salvar</button>
                  <button onClick={() => setEditando(null)} className="text-sm text-bruma">Cancelar</button>
                </div>
              ) : (
                <button onClick={() => { setEditando(r.id); setNovaQtd(String(restante)); }}
                  className="mt-2 flex items-center gap-1.5 text-xs text-bruma transition hover:text-musgo">
                  <RefreshCw size={12} /> conferi / comprei mais, atualizar quantidade
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {itens.length === 0 && <p className="text-center text-bruma">Cadastre seus remedios aqui em cima pra eu cuidar do prazo com voce.</p>}
    </div>
  );
}

/* ========================= ESPIRITUALIDADE ========================= */
type Pratica = { id: string; titulo: string; frequencia: Freq; concluido_em: string | null };
type Grat = { id: string; texto: string; criado_em: string };

function Espiritualidade() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [praticas, setPraticas] = useState<Pratica[]>([]);
  const [gratidoes, setGratidoes] = useState<Grat[]>([]);
  const [novaPratica, setNovaPratica] = useState("");
  const [freq, setFreq] = useState<Freq>("diaria");
  const [novaGrat, setNovaGrat] = useState("");

  async function carregar() {
    const [p, g] = await Promise.all([
      supabase.from("praticas_espirituais").select("id, titulo, frequencia, concluido_em").order("ordem"),
      supabase.from("gratidao").select("id, texto, criado_em").order("criado_em", { ascending: false }).limit(20),
    ]);
    setPraticas((p.data as Pratica[]) ?? []);
    setGratidoes((g.data as Grat[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function addPratica() {
    if (!novaPratica.trim() || !uid) return;
    await supabase.from("praticas_espirituais").insert({ user_id: uid, titulo: novaPratica.trim(), frequencia: freq, ordem: praticas.length });
    setNovaPratica(""); carregar();
  }
  async function alternar(p: Pratica) {
    const feito = feitaNoPeriodo(p.frequencia, p.concluido_em);
    await supabase.from("praticas_espirituais").update({ concluido_em: feito ? null : new Date().toISOString() }).eq("id", p.id);
    carregar();
  }
  async function removerPratica(id: string) {
    await supabase.from("praticas_espirituais").delete().eq("id", id); carregar();
  }
  async function addGrat() {
    if (!novaGrat.trim() || !uid) return;
    await supabase.from("gratidao").insert({ user_id: uid, texto: novaGrat.trim() });
    setNovaGrat(""); carregar();
  }
  async function removerGrat(id: string) {
    await supabase.from("gratidao").delete().eq("id", id); carregar();
  }

  return (
    <div className="space-y-7">
      {/* praticas */}
      <div>
        <h3 className="mb-2 font-display text-lg text-musgo">Minhas praticas</h3>
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
          <input value={novaPratica} onChange={(e) => setNovaPratica(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPratica()}
            placeholder="Ex: oracao, leitura, meditar, ir a comunidade de fe..."
            className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma" />
          <select value={freq} onChange={(e) => setFreq(e.target.value as Freq)}
            className="rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none">
            {ORDEM_FREQ.map((f) => <option key={f} value={f}>{ROTULO_FREQ[f]}</option>)}
          </select>
          <button onClick={addPratica} className="rounded-lg bg-salvia p-2 text-creme transition hover:bg-salvia-escuro"><Plus size={18} /></button>
        </div>
        {praticas.length === 0 ? (
          <p className="text-center text-sm text-bruma">Adicione as praticas que te conectam e te sustentam, do seu jeito.</p>
        ) : (
          <ul className="space-y-1.5">
            {praticas.map((p) => {
              const feito = feitaNoPeriodo(p.frequencia, p.concluido_em);
              return (
                <li key={p.id} className="group flex items-center gap-3 rounded-suave bg-white/50 px-3 py-2.5 ring-1 ring-areia/50">
                  <button onClick={() => alternar(p)}
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border transition ${feito ? "border-salvia bg-salvia text-creme" : "border-bruma/50 hover:border-salvia"}`}>
                    {feito && <Check size={15} />}
                  </button>
                  <span className={`flex-1 text-[15px] ${feito ? "text-bruma line-through" : "text-carvao"}`}>{p.titulo}</span>
                  <span className="rounded-full bg-areia/60 px-2 py-0.5 text-[10px] uppercase text-bruma">{ROTULO_FREQ[p.frequencia]}</span>
                  <button onClick={() => removerPratica(p.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"><Trash2 size={16} /></button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* gratidao */}
      <div>
        <h3 className="mb-2 font-display text-lg text-musgo">Diario de gratidao</h3>
        <p className="mb-3 text-sm text-bruma">Um lugar leve pra registrar o que te fez bem. Sem regra, quando quiser.</p>
        <div className="mb-3 flex items-center gap-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
          <input value={novaGrat} onChange={(e) => setNovaGrat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGrat()}
            placeholder="Hoje sou grata por..."
            className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma" />
          <button onClick={addGrat} className="rounded-lg bg-salvia p-2 text-creme transition hover:bg-salvia-escuro"><Plus size={18} /></button>
        </div>
        <ul className="space-y-2">
          {gratidoes.map((g) => (
            <li key={g.id} className="group rounded-suave bg-white/40 px-4 py-3 ring-1 ring-areia/40">
              <div className="flex items-start justify-between gap-3">
                <p className="flex-1 text-carvao">{g.texto}</p>
                <button onClick={() => removerGrat(g.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"><Trash2 size={14} /></button>
              </div>
              <p className="mt-1 text-xs text-bruma">{new Date(g.criado_em).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
