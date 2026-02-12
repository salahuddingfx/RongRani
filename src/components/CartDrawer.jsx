import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartDrawer = () => {
    const {
        cartItems,
        totalPrice,
        updateQuantity,
        removeFromCart,
        isCartOpen,
        closeCart
    } = useCart();
    const navigate = useNavigate();

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isCartOpen]);

    if (!isCartOpen) return null;

    const handleCheckout = () => {
        closeCart();
        navigate('/checkout');
    };

    const handleViewCart = () => {
        closeCart();
        navigate('/cart');
    };

    return (
        <div className="fixed inset-0 z-[1001] flex justify-end">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl animate-slide-left flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-maroon dark:text-pink-400" />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Shopping Cart ({cartItems.length})</h2>
                    </div>
                    <button
                        onClick={closeCart}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-10 h-10 text-slate-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Your cart is empty</h3>
                                <p className="text-slate-500 dark:text-slate-400">Looks like you haven't added anything yet.</p>
                            </div>
                            <button
                                onClick={closeCart}
                                className="btn-primary px-6 py-2 rounded-full"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.id} className="group relative flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
                                {/* Image */}
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-200 dark:border-slate-700">
                                    <img
                                        src={item.image?.url || item.image || '/placeholder.jpg'}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div className="pr-6">
                                        <h4 className="font-bold text-slate-800 dark:text-white truncate">{item.name}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 h-8">
                                            <button
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                disabled={item.quantity <= 1}
                                                className="px-2 h-full hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 rounded-l-lg transition-colors border-r border-slate-100 dark:border-slate-800"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold text-slate-800 dark:text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, Math.min(item.stock || 999, item.quantity + 1))}
                                                className="px-2 h-full hover:bg-slate-50 dark:hover:bg-slate-800 rounded-r-lg transition-colors border-l border-slate-100 dark:border-slate-800"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <p className="font-bold text-maroon dark:text-pink-400">৳{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label="Remove item"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span>৳{totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-slate-800 dark:text-white">
                                <span>Total</span>
                                <span className="text-maroon dark:text-pink-400">৳{totalPrice.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleViewCart}
                                className="btn-secondary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                View Cart
                            </button>
                            <button
                                onClick={handleCheckout}
                                className="btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                Checkout <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-center text-slate-400">
                            Free shipping on orders over ৳2000
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
