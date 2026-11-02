import React, { useState, useEffect, createContext } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { questsageAPI } from '../services/api';
import Navigation from './Navigation';

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

  // Initialize theme from localStorage or default to dark
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
  const { data: user } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => questsageAPI.getUserProfile(),
    staleTime: 30000,
  });

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex flex-col font-body"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)'
      }}
    >
      <Navigation
        username={user?.username || user?.first_name || 'QuestSage User'}
        level={user?.level || 1}
        xp={user?.xp || 0}
      />
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
