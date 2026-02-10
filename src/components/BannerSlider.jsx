import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../contexts/socketContextBase';

const DEFAULT_BANNERS = [
  {
    id: 1,
    title: 'Handcrafted Excellence',
    subtitle: 'Discover Traditional Bengali Crafts',
    description: 'Each piece tells a story of heritage and craftsmanship',
    bgColor: 'bg-maroon',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1000&q=80&auto=format,webp',
    link: '/shop'
  },
  {
    id: 2,
    title: 'Anniversary Special',
    subtitle: 'Make Your Moments Memorable',
    description: 'Customized surprise boxes and flowers for your loved ones',
    bgColor: 'bg-pink-800',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&q=80&auto=format,webp',
    link: '/shop'
  },
  {
    id: 3,
    title: 'Support Local Artisans',
    subtitle: 'Every Purchase Makes a Difference',
    description: 'Empowering craftspeople across Bangladesh',
    bgColor: 'bg-teal-700',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1000&q=80&auto=format,webp',
    link: '/shop'
  }
];

const BannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket() || {};

  // Fetch banners from API
  const fetchBanners = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/banners');
      const fetchedBanners = response.data.map((banner) => ({
        id: banner._id,
        title: banner.title || 'Banner Title',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        bgColor: banner.bgColor || 'bg-maroon',
        textColor: banner.textColor || 'text-white',
        image: typeof banner.image === 'object' ? banner.image.url : (banner.image || 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1200&q=80'),
        link: banner.link || '#'
      }));
      setBanners(fetchedBanners.length > 0 ? fetchedBanners : DEFAULT_BANNERS);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners(DEFAULT_BANNERS);
    } finally {
      setLoading(false);
    }
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Initialize banners and listen for socket updates
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (!socket) return;

    socket.on('banner:created', () => fetchBanners());
    socket.on('banner:updated', () => fetchBanners());
    socket.on('banner:deleted', () => fetchBanners());

    return () => {
      socket.off('banner:created');
      socket.off('banner:updated');
      socket.off('banner:deleted');
    };
  }, [socket, fetchBanners]);

  useEffect(() => {
    if (!isAutoPlaying || banners.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, isAutoPlaying, nextSlide, banners.length]);

  if (loading) {
    return (
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl bg-gray-200 animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl group">
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`min-w-full h-full ${banner.bgColor} flex items-center justify-center px-8 md:px-16 relative`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 hidden sm:block">
              <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-white rounded-full blur-2xl md:blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 md:w-80 md:h-80 bg-white rounded-full blur-2xl md:blur-3xl"></div>
            </div>

            {/* Background Image (Optional) */}
            {banner.image && (
              <div className="absolute inset-0 z-0">
                <img
                  src={banner.image}
                  alt=""
                  className="w-full h-full object-cover opacity-20"
                  decoding="async"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            )}

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center h-full">
              <div className="text-center md:text-left px-4">
                <h2 className={`text-3xl sm:text-4xl md:text-6xl font-black ${banner.textColor} mb-3 sm:mb-4 leading-tight animate-fade-in-up`}>
                  {banner.title}
                </h2>
                <p className={`text-lg sm:text-xl md:text-3xl ${banner.textColor} mb-4 sm:mb-6 font-semibold opacity-90 animate-fade-in-up stagger-1`}>
                  {banner.subtitle}
                </p>
                <p className={`text-sm sm:text-base md:text-lg ${banner.textColor} mb-6 sm:mb-8 opacity-80 line-clamp-2 sm:line-clamp-none animate-fade-in-up stagger-2`}>
                  {banner.description}
                </p>
                <div className="flex justify-center md:justify-start space-x-4 animate-fade-in-up stagger-3">
                  <Link to={banner.link || '/shop'} className="btn-primary px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg shadow-2xl inline-block">
                    Shop Now
                  </Link>
                </div>
              </div>

              {/* Banner Image */}
              <div className="hidden md:block animate-fade-in-right">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-white/30 to-white/10 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative w-full h-96 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                    {banner.image ? (
                      <img
                        src={banner.image}
                        alt={banner.title}
                        width="800"
                        height="400"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        decoding="async"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50 text-4xl font-bold">
                        No Image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-maroon p-4 rounded-full shadow-xl hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-maroon p-4 rounded-full shadow-xl hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${currentSlide === index
              ? 'w-12 h-3 bg-white'
              : 'w-3 h-3 bg-white/50 hover:bg-white/80'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
