/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        yujiro: '#8B0000', // Deep Red
        baki: '#FF4500', // Orange Red
        ohma: '#2F4F4F', // Dark Slate Gray
        jack: '#4B0082', // Indigo
        system: '#000000', // Void Black
      },
    },
  },
  plugins: [],
}
