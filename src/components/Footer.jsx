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
        <footer className="relative mt-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-maroon to-transparent opacity-50"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-maroon/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Main Glass Container */}
        <div className="relative z-10 border-t border-white/10 premium-glass backdrop-blur-2xl">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              
              {/* Brand & Mission */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="relative">
                    <div className="absolute inset-0 bg-maroon/20 blur-xl rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-16 h-16 bg-white rounded-2xl p-1 shadow-2xl relative z-10 transform group-hover:rotate-6 transition-transform duration-500 glow-pulse">
                      <img src="/RongRani-Circle.png" alt="RongRani" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">
                      Rong<span className="text-maroon dark:text-pink-500">Rani</span>
                      <span className="text-[10px] bg-maroon/20 text-maroon-light px-2 py-0.5 rounded-full ml-2 border border-maroon/30 uppercase font-bold">Premium</span>
                    </h3>
                    <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black mt-1">Authentic Surprises</p>
                  </div>
                </div>
                
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                  {t('footer_desc') || "We bring you the finest handcrafted gifts and surprise boxes, delivered with love and care across Bangladesh. Every gift tells a story."}
                </p>

                <div className="flex gap-4">
                  {[
                    { icon: Facebook, href: "https://facebook.com/rongraniofficial", color: "hover:bg-blue-600" },
                    { icon: Instagram, href: "https://instagram.com/rongraniofficial", color: "hover:bg-pink-600" },
                    { icon: Twitter, href: "https://twitter.com/rongraniofficial", color: "hover:bg-sky-500" }
                  ].map((social, i) => (
                    <a 
                      key={i}
                      href={social.href}
                      className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${social.color} group`}
                    >
                      <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="grid grid-cols-2 gap-8 col-span-1 md:col-span-2 lg:col-span-2">
                <div>
                  <h4 className="text-white font-bold text-lg mb-8 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-maroon rounded-full"></span>
                    {t('quick_links')}
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
                        <Link to={link.to} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                          <div className="w-1 h-1 bg-maroon rounded-full opacity-0 group-hover:opacity-100 transition-all group-hover:scale-150"></div>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-bold text-lg mb-8 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-maroon rounded-full"></span>
                    {t('customer_care')}
                  </h4>
                  <ul className="space-y-4">
                    {[
                      { to: '/my-orders', label: t('my_orders') },
                      { to: '/quick-track', label: t('track_order') },
                      { to: '/help', label: t('help_center') },
                      { to: '/privacy-policy', label: t('privacy_policy') }
                    ].map((link, idx) => (
                      <li key={idx}>
                        <Link to={link.to} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                          <div className="w-1 h-1 bg-maroon rounded-full opacity-0 group-hover:opacity-100 transition-all group-hover:scale-150"></div>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contact Cards */}
              <div className="space-y-6">
                <h4 className="text-white font-bold text-lg mb-8 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-maroon rounded-full"></span>
                  {t('contact_info_label')}
                </h4>
                
                <div className="space-y-4">
                  <a href="tel:+8801851075537" className="block premium-card p-4 rounded-2xl group border-white/5 hover:border-maroon/30 transition-all shine-effect">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-maroon/10 flex items-center justify-center text-maroon group-hover:bg-maroon group-hover:text-white transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t('call_us')}</p>
                        <p className="text-white font-bold">+880 1851-075537</p>
                      </div>
                    </div>
                  </a>

                  <a href="mailto:info.rongrani@gmail.com" className="block premium-card p-4 rounded-2xl group border-white/5 hover:border-maroon/30 transition-all shine-effect">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-maroon/10 flex items-center justify-center text-maroon group-hover:bg-maroon group-hover:text-white transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t('email_us')}</p>
                        <p className="text-white font-bold text-sm truncate">info.rongrani@gmail.com</p>
                      </div>
                    </div>
                  </a>

                  <div className="premium-card p-4 rounded-2xl border-white/5 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-maroon/10 flex items-center justify-center text-maroon">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t('location_label') || 'Location'}</p>
                        <p className="text-white font-bold">Cox's Bazar, Bangladesh</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-20 pt-10 border-t border-white/10 flex flex-col lg:flex-row justify-between items-center gap-10">
              {/* BD Time Widget */}
              <div className="premium-glass px-8 py-4 rounded-3xl border-white/10 shadow-2xl flex items-center gap-4 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-maroon/40 blur-xl rounded-full animate-pulse group-hover:scale-150 transition-transform"></div>
                  <Clock className="w-6 h-6 text-maroon relative z-10" />
                </div>
                <div>
                  <p className="text-white font-black text-xl tracking-tight">{bdTime}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">{t('bd_local_time') || 'Bangladesh Time'}</p>
                </div>
              </div>

              {/* Credits & Copyright */}
              <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="space-y-1">
                  <p className="text-slate-300 font-bold">© {currentYear} RongRani™</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{t('all_rights_reserved')}</p>
                </div>
                
                <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>
                
                <div className="space-y-1">
                  <p className="text-slate-400 font-medium">
                    {t('developed_with')} ❤️ {t('by_developer')}{' '}
                    <button 
                      onClick={() => setShowDevProfile(true)}
                      className="text-white hover:text-maroon transition-colors font-black underline decoration-maroon underline-offset-4"
                    >
                      Salah Uddin Kader
                    </button>
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Full Stack Architect</span>
                    <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">MERN Specialist</span>
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