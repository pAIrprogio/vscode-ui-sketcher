import daisyui from "daisyui";
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      zIndex: {
        300: 300,
        1000: 1000,
      },
    },
  },
  daisyui: {
    themes: [
      {
        tldraw: {
          primary: "#0e00ff",
          secondary: "#ff00ef",
          accent: "#00d7ff",
          neutral: "#030d10",
          "base-100": "#f5f5f4",
          info: "#007cb6",
          success: "#00f274",
          warning: "#b38600",
          error: "#ff7b98",
        },
      },
    ],
  },
  plugins: [typography, daisyui],
};
