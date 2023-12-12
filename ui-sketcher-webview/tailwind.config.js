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
          primary: "#0766AD",
          secondary: "#29ADB2",
          accent: "#C5E898",
          neutral: "#030d10",
          "base-100": "#f5f5f4",
          info: "#00efff",
          success: "#00bf7b",
          warning: "#ffa800",
          error: "#ff324b",
        },
      },
    ],
  },
  plugins: [typography, daisyui],
};
