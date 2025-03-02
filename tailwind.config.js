/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        forest: "url('/images/background-images.jpg')",
      },
      fontFamily: {
        header: ["Poppins", "sans-serif"],
        body: ["Playfair Display", "serif"],
      },
      backgroundColor: {
        backdrop: "rgb(31 41 55 / 70%)",
        "forest-bottom": "#280410",
      },
    },
  },
  plugins: [],
};
