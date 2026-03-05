import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const SearchWithSuggestions = ({ className = '' }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [popularSearches, setPopularSearches] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [trending, setTrending] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const { t } = useLanguage();

    useEffect(() => {
        // Load recent searches from localStorage
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        setRecentSearches(recent.slice(0, 5));

        // Fetch trending searches
        fetchTrending();

        // Click outside to close
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length >= 2) {
            const delayDebounce = setTimeout(() => {
                fetchSuggestions();
            }, 300);
            return () => clearTimeout(delayDebounce);
        } else {
            setSuggestions([]);
            setPopularSearches([]);
        }
    }, [query]);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
            if (response.data.success) {
                setSuggestions(response.data.suggestions || []);
                setPopularSearches(response.data.popularSearches || []);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrending = async () => {
        try {
            const response = await axios.get('/api/search/trending');
            if (response.data.success) {
                setTrending(response.data.trending || []);
            }
        } catch (error) {
            console.error('Error fetching trending:', error);
        }
    };

    const saveToRecentSearches = (searchTerm) => {
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const updated = [searchTerm, ...recent.filter(s => s !== searchTerm)].slice(0, 10);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
        setRecentSearches(updated.slice(0, 5));
    };

    const handleSearch = (searchTerm) => {
        if (!searchTerm.trim()) return;

        saveToRecentSearches(searchTerm);
        setQuery('');
        setIsOpen(false);
        navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch(query);
    };

    const handleSuggestionClick = (product) => {
        saveToRecentSearches(product.name);
        setQuery('');
        setIsOpen(false);
        navigate(`/product/${product.slug || product._id}`);
    };

    const clearRecentSearches = () => {
        localStorage.removeItem('recentSearches');
        setRecentSearches([]);
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={t('search_products') || 'Search products...'}
                    className="w-full pl-12 pr-10 py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-maroon focus:ring-2 focus:ring-maroon/20 transition-all outline-none"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

                {query && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery('');
                            setSuggestions([]);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <X className="h-4 w-4 text-slate-400" />
                    </button>
                )}
            </form>

            {/* Suggestions Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[500px] overflow-y-auto z-50">
                    {/* Loading State */}
                    {loading && (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-maroon mx-auto"></div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Searching...</p>
                        </div>
                    )}

                    {/* Product Suggestions */}
                    {!loading && suggestions.length > 0 && (
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Products
                            </div>
                            {suggestions.map((product) => (
                                <button
                                    key={product._id}
                                    onClick={() => handleSuggestionClick(product)}
                                    className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors text-left"
                                >
                                    {product.image?.url && (
                                        <img
                                            src={product.image.url}
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                            {product.name}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {product.category} • ৳{product.price}
                                        </div>
                                    </div>
                                    <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Popular Searches */}
                    {!loading && query.length >= 2 && popularSearches.length > 0 && (
                        <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                            <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Popular Searches
                            </div>
                            {popularSearches.map((term, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearch(term)}
                                    className="w-full flex items-center space-x-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors text-left"
                                >
                                    <TrendingUp className="h-4 w-4 text-maroon flex-shrink-0" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{term}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Recent Searches */}
                    {!loading && query.length < 2 && recentSearches.length > 0 && (
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Recent Searches
                                </div>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-xs text-maroon hover:underline"
                                >
                                    Clear
                                </button>
                            </div>
                            {recentSearches.map((term, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearch(term)}
                                    className="w-full flex items-center space-x-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors text-left"
                                >
                                    <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{term}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Trending Searches */}
                    {!loading && query.length < 2 && trending.length > 0 && (
                        <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                            <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Trending Now
                            </div>
                            <div className="flex flex-wrap gap-2 px-3">
                                {trending.map((term, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSearch(term)}
                                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-maroon hover:text-white rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {!loading && query.length >= 2 && suggestions.length === 0 && popularSearches.length === 0 && (
                        <div className="p-8 text-center">
                            <Search className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                No results found for "{query}"
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Try different keywords or browse our categories
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchWithSuggestions;
