import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Zap, Gift, TrendingUp, Package, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { addToRecentlyViewed } from '../utils/productUtils';
import toast from 'react-hot-toast';
import Seo from '../components/Seo';
import ReviewForm from '../components/ReviewForm';
import ProductItem from '../components/ProductItem';
import { useLanguage } from '../contexts/LanguageContext';

import Product3DViewer from '../components/Product3DViewer';
import SocialShare from '../components/SocialShare';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [deliverySettings, setDeliverySettings] = useState({
    chittagongFee: 70,
    outsideChittagongFee: 150,
  });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();
  const baseUrl = (import.meta?.env?.VITE_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '');

  const buildDescription = (text) => {
    if (!text) {
      return '';
    }

    const normalized = text.replace(/\s+/g, ' ').trim();
    if (normalized.length <= 160) {
      return normalized;
    }

    return `${normalized.slice(0, 157)}...`;
  };

  const fetchProduct = useCallback(async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);

      // Fetch related products based on category
      if (response.data.category) {
        try {
          const relatedRes = await axios.get(`/api/products?category=${response.data.category}&limit=5`);
          const filtered = relatedRes.data.products.filter(p => p._id !== id).slice(0, 4);
          setRelatedProducts(filtered);
        } catch (err) {
          console.error('Error fetching related products:', err);
        }
      }
    } catch {
      // Mock data for development
      const mockProducts = {
        '1': {
          _id: '1',
          name: 'Handwoven Silk Scarf',
          description: 'Beautiful handwoven silk scarf with traditional patterns. Made from the finest silk threads and handwoven by skilled artisans using age-old techniques.',
          price: 2250,
          originalPrice: 2500,
          images: [{ url: '/api/placeholder/400/400' }, { url: '/api/placeholder/400/400' }, { url: '/api/placeholder/400/400' }],
          stock: 15,
          category: 'clothing',
          rating: 4.5,
          reviewCount: 23
        },
        '2': {
          _id: '2',
          name: 'Bamboo Basket Set',
          description: 'Set of 3 handcrafted bamboo baskets for storage. Perfect for organizing your home and adding a natural touch to your decor.',
          price: 1800,
          originalPrice: 1800,
          images: [{ url: '/api/placeholder/400/400' }, { url: '/api/placeholder/400/400' }],
          stock: 8,
          category: 'home',
          rating: 4.2,
          reviewCount: 15
        }
      };
      setProduct(mockProducts[id] || mockProducts['1']);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch reviews for this product
  const fetchReviews = useCallback(async () => {
    try {
      setLoadingReviews(true);
      const response = await axios.get(`/api/products/${id}/reviews`);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [id]);

  // Check if user can review
  const checkCanReview = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`/api/products/${id}/can-review`, config);
      setCanReview(response.data.canReview);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      setCanReview(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    checkCanReview();
  }, [fetchProduct, fetchReviews, checkCanReview]);

  // Note: We use default delivery settings on product page
  // These will be updated when admin changes settings and page reloads
  // For real-time updates, a Socket.io listener can be added

  // Add to recently viewed when product is loaded
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    toast.success('Redirecting to checkout...');
    navigate('/checkout');
  };

  const addToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const getImageUrl = (image) => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.url || image.secure_url || '';
  };

  const pagePath = `/product/${id}`;
  const pageTitle = product?.seoTitle || (product ? `${product.name} | RongRani` : 'Product Details | RongRani');
  const pageDescription = product?.seoDescription || (product?.description
    ? buildDescription(product.description)
    : 'View product details, pricing, and delivery options from RongRani.');
  const pageKeywords = product?.tags || [];
  const pageImage = product
    ? getImageUrl(product.images?.[0]) || getImageUrl(product.image)
    : '';
  const productSchema = product
    ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: pageDescription,
      image: pageImage ? [pageImage] : undefined,
      sku: product._id,
      brand: { '@type': 'Brand', name: 'RongRani' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'BDT',
        price: String(product.price),
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `${baseUrl}${pagePath}`,
      },
    }
    : null;

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % (product?.images?.length || 1));
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + (product?.images?.length || 1)) % (product?.images?.length || 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Seo
          title="Product Details | RongRani"
          description="View product details, pricing, and delivery options from RongRani."
          path={pagePath}
        />
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-maroon mx-auto mb-4"></div>
          <p className="text-slate">{t('loading_beautiful')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Seo
          title="Product Not Found | RongRani"
          description="The product you are looking for is unavailable. Explore handmade gifts and surprise boxes at RongRani."
          path={pagePath}
          noIndex
        />
        <div className="text-center">
          <div className="w-24 h-24 bg-slate/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-slate" />
          </div>
          <h2 className="text-2xl font-bold text-maroon mb-2">{t('product_not_found')}</h2>
          <p className="text-slate">{t('product_not_found_msg')}</p>
        </div>
      </div>
    );
  }

  const categoryLabel = product?.category ? product.category.toString() : '';
  const categoryParam = categoryLabel ? encodeURIComponent(categoryLabel) : '';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Seo
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        path={pagePath}
        image={pageImage}
        schema={productSchema}
      />
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-[72px] sm:top-[80px] md:top-[88px] z-40">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm flex items-center space-x-2">
            <Link to="/" className="text-slate hover:text-maroon transition-colors font-medium">{t('home')}</Link>
            <span className="text-slate/40">/</span>
            <Link to="/shop" className="text-slate hover:text-maroon transition-colors font-medium">{t('shop')}</Link>
            {categoryLabel && (
              <>
                <span className="text-slate/40">/</span>
                <Link
                  to={`/shop?category=${categoryParam}`}
                  className="text-slate hover:text-maroon transition-colors capitalize font-medium"
                >
                  {t('cat_' + categoryLabel.toLowerCase().replace(/\s+/g, '_'))}
                </Link>
              </>
            )}
            <span className="text-slate/40">/</span>
            <span className="text-maroon font-bold truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 xl:gap-16">
          {/* Product 3D Viewer */}
          <div className="animate-fade-in-up lg:sticky lg:top-32 lg:self-start lg:col-span-5 xl:col-span-6">
            <Product3DViewer
              images={product.images?.map(img => getImageUrl(img)) || [getImageUrl(product.image)]}
              productName={product.name}
              discount={product.originalPrice && product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : null
              }
            />
          </div>

          {/* Product Info */}
          <div className="space-y-5 animate-fade-in-up stagger-1 lg:col-span-7 xl:col-span-6">
            {/* Header Card */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-maroon/10">
              {/* Category Badge */}
              <div className="inline-flex items-center space-x-2 bg-maroon/10 text-maroon px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                <Package className="h-4 w-4" />
                <span className="capitalize">{t('cat_' + product.category.toLowerCase().replace(/\s+/g, '_'))}</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-maroon mb-5 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pb-6 border-b-2 border-maroon/10">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 bg-gold/10 px-3 py-2 rounded-xl">
                    {[...Array(5)].map((_, i) => {
                      const starValue = i + 1;
                      const rating = product.rating || 5;
                      const isFull = rating >= starValue;
                      const isHalf = !isFull && rating >= starValue - 0.5;

                      return (
                        <div key={i} className="relative">
                          <Star className="h-5 w-5 text-slate/20" />
                          {(isFull || isHalf) && (
                            <div
                              className="absolute inset-0 overflow-hidden"
                              style={{ width: isFull ? '100%' : '50%' }}
                            >
                              <Star className="h-5 w-5 text-gold fill-current" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-maroon">
                      {product.rating?.toFixed(1) || '5.0'}
                    </span>
                    <span className="text-slate/60 font-medium">
                      {t('reviews_count_msg').replace('{count}', product.reviewCount || 0)}
                    </span>
                  </div>
                </div>

                {/* Purchase Count Badge */}
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    {product.salesCount > 0
                      ? t('items_sold').replace('{count}', product.salesCount >= 1000 ? (product.salesCount / 1000).toFixed(1) + 'k' : product.salesCount)
                      : t('hot_new_arrival')
                    }
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-maroon/5 p-6 rounded-2xl mb-6">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-5xl md:text-6xl font-black text-maroon">
                    ৳{product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-2xl text-slate/40 line-through font-bold">
                        ৳{product.originalPrice}
                      </span>
                      <span className="bg-green-500 text-white px-5 py-2.5 rounded-full text-base font-bold shadow-lg animate-pulse">
                        {t('save_amount').replace('{amount}', product.originalPrice - product.price)}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-maroon/60 text-sm font-medium mt-2">{t('inclusive_taxes')}</p>
              </div>

              {/* Description */}
              <div className="bg-white/60 p-5 rounded-2xl border border-maroon/10">
                <p className="text-slate text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="bg-white p-7 rounded-3xl shadow-xl border border-maroon/10">
              {/* Stock Status */}
              <div className="flex items-center justify-between pb-5 mb-5 border-b-2 border-maroon/10">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  <span className={`font-bold text-base ${product.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {product.stock > 0 ? `✅ ${t('in_stock_msg')}` : `❌ ${t('out_of_stock_msg')}`}
                  </span>
                </div>
                {product.stock > 0 && product.stock < 10 && (
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                    ⚠️ {t('limited_stock_msg')}
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="text-slate font-bold text-lg mb-3 block">{t('select_quantity')}</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0}
                    className="bg-maroon text-white p-3 rounded-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <div className="flex-1 bg-cream px-8 py-4 rounded-xl border-3 border-maroon/20 text-center">
                    <span className="text-3xl font-black text-maroon">
                      {quantity}
                    </span>
                  </div>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={product.stock === 0 || quantity >= product.stock}
                    className="bg-maroon text-white p-3 rounded-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full bg-maroon text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 group relative overflow-hidden"
                >
                  <Zap className="h-6 w-6 animate-pulse" />
                  <span className="relative z-10">{t('buy_now_zap')}</span>
                </button>
                <a
                  href={`https://wa.me/8801851075537?text=${encodeURIComponent(`Hello RongRani! 👋 I want to order this product:\n\n*Product:* ${product.name}\n*Price:* ৳${product.price}\n*Link:* ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:shadow-2xl hover:bg-[#128C7E] transition-all transform hover:scale-[1.02] active:scale-95"
                >
                  <MessageCircle className="h-6 w-6" />
                  <span>{t('order_whatsapp')}</span>
                </a>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-white border-3 border-maroon text-maroon py-5 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:bg-maroon hover:text-white hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span>{t('add_cart_msg')}</span>
                </button>
                <button
                  onClick={addToWishlist}
                  className={`w-full py-4 rounded-2xl border-3 transition-all flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-95 font-semibold ${isWishlisted
                    ? 'bg-pink-500 border-pink-500 text-white shadow-xl'
                    : 'bg-white border-maroon/30 text-maroon hover:border-maroon hover:bg-maroon/5'
                    }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current animate-pulse' : ''}`} />
                  <span>{isWishlisted ? t('saved_wishlist') : t('add_wishlist_msg')}</span>
                </button>

              </div>

              {/* Social Share */}
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">{t('share_friends')}</span>
                <div className="-mt-4">
                  <SocialShare
                    url={`${baseUrl}/product/${id}`}
                    title={`Check out ${product.name} on RongRani™!`}
                    description={pageDescription}
                    image={pageImage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Details Section */}
        <div className="mt-8 lg:mt-12 space-y-6">
          {/* Product Description - Full Width */}
          <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl border border-maroon/10 animate-fade-in-up">
            <h2 className="text-2xl lg:text-3xl font-black text-maroon mb-4 flex items-center space-x-3">
              <div className="bg-maroon/10 p-2 rounded-xl">
                <Package className="h-6 w-6 text-maroon" />
              </div>
              <span>{t('product_description')}</span>
            </h2>
            <p className="text-slate text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* 3 Column Grid for Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {/* Product Details Card */}
            <div className="bg-white p-7 rounded-3xl shadow-xl border border-maroon/10">
              <h3 className="text-xl font-black text-maroon mb-5 flex items-center space-x-3">
                <div className="bg-maroon/10 p-2 rounded-xl">
                  <Package className="h-6 w-6 text-maroon" />
                </div>
                <span>{t('product_details')}</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-cream/30 rounded-xl border border-maroon/10 hover:shadow-md transition-shadow">
                  <span className="text-slate font-semibold text-base">{t('category_label')}</span>
                  <span className="text-maroon font-bold capitalize bg-maroon/10 px-4 py-1.5 rounded-full">{product.category}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-cream/30 rounded-xl border border-maroon/10 hover:shadow-md transition-shadow">
                  <span className="text-slate font-semibold text-base">{t('sku_label')}</span>
                  <span className="text-charcoal font-bold font-mono text-sm break-all">{product.sku || product._id?.substring(0, 8).toUpperCase() || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-cream/30 rounded-xl border border-maroon/10 hover:shadow-md transition-shadow">
                  <span className="text-slate font-semibold text-base">{t('availability_label')}</span>
                  <span className={`font-bold px-4 py-1.5 rounded-full ${product.stock > 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                    {product.stock > 0 ? `✅ ${t('in_stock_msg')}` : `❌ ${t('out_of_stock_msg')}`}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-cream/30 rounded-xl border border-maroon/10 hover:shadow-md transition-shadow">
                  <span className="text-slate font-semibold text-base">{t('brand_label')}</span>
                  <span className="text-maroon font-black text-lg">RongRani</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-green-50 p-7 rounded-3xl shadow-xl border-2 border-green-200">
              <h3 className="text-xl font-black text-green-700 mb-6 flex items-center space-x-3">
                <div className="bg-green-200 p-2 rounded-xl">
                  <Truck className="h-6 w-6 text-green-700" />
                </div>
                <span>{t('delivery_info_label')}</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏙️</span>
                    </div>
                    <span className="text-slate font-semibold">{t('inside_cox')}</span>
                  </div>
                  <span className="font-black text-green-700 text-lg">৳{deliverySettings.chittagongFee}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🌄</span>
                    </div>
                    <span className="text-slate font-semibold">{t('outside_cox')}</span>
                  </div>
                  <span className="font-black text-green-700 text-lg">৳{deliverySettings.outsideChittagongFee}</span>
                </div>
                <div className="bg-gold rounded-2xl p-4 mt-4 shadow-lg">
                  <p className="text-white font-bold text-center text-sm flex items-center justify-center space-x-2">
                    <span className="text-xl">🚚</span>
                    <span>{t('delivered_by')} Steadfast Courier</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-2xl">⚡</span>
                  <p className="text-blue-800 font-semibold text-sm">
                    {t('orders_processed_msg')}
                  </p>
                </div>
              </div>
            </div>

            {/* Why Choose This Gift */}
            <div className="bg-maroon/5 p-7 rounded-3xl shadow-xl border border-maroon/20">
              <h3 className="text-xl font-black text-maroon mb-6 flex items-center space-x-3">
                <div className="bg-maroon/20 p-2 rounded-xl">
                  <Gift className="h-6 w-6 text-maroon" />
                </div>
                <span>{t('why_choose_this')}</span>
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-maroon rounded-full flex items-center justify-center mt-1">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-slate leading-relaxed text-sm">
                    <strong className="text-maroon font-bold block mb-1">💖 {t('handcrafted_love')}</strong>
                    {t('handcrafted_love_desc')}
                  </p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-maroon rounded-full flex items-center justify-center mt-1">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-slate leading-relaxed text-sm">
                    <strong className="text-maroon font-bold block mb-1">🎁 {t('perfect_gift_choice')}</strong>
                    {t('perfect_gift_choice_desc')}
                  </p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-maroon rounded-full flex items-center justify-center mt-1">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-slate leading-relaxed text-sm">
                    <strong className="text-maroon font-bold block mb-1">⭐ {t('premium_quality')}</strong>
                    {t('premium_quality_desc_full')}
                  </p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-maroon rounded-full flex items-center justify-center mt-1">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-slate leading-relaxed text-sm">
                    <strong className="text-maroon font-bold block mb-1">🎀 {t('beautiful_packaging')}</strong>
                    {t('beautiful_packaging_desc')}
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* Features Icons - Full Width */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="bg-blue-50 p-6 rounded-2xl text-center shadow-lg hover:shadow-2xl hover:scale-105 transition-all border border-blue-200 group">
              <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:rotate-12 transition-transform">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-black text-blue-700 mb-2 text-base">Fast Delivery</h4>
              <p className="text-sm text-slate/70 font-medium">2-5 days nationwide</p>
            </div>
            <div className="bg-green-50 p-6 rounded-2xl text-center shadow-lg hover:shadow-2xl hover:scale-105 transition-all border border-green-200 group">
              <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:rotate-12 transition-transform">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-black text-green-700 mb-2 text-base">Quality Guaranteed</h4>
              <p className="text-sm text-slate/70 font-medium">100% authentic products</p>
            </div>
            <div className="bg-amber-50 p-6 rounded-2xl text-center shadow-lg hover:shadow-2xl hover:scale-105 transition-all border border-amber-200 group">
              <div className="bg-amber-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:rotate-12 transition-transform">
                <RotateCcw className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-black text-amber-700 mb-2 text-base">Easy Returns</h4>
              <p className="text-sm text-slate/70 font-medium">7-day return policy</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 animate-fade-in-up stagger-2">
          <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-2xl border border-maroon/10">
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-maroon/10">
              <div>
                <h2 className="text-3xl lg:text-4xl font-black text-maroon">{t('customer_reviews')}</h2>
                <p className="text-slate/60 text-sm mt-2">{reviews.length} {t('customer_reviews')}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-gold/10 px-5 py-3 rounded-2xl border border-gold/30">
                  <Star className="h-6 w-6 text-gold fill-current" />
                  <span className="text-2xl font-black text-gold">{product?.rating?.toFixed(1) || '0.0'}</span>
                </div>
                {canReview && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-maroon text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-maroon-dark hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                  >
                    {t('write_review')}
                  </button>
                )}
              </div>
            </div>
            {loadingReviews ? (
              <div className="text-center py-12">
                <p className="text-slate/60">Loading reviews...</p>
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-5">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-maroon/10 hover:shadow-xl hover:scale-[1.01] transition-all">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-14 h-14 bg-maroon rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-xl">
                          {(review.user?.name || review.guestName || 'A').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="font-bold text-maroon text-lg">{review.user?.name || review.guestName || t('anonymous_user')}</div>
                          {review.isVerifiedPurchase && (
                            <div className="flex items-center gap-1.5 text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">
                              <Shield className="h-3 w-3" />
                              Verified Purchase
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'text-gold fill-current' : 'text-slate/30'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-gold bg-gold/10 px-3 py-1 rounded-full">{review.rating}/5</span>
                        </div>
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-bold text-slate text-base mb-2">{review.title}</h4>
                    )}
                    <p className="text-slate leading-relaxed text-base">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gold/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Star className="h-12 w-12 text-gold" />
                </div>
                <h3 className="text-2xl font-black text-maroon mb-3">No Reviews Yet</h3>
                <p className="text-slate/70 text-lg mb-6">Be the first to review this beautiful product!</p>
                {canReview ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-maroon text-white px-8 py-3 rounded-2xl font-bold hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                  >
                    Write a Review ✨
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-slate-500 mb-4 font-medium">Have you purchased this product? Please share your thoughts!</p>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-maroon text-white px-8 py-3 rounded-2xl font-bold hover:shadow-xl transition-all"
                    >
                      {t('write_review')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {
        relatedProducts.length > 0 && (
          <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-maroon flex items-center gap-2">
                  <TrendingUp className="w-8 h-8" />
                  You May Also Like
                </h2>
                <Link to="/shop" className="text-slate-500 hover:text-maroon font-semibold flex items-center gap-1 group transition-colors">
                  {t('view_all')} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                {relatedProducts.map(product => (
                  <ProductItem key={product._id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )
      }

      {/* Review Form Modal */}
      {
        showReviewForm && (
          <ReviewForm
            productId={id}
            onReviewSubmitted={() => {
              fetchReviews();
            }}
            onClose={() => setShowReviewForm(false)}
          />
        )
      }
    </div >
  );
};

export default ProductDetail;