/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Un color morado/azul bonito para tu marca
        secondary: '#10B981', // Verde
      }
    },
  },
  plugins: [],
}