import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductItem from './ProductItem';
import { ProductCardSkeleton } from './Skeletons';
import { useLanguage } from '../contexts/LanguageContext';
import { useSocket } from '../contexts/socketContextBase';

const HomeCategorySlider = ({ category }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const { t } = useLanguage();
    const [showArrows, setShowArrows] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const { socket } = useSocket() || {};

    const fetchCategoryProducts = async () => {
        try {
            const response = await axios.get(`/api/products?category=${encodeURIComponent(category.name)}&limit=10`);
            setProducts(response.data.products);
        } catch (_) {
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

    useEffect(() => {
        if (products.length === 0 || isPaused) return undefined;

        const timer = setInterval(() => {
            if (!scrollRef.current) return;
            const container = scrollRef.current;
            const maxScrollLeft = container.scrollWidth - container.clientWidth;
            const nextLeft = container.scrollLeft + container.clientWidth / 1.5;

            if (nextLeft >= maxScrollLeft - 10) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
                return;
            }

            container.scrollBy({ left: container.clientWidth / 1.5, behavior: 'smooth' });
        }, 3000);

        return () => clearInterval(timer);
    }, [products.length, isPaused]);

    // Real-time Updates
    useEffect(() => {
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
    }, [socket]);

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
            onMouseEnter={() => {
                setShowArrows(true);
                setIsPaused(true);
            }}
            onMouseLeave={() => {
                setShowArrows(false);
                setIsPaused(false);
            }}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 px-4 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-charcoal flex items-center gap-2">
                        <span className="w-2 h-8 bg-maroon rounded-full inline-block"></span>
                        {category.name}
                    </h2>
                    <p className="text-sm text-charcoal-light mt-1">
                        {category.description || `Explore our ${category.name.toLowerCase()} collection`}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        to={`/shop?category=${encodeURIComponent(category.name)}`}
                        className="flex items-center text-maroon font-bold hover:underline group/link text-sm md:text-base mr-2"
                    >
                        {t('view_all')}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>

                    {/* Navigation Buttons in Header */}
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="w-10 h-10 bg-white border border-maroon/20 rounded-full flex items-center justify-center shadow-sm text-maroon hover:bg-maroon hover:text-white transition-all duration-300"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-10 h-10 bg-white border border-maroon/20 rounded-full flex items-center justify-center shadow-sm text-maroon hover:bg-maroon hover:text-white transition-all duration-300"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative overflow-visible">
                <div className="md:hidden absolute inset-y-0 left-2 flex items-center z-10">
                    <button
                        onClick={() => scroll('left')}
                        className="w-9 h-9 bg-white/90 border border-maroon/20 rounded-full flex items-center justify-center shadow-md text-maroon"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>
                <div className="md:hidden absolute inset-y-0 right-2 flex items-center z-10">
                    <button
                        onClick={() => scroll('right')}
                        className="w-9 h-9 bg-white/90 border border-maroon/20 rounded-full flex items-center justify-center shadow-md text-maroon"
                        aria-label="Next"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Products Scroll Container */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto space-x-4 px-4 pb-8 no-scrollbar scroll-smooth snap-x snap-mandatory"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="flex-shrink-0 w-[170px] sm:w-[200px] md:w-[220px] lg:w-[240px] snap-start"
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
