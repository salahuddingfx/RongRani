import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import QuickViewModal from './QuickViewModal';

const ProductItem = ({ product }) => {
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
    const productStock = product.stock || 0;
    const productRating = product.rating || 0;
    const hasDiscount = product.originalPrice && product.originalPrice > productPrice;
    const discountPercent = hasDiscount
        ? Math.round(((product.originalPrice - productPrice) / product.originalPrice) * 100)
        : 0;

    return (
        <>
            <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 flex flex-col h-full ring-1 ring-slate-200/50 hover:ring-maroon/20">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-slate-50">
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-slate-100 animate-pulse" />
                    )}

                    <Link to={`/product/${product._id}`} className="block w-full h-full">
                        <img
                            src={productImage}
                            alt={productName}
                            width="300"
                            height="300"
                            loading="lazy"
                            decoding="async"
                            onLoad={() => setImageLoaded(true)}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                    </Link>

                    {/* Discount Badge - Minimalist */}
                    {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-maroon text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10">
                            -{discountPercent}%
                        </div>
                    )}

                    {/* Action Buttons Overlay (Desktop Hover) */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
                        <button
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-slate-600 hover:text-maroon shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 active:scale-90 hidden sm:flex items-center justify-center"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowQuickView(true);
                            }}
                            aria-label={t('quick_view')}
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-slate-600 hover:text-pink-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 delayed-100 active:scale-90 hidden sm:flex items-center justify-center"
                            aria-label={t('add_to_wishlist')}
                        >
                            <Heart className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Product Info - Compact Design */}
                <div className="p-2.5 sm:p-3 flex flex-col flex-grow">
                    <Link to={`/product/${product._id}`} className="block group-hover:text-maroon transition-colors mb-1">
                        <h3 className="text-[11px] sm:text-xs font-semibold text-slate-800 line-clamp-2 leading-tight min-h-[2.4em]" title={productName}>
                            {productName}
                        </h3>
                    </Link>

                    {/* Price Component */}
                    <div className="mt-1 mb-2">
                        <div className="flex items-center flex-wrap gap-1.5 align-baseline">
                            <span className="text-sm font-bold text-maroon">
                                ৳{productPrice.toLocaleString()}
                            </span>
                            {hasDiscount && (
                                <span className="text-[10px] text-slate-400 line-through decoration-slate-400">
                                    ৳{product.originalPrice.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Footer: Rating & Cart */}
                    <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-2">
                        {/* Rating */}
                        <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] font-medium text-slate-600">
                                {productRating > 0 ? productRating.toFixed(1) : 'New'}
                            </span>
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={productStock === 0}
                            className={`
                p-1.5 sm:p-2 rounded-lg transition-all duration-300 active:scale-95
                ${productStock > 0
                                    ? 'bg-maroon/5 text-maroon hover:bg-maroon hover:text-white'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
              `}
                            aria-label={t('add_to_cart')}
                        >
                            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
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

export default ProductItem;
