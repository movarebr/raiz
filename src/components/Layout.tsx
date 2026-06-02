import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutGrid, LogOut } from "lucide-react";
import { PILARES } from "../pillars";
import { useAuth } from "../lib/auth";

const itens = [
  { slug: "", nome: "Inicio", icone: LayoutGrid, descricao: "" },
  ...PILARES.map((p) => ({
    slug: p.slug,
    nome: p.nome,
    icone: p.icone,
    descricao: p.descricao,
  })),
];

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Layout() {
  const { sair } = useAuth();
  const loc = useLocation();

  return (
    <div className="min-h-full md:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-72 flex-col gap-2 border-r border-areia/70 bg-creme/60 px-5 py-7 backdrop-blur">
        <div className="px-2 pb-4">
          <p className="font-display text-3xl leading-none text-musgo">Raiz</p>
          <p className="mt-1 text-sm text-bruma">{saudacao()}, Agatha</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {itens.map((item) => {
            const to = item.slug ? `/${item.slug}` : "/";
            const Icone = item.icone;
            return (
              <NavLink
                key={item.slug || "inicio"}
                to={to}
                end={!item.slug}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-suave px-3 py-2.5 transition ${
                    isActive
                      ? "bg-salvia/20 text-musgo"
                      : "text-carvao/70 hover:bg-areia/60 hover:text-musgo"
                  }`
                }
              >
                <Icone size={20} strokeWidth={1.8} />
                <span className="text-[15px] font-medium">{item.nome}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={sair}
          className="mt-2 flex items-center gap-3 rounded-suave px-3 py-2.5 text-carvao/60 transition hover:bg-areia/60 hover:text-terracota"
        >
          <LogOut size={20} strokeWidth={1.8} />
          <span className="text-[15px] font-medium">Sair</span>
        </button>
      </aside>

      {/* Conteudo */}
      <main className="flex-1 px-5 pb-28 pt-7 md:px-10 md:pb-10 md:pt-10">
        <div className="mx-auto w-full max-w-5xl" key={loc.pathname}>
          <Outlet />
        </div>
      </main>

      {/* Navegacao inferior (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-areia/70 bg-creme/95 px-1 py-2 backdrop-blur md:hidden">
        {itens.map((item) => {
          const to = item.slug ? `/${item.slug}` : "/";
          const Icone = item.icone;
          return (
            <NavLink
              key={item.slug || "inicio"}
              to={to}
              end={!item.slug}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition ${
                  isActive ? "text-salvia-escuro" : "text-bruma"
                }`
              }
            >
              <Icone size={21} strokeWidth={1.8} />
              <span className="text-[10px] font-medium leading-none">
                {item.nome.split(" ")[0]}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
