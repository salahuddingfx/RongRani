import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductItem from '../components/ProductItem';
import { Search, Filter, X } from 'lucide-react';
import Seo from '../components/Seo';
import { useSocket } from '../contexts/socketContextBase';
import { useLanguage } from '../contexts/LanguageContext';

const Shop = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'createdAt'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 12;
  const { socket } = useSocket() || {};

  // Update filters when URL params change
  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      search: searchParams.get('search') || '',
      sort: searchParams.get('sort') || 'createdAt'
    });
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', currentPage);
      params.append('limit', productsPerPage);

      const response = await axios.get(`/api/products?${params}`);
      setProducts(response.data.products);
      setTotalProducts(response.data.total);
      setTotalPages(Math.ceil(response.data.total / productsPerPage));
    } catch (error) {
      console.error('Error fetching products:', error);
      // RongRani Gift Products - Fallback data with client-side filtering

      // Apply client-side filtering to fallback products
      let filteredProducts = FALLBACK_PRODUCTS;

      // Filter by search query
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
        );
      }

      // Filter by category
      if (filters.category) {
        filteredProducts = filteredProducts.filter(product =>
          product.category.toLowerCase() === filters.category.toLowerCase()
        );
      }

      // Filter by price range
      if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(product =>
          product.price >= parseFloat(filters.minPrice)
        );
      }
      if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(product =>
          product.price <= parseFloat(filters.maxPrice)
        );
      }

      // Sort products
      if (filters.sort) {
        filteredProducts = [...filteredProducts].sort((a, b) => {
          switch (filters.sort) {
            case 'price':
              return a.price - b.price;
            case '-price':
              return b.price - a.price;
            case 'name':
              return a.name.localeCompare(b.name);
            case '-name':
              return b.name.localeCompare(a.name);
            case 'createdAt':
            default:
              return 0; // Keep original order for fallback data
          }
        });
      }

      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      setProducts(filteredProducts.slice(startIndex, endIndex));
      setTotalProducts(filteredProducts.length);
      setTotalPages(Math.ceil(filteredProducts.length / productsPerPage));
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, productsPerPage]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // RongRani Categories
      setCategories([
        'Love Combo',
        'Anniversary Combo',
        'Birthday Combo',
        'Valentine Combo',
        'Proposal Combo',
        'Jewellery',
        'Watches',
        'Chocolates',
        'Gifts',
        'Handmade',
        'Clothing',
        'Gift Boxes'
      ]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, currentPage]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('product:created', fetchProducts);
    socket.on('product:updated', fetchProducts);
    socket.on('product:deleted', fetchProducts);
    socket.on('category:created', fetchCategories);
    socket.on('category:updated', fetchCategories);
    socket.on('category:deleted', fetchCategories);

    return () => {
      socket.off('product:created', fetchProducts);
      socket.off('product:updated', fetchProducts);
      socket.off('product:deleted', fetchProducts);
      socket.off('category:created', fetchCategories);
      socket.off('category:updated', fetchCategories);
      socket.off('category:deleted', fetchCategories);
    };
  }, [socket, fetchProducts, fetchCategories]);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setShowFilters(true);
    }
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: 'createdAt'
    });
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen">
      <Seo
        title="Shop Handmade Gifts & Surprise Boxes | RongRani"
        description="Browse handmade gifts, surprise boxes, jewelry, chocolates, and decor. Filter by price, category, and occasion to find the perfect gift in Bangladesh."
        path="/shop"
      />
      {/* Hero Section */}
      <section className="min-h-[40vh] sm:min-h-[50vh] flex items-center justify-center px-4 bg-cream dark:bg-gray-900">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-maroon mb-4 sm:mb-6">
            {t('shop_hero_title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate dark:text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8">
            {t('shop_hero_subtitle')}
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-maroon dark:text-maroon-light">{totalProducts || 500}+</div>
              <div className="text-slate dark:text-gray-300 text-xs sm:text-sm">{t('products_count')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-maroon dark:text-maroon-light">50+</div>
              <div className="text-slate dark:text-gray-300 text-xs sm:text-sm">{t('artisans_count')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-maroon dark:text-maroon-light">4.8★</div>
              <div className="text-slate dark:text-gray-300 text-xs sm:text-sm">{t('rating')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header with Search and Filter Toggle */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-maroon mb-2">{t('shop_collection')}</h2>
            <p className="text-slate text-sm sm:text-base">{t('shop_collection_subtitle')}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field pl-12 pr-4 py-3 rounded-full w-full sm:w-72 md:w-80 shadow-lg"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary px-5 py-3 rounded-full flex items-center justify-center space-x-2 font-medium"
              aria-expanded={showFilters}
            >
              <Filter className="h-5 w-5" />
              <span>{showFilters ? t('hide_filters') : t('show_filters')}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} w-full lg:w-80`}
          >
            <div className="card p-4 sm:p-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-maroon">{t('filters_label')}</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-slate hover:text-maroon transition-colors underline"
                  >
                    {t('clear_all')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="p-2 rounded-full hover:bg-cream-light text-slate"
                    aria-label="Close filters"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate mb-3">{t('category_label').replace(':', '')}</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input-field"
                >
                  <option value="">{t('all_categories')}</option>
                  {categories && categories.map((category) => (
                    <option key={category._id || category.name || category} value={typeof category === 'string' ? category : category.name}>
                      {t('cat_' + (typeof category === 'string' ? category : category.name).toLowerCase().replace(/\s+/g, '_'))}
                      {typeof category === 'object' && category.productCount ? ` (${category.productCount})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate mb-3">{t('price_range')} (৳)</label>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    placeholder={t('min_price')}
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input-field flex-1"
                  />
                  <input
                    type="number"
                    placeholder={t('max_price')}
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input-field flex-1"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate mb-3">{t('sort_by')}</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="input-field"
                >
                  <option value="createdAt">{t('newest_first')}</option>
                  <option value="price">{t('price_low_high')}</option>
                  <option value="-price">{t('price_high_low')}</option>
                  <option value="name">{t('name_a_z')}</option>
                  <option value="-name">{t('name_z_a')}</option>
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="w-full btn-secondary py-3 rounded-full font-medium"
              >
                {t('reset_filters')}
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon mx-auto mb-4"></div>
                  <p className="text-slate">{t('loading_products')}</p>
                </div>
              </div>
            ) : products && products.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-slate">
                    {t('showing_products').replace('{count}', products.length)}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                  {products && products.map((product, index) => (
                    <div
                      key={product._id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ProductItem product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-12">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border-2 border-maroon/20 hover:bg-maroon hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('previous')}
                    </button>

                    {totalPages && [...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${currentPage === pageNum
                              ? 'bg-maroon text-white border-maroon'
                              : 'border-maroon/20 hover:bg-maroon hover:text-white'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return <span key={pageNum} className="px-2 text-slate">...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border-2 border-maroon/20 hover:bg-maroon hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('next')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-slate" />
                </div>
                <h3 className="text-2xl font-bold text-maroon mb-2">{t('no_products_found_msg')}</h3>
                <p className="text-slate mb-6">{t('try_adjust_filters')}</p>
                <button
                  onClick={clearFilters}
                  className="btn-primary px-8 py-3 rounded-full font-medium"
                >
                  {t('clear_all')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FALLBACK_PRODUCTS = [
  // Jewellery
  {
    _id: '1',
    name: 'Gold Plated Party Necklace',
    description: 'Elegant gold plated necklace perfect for parties and gifts',
    price: 2500,
    originalPrice: 3200,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400' }],
    stock: 15,
    category: 'Jewellery',
    rating: 4.8,
    reviewCount: 125
  },
  {
    _id: '2',
    name: 'Designer Bangles Set',
    description: 'Beautiful set of 4 designer bangles with stone work',
    price: 1800,
    originalPrice: 2200,
    images: [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400' }],
    stock: 20,
    category: 'Jewellery',
    rating: 4.7,
    reviewCount: 89
  },
  {
    _id: '3',
    name: 'Couple Rings Set',
    description: 'Matching couple rings with engraving option',
    price: 3500,
    originalPrice: 4200,
    images: [{ url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400' }],
    stock: 12,
    category: 'Jewellery',
    rating: 4.9,
    reviewCount: 156
  },
  {
    _id: '4',
    name: 'Jhumka Earrings',
    description: 'Traditional jhumka earrings with pearl detailing',
    price: 1200,
    originalPrice: 1500,
    images: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400' }],
    stock: 25,
    category: 'Jewellery',
    rating: 4.6,
    reviewCount: 78
  },
  // Watches
  {
    _id: '5',
    name: 'Ladies Elegant Watch',
    description: 'Stylish ladies watch with leather strap',
    price: 4500,
    originalPrice: 5500,
    images: [{ url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400' }],
    stock: 10,
    category: 'Watches',
    rating: 4.8,
    reviewCount: 92
  },
  {
    _id: '6',
    name: 'Couple Watch Set',
    description: 'Matching his & her watch set - perfect gift',
    price: 7500,
    originalPrice: 9000,
    images: [{ url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400' }],
    stock: 8,
    category: 'Watches',
    rating: 4.9,
    reviewCount: 145
  },
  // Chocolates
  {
    _id: '7',
    name: 'Premium Chocolate Gift Box',
    description: 'Assorted Dairy Milk, KitKat & Silk chocolates',
    price: 1500,
    originalPrice: 1800,
    images: [{ url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400' }],
    stock: 30,
    category: 'Chocolates',
    rating: 4.7,
    reviewCount: 203
  },
  {
    _id: '8',
    name: 'Heart Shape Chocolate Box',
    description: 'romantic heart-shaped chocolate gift box',
    price: 2200,
    originalPrice: 2500,
    images: [{ url: 'https://images.unsplash.com/photo-1548848774-1f1db32f8e20?w=400' }],
    stock: 18,
    category: 'Chocolates',
    rating: 4.9,
    reviewCount: 178
  },
  // Teddy & Gifts
  {
    _id: '9',
    name: 'Large Teddy Bear',
    description: 'Cute and cuddly teddy bear - 2 feet tall',
    price: 1800,
    originalPrice: 2200,
    images: [{ url: 'https://images.unsplash.com/photo-1560012057-71269d46f5f8?w=400' }],
    stock: 15,
    category: 'Gifts',
    rating: 4.8,
    reviewCount: 167
  },
  {
    _id: '10',
    name: 'Artificial Rose Bouquet',
    description: 'Beautiful artificial rose bouquet (12 roses)',
    price: 800,
    originalPrice: 1000,
    images: [{ url: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400' }],
    stock: 40,
    category: 'Gifts',
    rating: 4.5,
    reviewCount: 95
  },
  // Love Combo
  {
    _id: '11',
    name: 'Love Combo - RongRani Special',
    description: 'Handwritten love letter + chocolate + flower combo',
    price: 2500,
    originalPrice: 3000,
    images: [{ url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400' }],
    stock: 12,
    category: 'Love Combo',
    rating: 5.0,
    reviewCount: 234
  },
  {
    _id: '12',
    name: 'Ring + Teddy + Chocolate Combo',
    description: 'Perfect romantic surprise combo pack',
    price: 4500,
    originalPrice: 5500,
    images: [{ url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400' }],
    stock: 8,
    category: 'Love Combo',
    rating: 4.9,
    reviewCount: 189
  },
  // Birthday Combo
  {
    _id: '13',
    name: 'Birthday Gift Box',
    description: 'Complete birthday surprise with treats & gifts',
    price: 3500,
    originalPrice: 4200,
    images: [{ url: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400' }],
    stock: 10,
    category: 'Birthday Combo',
    rating: 4.8,
    reviewCount: 145
  },
  // Anniversary Combo
  {
    _id: '14',
    name: 'Anniversary Surprise Box',
    description: 'Necklace + bangles + love note combo',
    price: 5500,
    originalPrice: 6800,
    images: [{ url: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400' }],
    stock: 6,
    category: 'Anniversary Combo',
    rating: 5.0,
    reviewCount: 198
  },
  // Sharee
  {
    _id: '15',
    name: 'Premium Gift Sharee',
    description: 'Beautiful gift-wrapped sharee with jewellery',
    price: 6500,
    originalPrice: 8000,
    images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400' }],
    stock: 5,
    category: 'Clothing',
    rating: 4.9,
    reviewCount: 87
  },
  // Handmade Gifts
  {
    _id: '16',
    name: 'Handwritten Love Letter',
    description: 'Personalized handwritten love letter in Bengali/English',
    price: 500,
    originalPrice: 500,
    images: [{ url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400' }],
    stock: 50,
    category: 'Handmade',
    rating: 4.9,
    reviewCount: 312
  },
  {
    _id: '17',
    name: 'Memory Scrap Book',
    description: 'Custom photo memory scrapbook with decorations',
    price: 1500,
    originalPrice: 1800,
    images: [{ url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400' }],
    stock: 15,
    category: 'Handmade',
    rating: 4.8,
    reviewCount: 134
  },
  // Valentine Combo
  {
    _id: '18',
    name: 'Valentine Special Combo',
    description: 'Ring + roses + chocolate + love letter combo',
    price: 6500,
    originalPrice: 7800,
    images: [{ url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400' }],
    stock: 10,
    category: 'Valentine Combo',
    rating: 5.0,
    reviewCount: 245
  },
  // Proposal Combo
  {
    _id: '19',
    name: 'Proposal Gift Box',
    description: 'Complete proposal setup with ring & romantic items',
    price: 8500,
    originalPrice: 10000,
    images: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400' }],
    stock: 5,
    category: 'Proposal Combo',
    rating: 5.0,
    reviewCount: 167
  },
  // Gift Boxes
  {
    _id: '20',
    name: 'Premium Luxury Gift Box',
    description: 'Customizable luxury gift box with your choice of items',
    price: 9500,
    originalPrice: 12000,
    images: [{ url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400' }],
    stock: 8,
    category: 'Gift Boxes',
    rating: 4.9,
    reviewCount: 178
  }
];

export default Shop;