import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ShoppingCart, ArrowRight, Shield, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useDeliveryCalculation } from '../hooks/useDeliveryCalculation';
import RecentlyViewed from '../components/RecentlyViewed';
import { useLanguage } from '../contexts/LanguageContext';

const Cart = () => {
  const { cartItems, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { delivery, fetchDelivery } = useDeliveryCalculation();
  const { t } = useLanguage();

  // Fetch delivery estimate for display (using default Cox's Bazar area)
  useEffect(() => {
    if (totalPrice > 0) {
      fetchDelivery(totalPrice, 'Cox\'s Bazar', 'Cox\'s Bazar');
    }
  }, [totalPrice, fetchDelivery]);

  const [giftWrapping, setGiftWrapping] = useState(false);
  const giftWrappingFee = 50;

  const shipping = delivery?.charge || 0;
  const tax = 0; // No tax
  const finalTotal = totalPrice + shipping + tax + (giftWrapping ? giftWrappingFee : 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-pink-50">
        <div className="text-center card p-12 max-w-md">
          <div className="w-24 h-24 bg-slate/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-slate" />
          </div>
          <h2 className="text-3xl font-bold text-maroon mb-4">
            {t('empty_cart')}
          </h2>
          <p className="text-slate text-lg mb-8">
            {t('empty_cart_msg')}
          </p>
          <Link
            to="/shop"
            className="btn-primary px-8 py-4 rounded-full font-semibold text-lg inline-flex items-center space-x-2 hover:scale-105 transition-transform"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>{t('start_shopping')}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Customer Benefits Banner - Only show if logged in */}
      {isAuthenticated && (
        <div className="bg-maroon text-white py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gold">⭐</span>
                <span>{t('lifetime_customer')}</span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <span>🚚</span>
                <span>{t('free_shipping_calc').replace('{amount}', '2500')}</span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <span>💝</span>
                <span>{t('exclusive_discounts')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="hero-section py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-maroon mb-6">
            {t('your_cart_title')}
          </h1>
          <p className="text-xl text-slate max-w-2xl mx-auto">
            {t('review_selections')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-maroon">{t('items_in_cart').replace('{count}', totalItems)}</h2>
              <Link
                to="/shop"
                className="text-slate hover:text-maroon transition-colors underline font-medium"
              >
                {t('continue_shopping')}
              </Link>
            </div>

            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className="card p-4 sm:p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:space-x-6">
                  {/* Product Image */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg sm:rounded-xl shadow-lg"
                    />
                    {item.discount > 0 && (
                      <div className="absolute -top-2 -right-2 bg-maroon text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{item.discount}%
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-maroon mb-1">
                      <Link
                        to={`/product/${item.slug || item.id}`}
                        className="hover:text-maroon-light transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                    </h3>
                    <p className="text-sm sm:text-base text-slate font-medium">৳{item.price.toLocaleString()}</p>
                    <p className="text-xs sm:text-sm text-slate/70">{item.category}</p>
                  </div>

                  {/* Mobile: Quantity and Price Row */}
                  <div className="w-full sm:hidden flex items-center justify-between gap-2 pt-2 border-t border-slate/10">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="btn-secondary p-1.5 rounded-lg hover:scale-110 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={item.quantity <= 1}
                        title="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 py-1 bg-slate/10 rounded-lg font-semibold text-maroon w-10 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, Math.min(item.stock || 999, item.quantity + 1))}
                        className="btn-secondary p-1.5 rounded-lg hover:scale-110 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={item.quantity >= (item.stock || 999)}
                        title={item.quantity >= (item.stock || 999) ? "Max stock reached" : "Increase quantity"}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Total Price */}
                    <p className="text-lg font-bold text-maroon">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </p>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                      title="Remove from cart"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Desktop: Quantity Controls */}
                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="btn-secondary p-2 rounded-full hover:scale-110 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1}
                      title="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 bg-slate/10 rounded-full font-semibold text-maroon min-w-[50px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, Math.min(item.stock || 999, item.quantity + 1))}
                      className="btn-secondary p-2 rounded-full hover:scale-110 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={item.quantity >= (item.stock || 999)}
                      title={item.quantity >= (item.stock || 999) ? "Max stock reached" : "Increase quantity"}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Desktop: Price and Remove */}
                  <div className="hidden sm:block text-right">
                    <p className="text-2xl font-bold text-maroon mb-2">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-full"
                      title="Remove from cart"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-4 lg:space-y-6">
            {/* Order Summary Card */}
            <div className="card p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-xl sm:text-2xl font-bold text-maroon mb-4 sm:mb-6">{t('order_summary')}</h2>

              {/* Free Shipping Progress Bar */}
              <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {totalPrice >= 2500
                      ? t('unlocked_free_shipping')
                      : t('more_for_free_shipping').replace('{amount}', (2500 - totalPrice).toLocaleString())}
                  </span>
                  <Truck className={`w-4 h-4 ${totalPrice >= 2500 ? 'text-green-500' : 'text-slate-400'}`} />
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${totalPrice >= 2500 ? 'bg-green-500' : 'bg-maroon'}`}
                    style={{ width: `${Math.min((totalPrice / 2500) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-slate">{t('items_label')} ({totalItems})</span>
                  <span className="font-semibold text-maroon">৳{totalPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-slate">{t('shipping')}</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-maroon'}`}>
                    {shipping === 0 ? t('free') : `৳${shipping}`}
                  </span>
                </div>

                {/* Gift Wrapping Toggle */}
                <div className="flex items-center justify-between text-sm sm:text-base py-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        id="giftWrapping"
                        checked={giftWrapping}
                        onChange={(e) => setGiftWrapping(e.target.checked)}
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 shadow transition-all hover:shadow-md checked:bg-maroon checked:border-maroon focus:outline-none focus:ring-1 focus:ring-maroon focus:ring-offset-1"
                      />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </span>
                    </div>
                    <label htmlFor="giftWrapping" className="flex items-center gap-1.5 cursor-pointer select-none text-slate">
                      <span className="text-amber-500">🎁</span>
                      <span>{t('gift_wrapping')}</span>
                    </label>
                  </div>
                  <span className="font-semibold text-maroon">৳{giftWrappingFee}</span>
                </div>

                <hr className="border-slate/20" />

                <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
                  <span className="text-maroon">{t('total')}</span>
                  <span className="text-maroon">৳{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                state={{ giftWrapping }}
                className="btn-primary w-full py-3 sm:py-4 px-4 rounded-full font-semibold text-sm sm:text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform mb-3 sm:mb-4"
              >
                <span>{t('checkout')}</span>
                <ArrowRight className="h-4 sm:h-5 w-4 sm:w-5" />
              </Link>

              <Link
                to="/shop"
                className="btn-secondary w-full py-2 sm:py-3 px-4 rounded-full font-medium text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{t('continue_shopping')}</span>
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="card p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                <Truck className="h-6 sm:h-8 w-6 sm:w-8 text-maroon flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-semibold text-maroon text-sm sm:text-base">{t('fast_delivery_title')}</h4>
                  <p className="text-xs sm:text-sm text-slate">{t('on_orders_over').replace('{amount}', '2500')}</p>
                </div>
              </div>

              <div className="card p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                <Shield className="h-6 sm:h-8 w-6 sm:w-8 text-maroon flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-semibold text-maroon text-sm sm:text-base">{t('secure_checkout_label')}</h4>
                  <p className="text-xs sm:text-sm text-slate">{t('ssl_encrypted')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Viewed Section */}
        <RecentlyViewed mode="section" />
      </div>
    </div>
  );
};

export default Cart;