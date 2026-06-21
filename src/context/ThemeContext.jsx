import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

function readInitialTheme() {
  const saved = localStorage.getItem('glist_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  if (localStorage.getItem('glist_dark_mode') === 'true') return 'dark';
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('glist_theme', theme);
    localStorage.setItem('glist_dark_mode', theme === 'dark' ? 'true' : 'false');
    document.documentElement.classList.toggle('dark-mode', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
