import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Phone, Mail, MapPin } from 'lucide-react';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 Welcome to RongRani. How can we help you today?",
      sender: 'support',
      timestamp: new Date().toISOString()
    }
  ]);
  const messagesEndRef = useRef(null);

  const whatsappNumber = '8801851075537'; // Replace with actual WhatsApp number

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickMessages = [
    { text: "🎁 I want to know about gift prices", icon: "💰" },
    { text: "📦 Track my order status", icon: "🚚" },
    { text: "💝 Need gift suggestions for special occasion", icon: "🎉" },
    { text: "🚚 What are the delivery charges?", icon: "📍" }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, userMessage]);

    // Open WhatsApp with message
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Add confirmation message
    setTimeout(() => {
      const confirmMessage = {
        id: Date.now() + 1,
        text: "✅ Message sent! We'll reply on WhatsApp shortly. You can also continue chatting here.",
        sender: 'support',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, confirmMessage]);
    }, 500);

    setMessage('');
  };

  const handleQuickMessage = (text) => {
    setMessage(text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-[1001] bg-green-600 text-white rounded-full p-4 shadow-2xl hover:shadow-green-500/50 hover:scale-110 transition-all duration-300 group"
          aria-label="Open WhatsApp Chat"
        >
          <MessageCircle className="h-7 w-7" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white flex items-center justify-center text-[8px] font-bold">1</span>
          <div className="absolute -top-12 left-0 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat on WhatsApp 💬
          </div>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-[1001] w-[calc(100vw-2rem)] sm:w-96 h-[600px] max-h-[calc(100vh-5rem)] bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-green-200 flex flex-col">
          {/* Header */}
          <div className="bg-green-600 text-white p-4 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
            </div>
            <div className="flex items-center space-x-3 relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                <MessageCircle className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-black text-lg">RongRani Support</h3>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                  <p className="text-xs text-white/90 font-medium">Typically replies instantly</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-xl p-2 transition-colors relative z-10"
              aria-label="Close Chat"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scrollbar-hide">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.sender === 'user'
                    ? 'bg-green-600 text-white rounded-br-md shadow-lg'
                    : 'bg-white text-slate border-2 border-green-200 rounded-bl-md shadow-md'
                    }`}
                >
                  {msg.sender === 'support' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm">👤</span>
                      </div>
                      <span className="font-bold text-xs text-green-700">Support Team</span>
                    </div>
                  )}
                  <p className={`text-sm leading-relaxed ${msg.sender === 'user' ? 'font-medium' : ''}`}>
                    {msg.text}
                  </p>
                  <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-white/70' : 'text-slate/50'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Messages */}
          <div className="px-4 py-3 bg-green-50 border-t border-green-200">
            <p className="text-xs font-bold text-green-700 mb-2">Quick Messages:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickMessages.map((quick, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickMessage(quick.text)}
                  className="text-left text-xs bg-white border-2 border-green-200 hover:border-green-500 hover:bg-green-50 text-slate rounded-xl px-3 py-2 transition-all hover:scale-105 active:scale-95 font-medium shadow-sm hover:shadow-md"
                >
                  <span className="block mb-1">{quick.icon}</span>
                  {quick.text.length > 30 ? quick.text.substring(0, 30) + '...' : quick.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t-2 border-green-200">
            <div className="flex items-end space-x-2 mb-2">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Press Enter)"
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-2xl focus:outline-none focus:border-green-500 resize-none text-sm text-slate scrollbar-hide"
                  rows={1}
                  style={{
                    minHeight: '48px',
                    maxHeight: '96px'
                  }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-green-600 text-white p-3 rounded-2xl hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-lg hover:shadow-green-500/50"
                aria-label="Send Message"
              >
                <Send className="h-6 w-6" />
              </button>
            </div>

            {/* Contact Info */}
            <div className="flex items-center justify-around text-xs text-slate/70 border-t border-green-100 pt-3">
              <a href="tel:+8801851075537" className="flex items-center space-x-1 hover:text-green-600 transition-colors">
                <Phone className="h-3 w-3" />
                <span className="font-medium">Call Us</span>
              </a>
              <a href="mailto:info.rongrani@gmail.com" className="flex items-center space-x-1 hover:text-green-600 transition-colors">
                <Mail className="h-3 w-3" />
                <span className="font-medium">Email</span>
              </a>
              <span className="flex items-center space-x-1 text-green-600 font-bold">
                <MapPin className="h-3 w-3" />
                <span>Cox's Bazar</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppWidget;
