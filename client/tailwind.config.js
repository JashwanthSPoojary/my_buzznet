/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        sans: ['Poppins', 'sans-serif'],
        heading: ['Inter', 'sans-serif'],
      },
      colors: {
        customGreen: '#2e8b49',
      },
      animation: {
        'marquee-right': 'marqueeRight 10s linear infinite', 
        'marquee-left': 'marqueeLeft 10s linear infinite',
      },
      keyframes: {
        marqueeRight: {
          '0%': { transform: 'translateX(100%)' },  // Start from right
          '100%': { transform: 'translateX(-100%)' }, // End at left
        },
        marqueeLeft: {
          '0%': { transform: 'translateX(-100%)' },  // Start from left
          '100%': { transform: 'translateX(100%)' }, // End at right
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
}
