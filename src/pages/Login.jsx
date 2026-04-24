import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ShoppingCart, ArrowRight, Github, Chrome, ShieldCheck } from 'lucide-react';
import FloatingInput from '../components/FloatingInput';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [otp, setOtp] = useState('');

  const { login, verify2FALogin } = useAuth();
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
      const result = await login(formData.email, formData.password);
      if (result?.is2FARequired) {
        setIs2FARequired(true);
        setTempToken(result.tempToken);
        setLoading(false);
        return;
      }
      navigate(from === '/cart' ? '/checkout' : from);
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verify2FALogin(tempToken, otp);
      navigate(from === '/cart' ? '/checkout' : from);
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBFB] flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-maroon/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-gold/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Floating Background Shapes */}
      <div className="absolute top-20 right-[15%] w-12 h-12 border-4 border-maroon/10 rounded-xl rotate-12 animate-bounce-slow"></div>
      <div className="absolute bottom-40 left-[10%] w-8 h-8 bg-gold/10 rounded-full animate-float"></div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-[40px] shadow-premium overflow-hidden border border-maroon/5 z-10">
        
        {/* Left Side: Visual/Branding (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-maroon to-[#6A112B] text-white relative overflow-hidden">
          {/* Abstract pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          
          <div>
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-lg group-hover:rotate-12 transition-all duration-500">
                <img src="/RongRani-Logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-3xl font-black tracking-tight">Rong<span className="text-cream-light opacity-80">Rani</span></span>
            </Link>
            
            <div className="mt-20 max-w-sm">
              <h1 className="text-5xl font-black leading-tight mb-6">Experience <br/> <span className="text-gold">Premium</span> Gifting</h1>
              <p className="text-cream-light text-lg opacity-80 leading-relaxed">
                Log in to explore our curated collections and enjoy lifetime member benefits.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="w-10 h-10 bg-gold/20 flex items-center justify-center rounded-xl text-gold">⭐</div>
              <div>
                <p className="font-bold text-sm">Priority Selection</p>
                <p className="text-xs text-cream-light opacity-70">Early access to new collections</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="w-10 h-10 bg-emerald-400/20 flex items-center justify-center rounded-xl text-emerald-400 text-lg">🚚</div>
              <div>
                <p className="font-bold text-sm">Swift Delivery</p>
                <p className="text-xs text-cream-light opacity-70">Dedicated logistics for members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-800 mb-3">Welcome Back!</h2>
            <p className="text-slate-500 font-medium italic">We missed you. Please enter your details.</p>
          </div>

          {message && (
            <div className="bg-maroon/5 border-l-4 border-maroon text-maroon p-4 rounded-r-xl mb-8 flex items-center gap-3 animate-slide-in">
              <ShoppingCart className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-bold">{message}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-600 p-4 rounded-r-xl mb-8 flex items-center gap-3 animate-shake">
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          {!is2FARequired ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              <FloatingInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                required
              />

              <FloatingInput
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                isPassword={true}
                required
              />

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                     <input type="checkbox" className="sr-only peer" />
                     <div className="w-5 h-5 border-2 border-slate-200 rounded-md peer-checked:bg-maroon peer-checked:border-maroon transition-all"></div>
                     <div className="absolute inset-0 flex items-center justify-center text-white scale-0 peer-checked:scale-100 transition-transform">✓</div>
                  </div>
                  <span className="text-sm text-slate-500 group-hover:text-maroon transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" size="sm" className="text-sm font-bold text-maroon hover:underline decoration-2 underline-offset-4">
                  Forgot Password?
                </Link>
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
                    <span>Sign In to Account</span>
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FAVerify} className="space-y-6 animate-fade-in">
              <div className="bg-slate-50 p-8 rounded-[30px] border border-slate-100 text-center shadow-inner">
                <div className="w-20 h-20 bg-maroon/10 text-maroon rounded-[24px] flex items-center justify-center mx-auto mb-6 rotate-3">
                   <ShieldCheck size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Security PIN Required</h3>
                <p className="text-sm font-medium text-slate-500 mb-8 px-4">
                  Please enter your personal 4-6 digit Security PIN to verify your identity.
                </p>
                
                <input
                  type="password"
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-4xl font-black tracking-[0.5em] py-5 rounded-2xl border-2 border-slate-200 focus:border-maroon focus:ring-0 transition-all outline-none mb-8 bg-white"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="w-full bg-maroon text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-maroon/20 hover:bg-[#701e2a] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/30 border-t-white"></div>
                  ) : (
                    <>
                      <span>Verify & Access Account</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setIs2FARequired(false)}
                  className="mt-6 text-sm font-black text-slate-400 hover:text-maroon transition-colors uppercase tracking-widest"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}

          {/* Social Logins */}
          <div className="mt-10">
             <div className="relative mb-8 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <span className="relative px-4 bg-white text-slate-400 text-xs font-bold uppercase tracking-widest">Or continue with</span>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-3 py-3 border-2 border-slate-50 rounded-2xl hover:bg-slate-50 transition-colors font-bold text-slate-700">
                   <Chrome size={20} className="text-maroon" />
                   <span>Google</span>
                </button>
                <button className="flex items-center justify-center gap-3 py-3 border-2 border-slate-50 rounded-2xl hover:bg-slate-50 transition-colors font-bold text-slate-700">
                   <Github size={20} className="text-slate-900" />
                   <span>GitHub</span>
                </button>
             </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-500 font-medium">
              New to RongRani?{' '}
              <Link to="/register" className="text-maroon font-black hover:underline decoration-2 underline-offset-4 ml-1">
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Small footer */}
      <div className="mt-8 text-slate-400 text-xs font-medium">
        &copy; {new Date().getFullYear()} RongRani. Handcrafted with ❤️ in Bangladesh.
      </div>
    </div>
  );
};

export default Login;