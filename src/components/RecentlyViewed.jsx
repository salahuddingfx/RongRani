import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, X } from 'lucide-react';

const RecentlyViewed = ({ mode = 'widget' }) => {
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

  const isWidget = mode === 'widget';

  if (!recentProducts.length) return null;
  if (isWidget && !isVisible) return null;

  if (mode === 'section') {
    return (
      <div className="mt-12 mb-8 animate-fade-in-up">
        <h3 className="text-2xl font-bold text-maroon mb-6 flex items-center gap-2">
          <Eye className="h-6 w-6" />
          <span>Recently Viewed</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentProducts.map((product, index) => (
            <Link
              key={product._id || index}
              to={`/product/${product._id}`}
              className="card p-3 hover:shadow-lg transition-all group block"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl mb-3">
                <img
                  src={product.images?.[0]?.url || product.images?.[0] || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1 truncate group-hover:text-maroon">
                {product.name}
              </h4>
              <p className="text-maroon font-bold text-sm">
                ৳{product.price?.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-32 sm:bottom-40 left-2 sm:left-4 z-40 bg-white rounded-2xl shadow-2xl p-3 sm:p-4 max-w-xs border-2 border-maroon/10 animate-slide-in-left">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 sm:space-x-2">
          <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-maroon flex-shrink-0" />
          <h3 className="font-bold text-xs sm:text-sm text-charcoal">Recently Viewed</h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            clearRecent();
          }}
          className="text-slate hover:text-maroon transition-colors flex-shrink-0"
          aria-label="Clear recent"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        {recentProducts.map((product, index) => (
          <Link
            key={product._id || index}
            to={`/product/${product._id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 sm:space-x-2 hover:bg-cream p-1.5 sm:p-2 rounded-xl transition-colors group"
          >
            <img
              src={product.images?.[0]?.url || product.images?.[0] || '/placeholder.jpg'}
              alt={product.name}
              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg group-hover:scale-110 transition-transform flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-charcoal truncate group-hover:text-maroon transition-colors">
                {product.name}
              </p>
              <p className="text-[10px] sm:text-xs text-maroon font-bold">
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
