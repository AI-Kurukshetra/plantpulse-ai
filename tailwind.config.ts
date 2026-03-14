import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './services/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#08141f',
        slate: '#10283c',
        mist: '#d7e2eb',
        signal: '#1cc28a',
        amber: '#f3a712',
        danger: '#ff5d5d'
      },
      boxShadow: {
        panel: '0 20px 50px rgba(7, 15, 23, 0.18)'
      },
      backgroundImage: {
        'plant-grid': 'radial-gradient(circle at 1px 1px, rgba(215, 226, 235, 0.16) 1px, transparent 0)'
      }
    }
  },
  plugins: []
};

export default config;
