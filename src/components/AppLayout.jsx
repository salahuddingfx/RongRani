import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import TopNavBar from './TopNavBar';
import AIChatFloatingWidget from './AIChatFloatingWidget';
import Seo from './Seo';
import ScrollRevealManager from './ScrollRevealManager';
import CustomCursor from './CustomCursor';
import CustomCursor from './CustomCursor';

const AppLayout = () => {
  const location = useLocation();

  // Delayed load for heavy components to boost FID/TTI
  const [showChat, setShowChat] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowChat(true), 5000);
    const trigger = () => {
      setShowChat(true);
      clearTimeout(timer);
      window.removeEventListener('scroll', trigger);
      window.removeEventListener('touchstart', trigger);
    };
    window.addEventListener('scroll', trigger, { passive: true });
    window.addEventListener('touchstart', trigger, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', trigger);
      window.removeEventListener('touchstart', trigger);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-charcoal dark:text-white">
      <Seo path={location.pathname} />
      <ScrollRevealManager />
      <div className="fixed top-0 left-0 right-0 z-[100] overflow-visible">
        <TopNavBar />
        <Navbar />
      </div>
      <main className="flex-1 pb-20 lg:pb-0 pt-28 sm:pt-32 md:pt-36">
        <Outlet />
      </main>
      <Footer />

      {/* Custom Cursor - Premium Feel */}
      <CustomCursor />

      {/* AI Chat Widget - Delayed Load for Performance */}
      {showChat && <AIChatFloatingWidget />}

      <BottomNav />
    </div>
  );
};

export default AppLayout;