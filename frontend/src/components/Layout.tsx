import React, { useState, useEffect, createContext } from 'react';
import { Outlet } from 'react-router-dom';

// Tactical Theme Context
const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}>({
  theme: 'dark',
  toggleTheme: () => {}
});

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem('questsage-theme', newTheme);
    } catch (e) {
      // Safe storage access
    }
  };

  // Default to dark mode ("Forest Ink") as dictated by DESIGN.md
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('questsage-theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const LayoutContent: React.FC = () => {
  return (
    <div
      className="min-h-screen min-h-[100dvh] flex flex-col font-body selection:bg-amber-900 selection:text-amber-100"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)'
      }}
    >
      <Outlet />
    </div>
  );
};

const Layout: React.FC = () => (
  <ThemeProvider>
    <LayoutContent />
  </ThemeProvider>
);

export default Layout;
export { ThemeContext };
