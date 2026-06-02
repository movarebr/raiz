/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta "Raiz": calma, acolhedora, de reconstrução.
        creme: "#F7F3EC", // fundo principal, off-white quente
        areia: "#EBE3D6", // superficies, cards suaves
        salvia: {
          DEFAULT: "#7C9082", // verde salvia, cor primaria
          escuro: "#5E7164", // variacao mais profunda
        },
        musgo: "#3A4A3D", // verde profundo, textos e titulos
        terracota: "#C4896A", // acento quente, destaques e CTAs
        carvao: "#2E332D", // texto principal
        bruma: "#9AA39A", // texto secundario, legendas
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        corpo: ["'Hanken Grotesk'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        suave: "1.25rem",
      },
      boxShadow: {
        suave: "0 4px 24px -8px rgba(58, 74, 61, 0.12)",
      },
    },
  },
  plugins: [],
};
