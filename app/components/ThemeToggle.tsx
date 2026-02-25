"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved) {
      setDark(saved === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDark(prefersDark);
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;

    if (dark) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="
        px-4 py-2 rounded-full text-sm font-medium
        bg-white/70 backdrop-blur-xl
        border border-white/40 shadow-md
        transition-all duration-300
        hover:shadow-lg
        dark:bg-slate-800/70 dark:text-white dark:border-slate-700
      "
    >
      {dark ? "☀ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}