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
        dark: {
          bg: '#0B0F17',
          card: '#111827',
          sidebar: '#0F1623',
          border: '#1F293D',
          hover: '#1B2436',
          muted: '#64748B'
        },
        strategy: {
          naive: '#F43F5E',       // Rose / Crimson Red
          naiveBg: '#2A121A',
          naiveBorder: '#4C1D2B',
          ring: '#F59E0B',        // Amber / Yellow-Gold
          ringBg: '#261B0B',
          ringBorder: '#483515',
          virtual: '#10B981',     // Emerald / Mint
          virtualBg: '#0D261F',
          virtualBorder: '#1A4D3E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace']
      }
    },
  },
  plugins: [],
}
