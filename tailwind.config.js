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
        // Semantic tokens backed by CSS variables in src/index.css (one place to retheme).
        hy: {
          'bg': 'rgb(var(--hy-bg) / <alpha-value>)',
          'bg-2': 'rgb(var(--hy-bg-2) / <alpha-value>)',
          'surface': 'rgb(var(--hy-surface) / <alpha-value>)',
          'surface-hover': 'rgb(var(--hy-surface-hover) / <alpha-value>)',
          'elevated': 'rgb(var(--hy-elevated) / <alpha-value>)',
          'border': 'rgb(var(--hy-border) / <alpha-value>)',
          'text': 'rgb(var(--hy-text) / <alpha-value>)',
          'text-2': 'rgb(var(--hy-text-2) / <alpha-value>)',
          'text-3': 'rgb(var(--hy-text-3) / <alpha-value>)',
          'primary': 'rgb(var(--hy-primary) / <alpha-value>)',
          'primary-hover': 'rgb(var(--hy-primary-hover) / <alpha-value>)',
          'on-primary': 'rgb(var(--hy-on-primary) / <alpha-value>)',
          'volt': 'rgb(var(--hy-volt) / <alpha-value>)',
          'success': 'rgb(var(--hy-success) / <alpha-value>)',
          'warning': 'rgb(var(--hy-warning) / <alpha-value>)',
          'danger': 'rgb(var(--hy-danger) / <alpha-value>)',
          'orange': 'rgb(var(--hy-orange) / <alpha-value>)',
        },
      },
      fontFamily: {
        // System fonts: always available offline, no network font requests.
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        heading: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', '"Roboto Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
