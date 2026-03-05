import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Award, Sparkles, ShoppingBag, Package, CheckCircle, Star, TrendingUp, Globe } from 'lucide-react';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';

const AboutUs = () => {
  const { t } = useLanguage();
  const stats = [
    { icon: ShoppingBag, value: '50+', label: t('products_sold'), bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
    { icon: Users, value: '100+', label: t('happy_customers'), bg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' },
    { icon: Award, value: '05+', label: t('skilled_artisans'), bg: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)' },
    { icon: Star, value: '4.8', label: t('avg_rating'), bg: 'linear-gradient(135deg, #FFD700 0%, #F59E0B 100%)' },
  ];

  const values = [
    {
      icon: Heart,
      title: t('passion_for_crafts'),
      description: t('passion_desc'),
      bg: '#EC4899',
    },
    {
      icon: Award,
      title: t('premium_quality'),
      description: t('quality_desc'),
      bg: '#F59E0B',
    },
    {
      icon: CheckCircle,
      title: t('cust_satisfaction'),
      description: t('cust_satisfaction_desc'),
      bg: '#22C55E',
    },
    {
      icon: Globe,
      title: t('cultural_heritage'),
      description: t('cultural_heritage_desc'),
      bg: '#3B82F6',
    },
  ];

  const team = [
    {
      name: 'Salah Uddin Kader',
      role: t('founder_ceo'),
      image: 'https://ui-avatars.com/api/?name=Salah+Uddin+Kader&background=8B1538&color=fff&size=200',
      description: 'Visionary leader passionate about promoting Bangladeshi crafts globally.',
    },
    {
      name: 'Artisan Team',
      role: t('master_craftspeople'),
      image: 'https://ui-avatars.com/api/?name=Artisan+Team&background=C9A86A&color=fff&size=200',
      description: 'Skilled artisans keeping traditional Bangladeshi crafts alive through their expertise.',
    },
    {
      name: 'Customer Support',
      role: t('support_team_label'),
      image: 'https://ui-avatars.com/api/?name=Support+Team&background=2F3645&color=fff&size=200',
      description: 'Dedicated team ensuring every customer has a delightful shopping experience.',
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Seo
        title="About RongRani | Handmade Gifts in Bangladesh"
        description="Learn about RongRani, our artisans, and our mission to deliver handcrafted gifts and surprise boxes across Bangladesh."
        path="/about"
      />
      {/* Hero Section */}
      <section className="relative bg-maroon text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full mb-6">
              <Sparkles className="h-5 w-5 text-gold" />
              <span className="font-semibold">{t('est_2026')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white">
              {t('about_hero_title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 font-medium leading-relaxed">
              {t('about_hero_subtitle')}
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto mb-8">
              {t('about_hero_desc')}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 bg-gold hover:bg-amber-500 text-charcoal px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <ShoppingBag className="h-6 w-6" />
              <span>Explore Our Collection</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg ring-1 ring-black/5"
                  style={{ backgroundImage: stat.bg }}
                >
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-black text-maroon mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm lg:text-base text-charcoal-light font-semibold">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 lg:py-24 bg-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-maroon/10 text-maroon px-6 py-2 rounded-full mb-4">
                <Heart className="h-5 w-5" />
                <span className="font-bold">{t('our_story_title')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-maroon mb-6">
                {t('crafting_memories')}
              </h2>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-maroon/10">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-charcoal-light leading-relaxed mb-6">
                  {t('about_story_p1')}
                </p>
                <p className="text-lg text-charcoal-light leading-relaxed mb-6">
                  {t('about_story_p2')}
                </p>
                <p className="text-lg text-charcoal-light leading-relaxed mb-6">
                  {t('about_story_p3')}
                </p>
                <div className="bg-gold/10 border-l-4 border-gold p-6 rounded-r-2xl my-8">
                  <p className="text-lg text-charcoal font-semibold italic">
                    "{t('mission_quote')}"
                  </p>
                </div>
                <p className="text-lg text-charcoal-light leading-relaxed">
                  {t('about_story_p4')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-maroon/10 text-maroon px-6 py-2 rounded-full mb-4">
              <Award className="h-5 w-5" />
              <span className="font-bold">{t('our_values_title')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-maroon mb-4">
              {t('what_we_stand_for')}
            </h2>
            <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
              {t('values_guide')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-maroon/10"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg ring-1 ring-black/5"
                  style={{ backgroundColor: value.bg }}
                >
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-maroon mb-4">{value.title}</h3>
                <p className="text-charcoal-light leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-24 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-maroon/10 text-maroon px-6 py-2 rounded-full mb-4">
              <Users className="h-5 w-5" />
              <span className="font-bold">{t('our_team')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-maroon mb-4">
              {t('meet_team')}
            </h2>
            <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
              {t('team_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border border-maroon/10"
              >
                <div className="relative overflow-hidden bg-maroon h-48">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full border-4 border-white absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 group-hover:scale-110 transition-transform duration-300 shadow-xl"
                  />
                </div>
                <div className="pt-20 pb-8 px-6 text-center">
                  <h3 className="text-xl font-bold text-maroon mb-2">{member.name}</h3>
                  <div className="text-sm font-semibold text-gold mb-4 bg-gold/10 inline-block px-4 py-1 rounded-full">
                    {member.role}
                  </div>
                  <p className="text-charcoal-light leading-relaxed">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-maroon">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Package className="h-16 w-16 mx-auto mb-6 text-gold" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
              {t('ready_perfect_gift')}
            </h2>
            <p className="text-xl mb-8 text-white/90">
              {t('browse_cta_desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center space-x-2 bg-gold hover:bg-amber-500 text-charcoal px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <ShoppingBag className="h-6 w-6" />
                <span>{t('shop_now_btn')}</span>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 border-2 border-white/30"
              >
                <Heart className="h-6 w-6" />
                <span>{t('contact')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
