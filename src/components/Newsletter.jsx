import React, { useState } from 'react';
import { Mail, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/newsletter/subscribe', { email });
      toast.success('🎉 Successfully subscribed! Check your inbox for our welcome gift.');
      setEmail('');
    } catch (error) {
      const message = error.response?.data?.message || 'Already subscribed or something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-maroon py-12 sm:py-16">
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-gold animate-pulse mr-3" />
            <Mail className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-gold animate-pulse ml-3" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Get Exclusive Offers & Updates
          </h2>
          <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Subscribe to our newsletter and receive 10% OFF on your first order, plus early access to new collections and special promotions!
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-xl mx-auto px-4">
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate/50" />
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                aria-label="Email address for newsletter"
                className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-full border-2 border-white/20 bg-white/95 text-charcoal placeholder-slate/60 focus:outline-none focus:border-white focus:bg-white transition-all text-sm sm:text-base"
                disabled={loading}
              />            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="bg-gold hover:bg-amber-500 text-charcoal font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 text-sm sm:text-base whitespace-nowrap"
            >
              <span>{loading ? 'Subscribing...' : 'Subscribe'}</span>
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </form>

          <p className="text-xs sm:text-sm text-white/70 mt-4 sm:mt-6 px-4">
            🎁 Get 10% OFF instantly • 📦 Free shipping updates • 🎉 Exclusive early access
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
