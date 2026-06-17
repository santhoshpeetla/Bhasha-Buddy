"use client";

import React, { useEffect, useState } from "react";
import Logo from "./Logo";
import { Sun, Moon, Sparkles, AlertTriangle, ShieldCheck, Heart } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/70 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
              <span>India-First AI Multilingual Decoder</span>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer / Disclaimers */}
      <footer className="border-t border-gray-200 bg-white dark:border-zinc-850 dark:bg-zinc-950/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-amber-600 dark:text-amber-500 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" />
              <span>Important Disclaimer</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              BhashaBuddy is a prototype tool intended to explain documents in simple terms. 
              The AI-generated analysis does not constitute legal, financial, or medical advice. 
              Always review the original document and verify critical deadlines, guidelines, or conditions independently.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3 text-xs text-gray-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Privacy Guaranteed: Processing occurs in memory. No persistent storage.</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="h-3.5 w-3.5 text-red-500 fill-current animate-bounce" />
              <span>for Hackathon 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
