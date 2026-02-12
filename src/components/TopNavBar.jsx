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
    "🚚 FREE Shipping on orders above ৳2000 - Limited Time!",
    "💝 New Arrivals: Exclusive Romantic Gift Combos just added!",
    "⭐ Become a Lifetime Customer: Get exclusive perks on registration!",
    "🎉 Flash Sale: Today Only - Extra 10% OFF with code FLASH10"
  ];

  return (
    <div className="bg-maroon text-white">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex flex-col md:flex-row items-center justify-between py-2 gap-2">
          {/* Currency Selector */}
          <div className="flex items-center space-x-2 shrink-0">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:bg-white/20 cursor-pointer"
              aria-label="Select Currency"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code} className="bg-maroon">
                  {currency.symbol} {currency.code}
                </option>
              ))}
            </select>
          </div>

          {/* Marquee Message */}
          <div className="flex-1 overflow-hidden px-2 sm:px-4 w-full md:w-auto">
            <div className="marquee-container">
              <div className="marquee-content">
                {importantMessages.map((msg, index) => (
                  <span key={index} className="mx-4 sm:mx-8 text-xs sm:text-sm font-medium whitespace-nowrap">
                    {msg}
                  </span>
                ))}
                {/* Duplicate for seamless loop */}
                {importantMessages.map((msg, index) => (
                  <span key={`dup-${index}`} className="mx-4 sm:mx-8 text-xs sm:text-sm font-medium whitespace-nowrap">
                    {msg}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Country Selector */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="hidden lg:flex items-center space-x-2 text-xs sm:text-sm bg-white/10 px-3 py-1 rounded-full border border-white/20">
              <span>Call: +8801851075537</span>
              <span className="text-white/60">|</span>
              <span>Mail: info.rongrani@gmail.com</span>
            </div>
            <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:bg-white/20 cursor-pointer"
              aria-label="Select Country"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code} className="bg-maroon">
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
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
