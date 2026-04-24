import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, ShoppingCart, ArrowRight, Check, ShieldCheck, AtSign } from 'lucide-react';
import toast from 'react-hot-toast';
import FloatingInput from '../components/FloatingInput';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const { register } = useAuth();
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms and Privacy Policy');
      setLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      toast.success('Account created successfully! Welcome to RongRani');
      navigate(from === '/cart' ? '/checkout' : from);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBFB] dark:bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Decorative Elements */}
      <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-maroon/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-gold/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[40px] shadow-premium overflow-hidden border border-maroon/5 dark:border-white/5 z-10">
        
        {/* Left Side: Visual/Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-maroon to-[#6A112B] text-white relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
          
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-lg">
                <img src="/RongRani-Logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-3xl font-black tracking-tight text-white">Rong<span className="text-cream-light opacity-80">Rani</span></span>
            </Link>
            
            <div className="mt-16 max-w-md">
              <h1 className="text-5xl font-black leading-tight mb-6">Join the <br/> <span className="text-gold italic">Elite</span> Community</h1>
              <p className="text-cream-light text-lg opacity-80 leading-relaxed">
                Create an account today and unlock a world of handcrafted elegance and exclusive privileges.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10">
               <div className="text-2xl mb-2">🎁</div>
               <p className="font-bold text-sm">Welcome Gift</p>
               <p className="text-xs text-cream-light opacity-70">10% OFF on first order</p>
            </div>
            <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10">
               <div className="text-2xl mb-2">👑</div>
               <p className="font-bold text-sm">VIP Status</p>
               <p className="text-xs text-cream-light opacity-70">Lifetime membership</p>
            </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-800 mb-2">Create Account</h2>
            <p className="text-slate-500 font-medium italic">Start your journey with us today.</p>
          </div>

          {message && (
            <div className="bg-maroon/5 border-l-4 border-maroon text-maroon p-4 rounded-r-xl mb-6 flex items-center gap-3 animate-slide-in">
              <ShoppingCart className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-bold">{message}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-600 p-4 rounded-r-xl mb-6 flex items-center gap-3 animate-shake">
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-1">
            <FloatingInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
            />

            <FloatingInput
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              icon={AtSign}
              required
            />

            <FloatingInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
               <FloatingInput
                 label="Password"
                 name="password"
                 value={formData.password}
                 onChange={handleChange}
                 icon={Lock}
                 isPassword={true}
                 required
               />
               <FloatingInput
                 label="Confirm Password"
                 name="confirmPassword"
                 value={formData.confirmPassword}
                 onChange={handleChange}
                 icon={ShieldCheck}
                 isPassword={true}
                 required
               />
            </div>

            <div className="pt-2">
               <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-1">
                     <input 
                        type="checkbox" 
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="sr-only peer" 
                     />
                     <div className="w-5 h-5 border-2 border-slate-200 rounded-md peer-checked:bg-maroon peer-checked:border-maroon transition-all"></div>
                     <div className="absolute inset-0 flex items-center justify-center text-white scale-0 peer-checked:scale-100 transition-transform">✓</div>
                  </div>
                  <span className="text-sm text-slate-500 leading-snug">
                     I agree to the <Link to="/terms" className="text-maroon font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-maroon font-bold hover:underline">Privacy Policy</Link>
                  </span>
               </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-maroon text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-maroon/20 hover:bg-[#701e2a] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 group"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/30 border-t-white"></div>
              ) : (
                <>
                  <span>Create Account Now</span>
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-maroon font-black hover:underline decoration-2 underline-offset-4 ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;