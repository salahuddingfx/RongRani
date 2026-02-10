import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home, Mail, Phone, Lock, Eye, Database, UserCheck } from 'lucide-react';
import Seo from '../components/Seo';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-cream py-16">
      <Seo
        title="Privacy Policy | RongRani"
        description="Learn how RongRani collects, uses, and protects your data when you shop for handmade gifts in Bangladesh."
        path="/privacy-policy"
      />
      <div className="section-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div
              className="p-4 rounded-2xl shadow-xl"
              style={{ backgroundColor: '#059669' }}
            >
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
            Privacy Policy
          </h1>
          <p className="text-charcoal-light text-lg">
            Last updated: February 7, 2026
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-emerald-100">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: '#059669' }}
            >
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-charcoal mb-1">Secure by Default</h3>
            <p className="text-sm text-charcoal-light">We protect your data with strong security practices.</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-emerald-100">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: '#059669' }}
            >
              <Eye className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-charcoal mb-1">Transparent Use</h3>
            <p className="text-sm text-charcoal-light">We only use data to serve your orders better.</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-emerald-100">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: '#059669' }}
            >
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-charcoal mb-1">Your Rights</h3>
            <p className="text-sm text-charcoal-light">You can access, update, or delete your data.</p>
          </div>
        </div>

        {/* Content */}
        <div className="glass-card p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">1. Introduction</h2>
            <p className="text-charcoal-light leading-relaxed">
              At RongRani, we respect your privacy and are committed to protecting your personal data.
              This privacy policy explains how we collect, use, store, and protect your information when you
              visit our website and use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Database className="h-6 w-6 text-maroon" />
              <h2 className="text-2xl font-bold text-charcoal">2. Information We Collect</h2>
            </div>
            <div className="space-y-4 text-charcoal-light">
              <div>
                <h3 className="font-semibold text-charcoal mb-2">2.1 Personal Information</h3>
                <p className="leading-relaxed mb-2">We collect personal information that you provide to us, including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely through payment gateways)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Purchase history and preferences</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-charcoal mb-2">2.2 Automatically Collected Information</h3>
                <p className="leading-relaxed mb-2">When you visit our website, we automatically collect:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>IP address and browser type</li>
                  <li>Device information and operating system</li>
                  <li>Pages viewed and time spent on our website</li>
                  <li>Referring website addresses</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="h-6 w-6 text-maroon" />
              <h2 className="text-2xl font-bold text-charcoal">3. How We Use Your Information</h2>
            </div>
            <div className="space-y-3 text-charcoal-light">
              <p className="leading-relaxed">We use your information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and account</li>
                <li>Send promotional emails and newsletters (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Personalize your shopping experience</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
                <li>Analyze website usage and trends</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <UserCheck className="h-6 w-6 text-maroon" />
              <h2 className="text-2xl font-bold text-charcoal">4. Information Sharing</h2>
            </div>
            <div className="space-y-3 text-charcoal-light">
              <p className="leading-relaxed">We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Providers:</strong> Payment processors, shipping companies, and email services</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, sale, or acquisition</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to sharing</li>
              </ul>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">5. Cookies & Tracking Technologies</h2>
            <div className="space-y-3 text-charcoal-light">
              <p className="leading-relaxed">We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Keep you signed in to your account</li>
                <li>Understand how you use our website</li>
                <li>Provide personalized content and recommendations</li>
              </ul>
              <p className="leading-relaxed mt-3">
                You can control cookies through your browser settings. However, disabling cookies may affect
                your ability to use certain features of our website.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="h-6 w-6 text-maroon" />
              <h2 className="text-2xl font-bold text-charcoal">6. Data Security</h2>
            </div>
            <p className="text-charcoal-light leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information
              from unauthorized access, disclosure, alteration, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3 text-charcoal-light">
              <li>SSL encryption for data transmission</li>
              <li>Secure storage of sensitive information</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication protocols</li>
              <li>Employee training on data protection</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">7. Your Rights</h2>
            <div className="space-y-3 text-charcoal-light">
              <p className="leading-relaxed">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Objection:</strong> Object to processing of your data</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Withdraw Consent:</strong> Opt-out of marketing communications</li>
              </ul>
              <p className="leading-relaxed mt-3">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">8. Data Retention</h2>
            <p className="text-charcoal-light leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in
              this privacy policy, unless a longer retention period is required by law. When we no longer need
              your information, we will securely delete or anonymize it.
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">9. Third-Party Links</h2>
            <p className="text-charcoal-light leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the privacy
              practices of these external sites. We encourage you to read their privacy policies before
              providing any personal information.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">10. Children's Privacy</h2>
            <p className="text-charcoal-light leading-relaxed">
              Our services are not intended for children under 13 years of age. We do not knowingly collect
              personal information from children. If you believe we have collected information from a child,
              please contact us immediately.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-charcoal mb-4">11. Changes to This Policy</h2>
            <p className="text-charcoal-light leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of significant changes
              by posting a notice on our website or sending you an email. Your continued use of our services
              after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="card p-6">
            <h2 className="text-2xl font-bold text-charcoal mb-4">Contact Us</h2>
            <p className="text-charcoal-light leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or how we handle your data, please contact us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-charcoal-light">
                <Mail className="h-5 w-5 text-emerald-600" />
                <span>salauddinkaderappy@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 text-charcoal-light">
                <Phone className="h-5 w-5 text-emerald-600" />
                <span>+8801851075537</span>
              </div>
              <div className="flex items-center space-x-3 text-charcoal-light">
                <Home className="h-5 w-5 text-emerald-600" />
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

export default PrivacyPolicy;
