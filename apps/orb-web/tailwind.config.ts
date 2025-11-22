import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-root': 'var(--bg-root)',
        'bg-surface': 'var(--bg-surface)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        accent: {
          orb: 'var(--accent-orb)',
          sol: 'var(--accent-sol)',
          te: 'var(--accent-te)',
          mav: 'var(--accent-mav)',
          luna: 'var(--accent-luna)',
          forge: 'var(--accent-forge)',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        orb: '0 10px 40px rgba(0, 163, 255, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
