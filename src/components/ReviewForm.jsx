import React, { useState } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

const ReviewForm = ({
  productId,
  onReviewSubmitted = () => { },
  onClose = () => { },
  initialGuestEmail = '',
  initialOrderId = ''
}) => {
  const { language } = useLanguage();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const token = localStorage.getItem('token');

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState(initialGuestEmail);
  const [orderId, setOrderId] = useState(initialOrderId);
  const [isGuest] = useState(!user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!rating) {
        setError(language === 'bn' ? 'অনুগ্রহ করে একটি রেটিং নির্বাচন করুন' : 'Please select a rating');
        setLoading(false);
        return;
      }

      if (comment.trim().length < 10) {
        setError(language === 'bn' ? 'রিভিউ কমপক্ষে ১০ অক্ষরের হতে হবে' : 'Review must be at least 10 characters');
        setLoading(false);
        return;
      }

      const payload = {
        rating,
        title: title || `${rating} out of 5 stars`,
        comment: comment.trim(),
      };

      if (isGuest) {
        if (!user && !guestName) {
          setError(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন' : 'Please enter your name');
          setLoading(false);
          return;
        }
        payload.guestName = guestName;
        payload.guestEmail = guestEmail;
        payload.orderId = orderId;
      }

      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post(
        `/api/products/${productId}/reviews`,
        payload,
        config
      );

      toast.success(language === 'bn' ? '✅ রিভিউ সফলভাবে জমা দেওয়া হয়েছে! আপনাকে ধন্যবাদ।' : '✅ Review submitted successfully! Thank you for your feedback.', {
        duration: 4000,
        icon: '✨'
      });
      onReviewSubmitted();
      onClose();

      setRating(0);
      setTitle('');
      setComment('');
      setGuestEmail('');
      setOrderId('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in shadow-2xl">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up border border-white/20">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-maroon to-maroon-light text-white p-6 md:p-8 flex items-center justify-between z-10 shadow-lg">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">{language === 'bn' ? 'আপনার অভিজ্ঞতা শেয়ার করুন ✨' : 'Share Your Experience ✨'}</h2>
            <p className="text-white/80 text-xs md:text-sm font-bold mt-1 uppercase tracking-widest">{language === 'bn' ? 'রংরানী পরিবারে আপনার মতামত গুরুত্বপূর্ণ' : 'Your voice matters in RongRani family'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-white/20 hover:bg-white/40 rounded-2xl flex items-center justify-center transition-all active:scale-90"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          {/* Guest Info */}
          {isGuest && (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-inner">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-maroon/10 rounded-xl flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <p className="text-xs md:text-sm text-maroon font-black uppercase tracking-widest">{language === 'bn' ? 'রিভিউর তথ্য' : 'Reviewer Information'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder={language === 'bn' ? 'আপনার নাম *' : 'Full Name *'}
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-maroon focus:ring-8 focus:ring-maroon/5 outline-none transition-all font-bold text-charcoal dark:text-white"
                    required={isGuest}
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="email"
                    placeholder={language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email Address (Optional)'}
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-maroon focus:ring-8 focus:ring-maroon/5 outline-none transition-all font-bold text-charcoal dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-6 mt-4 border-t-2 border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-[11px] text-slate-500 uppercase tracking-widest font-black">{language === 'bn' ? 'অর্ডার যাচাইকরণ (ঐচ্ছিক)' : 'Verify Purchase (Optional)'}</p>
                </div>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'অর্ডার আইডি / ট্রানজেকশন আইডি' : 'Order ID / TrxID (For Verified Badge)'}
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-green-500 focus:ring-8 focus:ring-green-500/5 outline-none transition-all font-black text-green-600 dark:text-green-400 placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Star Rating */}
          <div className="space-y-4 text-center md:text-left bg-maroon/5 p-6 rounded-[2rem] border border-maroon/10">
            <label className="block text-lg font-black text-maroon uppercase tracking-tight">{language === 'bn' ? 'আপনার রেটিং বাছাই করুন *' : 'Select Your Rating *'}</label>
            <div className="flex justify-center md:justify-start gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all hover:scale-125 hover:-translate-y-1 active:scale-90"
                  title={`${star} out of 5 stars`}
                >
                  <Star
                    className={`h-11 w-11 ${star <= (hoveredRating || rating)
                      ? 'fill-gold text-gold scale-110 drop-shadow-[0_0_8px_rgba(255,191,0,0.4)]'
                      : 'text-slate-300 dark:text-slate-700'
                      } transition-all duration-300`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm font-black text-gold animate-bounce-slow mt-2">
                {rating === 5 && (language === 'bn' ? '❤️ অসাধারণ! আমি এটা খুব পছন্দ করি!' : '❤️ Absolutely love it!')}
                {rating === 4 && (language === 'bn' ? '😊 আমি সন্তুষ্ট' : '😊 Very satisfied')}
                {rating === 3 && (language === 'bn' ? '😐 মোটামুটি ঠিক আছে' : "😐 It's okay")}
                {rating === 2 && (language === 'bn' ? '😕 ভালো লাগেনি' : '😕 Not great')}
                {rating === 1 && (language === 'bn' ? '😞 খুব খারাপ অভিজ্ঞতা' : '😞 Poor experience')}
              </p>
            )}
          </div>

          {/* Review Title */}
          <div className="space-y-3">
            <label className="block text-lg font-black text-maroon tracking-tight">{language === 'bn' ? 'রিভিউর শিরোনাম (ঐচ্ছিক)' : 'Headline / Summary (Optional)'}</label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'যেমন: কোয়ালিটি অনেক ভালো! সবাই নিতে পারেন।' : 'e.g., Absolutely stunning quality! Highly recommended.'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-maroon focus:ring-8 focus:ring-maroon/5 outline-none transition-all font-bold text-charcoal dark:text-white"
            />
            <div className="flex justify-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{title.length}/120</span>
            </div>
          </div>

          {/* Review Comment */}
          <div className="space-y-3">
            <label className="block text-lg font-black text-maroon tracking-tight">{language === 'bn' ? 'বিস্তারিত লিখুন *' : 'Tell us more! *'}</label>
            <textarea
              placeholder={language === 'bn' ? 'ডিজাইন বা কাপড়ের কোয়ালিটি কেমন ছিল? আমাদের প্যাকেজিং আপনার কেমন লেগেছে?' : 'What did you like or dislike? How was the fabric/design? Share your experience...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={4}
              className="w-full px-5 py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[1.5rem] focus:border-maroon focus:ring-8 focus:ring-maroon/5 outline-none transition-all font-bold text-charcoal dark:text-white resize-none"
              required
            />
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{language === 'bn' ? 'কমপক্ষে ১০ অক্ষর' : 'Min 10 chars'}</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{comment.length}/1000</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 p-5 rounded-[1.5rem] flex items-start gap-4 animate-shake">
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <p className="font-bold text-sm">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-100 dark:border-amber-800/50 p-6 rounded-[2rem]">
            <p className="font-black text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-2">
              <span className="text-lg">💡</span> {language === 'bn' ? 'রংরানী টিপস' : 'RongRani Tip'}
            </p>
            <ul className="space-y-2 text-xs font-bold text-amber-900/70 dark:text-amber-300/60 leading-relaxed">
              <li className="flex items-center gap-2">• {language === 'bn' ? 'সততা বজায় রেখে রিভিউ লিখুন' : 'Be honest and constructive'}</li>
              <li>• {language === 'bn' ? 'পণ্যের কোয়ালিটি, ডিজাইন এবং প্যাকেজিং সম্পর্কে বিস্তারিত লিখুন' : 'Include details (quality, design, packaging, etc.)'}</li>
              <li>• {language === 'bn' ? 'আপনার রিভিউটি অ্যাডমিন অনুমোদনের পর সবার জন্য দৃশ্যমান হবে' : 'Your review will be visible after admin approval'}</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
              disabled={loading}
            >
              {language === 'bn' ? 'বাদ দিন' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[1.5] py-4 px-6 bg-maroon text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-[0_20px_40px_-10px_rgba(190,18,60,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl"
            >
              {loading ? (
                <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Star className="h-5 w-5 fill-white" />
                  <span>{language === 'bn' ? 'রিভিউ পাবলিশ করুন' : 'Publish Review ✨'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
