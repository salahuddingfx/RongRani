import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ThumbsUp, MessageCircle, Filter, Search, TrendingUp, Award, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Seo from '../components/Seo';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, 5star, 4star, 3star, recent
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    const { t, language } = useLanguage();

    useEffect(() => {
        fetchReviews();
    }, [filter]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/reviews/all', {
                params: { filter, search: searchTerm }
            });
            setReviews(response.data.reviews || []);
            setStats(response.data.stats || stats);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
            setStats({
                totalReviews: 0,
                averageRating: 0,
                ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return language === 'bn' ? 'আজ' : 'Today';
        if (diffDays === 2) return language === 'bn' ? 'গতকাল' : 'Yesterday';
        if (diffDays <= 7) return language === 'bn' ? `${diffDays} দিন আগে` : `${diffDays} days ago`;

        return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getRatingPercentage = (rating) => {
        if (stats.totalReviews === 0) return 0;
        return ((stats.ratingDistribution[rating] / stats.totalReviews) * 100).toFixed(1);
    };

    return (
        <>
            <Seo
                title={language === 'bn' ? 'কাস্টমার রিভিউ | RongRani' : 'Customer Reviews | RongRani'}
                description={language === 'bn' ? 'আমাদের কাস্টমারদের সত্যিকারের রিভিউ এবং মতামত দেখুন' : 'Read genuine customer reviews and ratings for our products'}
                path="/reviews"
            />

            <div className="min-h-screen bg-cream py-8 md:py-12">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-8 md:mb-12">
                        <div className="inline-flex items-center gap-2 bg-maroon/10 px-4 py-2 rounded-full mb-4">
                            <Award className="w-5 h-5 text-maroon" />
                            <span className="text-sm font-bold text-maroon uppercase tracking-wide">
                                {language === 'bn' ? 'কাস্টমার রিভিউ' : 'Customer Reviews'}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-800 mb-4">
                            {language === 'bn' ? 'আমাদের কাস্টমাররা কী বলছেন' : 'What Our Customers Say'}
                        </h1>
                        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
                            {language === 'bn'
                                ? 'সত্যিকারের কাস্টমারদের সত্যিকারের মতামত। আমরা গর্বিত যে আমাদের পণ্য এবং সেবা নিয়ে।'
                                : 'Real reviews from real customers. We take pride in our products and service.'}
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                        {/* Average Rating */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100 text-center">
                            <div className="text-5xl md:text-6xl font-black text-maroon mb-2">
                                {stats.averageRating.toFixed(1)}
                            </div>
                            <div className="flex items-center justify-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 md:w-6 md:h-6 ${i < Math.floor(stats.averageRating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-slate-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-slate-600 text-sm">
                                {language === 'bn' ? 'গড় রেটিং' : 'Average Rating'}
                            </p>
                        </div>

                        {/* Total Reviews */}
                        <div className="bg-maroon rounded-2xl p-6 md:p-8 shadow-lg text-center text-white">
                            <Users className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-90" />
                            <div className="text-4xl md:text-5xl font-black mb-2">
                                {stats.totalReviews}+
                            </div>
                            <p className="text-white/90 text-sm">
                                {language === 'bn' ? 'মোট রিভিউ' : 'Total Reviews'}
                            </p>
                        </div>

                        {/* Rating Distribution */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4 text-sm md:text-base">
                                {language === 'bn' ? 'রেটিং বিতরণ' : 'Rating Distribution'}
                            </h3>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <div key={rating} className="flex items-center gap-2 text-sm">
                                        <span className="text-slate-600 w-8">{rating}★</span>
                                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-maroon h-full rounded-full transition-all duration-500"
                                                style={{ width: `${getRatingPercentage(rating)}%` }}
                                            />
                                        </div>
                                        <span className="text-slate-500 text-xs w-12 text-right">
                                            {getRatingPercentage(rating)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-slate-100 mb-6 md:mb-8">
                        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={language === 'bn' ? 'রিভিউ খুঁজুন...' : 'Search reviews...'}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all text-sm md:text-base"
                                />
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: 'all', label: language === 'bn' ? 'সব' : 'All', icon: Filter },
                                    { value: '5star', label: '5★', icon: Star },
                                    { value: '4star', label: '4★', icon: Star },
                                    { value: 'recent', label: language === 'bn' ? 'সাম্প্রতিক' : 'Recent', icon: TrendingUp }
                                ].map(({ value, label, icon: Icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => setFilter(value)}
                                        className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl font-semibold transition-all text-sm md:text-base ${filter === value
                                            ? 'bg-maroon text-white shadow-lg scale-105'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Reviews List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block w-12 h-12 border-4 border-maroon/30 border-t-maroon rounded-full animate-spin" />
                            <p className="mt-4 text-slate-600">{t('loading')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:gap-6">
                            {reviews.map((review, index) => (
                                <div
                                    key={review._id}
                                    className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Product Image */}
                                        <Link
                                            to={`/product/${review.product.slug || review.product._id}`}
                                            className="flex-shrink-0"
                                        >
                                            <img
                                                src={review.product.image}
                                                alt={review.product.name}
                                                className="w-full md:w-24 h-48 md:h-24 object-cover rounded-xl hover:scale-105 transition-transform"
                                            />
                                        </Link>

                                        {/* Review Content */}
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                                                <div>
                                                    <Link
                                                        to={`/product/${review.product.slug || review.product._id}`}
                                                        className="font-bold text-slate-800 hover:text-maroon transition-colors text-sm md:text-base"
                                                    >
                                                        {review.product.name}
                                                    </Link>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-slate-600 font-bold text-xs md:text-sm">
                                                            {review.user?.name || review.guestName || 'Valued Guest'}
                                                        </span>
                                                        {review.isVerifiedPurchase && (
                                                            <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                                <Award className="w-3 h-3" />
                                                                Verified
                                                            </span>
                                                        )}
                                                        <span className="text-slate-400 text-xs">•</span>
                                                        <span className="text-slate-400 text-xs">{formatDate(review.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 md:w-5 md:h-5 ${i < review.rating
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-slate-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <p className="text-slate-700 mb-4 leading-relaxed text-sm md:text-base">
                                                {review.comment}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs md:text-sm">
                                                <button className="flex items-center gap-2 text-slate-500 hover:text-maroon transition-colors">
                                                    <ThumbsUp className="w-4 h-4" />
                                                    <span>{language === 'bn' ? 'সহায়ক' : 'Helpful'} ({review.helpful})</span>
                                                </button>
                                                <button className="flex items-center gap-2 text-slate-500 hover:text-maroon transition-colors">
                                                    <MessageCircle className="w-4 h-4" />
                                                    <span>{language === 'bn' ? 'উত্তর দিন' : 'Reply'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Load More */}
                    {!loading && reviews.length > 0 && (
                        <div className="text-center mt-8">
                            <button className="btn-secondary px-6 md:px-8 py-2 md:py-3 text-sm md:text-base">
                                {language === 'bn' ? 'আরো দেখুন' : 'Load More Reviews'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Reviews;
