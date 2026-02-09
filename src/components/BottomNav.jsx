import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, Package, User, Crown, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { totalItems } = useCart();
  
  const phoneNumber = '8801851075537';
  const defaultMessage = 'Hello! I need help with Chirkut ঘর services.';

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/shop', icon: ShoppingBag, label: 'Shop' },
    { path: '/cart', icon: ShoppingBag, label: 'Cart', badge: totalItems },
    { path: '/wishlist', icon: Heart, label: 'Wishlist', auth: true },
    user?.role === 'admin' 
      ? { path: '/admin', icon: Crown, label: 'Admin', auth: true }
      : { path: '/dashboard', icon: User, label: user ? 'Account' : 'Login', dest: user ? '/dashboard' : '/login' }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate/20 shadow-2xl">
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item, index) => {
          const path = item.dest || item.path;
          const active = isActive(item.path);
          const Icon = item.icon;

          if (item.auth && !user) return null;

          return (
            <Link
              key={index}
              to={path}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 relative ${
                active 
                  ? 'text-maroon' 
                  : 'text-slate hover:text-maroon'
              }`}
            >
              {/* Active Indicator */}
              {active && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-maroon rounded-b-full"></div>
              )}

              {/* Icon with Badge */}
              <div className="relative">
                <Icon className={`h-6 w-6 transition-transform duration-300 ${active ? 'scale-110' : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-maroon text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-xs font-semibold ${active ? 'scale-105' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* WhatsApp Button in Bottom Nav (Mobile Only) */}
        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center space-y-1 transition-all duration-300 relative text-green-500 hover:text-green-600"
          title="WhatsApp Support"
        >
          <MessageCircle className="h-6 w-6 transition-transform duration-300 hover:scale-110" />
          <span className="text-xs font-semibold">Help</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
