import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AIChatWidget from './AIChatWidget';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-cream dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <AIChatWidget />
    </div>
  );
};

export default Layout;