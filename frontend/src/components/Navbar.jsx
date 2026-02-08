import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Globe, Heart, Package, LogOut, Crown, LayoutDashboard, Moon, Sun } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const userMenuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, auth: true },
    { to: '/orders', label: 'My Orders', icon: Package, auth: true },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, auth: true },
    { to: '/admin', label: 'Admin Panel', icon: Crown, auth: true, admin: true },
  ];

  const menuItems = [
    { to: '/', label: t('home'), icon: null },
    { to: '/shop', label: t('shop'), icon: null },
    { to: '/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/about', label: 'About Us', icon: null },
    { to: '/contact', label: 'Contact', icon: null },
  ];

  return (
    <nav className={`w-full transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-2xl border-b border-maroon/20' : 'bg-white/95 backdrop-blur-md shadow-lg'
    }`}>
      <div className="section-container">
        <div className="flex items-center justify-between h-16 sm:h-20 md:h-24">
          {/* Logo - Left */}
          <div className="flex items-center animate-fade-in-up">
            <Link to="/" className="text-xl sm:text-2xl md:text-3xl font-bold text-maroon hover:scale-105 transition-transform duration-300">
              Chirkut ঘর
            </Link>
          </div>

          {/* Search Bar - Center (Desktop Only) */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8 xl:mx-12 animate-fade-in-up stagger-1">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search beautiful crafts..."
                className="input-field pl-14 pr-6 py-4 w-full text-lg shadow-soft hover:shadow-medium focus:shadow-large"
              />
              <button type="submit" className="absolute left-5 top-1/2 transform -translate-y-1/2">
                <Search className="h-6 w-6 text-charcoal-light hover:text-maroon transition-colors" />
              </button>
            </form>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 animate-fade-in-up stagger-2">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden md:flex p-2 sm:p-3 rounded-2xl hover:bg-amber-100 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 shadow-soft hover:shadow-medium"
              title="Toggle Theme"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" />
              )}
            </button>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="hidden md:flex items-center space-x-2 p-2 sm:p-3 rounded-2xl hover:bg-pink-100 transition-all duration-300 hover:scale-105 shadow-soft hover:shadow-medium"
              title="Switch Language"
              aria-label="Switch language"
            >
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-charcoal-light" />
              <span className="text-xs sm:text-sm font-semibold text-charcoal-light uppercase">{language}</span>
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 sm:p-3 rounded-2xl hover:bg-cream-light transition-all duration-300 hover:scale-105 shadow-soft hover:shadow-medium group"
            >
              <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 text-charcoal-light group-hover:text-maroon transition-colors duration-300" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-maroon text-white text-xs sm:text-sm rounded-full h-5 w-5 sm:h-8 sm:w-8 flex items-center justify-center font-bold shadow-glow animate-pulse-glow border-2 border-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu / Login */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-2xl hover:bg-cream-light transition-all duration-300 hover:scale-105 shadow-soft hover:shadow-medium">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-maroon rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="hidden lg:block text-sm sm:text-base text-charcoal font-semibold">{user.name.split(' ')[0]}</span>
                </button>

                {/* Desktop Dropdown */}
                <div className="hidden lg:block absolute right-0 mt-4 w-64 glass-card py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-2xl border border-maroon/10">
                  {userMenuItems.filter(item => !item.auth || (item.auth && (!item.admin || user?.role === 'admin'))).map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center space-x-4 px-5 py-4 text-charcoal hover:bg-maroon/10 hover:text-maroon transition-all duration-300 rounded-xl mx-2"
                    >
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                  <hr className="border-maroon/20 my-3 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-4 w-full text-left px-5 py-4 text-red-600 hover:bg-red-50/20 transition-all duration-300 rounded-xl mx-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-primary px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base md:text-lg shadow-2xl">
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 sm:p-3 rounded-2xl hover:bg-cream-light transition-all duration-300 hover:scale-105 shadow-soft hover:shadow-medium"
            >
              {isOpen ? <X className="h-6 w-6 sm:h-7 sm:w-7 text-charcoal" /> : <Menu className="h-6 w-6 sm:h-7 sm:w-7 text-charcoal" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden glass-card mt-6 p-6 animate-slide-in-left shadow-2xl border border-maroon/10">
            {/* Mobile Search */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search beautiful crafts..."
                  className="input-field pl-14 pr-6 py-4 w-full text-lg"
                />
                <button type="submit" className="absolute left-5 top-1/2 transform -translate-y-1/2">
                  <Search className="h-6 w-6 text-charcoal-light hover:text-maroon transition-colors" />
                </button>
              </form>
            </div>

            {/* Mobile Menu Items */}
            <div className="space-y-3">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center space-x-4 px-5 py-4 text-charcoal hover:bg-maroon/10 hover:text-maroon rounded-2xl transition-all duration-300 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <item.icon className="h-6 w-6" />}
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* User Menu Items (Mobile) */}
              {user && userMenuItems.filter(item => !item.admin || user?.role === 'admin').map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center space-x-4 px-5 py-4 text-charcoal hover:bg-maroon/10 hover:text-maroon rounded-2xl transition-all duration-300 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-6 w-6" />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Mobile Language & Theme */}
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-maroon/20">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-amber-100 dark:hover:bg-slate-700 transition-all duration-300"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="h-6 w-6 text-amber-500" /> : <Moon className="h-6 w-6 text-slate-700" />}
                  <span className="text-sm font-semibold text-charcoal dark:text-white">{isDark ? 'Light' : 'Dark'}</span>
                </button>
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-maroon/10 transition-all duration-300"
                  aria-label="Switch language"
                >
                  <Globe className="h-6 w-6 text-charcoal dark:text-white" />
                  <span className="text-sm font-semibold text-charcoal dark:text-white uppercase">{language}</span>
                </button>
              </div>

              {/* Mobile Logout */}
              {user && (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-4 w-full text-left px-5 py-4 text-red-600 hover:bg-red-50/20 rounded-2xl transition-all duration-300 font-medium"
                >
                  <LogOut className="h-6 w-6" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;