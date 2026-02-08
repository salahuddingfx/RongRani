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
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="floating-widget fixed bottom-40 lg:bottom-24 right-6 z-50 w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 animate-pulse"
        aria-label="WhatsApp Help"
      >
        <MessageCircle className="h-8 w-8" />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="floating-widget fixed bottom-48 lg:bottom-32 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl animate-slide-up">
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
            <div className="grid grid-cols-2 gap-3 mb-4">
              {services.map((service, index) => (
                <button
                  key={index}
                  onClick={() => handleSendWhatsApp(service.query)}
                  className="flex flex-col items-center justify-center p-4 bg-cream dark:bg-slate-700 rounded-2xl hover:bg-maroon/10 dark:hover:bg-slate-600 transition-all duration-300 hover:scale-105 group"
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {service.icon}
                  </span>
                  <span className="text-xs text-center font-medium text-charcoal dark:text-gray-200">
                    {service.text}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Message Input */}
            <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Or type custom message:</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendWhatsApp()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 border-2 border-transparent focus:border-green-500 rounded-2xl text-sm focus:outline-none transition-colors"
                />
                <button
                  onClick={() => handleSendWhatsApp()}
                  className="px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-colors flex items-center space-x-2"
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
