import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Clock, Package, Shield } from 'lucide-react';
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
      <footer className="footer-gradient bg-slate-900 border-t-4 border-maroon mt-20 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 xl:gap-16">

            {/* Brand Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform hover:rotate-3 duration-500 bg-white p-0 relative group"
                  role="img"
                  aria-label="RongRani™ Logo"
                >
                  <img src="/RongRani-Circle.png" alt="Logo" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter flex items-center">
                    Rong<span className="text-pink-400">Rani</span>
                    <span className="text-[10px] bg-pink-400/20 text-pink-300 px-1.5 py-0.5 rounded-md ml-2 border border-pink-400/30 uppercase tracking-widest font-bold">TM</span>
                  </h3>
                  <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">Authentic Surprises</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm max-w-xs">
                {t('footer_desc')}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a href="https://facebook.com/rongraniofficial" className="w-11 h-11 bg-white/5 hover:bg-maroon border border-white/10 rounded-xl flex items-center justify-center text-white transition-all shadow-lg hover:shadow-maroon/20 hover:scale-110 group" aria-label="Follow us on Facebook">
                  <Facebook className="h-5 w-5 transition-transform group-hover:rotate-6" />
                </a>
                <a href="https://instagram.com/rongraniofficial" className="w-11 h-11 bg-white/5 hover:bg-gradient-to-tr from-yellow-500 to-purple-600 border border-white/10 rounded-xl flex items-center justify-center text-white transition-all shadow-lg hover:shadow-purple-500/20 hover:scale-110 group" aria-label="Follow us on Instagram">
                  <Instagram className="h-5 w-5 transition-transform group-hover:rotate-6" />
                </a>
                <a href="https://twitter.com/rongraniofficial" className="w-11 h-11 bg-white/5 hover:bg-blue-500 border border-white/10 rounded-xl flex items-center justify-center text-white transition-all shadow-lg hover:shadow-blue-500/20 hover:scale-110 group" aria-label="Follow us on Twitter">
                  <Twitter className="h-5 w-5 transition-transform group-hover:rotate-6" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-black text-white mb-8 relative inline-block">
                {t('quick_links')}
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-pink-400 rounded-full"></span>
              </h4>
              <ul className="space-y-4">
                {[
                  { to: '/shop', label: t('shop') },
                  { to: '/about', label: t('about') },
                  { to: '/contact', label: t('contact') },
                  { to: '/wishlist', label: t('wishlist') },
                  { to: '/reviews', label: t('customer_reviews') }
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.to} className="text-slate-400 hover:text-pink-400 transition-all flex items-center gap-3 group translate-x-0 hover:translate-x-2">
                      <div className="w-1.5 h-1.5 bg-pink-400/40 rounded-full group-hover:bg-pink-400 group-hover:scale-150 transition-all"></div>
                      <span className="font-semibold">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <h4 className="text-lg font-black text-white mb-8 relative inline-block">
                {t('customer_care')}
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-pink-400 rounded-full"></span>
              </h4>
              <ul className="space-y-4">
                {[
                  { to: '/my-orders', label: t('my_orders') },
                  { to: '/track', label: t('track_order') },
                  { to: '/help', label: t('help_center') },
                  { to: '/privacy-policy', label: t('privacy_policy') }
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.to} className="text-slate-400 hover:text-pink-400 transition-all flex items-center gap-3 group translate-x-0 hover:translate-x-2">
                      <div className="w-1.5 h-1.5 bg-pink-400/40 rounded-full group-hover:bg-pink-400 group-hover:scale-150 transition-all"></div>
                      <span className="font-semibold">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-white mb-8 relative inline-block">
                {t('contact_info_label')}
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-pink-400 rounded-full"></span>
              </h4>
              <div className="space-y-5">
                <a href="tel:+8801851075537" className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-pink-400/30 hover:bg-white/10 transition-all group">
                  <div className="w-10 h-10 bg-maroon/20 rounded-xl flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">{t('call_us')}</p>
                    <span className="text-sm text-slate-200 font-bold">+880 1851-075537</span>
                  </div>
                </a>
                <a href="mailto:info.rongrani@gmail.com" className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-pink-400/30 hover:bg-white/10 transition-all group">
                  <div className="w-10 h-10 bg-maroon/20 rounded-xl flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">{t('email_us')}</p>
                    <span className="text-sm text-slate-200 font-bold break-all">info.rongrani@gmail.com</span>
                  </div>
                </a>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group">
                  <div className="w-10 h-10 bg-maroon/20 rounded-xl flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">{t('location_label') || 'Location'}</p>
                    <span className="text-sm text-slate-200 font-bold">Cox's Bazar, Bangladesh-4700</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-20 pt-10 border-t border-white/10">
            <div className="flex flex-col xl:flex-row justify-between items-center gap-10">
              {/* BD Local Time Widget */}
              <div className="flex items-center gap-4 bg-white/[0.03] backdrop-blur-md px-6 py-4 rounded-3xl border border-white/5 shadow-2xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-pink-400/20 blur-xl rounded-full scale-150 animate-pulse"></div>
                  <Clock className="h-7 w-7 text-pink-400 relative z-10" />
                </div>
                <div>
                  <p className="text-white font-black text-lg tracking-tight">{bdTime}</p>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{t('bd_local_time') || 'Bangladesh Local Time'} (GMT+6)</p>
                </div>
              </div>

              {/* Copyright & Info */}
              <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="space-y-1">
                  <p className="text-slate-300 font-bold">
                    © {currentYear} RongRani™
                  </p>
                  <p className="text-slate-500 text-xs tracking-wide uppercase font-semibold">
                    {t('all_rights_reserved')}
                  </p>
                </div>

                <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>

                <div className="space-y-1">
                  <p className="text-slate-400 font-medium">
                    {t('developed_with')} ❤️ {t('by_developer')}{' '}
                    <button
                      onClick={() => setShowDevProfile(true)}
                      className="text-pink-400 hover:text-white transition-all font-black underline decoration-pink-400/30 underline-offset-4 cursor-pointer relative z-[10]"
                    >
                      Salah Uddin Kader
                    </button>
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-3 mt-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Full Stack Developer</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">MERN Specialist</span>
                  </div>
                </div>
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