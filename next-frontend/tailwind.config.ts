import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        default: "#242526",
        main: "#003781",
        error: "#f35759",
        success: "#366912"
      },
      "textColor" : {
        primary: "#ffffff",
        contrast: "#ffffff"
      }
    },
  },
  plugins: [],
} satisfies Config;
