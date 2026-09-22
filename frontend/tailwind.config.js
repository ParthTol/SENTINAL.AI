/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#121212",
        sidebar: "#000000",
        card: "#181818",
        cardHover: "#222222",
        elevated: "#1F1F1F",
        line: "rgba(255,255,255,0.08)",
        green: "#1DB954",
        greenBright: "#1ED760",
        gray: "#B3B3B3",
        grayDim: "#727272",
        red: "#F15E6C",
        orange: "#FF8C42",
        yellow: "#F5C94D",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      keyframes: {
        equalize: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        slideIn: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        slideIn: "slideIn 0.2s ease-out",
        fadeUp: "fadeUp 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
