import {
  HeartPulse,
  Sprout,
  Home,
  Wallet,
  BookOpen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type Pilar = {
  slug: string;
  nome: string;
  descricao: string;
  icone: LucideIcon;
  // areas da vida que vivem dentro deste pilar (vamos montar cada uma juntas)
  areas: string[];
};

export const PILARES: Pilar[] = [
  {
    slug: "corpo",
    nome: "Corpo",
    descricao: "Sua saude fisica e o jeito que voce se cuida por fora",
    icone: HeartPulse,
    areas: ["Saude", "Medicos", "Academia e exercicios", "Alimentacao", "Beleza"],
  },
  {
    slug: "mente-espirito",
    nome: "Mente e Espirito",
    descricao: "Seu mundo interior, o que te acalma e te sustenta",
    icone: Sprout,
    areas: ["Saude mental", "Religiao e espiritualidade", "Leitura reflexiva"],
  },
  {
    slug: "casa",
    nome: "Casa",
    descricao: "Seu espaco, sua rotina e o que mantem tudo girando",
    icone: Home,
    areas: ["Organizacao da casa", "Limpeza", "Mercado e estoque"],
  },
  {
    slug: "financas-metas",
    nome: "Financas e Metas",
    descricao: "Sua liberdade financeira e os objetivos que voce persegue",
    icone: Wallet,
    areas: ["Metas financeiras", "Metas pessoais"],
  },
  {
    slug: "crescimento",
    nome: "Crescimento",
    descricao: "Quem voce esta se tornando, o que aprende e onde quer chegar",
    icone: BookOpen,
    areas: ["Educacao", "Sonhos"],
  },
  {
    slug: "prazeres",
    nome: "Prazeres",
    descricao: "O que te faz bem so porque sim",
    icone: Sparkles,
    areas: ["Hobbies", "Series e filmes", "Leitura por prazer"],
  },
];

export const getPilar = (slug: string) => PILARES.find((p) => p.slug === slug);
