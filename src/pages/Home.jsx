import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Sparkles, Star, Users, Award, Heart, ShoppingBag, Shirt, Gift, CheckCircle, Shield, TrendingUp, Clock, Package } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeletons';
import BannerSlider from '../components/BannerSlider';
import TypingEffect from '../components/TypingEffect';
import Newsletter from '../components/Newsletter';
import { useSocket } from '../contexts/socketContextBase';
import Seo from '../components/Seo';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotOffer, setHotOffer] = useState(null);
  const { socket } = useSocket() || {};

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

  const getCategoryStyle = (color) => {
    if (color && categoryColorMap[color]) {
      return { backgroundColor: categoryColorMap[color] };
    }
    return { backgroundColor: '#BE123C' };
  };

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
    fetchHotOffer();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (data) => setHotOffer(data);

    socket.on('hot_offer:updated', handleUpdate);

    return () => {
      socket.off('hot_offer:updated', handleUpdate);
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
      const response = await axios.get('/api/products?limit=8');
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Enhanced mock data with default images
      setFeaturedProducts([
        {
          _id: '1',
          name: 'Bamboo Basket Set',
          description: 'Set of 3 handcrafted bamboo baskets for storage',
          price: 1800,
          originalPrice: 1800,
          images: [{ url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400' }],
          stock: 15,
          category: 'home',
          rating: 4.2,
          reviewCount: 45
        },
        {
          _id: '2',
          name: 'Clay Pottery Set',
          description: 'Traditional clay pottery set for serving',
          price: 3200,
          originalPrice: 3200,
          images: [{ url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400' }],
          stock: 8,
          category: 'home',
          rating: 4.5,
          reviewCount: 32
        },
        {
          _id: '3',
          name: 'Handwoven Silk Scarf',
          description: 'Beautiful handwoven silk scarf with traditional patterns',
          price: 2500,
          originalPrice: 2800,
          images: [{ url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400' }],
          stock: 5,
          category: 'clothing',
          rating: 4.8,
          reviewCount: 67
        },
        {
          _id: '4',
          name: 'Handcrafted Gift Box',
          description: 'Elegant gift box with traditional motifs',
          price: 1500,
          originalPrice: 1800,
          images: [{ url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400' }],
          stock: 20,
          category: 'gifts',
          rating: 4.7,
          reviewCount: 89
        },
        {
          _id: '5',
          name: 'Jute Wall Hanging',
          description: 'Eco-friendly jute wall art with ethnic patterns',
          price: 1200,
          originalPrice: 1200,
          images: [{ url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400' }],
          stock: 12,
          category: 'home',
          rating: 4.3,
          reviewCount: 28
        },
        {
          _id: '6',
          name: 'Brass Candle Holder Set',
          description: 'Elegant brass candle holders, set of 3',
          price: 2800,
          originalPrice: 3200,
          images: [{ url: 'https://images.unsplash.com/photo-1602874801006-c25e839d8889?w=400' }],
          stock: 18,
          category: 'home',
          rating: 4.6,
          reviewCount: 51
        },
        {
          _id: '7',
          name: 'Traditional Cotton Saree',
          description: 'Handloom cotton saree with block print design',
          price: 3500,
          originalPrice: 4200,
          images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400' }],
          stock: 6,
          category: 'clothing',
          rating: 4.9,
          reviewCount: 124
        },
        {
          _id: '8',
          name: 'Wooden Jewelry Box',
          description: 'Handcarved wooden jewelry box with mirror',
          price: 2200,
          originalPrice: 2500,
          images: [{ url: 'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=400' }],
          stock: 10,
          category: 'gifts',
          rating: 4.4,
          reviewCount: 36
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Seo
        title="Chirkut Ghor | Handmade Gifts, Surprise Boxes & Delivery in Bangladesh"
        description="Handmade gifts, surprise boxes, jewelry, flowers, and decor with fast delivery across Bangladesh. Custom orders and festive deals from Chirkut Ghor."
        path="/"
      />
      {/* Hero Section - Clean Design */}
      <section className="relative overflow-hidden bg-white py-16 md:py-24">
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
                      {hotOffer.badgeText || 'Hot Offer'}
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
                      {hotOffer.ctaText || 'Shop Now'}
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {/* Badge */}
            <div className="flex items-center justify-center space-x-2 mb-6 animate-fade-in-up">
              <Sparkles className="h-5 w-5 text-maroon" />
              <span className="text-sm font-bold text-maroon uppercase tracking-wider">
                Premium Handcrafted Collection
              </span>
            </div>

            {/* Main Heading with Typing Effect */}
            <h1 className="text-4xl md:text-6xl font-bold text-charcoal mb-4 leading-tight animate-fade-in-up stagger-1">
              Handmade Gifts & Surprise Boxes in Bangladesh<br />
              <span className="text-maroon">
                <TypingEffect 
                  texts={['Love & Romance', 'Special Moments', 'Heartfelt Surprises']}
                  speed={100}
                  deleteSpeed={50}
                  pauseTime={2000}
                />
              </span>
            </h1>

            <p className="text-lg md:text-xl text-charcoal-light mb-8 leading-relaxed max-w-2xl mx-auto animate-fade-in-up stagger-2">
              Express your emotions with curated jewelry, watches, chocolates, flowers, and romantic gift combos.
              Make every moment unforgettable with Chirkut Ghor and fast delivery across Bangladesh.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up stagger-3">
              <Link to="/shop" className="btn-primary px-8 py-4 text-lg flex items-center justify-center space-x-2 group shadow-xl">
                <span>Explore Collection</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              <Link to="/about" className="btn-secondary px-8 py-4 text-lg">
                Our Story
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

      {/* Banner Slider Section */}
      <section className="section-spacing bg-cream">
        <div className="section-container">
          <BannerSlider />
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-spacing bg-white">
        <div className="section-container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal mb-3 sm:mb-4">
              Shop by Category
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-charcoal-light max-w-2xl mx-auto px-4">
              Explore our diverse range of handcrafted products
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
                <div className="bg-emerald rounded-2xl p-4 text-left shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
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
                  style={{animationDelay: `${index * 0.1}s`}}
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
              style={{animationDelay: `${categories.length * 0.1}s`}}
            >
              <div className="bg-emerald rounded-2xl p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shirt className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">All Products</h3>
                <p className="text-white/80 text-sm">Browse the full catalog</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section-spacing bg-cream">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Featured Collection
            </h2>
            <p className="text-charcoal-light text-lg max-w-2xl mx-auto">
              Handpicked treasures from our finest artisans, each piece crafted with love and tradition
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="animate-fade-in-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {featuredProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="animate-slide-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <ProductCard product={product} />
                </div>
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

      {/* Newsletter Section */}
      <Newsletter />

      {/* CTA Section */}
      <section className="section-spacing bg-cream-light" data-reveal-ignore="true">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 md:p-12 text-center">
              <Award className="h-16 w-16 text-maroon mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                Why Choose Chirkut ঘর?
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

              <Link to="/about" className="btn-primary px-10 py-4 text-lg">
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;