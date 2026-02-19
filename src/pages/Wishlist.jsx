import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Package, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import Seo from '../components/Seo';

const Wishlist = () => {
  const { addToCart } = useCart();
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { t } = useLanguage();

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
  };

  const getImageUrl = (item) => {
    if (!item.images || item.images.length === 0) {
      return item.image?.url || item.image || '/placeholder.jpg';
    }
    const first = item.images[0];
    return typeof first === 'string' ? first : first.url;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-900">
        <Seo title="My Wishlist | RongRani" description="Your favorite items saved for later." path="/wishlist" />
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-24 h-24 bg-maroon/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Heart className="h-12 w-12 text-maroon" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            {t('wishlist_empty') || 'Your Wishlist is Empty'}
          </h2>
          <p className="text-slate-500 text-lg mb-8 leading-relaxed">
            {t('wishlist_empty_msg') || 'Start adding your favorite gift items to your wishlist'}
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center space-x-2 px-8 py-4 shadow-xl shadow-maroon/20 hover:shadow-maroon/40 transform hover:-translate-y-1 transition-all">
            <Package className="h-5 w-5" />
            <span>{t('browse_products') || 'Browse Products'}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <Seo title="My Wishlist | RongRani" description="Your favorite items saved for later." path="/wishlist" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center md:text-left animate-fade-in-down">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-maroon/10 rounded-2xl border border-maroon/20">
              <Heart className="h-6 w-6 text-maroon fill-maroon" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
              {t('my_wishlist') || 'My Wishlist'}
            </h1>
          </div>
          <p className="text-slate-500 text-lg font-medium max-w-2xl">
            {t('wishlist_subtitle') || 'Save your favorite gift items and complete your purchase when you’re ready.'}
          </p>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item, index) => (
            <div
              key={item._id}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden group hover:shadow-2xl hover:border-maroon/20 transition-all duration-500 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-700">
                <Link to={`/product/${item._id}`}>
                  <img
                    src={getImageUrl(item)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                </Link>
                {item.originalPrice > item.price && (
                  <div className="absolute top-4 left-4 bg-maroon text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg">
                    {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                  </div>
                )}
                <button
                  onClick={() => removeFromWishlist(item._id)}
                  className="absolute top-4 right-4 p-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white rounded-xl shadow-lg transition-all duration-300 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-100 dark:border-slate-600">
                    {item.category || 'Premium'}
                  </span>
                  {item.rating > 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{item.rating}</span>
                    </div>
                  )}
                </div>

                <Link to={`/product/${item._id}`}>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-maroon transition-colors line-clamp-2 leading-tight min-h-[3rem]">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-2xl font-black text-maroon">
                    ৳{item.price.toLocaleString()}
                  </span>
                  {item.originalPrice > item.price && (
                    <span className="text-sm text-slate-400 line-through font-bold">
                      ৳{item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50 dark:border-slate-700">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock === 0}
                    className="flex items-center justify-center gap-2 bg-maroon text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-maroon/20 hover:shadow-maroon/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>{item.stock > 0 ? t('add_to_cart') || 'Add to Cart' : t('out_of_stock') || 'Out of Stock'}</span>
                  </button>
                  <Link
                    to={`/product/${item._id}`}
                    className="flex items-center justify-center bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-all border border-slate-100 dark:border-slate-600"
                  >
                    {t('view_detail') || 'Details'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 bg-cream/30 dark:bg-slate-800/50 p-8 rounded-[3rem] border border-maroon/5 dark:border-slate-700 text-center animate-fade-in">
          <p className="text-5xl font-black text-maroon mb-2">{wishlist.length}</p>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
            {t('items_in_wishlist') || 'Items in your wishlist'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
