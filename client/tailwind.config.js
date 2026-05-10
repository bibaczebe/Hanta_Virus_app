/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        financial: {
          navy: '#0a0e27',
          charcoal: '#1a1f3a',
          card: '#161b35',
          gold: '#d4af37',
          silver: '#c0c0c0',
          slate: '#4a5568',
          text: '#f5f5f7',
          muted: '#a0aec0',
        },
        virus: {
          red: '#e63946',
          orange: '#ff8c00',
          yellow: '#ffd60a',
          safe: '#06d6a0',
          teal: '#00b4d8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(192, 192, 192, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};
