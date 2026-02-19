import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, User, LayoutGrid, ShoppingCart, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const phoneNumber = '8801851075537';
  const defaultMessage = 'Hello! I need help with RongRani services.';

  const handleWhatsApp = () => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/shop', icon: LayoutGrid, label: 'Shop' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: totalItems },
    { to: '/wishlist', icon: Heart, label: 'Wishlist', badge: wishlist.length },
    {
      // Special item for WhatsApp that isn't a route
      isAction: true,
      action: handleWhatsApp,
      icon: MessageCircle,
      label: 'Help',
      colorClass: 'text-green-500 hover:text-green-600',
      activeColorClass: 'bg-green-500 text-white shadow-green-500/30'
    },
    {
      to: user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login',
      icon: User,
      label: 'Account',
      isActive: () => isActive('/dashboard') || isActive('/login') || isActive('/admin')
    }
  ];

  return (
    <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
      <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-2 py-2">
        <ul className="flex items-center justify-between relative">
          {navItems.map((item, index) => {
            const active = item.isAction ? false : (item.isActive ? item.isActive() : isActive(item.to));
            const commonClasses = `relative flex items-center justify-center transition-all duration-500 ease-out ${active
              ? `-mt-12 w-14 h-14 ${item.activeColorClass || 'bg-maroon text-white shadow-maroon/30'} shadow-lg rounded-full border-4 border-slate-50 dark:border-slate-950 transform scale-110`
              : `w-10 h-10 ${item.colorClass || 'text-slate-400 hover:text-maroon dark:hover:text-pink-300'} rounded-full active:bg-slate-100 dark:active:bg-slate-800`
              }`;

            return (
              <li key={index} className="flex-1 flex justify-center">
                {item.isAction ? (
                  <button onClick={item.action} className={commonClasses} aria-label={item.label}>
                    <item.icon className="w-6 h-6 transition-all duration-300" strokeWidth={2} />
                  </button>
                ) : (
                  <Link to={item.to} className={commonClasses}>
                    <item.icon className={`transition-all duration-300 ${active ? 'w-6 h-6' : 'w-6 h-6'}`} strokeWidth={active ? 2.5 : 2} />

                    {item.badge > 0 && (
                      <span className={`absolute font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 transition-all ${active
                        ? '-top-1 -right-1 bg-yellow-400 text-maroon text-[10px] w-5 h-5'
                        : 'top-1 right-1 w-2.5 h-2.5 bg-maroon dark:bg-pink-500'
                        }`}>
                        {active && item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default BottomNav;
