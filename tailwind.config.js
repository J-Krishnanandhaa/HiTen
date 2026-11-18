/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        leap: {
          bg: '#12161A',
          card: '#1A2026',
          elevated: '#242C35',
          subtle: '#151B22',
          border: '#2D3748',
          blue: '#2979FF',
          'blue-hover': '#1C64F2',
          cyan: '#00E5FF',
          orange: '#FF6D00',
          green: '#00E676',
          red: '#FF3D00',
          amber: '#FF9100',
          textMuted: '#94A3B8',
        }
      },
      fontFamily: {
        heading: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['SF Mono', 'Roboto Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
