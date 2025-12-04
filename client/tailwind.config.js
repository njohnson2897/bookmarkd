/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary1: "#1cbbb4", // teal
        primary2: "#1a2e35", // dark blue
        accent: "#ff4f5a", // accent red
        black: "#252525",
        white: "#ffffff",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};


