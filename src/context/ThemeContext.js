import React, { createContext, useContext, useState, useEffect } from 'react';

// ThemeContext provides dark mode state and setter
// body.dark is the primary theme system. :has() is a temporary fallback for legacy code.
// New components should only use body.dark. Old :has() usage will be removed gradually.

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // On mount, check localStorage for persisted theme
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setIsDark(true);
    } else if (storedTheme === 'light') {
      setIsDark(false);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Toggle body class and persist theme
    if (isDark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
