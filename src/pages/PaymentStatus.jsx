import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import confetti from 'canvas-confetti';

const PaymentStatus = () => {
    const { status, orderId } = useParams();
    const { clearCart } = useCart();

    useEffect(() => {
        if (status === 'success') {
            clearCart();
            // Trigger Confetti
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
        }
    }, [status, clearCart]);

    const isSuccess = status === 'success';
    const isFailed = status === 'fail';
    const isCancelled = status === 'cancel';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center py-20 px-4">
            <div className={`max-w-xl w-full bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl overflow-hidden border ${isSuccess ? 'border-green-100 dark:border-green-900/30' : 'border-red-100 dark:border-red-900/30'} animate-scale-in`}>
                {/* Header Decoration */}
                <div className={`h-2 ${isSuccess ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-amber-500'}`} />

                <div className="p-8 sm:p-12 text-center">
                    {isSuccess && (
                        <div className="space-y-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-100 dark:bg-green-900/20 rounded-full scale-150 blur-2xl opacity-50" />
                                <CheckCircle className="relative mx-auto h-24 w-24 text-green-500 animate-bounce-slow" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Order Confirmed! 🥳</h2>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Woohoo! Your payment was successful and your order is being prepared with love.
                                </p>
                            </div>

                            {/* Order Details Preview */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 text-left space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Status</span>
                                    <span className="font-bold text-green-600">Paid & Confirmed</span>
                                </div>
                                {orderId && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Order ID</span>
                                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200">#{orderId.slice(-8).toUpperCase()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {isFailed && (
                        <div className="space-y-6">
                            <XCircle className="mx-auto h-24 w-24 text-red-500" />
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Payment Failed</h2>
                                <p className="text-slate-500 dark:text-slate-400">
                                    We couldn't process your payment. Don't worry, your cart is safe. Please try again.
                                </p>
                            </div>
                        </div>
                    )}

                    {isCancelled && (
                        <div className="space-y-6">
                            <AlertTriangle className="mx-auto h-24 w-24 text-amber-500" />
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Payment Cancelled</h2>
                                <p className="text-slate-500 dark:text-slate-400">
                                    You've cancelled the payment. Whenever you're ready, you can complete it from your account.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-12 flex flex-col sm:flex-row gap-4">
                        {isSuccess && (
                            <Link
                                to="/my-orders"
                                className="flex-1 bg-maroon text-white font-black py-4 px-6 rounded-2xl hover:bg-maroon-dark shadow-lg shadow-maroon/20 transition-all hover:scale-105"
                            >
                                Track Your Order 🚚
                            </Link>
                        )}
                        {!isSuccess && (
                            <Link
                                to="/checkout"
                                className="flex-1 bg-maroon text-white font-black py-4 px-6 rounded-2xl hover:bg-maroon-dark shadow-lg shadow-maroon/20 transition-all hover:scale-105"
                            >
                                Try Again
                            </Link>
                        )}
                        <Link
                            to="/"
                            className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-black py-4 px-6 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all hover:scale-105"
                        >
                            Back to Home
                        </Link>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-400">
                            Need help? <a href="mailto:info.rongrani@gmail.com" className="text-maroon font-bold">Contact Support</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;
