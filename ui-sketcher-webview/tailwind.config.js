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
      boxShadow: {
        "tl-2": "var(--shadow-2)",
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
          success: "#edf3ec",
          warning: "#fbf3db",
          error: "#fdebec",
          ".text-error": {
            color: "#D44747",
          },
          ".text-warning": {
            color: "#D9730D",
          },
          ".text-success": {
            color: "#448361",
          },
          "--rounded-box": "0.5rem", // border radius rounded-box utility class, used in card and other large boxes
          "--rounded-btn": "0.5rem", // border radius rounded-btn utility class, used in buttons and similar element
          "--rounded-badge": "1rem", // border radius rounded-badge utility class, used in badges and similar
        },
      },
    ],
  },
  plugins: [typography, daisyui],
};
