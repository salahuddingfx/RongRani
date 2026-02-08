import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const banners = [
    {
      id: 1,
      title: 'Handcrafted Excellence',
      subtitle: 'Discover Traditional Bengali Crafts',
      description: 'Each piece tells a story of heritage and craftsmanship',
      bgColor: 'bg-gradient-to-br from-maroon via-maroon-light to-gold',
      textColor: 'text-white',
      image: '/api/placeholder/800/400'
    },
    {
      id: 2,
      title: 'Summer Collection 2026',
      subtitle: 'New Arrivals - Up to 40% Off',
      description: 'Premium handwoven textiles and artisan crafts',
      bgColor: 'bg-gradient-to-br from-emerald via-emerald-light to-teal',
      textColor: 'text-white',
      image: '/api/placeholder/800/400'
    },
    {
      id: 3,
      title: 'Support Local Artisans',
      subtitle: 'Every Purchase Makes a Difference',
      description: 'Empowering craftspeople across Bangladesh',
      bgColor: 'bg-gradient-to-br from-gold via-amber to-orange',
      textColor: 'text-charcoal',
      image: '/api/placeholder/800/400'
    }
  ];

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

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, isAutoPlaying, nextSlide]);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-3xl shadow-2xl group">
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`min-w-full h-full ${banner.bgColor} flex items-center justify-center px-8 md:px-16 relative`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <h2 className={`text-5xl md:text-6xl font-bold ${banner.textColor} mb-4 leading-tight animate-fade-in-up`}>
                  {banner.title}
                </h2>
                <p className={`text-2xl md:text-3xl ${banner.textColor} mb-6 font-medium animate-fade-in-up stagger-1`}>
                  {banner.subtitle}
                </p>
                <p className={`text-lg ${banner.textColor} mb-8 opacity-90 animate-fade-in-up stagger-2`}>
                  {banner.description}
                </p>
                <div className="flex space-x-4 animate-fade-in-up stagger-3">
                  <button className="btn-primary px-8 py-4 text-lg shadow-2xl">
                    Shop Now
                  </button>
                  <button className="btn-secondary px-8 py-4 text-lg">
                    Learn More
                  </button>
                </div>
              </div>

              {/* Optional Image/Illustration */}
              <div className="hidden md:block">
                <div className="w-full h-80 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl flex items-center justify-center border-2 border-white/30">
                  <span className="text-white/50 text-4xl font-bold">Featured Product</span>
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
            className={`transition-all duration-300 rounded-full ${
              currentSlide === index
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
