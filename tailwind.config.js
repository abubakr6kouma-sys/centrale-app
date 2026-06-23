/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surface principale (Dashboard, Entry foncé, Landing noir)
        cream: '#faf8f4',
        creamdark: '#f3f0e9',
        ink: '#1a1a18',
        line: '#e6e2d9',
        linelight: '#f0ece3',
        muted: '#56544e',
        faint: '#a8a499',
        // Accent doré (catégorie Commercial / highlight Pro / IA)
        gold: {
          DEFAULT: '#b08968',
          text: '#8a6648',
          bg: '#efe6db',
          dark: '#c9b896',
        },
        // Catégories fixes (cf. sidebar dashboard)
        cat: {
          commercial: '#b08968',
          commercialText: '#8a6648',
          commercialBg: '#efe6db',
          support: '#7d8471',
          supportText: '#5f6b4f',
          supportBg: '#eaece2',
          admin: '#9a8c7a',
          adminText: '#8a7355',
          adminBg: '#f1ece1',
          urgent: '#b5524f',
          urgentText: '#a8423f',
          urgentBg: '#f5e4e3',
        },
        // Fond sombre (Landing, Entry)
        noir: '#0a0a0a',
        noirsoft: '#121211',
        noirline: 'rgba(245,243,238,0.1)',
        offwhite: '#f5f3ee',
      },
      fontFamily: {
        display: ['var(--font-sora)', 'sans-serif'],
        sans: ['var(--font-manrope)', 'sans-serif'],
        serif: ['var(--font-instrument)', 'serif'],
      },
      keyframes: {
        pulse2: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.9' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulse2: 'pulse2 1.8s infinite',
        breathe: 'breathe 2.6s ease-in-out infinite',
        float: 'float 8s ease-in-out infinite',
        rise: 'rise 1.2s 0.4s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}
