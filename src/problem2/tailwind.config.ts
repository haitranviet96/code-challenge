import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#05010A",
        brand: "#5B8DEF",
        mint: "#72FEC3",
        ember: "#FB7C74",
      },
      boxShadow: {
        glow: "0 20px 80px rgba(91, 141, 239, 0.25)",
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;

