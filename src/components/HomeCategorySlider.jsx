import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductItem from './ProductItem';
import { ProductCardSkeleton } from './Skeletons';
import { useLanguage } from '../contexts/LanguageContext';

const HomeCategorySlider = ({ category }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const { t } = useLanguage();
    const [showArrows, setShowArrows] = useState(false);

    const fetchCategoryProducts = async () => {
        try {
            const response = await axios.get(`/api/products?category=${encodeURIComponent(category.name)}&limit=10`);
            setProducts(response.data.products);
        } catch (error) {
            // console.error(`Error fetching products for category ${category.name}:`, error); // Removed console.error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (category?.name) {
            fetchCategoryProducts();
        }
    }, [category]);

    // Real-time Updates
    useEffect(() => {
        const socket = window.socket; // Assuming socket is attached to window or use context
        if (!socket) return;

        const handleUpdate = () => fetchCategoryProducts();

        socket.on('product:created', handleUpdate);
        socket.on('product:updated', handleUpdate);
        socket.on('product:deleted', handleUpdate);

        return () => {
            socket.off('product:created', handleUpdate);
            socket.off('product:updated', handleUpdate);
            socket.off('product:deleted', handleUpdate);
        };
    }, []);

    // Auto-scroll logic (slower, more premium)
    useEffect(() => {
        if (products.length <= 4) return;

        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                const maxScroll = scrollWidth - clientWidth;

                if (scrollLeft >= maxScroll - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    // Scroll by one card width
                    const cardWidth = 300;
                    scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
                }
            }
        }, 8000); // 8 seconds for a more relaxed feel

        return () => clearInterval(interval);
    }, [products]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth / 1.5 : clientWidth / 1.5;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="mb-16">
                <div className="flex items-center justify-between mb-6 px-4">
                    <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
                </div>
                <div className="flex space-x-4 overflow-hidden px-4">
                    {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <div
            className="mb-16 relative group"
            onMouseEnter={() => setShowArrows(true)}
            onMouseLeave={() => setShowArrows(false)}
        >
            <div className="flex items-center justify-between mb-6 px-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-charcoal flex items-center gap-2">
                        <span className="w-2 h-8 bg-maroon rounded-full inline-block"></span>
                        {category.name}
                    </h2>
                    <p className="text-sm text-charcoal-light mt-1">
                        {category.description || `Explore our ${category.name.toLowerCase()} collection`}
                    </p>
                </div>
                <Link
                    to={`/shop?category=${encodeURIComponent(category.name)}`}
                    className="flex items-center text-maroon font-bold hover:underline group/link"
                >
                    {t('view_all')}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="relative overflow-visible">
                {/* Navigation Buttons */}
                <button
                    onClick={() => scroll('left')}
                    className={`absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm border border-maroon/10 rounded-full flex items-center justify-center shadow-xl text-maroon transition-all duration-300 ${showArrows ? 'opacity-100' : 'opacity-0 md:opacity-0 pointer-events-none md:pointer-events-auto shadow-none'}`}
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className={`absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm border border-maroon/10 rounded-full flex items-center justify-center shadow-xl text-maroon transition-all duration-300 ${showArrows ? 'opacity-100' : 'opacity-0 md:opacity-0 pointer-events-none md:pointer-events-auto shadow-none'}`}
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Products Scroll Container */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto space-x-4 px-4 pb-8 no-scrollbar scroll-smooth snap-x snap-mandatory"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="flex-shrink-0 w-[240px] sm:w-[280px] md:w-[300px] snap-start"
                        >
                            <ProductItem product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeCategorySlider;
