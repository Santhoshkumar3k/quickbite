import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, MessageSquareHeart, Sparkles } from 'lucide-react';
import { getRestaurantReviews } from '../services/reviewService';

export default function RestaurantReviewSlider({ restaurant }) {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const loadReviews = () => {
    if (!restaurant) return;
    const revs = getRestaurantReviews(restaurant);
    setReviews(revs);
  };

  useEffect(() => {
    loadReviews();

    const handleUpdate = (e) => {
      if (!e.detail || e.detail.restaurantId === restaurant?.id) {
        loadReviews();
      }
    };

    window.addEventListener('quickbite_reviews_updated', handleUpdate);
    return () => window.removeEventListener('quickbite_reviews_updated', handleUpdate);
  }, [restaurant]);

  // Smooth auto-scroll sliding every 3.5 seconds without needing manual arrows
  useEffect(() => {
    if (isHovered || reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered, reviews.length]);

  if (!restaurant || reviews.length === 0) return null;

  return (
    <div
      className="restaurant-review-slider-wrap"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        margin: '6px 0 8px',
        padding: '8px 12px',
        backgroundColor: '#fff7ed',
        borderRadius: '12px',
        border: '1px solid #fed7aa',
        position: 'relative',
        boxShadow: '0 1px 4px rgba(234, 88, 12, 0.06)',
        userSelect: 'none',
      }}
    >
      {/* Top Header Row with Title & Rating */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#ea580c',
              color: '#ffffff',
            }}
          >
            <MessageSquareHeart size={12} />
          </span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
            Customer Reviews
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: '#c2410c',
              backgroundColor: '#ffffff',
              padding: '1px 6px',
              borderRadius: '999px',
              border: '1px solid #fed7aa',
            }}
          >
            ⭐ {restaurant.rating.toFixed(1)} ({reviews.length} Verified)
          </span>
        </div>

        {/* Indicator Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {reviews.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              style={{
                width: currentIndex === idx ? '14px' : '5px',
                height: '5px',
                borderRadius: '999px',
                backgroundColor: currentIndex === idx ? '#ea580c' : '#fed7aa',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              title={`Review ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Overflow Hidden Viewport for Smooth Slide Track */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '10px',
        }}
      >
        {/* Slides Track Ribbon */}
        <div
          style={{
            display: 'flex',
            transform: `translateX(-${(currentIndex * 100) / reviews.length}%)`,
            transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
            width: `${reviews.length * 100}%`,
          }}
        >
          {reviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                width: `${100 / reviews.length}%`,
                flexShrink: 0,
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                padding: '8px 12px',
                border: '1px solid #fed7aa',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '52px',
              }}
            >
              {/* Reviewer Header Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '3px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: rev.isUserReview
                        ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
                        : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                  </div>

                  <strong style={{ fontSize: '12px', color: '#0f172a' }}>
                    {rev.userName}
                  </strong>

                  {rev.isUserReview && (
                    <span
                      style={{
                        fontSize: '9px',
                        backgroundColor: '#ffedd5',
                        color: '#c2410c',
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <Sparkles size={9} /> You
                    </span>
                  )}

                  {rev.verified && (
                    <span
                      style={{
                        fontSize: '9px',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircle2 size={10} /> Verified
                    </span>
                  )}
                </div>

                {/* Star Rating & Relative Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={11}
                        fill={star <= Math.round(rev.rating) ? '#f59e0b' : 'none'}
                        stroke={star <= Math.round(rev.rating) ? '#f59e0b' : '#cbd5e1'}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                    {rev.date}
                  </span>
                </div>
              </div>

              {/* Review Comment Quote */}
              <p
                style={{
                  fontSize: '12px',
                  color: '#334155',
                  lineHeight: '1.35',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
