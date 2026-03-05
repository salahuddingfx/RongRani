import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Heart, Package, LogOut, Crown, LayoutDashboard, Moon, Sun, Phone, Mail, ChevronDown, Home, Globe, TrendingUp, Clock, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useWishlist } from '../contexts/WishlistContext';

// Optimized Search Bar Component to prevent whole Navbar re-renders during typing
const SearchSection = React.memo(({ isScrolled, language, t, isMobile = false, setIsOpen }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [popularSearches, setPopularSearches] = useState(['Love Combo', 'Anniversary', 'Birthday', 'Gift Box']);
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Click Outside for Search Box
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };
    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

  // Save to recent searches helper
  const saveToRecent = useCallback((query) => {
    if (!query) return;
    const updatedRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
  }, [recentSearches]);

  const placeholders = useMemo(() => language === 'bn'
    ? ['উপহার খুজুন...', 'ভালোবাসার কম্বো...', 'বার্থডে গিফট...', 'হস্তনির্মিত পণ্য...', 'সারপ্রাইজ বক্স...']
    : ['Search for gifts...', 'Love Combo...', 'Birthday Gifts...', 'Handmade Items...', 'Surprise Boxes...'], [language]);

  // Typing Effect
  useEffect(() => {
    let currentText = placeholders[placeholderIndex];
    let charIndex = 0;
    let isDeleting = false;
    let timer;

    const type = () => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setPlaceholder(currentText.substring(0, charIndex + 1));
          charIndex++;
          timer = setTimeout(type, 150);
        } else {
          timer = setTimeout(() => {
            isDeleting = true;
            type();
          }, 3000);
        }
      } else {
        if (charIndex > 0) {
          setPlaceholder(currentText.substring(0, charIndex - 1));
          charIndex--;
          timer = setTimeout(type, 100);
        } else {
          isDeleting = false;
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
          timer = setTimeout(type, 1000);
        }
      }
    };

    timer = setTimeout(type, 2000);
    return () => clearTimeout(timer);
  }, [placeholderIndex, placeholders]);

  // Suggestions API
  useEffect(() => {
    const fetchSuggestions = async () => {
      const query = searchQuery.trim();
      if (query.length < 2) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.get(`/api/search/suggestions`, { params: { q: query } });
        if (response.data?.success) {
          setSuggestions(response.data.suggestions || []);
          setSuggestedCategories(response.data.categories || []);
          if (response.data.popularSearches) setPopularSearches(response.data.popularSearches);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Search suggestion error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      saveToRecent(query);
      navigate(`/shop?search=${encodeURIComponent(query)}`);
      setSearchQuery('');
      setShowSuggestions(false);
      if (setIsOpen) setIsOpen(false);
    }
  };

  const highlightMatch = (text, query) => {
    if (!query || typeof text !== 'string') return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <span key={i} className="text-maroon dark:text-pink-400 font-black">{part}</span>
        : part
    );
  };

  return (
    <div className={`relative group search-container ${isMobile ? 'w-full' : 'w-full'}`}>
      <form onSubmit={handleSearch} className="w-full relative" role="search">
        <input
          type="text"
          placeholder={placeholder}
          aria-label={t('search_placeholder') || "Search for gifts"}
          className={`w-full bg-slate-100 dark:bg-slate-800 border 
                     border-transparent focus:border-maroon/20 dark:focus:border-maroon/40
                     ${isMobile ? 'rounded-xl py-2' : 'rounded-full py-2.5'} pl-5 pr-12 
                     focus:ring-2 focus:ring-maroon/10 focus:bg-white dark:focus:bg-slate-800 
                     transition-all text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm`}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!showSuggestions) setShowSuggestions(true);
          }}
          onFocus={() => {
            if (searchQuery.length >= 2 || (isMobile && !searchQuery)) setShowSuggestions(true);
          }}
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 
                     bg-maroon hover:bg-maroon-dark text-white rounded-full 
                     shadow-sm hover:shadow transition-all transform active:scale-95"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className={`absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 overflow-hidden z-[9999] animate-fade-in-up`}>
          {isSearching ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon mx-auto mb-3"></div>
              <p className="text-xs text-slate-500 font-medium">{t('searching_magic')}</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              {searchQuery.trim().length < 2 && (
                <div className="p-4 border-b border-slate-50 dark:border-slate-700/50">
                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] mb-3 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-maroon" /> {t('trending_now')}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          saveToRecent(term);
                          navigate(`/shop?search=${encodeURIComponent(term)}`);
                          setShowSuggestions(false);
                          if (setIsOpen) setIsOpen(false);
                        }}
                        className="px-4 py-1.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-maroon hover:text-white dark:hover:bg-maroon text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold transition-all border border-slate-100 dark:border-slate-600/50"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchQuery.trim().length < 2 && recentSearches.length > 0 && (
                <div className="p-4 border-b border-slate-50 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-900/10">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] flex items-center gap-2">
                      <Clock className="w-3 h-3" /> {t('recent_searches')}
                    </h5>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecentSearches([]);
                        localStorage.removeItem('recentSearches');
                      }}
                      className="text-[10px] font-bold text-maroon underline underline-offset-2"
                    >
                      {t('clear_recent')}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          saveToRecent(term);
                          navigate(`/shop?search=${encodeURIComponent(term)}`);
                          setShowSuggestions(false);
                          if (setIsOpen) setIsOpen(false);
                        }}
                        className="w-full text-left p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-2 group"
                      >
                        <Search className="w-3 h-3 text-slate-300 group-hover:text-maroon transition-colors" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {suggestedCategories.length > 0 && searchQuery.trim().length >= 2 && (
                <div className="p-4 border-b border-slate-50 dark:border-slate-700/50 bg-maroon/[0.02] dark:bg-pink-400/[0.02]">
                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] mb-3">
                    Suggested Categories
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {suggestedCategories.map((cat, i) => (
                      <Link
                        key={i}
                        to={`/shop?category=${encodeURIComponent(cat)}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 hover:border-maroon dark:hover:border-pink-400 border border-slate-100 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
                        onClick={() => {
                          setShowSuggestions(false);
                          if (setIsOpen) setIsOpen(false);
                        }}
                      >
                        <LayoutDashboard className="w-3 h-3 text-maroon dark:text-pink-400" />
                        {highlightMatch(cat, searchQuery)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-2">
                {suggestions.length > 0 ? (
                  <>
                    <h5 className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">
                      {t('products_found')}
                    </h5>
                    {suggestions.map((product) => (
                      <Link
                        key={product._id}
                        to={`/product/${product.slug || product._id}`}
                        className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all rounded-2xl group"
                        onClick={() => {
                          setShowSuggestions(false);
                          setSearchQuery('');
                          if (setIsOpen) setIsOpen(false);
                        }}
                      >
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 border border-slate-100 dark:border-slate-600 group-hover:border-maroon transition-colors">
                          <img
                            src={product.image?.url || product.image || '/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-maroon dark:group-hover:text-pink-400 transition-colors">
                            {highlightMatch(product.name, searchQuery)}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-black text-maroon dark:text-pink-400">৳{product.price}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{product.category}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                ) : (
                  searchQuery.length >= 2 && !isSearching && (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{t('no_products_found_msg')}</p>
                      <p className="text-xs text-slate-500">{t('try_adjust_filters')}</p>
                    </div>
                  )
                )}
              </div>

              {suggestions.length > 0 && (
                <Link
                  to={`/shop?search=${encodeURIComponent(searchQuery)}`}
                  className="flex items-center justify-center gap-2 p-4 bg-slate-50/50 dark:bg-slate-900/30 text-sm font-black text-maroon dark:text-pink-400 border-t border-slate-50 dark:border-slate-700/50 hover:bg-maroon hover:text-white dark:hover:bg-maroon transition-all"
                  onClick={() => {
                    setShowSuggestions(false);
                    if (setIsOpen) setIsOpen(false);
                  }}
                >
                  {t('view_all_results')}
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { totalItems, openCart } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isSimplifiedPage = ['/checkout', '/login', '/register', '/forgot-password'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container')) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { to: '/', label: 'home' },
    { to: '/shop', label: 'shop' },
    { to: '/quick-track', label: 'track_order' },
    { to: '/wishlist', label: 'wishlist' },
    { to: '/about', label: 'about' },
    { to: '/contact', label: 'contact' },
  ];

  const userMenuItems = [
    { to: '/dashboard', label: 'dashboard', icon: LayoutDashboard },
    { to: '/orders', label: 'my_orders', icon: Package },
    { to: '/wishlist', label: 'wishlist', icon: Heart },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'admin_panel', icon: Crown }] : []),
  ];

  const topBarClasses = 'bg-maroon/90 backdrop-blur-md backdrop-saturate-150 text-white text-[10px] md:text-xs py-1.5 md:py-2 px-3 md:px-4 block transition-all duration-300 ring-1 ring-white/10 relative z-50 mx-0 md:mx-4 mt-0 md:mt-2 rounded-none md:rounded-xl shadow-lg';
  const mainNavClasses = isScrolled || isOpen
    ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl backdrop-saturate-150 shadow-xl ring-1 ring-white/10 dark:ring-white/5 py-1.5 sm:py-3 rounded-none md:rounded-2xl mx-0 md:mx-4 mt-0 md:mt-3 transition-all duration-500'
    : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg backdrop-saturate-150 shadow-lg ring-1 ring-white/10 dark:ring-white/5 py-2 sm:py-4 rounded-none md:rounded-2xl mx-0 md:mx-4 mt-0 md:mt-3 transition-all duration-500';

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] flex flex-col w-full overflow-visible pointer-events-none">
      <div className="pointer-events-auto">
        {!isSimplifiedPage && (
          <div className={topBarClasses}>
            <div className="container mx-auto flex justify-between items-center overflow-hidden">
              <div className="flex-1 overflow-hidden mr-4">
                <div className="animate-marquee whitespace-nowrap inline-block">
                  {/* Set 1 */}
                  <span className="inline-flex items-center mr-8 md:mr-12 font-bold">🎁 {t('welcome_offer')}</span>
                  <span className="inline-flex items-center mr-8 md:mr-12 text-gold font-bold">🚚 {t('free_shipping')}</span>
                  <span className="inline-flex items-center mr-8 md:mr-12 font-bold text-pink-100">✨ {t('handcrafted_love_top')}</span>

                  {/* Set 2 */}
                  <span className="inline-flex items-center mr-8 md:mr-12 font-bold">🎁 {t('welcome_offer')}</span>
                  <span className="inline-flex items-center mr-8 md:mr-12 text-gold font-bold">🚚 {t('free_shipping')}</span>
                  <span className="inline-flex items-center mr-8 md:mr-12 font-bold text-pink-100">✨ {t('handcrafted_love_top')}</span>

                  {/* Set 3 (Duplicate for wider screens) */}
                  <span className="inline-flex items-center mr-8 md:mr-12 font-bold">🎁 {t('welcome_offer')}</span>
                  <span className="inline-flex items-center mr-8 md:mr-12 text-gold font-bold">🚚 {t('free_shipping')}</span>
                  <span className="inline-flex items-center mr-8 md:mr-12 font-bold text-pink-100">✨ {t('handcrafted_love_top')}</span>

                  {/* Set 4 (Duplicate for wider screens) */}
                  <span className="inline-flex items-center mr-8 md:mr-12 font-bold">🎁 {t('welcome_offer')}</span>
                  <span className="inline-flex items-center mr-8 md:mr-12 text-gold font-bold">🚚 {t('free_shipping')}</span>
                  <span className="inline-flex items-center mr-8 md:mr-12 font-bold text-pink-100">✨ {t('handcrafted_love_top')}</span>
                </div>
              </div>
              <div className="flex items-center divide-x divide-white/20 shrink-0">
                <div className="hidden md:flex items-center space-x-4 pr-4">
                  <a href="tel:+8801851075537" className="flex items-center hover:text-gold transition-colors"><Phone className="w-3 h-3 mr-1.5" /> +880 1851-075537</a>
                  <a href="mailto:info.rongrani@gmail.com" className="flex items-center hover:text-gold transition-colors pl-4"><Mail className="w-3 h-3 mr-1.5" /> info.rongrani@gmail.com</a>
                </div>
                <div className="flex items-center pl-4 space-x-3 text-[10px]">
                  <button onClick={toggleLanguage} className="flex items-center hover:text-gold font-bold uppercase tracking-wider">
                    <Globe className="w-3 h-3 mr-1" />{language === 'en' ? 'BN' : 'EN'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className={`transition-all duration-300 w-auto overflow-visible ${mainNavClasses}`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="lg:hidden">
                  <button onClick={() => setIsOpen(!isOpen)} className="p-2 -ml-2 text-slate-800 dark:text-white rounded-full active:scale-90 transition-transform" aria-label={isOpen ? "Close menu" : "Open menu"}>
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
                <Link to="/" className="flex items-center gap-2 group shrink-0">
                  <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-all">
                    <img src="/RongRani-Logo.png" alt="RongRani Logo" className="w-full h-full object-contain" width="56" height="56" fetchpriority="high" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-xl md:text-3xl font-black text-maroon dark:text-white tracking-tighter">Rong<span className="text-slate-800 dark:text-slate-200">Rani</span></span>
                  </div>
                </Link>
              </div>

              {!isSimplifiedPage && (
                <div className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8">
                  <SearchSection isScrolled={isScrolled} language={language} t={t} />
                </div>
              )}

              <div className="flex items-center gap-2 md:gap-4">
                {!isSimplifiedPage && (
                  <>
                    <div className="hidden lg:flex items-center space-x-6 mr-2">
                      {menuItems.map((item) => (
                        <Link key={item.to} to={item.to} className={`text-sm font-bold uppercase tracking-wide px-4 py-2 rounded-full transition-all duration-300 relative group ${location.pathname === item.to ? 'bg-maroon text-white' : 'text-slate-600 dark:text-slate-400 hover:text-maroon dark:hover:text-pink-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                          <span className="relative z-10">{t(item.label)}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {/* Navigation Buttons (Back & Home) - Only on Simplified Pages (Login, Signup, etc.) */}
                {isSimplifiedPage && (
                  <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 mr-1">
                    <button onClick={() => window.history.back()} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" title="Go Back">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <Link to="/" className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" title="Home">
                      <Home className="w-5 h-5" />
                    </Link>
                  </div>
                )}

                <div className="flex items-center gap-1 md:gap-2">
                  {/* Mobile Search Toggle (Optional enhancement) */}
                  {!isSimplifiedPage && (
                    <Link to="/shop" className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" aria-label="Search">
                      <Search className="w-5 h-5" />
                    </Link>
                  )}

                  <button onClick={toggleTheme} className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300" aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>

                  {/* Desktop Only Icons (Mobile has BottomNav) */}
                  {!isSimplifiedPage && (
                    <>
                      <Link to="/cart" onClick={(e) => { e.preventDefault(); openCart(); }} className="hidden md:flex relative p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group" aria-label="Cart">
                        <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-maroon" />
                        {totalItems > 0 && <span className="absolute top-0 right-0 bg-maroon text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow-sm animate-bounce-short">{totalItems}</span>}
                      </Link>
                      <Link to="/wishlist" className="hidden md:flex relative p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group" aria-label="Wishlist">
                        <Heart className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-maroon" />
                        {wishlist.length > 0 && <span className="absolute top-0 right-0 bg-maroon text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow-sm animate-pulse">{wishlist.length}</span>}
                      </Link>

                      <div className="hidden md:block">
                        {user ? (
                          <div className="relative ml-1 user-menu-container">
                            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 group" aria-label="User menu">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-maroon/10 dark:bg-maroon/20 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm group-hover:border-maroon transition-all">
                                <User className="w-4 h-4 md:w-5 md:h-5 text-maroon" />
                              </div>
                              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>
                            {/* ...User Menu Dropdown... */}
                            {showUserMenu && (
                              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-3 z-[100] animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t('welcome')}</p>
                                  <p className="text-sm font-black text-slate-800 dark:text-white truncate">{user.name}</p>
                                </div>
                                {userMenuItems.map((item) => (
                                  <Link key={item.to} to={item.to} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-maroon transition-colors" onClick={() => setShowUserMenu(false)}>
                                    <item.icon className="w-4 h-4" /> {t(item.label)}
                                  </Link>
                                ))}
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                                  <LogOut className="w-4 h-4" /> {t('logout')}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link to="/login" className="ml-2 px-6 py-2.5 bg-maroon text-white text-xs font-bold rounded-full hover:bg-maroon-dark shadow-lg shadow-maroon/20 hover:shadow-maroon/30 transition-all active:scale-95">{t('login')}</Link>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {!isSimplifiedPage && (
              <div className="md:hidden mt-3 pb-2 px-1">
                <SearchSection isMobile isScrolled={isScrolled} language={language} t={t} setIsOpen={setIsOpen} />
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Drawer */}
        {isOpen && !isSimplifiedPage && (
          <div className="lg:hidden relative z-[100]">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 animate-slide-in-left flex flex-col h-full border-r border-slate-100 dark:border-slate-800">
              <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
                {/* Header with Logo */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden">
                      <img src="/RongRani-Logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-lg font-black text-maroon dark:text-white tracking-tighter">Rong<span className="text-slate-800 dark:text-slate-200">Rani</span></span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-maroon transition-colors hover:bg-red-50"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 space-y-8">

                  {/* Greeting / User Status */}
                  {user && (
                    <div className="bg-gradient-to-br from-maroon/5 to-pink-500/5 rounded-2xl p-4 border border-maroon/10">
                      <p className="text-xs font-bold text-slate-500 mb-1">{t('welcome_back')},</p>
                      <p className="text-xl font-black text-maroon dark:text-white truncate">{user.name || 'User'}</p>
                    </div>
                  )}

                  {/* Main Navigation */}
                  <div className="space-y-1">
                    <p className="px-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('menu')}</p>
                    {menuItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`block px-3 py-2.5 rounded-xl font-bold transition-all ${location.pathname === item.to ? 'bg-maroon text-white shadow-lg shadow-maroon/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-maroon'}`}
                        onClick={() => setIsOpen(false)}
                      >
                        {t(item.label)}
                      </Link>
                    ))}
                  </div>

                  {/* Account / Login */}
                  <div className="space-y-1">
                    <p className="px-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('account')}</p>
                    {user ? (
                      <div className="space-y-1">
                        {userMenuItems.map((item) => (
                          <Link key={item.to} to={item.to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-maroon transition-colors" onClick={() => setIsOpen(false)}>
                            <item.icon className="w-4.5 h-4.5 opacity-70" /> {t(item.label)}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link to="/login" className="flex items-center justify-center gap-2 w-full py-3 bg-maroon text-white font-bold rounded-xl shadow-lg shadow-maroon/20 hover:shadow-maroon/40 active:scale-95 transition-all" onClick={() => setIsOpen(false)}>
                        <span>{t('login')}</span>
                      </Link>
                    )}
                  </div>

                  {/* Settings */}
                  <div className="space-y-3 pt-2">
                    <p className="px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('preferences')}</p>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Language */}
                      <button onClick={toggleLanguage} className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-xs font-bold ring-1 ring-slate-200 dark:ring-slate-600 mb-2">
                          {language === 'en' ? 'BN' : 'EN'}
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{language === 'en' ? 'Bangla' : 'English'}</span>
                      </button>

                      {/* Theme */}
                      <button onClick={toggleTheme} className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${isDark ? 'bg-slate-700 text-yellow-400' : 'bg-white text-slate-500 ring-1 ring-slate-200'}`}>
                          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-5 text-center border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-500 font-medium">© 2026 RongRani. v1.0</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;