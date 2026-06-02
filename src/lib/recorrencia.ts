// Logica gentil de recorrencia. Nada de "streak quebrado".
// So olhamos: dentro do periodo atual, essa tarefa ja foi feita?

type Freq = "diaria" | "semanal" | "mensal" | "pontual";

function mesmoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function mesmaSemana(a: Date, b: Date) {
  // semana comecando na segunda
  const inicio = (d: Date) => {
    const x = new Date(d);
    const dia = (x.getDay() + 6) % 7; // 0 = segunda
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - dia);
    return x.getTime();
  };
  return inicio(a) === inicio(b);
}

function mesmoMes(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// Uma tarefa esta "concluida no periodo atual"?
export function feitaNoPeriodo(frequencia: Freq, concluidoEm: string | null): boolean {
  if (!concluidoEm) return false;
  const feito = new Date(concluidoEm);
  const agora = new Date();
  switch (frequencia) {
    case "diaria":
      return mesmoDia(feito, agora);
    case "semanal":
      return mesmaSemana(feito, agora);
    case "mensal":
      return mesmoMes(feito, agora);
    case "pontual":
      return true; // feito uma vez, fica feito
  }
}

export const ROTULO_FREQ: Record<Freq, string> = {
  diaria: "Diaria",
  semanal: "Semanal",
  mensal: "Mensal",
  pontual: "Pontual",
};

export const ORDEM_FREQ: Freq[] = ["diaria", "semanal", "mensal", "pontual"];
