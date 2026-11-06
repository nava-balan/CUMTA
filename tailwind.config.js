/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // CHENNAI 360 & TRANSITPULSE
        c360: {
          accent: '#3A86FF',
          bg: '#0B132B',
          card: '#1C2541',
          cyan: '#00D4FF',
          text: '#F8FAFC',
          border: '#2A375E',
        },
        // WATERLINK
        waterlink: {
          primary: '#075B66',
          bg: '#042F40',
          card: '#075B66',
          btn: '#00A6A6',
          active: '#48D6C5',
          text: '#E8FFFA',
          border: '#0A7D8C',
        },
        // ROADWATCH
        roadwatch: {
          primary: '#FF6B00',
          bg: '#171717',
          card: '#303030',
          btn: '#FF6B00',
          warning: '#FFC145',
          text: '#FFF8ED',
          border: '#444444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.2)',
      },
      borderRadius: {
        DEFAULT: '4px',
        lg: '8px',
      },
    },
  },
  plugins: [],
};
