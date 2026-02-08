import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import QuickViewModal from './QuickViewModal';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [showQuickView, setShowQuickView] = useState(false);

  // Safe rendering - return null if no product data
  if (!product || !product._id) {
    return null;
  }

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  const productName = product.name || 'Unnamed Product';
  const productPrice = product.price || 0;
  const productImages = product.images || [];
  const firstImage = productImages[0];
  const directImage =
    typeof product.image === 'string' ? product.image : product.image?.url;
  const productImage =
    (typeof firstImage === 'string' ? firstImage : firstImage?.url) ||
    directImage ||
    '/api/placeholder/300/300';
  const productCategory = product.category || 'General';
  const productStock = product.stock || 0;
  const productRating = product.rating || 0;
  const productReviewCount = product.reviewCount || 0;
  const hasDiscount = product.originalPrice && product.originalPrice > productPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - productPrice) / product.originalPrice) * 100)
    : 0;
  const stockLabel = productStock > 0 ? 'In stock' : 'Out of stock';
  const stockTone = productStock > 0 ? 'text-emerald-600' : 'text-red-500';

  return (
    <>
      <div className="card group cursor-pointer overflow-hidden animate-fade-in-up">
        <div className="relative overflow-hidden">
          <img
            src={productImage}
            alt={productName}
            className="w-full h-52 sm:h-64 lg:h-72 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-500"></div>

          {/* Quick View & Wishlist Buttons */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex space-x-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowQuickView(true);
              }}
              className="p-2.5 sm:p-3 bg-white/95 backdrop-blur-sm rounded-2xl hover:bg-white shadow-lg group-hover:scale-110 transform transition-all duration-300 hover:shadow-2xl border border-white/20"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-maroon hover:text-maroon-light transition-colors duration-300" />
            </button>
            <button
              className="p-2.5 sm:p-3 bg-white/95 backdrop-blur-sm rounded-2xl hover:bg-white shadow-lg group-hover:scale-110 transform transition-all duration-300 hover:shadow-2xl border border-white/20"
              aria-label="Add to wishlist"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 hover:text-red-500 transition-colors duration-300" />
            </button>
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-red-500 text-white px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-bold shadow-xl border border-white/30">
              Save {discountPercent}%
            </div>
          )}

          {/* Stock Status */}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex flex-wrap items-center gap-2">
            <span className="bg-white/90 text-charcoal px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-semibold shadow-lg">
              {stockLabel}
            </span>
            <span className="bg-white/90 text-charcoal px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-semibold shadow-lg">
              2-3 days delivery
            </span>
          </div>

          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/90 text-charcoal px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-semibold shadow-lg">
            {productRating.toFixed(1)} ★ ({productReviewCount})
          </div>

          {/* Add to Cart Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/85 p-4 sm:p-6 transform translate-y-0 sm:translate-y-full sm:group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <button
              onClick={handleAddToCart}
              disabled={productStock === 0}
              className="w-full bg-maroon text-white py-2.5 sm:py-4 px-5 sm:px-6 rounded-2xl hover:bg-maroon-light font-bold transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform border-2 border-white/20 text-sm sm:text-base"
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="inline-block text-[10px] sm:text-xs font-bold text-maroon bg-maroon/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl uppercase tracking-wider border border-maroon/20">
              {productCategory}
            </span>
            <span className={`text-[10px] sm:text-xs font-semibold ${stockTone}`}>
              {productStock} left
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-charcoal mb-2 sm:mb-3 line-clamp-2 group-hover:text-maroon transition-colors duration-300 leading-tight">
            <Link to={`/product/${product._id}`} className="hover:text-maroon">
              {productName}
            </Link>
          </h3>

          <p className="text-charcoal-light text-sm mb-4 sm:mb-5 line-clamp-2 leading-relaxed">
            {product.description || 'No description available'}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(productRating || 0)
                      ? 'fill-current text-yellow-400 drop-shadow-sm'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] sm:text-xs text-charcoal-light font-medium">
              {productRating?.toFixed(1) || '0.0'} / 5 ({productReviewCount || 0})
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-3">
              <span className="text-2xl sm:text-3xl font-bold text-maroon">
                ৳{productPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs sm:text-sm text-charcoal-light line-through font-medium">
                  ৳{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <Link
              to={`/product/${product._id}`}
              className="text-[11px] sm:text-xs font-semibold text-maroon hover:text-maroon-light"
            >
              View details →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
};

export default ProductCard;