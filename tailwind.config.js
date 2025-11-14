/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primaryDark: "#0d0f18",
        primaryAoc: "#00c853",
        onLincesBlue: "#4db6ff"
      }
    }
  },
  plugins: []
};
