/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f172a', // slate-900 (ChatGPT-like dark)
          dark: '#0b1220', // darker variant
          light: '#1f2937', // gray-800
          accent: '#10b981', // emerald-500
          muted: '#94a3b8' // slate-400
        },
      },
    },
  },
  plugins: [],
}


