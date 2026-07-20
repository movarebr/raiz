import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, Check, MapPin, Home, ListChecks, Wallet,
  CalendarHeart, Pencil,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import {
  SEMENTE_MUDANCA_FASES, SEMENTE_MUDANCA_CHECKLIST,
} from "../data/seeds";

const hojeISO = () => new Date().toISOString().slice(0, 10);
const brl = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const DATA_PADRAO = "2027-04-30";

const ABAS = [
  { id: "passos", rotulo: "Passo a passo", icone: MapPin },
  { id: "tarefas", rotulo: "Tarefas", icone: ListChecks },
  { id: "custos", rotulo: "Custos", icone: Wallet },
] as const;

export default function MudancaPage() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [aba, setAba] = useState<(typeof ABAS)[number]["id"]>("passos");
  const [dataAlvo, setDataAlvo] = useState<string | null>(null);
  const [editandoData, setEditandoData] = useState(false);
  const [rascunhoData, setRascunhoData] = useState("");

  async function carregarData() {
    const { data } = await supabase.from("config_usuario").select("valor").eq("chave", "mudanca_data").maybeSingle();
    if (data?.valor) {
      setDataAlvo(data.valor);
    } else if (uid) {
      // primeira visita: ja deixa a meta em abril de 2027 (voce ajusta)
      await supabase.from("config_usuario").upsert(
        { user_id: uid, chave: "mudanca_data", valor: DATA_PADRAO, atualizado_em: new Date().toISOString() },
        { onConflict: "user_id,chave" }
      );
      setDataAlvo(DATA_PADRAO);
    }
  }
  useEffect(() => { carregarData(); /* eslint-disable-next-line */ }, []);

  async function salvarData() {
    if (!uid) return;
    await supabase.from("config_usuario").upsert(
      { user_id: uid, chave: "mudanca_data", valor: rascunhoData || null, atualizado_em: new Date().toISOString() },
      { onConflict: "user_id,chave" }
    );
    setDataAlvo(rascunhoData || null); setEditandoData(false);
  }

  const diasFaltam = useMemo(() => {
    if (!dataAlvo) return null;
    return Math.ceil((new Date(dataAlvo + "T00:00:00").getTime() - new Date(hojeISO() + "T00:00:00").getTime()) / 86400000);
  }, [dataAlvo]);

  return (
    <div className="animar-surgir space-y-7">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-bruma transition hover:text-musgo">
        <ArrowLeft size={16} /> Inicio
      </Link>

      <header className="overflow-hidden rounded-suave bg-gradient-to-br from-salvia/20 to-terracota/10 p-6 ring-1 ring-salvia/20">
        <div className="flex items-center gap-2 text-salvia-escuro">
          <Home size={18} /> <span className="text-sm uppercase tracking-wide">Meu proximo capitulo</span>
        </div>
        <h1 className="mt-1 font-display text-4xl text-musgo">Mudanca pra Irece</h1>

        {editandoData ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input type="date" value={rascunhoData} onChange={(e) => setRascunhoData(e.target.value)}
              className="rounded-lg border border-areia bg-white/80 px-3 py-2 text-sm text-carvao outline-none" />
            <button onClick={salvarData} className="rounded-lg bg-musgo px-4 py-2 text-sm font-medium text-creme transition hover:bg-salvia-escuro">Salvar</button>
            <button onClick={() => setEditandoData(false)} className="text-sm text-bruma">Cancelar</button>
          </div>
        ) : dataAlvo && diasFaltam !== null ? (
          <div className="mt-3 flex items-center gap-3">
            <CalendarHeart size={20} className="text-terracota" />
            <p className="text-carvao">
              {diasFaltam > 0 ? <>Faltam <b className="text-musgo">{diasFaltam} dias</b> pra virar essa pagina.</>
                : diasFaltam === 0 ? <b className="text-musgo">E hoje. Bem-vinda a Irece.</b>
                : <>Que essa nova fase esteja sendo linda.</>}
              <button onClick={() => { setRascunhoData(dataAlvo); setEditandoData(true); }} className="ml-2 text-bruma underline transition hover:text-musgo">
                <Pencil size={12} className="inline" /> mudar
              </button>
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-carvao/70">Sem data marcada ainda.</p>
            <button onClick={() => { setRascunhoData(DATA_PADRAO); setEditandoData(true); }}
              className="mt-2 rounded-lg bg-white/70 px-4 py-2 text-sm font-medium text-musgo ring-1 ring-salvia/30 transition hover:bg-white">
              Definir a data
            </button>
          </div>
        )}
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

      {aba === "passos" && <Passos uid={uid} />}
      {aba === "tarefas" && <Tarefas uid={uid} />}
      {aba === "custos" && <Custos uid={uid} />}
    </div>
  );
}

/* ============================ PASSO A PASSO (fases) ============================ */
type Fase = { id: string; titulo: string; periodo: string | null; descricao: string | null; feito: boolean };

function Passos({ uid }: { uid?: string }) {
  const [itens, setItens] = useState<Fase[]>([]);

  async function carregar() {
    const { data } = await supabase.from("mudanca_fases").select("id, titulo, periodo, descricao, feito").order("ordem");
    setItens((data as Fase[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function alternar(f: Fase) {
    await supabase.from("mudanca_fases").update({ feito: !f.feito }).eq("id", f.id); carregar();
  }
  async function remover(id: string) {
    await supabase.from("mudanca_fases").delete().eq("id", id); carregar();
  }
  async function semear() {
    if (!uid) return;
    await supabase.from("mudanca_fases").insert(
      SEMENTE_MUDANCA_FASES.map((f, i) => ({ user_id: uid, titulo: f.titulo, periodo: f.periodo, descricao: f.descricao, ordem: i }))
    );
    carregar();
  }

  if (itens.length === 0) {
    return (
      <div className="rounded-suave border border-dashed border-salvia/40 bg-white/40 p-8 text-center">
        <p className="font-display text-xl text-musgo">Quer comecar com o plano das 4 fases?</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-bruma">Da pesquisa ate a mudanca, com os prazos que a gente conversou. Voce ajusta tudo depois.</p>
        <button onClick={semear} className="mt-5 rounded-suave bg-musgo px-5 py-2.5 font-medium text-creme transition hover:bg-salvia-escuro">
          Trazer o plano das fases
        </button>
      </div>
    );
  }

  const feitas = itens.filter((f) => f.feito).length;

  return (
    <div className="space-y-5">
      <p className="text-sm text-salvia-escuro">{feitas} de {itens.length} fases concluidas. Um passo de cada vez.</p>
      <ol className="relative space-y-3 border-l-2 border-salvia/25 pl-6">
        {itens.map((f, idx) => (
          <li key={f.id} className="group relative">
            <span className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition ${f.feito ? "bg-salvia text-creme" : "bg-areia text-musgo"}`}>
              {f.feito ? <Check size={13} /> : idx + 1}
            </span>
            <div className="rounded-suave bg-white/50 p-4 ring-1 ring-areia/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-display text-lg ${f.feito ? "text-bruma line-through" : "text-musgo"}`}>{f.titulo}</p>
                  {f.periodo && <p className="text-sm text-salvia-escuro">{f.periodo}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => alternar(f)} title="marcar fase"
                    className={`flex h-6 w-6 items-center justify-center rounded-md border transition ${f.feito ? "border-salvia bg-salvia text-creme" : "border-bruma/50 hover:border-salvia"}`}>
                    {f.feito && <Check size={14} />}
                  </button>
                  <button onClick={() => remover(f.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"><Trash2 size={15} /></button>
                </div>
              </div>
              {f.descricao && <p className="mt-2 text-sm text-carvao/60">{f.descricao}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ============================ TAREFAS ============================ */
type Item = { id: string; titulo: string; feito: boolean };

function Tarefas({ uid }: { uid?: string }) {
  const [itens, setItens] = useState<Item[]>([]);
  const [novo, setNovo] = useState("");

  async function carregar() {
    const { data } = await supabase.from("mudanca_checklist").select("id, titulo, feito").order("ordem");
    setItens((data as Item[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function alternar(i: Item) {
    await supabase.from("mudanca_checklist").update({ feito: !i.feito }).eq("id", i.id); carregar();
  }
  async function adicionar() {
    if (!novo.trim() || !uid) return;
    await supabase.from("mudanca_checklist").insert({ user_id: uid, titulo: novo.trim(), ordem: itens.length });
    setNovo(""); carregar();
  }
  async function remover(id: string) {
    await supabase.from("mudanca_checklist").delete().eq("id", id); carregar();
  }
  async function semear() {
    if (!uid) return;
    await supabase.from("mudanca_checklist").insert(
      SEMENTE_MUDANCA_CHECKLIST.map((titulo, i) => ({ user_id: uid, titulo, ordem: i }))
    );
    carregar();
  }

  if (itens.length === 0) {
    return (
      <div className="rounded-suave border border-dashed border-salvia/40 bg-white/40 p-8 text-center">
        <p className="font-display text-xl text-musgo">Comecar com a lista de tarefas?</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-bruma">As coisas concretas pra resolver, da internet ao home office. Voce adiciona as suas depois.</p>
        <button onClick={semear} className="mt-5 rounded-suave bg-musgo px-5 py-2.5 font-medium text-creme transition hover:bg-salvia-escuro">
          Trazer a lista de tarefas
        </button>
      </div>
    );
  }

  const feitos = itens.filter((i) => i.feito).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-salvia-escuro">{feitos} de {itens.length} resolvidos. Cada um te deixa mais perto.</p>
      <div className="flex items-center gap-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
        <input value={novo} onChange={(e) => setNovo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Adicionar tarefa da mudanca..." className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma" />
        <button onClick={adicionar} className="rounded-lg bg-salvia p-2 text-creme transition hover:bg-salvia-escuro"><Plus size={18} /></button>
      </div>
      <ul className="space-y-1.5">
        {itens.map((i) => (
          <li key={i.id} className="group flex items-center gap-3 rounded-suave bg-white/50 px-3 py-2.5 ring-1 ring-areia/50">
            <button onClick={() => alternar(i)}
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border transition ${i.feito ? "border-salvia bg-salvia text-creme" : "border-bruma/50 hover:border-salvia"}`}>
              {i.feito && <Check size={15} />}
            </button>
            <span className={`flex-1 text-[15px] ${i.feito ? "text-bruma line-through" : "text-carvao"}`}>{i.titulo}</span>
            <button onClick={() => remover(i.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* =========================== CUSTOS =========================== */
type Gasto = { id: string; categoria: string; descricao: string; valor: number };
const CATEGORIAS = ["Transportadora", "Moradia", "Moveis e eletro", "Documentos e taxas", "Reserva e imprevistos", "Outros"];

function Custos({ uid }: { uid?: string }) {
  const [itens, setItens] = useState<Gasto[]>([]);
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  async function carregar() {
    const { data } = await supabase.from("mudanca_orcamento").select("id, categoria, descricao, valor").order("criado_em");
    setItens((data as Gasto[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function adicionar() {
    if (!descricao.trim() || !uid) return;
    await supabase.from("mudanca_orcamento").insert({
      user_id: uid, categoria, descricao: descricao.trim(), valor: parseFloat(valor.replace(",", ".")) || 0,
    });
    setDescricao(""); setValor(""); carregar();
  }
  async function remover(id: string) {
    await supabase.from("mudanca_orcamento").delete().eq("id", id); carregar();
  }

  const total = itens.reduce((s, g) => s + Number(g.valor), 0);
  const porCategoria = CATEGORIAS.map((c) => ({
    categoria: c,
    itens: itens.filter((g) => g.categoria === c),
    subtotal: itens.filter((g) => g.categoria === c).reduce((s, g) => s + Number(g.valor), 0),
  })).filter((g) => g.itens.length > 0);

  return (
    <div className="space-y-5">
      <div className="rounded-suave bg-salvia/15 p-5 text-center ring-1 ring-salvia/25">
        <p className="text-sm uppercase tracking-wide text-salvia-escuro">Custo estimado da mudanca</p>
        <p className="font-display text-4xl text-musgo">R$ {brl(total)}</p>
      </div>

      <div className="space-y-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
        <div className="flex flex-wrap items-center gap-2">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
            className="rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none">
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()}
            placeholder="Descricao" className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma" />
          <input value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" placeholder="R$"
            className="w-24 rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none" />
          <button onClick={adicionar} className="rounded-lg bg-salvia p-2 text-creme transition hover:bg-salvia-escuro"><Plus size={18} /></button>
        </div>
      </div>

      {porCategoria.length === 0 ? (
        <p className="text-center text-sm text-bruma">Vai somando aqui o que voce estima gastar com a mudanca.</p>
      ) : (
        <div className="space-y-4">
          {porCategoria.map((grupo) => (
            <div key={grupo.categoria}>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-bruma">{grupo.categoria}</h3>
                <span className="text-xs text-salvia-escuro">R$ {brl(grupo.subtotal)}</span>
              </div>
              <ul className="space-y-1">
                {grupo.itens.map((g) => (
                  <li key={g.id} className="group flex items-center justify-between rounded-suave bg-white/50 px-3 py-2 ring-1 ring-areia/50">
                    <span className="text-[15px] text-carvao">{g.descricao}</span>
                    <span className="flex items-center gap-3 text-sm text-carvao">
                      R$ {brl(Number(g.valor))}
                      <button onClick={() => remover(g.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"><Trash2 size={14} /></button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
