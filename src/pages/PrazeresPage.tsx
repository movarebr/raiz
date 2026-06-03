import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, Star, Film, BookOpen, Palette, Clapperboard,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";

const ABAS = [
  { id: "midias", rotulo: "Filmes e Series", icone: Clapperboard },
  { id: "leitura", rotulo: "Leitura", icone: BookOpen },
  { id: "hobbies", rotulo: "Hobbies", icone: Palette },
] as const;

export default function PrazeresPage() {
  const [aba, setAba] = useState<(typeof ABAS)[number]["id"]>("midias");
  return (
    <div className="animar-surgir space-y-7">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-bruma transition hover:text-musgo">
        <ArrowLeft size={16} /> Inicio
      </Link>
      <header>
        <h1 className="font-display text-4xl text-musgo">Prazeres</h1>
        <p className="text-bruma">O que te faz bem so porque sim</p>
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

      {aba === "midias" && <Midias />}
      {aba === "leitura" && <Leitura />}
      {aba === "hobbies" && <Hobbies />}
    </div>
  );
}

/* ---------- estrelinhas de avaliacao ---------- */
function Estrelas({ nota, onSet }: { nota: number | null; onSet: (n: number) => void }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onSet(nota === n ? 0 : n)} className="transition hover:scale-110">
          <Star size={15} className={n <= (nota ?? 0) ? "fill-terracota text-terracota" : "text-bruma/40"} />
        </button>
      ))}
    </span>
  );
}

/* ====================== FILMES E SERIES ====================== */
type Midia = {
  id: string; titulo: string; tipo: "filme" | "serie";
  status: "quero" | "assistindo" | "visto"; nota: number | null; onde: string | null;
};
const STATUS_MIDIA = [
  { id: "quero", rotulo: "Quero ver" },
  { id: "assistindo", rotulo: "Assistindo" },
  { id: "visto", rotulo: "Ja vi" },
] as const;

function Midias() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [itens, setItens] = useState<Midia[]>([]);
  const [filtro, setFiltro] = useState<"quero" | "assistindo" | "visto">("quero");
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<"filme" | "serie">("filme");

  async function carregar() {
    const { data } = await supabase.from("midias").select("id, titulo, tipo, status, nota, onde").order("criado_em", { ascending: false });
    setItens((data as Midia[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function adicionar() {
    if (!titulo.trim() || !uid) return;
    await supabase.from("midias").insert({ user_id: uid, titulo: titulo.trim(), tipo, status: filtro });
    setTitulo(""); carregar();
  }
  async function mudarStatus(m: Midia, status: Midia["status"]) {
    await supabase.from("midias").update({ status }).eq("id", m.id); carregar();
  }
  async function avaliar(m: Midia, nota: number) {
    await supabase.from("midias").update({ nota: nota || null }).eq("id", m.id); carregar();
  }
  async function remover(id: string) {
    await supabase.from("midias").delete().eq("id", id); carregar();
  }

  const lista = itens.filter((m) => m.status === filtro);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_MIDIA.map((s) => (
          <button key={s.id} onClick={() => setFiltro(s.id)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${filtro === s.id ? "bg-salvia/25 text-musgo ring-1 ring-salvia/40" : "bg-areia/40 text-bruma hover:bg-areia/70"}`}>
            {s.rotulo} <span className="text-xs">({itens.filter((m) => m.status === s.id).length})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Titulo do filme ou serie..." className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma" />
        <select value={tipo} onChange={(e) => setTipo(e.target.value as "filme" | "serie")}
          className="rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none">
          <option value="filme">Filme</option>
          <option value="serie">Serie</option>
        </select>
        <button onClick={adicionar} className="rounded-lg bg-salvia p-2 text-creme transition hover:bg-salvia-escuro"><Plus size={18} /></button>
      </div>

      {lista.length === 0 ? (
        <p className="text-center text-sm text-bruma">
          {filtro === "quero" ? "Anote o que voce quer assistir, pra nunca faltar opcao numa noite sua." : filtro === "assistindo" ? "Nada em andamento por aqui." : "O que voce ja viu vai aparecer aqui, com a sua nota."}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {lista.map((m) => (
            <li key={m.id} className="group flex flex-wrap items-center gap-3 rounded-suave bg-white/50 px-3 py-2.5 ring-1 ring-areia/50">
              <Film size={16} className="text-bruma" />
              <span className="flex-1 text-[15px] text-carvao">{m.titulo}</span>
              {m.status === "visto" && <Estrelas nota={m.nota} onSet={(n) => avaliar(m, n)} />}
              <select value={m.status} onChange={(e) => mudarStatus(m, e.target.value as Midia["status"])}
                className="rounded-lg bg-areia/40 px-2 py-1 text-xs text-carvao/70 outline-none">
                {STATUS_MIDIA.map((s) => <option key={s.id} value={s.id}>{s.rotulo}</option>)}
              </select>
              <button onClick={() => remover(m.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"><Trash2 size={15} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ========================== LEITURA ========================== */
type Livro = { id: string; titulo: string; autor: string | null; status: "quero" | "lendo" | "lido"; nota: number | null };
const STATUS_LIVRO = [
  { id: "quero", rotulo: "Quero ler" },
  { id: "lendo", rotulo: "Lendo" },
  { id: "lido", rotulo: "Lidos" },
] as const;

function Leitura() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [itens, setItens] = useState<Livro[]>([]);
  const [filtro, setFiltro] = useState<"quero" | "lendo" | "lido">("lendo");
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");

  async function carregar() {
    const { data } = await supabase.from("livros").select("id, titulo, autor, status, nota").order("criado_em", { ascending: false });
    setItens((data as Livro[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function adicionar() {
    if (!titulo.trim() || !uid) return;
    await supabase.from("livros").insert({ user_id: uid, titulo: titulo.trim(), autor: autor.trim() || null, status: filtro });
    setTitulo(""); setAutor(""); carregar();
  }
  async function mudarStatus(l: Livro, status: Livro["status"]) {
    await supabase.from("livros").update({ status }).eq("id", l.id); carregar();
  }
  async function avaliar(l: Livro, nota: number) {
    await supabase.from("livros").update({ nota: nota || null }).eq("id", l.id); carregar();
  }
  async function remover(id: string) {
    await supabase.from("livros").delete().eq("id", id); carregar();
  }

  const lista = itens.filter((l) => l.status === filtro);
  const anoAtual = new Date().getFullYear();
  const lidosAno = itens.filter((l) => l.status === "lido").length;

  return (
    <div className="space-y-4">
      {lidosAno > 0 && (
        <p className="text-sm text-salvia-escuro">Voce ja tem {lidosAno} {lidosAno === 1 ? "livro lido" : "livros lidos"} na sua estante. Que delicia.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {STATUS_LIVRO.map((s) => (
          <button key={s.id} onClick={() => setFiltro(s.id)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${filtro === s.id ? "bg-salvia/25 text-musgo ring-1 ring-salvia/40" : "bg-areia/40 text-bruma hover:bg-areia/70"}`}>
            {s.rotulo} <span className="text-xs">({itens.filter((l) => l.status === s.id).length})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Titulo do livro" className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma" />
        <input value={autor} onChange={(e) => setAutor(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Autor (opcional)" className="min-w-0 flex-1 rounded-lg border border-areia bg-white/70 px-2 py-1.5 text-sm text-carvao outline-none placeholder:text-bruma" />
        <button onClick={adicionar} className="rounded-lg bg-salvia p-2 text-creme transition hover:bg-salvia-escuro"><Plus size={18} /></button>
      </div>

      {lista.length === 0 ? (
        <p className="text-center text-sm text-bruma">
          {filtro === "quero" ? "Sua lista de desejos de leitura comeca aqui." : filtro === "lendo" ? "Nenhum livro em andamento agora." : "Os livros que voce terminar vao morar aqui, com a sua nota."}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {lista.map((l) => (
            <li key={l.id} className="group flex flex-wrap items-center gap-3 rounded-suave bg-white/50 px-3 py-2.5 ring-1 ring-areia/50">
              <BookOpen size={16} className="text-bruma" />
              <div className="flex-1">
                <span className="text-[15px] text-carvao">{l.titulo}</span>
                {l.autor && <span className="text-sm text-bruma"> · {l.autor}</span>}
              </div>
              {l.status === "lido" && <Estrelas nota={l.nota} onSet={(n) => avaliar(l, n)} />}
              <select value={l.status} onChange={(e) => mudarStatus(l, e.target.value as Livro["status"])}
                className="rounded-lg bg-areia/40 px-2 py-1 text-xs text-carvao/70 outline-none">
                {STATUS_LIVRO.map((s) => <option key={s.id} value={s.id}>{s.rotulo}</option>)}
              </select>
              <button onClick={() => remover(l.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"><Trash2 size={15} /></button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-center text-xs text-bruma">Contando seus livros lidos desde sempre. {anoAtual} esta sendo um bom ano de leitura.</p>
    </div>
  );
}

/* ========================== HOBBIES ========================== */
type Hobby = { id: string; titulo: string; ultima_vez: string | null };

function Hobbies() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [itens, setItens] = useState<Hobby[]>([]);
  const [novo, setNovo] = useState("");

  async function carregar() {
    const { data } = await supabase.from("hobbies").select("id, titulo, ultima_vez").order("ordem");
    setItens((data as Hobby[]) ?? []);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function adicionar() {
    if (!novo.trim() || !uid) return;
    await supabase.from("hobbies").insert({ user_id: uid, titulo: novo.trim(), ordem: itens.length });
    setNovo(""); carregar();
  }
  async function pratiquei(h: Hobby) {
    await supabase.from("hobbies").update({ ultima_vez: new Date().toISOString() }).eq("id", h.id); carregar();
  }
  async function remover(id: string) {
    await supabase.from("hobbies").delete().eq("id", id); carregar();
  }

  function haQuantoTempo(iso: string | null) {
    if (!iso) return "ainda nao registrado";
    const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (dias === 0) return "voce se permitiu isso hoje";
    if (dias === 1) return "ontem";
    if (dias < 7) return `ha ${dias} dias`;
    if (dias < 30) return `ha ${Math.floor(dias / 7)} ${Math.floor(dias / 7) === 1 ? "semana" : "semanas"}`;
    return `ha um tempinho, que tal voltar?`;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-bruma">
        Seus hobbies e prazeres. A ideia aqui nao e cobrar, e o contrario: lembrar voce de se dar esses momentos. Quando praticar um, marca, so pra ver que voce esta se cuidando.
      </p>

      <div className="flex items-center gap-2 rounded-suave bg-white/50 p-3 ring-1 ring-areia/60">
        <input value={novo} onChange={(e) => setNovo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Ex: pintar, tocar, dancar, cozinhar, plantas..." className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-carvao outline-none placeholder:text-bruma" />
        <button onClick={adicionar} className="rounded-lg bg-salvia p-2 text-creme transition hover:bg-salvia-escuro"><Plus size={18} /></button>
      </div>

      {itens.length === 0 ? (
        <p className="text-center text-sm text-bruma">Quais coisas te fazem bem so porque sim? Comeca por uma.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {itens.map((h) => (
            <li key={h.id} className="group rounded-suave bg-white/50 p-4 ring-1 ring-areia/50">
              <div className="flex items-start justify-between">
                <p className="font-medium text-musgo">{h.titulo}</p>
                <button onClick={() => remover(h.id)} className="text-bruma opacity-0 transition hover:text-terracota group-hover:opacity-100"><Trash2 size={15} /></button>
              </div>
              <p className="mt-0.5 text-xs text-bruma">{haQuantoTempo(h.ultima_vez)}</p>
              <button onClick={() => pratiquei(h)} className="mt-3 rounded-lg bg-salvia/15 px-3 py-1.5 text-xs font-medium text-salvia-escuro transition hover:bg-salvia/25">
                Me permiti isso hoje
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
