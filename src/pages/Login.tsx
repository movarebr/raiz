import { useState } from "react";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { entrarComEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"parado" | "enviando" | "enviado">("parado");
  const [erro, setErro] = useState<string | null>(null);

  async function enviar() {
    if (!email) return;
    setEstado("enviando");
    setErro(null);
    const { erro } = await entrarComEmail(email.trim());
    if (erro) {
      setErro(erro);
      setEstado("parado");
    } else {
      setEstado("enviado");
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm animar-surgir text-center">
        <p className="font-display text-5xl text-musgo">Raiz</p>
        <p className="mt-3 text-bruma">
          Seu espaco pra cuidar de voce, uma area de cada vez.
        </p>

        {estado === "enviado" ? (
          <div className="mt-10 rounded-suave bg-salvia/15 px-6 py-8 text-musgo">
            <p className="font-display text-xl">Olha o seu e-mail</p>
            <p className="mt-2 text-sm text-carvao/70">
              Mandei um link de acesso pra <b>{email}</b>. E so clicar e voce entra.
            </p>
          </div>
        ) : (
          <div className="mt-10 flex flex-col gap-3 text-left">
            <label className="text-sm font-medium text-carvao/70">Seu e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              placeholder="voce@email.com"
              className="rounded-suave border border-areia bg-white/70 px-4 py-3 text-carvao outline-none transition focus:border-salvia"
            />
            {erro && <p className="text-sm text-terracota">{erro}</p>}
            <button
              onClick={enviar}
              disabled={estado === "enviando"}
              className="mt-1 rounded-suave bg-musgo px-4 py-3 font-medium text-creme transition hover:bg-salvia-escuro disabled:opacity-60"
            >
              {estado === "enviando" ? "Enviando..." : "Receber link de acesso"}
            </button>
            <p className="mt-1 text-center text-xs text-bruma">
              Sem senha pra decorar. Voce recebe um link e entra.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
