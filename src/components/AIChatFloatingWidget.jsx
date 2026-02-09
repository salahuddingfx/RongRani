import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minimize2, Sparkles } from 'lucide-react';

const AIChatFloatingWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 💝 Welcome to Chirkut ঘর! I'm your AI assistant. What can I help you with today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [deliverySettings, setDeliverySettings] = useState({
    chittagongFee: 70,
    outsideChittagongFee: 150,
    freeShippingThreshold: 2500,
  });
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
      return "💕 Perfect! Our Love Combo Special (৳2500) includes a handwritten chirkut, chocolates, and a teddy bear. We also have Couple Rings Set (৳3500) and Valentine Special Combo (৳6500). Which one interests you?";
    } else if (msg.includes('anniversary') || msg.includes('বার্ষিকী')) {
      return "🎉 For anniversaries, our Anniversary Surprise Box (৳5500) is the best seller! It includes a necklace, bangles, and a love note. Also check out Couple Watch Set (৳7500) and Premium Gift Sharee (৳6500).";
    } else if (msg.includes('birthday') || msg.includes('জন্মদিন')) {
      return "🎂 Birthday Gift Box (৳3500) is super popular! For something extra special, try Premium Luxury Gift Box (৳9500) or Proposal Gift Box (৳8500). What's your budget?";
    } else if (msg.includes('chocolate') || msg.includes('চকলেট')) {
      return "🍫 We have amazing chocolates! Premium Chocolate Gift Box (৳1500) with assorted Dairy Milk, KitKat & Silk, and Heart Shape Chocolate Box (৳2200) for romantic occasions!";
    } else if (msg.includes('price') || msg.includes('cost') || msg.includes('দাম')) {
      return "💰 Our products range from ৳500 (Handwritten Chirkut) to ৳9500 (Premium Luxury Gift Box). Most popular items are between ৳1500-৳5500. What's your budget?";
    } else if (msg.includes('delivery') || msg.includes('shipping') || msg.includes('ডেলিভারি')) {
      return `🚚 Cox's Bazar: ৳${deliverySettings.chittagongFee} | Other districts: ৳${deliverySettings.outsideChittagongFee} | FREE delivery on orders above ৳${deliverySettings.freeShippingThreshold}.`;
    } else if (msg.includes('payment') || msg.includes('পেমেন্ট')) {
      return "💳 We accept: Cash on Delivery (COD), bKash, Nagad, Rocket. For mobile banking, please provide Transaction ID and last 4 digits after payment.";
    } else if (msg.includes('track') || msg.includes('order') || msg.includes('অর্ডার')) {
      return "📦 You can track your order from 'My Orders' page after logging in. We send email updates for every status change. Need help with a specific order?";
    } else if (msg.includes('contact') || msg.includes('call') || msg.includes('যোগাযোগ')) {
      return "📞 Call us: +8801851075537 | Email: salauddinkaderappy@gmail.com | WhatsApp: Click the green button on left! We reply instantly!";
    } else if (msg.includes('gift') || msg.includes('suggest') || msg.includes('উপহার')) {
      return "🎁 What's the occasion? Choose from: 💕 Love/Romance | 🎂 Birthday | 🎉 Anniversary | 💍 Proposal | 💐 Valentine's | 🎓 Graduation. Tell me and I'll suggest perfect gifts!";
    } else if (msg.includes('thanks') || msg.includes('thank') || msg.includes('ধন্যবাদ')) {
      return "You're very welcome! 💝 Feel free to ask anything anytime. Happy shopping at Chirkut ঘর! Need anything else?";
    } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('হাই')) {
      return "Hello! 👋 Great to see you! I'm here to help you find the perfect gift. Tell me, what occasion are you shopping for today?";
    } else {
      return "I'd love to help you! 🎁 Try asking about: 💕 Love gifts | 🎂 Birthday presents | 🎉 Anniversaries | 🚚 Delivery | 💳 Payment options | 🎁 Gift suggestions. What interests you?";
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
          className="floating-widget fixed bottom-24 lg:bottom-6 right-6 z-50 bg-maroon text-white rounded-full p-4 shadow-2xl hover:shadow-maroon/40 hover:scale-110 transition-all duration-300 group border-2 border-white/20"
          aria-label="Open AI Chat"
        >
          <Bot className="h-7 w-7 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white"></span>
          <div className="absolute -top-12 right-0 bg-maroon text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Need Help? Chat with AI! 💬
          </div>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="floating-widget fixed bottom-24 lg:bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[50vh] sm:h-[520px] max-h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-2xl overflow-hidden border border-maroon/20 flex flex-col">
          {/* Header */}
          <div
            className="bg-gradient-to-r from-maroon via-maroon-light to-gold text-white p-4 flex items-center justify-between relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0%, transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.25) 0%, transparent 50%)'
            }}></div>
            <div className="flex items-center space-x-3 relative z-10">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-maroon">AI</span>
                <Bot className="h-7 w-7 text-maroon -ml-4" />
              </div>
              <div>
                <h3 className="font-black text-lg">AI Shopping Assistant</h3>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <p className="text-xs text-white/90 font-medium">Online • Replies instantly</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-xl p-2 transition-colors relative z-10"
              aria-label="Close Chat"
            >
              <X className="h-6 w-6 text-white" />
            </button>
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
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
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
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Press Enter to send)"
                  className="w-full px-4 py-3 pr-12 border-2 border-maroon/20 rounded-2xl focus:outline-none focus:border-maroon resize-none text-sm text-slate-800 scrollbar-hide"
                  rows={1}
                  style={{
                    minHeight: '48px',
                    maxHeight: '120px',
                    color: '#1f2937',
                    backgroundColor: '#ffffff'
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
              Powered by Chirkut ঘর AI • Always ready to help 💝
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatFloatingWidget;
