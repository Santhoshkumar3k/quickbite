import React, { useState } from 'react';
import { X, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { addRestaurantReview, saveOrderReview } from '../services/reviewService';

const RATING_LABELS = {
  1: 'Disappointing 😞',
  2: 'Could be better 😐',
  3: 'Average / Good 🙂',
  4: 'Very Tasty & Fresh 😋',
  5: 'Outstanding! Loved it! ⭐⭐⭐⭐⭐',
};

export default function ReviewOrderModal({
  isOpen,
  onClose,
  order,
  currentUser,
  onReviewSubmitted,
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState(currentUser?.name || 'Verified Foodie');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Please write a quick comment about your order experience!');
      return;
    }

    setIsSubmitting(true);

    const reviewData = {
      userName: userName.trim() || 'Verified Foodie',
      rating,
      comment: comment.trim(),
      orderNumber: order.orderNumber,
    };

    // 1. Add review to the restaurant's reviews
    addRestaurantReview(order.restaurantId, reviewData);

    // 2. Mark this specific order as reviewed
    saveOrderReview(order.id, {
      ...reviewData,
      date: 'Just now',
    });

    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      if (onReviewSubmitted) onReviewSubmitted(order.id, reviewData);
      onClose();
    }, 1200);
  };

  const activeStar = hoverRating || rating;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '480px',
          padding: '28px',
          borderRadius: '20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--slate-900)' }}>
              Rate & Review Order
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--slate-500)', marginTop: '2px' }}>
              {order.restaurantName} • #{order.orderNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Review Submitted!
            </h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
              Your review is now live on {order.restaurantName}'s reviews slider. Thank you!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Ordered Items Summary */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                color: '#64748b',
              }}
            >
              <strong>Ordered: </strong>
              {order.items?.map((i) => `${i.quantity}x ${i.itemName}`).join(', ') || 'Delicious meal'}
            </div>

            {/* Interactive Star Rating */}
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      transform: activeStar >= star ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <Star
                      size={32}
                      fill={activeStar >= star ? '#f59e0b' : 'none'}
                      stroke={activeStar >= star ? '#f59e0b' : '#cbd5e1'}
                      strokeWidth={2}
                    />
                  </button>
                ))}
              </div>
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#ea580c',
                  minHeight: '20px',
                }}
              >
                {RATING_LABELS[activeStar]}
              </div>
            </div>

            {/* Reviewer Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Santhosh K."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                }}
                required
              />
            </div>

            {/* Comments Textarea */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Review & Experience
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the food? Mention your favorite dishes, taste, packaging, or freshness..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'none',
                }}
                required
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                }}
              >
                {isSubmitting ? 'Posting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
