import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Zap, Gift, TrendingUp, Package, MessageCircle, Building2, Mountain, CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { addToRecentlyViewed } from '../utils/productUtils';
import toast from 'react-hot-toast';
import Seo from '../components/Seo';
import ReviewForm from '../components/ReviewForm';
import ProductItem from '../components/ProductItem';
import { useLanguage } from '../contexts/LanguageContext';
import { useWishlist } from '../contexts/WishlistContext';

import SocialShare from '../components/SocialShare';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const deliverySettings = useMemo(() => ({
    chittagongFee: 60,
    outsideChittagongFee: 130,
  }), []);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(0);

  const isWishlisted = product ? isInWishlist(product._id) : false;
  const baseUrl = (import.meta?.env?.VITE_SITE_URL || 'https://rongrani.vercel.app').replace(/\/+$/, '');

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

      // Keep URL canonical with slug when available
      const canonicalParam = response.data?.slug || response.data?._id;
      if (canonicalParam && canonicalParam !== id) {
        navigate(`/product/${canonicalParam}`, { replace: true });
      }

      // Fetch related products based on category
      if (response.data.category) {
        try {
          const relatedRes = await axios.get(`/api/products?category=${response.data.category}&limit=5`);
          const filtered = relatedRes.data.products.filter((p) => p._id !== response.data._id).slice(0, 4);
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
  }, [id, navigate]);

  // Fetch reviews for this product
  const fetchReviews = useCallback(async () => {
    try {
      setLoadingReviews(true);
      const productIdForReview = product?._id || id;
      const response = await axios.get(`/api/products/${productIdForReview}/reviews`);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [id, product?._id]);

  // Check if user can review
  const checkCanReview = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const productIdForReview = product?._id || id;
      const response = await axios.get(`/api/products/${productIdForReview}/can-review`, config);
      setCanReview(response.data.canReview);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      setCanReview(false);
    }
  }, [id, product?._id]);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    checkCanReview();
  }, [fetchProduct, fetchReviews, checkCanReview]);

  // Add to recently viewed when product is loaded
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [product]);

  const handleAddToCart = useCallback(() => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  }, [addToCart, product, quantity]);

  const handleBuyNow = useCallback(() => {
    addToCart(product, quantity);
    toast.success('Redirecting to checkout...');
    navigate('/checkout');
  }, [addToCart, product, quantity, navigate]);

  const handleAddToWishlist = useCallback(() => {
    toggleWishlist(product);
  }, [toggleWishlist, product]);

  const getImageUrl = (image) => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.url || image.secure_url || '';
  };

  const routeParam = product?.slug || id;
  const pagePath = `/product/${routeParam}`;
  const shareBaseUrl = (
    import.meta?.env?.VITE_SHARE_BASE_URL ||
    import.meta?.env?.VITE_BACKEND_URL ||
    import.meta?.env?.VITE_API_BASE_URL ||
    import.meta?.env?.VITE_SITE_URL ||
    window.location.origin
  ).replace(/\/+$/, '');
  const sharePreviewUrl = `${shareBaseUrl}/share/product/${routeParam}`;
  const { pageTitle, pageDescription, pageKeywords, pageImage } = useMemo(() => {
    if (!product) return {};

    const image = getImageUrl(product.images?.[0]) || getImageUrl(product.image);
    const desc = product.seoDescription || (product.description
      ? buildDescription(product.description)
      : 'View product details, pricing, and delivery options from RongRani.');

    return {
      pageTitle: product.seoTitle || `${product.name} | RongRani`,
      pageDescription: desc,
      pageKeywords: product.tags || [],
      pageImage: image
    };
  }, [product]);
  const productSchema = useMemo(() => product
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
    : null, [product, pageDescription, pageImage, baseUrl, pagePath]);

  const socialMeta = useMemo(() => {
    if (!product) return [];

    return [
      { property: 'product:price:amount', content: String(product.price || 0) },
      { property: 'product:price:currency', content: 'BDT' },
      { property: 'product:availability', content: product.stock > 0 ? 'in stock' : 'out of stock' },
      { property: 'product:retailer_item_id', content: product._id },
    ];
  }, [product]);

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

  const categoryRaw = typeof product?.category === 'string'
    ? product.category
    : product?.category?.name || '';
  const categoryLabel = categoryRaw.replace(/[-_]+/g, ' ').trim();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Seo
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        path={pagePath}
        image={pageImage}
        type="product"
        extraMeta={socialMeta}
        schema={productSchema}
      />
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 relative z-10 mt-6 sm:mt-0">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm flex items-center space-x-2 overflow-x-auto scrollbar-hide">
            <Link to="/" className="text-slate hover:text-maroon transition-colors font-medium whitespace-nowrap flex-shrink-0">Home</Link>
            <span className="text-slate/40 flex-shrink-0">&gt;</span>
            <Link to="/shop" className="text-slate hover:text-maroon transition-colors font-medium whitespace-nowrap flex-shrink-0">Shop</Link>
            {categoryLabel && (
              <>
                <span className="text-slate/40 flex-shrink-0">&gt;</span>
                <Link
                  to={`/shop?category=${encodeURIComponent(categoryRaw)}`}
                  className="text-slate hover:text-maroon transition-colors font-medium capitalize whitespace-nowrap flex-shrink-0"
                >
                  {categoryLabel}
                </Link>
              </>
            )}
            {product?.name && (
              <>
                <span className="text-slate/40 flex-shrink-0">&gt;</span>
                <span className="text-maroon font-bold whitespace-nowrap truncate max-w-[120px] sm:max-w-none">
                  {product.name}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Left: Product Images */}
          <div className="space-y-6">
            <div className="relative group aspect-square rounded-[2.5rem] overflow-hidden bg-slate-50 border-4 border-maroon/5 shadow-2xl">
              {product.images && product.images.length > 0 ? (
                <img
                  src={getImageUrl(product.images[activeImage])}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate">
                  <Package className="h-20 w-20 opacity-20" />
                </div>
              )}

              {/* Discount Tag */}
              {product.originalPrice > product.price && (
                <div className="absolute top-8 left-8 bg-maroon text-white font-black px-6 py-2 rounded-full shadow-2xl shadow-maroon/40 transform -rotate-12 animate-bounce-short">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-300 transform ${activeImage === index
                      ? 'ring-4 ring-maroon scale-105 shadow-xl'
                      : 'ring-1 ring-slate-100 opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                  >
                    <img src={getImageUrl(img)} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col">
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="bg-maroon/10 text-maroon px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-maroon/20">
                    {categoryLabel || 'Premium Collection'}
                  </span>
                  <div className="flex items-center text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    <Star className="h-4 w-4 fill-current mr-1.5" />
                    <span className="text-sm font-bold">{product.rating || '4.8'}</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4 tracking-tighter">
                  {product.name}
                </h1>
                <p className="text-slate text-lg leading-relaxed mb-8 border-l-4 border-maroon/20 pl-6 italic">
                  {product.description}
                </p>
              </div>

              {/* Price Section */}
              <div className="flex items-end space-x-4 mb-8">
                <span className="text-5xl font-black text-maroon tracking-tighter">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-2xl text-slate/40 line-through font-bold mb-1">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center justify-between pb-5 mb-5 border-b-2 border-maroon/10">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-black uppercase tracking-wider ${product.stock > 0 ? 'text-green-600' : 'text-red-600'
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
                  href={`https://wa.me/8801851075537?text=${encodeURIComponent(`Hello RongRani! 💎 I want to order this premium product:\n\n🛍️ *Product:* ${product.name}\n💰 *Price:* ৳${product.price}\n🔗 *Link:* ${window.location.href}`)}`}
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
                  onClick={handleAddToWishlist}
                  className={`w-full py-4 rounded-2xl border-3 transition-all flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-95 font-semibold ${isWishlisted
                    ? 'bg-pink-500 border-pink-500 text-white shadow-xl'
                    : 'bg-white border-maroon/30 text-maroon hover:border-maroon hover:bg-maroon/5'
                    }`}
                >
                  <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current text-white' : 'text-maroon'}`} />
                  <span>{isWishlisted ? t('in_wishlist') : t('add_to_wishlist')}</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Premium Information Layout (Restored Full Width Style) */}
        <div className="mt-20 space-y-8">
          {/* 1. Product Description Box (Full Width) */}
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 md:p-10 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-maroon/10 flex items-center justify-center text-maroon">
                <Package className="w-6 h-6" />
              </div>
              {t('product_description') || 'Product Description'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
              {product.description}
            </p>
          </div>

          {/* 2. Info Grid (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: Product Specifications */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-maroon/10 flex items-center justify-center text-maroon">
                  <Package className="w-5 h-5" />
                </div>
                {t('product_details')}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                  <span className="text-slate-500 font-bold text-sm">{t('category') || 'Category'}:</span>
                  <span className="bg-maroon/10 text-maroon px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{categoryLabel || 'General'}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                  <span className="text-slate-500 font-bold text-sm">{t('sku_label')}:</span>
                  <span className="text-slate-900 dark:text-white font-black">{product.sku || product._id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                  <span className="text-slate-500 font-bold text-sm">{t('availability') || 'Availability'}:</span>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${product.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {product.stock > 0 ? t('in_stock') : t('out_of_stock')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                  <span className="text-slate-500 font-bold text-sm">{t('brand') || 'Brand'}:</span>
                  <span className="text-maroon font-black uppercase tracking-tight">RongRani</span>
                </div>
              </div>
            </div>

            {/* Card 2: Delivery Info */}
            <div className="bg-green-50/30 dark:bg-emerald-950/20 rounded-[2rem] p-8 border border-green-100 dark:border-emerald-900 shadow-xl shadow-green-100/50 dark:shadow-none">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-600">
                  <Truck className="w-5 h-5" />
                </div>
                {t('delivery_info')}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-5 bg-white dark:bg-slate-900 rounded-2xl border border-green-100 dark:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700 dark:text-slate-300 font-bold text-sm">Inside Cox's Bazar:</span>
                  </div>
                  <span className="text-green-600 font-black text-lg">৳{deliverySettings.chittagongFee}</span>
                </div>
                <div className="flex justify-between items-center p-5 bg-white dark:bg-slate-900 rounded-2xl border border-green-100 dark:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <Mountain className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700 dark:text-slate-300 font-bold text-sm">Outside Cox's Bazar:</span>
                  </div>
                  <span className="text-green-600 font-black text-lg">৳{deliverySettings.outsideChittagongFee}</span>
                </div>
                <div className="bg-amber-400 p-4 rounded-2xl flex items-center justify-center gap-3 border shadow-lg border-white/20">
                  <Truck className="w-5 h-5 text-slate-800" />
                  <span className="text-slate-800 font-black text-xs uppercase tracking-wider">Delivered by Steadfast Courier</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">Orders processed within 24 hours</span>
                </div>
              </div>
            </div>

            {/* Card 3: Why Choose This? */}
            <div className="bg-pink-50/30 dark:bg-pink-950/20 rounded-[2rem] p-8 border border-pink-100 dark:border-pink-900 shadow-xl shadow-pink-100/50 dark:shadow-none">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-600">
                  <Gift className="w-5 h-5" />
                </div>
                {t('why_choose_this')}
              </h3>
              <div className="space-y-6">
                {[
                  { title: t('handcrafted_love'), desc: t('handcrafted_love_desc'), color: 'text-maroon' },
                  { title: t('perfect_gift_choice'), desc: t('perfect_gift_choice_desc'), color: 'text-blue-500' },
                  { title: t('premium_quality'), desc: t('premium_quality_desc'), color: 'text-amber-500' },
                  { title: t('beautiful_packaging'), desc: t('beautiful_packaging_desc'), color: 'text-purple-500' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Bottom Trust Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-8 rounded-[2rem] border border-blue-100 dark:border-blue-900 group hover:scale-[1.02] transition-transform">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-500/30">
                <Truck className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-blue-900 dark:text-blue-400 text-center mb-1">{t('fast_delivery_title')}</h4>
              <p className="text-blue-600/60 dark:text-blue-300/40 text-sm font-bold text-center">{t('fast_delivery_desc')}</p>
            </div>
            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-8 rounded-[2rem] border border-emerald-100 dark:border-emerald-900 group hover:scale-[1.02] transition-transform">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-500/30">
                <Shield className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-emerald-900 dark:text-emerald-400 text-center mb-1">{t('quality_guaranteed_title')}</h4>
              <p className="text-emerald-600/60 dark:text-emerald-300/40 text-sm font-bold text-center">{t('authentic_products_desc')}</p>
            </div>
            <div className="bg-amber-50/50 dark:bg-amber-900/10 p-8 rounded-[2rem] border border-amber-100 dark:border-amber-900 group hover:scale-[1.02] transition-transform">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-amber-500/30">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-amber-900 dark:text-amber-400 text-center mb-1">{t('easy_returns_title')}</h4>
              <p className="text-amber-600/60 dark:text-amber-300/40 text-sm font-bold text-center">{t('return_policy_desc')}</p>
            </div>
          </div>
        </div>


        {/* Product Sharing */}
        <div className="mt-12 p-8 bg-cream/30 rounded-[3rem] border border-maroon/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black text-slate-900 mb-2">{t('share_love')}</h3>
              <p className="text-slate">{t('tell_friends_art')}</p>
            </div>
            <SocialShare
              url={window.location.href}
              previewUrl={sharePreviewUrl}
              title={product.name}
              image={pageImage}
              description={product.description}
              price={product.price}
            />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">{t('customer_reviews')}</h2>
              <div className="flex items-center space-x-4">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating || 5) ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <span className="text-slate font-bold">{reviews.length} {t('authentic_reviews')}</span>
              </div>
            </div>
            {canReview && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-maroon text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> {t('write_review')}
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="mb-12 animate-fade-in">
              <ReviewForm
                productId={product?._id || id}
                onSuccess={() => {
                  setShowReviewForm(false);
                  fetchReviews();
                  checkCanReview();
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          {loadingReviews ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon mx-auto mb-4"></div>
              <p className="text-slate">Fetching authentic feedback...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-maroon text-white flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-maroon/10">
                          {review.user?.name?.charAt(0) || review.guestName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{review.user?.name || review.guestName || 'Anonymous'}</p>
                          <p className="text-xs text-slate/40 font-bold">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate leading-relaxed italic">"{review.comment}"</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <MessageCircle className="h-16 w-16 text-slate/20 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-400 mb-2">{t('no_reviews_yet')}</h3>
              <p className="text-slate/40 max-w-md mx-auto">{t('be_first_review')}</p>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-2">{t('you_might_also_love')}</h2>
                <p className="text-slate">{t('curated_art_similar')}</p>
              </div>
              <Link to="/shop" className="text-maroon font-bold hover:underline underline-offset-8 flex items-center group">
                {t('view_all_collection')} <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {relatedProducts.map((p) => (
                <div key={p._id} className="animate-fade-in-up">
                  <ProductItem product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;