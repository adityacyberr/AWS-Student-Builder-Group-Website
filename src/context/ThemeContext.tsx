"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const { profile } = useAuth();

  // Helper to apply theme to document element
  const applyTheme = (t: Theme) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(t);
    root.setAttribute("data-theme", t);
  };

  // 1. Initial load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme || "dark";
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, []);

  // 2. Fetch theme preference from database when profile is loaded
  useEffect(() => {
    async function fetchDBTheme() {
      if (!profile?.id || !supabase) return;
      try {
        const { data, error } = await supabase
          .from("team_members")
          .select("theme_preference")
          .eq("id", profile.id)
          .maybeSingle();

        if (error) {
          console.warn("Theme DB fetch error (may need column migration):", error);
          return;
        }

        if (data?.theme_preference) {
          const dbTheme = data.theme_preference as Theme;
          setThemeState(dbTheme);
          localStorage.setItem("theme", dbTheme);
          applyTheme(dbTheme);
        }
      } catch (err) {
        console.warn("Catch warning during theme DB fetch:", err);
      }
    }
    fetchDBTheme();
  }, [profile]);

  // Set theme handler
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);

    // Persist to database if logged in
    if (profile?.id && supabase) {
      try {
        const { error } = await supabase
          .from("team_members")
          .update({ theme_preference: newTheme })
          .eq("id", profile.id);

        if (error) {
          console.warn("Failed to persist theme to database:", error);
        }
      } catch (err) {
        console.warn("Error updating theme in database:", err);
      }
    }
  };

  // Toggle theme handler
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
