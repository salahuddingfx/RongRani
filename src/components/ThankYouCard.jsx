import React, { useState } from 'react';
import { Copy, Check, Scissors, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

const ThankYouCard = ({
    customerName = "Valued Customer",
    couponCode = "RONGRANI10",
    discountAmount = "10% OFF",
    expiryDate = "Next 30 Days"
}) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(couponCode);
        setIsCopied(true);

        // Mini confetti for copy action
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#BE123C', '#FBBF24', '#ffffff']
        });

        setTimeout(() => setIsCopied(false), 3000);
    };

    return (
        <div className="w-full max-w-md mx-auto perspective-1000 my-8 animate-fade-in-up">
            {/* Main Card Container */}
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02] duration-500">

                {/* Decorative Top Pattern */}
                <div className="h-32 bg-gradient-to-br from-maroon via-rose-700 to-maroon relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] bg-[length:20px_20px]"></div>
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute top-4 right-4 text-white/20">
                        <Heart className="w-16 h-16 transform rotate-12" fill="currentColor" />
                    </div>
                </div>

                {/* Logo Badge - Floating */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-20 h-20 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl ring-4 ring-white/50 dark:ring-slate-700/50 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-all duration-300">
                    <img src="/RongRani-Circle.png" alt="RongRani" className="w-full h-full object-contain" />
                </div>

                {/* Content Section */}
                <div className="pt-16 pb-8 px-8 text-center bg-white dark:bg-slate-800 relative z-10">
                    <h2 className="text-3xl font-black text-maroon dark:text-pink-500 mb-1 tracking-tight font-serif">Thank You!</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-6 max-w-[240px] mx-auto">
                        Dear <span className="text-slate-800 dark:text-white font-bold">{customerName}</span>, for being a part of our journey. Here's a small gift for you! 🎁
                    </p>

                    {/* Cutout Coupon Section */}
                    <div className="relative bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-maroon/30 dark:border-pink-500/30 rounded-xl p-6 mx-2 group">
                        {/* Cutout Circles */}
                        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white dark:bg-slate-800 rounded-full -translate-y-1/2"></div>
                        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white dark:bg-slate-800 rounded-full -translate-y-1/2"></div>

                        {/* Scissors Icon */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-2 text-maroon/50 dark:text-pink-500/50">
                            <Scissors className="w-4 h-4 transform rotate-90" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Your Coupon Code</h3>
                                <div className="text-3xl font-black text-slate-800 dark:text-white font-mono tracking-wider flex items-center justify-center gap-2">
                                    {couponCode}
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <span className="text-maroon dark:text-pink-500 font-black text-xl">{discountAmount}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs font-medium text-slate-500">Valid for {expiryDate}</span>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={handleCopy}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 ${isCopied
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-maroon text-white hover:bg-maroon-dark shadow-lg hover:shadow-maroon/30'
                                    }`}
                            >
                                {isCopied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Code Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Tap to Copy Code
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>www.rongrani.com</span>
                        <span>•</span>
                        <span>@rongrani</span>
                    </div>
                </div>

                {/* Bottom Gold Bar */}
                <div className="h-2 bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-600"></div>
            </div>
        </div>
    );
};

export default ThankYouCard;
