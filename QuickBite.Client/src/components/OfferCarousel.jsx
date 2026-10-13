import React, { useState, useEffect } from 'react';
import { Copy, Check, Tag, Sparkles } from 'lucide-react';
import { generateReferralCode } from '../services/api';

export default function OfferCarousel({ currentUser }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const activeUser = currentUser || (() => {
    try {
      const saved = localStorage.getItem('quickbite_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const userReferralCode = activeUser
    ? (activeUser.referralCode || generateReferralCode(activeUser.name, activeUser.phone))
    : 'REFER200';

  const offers = [
    {
      id: 1,
      title: 'Flat ₹100 OFF',
      subtitle: 'On your first order above ₹249',
      code: 'FIRST100',
      tag: 'FIRST ORDER',
      gradient: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      accent: '#ffedd5',
    },
    {
      id: 2,
      title: 'Refer & Earn ₹200',
      subtitle: activeUser
        ? `Share your code ${userReferralCode} — friends get ₹100 & you get ₹200 wallet cash!`
        : 'Get ₹200 wallet cash when your friends join with your code!',
      code: userReferralCode,
      tag: activeUser ? 'YOUR REFERRAL' : 'REFER & EARN',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      accent: '#d1fae5',
    },
    {
      id: 3,
      title: 'Flat ₹70 OFF',
      subtitle: 'On all gourmet orders above ₹500',
      code: 'TASTY70',
      tag: 'MIN ₹500',
      gradient: 'linear-gradient(135deg, #312e81 0%, #3730a3 50%, #4f46e5 100%)',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
      accent: '#e0e7ff',
    },
    {
      id: 4,
      title: '100% Free Express Delivery',
      subtitle: 'Zero delivery fee on all orders today',
      code: 'FREEDEL',
      tag: 'TODAY SPECIAL',
      gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      accent: '#e0f2fe',
    },
    {
      id: 5,
      title: '50% OFF (Up to ₹120)',
      subtitle: 'Midnight cravings from 10 PM onwards',
      code: 'NIGHT50',
      tag: 'LATE NIGHT',
      gradient: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #7c3aed 100%)',
      image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&auto=format&fit=crop&q=80',
      accent: '#ede9fe',
    },
    {
      id: 6,
      title: 'Flat 40% OFF Weekend Feast',
      subtitle: 'Save up to ₹150 on family combo platters',
      code: 'FEAST40',
      tag: 'WEEKEND ONLY',
      gradient: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #db2777 100%)',
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&auto=format&fit=crop&q=80',
      accent: '#fce7f3',
    },
  ];

  // Smooth auto-scroll every 3.8 seconds
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isHovered, offers.length]);

  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    sessionStorage.setItem('quickbite_copied_coupon', code);
    localStorage.setItem('quickbite_copied_coupon', code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <section
      className="offer-carousel-section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        maxWidth: '1280px',
        margin: '8px auto 2px',
        padding: '0 24px',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Slides Track */}
        <div
          style={{
            display: 'flex',
            transform: `translateX(-${(currentIndex * 100) / offers.length}%)`,
            transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
            width: `${offers.length * 100}%`,
          }}
        >
          {offers.map((offer) => {
            const isCopied = copiedCode === offer.code;

            return (
              <div
                key={offer.id}
                className="offer-slide-inner"
                style={{
                  width: `${100 / offers.length}%`,
                  flexShrink: 0,
                  position: 'relative',
                  background: offer.gradient,
                  color: '#ffffff',
                  height: '84px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 24px',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                }}
              >
                {/* Background Food Image blend */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '45%',
                    overflow: 'hidden',
                    pointerEvents: 'none',
                  }}
                >
                  <img
                    src={offer.image}
                    alt={offer.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0.32,
                      filter: 'contrast(120%) saturate(120%)',
                      maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
                      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
                    }}
                  />
                </div>

                {/* Left Offer Details (Compact Horizontal Fit) */}
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  {/* Tag Badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.22)',
                      backdropFilter: 'blur(6px)',
                      color: offer.accent,
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.6px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={11} />
                    <span>{offer.tag}</span>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h3
                      className="offer-slide-title"
                      style={{
                        fontSize: '17px',
                        fontWeight: 900,
                        letterSpacing: '-0.3px',
                        margin: 0,
                        lineHeight: 1.15,
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {offer.title}
                    </h3>
                    <p
                      className="offer-slide-subtitle"
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.92)',
                        fontWeight: 600,
                        margin: '2px 0 0',
                        lineHeight: 1.2,
                      }}
                    >
                      {offer.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right: Coupon Code & 1-Click Copy */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                  }}
                >
                  <div
                    className="offer-slide-code-box"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: 'rgba(0, 0, 0, 0.35)',
                      backdropFilter: 'blur(8px)',
                      border: '1px dashed rgba(255, 255, 255, 0.7)',
                      padding: '5px 10px',
                      borderRadius: '8px',
                    }}
                  >
                    <Tag size={12} color="#ffffff" />
                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)' }}>
                      CODE:
                    </span>
                    <strong
                      style={{
                        fontSize: '12px',
                        letterSpacing: '1px',
                        fontFamily: 'monospace',
                        color: '#ffffff',
                      }}
                    >
                      {offer.code}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="offer-slide-copy-btn"
                    onClick={(e) => handleCopyCode(offer.code, e)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      backgroundColor: isCopied ? '#10b981' : '#ffffff',
                      color: isCopied ? '#ffffff' : '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.18s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isCopied ? (
                      <>
                        <Check size={12} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slim Pagination Indicator Dots */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '7px',
          marginTop: '7px',
        }}
      >
        {offers.map((offer, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={offer.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              title={`Jump to offer ${idx + 1}`}
              style={{
                width: isActive ? '20px' : '7px',
                height: '7px',
                borderRadius: '100px',
                backgroundColor: isActive ? '#ea580c' : '#fdba74',
                border: isActive ? 'none' : '1px solid #fb923c',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? '0 2px 6px rgba(234, 88, 12, 0.35)' : 'none',
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
