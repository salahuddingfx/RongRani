import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full animate-fade-in-up">
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-slate-100 skeleton">
        <div className="absolute top-2 left-2 w-8 h-4 bg-slate-200 rounded-full"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Title */}
        <div className="h-3 bg-slate-200 rounded w-3/4 mb-1"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>

        {/* Price */}
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-2"></div>

        {/* Rating and Button */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex space-x-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 bg-slate-200 rounded-full"></div>
            ))}
          </div>
          <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
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