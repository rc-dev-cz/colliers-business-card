/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        colliers: {
          primary: '#25408F',
          'primary-hover': '#1A2E6E',
          muted: '#4A4A4A',
          app: '#f8f9fa',
          border: '#e5e7eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Open Sans', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
