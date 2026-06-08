/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "artisan-brown": "#5c2d0a",
        "artisan-terracotta": "#c4714a",
        "artisan-sage": "#6b7c5c",
        "artisan-cream": "#f9f3ec",
        "artisan-gold": "#c9973a",
        "artisan-sand": "#e8d5bc"
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-lato)", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 16px 40px rgba(92, 45, 10, 0.12)"
      }
    }
  },
  plugins: []
};
