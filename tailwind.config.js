const fg = require('fast-glob')
const fs = require('fs')
const path = require('path')

// Windows + folder names like "cataleya-residence+(3)" break Tailwind's absolute-path
// glob matching, so we read source files with relative globs and pass raw content.
const sourceFiles = fg.sync(
  [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './app/globals.css',
  ],
  { cwd: __dirname, absolute: true }
)

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: sourceFiles.map((file) => ({
    raw: fs.readFileSync(file, 'utf8'),
    extension: path.extname(file).slice(1) || 'html',
  })),
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A227',
          light: '#D9B44A',
          dark: '#A8841F',
          muted: 'rgba(201,162,39,0.20)',
        },
        champagne: {
          DEFAULT: '#F2E3C6',
          light: '#FAF5EC',
          dark: '#E8D0A9',
        },
        ivory: {
          DEFAULT: '#FAF8F4',
          warm: '#F5F0E8',
        },
        charcoal: {
          DEFAULT: '#1C1C1C',
          light: '#2E2E2E',
          muted: '#4A4A4A',
        },
        taupe: {
          DEFAULT: '#8B7355',
          light: '#A89070',
          pale: '#D4C4A8',
        },
        rosegold: '#B76E79',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 4px 40px rgba(0, 0, 0, 0.08)',
        'luxury-lg': '0 8px 60px rgba(0, 0, 0, 0.12)',
        card: '0 2px 20px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-in': 'slideIn 0.6s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
