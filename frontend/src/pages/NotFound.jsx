import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Sparkles, Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-cream"></div>
      <div className="absolute top-20 left-10 w-96 h-96 bg-maroon/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gold/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-maroon/5"></div>

      {/* Floating Elements */}
      <div className="absolute top-32 right-32 animate-float">
        <Sparkles className="h-10 w-10 text-maroon/20" />
      </div>
      <div className="absolute bottom-40 left-32 animate-float-delayed">
        <Compass className="h-8 w-8 text-gold/30" />
      </div>
      <div className="absolute top-1/3 right-1/4 animate-float-slow">
        <Search className="h-6 w-6 text-slate/20" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="text-center max-w-2xl">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold text-maroon mb-6">
              404
            </h1>
            <div className="w-24 h-1 bg-maroon mx-auto rounded-full mb-6"></div>
          </div>

          {/* Main Content */}
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-maroon mb-6">
              Oops! Page Not Found
            </h2>
            <p className="text-slate text-xl leading-relaxed max-w-lg mx-auto">
              Looks like you've wandered off the beaten path. The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <Link
              to="/"
              className="btn-primary px-8 py-4 rounded-full font-semibold text-lg flex items-center space-x-3 hover:scale-105 transition-transform shadow-xl"
            >
              <Home className="h-6 w-6" />
              <span>Go Home</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="btn-secondary px-8 py-4 rounded-full font-semibold text-lg flex items-center space-x-3 hover:scale-105 transition-transform"
            >
              <ArrowLeft className="h-6 w-6" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Popular Pages */}
          <div className="card p-8 max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-maroon mb-6 flex items-center justify-center space-x-2">
              <Compass className="h-6 w-6" />
              <span>Explore Our Site</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/"
                className="card p-4 hover:scale-105 transition-transform text-center group"
              >
                <Home className="h-8 w-8 text-maroon mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-maroon">Home</span>
              </Link>

              <Link
                to="/shop"
                className="card p-4 hover:scale-105 transition-transform text-center group"
              >
                <Search className="h-8 w-8 text-maroon mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-maroon">Shop</span>
              </Link>

              <Link
                to="/dashboard"
                className="card p-4 hover:scale-105 transition-transform text-center group"
              >
                <Sparkles className="h-8 w-8 text-maroon mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-maroon">Dashboard</span>
              </Link>

              <Link
                to="/cart"
                className="card p-4 hover:scale-105 transition-transform text-center group"
              >
                <Compass className="h-8 w-8 text-maroon mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-maroon">Cart</span>
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-12">
            <p className="text-slate/60 text-sm">
              Need help? <Link to="/contact" className="text-maroon hover:text-maroon-light font-medium underline">Contact us</Link> or check our <Link to="/help" className="text-maroon hover:text-maroon-light font-medium underline">help center</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;