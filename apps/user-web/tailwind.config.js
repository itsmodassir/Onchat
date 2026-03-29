/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        surface: "#0f172a",
        primary: "#6366f1",
        secondary: "#ec4899",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
