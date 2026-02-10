import React, { useState } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReviewForm = ({ productId, onReviewSubmitted = () => { }, onClose = () => { } }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const token = localStorage.getItem('token');

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
        if (!guestEmail || !orderId) {
          setError('Please enter your email and order ID');
          setLoading(false);
          return;
        }
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

      toast.success('✅ Review submitted! It will be published after admin approval.');
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
          {!user && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGuest}
                  onChange={(e) => setIsGuest(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-slate">I'm a guest reviewer (verify with order email & ID)</span>
              </label>
            </div>
          )}

          {/* Guest Info */}
          {isGuest && (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-700/20 p-4 rounded-2xl">
              <input
                type="email"
                placeholder="Your email from the order"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate/20 rounded-xl focus:border-maroon outline-none"
                required={isGuest}
              />
              <input
                type="text"
                placeholder="Order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate/20 rounded-xl focus:border-maroon outline-none"
                required={isGuest}
              />
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
            <label className="block text-lg font-bold text-maroon">Review Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g., Perfect gift for my sister!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="w-full px-4 py-3 border-2 border-slate/20 rounded-2xl focus:border-maroon outline-none dark:bg-slate-700 dark:text-white"
            />
            <p className="text-xs text-slate/60">{title.length}/120 characters</p>
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <label className="block text-lg font-bold text-maroon">Your Review *</label>
            <textarea
              placeholder="Share your honest experience with this product... What did you love? Any tips for other buyers?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={5}
              className="w-full px-4 py-3 border-2 border-slate/20 rounded-2xl focus:border-maroon outline-none resize-none dark:bg-slate-700 dark:text-white"
              required
            />
            <div className="flex justify-between text-xs text-slate/60">
              <span>Minimum 10 characters</span>
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
