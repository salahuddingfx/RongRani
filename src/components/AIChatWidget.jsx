import React, { useState } from 'react';
import { MessageCircle, X, Send, Bot, Loader } from 'lucide-react';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 💝 Welcome to RongRani! I can help you find the perfect gift. What occasion are you shopping for?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickReplies = [
    "Show me Love Combos",
    "Anniversary gifts",
    "Custom Order",
    "Birthday presents",
    "Best sellers",
    "Under ৳3000"
  ];

  const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();

    if (msg.includes('custom') || msg.includes('customize') || msg.includes('personalize')) {
      return "Perfect! 🎁 We specialize in custom gift orders!\n\nYou can customize:\n✨ Personalized handwritten love letters\n💝 Custom gift combos\n🎀 Special occasion packages\n\nFor custom orders, click the WhatsApp button (green icon) below to chat with our team directly. They'll help you create the perfect custom gift! 💚";
    } else if (msg.includes('love') || msg.includes('romantic')) {
      return "Our Love Combo Special (৳2500) is perfect! It includes a romantic handwritten letter, chocolates, and a teddy. Also check out our Couple Rings Set (৳3500) and Valentine Special Combo (৳6500)!";
    } else if (msg.includes('anniversary')) {
      return "For anniversaries, I recommend our Anniversary Surprise Box (৳5500) - it's our best seller! Also beautiful are the Couple Watch Set (৳7500) and Premium Gift Sharee (৳6500).";
    } else if (msg.includes('birthday')) {
      return "Our Birthday Gift Box (৳3500) is super popular! For something special, try the Premium Luxury Gift Box (৳9500) or Proposal Gift Box (৳8500).";
    } else if (msg.includes('chocolate')) {
      return "We have amazing chocolates! Premium Chocolate Gift Box (৳1500) and Heart Shape Chocolate Box (৳2200) are customer favorites! 🍫";
    } else if (msg.includes('jewellery') || msg.includes('jewelry')) {
      return "Check out our Gold Plated Party Necklace (৳2500), Designer Bangles Set (৳1800), or Jhumka Earrings (৳1200). All beautiful pieces! ✨";
    } else if (msg.includes('watch')) {
      return "We have Ladies Elegant Watch (৳4500) and Couple Watch Set (৳7500) - both are premium quality!";
    } else if (msg.includes('price') || msg.includes('cheap') || msg.includes('affordable')) {
      return "Our most affordable items: Handwritten Love Letter (৳500), Artificial Rose Bouquet (৳800), Jhumka Earrings (৳1200). All under ৳1500!";
    } else if (msg.includes('best seller') || msg.includes('popular')) {
      return "Top sellers: Love Combo Special (৳2500, 5★), Anniversary Surprise Box (৳5500, 5★), and Valentine Special Combo (৳6500, 5★)!";
    } else if (msg.includes('delivery') || msg.includes('shipping')) {
      return "We deliver all over Bangladesh! Cox's Bazar: ৳70, other districts: ৳150. FREE delivery on orders above ৳2500.";
    } else if (msg.includes('payment')) {
      return "We accept: Cash on Delivery (COD), bKash, Nagad, Rocket. For mobile banking, please provide Transaction ID and last 4 digits after payment. 💳";
    } else if (msg.includes('contact') || msg.includes('support')) {
      return "Call us: +8801851075537 or email: info.rongrani@gmail.com. You can also click the WhatsApp button (green icon below) for instant chat! 💬";
    } else if (msg.includes('thank') || msg.includes('thanks')) {
      return "You're welcome! Happy to help you find the perfect gift! 💝 Need anything else?";
    } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return "Hello! 👋 How can I help you find the perfect gift today?";
    } else {
      return "I can help you find:\n• Love & Anniversary Combos 💕\n• Birthday Gifts 🎂\n• Custom Orders 🎁\n• Jewellery & Watches ✨\n• Chocolates & Teddies 🍫\n\nWhat are you looking for?";
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot typing
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (text) => {
    setInputMessage(text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button - Positioned below WhatsApp button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-3 sm:right-4 md:right-6 z-49 bg-maroon text-white p-2.5 sm:p-3 md:p-4 rounded-full shadow-2xl hover:bg-maroon-light transition-all duration-300 hover:scale-110"
          title="AI Assistant"
        >
          <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-16 sm:bottom-20 md:bottom-24 right-2 sm:right-3 md:right-6 z-50 w-[calc(100vw-1rem)] sm:w-80 md:w-96 h-[60vh] sm:h-[65vh] md:h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-maroon/20">
          {/* Header */}
          <div className="bg-maroon text-white p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:space-x-3">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-maroon" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base">Gift Assistant</h3>
                <p className="text-xs text-white/80 truncate">Always here to help ❤️</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-50/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${message.sender === 'user'
                      ? 'bg-maroon text-white'
                      : 'bg-white text-charcoal shadow-md'
                    }`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.text}</p>
                  <span className={`text-xs mt-1 block ${message.sender === 'user' ? 'text-white/70' : 'text-slate'}`}>
                    {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-charcoal rounded-2xl px-4 py-3 shadow-md flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin text-maroon" />
                  <span className="text-sm">Typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-3 sm:px-4 py-2 border-t border-slate/10 bg-white">
              <p className="text-xs text-slate mb-2">Quick replies:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="text-[10px] sm:text-xs bg-maroon/10 hover:bg-maroon/20 text-maroon px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors line-clamp-1"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-slate/10 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about gifts..."
                className="flex-1 bg-pink-50/50 rounded-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-maroon/30"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-maroon text-white p-2 sm:p-3 rounded-full hover:bg-maroon-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;