import React, { useState, useEffect } from 'react';
import { Clock, Zap, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const FlashSale = () => {
    const { language } = useLanguage();
    const [flashSale, setFlashSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const fetchFlashSale = async () => {
            try {
                // Assuming you have an axios instance setup, or fetch
                // Using relative path assuming proxy or base URL setup similar to other components
                const response = await fetch('/api/flash-sales/active');

                // Robust check for JSON response
                const contentType = response.headers.get("content-type");
                if (!response.ok || !contentType || !contentType.includes("application/json")) {
                    // console.warn('Flash sale API not available or returned non-JSON:', response.status);
                    setFlashSale(null);
                    return;
                }

                const data = await response.json();
                if (data.success && data.flashSale) {
                    setFlashSale(data.flashSale);
                }
            } catch (error) {
                console.error('Error fetching flash sale:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFlashSale();
    }, []);

    useEffect(() => {
        if (!flashSale) return;

        const calculateTimeLeft = () => {
            const difference = new Date(flashSale.endTime) - new Date();

            if (difference > 0) {
                return {
                    hours: Math.floor((difference / (1000 * 60 * 60))), // Total hours left
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }
            return { hours: 0, minutes: 0, seconds: 0 };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [flashSale]);

    const formatTime = (time) => {
        return time < 10 ? `0${time}` : time;
    };

    if (loading || !flashSale) return null;

    // Use products from API
    const productsToDisplay = flashSale.products.map(p => ({
        id: p.product._id,
        name: p.product.name, // Access populated product name
        // Handle name translation if available in product model, otherwise use name
        // Assuming p.product has name (string) or name object. Adjust based on Product model.
        // For simplicity using name directly.
        price: p.discountPrice,
        originalPrice: p.product.price,
        image: p.product.images?.[0]?.url || '/api/placeholder/400/400',
        sold: p.soldQuantity,
        total: p.totalQuantity
    }));

    return (
        <section className="py-12 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl md:text-3xl font-black text-maroon flex items-center gap-2">
                            <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500 animate-pulse" />
                            {language === 'bn' ? 'ফ্ল্যাশ সেল' : 'Flash Sale'}
                        </h2>
                        <div className="hidden md:flex items-center gap-2 text-charcoal font-bold bg-white px-4 py-2 rounded-full shadow-sm">
                            <span className="text-slate-500 text-sm uppercase tracking-wider">
                                {language === 'bn' ? 'শেষ হতে বাকি' : 'Ending in'}:
                            </span>
                            <div className="flex items-center gap-1 text-maroon">
                                <span className="bg-maroon text-white px-2 py-0.5 rounded text-lg">{formatTime(timeLeft.hours)}</span>:
                                <span className="bg-maroon text-white px-2 py-0.5 rounded text-lg">{formatTime(timeLeft.minutes)}</span>:
                                <span className="bg-maroon text-white px-2 py-0.5 rounded text-lg">{formatTime(timeLeft.seconds)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Timer */}
                    <div className="flex md:hidden items-center gap-2 text-charcoal font-bold bg-white px-4 py-2 rounded-full shadow-sm w-full justify-center">
                        <Clock className="w-4 h-4 text-maroon" />
                        <div className="flex items-center gap-1 text-maroon">
                            <span className="bg-maroon text-white px-2 py-0.5 rounded">{formatTime(timeLeft.hours)}</span>:
                            <span className="bg-maroon text-white px-2 py-0.5 rounded">{formatTime(timeLeft.minutes)}</span>:
                            <span className="bg-maroon text-white px-2 py-0.5 rounded">{formatTime(timeLeft.seconds)}</span>
                        </div>
                    </div>

                    <Link to="/shop" className="text-maroon font-semibold hover:text-pink-600 flex items-center gap-1 group">
                        {language === 'bn' ? 'সব দেখুন' : 'View All'}
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {productsToDisplay.map((product) => (
                        <div key={product.id} className="bg-white dark:bg-slate-800 rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700 group">
                            {/* Image & Badges */}
                            <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-slate-100">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <span className="absolute top-2 left-2 bg-yellow-400 text-maroon text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                    <Zap className="w-3 h-3 fill-maroon" /> -50%
                                </span>
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">{product.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg md:text-xl font-black text-maroon">৳{product.price}</span>
                                    <span className="text-sm text-slate-400 line-through">৳{product.originalPrice}</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium text-slate-500">
                                        <span>{language === 'bn' ? 'বিক্রি হয়েছে' : 'Sold'}: {product.sold}</span>
                                        <span className="text-maroon">{(product.sold / product.total * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-maroon rounded-full"
                                            style={{ width: `${(product.sold / product.total) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <button
                                    className="w-full mt-2 bg-maroon/10 hover:bg-maroon text-maroon hover:text-white py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                    aria-label={`Order ${product.name} now`}
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    {language === 'bn' ? 'অর্ডার করুন' : 'Order Now'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FlashSale;
