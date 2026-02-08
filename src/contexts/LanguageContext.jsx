import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Load language from localStorage
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    // Save language to localStorage whenever it changes
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'bn' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key) => {
    // Simple translation function - in a real app, you'd have a translation object
    const translations = {
      en: {
        home: 'Home',
        shop: 'Shop',
        cart: 'Cart',
        login: 'Login',
        logout: 'Logout',
        search: 'Search',
        // Add more translations as needed
      },
      bn: {
        home: 'হোম',
        shop: 'দোকান',
        cart: 'কার্ট',
        login: 'লগইন',
        logout: 'লগআউট',
        search: 'খুঁজুন',
        // Add more translations as needed
      }
    };

    return translations[language]?.[key] || key;
  };

  const value = {
    language,
    toggleLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};