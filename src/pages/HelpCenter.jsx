import React, { useState } from 'react';
import { HelpCircle, ShoppingBag, Truck, CreditCard, Gift, Package, RefreshCw, Shield, ChevronDown, ChevronUp, Search } from 'lucide-react';
import Seo from '../components/Seo';

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const helpColorMap = {
    'bg-pink-500': '#EC4899',
    'bg-rose-500': '#F43F5E',
    'bg-red-500': '#EF4444',
    'bg-maroon': '#BE123C',
    'bg-purple-500': '#A855F7',
    'bg-amber-500': '#F59E0B',
  };

  const getHelpColorStyle = (color) => {
    if (color && helpColorMap[color]) {
      return { backgroundColor: helpColorMap[color] };
    }
    return { backgroundColor: '#BE123C' };
  };

  const categories = [
    {
      title: 'Orders & Purchases',
      icon: ShoppingBag,
      color: 'bg-pink-500',
      faqs: [
        {
          q: 'How do I place an order?',
          a: 'Browse our collection, add items to cart, proceed to checkout, enter your delivery details, and complete payment. You will receive an order confirmation via email.'
        },
        {
          q: 'Can I modify my order after placing it?',
          a: 'Yes! You can modify your order within 2 hours of placing it. Contact our support team immediately via phone or email with your order ID.'
        },
        {
          q: 'How do I track my order?',
          a: 'Visit the "My Orders" section in your account or use the "Track Order" feature. Enter your order ID to see real-time tracking updates.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept Cash on Delivery (COD), Mobile Banking (bKash, Nagad, Rocket), and Credit/Debit Cards.'
        }
      ]
    },
    {
      title: 'Shipping & Delivery',
      icon: Truck,
      color: 'bg-rose-500',
      faqs: [
        {
          q: 'What areas do you deliver to?',
          a: 'We deliver all over Bangladesh. Same-day delivery available in Dhaka city, 2-3 days for other major cities, and 3-5 days for remote areas.'
        },
        {
          q: 'What are the delivery charges?',
          a: 'Inside Cox\'s Bazar City: ৳70, Outside Cox\'s Bazar City: ৳150. FREE delivery on orders above ৳2500!'
        },
        {
          q: 'Can I choose a specific delivery time?',
          a: 'Yes! For special occasions, you can select a preferred delivery date and time slot during checkout (additional charges may apply).'
        },
        {
          q: 'What if I miss the delivery?',
          a: 'Our delivery agent will contact you 3 times. If unsuccessful, the order will be held for 24 hours before returning to warehouse.'
        }
      ]
    },
    {
      title: 'Payment & Pricing',
      icon: CreditCard,
      color: 'bg-red-500',
      faqs: [
        {
          q: 'Is Cash on Delivery available?',
          a: 'Yes! COD is available for all orders. Just select "Cash on Delivery" at checkout.'
        },
        {
          q: 'Are prices negotiable?',
          a: 'Our prices are fixed, but we offer seasonal discounts, bundle deals, and special coupon codes. Subscribe to our newsletter for exclusive offers!'
        },
        {
          q: 'Do you have EMI facility?',
          a: 'Yes, EMI is available for credit card payments on orders above ৳5000. Check with your bank for EMI terms.'
        }
      ]
    },
    {
      title: 'Gift Customization',
      icon: Gift,
      color: 'bg-maroon',
      faqs: [
        {
          q: 'Can I add a personalized message?',
          a: 'Absolutely! Add your heartfelt message in the "Gift Message" field during checkout. We\'ll include a beautiful handwritten card.'
        },
        {
          q: 'Do you offer gift wrapping?',
          a: 'Yes! All our gift items come with complimentary elegant gift wrapping. Premium wrapping available for ৳50 extra.'
        },
        {
          q: 'Can I create a custom gift combo?',
          a: 'Yes! Contact us with your requirements, budget, and occasion. Our team will create a personalized combo for you.'
        },
        {
          q: 'Do you deliver surprise gifts at midnight?',
          a: 'Yes! We offer midnight surprise delivery service in select areas. Contact customer support to arrange.'
        }
      ]
    },
    {
      title: 'Returns & Exchanges',
      icon: RefreshCw,
      color: 'bg-purple-500',
      faqs: [
        {
          q: 'What is your return policy?',
          a: '7-day return policy for damaged or defective items. Items must be unused, in original packaging with tags intact.'
        },
        {
          q: 'Can I exchange an item?',
          a: 'Yes! You can exchange within 5 days if the size, color, or design doesn\'t match. Contact us with photos of the item.'
        },
        {
          q: 'Who pays for return shipping?',
          a: 'We cover return shipping for damaged/defective items. For change-of-mind returns, customer pays return shipping.'
        },
        {
          q: 'How long does refund take?',
          a: 'Refunds are processed within 7-10 business days after we receive the returned item. Amount will be credited to your original payment method.'
        }
      ]
    },
    {
      title: 'Product Information',
      icon: Package,
      color: 'bg-amber-500',
      faqs: [
        {
          q: 'Are your products authentic?',
          a: 'Yes! We guarantee 100% authentic products. All jewellery items come with authenticity certificates.'
        },
        {
          q: 'What materials are used in jewellery?',
          a: 'We use gold-plated, sterling silver, and premium alloy materials. Full details are mentioned on each product page.'
        },
        {
          q: 'Do chocolates have expiry dates?',
          a: 'Yes, all food items have clear expiry dates. We ensure minimum 2-3 months shelf life for all chocolates.'
        },
        {
          q: 'Are products suitable for sensitive skin?',
          a: 'Most jewellery is hypoallergenic. Check product descriptions or contact us for specific allergy concerns.'
        }
      ]
    }
  ];

  const toggleFaq = (categoryIndex, faqIndex) => {
    const key = `${categoryIndex}-${faqIndex}`;
    setOpenFaq(openFaq === key ? null : key);
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-pink-50 py-16 px-4">
      <Seo
        title="Help Center | RongRani Gift Delivery FAQs"
        description="Find answers about gift orders, delivery, payments, and returns. Browse RongRani help topics and FAQs."
        path="/help"
      />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle className="h-16 w-16 text-maroon mx-auto mb-4" />
          <h1 className="text-5xl md:text-6xl font-bold text-maroon mb-6">Help Center</h1>
          <p className="text-xl text-slate max-w-2xl mx-auto">
            Find answers to all your questions about gifts, delivery, and more
          </p>
        </div>

        {/* Search */}
        <div className="card bg-white/80 backdrop-blur-sm mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate" />
            <input
              type="text"
              placeholder="Search for help (e.g., delivery, payment, return...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-14 w-full text-lg"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const summary = category.faqs[0]?.q || 'Browse support topics';
            return (
              <a
                key={index}
                href={`#category-${index}`}
                className="card bg-white/80 backdrop-blur-sm text-left hover:scale-105 transition-transform p-6"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={getHelpColorStyle(category.color)}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-sm font-bold text-charcoal text-center">{category.title}</h3>
                <p className="text-xs text-slate text-center mt-2 line-clamp-2">
                  {summary}
                </p>
                <p className="text-[11px] text-slate/70 text-center mt-3">
                  {category.faqs.length} answers
                </p>
              </a>
            );
          })}
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {(searchTerm ? filteredCategories : categories).map((category, catIndex) => {
            const Icon = category.icon;
            return (
              <div key={catIndex} id={`category-${catIndex}`} className="card bg-white/80 backdrop-blur-sm">
                <div className="flex items-center space-x-4 mb-6">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={getHelpColorStyle(category.color)}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-charcoal">{category.title}</h2>
                    <p className="text-sm text-slate mt-1">
                      {category.faqs.length} common questions
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {category.faqs.map((faq, faqIndex) => {
                    const isOpen = openFaq === `${catIndex}-${faqIndex}`;
                    return (
                      <div
                        key={faqIndex}
                        className="border border-slate/20 rounded-xl overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => toggleFaq(catIndex, faqIndex)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-cream-light transition-colors"
                        >
                          <span className="font-semibold text-charcoal pr-4">{faq.q}</span>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-maroon flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-maroon flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="p-5 pt-0 text-slate border-t border-slate/10 bg-cream-light/50">
                            <p>{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {searchTerm && filteredCategories.length === 0 && (
          <div className="card bg-white/80 backdrop-blur-sm text-center py-16">
            <HelpCircle className="h-16 w-16 text-slate mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-charcoal mb-2">No results found</h3>
            <p className="text-slate mb-6">Try different keywords or browse categories above</p>
            <button onClick={() => setSearchTerm('')} className="btn-primary">
              Clear Search
            </button>
          </div>
        )}

        {/* Still Need Help */}
        <div className="card bg-maroon text-white text-center mt-12">
          <Shield className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3">Still Need Help?</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Our dedicated support team is here to assist you with any questions or concerns
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="btn-secondary bg-white hover:bg-white/90">
              Contact Support
            </a>
            <a href="tel:+8801851075537" className="btn-secondary bg-white/20 hover:bg-white/30 text-white border-white">
              Call: +880 18510-75537
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
