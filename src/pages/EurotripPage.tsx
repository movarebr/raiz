import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, Check, MapPin, Plane, ListChecks, Wallet,
  CalendarHeart, Pencil,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import {
  SEMENTE_EUROTRIP_PARADAS, SEMENTE_EUROTRIP_CHECKLIST,
} from "../data/seeds";

const hojeISO = () => new Date().toISOString().slice(0, 10);
const brl = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const ABAS = [
  { id: "roteiro", rotulo: "Roteiro", icone: MapPin },
  { id: "preparacao", rotulo: "Preparacao", icone: ListChecks },
  { id: "orcamento", rotulo: "Orcamento", icone: Wallet },
] as const;

export default function EurotripPage() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [aba, setAba] = useState<(typeof ABAS)[number]["id"]>("roteiro");
  const [dataAlvo, setDataAlvo] = useState<string | null>(null);
  const [editandoData, setEditandoData] = useState(false);
  const [rascunhoData, setRascunhoData] = useState("");

  async function carregarData() {
    const { data } = await supabase.from("config_usuario").select("valor").eq("chave", "eurotrip_data").maybeSingle();
    setDataAlvo(data?.valor ?? null);
  }
  useEffect(() => { carregarData(); /* eslint-disable-next-line */ }, []);

  async function salvarData() {
    if (!uid) return;
    await supabase.from("config_usuario").upsert(
      { user_id: uid, chave: "eurotrip_data", valor: rascunhoData || null, atualizado_em: new Date().toISOString() },
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

      {/* header com contagem */}
      <header className="overflow-hidden rounded-suave bg-gradient-to-br from-salvia/20 to-terracota/10 p-6 ring-1 ring-salvia/20">
        <div className="flex items-center gap-2 text-salvia-escuro">
          <Plane size={18} /> <span className="text-sm uppercase tracking-wide">Meu sonho</span>
        </div>
        <h1 className="mt-1 font-display text-4xl text-musgo">Eurotrip</h1>

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
              {diasFaltam > 0 ? <>Faltam <b className="text-musgo">{diasFaltam} dias</b> pra esse sonho.</>
                : diasFaltam === 0 ? <b className="text-musgo">E hoje! Boa viagem.</b>
                : <>Que viagem dos sonhos, espero que tenha sido linda.</>}
              <button onClick={() => { setRascunhoData(dataAlvo); setEditandoData(true); }} className="ml-2 text-bruma underline transition hover:text-musgo">
                <Pencil size={12} className="inline" /> mudar
              </button>
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-carvao/70">Ainda sem data, e ta tudo bem. Todo sonho comeca exatamente assim.</p>
            <button onClick={() => { setRascunhoData(""); setEditandoData(true); }}
              className="mt-2 rounded-lg bg-white/70 px-4 py-2 text-sm font-medium text-musgo ring-1 ring-salvia/30 transition hover:bg-white">
              Definir uma data, quando sentir
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

      {aba === "roteiro" && <Roteiro uid={uid} />}
      {aba === "preparacao" && <Preparacao uid={uid} />}
      {aba === "orcamento" && <Orcamento uid={uid} />}
    </div>
  );
}

/* ============================ ROTEIRO ============================ */
type Parada = { id: string; pais: string; cidade: string; dias: number; deslocamento: string | null; notas: string | null };

function Roteiro({ uid }: { uid?: string }) {
  const [itens, setItens] = useState<Parada[]>([]);
  const [pais, setPais] = useState("");
  const [cidade, setCidade] = useState("");
  const [dias, setDias] = useState("");

  async function carregar() {
    const { data } = await supabase.from("viagem_paradas").select("id, pais, cidade, dias, deslocamento, notas").order("ordem");
    setItens((data as Parada[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function adicionar() {
    if (!cidade.trim() || !uid) return;
    await supabase.from("viagem_paradas").insert({
      user_id: uid, pais: pais.trim() || "", cidade: cidade.trim(), dias: parseInt(dias) || 1, ordem: itens.length,
    });
    setPais(""); setCidade(""); setDias(""); carregar();
  }
  async function remover(id: string) {
    await supabase.from("viagem_paradas").delete().eq("id", id); carregar();
  }
  async function semear() {
    if (!uid) return;
    await supabase.from("viagem_paradas").insert(
      SEMENTE_EUROTRIP_PARADAS.map((p, i) => ({ user_id: uid, pais: p.pais, cidade: p.cidade, dias: p.dias, deslocamento: p.deslocamento, ordem: i }))
    );
    carregar();
  }

  const totalDias = itens.reduce((s, p) => s + p.dias, 0);

  if (itens.length === 0) {
    return (
      <div className="rounded-suave border border-dashed border-salvia/40 bg-white/40 p-8 text-center">
        <p className="font-display text-xl text-musgo">Quer comecar com a Rota do Expresso?</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-bruma">As 5 paradas que a gente conversou: Madri, Paris, Viena, Liubliana e a Italia. Voce ajusta tudo depois.</p>
        <button onClick={semear} className="mt-5 rounded-suave bg-musgo px-5 py-2.5 font-medium text-creme transition hover:bg-salvia-escuro">
          Trazer a Rota do Expresso
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-salvia-escuro">{itens.length} paradas, {totalDias} dias de viagem no total.</p>

      {/* timeline */}
      <ol className="relative space-y-3 border-l-2 border-salvia/25 pl-6">
        {itens.map((p, idx) => (
          <li key={p.id} className="group relative">
            <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-salvia text-xs font-bold text-creme">{idx + 1}</span>
            <div className="rounded-suave bg-white/50 p-4 ring-1 ring-areia/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg text-musgo">{p.cidade}<span className="text-base text-bruma"> · {p.pais}</span></p>
                  <p className="text-sm text-salvia-escuro">{p.dias} dias</p>
                </div>
                <button onClick={() => remover(p.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"><Trash2 size={16} /></button>
              </div>
              {p.deslocamento && <p className="mt-2 text-sm text-carvao/60">{p.deslocamento}</p>}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
        <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade"
          className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma" />
        <input value={pais} onChange={(e) => setPais(e.target.value)} placeholder="Pais"
          className="w-28 rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none" />
        <input value={dias} onChange={(e) => setDias(e.target.value)} inputMode="numeric" placeholder="dias"
          className="w-16 rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none" />
        <button onClick={adicionar} className="rounded-lg bg-salvia p-2 text-creme transition hover:bg-salvia-escuro"><Plus size={18} /></button>
      </div>
    </div>
  );
}

/* ========================== PREPARACAO ========================== */
type Item = { id: string; titulo: string; feito: boolean };

function Preparacao({ uid }: { uid?: string }) {
  const [itens, setItens] = useState<Item[]>([]);
  const [novo, setNovo] = useState("");

  async function carregar() {
    const { data } = await supabase.from("viagem_checklist").select("id, titulo, feito").order("ordem");
    setItens((data as Item[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function alternar(i: Item) {
    await supabase.from("viagem_checklist").update({ feito: !i.feito }).eq("id", i.id); carregar();
  }
  async function adicionar() {
    if (!novo.trim() || !uid) return;
    await supabase.from("viagem_checklist").insert({ user_id: uid, titulo: novo.trim(), ordem: itens.length });
    setNovo(""); carregar();
  }
  async function remover(id: string) {
    await supabase.from("viagem_checklist").delete().eq("id", id); carregar();
  }
  async function semear() {
    if (!uid) return;
    await supabase.from("viagem_checklist").insert(
      SEMENTE_EUROTRIP_CHECKLIST.map((titulo, i) => ({ user_id: uid, titulo, ordem: i }))
    );
    carregar();
  }

  if (itens.length === 0) {
    return (
      <div className="rounded-suave border border-dashed border-salvia/40 bg-white/40 p-8 text-center">
        <p className="font-display text-xl text-musgo">Comecar com a lista de preparacao?</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-bruma">Passaporte, ETIAS, seguro, eSIM e tudo que nao pode faltar pra uma viagem tranquila.</p>
        <button onClick={semear} className="mt-5 rounded-suave bg-musgo px-5 py-2.5 font-medium text-creme transition hover:bg-salvia-escuro">
          Trazer a lista de preparacao
        </button>
      </div>
    );
  }

  const feitos = itens.filter((i) => i.feito).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-salvia-escuro">{feitos} de {itens.length} prontos. Cada item te deixa mais perto e mais tranquila.</p>
      <div className="flex items-center gap-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
        <input value={novo} onChange={(e) => setNovo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Adicionar item de preparacao..." className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma" />
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

/* =========================== ORCAMENTO =========================== */
type Gasto = { id: string; categoria: string; descricao: string; valor: number };
const CATEGORIAS = ["Passagens aereas", "Trens e transporte", "Hospedagem", "Alimentacao", "Passeios", "Compras", "Outros"];

function Orcamento({ uid }: { uid?: string }) {
  const [itens, setItens] = useState<Gasto[]>([]);
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  async function carregar() {
    const { data } = await supabase.from("viagem_orcamento").select("id, categoria, descricao, valor").order("criado_em");
    setItens((data as Gasto[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function adicionar() {
    if (!descricao.trim() || !uid) return;
    await supabase.from("viagem_orcamento").insert({
      user_id: uid, categoria, descricao: descricao.trim(), valor: parseFloat(valor.replace(",", ".")) || 0,
    });
    setDescricao(""); setValor(""); carregar();
  }
  async function remover(id: string) {
    await supabase.from("viagem_orcamento").delete().eq("id", id); carregar();
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
        <p className="text-sm uppercase tracking-wide text-salvia-escuro">Estimativa total</p>
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
        <p className="text-center text-sm text-bruma">Vai somando aqui o que voce estima gastar. Escolha a categoria, descreva e ponha o valor.</p>
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
