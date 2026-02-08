import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, X } from 'lucide-react';

const RecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load recently viewed from localStorage
    const loadRecentlyViewed = () => {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRecentProducts(parsed.slice(0, 4)); // Show max 4 recent products
        } catch (error) {
          console.error('Error parsing recently viewed:', error);
        }
      }
    };

    loadRecentlyViewed();
    
    // Check visibility after scroll
    const handleScroll = () => {
      setIsVisible(window.pageYOffset > 500 && recentProducts.length > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [recentProducts.length]);

  const clearRecent = () => {
    localStorage.removeItem('recentlyViewed');
    setRecentProducts([]);
  };

  if (!isVisible || recentProducts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-6 z-40 bg-white rounded-2xl shadow-2xl p-4 max-w-xs border-2 border-maroon/10 animate-slide-in-left">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-maroon" />
          <h3 className="font-bold text-sm text-charcoal">Recently Viewed</h3>
        </div>
        <button
          onClick={clearRecent}
          className="text-slate hover:text-maroon transition-colors"
          aria-label="Clear recent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        {recentProducts.map((product, index) => (
          <Link
            key={product._id || index}
            to={`/product/${product._id}`}
            className="flex items-center space-x-2 hover:bg-cream p-2 rounded-xl transition-colors group"
          >
            <img
              src={product.images?.[0] || '/placeholder.jpg'}
              alt={product.name}
              className="w-12 h-12 object-cover rounded-lg group-hover:scale-110 transition-transform"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-charcoal truncate group-hover:text-maroon transition-colors">
                {product.name}
              </p>
              <p className="text-xs text-maroon font-bold">
                ৳{product.price?.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
