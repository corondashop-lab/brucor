/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,css}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f0f0f0",  // ejemplo
        foreground: "#111111",
        border: "#e5e7eb",
      },
    },
  },
  plugins: [],
}
