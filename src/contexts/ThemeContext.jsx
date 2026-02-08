import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    // Apply theme to document on mount and when theme changes
    console.log('🎨 Theme effect running:', { isDark, classList: document.documentElement.classList.value });
    if (isDark) {
      document.documentElement.classList.add('dark');
      console.log('✅ Added dark class');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('✅ Removed dark class');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    console.log('🎨 Theme toggle clicked! Current:', isDark ? 'dark' : 'light');
    setIsDark(!isDark);
  };

  const value = {
    isDark,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};