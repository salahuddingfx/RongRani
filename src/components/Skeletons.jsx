import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="card animate-fade-in-up">
      <div className="relative overflow-hidden">
        <div className="w-full h-72 bg-gray-200 skeleton rounded-t-2xl"></div>
        <div className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg">
          <div className="w-5 h-5 bg-gray-200 skeleton rounded"></div>
        </div>
        <div className="absolute top-4 left-4 px-4 py-2 bg-gray-200 skeleton rounded-2xl">
          <div className="w-16 h-4 bg-gray-300 skeleton rounded"></div>
        </div>
      </div>

      <div className="p-6 bg-white">
        <div className="mb-4">
          <div className="w-20 h-6 bg-gray-200 skeleton rounded-2xl"></div>
        </div>

        <div className="mb-3">
          <div className="w-full h-6 bg-gray-200 skeleton rounded mb-2"></div>
          <div className="w-3/4 h-6 bg-gray-200 skeleton rounded"></div>
        </div>

        <div className="mb-5">
          <div className="w-full h-4 bg-gray-200 skeleton rounded"></div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 skeleton rounded"></div>
            ))}
          </div>
          <div className="w-24 h-4 bg-gray-200 skeleton rounded"></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-20 h-8 bg-gray-200 skeleton rounded"></div>
            <div className="w-16 h-6 bg-gray-200 skeleton rounded"></div>
          </div>
          <div className="w-16 h-6 bg-gray-200 skeleton rounded"></div>
        </div>
      </div>
    </div>
  );
};

const HeroSkeleton = () => {
  return (
    <section className="section-spacing hero-bg relative overflow-hidden">
      <div className="section-container relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="glass-card p-10 md:p-16 mb-16 animate-scale-in">
            <div className="flex items-center justify-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-maroon/20 skeleton rounded-full"></div>
              <div className="w-48 h-6 bg-maroon/20 skeleton rounded-full"></div>
            </div>

            <div className="mb-8">
              <div className="w-full h-16 bg-maroon/20 skeleton rounded mb-4"></div>
              <div className="w-3/4 h-16 bg-maroon/20 skeleton rounded mx-auto"></div>
            </div>

            <div className="mb-10">
              <div className="w-full h-8 bg-charcoal/20 skeleton rounded mb-2"></div>
              <div className="w-5/6 h-8 bg-charcoal/20 skeleton rounded mx-auto"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <div className="w-48 h-14 bg-maroon/20 skeleton rounded-2xl"></div>
              <div className="w-32 h-14 bg-white/20 skeleton rounded-2xl"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-8 bg-maroon/20 skeleton rounded mb-2 mx-auto"></div>
                  <div className="w-20 h-4 bg-charcoal/20 skeleton rounded mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { ProductCardSkeleton, HeroSkeleton };