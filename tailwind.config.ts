import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fee2e2",
          100: "#fecaca",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c"
        }
      }
    }
  },
  plugins: []
};

export default config;


