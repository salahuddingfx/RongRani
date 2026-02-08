import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Facebook, Instagram, Twitter } from 'lucide-react';
import toast from 'react-hot-toast';
import Seo from '../components/Seo';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We will get back to you soon 💝');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-pink-50 py-16 px-4">
      <Seo
        title="Contact Chirkut Ghor | Gift Shop Support in Bangladesh"
        description="Contact Chirkut Ghor for gift orders, custom surprises, and support. Call, email, or visit our gift shop team in Bangladesh."
        path="/contact"
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-maroon mb-6">Get in Touch</h1>
          <p className="text-xl text-slate max-w-2xl mx-auto">
            We'd love to hear from you! Send us a message about your perfect gift needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="card bg-white/80 backdrop-blur-sm text-center hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-maroon rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">Call Us</h3>
            <p className="text-slate mb-3">Mon-Sat: 9AM - 9PM</p>
            <a href="tel:+8801711111111" className="text-maroon font-semibold hover:underline">
              +880 1711-111111
            </a>
            <br />
            <a href="tel:+8801811111111" className="text-maroon font-semibold hover:underline">
              +880 1811-111111
            </a>
          </div>

          <div className="card bg-white/80 backdrop-blur-sm text-center hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-maroon rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">Email Us</h3>
            <p className="text-slate mb-3">We reply within 24 hours</p>
            <a href="mailto:support@chirkutghor.com" className="text-maroon font-semibold hover:underline">
              support@chirkutghor.com
            </a>
            <br />
            <a href="mailto:gifts@chirkutghor.com" className="text-maroon font-semibold hover:underline">
              gifts@chirkutghor.com
            </a>
          </div>

          <div className="card bg-white/80 backdrop-blur-sm text-center hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-maroon rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">Visit Us</h3>
            <p className="text-slate mb-3">Come see our collection</p>
            <p className="text-charcoal font-semibold">
              House 23, Road 5<br />
              Cox's Bazar, Bangladesh-4700<br />
              Bangladesh
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="card bg-white/80 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-maroon mb-6 flex items-center">
              <MessageCircle className="mr-3 h-8 w-8" />
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Your full name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="+880 1711-111111"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Message *</label>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="input-field w-full"
                  rows="5"
                  placeholder="Tell us about your gift requirements..."
                />
              </div>

              <button type="submit" className="btn-primary w-full flex items-center justify-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {/* Additional Info */}
          <div className="space-y-6">
            {/* Business Hours */}
            <div className="card bg-white/80 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-maroon rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-charcoal mb-3">Business Hours</h3>
                  <div className="space-y-2 text-slate">
                    <div className="flex justify-between">
                      <span className="font-semibold">Monday - Friday:</span>
                      <span>9:00 AM - 9:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Saturday:</span>
                      <span>10:00 AM - 8:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Sunday:</span>
                      <span>10:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate/20">
                      <span className="font-semibold text-maroon">Holidays:</span>
                      <span className="text-maroon">Call for availability</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="card bg-maroon text-white">
              <h3 className="text-2xl font-bold mb-4">Follow Us on Social Media</h3>
              <p className="text-white/80 mb-6">
                Stay updated with our latest gift collections and special offers
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="card bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="w-full h-64 bg-pink-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-maroon mx-auto mb-3" />
                  <p className="text-charcoal font-semibold">Visit our showroom</p>
                  <p className="text-slate text-sm">Cox's Bazar, Bangladesh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
