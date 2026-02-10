import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye, Zap } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import QuickViewModal from './QuickViewModal';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [showQuickView, setShowQuickView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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
  const stockLabel = productStock > 0 ? t('in_stock') : t('out_of_stock');
  const stockTone = productStock > 0 ? 'text-emerald-600' : 'text-red-500';

  return (
    <>
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 animate-fade-in-up border border-slate-100 hover:border-maroon/20">
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-square bg-slate-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-200 animate-pulse" />
          )}
          <img
            src={productImage}
            alt={productName}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {/* Discount Badge */}
            {hasDiscount && (
              <div className="bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
                <Zap className="w-3 h-3" />
                {discountPercent}% {t('off')}
              </div>
            )}

            {/* New Badge */}
            {product.isNew && (
              <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                {t('new_arrival')}
              </div>
            )}

            {/* Premium Badge for High Ratings */}
            {product.rating >= 4.5 && (
              <div className="bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                {t('language') === 'bn' ? 'বেস্ট সেলার' : 'Best Seller'}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowQuickView(true);
              }}
              className="p-2.5 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-maroon hover:text-white shadow-lg transform hover:scale-110 transition-all duration-300"
              aria-label={t('quick_view')}
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              className="p-2.5 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-pink-600 hover:text-white shadow-lg transform hover:scale-110 transition-all duration-300"
              aria-label={t('add_to_wishlist')}
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {/* Stock Status - Bottom Left */}
          <div className="absolute bottom-3 left-3">
            <span className={`bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${stockTone}`}>
              {stockLabel}
            </span>
          </div>

          {/* Add to Cart Button - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <button
              onClick={handleAddToCart}
              disabled={productStock === 0}
              className="w-full bg-maroon text-white py-3 px-4 rounded-xl hover:bg-maroon-dark font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{t('add_to_cart')}</span>
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category & Rating */}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-block text-xs font-bold text-maroon bg-maroon/10 px-3 py-1 rounded-full uppercase tracking-wide">
              {productCategory}
            </span>
            <div className="flex items-center gap-1" aria-label={`Rating: ${productRating.toFixed(1)} out of 5 stars`}>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-600">
                {productRating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-maroon transition-colors duration-300 leading-tight min-h-[2.5rem]">
            <Link to={`/product/${product._id}`}>
              {productName}
            </Link>
          </h3>

          {/* Description */}
          <p className="text-slate-500 text-sm mb-3 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {product.description || (t('language') === 'bn' ? 'বিবরণ উপলব্ধ নেই' : 'No description available')}
          </p>

          {/* Price & Stock */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-maroon">
                  ৳{productPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through font-medium">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 mt-1">
                {productStock > 0 ? `${productStock} ${t('language') === 'bn' ? 'টি বাকি' : 'left'}` : ''}
              </span>
            </div>

            <Link
              to={`/product/${product._id}`}
              className="text-xs font-semibold text-maroon hover:text-pink-600 flex items-center gap-1 group/link"
            >
              {t('language') === 'bn' ? 'বিস্তারিত' : 'Details'}
              <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
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