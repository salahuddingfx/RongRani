import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Clock } from 'lucide-react';
import DeveloperProfile from './DeveloperProfile';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showDevProfile, setShowDevProfile] = useState(false);
  const [bdTime, setBdTime] = useState('');

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
    <footer className="bg-charcoal border-t-2 border-gold/20 mt-20">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-6">Chirkut ঘর</h3>
            <p className="text-white/80 mb-6 leading-relaxed">
              Your destination for beautiful gifts, romantic combos, and heartfelt surprises for every special occasion.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-white/70 hover:text-gold transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-white/70 hover:text-gold transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-white/70 hover:text-gold transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/shop" className="text-white/70 hover:text-gold transition-colors">Shop All</a></li>
              <li><a href="/about" className="text-white/70 hover:text-gold transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-white/70 hover:text-gold transition-colors">Contact Us</a></li>
              <li><a href="/help" className="text-white/70 hover:text-gold transition-colors">Help Center</a></li>
              <li><a href="/track" className="text-white/70 hover:text-gold transition-colors">Track Order</a></li>
              <li><a href="/terms" className="text-white/70 hover:text-gold transition-colors">Terms & Conditions</a></li>
              <li><a href="/privacy-policy" className="text-white/70 hover:text-gold transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center text-white/70">
                <Phone className="h-5 w-5 mr-3" />
                <span>+8801851075537</span>
              </div>
              <div className="flex items-center text-white/70">
                <Mail className="h-5 w-5 mr-3" />
                <span>salauddinkaderappy@gmail.com</span>
              </div>
              <div className="flex items-center text-white/70">
                <MapPin className="h-5 w-5 mr-3" />
                <span>Cox's Bazar, Bangladesh-4700</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          {/* BD Local Time - Center */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center space-x-3 bg-white/10 px-6 py-3 rounded-full">
              <Clock className="h-5 w-5 text-gold animate-pulse" />
              <div>
                <p className="text-white font-semibold text-lg">{bdTime}</p>
                <p className="text-white/60 text-xs">Bangladesh Local Time (GMT+6)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Developer Info */}
            <div className="text-center md:text-left">
              <p className="text-white/60 mb-2">
                © {currentYear} Chirkut ঘর. All rights reserved.
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-white/60">
                Developed with ❤️ by{' '}
                <button
                  onClick={() => setShowDevProfile(true)}
                  className="text-gold hover:text-gold-light transition-colors font-semibold underline cursor-pointer"
                >
                  Salah Uddin Kader
                </button>
              </p>
              <p className="text-white/50 text-sm mt-1">
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