import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Facebook, Instagram, Twitter, Loader2, User, Globe, MessageSquare, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';
import FloatingInput from '../components/FloatingInput';

const ContactUs = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const response = await axios.post('/api/contact', formData);
      if (response.data.success) {
        toast.success(t('message_sent_success'));
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        toast.error(t('message_send_failed'));
      }
    } catch (error) {
      console.error('Contact Form Error:', error);
      toast.error(error.response?.data?.message || t('generic_error'));
    } finally {
      setIsSending(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#FFFBFB] dark:bg-slate-950 py-20 px-4 relative overflow-hidden">
      <Seo
        title="Contact RongRani | Gift Shop Support in Bangladesh"
        description="Contact RongRani for gift orders, custom surprises, and support. Call, email, or visit our gift shop team in Bangladesh."
        path="/contact"
      />

      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-maroon/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-maroon/5 dark:bg-maroon/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-maroon" />
            <span className="text-xs font-black uppercase tracking-widest text-maroon">{t('get_in_touch') || 'Get In Touch'}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-charcoal dark:text-white mb-6 tracking-tight">
            {t('contact_title')}
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('contact_subtitle')}
          </p>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { 
              icon: Phone, 
              title: t('call_us'), 
              content: (
                <div className="space-y-1">
                  <p className="text-sm opacity-70 mb-2">{t('mon_sat')}: 9AM - 9PM</p>
                  <a href="tel:+8801851075537" className="block text-lg font-bold hover:text-maroon transition-colors">+880 1851-075537</a>
                  <a href="tel:+8801570249301" className="block text-lg font-bold hover:text-maroon transition-colors">+880 1570-249301</a>
                </div>
              ),
              color: 'bg-rose-500'
            },
            { 
              icon: Mail, 
              title: t('email_us'), 
              content: (
                <div className="space-y-1">
                  <p className="text-sm opacity-70 mb-2">{t('reply_24_hours')}</p>
                  <a href="mailto:info.rongrani@gmail.com" className="block text-lg font-bold hover:text-maroon transition-colors break-all">info.rongrani@gmail.com</a>
                </div>
              ),
              color: 'bg-amber-500'
            },
            { 
              icon: MapPin, 
              title: t('visit_us'), 
              content: (
                <div className="space-y-1">
                  <p className="text-sm opacity-70 mb-2">{t('come_see_collection')}</p>
                  <p className="font-bold leading-relaxed">
                    House 23, Road 5, Cox's Bazar,<br />Bangladesh-4700
                  </p>
                </div>
              ),
              color: 'bg-blue-500'
            }
          ].map((card, idx) => (
            <div key={idx} className="premium-glass p-8 rounded-[2.5rem] text-center group hover:-translate-y-2 transition-all duration-500 border border-white/20 dark:border-white/5">
              <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 group-hover:rotate-12 transition-transform`}>
                <card.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-charcoal dark:text-white mb-4 tracking-tight">{card.title}</h3>
              <div className="text-slate-600 dark:text-slate-400 font-medium">
                {card.content}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Contact Form Section */}
          <div className="lg:col-span-3 premium-glass p-10 md:p-12 rounded-[3rem] border border-white/20 dark:border-white/5">
            <div className="flex items-center space-x-4 mb-10">
              <div className="w-14 h-14 bg-maroon rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-charcoal dark:text-white tracking-tight">{t('send_message')}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">We typically respond within a few hours</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              <FloatingInput
                label={t('full_name')}
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                icon={User}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <FloatingInput
                  label={t('email')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  icon={Mail}
                />
                <FloatingInput
                  label={t('phone_number')}
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  icon={Phone}
                />
              </div>

              <FloatingInput
                label={t('subject_label') || 'Subject'}
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                icon={Globe}
              />

              <FloatingInput
                label={t('message_label') || 'Your Message'}
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                isTextArea
                rows={5}
                icon={MessageCircle}
              />

              <button
                type="submit"
                disabled={isSending}
                className="btn-primary w-full py-5 rounded-2xl flex items-center justify-center space-x-3 text-lg font-black shadow-xl shadow-maroon/20 hover:shadow-maroon/40 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                {isSending ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="relative z-10">{t('sending_msg')}</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">{t('send_message')}</span>
                    <Send className="h-6 w-6 relative z-10 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar Info Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Hours */}
            <div className="premium-glass p-8 rounded-[2.5rem] border border-white/20 dark:border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 rounded-full -mr-16 -mt-16"></div>
               <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-maroon/10 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-maroon" />
                  </div>
                  <h3 className="text-2xl font-black text-charcoal dark:text-white tracking-tight">{t('business_hours')}</h3>
               </div>

               <div className="space-y-4">
                  {[
                    { day: t('monday_friday'), time: '9:00 AM - 9:00 PM' },
                    { day: t('saturday'), time: '10:00 AM - 8:00 PM' },
                    { day: t('sunday'), time: '10:00 AM - 6:00 PM' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-50 dark:border-slate-800">
                      <span className="font-bold text-slate-600 dark:text-slate-400">{item.day}</span>
                      <span className="font-black text-charcoal dark:text-white">{item.time}</span>
                    </div>
                  ))}
                  <div className="p-4 rounded-2xl bg-maroon/5 border border-maroon/10 mt-6 text-center">
                    <span className="font-bold text-maroon block mb-1">{t('holidays')}:</span>
                    <span className="font-black text-maroon uppercase tracking-widest text-xs">{t('call_for_availability')}</span>
                  </div>
               </div>
            </div>

            {/* Social Media Link Box */}
            <div className="bg-gradient-to-br from-maroon to-[#6A112B] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">{t('follow_us_social')}</h3>
              <p className="text-white/80 mb-8 font-medium leading-relaxed">
                {t('stay_updated_social')}
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: Facebook, link: 'https://facebook.com/rongraniofficial' },
                  { icon: Instagram, link: 'https://instagram.com/rongraniofficial' },
                  { icon: Twitter, link: 'https://twitter.com/rongraniofficial' }
                ].map((social, idx) => (
                  <a 
                    key={idx}
                    href={social.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-14 h-14 bg-white/10 hover:bg-white text-white hover:text-maroon rounded-2xl flex items-center justify-center transition-all duration-500 transform hover:-translate-y-2 shadow-lg"
                  >
                    <social.icon className="h-7 w-7" />
                  </a>
                ))}
              </div>
            </div>

            {/* Interactive Location Preview */}
            <div className="premium-glass rounded-[2.5rem] border border-white/20 dark:border-white/5 overflow-hidden group">
              <div className="w-full h-56 bg-cream dark:bg-slate-900 relative flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 dark:opacity-10 grayscale group-hover:grayscale-0 transition-all duration-700" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
                <div className="text-center relative z-10">
                  <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl group-hover:scale-110 transition-transform animate-pulse">
                    <MapPin className="h-10 w-10 text-maroon" />
                  </div>
                  <p className="text-charcoal dark:text-white font-black text-xl tracking-tight">{t('visit_showroom')}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Cox's Bazar, Bangladesh</p>
                </div>
              </div>
              <div className="p-4 bg-maroon text-center">
                 <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-white font-black uppercase text-xs tracking-widest hover:underline">Get Directions 🗺️</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
