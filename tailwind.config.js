/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",

    "./src/**/*.{js,ts,jsx,tsx}", // <-- essentiel pour que Tailwind fonctionne dans /src
  ],
  theme: {
    extend: {},
  },
  plugins: [],

}
