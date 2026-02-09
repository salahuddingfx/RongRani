import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Zap, Gift, TrendingUp, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { addToRecentlyViewed } from '../utils/productUtils';
import toast from 'react-hot-toast';
import Seo from '../components/Seo';
import ReviewForm from '../components/ReviewForm';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
    chittagongFee: 60,
    outsideChittagongFee: 130,
  });
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
    } catch {
      // Mock data for development
      const mockProducts = {
        '1': {
          _id: '1',
          name: 'Handwoven Silk Scarf',
          description: 'Beautiful handwoven silk scarf with traditional patterns. Made from the finest silk threads and handwoven by skilled artisans using age-old techniques.',
          price: 2250,
          originalPrice: 2500,
          images: [{url: '/api/placeholder/400/400'}, {url: '/api/placeholder/400/400'}, {url: '/api/placeholder/400/400'}],
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
          images: [{url: '/api/placeholder/400/400'}, {url: '/api/placeholder/400/400'}],
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
  const pageTitle = product ? `${product.name} | Chirkut Ghor` : 'Product Details | Chirkut Ghor';
  const pageDescription = product?.description
    ? buildDescription(product.description)
    : 'View product details, pricing, and delivery options from Chirkut Ghor.';
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
        brand: { '@type': 'Brand', name: 'Chirkut Ghor' },
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
          title="Product Details | Chirkut Ghor"
          description="View product details, pricing, and delivery options from Chirkut Ghor."
          path={pagePath}
        />
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-maroon mx-auto mb-4"></div>
          <p className="text-slate">Loading beautiful product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Seo
          title="Product Not Found | Chirkut Ghor"
          description="The product you are looking for is unavailable. Explore handmade gifts and surprise boxes at Chirkut Ghor."
          path={pagePath}
          noIndex
        />
        <div className="text-center">
          <div className="w-24 h-24 bg-slate/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-slate" />
          </div>
          <h2 className="text-2xl font-bold text-maroon mb-2">Product Not Found</h2>
          <p className="text-slate">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const categoryLabel = product?.category ? product.category.toString() : '';
  const categoryParam = categoryLabel ? encodeURIComponent(categoryLabel) : '';

  return (
    <div className="min-h-screen bg-cream">
      <Seo
        title={pageTitle}
        description={pageDescription}
        path={pagePath}
        image={pageImage}
        schema={productSchema}
      />
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-16 sm:top-20 md:top-24 z-40">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm flex items-center space-x-2">
            <Link to="/" className="text-slate hover:text-maroon transition-colors font-medium">Home</Link>
            <span className="text-slate/40">/</span>
            <Link to="/shop" className="text-slate hover:text-maroon transition-colors font-medium">Shop</Link>
            {categoryLabel && (
              <>
                <span className="text-slate/40">/</span>
                <Link
                  to={`/shop?category=${categoryParam}`}
                  className="text-slate hover:text-maroon transition-colors capitalize font-medium"
                >
                  {categoryLabel}
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
          {/* Product Images */}
          <div className="space-y-4 animate-fade-in-up lg:sticky lg:top-32 lg:self-start lg:col-span-5 xl:col-span-6">
            {/* Main Image */}
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl group border border-maroon/10">
              <div className="aspect-square w-full p-4">
                <img
                  src={
                    getImageUrl(product.images?.[selectedImage]) ||
                    getImageUrl(product.image) ||
                    '/api/placeholder/600/600'
                  }
                  alt={product.name}
                  className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-maroon/90 backdrop-blur-md rounded-full p-3 hover:bg-maroon shadow-xl hover:scale-110 transition-all text-white"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-maroon/90 backdrop-blur-md rounded-full p-3 hover:bg-maroon shadow-xl hover:scale-110 transition-all text-white"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-6 left-6">
                  <div className="bg-maroon text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>-{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</span>
                  </div>
                </div>
              )}
              {/* New Badge */}
              <div className="absolute top-6 right-6">
                <div className="bg-gold text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-pulse">
                  ⭐ TRENDING
                </div>
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images?.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-3 transition-all duration-300 ${
                      selectedImage === index 
                        ? 'border-maroon shadow-2xl scale-110 ring-4 ring-maroon/20' 
                        : 'border-maroon/10 hover:border-maroon/50 hover:scale-105'
                    }`}
                  >
                    <img
                      src={getImageUrl(image) || '/api/placeholder/120/120'}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5 animate-fade-in-up stagger-1 lg:col-span-7 xl:col-span-6">
            {/* Header Card */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-maroon/10">
              {/* Category Badge */}
              <div className="inline-flex items-center space-x-2 bg-maroon/10 text-maroon px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                <Package className="h-4 w-4" />
                <span className="capitalize">{product.category}</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-maroon mb-5 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b-2 border-maroon/10">
                <div className="flex items-center space-x-1 bg-gold/10 px-3 py-2 rounded-xl">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-gold fill-current'
                          : 'text-slate/30'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-maroon">
                    {product.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-slate/60 font-medium">
                    ({product.reviewCount || 0} reviews)
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
                        Save ৳{product.originalPrice - product.price}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-maroon/60 text-sm font-medium mt-2">Inclusive of all taxes</p>
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
                  <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${
                    product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`font-bold text-base ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.stock > 0 ? `✅ ${product.stock} in stock` : '❌ Out of stock'}
                  </span>
                </div>
                {product.stock > 0 && product.stock < 10 && (
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                    ⚠️ Limited Stock
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="text-slate font-bold text-lg mb-3 block">Select Quantity:</label>
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
                  <span className="relative z-10">Buy Now ⚡</span>
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-white border-3 border-maroon text-maroon py-5 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:bg-maroon hover:text-white hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span>Add to Cart 🛍️</span>
                </button>
                <button
                  onClick={addToWishlist}
                  className={`w-full py-4 rounded-2xl border-3 transition-all flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-95 font-semibold ${
                    isWishlisted
                      ? 'bg-pink-500 border-pink-500 text-white shadow-xl'
                      : 'bg-white border-maroon/30 text-maroon hover:border-maroon hover:bg-maroon/5'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current animate-pulse' : ''}`} />
                  <span>{isWishlisted ? 'Saved to Wishlist ❤️' : 'Add to Wishlist 🤍'}</span>
                </button>

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
              <span>Product Description</span>
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
                <span>Product Details</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-cream/30 rounded-xl border border-maroon/10 hover:shadow-md transition-shadow">
                  <span className="text-slate font-semibold text-base">Category:</span>
                  <span className="text-maroon font-bold capitalize bg-maroon/10 px-4 py-1.5 rounded-full">{product.category}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-cream/30 rounded-xl border border-maroon/10 hover:shadow-md transition-shadow">
                  <span className="text-slate font-semibold text-base">SKU:</span>
                  <span className="text-charcoal font-bold font-mono text-sm break-all">{product.sku || product._id?.substring(0, 8).toUpperCase() || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-cream/30 rounded-xl border border-maroon/10 hover:shadow-md transition-shadow">
                  <span className="text-slate font-semibold text-base">Availability:</span>
                  <span className={`font-bold px-4 py-1.5 rounded-full ${product.stock > 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                    {product.stock > 0 ? '✅ In Stock' : '❌ Out of Stock'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-cream/30 rounded-xl border border-maroon/10 hover:shadow-md transition-shadow">
                  <span className="text-slate font-semibold text-base">Brand:</span>
                  <span className="text-maroon font-black text-lg">Chirkut ঘর</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-green-50 p-7 rounded-3xl shadow-xl border-2 border-green-200">
              <h3 className="text-xl font-black text-green-700 mb-6 flex items-center space-x-3">
                <div className="bg-green-200 p-2 rounded-xl">
                  <Truck className="h-6 w-6 text-green-700" />
                </div>
                <span>Delivery Information</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏙️</span>
                    </div>
                    <span className="text-slate font-semibold">Inside Cox's Bazar:</span>
                  </div>
                  <span className="font-black text-green-700 text-lg">৳{deliverySettings.chittagongFee}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🌄</span>
                    </div>
                    <span className="text-slate font-semibold">Outside Cox's Bazar:</span>
                  </div>
                  <span className="font-black text-green-700 text-lg">৳{deliverySettings.outsideChittagongFee}</span>
                </div>
                <div className="bg-gold rounded-2xl p-4 mt-4 shadow-lg">
                  <p className="text-white font-bold text-center text-sm flex items-center justify-center space-x-2">
                    <span className="text-xl">🚚</span>
                    <span>Delivered by Steadfast Courier</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-2xl">⚡</span>
                  <p className="text-blue-800 font-semibold text-sm">
                    Orders processed within 24 hours
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
                <span>Why Choose This?</span>
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-maroon rounded-full flex items-center justify-center mt-1">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-slate leading-relaxed text-sm">
                    <strong className="text-maroon font-bold block mb-1">💖 Handcrafted with Love</strong>
                    Each piece is carefully made with attention to detail and quality.
                  </p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-maroon rounded-full flex items-center justify-center mt-1">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-slate leading-relaxed text-sm">
                    <strong className="text-maroon font-bold block mb-1">🎁 Perfect Gift Choice</strong>
                    Thoughtfully designed to bring joy and make special moments memorable.
                  </p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-maroon rounded-full flex items-center justify-center mt-1">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-slate leading-relaxed text-sm">
                    <strong className="text-maroon font-bold block mb-1">⭐ Premium Quality</strong>
                    We use only the finest materials to ensure lasting beauty and durability.
                  </p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-maroon rounded-full flex items-center justify-center mt-1">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-slate leading-relaxed text-sm">
                    <strong className="text-maroon font-bold block mb-1">🎀 Beautiful Packaging</strong>
                    Comes in elegant gift wrapping, ready to present to your loved ones.
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
                <h2 className="text-3xl lg:text-4xl font-black text-maroon">Customer Reviews</h2>
                <p className="text-slate/60 text-sm mt-2">{reviews.length} verified reviews</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-gold/10 px-5 py-3 rounded-2xl border border-gold/30">
                  <Star className="h-6 w-6 text-gold fill-current" />
                  <span className="text-2xl font-black text-gold">{product?.rating?.toFixed(1) || '0.0'}</span>
                </div>
                {canReview && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-gradient-to-r from-maroon to-pink-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                  >
                    Write Review ✨
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
                        <div className="font-bold text-maroon text-lg">{review.user?.name || review.guestName || 'Anonymous User'}</div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-gold fill-current' : 'text-slate/30'
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
                    <p className="text-slate/60 mb-4">You can only review products you've ordered and received.</p>
                    <Link to="/shop" className="text-maroon font-bold hover:underline">
                      Browse our collection →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          productId={id}
          onReviewSubmitted={() => {
            fetchReviews();
          }}
          onClose={() => setShowReviewForm(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;