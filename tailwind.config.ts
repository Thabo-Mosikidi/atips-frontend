import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // 🔥 THIS FIXES DARK MODE
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;