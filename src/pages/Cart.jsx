import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ShoppingCart, ArrowRight, Shield, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { cartItems, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();

  const shipping = totalPrice > 2000 ? 0 : 50;
  const tax = 0; // No tax
  const finalTotal = totalPrice + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-pink-50">
        <div className="text-center card p-12 max-w-md">
          <div className="w-24 h-24 bg-slate/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-slate" />
          </div>
          <h2 className="text-3xl font-bold text-maroon mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-slate text-lg mb-8">
            Discover beautiful handcrafted treasures and add them to your cart
          </p>
          <Link
            to="/shop"
            className="btn-primary px-8 py-4 rounded-full font-semibold text-lg inline-flex items-center space-x-2 hover:scale-105 transition-transform"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Start Shopping</span>
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
                <span>You're a Lifetime Customer!</span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <span>🚚</span>
                <span>Free Shipping Above ৳2000</span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <span>💝</span>
                <span>Exclusive Member Discounts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="hero-section py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-maroon mb-6">
            Your Shopping Cart
          </h1>
          <p className="text-xl text-slate max-w-2xl mx-auto">
            Review your beautiful selections before checkout
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-maroon">Cart Items ({totalItems})</h2>
              <Link
                to="/shop"
                className="text-slate hover:text-maroon transition-colors underline font-medium"
              >
                Continue Shopping
              </Link>
            </div>

            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className="card p-6 animate-slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-center space-x-6">
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl shadow-lg"
                    />
                    {item.discount > 0 && (
                      <div className="absolute -top-2 -right-2 bg-maroon text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{item.discount}%
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-maroon mb-2">
                      <Link
                        to={`/product/${item.id}`}
                        className="hover:text-maroon-light transition-colors"
                      >
                        {item.name}
                      </Link>
                    </h3>
                    <p className="text-slate font-medium">৳{item.price.toLocaleString()}</p>
                    <p className="text-sm text-slate/70">{item.category}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="btn-secondary p-2 rounded-full hover:scale-110 transition-transform"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="px-4 py-2 bg-slate/10 rounded-full font-semibold text-maroon min-w-[50px] text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="btn-secondary p-2 rounded-full hover:scale-110 transition-transform"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Price and Remove */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-maroon mb-2">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="card p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-maroon mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate">Items ({totalItems})</span>
                  <span className="font-semibold text-maroon">৳{totalPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate">Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-maroon'}`}>
                    {shipping === 0 ? 'FREE' : `৳${shipping}`}
                  </span>
                </div>

                <hr className="border-slate/20" />

                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-maroon">Total</span>
                  <span className="text-maroon">৳{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-primary w-full py-4 rounded-full font-semibold text-lg flex items-center justify-center space-x-2 hover:scale-105 transition-transform mb-4"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                to="/shop"
                className="btn-secondary w-full py-3 rounded-full font-medium flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4">
              <div className="card p-4 flex items-center space-x-3">
                <Truck className="h-8 w-8 text-maroon" />
                <div>
                  <h4 className="font-semibold text-maroon">Free Shipping</h4>
                  <p className="text-sm text-slate">On orders over ৳2000</p>
                </div>
              </div>

              <div className="card p-4 flex items-center space-x-3">
                <Shield className="h-8 w-8 text-maroon" />
                <div>
                  <h4 className="font-semibold text-maroon">Secure Checkout</h4>
                  <p className="text-sm text-slate">SSL encrypted payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;