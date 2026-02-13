import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Sparkles, Star, Users, Award, Heart, ShoppingBag, Shirt, Gift, CheckCircle, Shield, TrendingUp, Clock, Package } from 'lucide-react';
import { Suspense, lazy } from 'react';
import TypingEffect from '../components/TypingEffect';
import Seo from '../components/Seo';

import { ProductCardSkeleton } from '../components/Skeletons';
import { useSocket } from '../contexts/socketContextBase';
import { useLanguage } from '../contexts/LanguageContext';

import BannerSlider from '../components/BannerSlider';
const Newsletter = lazy(() => import('../components/Newsletter'));
const FlashSale = lazy(() => import('../components/FlashSale'));
const ProductCard = lazy(() => import('../components/ProductItem'));

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotOffer, setHotOffer] = useState(null);
  const { socket } = useSocket() || {};
  const { t } = useLanguage();

  const categoryColorMap = {
    'bg-pink-600': '#DB2777',
    'bg-maroon': '#BE123C',
    'bg-amber-500': '#F59E0B',
    'bg-amber-800': '#92400E',
    'bg-red-500': '#EF4444',
    'bg-yellow-500': '#EAB308',
    'bg-slate-700': '#334155',
    'bg-emerald-500': '#10B981',
    'bg-purple-600': '#9333EA',
    'bg-indigo-600': '#4F46E5',
    'bg-teal-600': '#0D9488',
    'bg-rose-600': '#E11D48',
  };

  const getCategoryStyle = React.useCallback((color) => {
    return { backgroundColor: categoryColorMap[color] || '#BE123C' };
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
    fetchHotOffer();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (data) => setHotOffer(data);

    socket.on('hot_offer:updated', handleUpdate);
    socket.on('category:created', fetchCategories);
    socket.on('category:updated', fetchCategories);
    socket.on('category:deleted', fetchCategories);

    return () => {
      socket.off('hot_offer:updated', handleUpdate);
      socket.off('category:created', fetchCategories);
      socket.off('category:updated', fetchCategories);
      socket.off('category:deleted', fetchCategories);
    };
  }, [socket]);

  const fetchHotOffer = async () => {
    try {
      const response = await axios.get('/api/promotions/hot-offer');
      if (response.data) {
        setHotOffer(response.data);
      }
    } catch (error) {
      console.error('Error fetching hot offer:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories if API fails
      setCategories([
        { name: 'Love Combo', slug: 'love-combo', icon: 'Heart', color: 'bg-pink-600' },
        { name: 'Anniversary', slug: 'anniversary-combo', icon: 'Sparkles', color: 'bg-maroon' },
        { name: 'Birthday', slug: 'birthday-combo', icon: 'ShoppingBag', color: 'bg-amber-500' },
        { name: 'Valentine', slug: 'valentine-combo', icon: 'Heart', color: 'bg-red-500' },
      ]);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const isMobile = window.innerWidth < 768;
      const limit = isMobile ? 6 : 8; // Load fewer products on mobile for faster rendering
      const response = await axios.get(`/api/products?limit=${limit}`);
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback data...
      setFeaturedProducts([
        // keep some fallback items but fewer for mobile
        { _id: '1', name: 'Bamboo Basket Set', price: 1800, images: [{ url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format,compress&q=60&w=300' }], category: 'home', rating: 4.2 },
        { _id: '2', name: 'Clay Pottery Set', price: 3200, images: [{ url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format,compress&q=60&w=300' }], category: 'home', rating: 4.5 },
        { _id: '3', name: 'Handwoven Silk Scarf', price: 2500, images: [{ url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format,compress&q=60&w=300' }], category: 'clothing', rating: 4.8 },
        { _id: '4', name: 'Handcrafted Gift Box', price: 1500, images: [{ url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format,compress&q=60&w=300' }], category: 'gifts', rating: 4.7 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Seo
        title="RongRani | Handmade Gifts, Surprise Boxes & Delivery in Bangladesh"
        description="Handmade gifts, surprise boxes, jewelry, flowers, and decor with fast delivery across Bangladesh. Custom orders and festive deals from RongRani."
        path="/"
      />
      {/* Hero Section - Clean Design */}
      <section className="relative overflow-hidden bg-white py-8 sm:py-16 md:py-24 reveal min-h-[400px]">
        <div className="section-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {hotOffer?.isActive && (
              <div
                className="mb-6 rounded-3xl border border-maroon/20 px-6 py-4 shadow-soft"
                style={{ backgroundColor: hotOffer.backgroundColor || '#FDE2E4' }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="text-left md:text-center md:flex-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/80 text-maroon text-xs font-bold">
                      {hotOffer.badgeText || t('hot_offer')}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-maroon mt-2">
                      {hotOffer.title}
                    </h3>
                    {hotOffer.subtitle && (
                      <p className="text-sm text-charcoal-light mt-1">{hotOffer.subtitle}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {hotOffer.discountText && (
                      <div className="text-lg font-bold text-maroon">{hotOffer.discountText}</div>
                    )}
                    <Link
                      to={hotOffer.ctaLink || '/shop'}
                      className="inline-flex items-center mt-2 px-4 py-2 bg-maroon text-white rounded-xl font-semibold"
                    >
                      {hotOffer.ctaText || t('shop_now')}
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {/* Badge */}
            <div className="flex items-center justify-center space-x-2 mb-6 animate-fade-in-up">
              <Sparkles className="h-5 w-5 text-maroon" />
              <span className="text-sm font-bold text-maroon uppercase tracking-wider">
                {t('language') === 'bn' ? 'প্রিমিয়াম হস্তনির্মিত কালেকশন' : 'Premium Handcrafted Collection'}
              </span>
            </div>

            {/* Main Heading with Typing Effect */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-charcoal mb-4 tracking-tight leading-tight animate-fade-in-up stagger-1">
              {t('hero_title')}<br />
              <span className="text-maroon">
                <TypingEffect
                  texts={window.innerWidth < 768
                    ? [t('language') === 'bn' ? 'ভালোবাসা ও রোমান্স ❤️' : 'Love & Romance ❤️']
                    : (t('language') === 'bn'
                      ? ['ভালোবাসা ও রোমান্স ❤️', 'বিশেষ মুহূর্ত ✨', 'হৃদয়স্পর্শী সারপ্রাইজ 🎁', 'হস্তনির্মিত অনন্য উপহার 🎨', 'প্রিয়জনের স্মৃতির পাতায় 📸', 'সেরা কোয়ালিটি গ্যারান্টি ⭐']
                      : ['Love & Romance ❤️', 'Special Moments ✨', 'Heartfelt Surprises 🎁', 'Unique Handmade Gifts 🎨', 'Memories That Last 📸', 'Premium Quality Guaranteed ⭐']
                    )}
                  speed={window.innerWidth < 768 ? 150 : 80}
                  deleteSpeed={50}
                  pauseTime={3000}
                />
              </span>
            </h1>

            <p className="text-lg md:text-xl text-charcoal-light mb-8 leading-relaxed max-w-2xl mx-auto animate-fade-in-up stagger-2">
              {t('hero_subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up stagger-3">
              <Link to="/shop" className="btn-primary px-8 py-4 text-lg flex items-center justify-center space-x-2 group shadow-xl">
                <span>{t('explore_collection')}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              <Link to="/about" className="btn-secondary px-8 py-4 text-lg">
                {t('language') === 'bn' ? 'আমাদের গল্প' : 'Our Story'}
              </Link>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-cream-dark/30 animate-fade-in-up stagger-4">
              <div className="text-center group cursor-pointer">
                <div className="text-3xl md:text-4xl font-bold text-maroon mb-1 group-hover:scale-110 transition-transform duration-300">
                  20+
                </div>
                <div className="text-sm text-charcoal-light font-medium">Products</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-3xl md:text-4xl font-bold text-maroon mb-1 group-hover:scale-110 transition-transform duration-300">
                  05+
                </div>
                <div className="text-sm text-charcoal-light font-medium">Artisans</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-3xl md:text-4xl font-bold text-maroon mb-1 group-hover:scale-110 transition-transform duration-300">
                  4.8
                </div>
                <div className="text-sm text-charcoal-light flex items-center justify-center space-x-1 font-medium">
                  <Star className="h-4 w-4 fill-current text-gold" />
                  <span>Rating</span>
                </div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-3xl md:text-4xl font-bold text-maroon mb-1 group-hover:scale-110 transition-transform duration-300">
                  100+
                </div>
                <div className="text-sm text-charcoal-light font-medium">Customers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="h-40 animate-pulse bg-gray-100 rounded-xl" />}>
        <FlashSale />
      </Suspense>

      <section className="section-spacing bg-white dark:bg-slate-900 reveal">
        <div className="section-container">
          <Suspense fallback={<div className="h-[400px] animate-pulse bg-gray-100 rounded-2xl" />}>
            <BannerSlider />
          </Suspense>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-spacing bg-white reveal min-h-[300px]">
        <div className="section-container">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-charcoal mb-2 sm:mb-4">
              {t('shop_by_category')}
            </h2>
            <p className="text-xs sm:text-base md:text-lg text-charcoal-light max-w-2xl mx-auto px-4">
              {t('language') === 'bn' ? 'আমাদের বৈচিত্র্যময় হস্তনির্মিত পণ্য দেখুন' : 'Explore our diverse range of handcrafted products'}
            </p>
          </div>

          {/* Inline scrollable categories for mobile, grid for desktop */}
          <div className="lg:hidden overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex space-x-4 min-w-max">
              {categories.slice(0, 8).map((category, index) => {
                const iconMap = {
                  'Heart': Heart,
                  'Sparkles': Sparkles,
                  'ShoppingBag': ShoppingBag,
                  'Gift': Gift,
                  'Star': Star,
                  'Clock': Clock,
                  'Package': Package,
                  'Shirt': Shirt,
                  'Flower': Gift,
                  'Pencil': Gift
                };
                const Icon = iconMap[category.icon] || Gift;
                return (
                  <Link
                    key={category._id || index}
                    to={`/shop?category=${category.name}`}
                    className="flex-shrink-0 w-40 group"
                  >
                    <div
                      className="rounded-2xl p-4 text-left shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-black/5"
                      style={getCategoryStyle(category.color)}
                    >
                      <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-white truncate">{category.name}</h3>
                      <p className="text-xs text-white/80 mt-1 line-clamp-2">
                        {category.description?.substring(0, 40) || 'Explore curated gifts'}
                      </p>
                      <p className="text-[11px] text-white/80 mt-2">
                        {category.productCount ? `${category.productCount} items` : 'Tap to browse'}
                      </p>
                    </div>
                  </Link>
                );
              })}
              <Link to="/shop" className="flex-shrink-0 w-40 group">
                <div className="bg-teal-600 rounded-2xl p-4 text-left shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Shirt className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white">All Products</h3>
                  <p className="text-xs text-white/80 mt-1">Browse everything</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Desktop grid */}
          <div className="hidden lg:grid grid-cols-4 gap-4">
            {categories.slice(0, 7).map((category, index) => {
              const iconMap = {
                'Heart': Heart,
                'Sparkles': Sparkles,
                'ShoppingBag': ShoppingBag,
                'Gift': Gift,
                'Star': Star,
                'Clock': Clock,
                'Package': Package,
                'Shirt': Shirt,
                'Flower': Gift,
                'Pencil': Gift
              };
              const Icon = iconMap[category.icon] || Gift;
              return (
                <Link
                  key={category._id || index}
                  to={`/shop?category=${category.name}`}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className="rounded-2xl p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-black/5"
                    style={getCategoryStyle(category.color)}
                  >
                    <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{category.name}</h3>
                    <p className="text-white/80 text-sm mb-4">
                      {category.description?.substring(0, 60) || 'Explore the collection'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <span>{category.productCount ? `${category.productCount} items` : 'Tap to browse'}</span>
                      <span className="font-semibold">Explore →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
            <Link
              to="/shop"
              className="group animate-fade-in-up"
              style={{ animationDelay: `${categories.length * 0.1}s` }}
            >
              <div className="bg-teal-600 rounded-2xl p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shirt className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t('language') === 'bn' ? 'সব পণ্য' : 'All Products'}</h3>
                <p className="text-white/80 text-sm">{t('language') === 'bn' ? 'সম্পূর্ণ ক্যাটালগ দেখুন' : 'Browse the full catalog'}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section-spacing bg-cream reveal">
        <div className="section-container">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-charcoal mb-3 sm:mb-4">
              {t('featured_products')}
            </h2>
            <p className="text-charcoal-light text-sm sm:text-lg max-w-2xl mx-auto px-4">
              {t('language') === 'bn' ? 'আমাদের সেরা কারিগরদের হাতে বাছাই করা সংগ্রহ, প্রতিটি পণ্য ভালোবাসা এবং ঐতিহ্য দিয়ে তৈরি' : 'Handpicked treasures from our finest artisans, each piece crafted with love and tradition'}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {featuredProducts.map((product, index) => (
                <Suspense key={product._id} fallback={<ProductCardSkeleton />}>
                  <div
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                </Suspense>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/shop" className="btn-secondary px-8 py-4 text-lg">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="h-40 animate-pulse bg-gray-100" />}>
        <Newsletter />
      </Suspense>

      {/* CTA Section */}
      <section className="section-spacing bg-cream-light reveal" data-reveal-ignore="true">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 md:p-12 text-center">
              <Award className="h-16 w-16 text-maroon mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                Why Choose RongRani?
              </h2>
              <p className="text-charcoal-light text-lg mb-8 max-w-2xl mx-auto">
                We're more than just an online store. We're a platform that connects you with skilled artisans
                and preserves traditional craftsmanship for future generations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="bg-white rounded-3xl p-6 text-center border border-maroon/10 shadow-md hover:shadow-xl transition-all hover:scale-105">
                  <Users className="h-12 w-12 text-maroon mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-charcoal mb-2">Authentic Artisans</h3>
                  <p className="text-charcoal-light">Direct from master craftsmen with decades of experience</p>
                </div>
                <div className="bg-white rounded-3xl p-6 text-center border border-maroon/10 shadow-md hover:shadow-xl transition-all hover:scale-105">
                  <Award className="h-12 w-12 text-maroon mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-charcoal mb-2">Quality Guarantee</h3>
                  <p className="text-charcoal-light">Every piece is inspected and comes with our quality promise</p>
                </div>
                <div className="bg-white rounded-3xl p-6 text-center border border-maroon/10 shadow-md hover:shadow-xl transition-all hover:scale-105">
                  <Sparkles className="h-12 w-12 text-maroon mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-charcoal mb-2">Cultural Heritage</h3>
                  <p className="text-charcoal-light">Supporting traditional crafts and cultural preservation</p>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <Link to="/about" className="btn-primary px-10 py-4 text-lg">
                  Learn More About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;