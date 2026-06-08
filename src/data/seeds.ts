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

// SKINCARE: rotina de partida (voce ajusta com os seus produtos)
export const SEMENTE_SKINCARE_MANHA: string[] = [
  "Limpar o rosto",
  "Hidratante",
  "Protetor solar",
];
export const SEMENTE_SKINCARE_NOITE: string[] = [
  "Limpar o rosto",
  "Tratamento",
  "Hidratante",
];

// ALIMENTACAO: habitos gentis pra equilibrar o doce (das nossas estrategias)
export const SEMENTE_ALIMENTACAO: string[] = [
  "Proteina e fibra nas refeicoes",
  "Beber agua ao longo do dia",
  "Comer devagar e sentada",
  "Doce so com prazer e presenca, sem automatico",
  "Dormir bem (o sono controla a fissura)",
];

// EUROTRIP: a Rota do Expresso (paradas pre-carregadas)
export type SementeParada = { pais: string; cidade: string; dias: number; deslocamento: string };
export const SEMENTE_EUROTRIP_PARADAS: SementeParada[] = [
  { pais: "Espanha", cidade: "Madri", dias: 5, deslocamento: "Chegada do Brasil. Adaptar ao fuso, comecar leve." },
  { pais: "Franca", cidade: "Paris", dias: 5, deslocamento: "Trem noturno ou voo rapido de Madri." },
  { pais: "Austria", cidade: "Viena", dias: 6, deslocamento: "Voo low cost de Paris." },
  { pais: "Eslovenia", cidade: "Liubliana", dias: 4, deslocamento: "Trem de Viena (cerca de 6h, rota cenica de Semmering)." },
  { pais: "Italia", cidade: "Toscana e Roma", dias: 10, deslocamento: "Via Veneza ou Trieste, depois trem ate a Toscana. Fim em Roma pro voo de volta." },
];

// EUROTRIP: checklist de preparacao
export const SEMENTE_EUROTRIP_CHECKLIST: string[] = [
  "Passaporte valido (ao menos 6 meses alem da viagem)",
  "ETIAS (obrigatorio pra brasileiros a partir do fim de 2026)",
  "Seguro viagem com cobertura na Europa",
  "eSIM ou chip internacional",
  "Cartao internacional e algum euro em especie",
  "Reservas de hospedagem das 5 paradas",
  "Passagens aereas e trens reservados",
  "Roupa de frio adequada (camadas, casaco bom)",
  "Comprovantes impressos (reservas, seguro, passagens)",
  "Adaptador de tomada europeu",
];
