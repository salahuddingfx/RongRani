import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Home, Mail, Phone } from 'lucide-react';
import Seo from '../components/Seo';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-cream py-16">
      <Seo
        title="Terms & Conditions | RongRani"
        description="Read the terms and conditions for shopping, delivery, and returns at RongRani."
        path="/terms"
      />
      <div className="section-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-maroon p-4 rounded-2xl shadow-xl">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
            Terms & Conditions
          </h1>
          <p className="text-charcoal-light text-lg">
            Last updated: February 7, 2026
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-maroon/10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: '#BE123C' }}
            >
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-charcoal mb-1">Clear Terms</h3>
            <p className="text-sm text-charcoal-light">Simple rules to keep your shopping safe.</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-maroon/10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: '#BE123C' }}
            >
              <Phone className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-charcoal mb-1">Support Ready</h3>
            <p className="text-sm text-charcoal-light">Reach us anytime for help with your order.</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-maroon/10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: '#BE123C' }}
            >
              <Home className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-charcoal mb-1">Local Focus</h3>
            <p className="text-sm text-charcoal-light">We deliver across Bangladesh with clear policies.</p>
          </div>
        </div>

        {/* Content */}
        <div className="glass-card p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">1. Introduction</h2>
            <p className="text-charcoal-light leading-relaxed">
              Welcome to RongRani. These Terms and Conditions govern your use of our website and services.
              By accessing or using our website, you agree to be bound by these terms. If you disagree with
              any part of these terms, please do not use our website.
            </p>
          </section>

          {/* Use of Website */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">2. Use of Website</h2>
            <div className="space-y-3 text-charcoal-light">
              <p className="leading-relaxed">You agree to use our website only for lawful purposes and in a way that does not infringe upon the rights of others. You must not:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use our website in any way that causes damage to the website or impairs its availability</li>
                <li>Use our website to transmit any harmful or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems or networks</li>
                <li>Collect or harvest any information about other users</li>
              </ul>
            </div>
          </section>

          {/* Product Information */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">3. Product Information</h2>
            <p className="text-charcoal-light leading-relaxed">
              We strive to provide accurate product descriptions and images. However, we do not warrant that product
              descriptions or other content on our website are accurate, complete, reliable, current, or error-free.
              Actual product colors may vary slightly from images due to screen settings and lighting conditions.
            </p>
          </section>

          {/* Orders and Payments */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">4. Orders & Payments</h2>
            <div className="space-y-3 text-charcoal-light">
              <p className="leading-relaxed">When you place an order:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You must provide accurate and complete information</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Prices are subject to change without notice</li>
                <li>Payment must be received before order processing</li>
                <li>We accept various payment methods as displayed at checkout</li>
              </ul>
            </div>
          </section>

          {/* Shipping and Delivery */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">5. Shipping & Delivery</h2>
            <div className="space-y-3 text-charcoal-light">
              <p className="leading-relaxed">Regarding delivery:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Delivery times are estimates and not guaranteed</li>
                <li>We are not responsible for delays caused by courier services</li>
                <li>Risk of loss passes to you upon delivery to the carrier</li>
                <li>You must inspect packages upon receipt and report damage within 48 hours</li>
              </ul>
            </div>
          </section>

          {/* Returns and Refunds */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">6. Returns & Refunds</h2>
            <div className="space-y-3 text-charcoal-light">
              <p className="leading-relaxed">Our return policy:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Products can be returned within 7 days of delivery</li>
                <li>Items must be unused and in original packaging</li>
                <li>Personalized items cannot be returned unless defective</li>
                <li>Refunds will be processed within 7-14 business days</li>
                <li>Return shipping costs are the customer's responsibility unless the item is defective</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">7. Intellectual Property</h2>
            <p className="text-charcoal-light leading-relaxed">
              All content on this website, including text, graphics, logos, images, and software, is the property
              of RongRani or its content suppliers and is protected by copyright laws. You may not reproduce,
              distribute, or create derivative works without our express written permission.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">8. Limitation of Liability</h2>
            <p className="text-charcoal-light leading-relaxed">
              To the fullest extent permitted by law, RongRani shall not be liable for any indirect, incidental,
              special, or consequential damages arising from your use of our website or products. Our total liability
              shall not exceed the amount you paid for the product.
            </p>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">9. Privacy</h2>
            <p className="text-charcoal-light leading-relaxed">
              Your use of our website is also governed by our Privacy Policy. Please review our{' '}
              <Link to="/privacy-policy" className="text-maroon hover:text-pink-600 font-semibold underline">
                Privacy Policy
              </Link>{' '}
              to understand how we collect, use, and protect your personal information.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">10. Changes to Terms</h2>
            <p className="text-charcoal-light leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon
              posting on our website. Your continued use of our website after changes constitutes acceptance of
              the modified terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">11. Governing Law</h2>
            <p className="text-charcoal-light leading-relaxed">
              These Terms and Conditions are governed by and construed in accordance with the laws of Bangladesh.
              Any disputes shall be subject to the exclusive jurisdiction of the courts in Dhaka, Bangladesh.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-cream-light p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-charcoal mb-4">Contact Us</h2>
            <p className="text-charcoal-light leading-relaxed mb-4">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-charcoal-light">
                <Mail className="h-5 w-5 text-maroon" />
                <span>info.rongrani@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 text-charcoal-light">
                <Phone className="h-5 w-5 text-maroon" />
                <span>+8801851075537</span>
              </div>
              <div className="flex items-center space-x-3 text-charcoal-light">
                <Home className="h-5 w-5 text-maroon" />
                <span>Cox's Bazar, Bangladesh-4700</span>
              </div>
            </div>
          </section>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Link to="/" className="btn-secondary px-8 py-3">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
