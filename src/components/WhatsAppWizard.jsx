import React, { useState } from 'react';
import { X, Send, Bot, MessageCircle } from 'lucide-react';

const WhatsAppWizard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  
  const phoneNumber = '8801851075537'; // Replace with actual WhatsApp number
  const defaultMessage = 'Hello! I need help with Chirkut ঘর services.';

  const services = [
    { icon: '🎁', text: 'Gift Recommendations', query: 'I need gift recommendations' },
    { icon: '💝', text: 'Custom Orders', query: 'I want to place a custom order' },
    { icon: '📦', text: 'Order Status', query: 'Check my order status' },
    { icon: '💳', text: 'Payment Help', query: 'I need help with payment' },
    { icon: '🚚', text: 'Delivery Info', query: 'When will my order arrive?' },
    { icon: '🎉', text: 'Special Occasions', query: 'Help me plan for a special occasion' },
  ];

  const handleSendWhatsApp = (query = message || defaultMessage) => {
    const encodedMessage = encodeURIComponent(query);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  return (
    <>
      {/* Floating Button - Positioned above AI button (Desktop Only) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="floating-widget hidden md:flex fixed bottom-24 md:bottom-28 lg:bottom-36 right-3 md:right-4 lg:right-6 z-50 w-14 h-14 lg:w-16 lg:h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl items-center justify-center transform hover:scale-110 transition-all duration-300 animate-pulse"
        aria-label="WhatsApp Help"
        title="WhatsApp Support"
      >
        <MessageCircle className="h-6 w-6 lg:h-8 lg:w-8" />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="floating-widget fixed bottom-32 sm:bottom-36 md:bottom-48 right-2 sm:right-3 md:right-6 z-50 w-[calc(100vw-1rem)] sm:w-80 md:w-96 max-h-[calc(100vh-7rem)] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl animate-slide-up overflow-y-auto">
          {/* Header */}
          <div className="bg-green-500 text-white p-5 rounded-t-3xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Chirkut ঘর Assistant</h3>
                <p className="text-xs text-white/90">Powered by WhatsApp AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              👋 Welcome! How can I help you today? Choose a service or type your message:
            </p>

            {/* Service Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
              {services.map((service, index) => (
                <button
                  key={index}
                  onClick={() => handleSendWhatsApp(service.query)}
                  className="flex flex-col items-center justify-center p-2 sm:p-4 bg-cream dark:bg-slate-700 rounded-2xl hover:bg-maroon/10 dark:hover:bg-slate-600 transition-all duration-300 hover:scale-105 group"
                >
                  <span className="text-2xl sm:text-3xl mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                    {service.icon}
                  </span>
                  <span className="text-[10px] sm:text-xs text-center font-medium text-charcoal dark:text-gray-200 line-clamp-2">
                    {service.text}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Message Input */}
            <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Or type custom message:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendWhatsApp()}
                  placeholder="Type message..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-slate-700 border-2 border-transparent focus:border-green-500 rounded-2xl text-xs sm:text-sm focus:outline-none transition-colors"
                />
                <button
                  onClick={() => handleSendWhatsApp()}
                  className="px-3 sm:px-5 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-colors flex items-center space-x-2 flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-xs text-green-700 dark:text-green-300 text-center">
                💬 Clicking any button will open WhatsApp chat
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppWizard;
