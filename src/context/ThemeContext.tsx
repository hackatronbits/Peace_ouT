"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  scrollToSection: (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Function to get initial dark mode state
const getInitialDarkMode = () => {
  if (typeof window !== "undefined") {
    const storedDarkMode = localStorage.getItem("PC_darkMode");
    return storedDarkMode !== null ? JSON.parse(storedDarkMode) : false;
  }
  return false;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    localStorage.setItem("PC_darkMode", JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, toggleDarkMode, scrollToSection }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
