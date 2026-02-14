import React, { useState } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReviewForm = ({
  productId,
  onReviewSubmitted = () => { },
  onClose = () => { },
  initialGuestEmail = '',
  initialOrderId = ''
}) => {
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
  const [isGuest, setIsGuest] = useState(!user); // Default to guest if not logged in
  const [isVerifiedOption, setIsVerifiedOption] = useState(!!(initialGuestEmail && initialOrderId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate
      if (!rating) {
        setError('Please select a rating');
        setLoading(false);
        return;
      }

      if (comment.trim().length < 10) {
        setError('Review must be at least 10 characters');
        setLoading(false);
        return;
      }

      // Prepare payload
      const payload = {
        rating,
        title: title || `${rating} out of 5 stars`,
        comment: comment.trim(),
      };

      // Add guest info if applicable
      if (isGuest) {
        if (!user && !guestName) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        payload.guestName = guestName;
        payload.guestEmail = guestEmail;
        payload.orderId = orderId;
      }

      // Submit review
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post(
        `/api/products/${productId}/reviews`,
        payload,
        config
      );

      toast.success('✅ Review submitted successfully! Thank you for your feedback.', {
        duration: 4000,
        icon: '✨'
      });
      onReviewSubmitted();
      onClose();

      // Reset form
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-maroon text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-black">Share Your Experience ✨</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* User Type Selection */}


          {/* Guest Info */}
          {isGuest && (
            <div className="space-y-4 bg-slate-100/50 dark:bg-slate-700/40 p-5 rounded-3xl border border-slate-200 dark:border-slate-600">
              <p className="text-[11px] text-maroon font-bold mb-1 uppercase tracking-wider">Reviewer Information</p>
              <input
                type="text"
                placeholder="Full Name *"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-maroon focus:ring-4 focus:ring-maroon/10 outline-none transition-all font-medium text-charcoal dark:text-white"
                required={isGuest}
              />
              <input
                type="email"
                placeholder="Email Address (Optional)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-maroon focus:ring-4 focus:ring-maroon/10 outline-none transition-all font-medium text-charcoal dark:text-white"
              />
              <div className="pt-3 mt-1 border-t border-slate-200 dark:border-slate-600">
                <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest font-black flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Verify Purchase (Optional)
                </p>
                <input
                  type="text"
                  placeholder="Order ID / TrxID (For Verified Badge)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-maroon focus:ring-4 focus:ring-maroon/10 outline-none transition-all font-bold text-maroon dark:text-pink-400 placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Star Rating */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-maroon">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                  title={`${star} out of 5 stars`}
                >
                  <Star
                    className={`h-10 w-10 ${star <= (hoveredRating || rating)
                      ? 'fill-gold text-gold'
                      : 'text-slate/30'
                      } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-slate/60">
                {rating === 5 && '❤️ Absolutely love it!'}
                {rating === 4 && '😊 Very satisfied'}
                {rating === 3 && '😐 It\'s okay'}
                {rating === 2 && '😕 Not great'}
                {rating === 1 && '😞 Poor experience'}
              </p>
            )}
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <label className="block text-lg font-black text-maroon">Headline / Summary (Optional)</label>
            <input
              type="text"
              placeholder="e.g., Absolutely stunning quality! Highly recommended."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="w-full px-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-maroon focus:ring-4 focus:ring-maroon/10 outline-none transition-all font-medium text-charcoal dark:text-white"
            />
            <p className="text-xs text-slate/50 text-right font-medium">{title.length}/120 characters</p>
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <label className="block text-lg font-black text-maroon">Tell us more! *</label>
            <textarea
              placeholder="What did you like or dislike? How was the fabric/design? Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={5}
              className="w-full px-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-maroon focus:ring-4 focus:ring-maroon/10 outline-none transition-all font-medium text-charcoal dark:text-white resize-none"
              required
            />
            <div className="flex justify-between text-[10px] text-slate/50 font-bold uppercase tracking-wider">
              <span>Min 10 chars</span>
              <span>{comment.length}/1000 characters</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 p-4 rounded-2xl text-sm text-amber-800 dark:text-amber-200">
            <p className="font-bold mb-1">✨ Your review matters!</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Be honest and constructive</li>
              <li>Include details (quality, size, durability, etc.)</li>
              <li>Your review will be published after admin approval</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t-2 border-slate/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border-2 border-maroon text-maroon rounded-2xl font-bold hover:bg-maroon/5 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-maroon text-white rounded-2xl font-bold hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {loading ? 'Publishing...' : 'Publish Review ✨'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
