import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Taken from Katie's own logo: gold leaf + sage green on near-black.
        espresso: {
          950: '#0A0A09',
          900: '#141412',
          800: '#20201D',
          700: '#2E2E29',
          600: '#45443D',
          500: '#5F5E55',
          400: '#8A8880',
        },
        sage: {
          700: '#5A7256',
          600: '#6E8A69',
          500: '#89A383',
          400: '#A3BA9E',
          300: '#C2D3BE',
          200: '#DDE7DA',
        },
        gold: {
          700: '#8A6A14',
          600: '#A8821C',
          500: '#C9A227',
          400: '#D4AF37',
          300: '#E3C765',
          200: '#EFDFA5',
          100: '#F8EFD4',
        },
        cream: {
          50: '#FFFDF9',
          100: '#FBF7EF',
          200: '#F4EBDA',
          300: '#E8DAC0',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        glow: '0 0 60px -12px rgba(212, 175, 55, 0.45)',
        'glow-lg': '0 0 100px -20px rgba(212, 175, 55, 0.55)',
        lift: '0 20px 50px -20px rgba(10, 10, 9, 0.35)',
        'lift-sm': '0 10px 30px -12px rgba(10, 10, 9, 0.20)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(1.06)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 6s ease-in-out infinite',
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
