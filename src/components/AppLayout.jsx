import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import TopNavBar from './TopNavBar';
import AIChatFloatingWidget from './AIChatFloatingWidget';
import Seo from './Seo';
import ScrollRevealManager from './ScrollRevealManager';

const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-pink-50 text-charcoal">
      <Seo path={location.pathname} />
      <ScrollRevealManager />
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopNavBar />
        <Navbar />
      </div>
      <main className="flex-1 pb-20 lg:pb-0 pt-28 sm:pt-32 md:pt-36">
        <Outlet />
      </main>
      <Footer />

      {/* AI Chat Widget - All Devices */}
      <AIChatFloatingWidget />

      <BottomNav />
    </div>
  );
};

export default AppLayout;