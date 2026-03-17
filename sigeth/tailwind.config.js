/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hotel: {
          gold: '#B8860B',
          'gold-dark': '#996F0A',
          navy: '#2C3E50',
          cream: '#F5F3EF',
          paper: '#FAFAF7',
          border: '#E5E1DB',
          text: '#1A1A1A',
          'text-secondary': '#6B7280',
          success: '#2D7D46',
          danger: '#C53030',
          warning: '#D69E2E',
          info: '#2B6CB0',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Source Sans 3', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        xs: '0.7rem',
        sm: '0.8rem',
        base: '0.875rem',
        lg: '1rem',
        xl: '1.25rem',
      },
    },
  },
  plugins: [],
}
