import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ShoppingCart } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || '/';
  const message = location.state?.message;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate(from === '/cart' ? '/checkout' : from);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-maroon/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gold/10 rounded-full blur-3xl"></div>

      {/* Logo at top */}
      <div className="pt-8 pb-4">
        <div className="flex justify-center">
          <Link to="/" className="text-2xl font-bold text-maroon">
            RongRani
          </Link>
        </div>
      </div>

      {/* Customer Benefits Banner */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 mb-6">
        <div className="bg-maroon text-white rounded-2xl p-4 sm:p-6 shadow-xl">
          <h3 className="text-lg sm:text-xl font-bold mb-3 text-center">🎁 Lifetime Customer Benefits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="text-center">
              <div className="text-2xl mb-1">💝</div>
              <p className="font-semibold">Exclusive Offers</p>
              <p className="text-cream-light text-xs">Member-only discounts</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🚚</div>
              <p className="font-semibold">Free Shipping</p>
              <p className="text-cream-light text-xs">On orders above ৳2000</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⭐</div>
              <p className="font-semibold">Priority Support</p>
              <p className="text-cream-light text-xs">24/7 customer care</p>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Glass Card Form */}
      <div className="flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
        <div className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-maroon mb-2">Welcome Back</h2>
            <p className="text-slate text-xs sm:text-sm">Sign in to access your lifetime benefits</p>
          </div>

          {message && (
            <div className="bg-maroon/10 border border-maroon/30 text-maroon px-3 sm:px-4 py-3 rounded-lg mb-6 text-xs sm:text-sm flex items-center gap-2">
              <ShoppingCart className="h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-6 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field pl-12 sm:pl-14 text-sm"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-slate flex-shrink-0" />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field pl-12 sm:pl-14 pr-12 sm:pr-14 text-sm"
                  placeholder="Enter your password"
                />
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-slate flex-shrink-0" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate hover:text-maroon transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 sm:h-5 w-4 sm:w-5" /> : <Eye className="h-4 sm:h-5 w-4 sm:w-5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate text-maroon focus:ring-maroon"
                />
                <span className="text-xs sm:text-sm text-slate">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs sm:text-sm text-maroon hover:text-maroon-light font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 sm:py-3 rounded-xl sm:rounded-lg font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-slate">
              Don't have an account?{' '}
              <Link to="/register" className="text-maroon hover:text-maroon-light font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;