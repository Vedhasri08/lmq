import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: "#B79A5B",
        golddark: "#A3874F",
        primary: "#b5995a",
      },
      letterSpacing: {
        widestPlus: "0.25em",
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui"],
        serif: ["Times New Roman", "Times", "serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 0px #B79A5B" },
          "50%": { boxShadow: "0 0 25px rgba(183,154,91,0.55)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        glow: "glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [typography],
};
