import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Heart, Package, LogOut, Crown, LayoutDashboard, Moon, Sun, Phone, Mail, ChevronDown, Home, Globe } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for simplified layout pages
  const isSimplifiedPage = ['/checkout', '/login', '/register', '/forgot-password'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const menuItems = [
    { to: '/', label: 'home' },
    { to: '/shop', label: 'shop' },
    { to: '/wishlist', label: 'wishlist' },
    { to: '/about', label: 'about' },
  ];

  const userMenuItems = [
    { to: '/dashboard', label: 'dashboard', icon: LayoutDashboard },
    { to: '/orders', label: 'my_orders', icon: Package },
    { to: '/wishlist', label: 'wishlist', icon: Heart },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'admin_panel', icon: Crown }] : []),
  ];

  const topBarClasses = 'bg-maroon text-white text-xs py-2 px-4 hidden md:block transition-all duration-300';
  const mainNavClasses = isScrolled || isOpen
    ? 'bg-white dark:bg-slate-900 md:backdrop-blur-md md:bg-white/95 md:dark:bg-slate-900/95 shadow-md py-2.5 sm:py-3'
    : 'bg-white dark:bg-slate-900 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col w-full">
      {/* 1. TOP BAR - Info & Offers with Marquee */}
      {!isSimplifiedPage && (
        <div className={topBarClasses}>
          <div className="container mx-auto flex justify-between items-center overflow-hidden">
            {/* Animated Marquee Text */}
            <div className="flex-1 overflow-hidden mr-4">
              <div className="animate-marquee whitespace-nowrap inline-block">
                <span className="inline-flex items-center mr-8 font-bold">
                  🎁 {t('welcome_offer')}
                </span>
                <span className="inline-flex items-center mr-8 text-gold/90 font-semibold">
                  🚚 {t('free_shipping')} ৳2000!
                </span>
                <span className="inline-flex items-center mr-8 font-bold">
                  🎁 {t('welcome_offer')}
                </span>
                <span className="inline-flex items-center mr-8 text-gold/90 font-semibold">
                  🚚 {t('free_shipping')} ৳2000!
                </span>
              </div>
            </div>

            {/* Right Side - Contact & Language */}
            <div className="flex items-center divide-x divide-white/20 shrink-0">
              <div className="hidden md:flex items-center space-x-4 pr-4">
                <span className="flex items-center hover:text-gold transition-colors cursor-pointer">
                  <Phone className="w-3 h-3 mr-1.5" /> +880 1851-075537
                </span>
                <span className="flex items-center hover:text-gold transition-colors cursor-pointer">
                  <Mail className="w-3 h-3 mr-1.5" /> salauddinkaderappy@gmail.com
                </span>
              </div>
              <div className="flex items-center pl-4 space-x-3">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center hover:text-gold font-bold uppercase text-[10px] tracking-wider"
                  aria-label={language === 'en' ? 'Switch to Bangla' : 'Switch to English'}
                >
                  <Globe className="w-3 h-3 mr-1" />
                  {language === 'en' ? 'BN' : 'EN'}
                </button>
                <span className="cursor-pointer hover:text-gold font-bold">
                  {t('bdt')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN NAVBAR */}
      <nav className={`transition-all duration-300 w-full ${mainNavClasses}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">

            {/* LEFT: Logo & Mobile Menu Button */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle - Prominent */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 -ml-2 text-slate-800 dark:text-white focus:outline-none hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  aria-label="Menu"
                >
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              <Link to="/" className="flex items-center gap-2 group shrink-0">
                {/* Gift Icon */}
                <div
                  className="w-8 h-8 md:w-10 md:h-10 bg-maroon rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105"
                  role="img"
                  aria-label="RongRani Brand Logo"
                >
                  <span className="text-white text-lg md:text-xl" aria-hidden="true">🎁</span>
                </div>
                {/* Text Logo */}
                <div className="flex flex-col leading-none">
                  <span className="text-2xl md:text-3xl font-black text-maroon dark:text-white tracking-tight group-hover:opacity-90 transition-opacity">
                    Rong<span className="text-slate-800 dark:text-slate-200">Rani</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* CENTER: Search Bar (Desktop) */}
            {!isSimplifiedPage && (
              <div className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8">
                <form onSubmit={handleSearch} className="w-full relative group">
                  <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    className="w-full bg-slate-100 dark:bg-slate-800 border 
                                                   border-transparent focus:border-maroon/20 dark:focus:border-maroon/40
                                                   rounded-full py-2.5 pl-5 pr-12 
                                                   focus:ring-2 focus:ring-maroon/10 focus:bg-white dark:focus:bg-slate-800 
                                                   transition-all text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 
                                                   bg-maroon hover:bg-maroon-dark text-white rounded-full 
                                                   shadow-sm hover:shadow transition-all transform active:scale-95"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* RIGHT: Icons & Menu */}
            <div className="flex items-center gap-2 md:gap-4">
              {isSimplifiedPage ? (
                <Link to="/" className="text-sm font-medium text-slate-600 hover:text-maroon flex items-center">
                  <Home className="w-4 h-4 mr-1" /> {t('back_to_home')}
                </Link>
              ) : (
                <>
                  {/* Desktop Menu Text Links */}
                  <div className="hidden lg:flex items-center space-x-6 mr-2">
                    {menuItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`text-sm font-bold uppercase tracking-wide hover:text-maroon dark:hover:text-pink-400 transition-colors relative group py-2 ${location.pathname === item.to ? 'text-maroon dark:text-pink-400' : 'text-slate-600 dark:text-slate-400'
                          }`}
                      >
                        {t(item.label)}
                        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-maroon transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${location.pathname === item.to ? 'scale-x-100' : ''}`}></span>
                      </Link>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 md:gap-2">
                    {/* Theme Toggle */}
                    <button
                      onClick={toggleTheme}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300"
                      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Cart */}
                    <Link to="/cart" className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group">
                      <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-maroon transition-colors" />
                      {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-maroon text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-bounce-short">
                          {totalItems}
                        </span>
                      )}
                    </Link>

                    {/* User Dropdown */}
                    {user ? (
                      <div className="relative ml-1">
                        <button
                          onClick={() => setShowUserMenu(!showUserMenu)}
                          className="flex items-center gap-2 focus:outline-none group"
                          aria-label="User Account Menu"
                          aria-haspopup="true"
                          aria-expanded={showUserMenu}
                        >
                          <div className="w-8 h-8 rounded-full bg-maroon flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-all ring-2 ring-transparent group-hover:ring-maroon/20">
                            {user.name.charAt(0)}
                          </div>
                        </button>

                        {showUserMenu && (
                          <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 animate-fade-in-up origin-top-right z-50">
                            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                              <p className="font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
                              <p className="text-xs text-slate-500 truncate font-medium">{user.email}</p>
                            </div>
                            <div className="py-1.5">
                              {userMenuItems.map(item => (
                                <Link
                                  key={item.to}
                                  to={item.to}
                                  className="flex items-center px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-slate-700 hover:text-maroon transition-colors"
                                >
                                  <item.icon className="w-4 h-4 mr-3 opacity-70" /> {t(item.label)}
                                </Link>
                              ))}
                            </div>
                            <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                              <button
                                onClick={handleLogout}
                                className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium"
                              >
                                <LogOut className="w-4 h-4 mr-3" /> {t('logout')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link to="/login" className="hidden md:inline-flex btn-primary px-5 py-2 text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all ml-2">
                        {t('login')}
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Search Bar (Below Header) */}
          {!isSimplifiedPage && (
            <div className="md:hidden mt-3 pb-1">
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  placeholder={t('search_placeholder')}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-maroon text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-0 top-0 h-full px-3 text-slate-500 hover:text-maroon">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {!isSimplifiedPage && isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div
            className="absolute top-0 left-0 w-[80%] max-w-xs h-full bg-white dark:bg-slate-900 shadow-2xl p-5 flex flex-col animate-slide-right space-y-6 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-maroon rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white text-lg">🎁</span>
                </div>
                <span className="text-xl font-black text-maroon">
                  Rong<span className="text-slate-800 dark:text-slate-200">Rani</span>
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <div className="space-y-1">
              {menuItems.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block px-4 py-3 rounded-lg font-bold text-lg transition-colors ${location.pathname === item.to ? 'bg-maroon/5 text-maroon border-l-4 border-maroon' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                >
                  {t(item.label)}
                </Link>
              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-auto">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center px-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-maroon flex items-center justify-center text-white font-bold mr-3 shadow-md border-2 border-white">
                      {user.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold truncate text-slate-800 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  {userMenuItems.map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
                    >
                      <item.icon className="w-5 h-5 mr-3" /> {t(item.label)}
                    </Link>
                  ))}
                  <button onClick={handleLogout} className="flex w-full items-center px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors font-medium">
                    <LogOut className="w-5 h-5 mr-3" /> {t('logout')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/login" className="btn-secondary text-center py-3 justify-center rounded-lg">{t('login')}</Link>
                  <Link to="/register" className="btn-primary text-center py-3 justify-center rounded-lg">{t('register')}</Link>
                </div>
              )}
            </div>

            <div className="text-center text-xs text-slate-400 pt-4 space-y-2">
              <div className="flex justify-center space-x-4">
                <button onClick={toggleLanguage} className="text-xs font-bold uppercase p-2 border rounded hover:bg-slate-50">
                  {language === 'en' ? 'Switch to Bangla' : 'Switch to English'}
                </button>
              </div>
              <p className="flex items-center justify-center"><Phone className="w-3 h-3 mr-1" /> +880 1851-075537</p>
              <p className="flex items-center justify-center"><Mail className="w-3 h-3 mr-1" /> info@rongrani.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;