"use client";

import { useEffect, useState } from "react";
import { Logo } from "../../../app/home/components/Logo";
import { useTheme } from "../../../context/ThemeContext";
import "../../../app/home/styles.css";
import Link from "next/link";

export default function Header() {
  const { isDarkMode, toggleDarkMode, scrollToSection } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Update localStorage and body class when dark mode changes
  useEffect(() => {
    localStorage.setItem("PC_darkMode", JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Logo />
          <nav className={`main-nav ${isMenuOpen ? "mobile-nav-open" : ""}`}>
            <Link
              href="/#features"
              className="nav-link"
              onClick={(e) => {
                scrollToSection(e, "features");
                setIsMenuOpen(false);
              }}
            >
              Features
            </Link>
            <Link
              href="/#models"
              className="nav-link"
              onClick={(e) => {
                scrollToSection(e, "models");
                setIsMenuOpen(false);
              }}
            >
              Models
            </Link>
            <Link
              href="/product/pricing"
              className="nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/conversations"
              className="launch-button mobile-only"
              onClick={() => setIsMenuOpen(false)}
            >
              Launch App
              <svg
                className="button-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </nav>
        </div>
        <div className="header-right">
          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <svg
                className="theme-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="theme-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
          <Link href="/conversations" className="launch-button desktop-only">
            Launch App
            <svg
              className="button-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
          <button
            className="hamburger-menu"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <div className={`hamburger-icon ${isMenuOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
