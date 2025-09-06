/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff", // fondo blanco, cámbialo si querés otro color
        border: "#e5e7eb",     // gris claro, podés ajustarlo
      },
    },
  },
  plugins: [],
}
