import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Get initial language from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('language', language);
    // Set document direction for RTL languages if needed
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en');
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  // Comprehensive translation object
  const translations = {
    en: {
      // Navigation
      home: 'Home',
      shop: 'Shop',
      cart: 'Cart',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      search: 'Search',
      search_placeholder: 'Search for gifts...',
      wishlist: 'Wishlist',
      about: 'About',
      dashboard: 'Dashboard',
      my_orders: 'My Orders',
      admin_panel: 'Admin Panel',
      menu: 'Menu',
      back_to_home: 'Back to Home',
      contact: 'Contact',

      // Top Bar
      free_shipping: 'FREE Shipping on orders over',
      welcome_offer: 'Up to 50% OFF on selected items!',
      call_us: 'Call:',
      email_us: 'Mail:',
      language: 'Language',
      currency: 'Currency',
      bdt: 'BDT',
      english: 'English',
      bengali: 'Bengali',

      // Cart
      items: 'Items',
      total: 'Total',
      checkout: 'Checkout',
      view_cart: 'View Cart',
      empty_cart: 'Your cart is empty',
      add_to_cart: 'Add to Cart',

      // Home Page
      hero_title: 'Shop Handmade Gifts in Bangladesh',
      hero_subtitle: 'Explore curated surprise boxes, handmade gifts, and traditional crafts',
      shop_now: 'Shop Now',
      explore_collection: 'Explore Collection',
      hot_offer: 'Hot Offer',
      limited_time: 'Limited Time Only!',
      grab_now: 'Grab Now',
      shop_by_category: 'Shop by Category',
      featured_products: 'Featured Collection',
      view_all: 'View All',
      new_arrival: 'New',
      sale: 'Sale',
      hot: 'Hot',
      off: 'OFF',

      // Product
      quick_view: 'Quick View',
      add_to_wishlist: 'Add to Wishlist',
      out_of_stock: 'Out of Stock',
      in_stock: 'In Stock',

      // Footer
      about_us: 'About Us',
      quick_links: 'Quick Links',
      customer_care: 'Customer Care',
      follow_us: 'Follow Us',
      newsletter_title: 'Subscribe to Newsletter',
      newsletter_subtitle: 'Get updates on new products and offers',
      subscribe: 'Subscribe',

      // Common
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      update: 'Update',
      submit: 'Submit',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',

      // Product Details
      product_details: 'Product Details',
      select_quantity: 'Select Quantity',
      buy_now: 'Buy Now',
      delivery_info: 'Delivery Information',
      free_delivery: 'Free Delivery',
      delivery_time: '2-3 Days Delivery',
      return_policy: 'Return Policy',
      days_return: '7 Days Return',
      secure_payment: 'Secure Payment',
      payment_methods: '100% Secure Payment',
      customer_reviews: 'Customer Reviews',
      write_review: 'Write a Review',
      no_reviews: 'No Reviews Yet',
      be_first_review: 'Be the first to review this product',
      related_products: 'Related Products',
      you_may_like: 'You May Also Like',
      product_description: 'Product Description',
      specifications: 'Specifications',
      reviews: 'Reviews',
      rating: 'Rating',
      review_count: 'reviews',

      // Shop Page
      filter_by: 'Filter By',
      sort_by: 'Sort By',
      price_range: 'Price Range',
      min_price: 'Min Price',
      max_price: 'Max Price',
      apply_filter: 'Apply Filter',
      clear_filter: 'Clear Filter',
      showing_results: 'Showing Results',
      no_products_found: 'No Products Found',

      // Cart & Checkout
      shopping_cart: 'Shopping Cart',
      cart_summary: 'Cart Summary',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      discount: 'Discount',
      grand_total: 'Grand Total',
      proceed_to_checkout: 'Proceed to Checkout',
      continue_shopping: 'Continue Shopping',
      remove_from_cart: 'Remove from Cart',
      update_cart: 'Update Cart',
      apply_coupon: 'Apply Coupon',
      coupon_code: 'Coupon Code',

      // Orders
      order_history: 'Order History',
      order_details: 'Order Details',
      order_number: 'Order Number',
      order_date: 'Order Date',
      order_status: 'Order Status',
      track_order: 'Track Order',
      cancel_order: 'Cancel Order',

      // Auth
      email: 'Email',
      password: 'Password',
      confirm_password: 'Confirm Password',
      forgot_password: 'Forgot Password?',
      remember_me: 'Remember Me',
      sign_in: 'Sign In',
      sign_up: 'Sign Up',
      create_account: 'Create Account',
      already_have_account: 'Already have an account?',
      dont_have_account: "Don't have an account?",
    },
    bn: {
      // Navigation
      home: 'হোম',
      shop: 'দোকান',
      cart: 'কার্ট',
      login: 'লগইন',
      register: 'নিবন্ধন',
      logout: 'লগআউট',
      search: 'খুঁজুন',
      search_placeholder: 'উপহার খুঁজুন...',
      wishlist: 'উইশলিস্ট',
      about: 'আমাদের সম্পর্কে',
      dashboard: 'ড্যাশবোর্ড',
      my_orders: 'আমার অর্ডার',
      admin_panel: 'অ্যাডমিন প্যানেল',
      menu: 'মেনু',
      back_to_home: 'হোমে ফিরে যান',
      contact: 'যোগাযোগ',

      // Top Bar
      free_shipping: '২০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি!',
      welcome_offer: 'নির্বাচিত পণ্যে ৫০% পর্যন্ত ছাড়!',
      call_us: 'কল:',
      email_us: 'মেইল:',
      language: 'ভাষা',
      currency: 'মুদ্রা',
      bdt: 'টাকা',
      english: 'ইংরেজি',
      bengali: 'বাংলা',

      // Cart
      items: 'আইটেম',
      total: 'মোট',
      checkout: 'চেকআউট',
      view_cart: 'কার্ট দেখুন',
      empty_cart: 'আপনার কার্ট খালি',
      add_to_cart: 'কার্টে যোগ করুন',

      // Home Page
      hero_title: 'বাংলাদেশে হস্তনির্মিত উপহার কিনুন',
      hero_subtitle: 'সারপ্রাইজ বক্স, হস্তনির্মিত উপহার এবং ঐতিহ্যবাহী কারুশিল্প দেখুন',
      shop_now: 'এখনই কিনুন',
      explore_collection: 'কালেকশন দেখুন',
      hot_offer: 'হট অফার',
      limited_time: 'সীমিত সময়ের জন্য!',
      grab_now: 'এখনই নিন',
      shop_by_category: 'ক্যাটাগরি অনুযায়ী কিনুন',
      featured_products: 'ফিচার্ড কালেকশন',
      view_all: 'সব দেখুন',
      new_arrival: 'নতুন',
      sale: 'সেল',
      hot: 'হট',
      off: 'ছাড়',

      // Product
      quick_view: 'দ্রুত দেখুন',
      add_to_wishlist: 'উইশলিস্টে যোগ করুন',
      out_of_stock: 'স্টকে নেই',
      in_stock: 'স্টকে আছে',

      // Footer
      about_us: 'আমাদের সম্পর্কে',
      quick_links: 'দ্রুত লিংক',
      customer_care: 'কাস্টমার কেয়ার',
      follow_us: 'আমাদের ফলো করুন',
      newsletter_title: 'নিউজলেটার সাবস্ক্রাইব করুন',
      newsletter_subtitle: 'নতুন পণ্য এবং অফার সম্পর্কে আপডেট পান',
      subscribe: 'সাবস্ক্রাইব',

      // Common
      loading: 'লোড হচ্ছে...',
      error: 'ত্রুটি',
      success: 'সফল',
      save: 'সংরক্ষণ',
      cancel: 'বাতিল',
      delete: 'মুছুন',
      edit: 'সম্পাদনা',
      update: 'আপডেট',
      submit: 'জমা দিন',
      close: 'বন্ধ করুন',
      confirm: 'নিশ্চিত করুন',
      yes: 'হ্যাঁ',
      no: 'না',

      // Product Details
      product_details: 'পণ্যের বিবরণ',
      select_quantity: 'পরিমাণ নির্বাচন করুন',
      buy_now: 'এখনই কিনুন',
      delivery_info: 'ডেলিভারি তথ্য',
      free_delivery: 'ফ্রি ডেলিভারি',
      delivery_time: '২-৩ দিনে ডেলিভারি',
      return_policy: 'রিটার্ন পলিসি',
      days_return: '৭ দিনের রিটার্ন',
      secure_payment: 'নিরাপদ পেমেন্ট',
      payment_methods: '১০০% নিরাপদ পেমেন্ট',
      customer_reviews: 'কাস্টমার রিভিউ',
      write_review: 'রিভিউ লিখুন',
      no_reviews: 'এখনো কোনো রিভিউ নেই',
      be_first_review: 'এই পণ্যের প্রথম রিভিউ লিখুন',
      related_products: 'সম্পর্কিত পণ্য',
      you_may_like: 'আপনি এগুলোও পছন্দ করতে পারেন',
      product_description: 'পণ্যের বিবরণ',
      specifications: 'বৈশিষ্ট্য',
      reviews: 'রিভিউ',
      rating: 'রেটিং',
      review_count: 'রিভিউ',

      // Shop Page
      filter_by: 'ফিল্টার করুন',
      sort_by: 'সাজান',
      price_range: 'মূল্য পরিসীমা',
      min_price: 'সর্বনিম্ন মূল্য',
      max_price: 'সর্বোচ্চ মূল্য',
      apply_filter: 'ফিল্টার প্রয়োগ করুন',
      clear_filter: 'ফিল্টার মুছুন',
      showing_results: 'ফলাফল দেখানো হচ্ছে',
      no_products_found: 'কোনো পণ্য পাওয়া যায়নি',

      // Cart & Checkout
      shopping_cart: 'শপিং কার্ট',
      cart_summary: 'কার্ট সারাংশ',
      subtotal: 'সাবটোটাল',
      shipping: 'শিপিং',
      tax: 'ট্যাক্স',
      discount: 'ছাড়',
      grand_total: 'সর্বমোট',
      proceed_to_checkout: 'চেকআউটে যান',
      continue_shopping: 'কেনাকাটা চালিয়ে যান',
      remove_from_cart: 'কার্ট থেকে সরান',
      update_cart: 'কার্ট আপডেট করুন',
      apply_coupon: 'কুপন প্রয়োগ করুন',
      coupon_code: 'কুপন কোড',

      // Orders
      order_history: 'অর্ডার ইতিহাস',
      order_details: 'অর্ডার বিবরণ',
      order_number: 'অর্ডার নম্বর',
      order_date: 'অর্ডার তারিখ',
      order_status: 'অর্ডার স্ট্যাটাস',
      track_order: 'অর্ডার ট্র্যাক করুন',
      cancel_order: 'অর্ডার বাতিল করুন',

      // Auth
      email: 'ইমেইল',
      password: 'পাসওয়ার্ড',
      confirm_password: 'পাসওয়ার্ড নিশ্চিত করুন',
      forgot_password: 'পাসওয়ার্ড ভুলে গেছেন?',
      remember_me: 'আমাকে মনে রাখুন',
      sign_in: 'সাইন ইন',
      sign_up: 'সাইন আপ',
      create_account: 'অ্যাকাউন্ট তৈরি করুন',
      already_have_account: 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?',
      dont_have_account: 'অ্যাকাউন্ট নেই?',
    }
  };

  // Translation function
  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    toggleLanguage,
    t,
    translations: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;