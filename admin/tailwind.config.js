/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          500: '#5b53ff',
          600: '#483fe6',
        }
      }
    },
  },
  plugins: [],
}
