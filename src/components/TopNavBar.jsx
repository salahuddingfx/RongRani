import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const TopNavBar = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('BDT');
  const [selectedCountry, setSelectedCountry] = useState('BD');

  const currencies = [
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
  ];

  const countries = [
    { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'IN', name: 'India', flag: '🇮🇳' }
  ];

  const importantMessages = [
    "🎁 Valentine's Day Special: Up to 50% OFF on selected items!",
    "🚚 FREE Shipping on orders above ৳2500 - Limited Time!",
    "💝 New Arrivals: Exclusive Romantic Gift Combos just added!",
    "⭐ Become a Lifetime Customer: Get exclusive perks on registration!",
    "🎉 Flash Sale: Today Only - Extra 10% OFF with code FLASH10"
  ];

  return (
    <div className="bg-gradient-to-r from-maroon via-pink-900 to-maroon text-white border-b border-white/10 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/4 w-64 h-full bg-white/5 blur-3xl rounded-full -translate-y-1/2"></div>
      
      <div className="container mx-auto px-2 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between py-2 md:py-2.5 gap-3 relative z-10">
          {/* Currency Selector */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="relative group">
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="appearance-none bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer transition-all pr-8"
                aria-label="Select Currency"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code} className="bg-slate-900 text-white">
                    {currency.symbol} {currency.code}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60 pointer-events-none group-hover:text-white transition-colors" />
            </div>
          </div>

          {/* Marquee Message */}
          <div className="flex-1 overflow-hidden px-4 relative w-full md:w-auto">
            {/* Fade Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-pink-900 to-transparent z-10 hidden md:block"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-maroon to-transparent z-10 hidden md:block"></div>
            
            <div className="marquee-container">
              <div className="marquee-content py-0.5">
                {importantMessages.map((msg, index) => (
                  <span key={index} className="mx-6 sm:mx-10 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shadow-[0_0_8px_rgba(255,215,0,0.6)]"></span>
                    {msg}
                  </span>
                ))}
                {/* Duplicate for seamless loop */}
                {importantMessages.map((msg, index) => (
                  <span key={`dup-${index}`} className="mx-6 sm:mx-10 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shadow-[0_0_8px_rgba(255,215,0,0.6)]"></span>
                    {msg}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contact & Country Selector */}
          <div className="flex items-center space-x-4 shrink-0">
            <div className="hidden xl:flex items-center space-x-4 text-[10px] font-bold tracking-wider">
              <a href="tel:+8801851075537" className="hover:text-gold transition-colors flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-gold opacity-80">Call:</span> +880 1851-075537
              </a>
              <a href="mailto:info.rongrani@gmail.com" className="hover:text-gold transition-colors flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-gold opacity-80">Mail:</span> info.rongrani@gmail.com
              </a>
            </div>
            
            <div className="flex items-center gap-2 border-l border-white/20 pl-4">
              <Globe className="h-3.5 w-3.5 text-gold/80" />
              <div className="relative group">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="appearance-none bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer transition-all pr-8"
                  aria-label="Select Country"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code} className="bg-slate-900 text-white">
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60 pointer-events-none group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .marquee-container {
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .marquee-content {
          display: flex;
          animation: marquee 30s linear infinite;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .marquee-content:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default TopNavBar;
