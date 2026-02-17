import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minimize2, Sparkles } from 'lucide-react';

const AIChatFloatingWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 💝 Welcome to RongRani™! I'm your AI assistant. What can I help you with today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const deliverySettings = {
    chittagongFee: 70,
    outsideChittagongFee: 150,
    freeShippingThreshold: 2500,
  };
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Note: We use default delivery settings in the AI chat
  // These will be updated when admin changes settings and page reloads
  // For real-time updates, a Socket.io listener can be added

  const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();

    if (msg.includes('love') || msg.includes('romantic') || msg.includes('প্রেম')) {
      return "💕 Perfect! Our Love Combo Special (৳2500) includes a handwritten love letter, chocolates, and a teddy bear. We also have Couple Rings Set (৳3500) and Valentine Special Combo (৳6500). Which one interests you?";
    } else if (msg.includes('anniversary') || msg.includes('বার্ষিকী')) {
      return "🎉 For anniversaries, our Anniversary Surprise Box (৳5500) is the best seller! It includes a necklace, bangles, and a love note. Also check out Couple Watch Set (৳7500) and Premium Gift Sharee (৳6500).";
    } else if (msg.includes('birthday') || msg.includes('জন্মদিন')) {
      return "🎂 Birthday Gift Box (৳3500) is super popular! For something extra special, try Premium Luxury Gift Box (৳9500) or Proposal Gift Box (৳8500). What's your budget?";
    } else if (msg.includes('chocolate') || msg.includes('চকলেট')) {
      return "🍫 We have amazing chocolates! Premium Chocolate Gift Box (৳1500) with assorted Dairy Milk, KitKat & Silk, and Heart Shape Chocolate Box (৳2200) for romantic occasions!";
    } else if (msg.includes('price') || msg.includes('cost') || msg.includes('দাম')) {
      return "💰 Our products range from ৳500 (Handwritten Love Letter) to ৳9500 (Premium Luxury Gift Box). Most popular items are between ৳1500-৳5500. What's your budget?";
    } else if (msg.includes('delivery') || msg.includes('shipping') || msg.includes('ডেলিভারি')) {
      return `🚚 Cox's Bazar: ৳${deliverySettings.chittagongFee} | Other districts: ৳${deliverySettings.outsideChittagongFee} | FREE delivery on orders above ৳${deliverySettings.freeShippingThreshold}.`;
    } else if (msg.includes('payment') || msg.includes('পেমেন্ট')) {
      return "💳 We accept: Cash on Delivery (COD), bKash, Nagad, Rocket. For mobile banking, please provide Transaction ID and last 4 digits after payment.";
    } else if (msg.includes('track') || msg.includes('order') || msg.includes('অর্ডার')) {
      return "📦 You can track your order from 'My Orders' page after logging in. We send email updates for every status change. Need help with a specific order?";
    } else if (msg.includes('contact') || msg.includes('call') || msg.includes('যোগাযোগ')) {
      return "📞 Call us: +8801851075537 | Email: info.rongrani@gmail.com | WhatsApp: Click the green button on left! We reply instantly!";
    } else if (msg.includes('gift') || msg.includes('suggest') || msg.includes('উপহার')) {
      return "🎁 What's the occasion? Choose from: 💕 Love/Romance | 🎂 Birthday | 🎉 Anniversary | 💍 Proposal | 💐 Valentine's | 🎓 Graduation. Tell me and I'll suggest perfect gifts!";
    } else if (msg.includes('thanks') || msg.includes('thank') || msg.includes('ধন্যবাদ')) {
      return "You're very welcome! 💝 Feel free to ask anything anytime. Happy shopping at RongRani! Need anything else?";
    } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('হাই')) {
      return "Hello! 👋 Great to see you! I'm here to help you find the perfect gift. Tell me, what occasion are you shopping for today?";
    } else if (msg.includes('help') || msg.includes('সহায়তা') || msg.includes('/')) {
      return "📍 Important Commands & Links:\n\n" +
        "📦 Track Order: Navigate to /track\n" +
        "🛍️ Shop: Browse our collection at /shop\n" +
        "📞 Contact: Call +8801851075537\n" +
        "💬 WhatsApp: Direct support at wa.me/8801851075537\n" +
        "❓ Help Center: Visit /help for FAQs\n\n" +
        "Simply type what you're looking for (e.g., 'birthday gift') and I'll find it for you! 🎁";
    } else {
      return "I'm here to help! 💝 Type 'help' to see all important links, or ask me about:\n\n" +
        "• 📝 Order Tracking\n" +
        "• 🎁 Gift Suggestions\n" +
        "• 🚚 Delivery & Shipping\n" +
        "• 💳 Payment Methods\n\n" +
        "What can I do for you today?";
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);

    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 800);

    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="floating-widget fixed bottom-24 lg:bottom-24 right-6 z-[1001] bg-maroon text-white rounded-full p-4 shadow-2xl hover:shadow-maroon/40 hover:scale-110 transition-all duration-300 group border-2 border-white/20"
          aria-label="Open AI Chat"
        >
          <Bot className="h-7 w-7 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white"></span>
          <div className="absolute -top-12 right-0 bg-maroon text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
            Need Help? Chat with AI! 💬
          </div>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="floating-widget fixed bottom-24 lg:bottom-24 right-4 sm:right-6 z-[1001] w-[calc(100vw-2rem)] sm:w-80 md:w-96 h-[400px] sm:h-[520px] max-h-[60vh] sm:max-h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-2xl overflow-hidden border border-maroon/20 flex flex-col animate-slide-up">
          {/* Header */}
          <div
            className="bg-maroon text-white p-4 flex items-center justify-between relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm -skew-x-12 translate-x-1/2"></div>
            <div className="flex items-center space-x-3 relative z-10">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group/icon">
                <Bot className="h-7 w-7 text-maroon relative z-10 group-hover/icon:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-maroon/5 animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight">RongRani Assistant</h3>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                  <p className="text-[10px] text-white/90 font-bold uppercase tracking-widest">Active Now</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-xl p-2 transition-all hover:rotate-90 relative z-10"
              aria-label="Close Chat"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-white border-b border-maroon/10 p-2 flex overflow-x-auto gap-2 whitespace-nowrap no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            <a href="/track" className="flex items-center gap-1.5 px-3 py-1.5 bg-maroon/5 hover:bg-maroon/10 text-maroon text-[11px] font-bold rounded-full transition-colors border border-maroon/10">
              📦 Track Order
            </a>
            <a href="https://wa.me/8801851075537" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 text-[11px] font-bold rounded-full transition-colors border border-green-100">
              💬 WhatsApp
            </a>
            <a href="tel:+8801851075537" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-bold rounded-full transition-colors border border-blue-100">
              📞 Call Support
            </a>
            <a href="/shop" className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/5 hover:bg-gold/10 text-gold-600 text-[11px] font-bold rounded-full transition-colors border border-gold/10">
              🛍️ Shop Now
            </a>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream/40 scrollbar-hide"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.sender === 'user'
                    ? 'bg-maroon text-white rounded-br-md shadow-lg'
                    : 'bg-white text-slate-700 border border-maroon/10 rounded-bl-md shadow-md'
                    }`}
                >
                  {message.sender === 'bot' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-4 w-4 text-gold" />
                      <span className="font-bold text-xs text-maroon">AI Assistant</span>
                    </div>
                  )}
                  <p className={`text-sm leading-relaxed ${message.sender === 'user' ? 'font-medium' : ''}`}>
                    {message.text}
                  </p>
                  <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-slate-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-maroon/10">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  id="ai-chat-input"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Press Enter to send)"
                  aria-label="Message to AI assistant"
                  className="w-full px-4 py-3 pr-12 border-2 border-maroon/20 rounded-2xl focus:outline-none focus:border-maroon resize-none text-sm text-slate-800 dark:text-gray-100 bg-white dark:bg-slate-700 scrollbar-hide"
                  rows={1}
                  style={{
                    minHeight: '48px',
                    maxHeight: '120px'
                  }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-maroon text-white p-3 rounded-2xl hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-lg hover:shadow-maroon/40"
                aria-label="Send Message"
              >
                <Send className="h-6 w-6 text-white" />
              </button>
            </div>
            <p className="text-xs text-center text-slate/60 mt-2 font-medium">
              Powered by RongRani AI • Always ready to help 💝
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatFloatingWidget;
