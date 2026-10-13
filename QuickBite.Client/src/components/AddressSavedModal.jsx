import React, { useEffect, useState } from 'react';
import { CheckCircle2, Home, Briefcase, MapPin, Sparkles, X, ArrowRight } from 'lucide-react';

export default function AddressSavedModal({ isOpen, onClose, savedData }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      // Auto-dismiss after 3.8 seconds if user doesn't click
      const timer = setTimeout(() => {
        handleDismiss();
      }, 3800);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  if (!isOpen && !visible) return null;

  const isHome = savedData?.activeAddressType === 'HOME' || (!savedData?.activeAddressType && savedData?.homeAddress);
  const activeAddr = savedData?.address || (isHome ? savedData?.homeAddress : savedData?.workAddress) || 'Address saved';

  return (
    <div
      className="modal-overlay"
      onClick={handleDismiss}
      style={{
        zIndex: 100005,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeInOverlay 0.25s ease-out forwards',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '430px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '28px 24px 24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          animation: 'popInBouncy 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        }}
      >
        {/* Top Accent Ribbon */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #10b981 100%)',
          }}
        />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
        >
          <X size={16} color="#64748b" />
        </button>

        {/* Pulsing Animated Success Icon */}
        <div style={{ position: 'relative', width: '84px', height: '84px', margin: '0 auto 16px' }}>
          {/* Outer glow ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              animation: 'pulseRing 2s infinite ease-in-out',
            }}
          />
          {/* Inner circle */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)',
            }}
          >
            <CheckCircle2 size={46} strokeWidth={2.5} />
          </div>
        </div>

        {/* Heading & Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ecfdf5', color: '#047857', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '8px' }}>
          <Sparkles size={13} />
          <span>ADDRESS UPDATED SUCCESSFULLY</span>
        </div>

        <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          Address Saved!
        </h3>

        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 18px', lineHeight: '1.4' }}>
          Your delivery address has been securely saved and is ready for instant checkout.
        </p>

        {/* Saved Address Summary Card */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '16px',
            padding: '14px 16px',
            textAlign: 'left',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 800,
                color: isHome ? '#0284c7' : '#7c3aed',
                backgroundColor: isHome ? '#e0f2fe' : '#ede9fe',
                padding: '3px 10px',
                borderRadius: '8px',
              }}
            >
              {isHome ? <Home size={12} /> : <Briefcase size={12} />}
              {isHome ? 'Saved as Home' : 'Saved as Work'}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ● Active for Orders
            </span>
          </div>

          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', lineHeight: '1.5', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <MapPin size={16} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ wordBreak: 'break-word' }}>{activeAddr}</span>
          </div>

          {savedData?.name && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0', fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
              <span>Recipient: <strong>{savedData.name}</strong></span>
              {savedData.phone && <span>Phone: <strong>{savedData.phone}</strong></span>}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleDismiss}
          className="btn-checkout"
          style={{
            width: '100%',
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <span>Continue to Order Food</span>
          <ArrowRight size={16} />
        </button>

        {/* Animations CSS */}
        <style>{`
          @keyframes popInBouncy {
            0% {
              opacity: 0;
              transform: scale(0.7) translateY(24px);
            }
            60% {
              opacity: 1;
              transform: scale(1.04) translateY(-4px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          @keyframes pulseRing {
            0% {
              transform: scale(0.95);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.3;
            }
            100% {
              transform: scale(0.95);
              opacity: 0.8;
            }
          }
          @keyframes fadeInOverlay {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
