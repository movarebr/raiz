// A lista do caderno da Agatha, pronta pra dar o primeiro empurrao.
// Quando uma area estiver vazia, o app oferece trazer isto aqui.

export type SementeTarefa = {
  titulo: string;
  frequencia: "diaria" | "semanal" | "mensal" | "pontual";
};

// ROTINA DA CASA (frequencias sao um chute carinhoso, voce ajusta livre)
export const SEMENTE_ROTINA: SementeTarefa[] = [
  { titulo: "Arrumar e guardar a roupa", frequencia: "semanal" },
  { titulo: "Passar pano e aspirador na casa", frequencia: "semanal" },
  { titulo: "Trocar lencois", frequencia: "semanal" },
  { titulo: "Limpar espelho", frequencia: "semanal" },
  { titulo: "Tirar poeira nas estantes", frequencia: "semanal" },
  { titulo: "Passar alcool na mesa", frequencia: "diaria" },
  { titulo: "Arrumar livros", frequencia: "mensal" },
  { titulo: "Desemaranhar a mochila", frequencia: "pontual" },
  { titulo: "Ajeitar as miudezas da minha mae", frequencia: "pontual" },
  { titulo: "Limpar a pia", frequencia: "diaria" },
  { titulo: "Limpar o fogao", frequencia: "diaria" },
  { titulo: "Passar aspirador no sofa", frequencia: "semanal" },
  { titulo: "Limpar e ajeitar os armarios", frequencia: "mensal" },
  { titulo: "Arrumar o rack", frequencia: "semanal" },
  { titulo: "Arrumar o cabideiro", frequencia: "mensal" },
];

// COMPRAS DA CASA (decoracao e melhorias)
export const SEMENTE_COMPRAS: string[] = [
  "Decoracoes de plantas",
  "Mini espelhos na parede",
  "Organizadores e cestos",
  "Organizador de armarios",
  "Quadros de parede",
  "Nichos de parede",
  "Porta-retratos e relogio de estante",
  "Itens retro para casa",
  "Tinta lavavel de parede",
  "Mesa de escritorio",
  "Itens melhores para os comodos",
  "Colchas de cama e itens de quarto",
];

// SONHOS E METAS PESSOAIS
export const SEMENTE_METAS_PESSOAIS: string[] = [
  "Tirar a carta categoria B",
  "Comprar um carro",
  "Viagem pro show da Demi Lovato",
  "Show do Coldplay",
  "Eurotrip",
  "Viagem a Itacare",
  "Comprar uma casa com quintal, 3 quartos, cozinha espacosa e piscina",
  "Casamento feliz, saudavel e companheiro",
  "Dois filhos (menino e menina)",
  "Fazendinha no interior",
  "Conhecer a Italia todinha",
  "Ter uma vida leve, saudavel e feliz",
  "Aprender espanhol",
];

// SONHOS E METAS PROFISSIONAIS
export const SEMENTE_METAS_PROFISSIONAIS: string[] = [
  "Estruturacao da empresa",
  "Ter um time engajado",
  "Clientes fixos e entrada mensal de novos clientes",
  "Ter um servico bom",
  "Escalonamento do negocio",
  "Constancia",
  "Venda de infoprodutos",
  "Aumento de faturamento",
  "Aparecer em jornal, TV e materias",
  "Ter um escritorio",
  "Ser uma boa chefe",
  "Ter as 3 vertentes ativas: Servico, Ensino e Produto",
];
