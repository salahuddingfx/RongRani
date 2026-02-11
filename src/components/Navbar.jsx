import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Heart, Package, LogOut, Crown, LayoutDashboard, Moon, Sun, Phone, Mail, ChevronDown, Home, Globe, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
    const query = searchQuery.trim();
    if (query) {
      // Save to recent searches
      const updatedRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updatedRecent);
      localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

      navigate(`/shop?search=${encodeURIComponent(query)}`);
      setSearchQuery('');
      setShowSuggestions(false);
      setIsOpen(false);
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

  // Live Search Suggestions Effect
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
        const response = await axios.get(`/api/search/suggestions`, {
          params: { q: query }
        });

        if (response.data && response.data.success) {
          setSuggestions(response.data.suggestions || []);
          setSuggestedCategories(response.data.categories || []);
          setPopularSearches(response.data.popularSearches || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Search suggestion error:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 400); // Slightly longer debounce for better reliability

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Click Outside to Close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSuggestions(false);
      }
      if (!event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const topBarClasses = 'bg-maroon/85 backdrop-blur-md backdrop-saturate-150 text-white text-[10px] md:text-xs py-1 md:py-2 px-3 md:px-4 block transition-all duration-300 ring-1 ring-white/10 relative z-50 mx-2 md:mx-4 mt-1 md:mt-2 rounded-xl shadow-lg';
  const mainNavClasses = isScrolled || isOpen
    ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl backdrop-saturate-150 shadow-xl ring-1 ring-white/20 dark:ring-white/5 py-1.5 sm:py-3 rounded-2xl mx-2 md:mx-4 mt-2 md:mt-3 transition-all duration-500 hover:shadow-2xl hover:bg-white/90 dark:hover:bg-slate-900/90'
    : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg backdrop-saturate-150 shadow-lg ring-1 ring-white/20 dark:ring-white/5 py-2 sm:py-4 rounded-2xl mx-2 md:mx-4 mt-2 md:mt-3 transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5 hover:bg-white/80 dark:hover:bg-slate-900/80';

  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = language === 'bn'
    ? ['উপহার খুজুন...', 'ভালোবাসার কম্বো...', 'বার্থডে গিফট...', 'হস্তনির্মিত পণ্য...', 'সারপ্রাইজ বক্স...']
    : ['Search for gifts...', 'Love Combo...', 'Birthday Gifts...', 'Handmade Items...', 'Surprise Boxes...'];

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
          timer = setTimeout(type, 100);
        } else {
          timer = setTimeout(() => {
            isDeleting = true;
            type();
          }, 2000);
        }
      } else {
        if (charIndex > 0) {
          setPlaceholder(currentText.substring(0, charIndex - 1));
          charIndex--;
          timer = setTimeout(type, 50);
        } else {
          isDeleting = false;
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
          currentText = placeholders[(placeholderIndex + 1) % placeholders.length];
          timer = setTimeout(type, 500);
        }
      }
    };

    timer = setTimeout(type, 1000);
    return () => clearTimeout(timer);
  }, [placeholderIndex, language]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] flex flex-col w-full overflow-visible pointer-events-none">
      {/* Wrapper to re-enable pointer events for children */}
      <div className="pointer-events-auto">
        {/* 1. TOP BAR - Info & Offers with Marquee */}
        {!isSimplifiedPage && (
          <div className={topBarClasses}>
            <div className="container mx-auto flex justify-between items-center overflow-hidden">
              {/* Animated Marquee Text */}
              <div className="flex-1 overflow-hidden mr-4">
                <div className="animate-marquee whitespace-nowrap inline-block">
                  <span className="inline-flex items-center mr-8 md:mr-12 font-bold">
                    🎁 {t('welcome_offer')}
                  </span>
                  <span className="hidden sm:inline-flex items-center mr-8 md:mr-12 text-gold font-bold">
                    🚚 {t('free_shipping')}
                  </span>
                  <span className="inline-flex items-center mr-8 md:mr-12 font-bold text-pink-100">
                    ✨ Handcrafted with Love
                  </span>
                  <span className="hidden sm:inline-flex items-center mr-8 md:mr-12 text-gold font-bold">
                    🛡️ Secure Payment
                  </span>
                  {/* Seamless Loop Duplicate */}
                  <span className="inline-flex items-center mr-8 md:mr-12 font-bold">
                    🎁 {t('welcome_offer')}
                  </span>
                  <span className="hidden sm:inline-flex items-center mr-8 md:mr-12 text-gold font-bold">
                    🚚 {t('free_shipping')}
                  </span>
                  <span className="inline-flex items-center mr-8 md:mr-12 font-bold text-pink-100">
                    ✨ Handcrafted with Love
                  </span>
                  <span className="hidden sm:inline-flex items-center mr-8 md:mr-12 text-gold font-bold">
                    🛡️ Secure Payment
                  </span>
                </div>
              </div>

              {/* Right Side - Contact & Language */}
              <div className="flex items-center divide-x divide-white/20 shrink-0">
                <div className="hidden md:flex items-center space-x-4 pr-4">
                  <a href="tel:+8801851075537" className="flex items-center hover:text-gold transition-colors">
                    <Phone className="w-3 h-3 mr-1.5" /> +880 1851-075537
                  </a>
                  <a href="mailto:salauddinkaderappy@gmail.com" className="flex items-center hover:text-gold transition-colors pl-4">
                    <Mail className="w-3 h-3 mr-1.5" /> salauddinkaderappy@gmail.com
                  </a>
                </div>
                <div className="flex items-center pl-4 space-x-3 text-[10px]">
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center hover:text-gold font-bold uppercase tracking-wider"
                    aria-label={language === 'en' ? 'Switch to Bangla' : 'Switch to English'}
                  >
                    <Globe className="w-3 h-3 mr-1" />
                    {language === 'en' ? 'BN' : 'EN'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MAIN NAVBAR */}
        <nav className={`transition-all duration-300 w-auto overflow-visible ${mainNavClasses}`}>
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

                <Link to="/" className="flex items-center gap-2 group shrink-0" aria-label="RongRani Home">
                  {/* Gift Icon with creative rotation */}
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl border border-maroon/20 dark:border-white/20 p-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-sm group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 ease-out"
                    role="presentation" // Changed from img to presentation as the img tag inside handles the semantic image
                  >
                    <img
                      src="/RongRani-Circle.png"
                      alt="RongRani Logo"
                      className="w-full h-full object-contain drop-shadow-md"
                      width="48"
                      height="48"
                    />
                  </div>
                  {/* Text Logo */}
                  <div className="flex flex-col leading-none">
                    <span className="text-2xl md:text-3xl font-black text-maroon dark:text-white tracking-tight group-hover:opacity-90 transition-opacity">
                      Rong<span className="text-slate-800 dark:text-slate-200">Rani</span>
                    </span>
                  </div>
                </Link>
              </div>

              {/* Desktop Search */}
              {!isSimplifiedPage && (
                <div className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8">
                  <div className="w-full relative group search-container">
                    <form onSubmit={handleSearch} className="w-full relative" role="search">
                      <input
                        type="text"
                        placeholder={placeholder}
                        aria-label={t('search_placeholder') || "Search for gifts"}
                        className="w-full bg-slate-100 dark:bg-slate-800 border 
                                                   border-transparent focus:border-maroon/20 dark:focus:border-maroon/40
                                                   rounded-full py-2.5 pl-5 pr-12 
                                                   focus:ring-2 focus:ring-maroon/10 focus:bg-white dark:focus:bg-slate-800 
                                                   transition-all text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (!showSuggestions) setShowSuggestions(true);
                        }}
                        onFocus={() => {
                          if (searchQuery.length >= 2) setShowSuggestions(true);
                        }}
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

                    {/* Search Suggestions Dropdown */}
                    {showSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 overflow-hidden z-[9999] animate-fade-in-up">
                        {isSearching ? (
                          <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon mx-auto mb-3"></div>
                            <p className="text-xs text-slate-400 font-medium">Searching our magic collection...</p>
                          </div>
                        ) : (
                          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                            {/* 0. Popular Searches (When query is short) */}
                            {searchQuery.trim().length < 2 && (
                              <div className="p-4 border-b border-slate-50 dark:border-slate-700/50">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-3 flex items-center gap-2">
                                  <TrendingUp className="w-3 h-3 text-maroon" /> Trending Now
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {popularSearches.map((term, i) => (
                                    <button
                                      key={i}
                                      onClick={() => {
                                        setSearchQuery(term);
                                        navigate(`/shop?search=${encodeURIComponent(term)}`);
                                        setShowSuggestions(false);
                                      }}
                                      className="px-4 py-1.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-maroon hover:text-white dark:hover:bg-maroon text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold transition-all border border-slate-100 dark:border-slate-600/50"
                                    >
                                      {term}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 0.1 Recent Searches */}
                            {searchQuery.trim().length < 2 && recentSearches.length > 0 && (
                              <div className="p-4 border-b border-slate-50 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-900/10">
                                <div className="flex justify-between items-center mb-3">
                                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Recent Searches
                                  </h5>
                                  <button
                                    onClick={() => {
                                      setRecentSearches([]);
                                      localStorage.removeItem('recentSearches');
                                    }}
                                    className="text-[10px] font-bold text-maroon underline underline-offset-2"
                                  >
                                    Clear All
                                  </button>
                                </div>
                                <div className="space-y-1">
                                  {recentSearches.map((term, i) => (
                                    <button
                                      key={i}
                                      onClick={() => {
                                        setSearchQuery(term);
                                        navigate(`/shop?search=${encodeURIComponent(term)}`);
                                        setShowSuggestions(false);
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

                            {/* 1. Category Suggestions */}
                            {suggestedCategories.length > 0 && searchQuery.trim().length >= 2 && (
                              <div className="p-4 border-b border-slate-50 dark:border-slate-700/50 bg-maroon/[0.02] dark:bg-pink-400/[0.02]">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-3">
                                  Suggested Categories
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {suggestedCategories.map((cat, i) => (
                                    <Link
                                      key={i}
                                      to={`/shop?category=${encodeURIComponent(cat)}`}
                                      className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 hover:border-maroon dark:hover:border-pink-400 border border-slate-100 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
                                      onClick={() => setShowSuggestions(false)}
                                    >
                                      <LayoutDashboard className="w-3 h-3 text-maroon dark:text-pink-400" />
                                      {highlightMatch(cat, searchQuery)}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 2. Product Suggestions */}
                            <div className="p-2">
                              {suggestions.length > 0 ? (
                                <>
                                  <h5 className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                    Products Found
                                  </h5>
                                  {suggestions.map((product) => (
                                    <Link
                                      key={product._id}
                                      to={`/product/${product._id}`}
                                      className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all rounded-2xl group"
                                      onClick={() => {
                                        setShowSuggestions(false);
                                        setSearchQuery('');
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
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.category}</span>
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
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">No matches found</p>
                                    <p className="text-xs text-slate-500">Try searching for gifts, combos or boxes</p>
                                  </div>
                                )
                              )}
                            </div>

                            {suggestions.length > 0 && (
                              <Link
                                to={`/shop?search=${encodeURIComponent(searchQuery)}`}
                                className="flex items-center justify-center gap-2 p-4 bg-slate-50/50 dark:bg-slate-900/30 text-sm font-black text-maroon dark:text-pink-400 border-t border-slate-50 dark:border-slate-700/50 hover:bg-maroon hover:text-white dark:hover:bg-maroon transition-all"
                                onClick={() => setShowSuggestions(false)}
                              >
                                View All {suggestions.length > 5 ? 'Result' : 'Results'} 🚀
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
                          className={`text-sm font-bold uppercase tracking-wide px-4 py-2 rounded-full transition-all duration-300 relative group overflow-hidden ${location.pathname === item.to
                            ? 'text-maroon dark:text-pink-400 bg-maroon/5 dark:bg-pink-400/10 shadow-inner'
                            : 'text-slate-600 dark:text-slate-400 hover:text-maroon dark:hover:text-pink-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                        >
                          <span className="relative z-10">{t(item.label)}</span>
                          {/* Creative underline splash */}
                          {location.pathname === item.to && (
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-maroon dark:bg-pink-400 rounded-full mb-1"></span>
                          )}
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
              <div className="md:hidden mt-2 pb-0.5 relative search-container z-[100]">
                <form onSubmit={handleSearch} className="w-full relative" role="search">
                  <input
                    type="text"
                    placeholder={placeholder}
                    aria-label={t('search_placeholder') || "Search for gifts"}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-4 pr-10 focus:ring-2 focus:ring-maroon text-xs"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!showSuggestions) setShowSuggestions(true);
                    }}
                    onFocus={() => {
                      if (searchQuery.length >= 2) setShowSuggestions(true);
                    }}
                  />
                  <button type="submit" className="absolute right-0 top-0 h-full px-3 text-slate-500 hover:text-maroon">
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                {/* Mobile Search Suggestions Dropdown */}
                {showSuggestions && (searchQuery.length >= 2 || suggestions.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-600 overflow-hidden z-[99999] animate-fade-in-up max-h-[60vh] overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-maroon mx-auto"></div>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div>
                        {suggestions.map((product) => (
                          <Link
                            key={product._id}
                            to={`/product/${product._id}`}
                            className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b last:border-0 border-slate-50 dark:border-slate-700/50"
                            onClick={() => {
                              setShowSuggestions(false);
                              setSearchQuery('');
                            }}
                          >
                            <div className="w-10 h-10 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                              <img
                                src={product.image?.url || product.image || '/placeholder.jpg'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{product.name}</h4>
                              <p className="text-xs font-black text-maroon dark:text-pink-400">৳{product.price}</p>
                            </div>
                          </Link>
                        ))}
                        <Link
                          to={`/shop?search=${encodeURIComponent(searchQuery)}`}
                          className="block p-3 text-center text-sm font-bold text-maroon dark:text-pink-400 border-t border-slate-50 dark:border-slate-700/50"
                          onClick={() => setShowSuggestions(false)}
                        >
                          View All Result 🚀
                        </Link>
                      </div>
                    ) : (
                      searchQuery.length >= 2 && !isSearching && (
                        <div className="p-6 text-center">
                          <p className="text-xs font-medium text-slate-500">No products found for "{searchQuery}"</p>
                        </div>
                      )
                    )}
                  </div>
                )}
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
                  <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-maroon p-0.5 bg-white overflow-hidden shadow-sm">
                    <img src="/RongRani-[Recovered].png" alt="Logo" className="w-full h-full object-cover" />
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
    </div>
  );
};

export default Navbar;