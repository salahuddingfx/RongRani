import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Clock, Gift, Heart, Package, Shield } from 'lucide-react';
import DeveloperProfile from './DeveloperProfile';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showDevProfile, setShowDevProfile] = useState(false);
  const [bdTime, setBdTime] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Dhaka',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setBdTime(now.toLocaleString('en-US', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showDevProfile) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showDevProfile]);

  return (
    <>
      <footer className="bg-slate-900 border-t-4 border-maroon mt-20">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">

            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-maroon rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🎁</span>
                </div>
                <h3 className="text-2xl font-black text-white">
                  Rong<span className="text-pink-400">Rani</span>
                </h3>
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed text-sm">
                {t('language') === 'bn'
                  ? 'প্রতিটি বিশেষ উপলক্ষের জন্য সুন্দর উপহার, রোমান্টিক কম্বো এবং হৃদয়স্পর্শী সারপ্রাইজের গন্তব্য।'
                  : 'Your destination for beautiful gifts, romantic combos, and heartfelt surprises for every special occasion.'}
              </p>

              {/* Social Links */}
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-maroon rounded-full flex items-center justify-center text-white transition-all hover:scale-110">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-pink-600 rounded-full flex items-center justify-center text-white transition-all hover:scale-110">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-blue-500 rounded-full flex items-center justify-center text-white transition-all hover:scale-110">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-pink-400" />
                {t('quick_links')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/shop" className="text-slate-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full group-hover:w-2 group-hover:h-2 transition-all"></span>
                    {t('shop')}
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-slate-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full group-hover:w-2 group-hover:h-2 transition-all"></span>
                    {t('about')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-slate-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full group-hover:w-2 group-hover:h-2 transition-all"></span>
                    {t('contact')}
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="text-slate-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full group-hover:w-2 group-hover:h-2 transition-all"></span>
                    {t('wishlist')}
                  </Link>
                </li>
                <li>
                  <Link to="/reviews" className="text-slate-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full group-hover:w-2 group-hover:h-2 transition-all"></span>
                    {t('customer_reviews')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-pink-400" />
                {t('customer_care')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/my-orders" className="text-slate-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full group-hover:w-2 group-hover:h-2 transition-all"></span>
                    {t('my_orders')}
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="text-slate-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full group-hover:w-2 group-hover:h-2 transition-all"></span>
                    {t('language') === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-slate-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full group-hover:w-2 group-hover:h-2 transition-all"></span>
                    {t('language') === 'bn' ? 'সাহায্য কেন্দ্র' : 'Help Center'}
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-slate-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full group-hover:w-2 group-hover:h-2 transition-all"></span>
                    {t('language') === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5 text-pink-400" />
                {t('language') === 'bn' ? 'যোগাযোগের তথ্য' : 'Contact Info'}
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-slate-300 hover:text-pink-400 transition-colors group">
                  <Phone className="h-5 w-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">+880 1851-075537</span>
                </div>
                <div className="flex items-start gap-3 text-slate-300 hover:text-pink-400 transition-colors group">
                  <Mail className="h-5 w-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-sm break-all">salauddinkaderappy@gmail.com</span>
                </div>
                <div className="flex items-start gap-3 text-slate-300 hover:text-pink-400 transition-colors group">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">Cox's Bazar, Bangladesh-4700</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 mt-12 pt-8">
            {/* BD Local Time */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center space-x-3 bg-maroon/20 backdrop-blur-sm px-6 py-3 rounded-full border border-pink-400/20">
                <Clock className="h-5 w-5 text-pink-400 animate-pulse" />
                <div>
                  <p className="text-white font-semibold text-base">{bdTime}</p>
                  <p className="text-slate-400 text-xs">Bangladesh Local Time (GMT+6)</p>
                </div>
              </div>
            </div>

            {/* Copyright & Developer */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <p className="text-slate-400">
                © {currentYear} RongRani. {t('language') === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
              </p>
              <div className="text-center md:text-right">
                <p className="text-slate-400">
                  {t('language') === 'bn' ? 'ভালোবাসা দিয়ে তৈরি' : 'Developed with'} ❤️ {t('language') === 'bn' ? 'দ্বারা' : 'by'}{' '}
                  <button
                    onClick={() => setShowDevProfile(true)}
                    className="text-pink-400 hover:text-pink-300 transition-all font-bold underline cursor-pointer relative z-[10000] hover:scale-110 active:scale-95 inline-block"
                  >
                    Salah Uddin Kader
                  </button>
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Full Stack Developer | MERN Stack Expert
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <DeveloperProfile isOpen={showDevProfile} onClose={() => setShowDevProfile(false)} />
    </>
  );
};

export default Footer;