import React from 'react';
import { AlertTriangle, Utensils, X, RefreshCw } from 'lucide-react';

export default function RestaurantConflictModal({
  isOpen,
  onClose,
  currentRestaurant,
  newRestaurant,
  onConfirmReplace,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 100000,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '440px',
          padding: '28px',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          textAlign: 'center',
          position: 'relative',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close icon button */}
        <button
          type="button"
          onClick={onClose}
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
            transition: 'background-color 0.2s ease',
          }}
          title="Cancel"
        >
          <X size={18} color="#64748b" />
        </button>

        {/* Warning Badge Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fff7ed',
            color: '#ea580c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '2px solid #fed7aa',
            boxShadow: '0 8px 20px rgba(234, 88, 12, 0.18)',
          }}
        >
          <Utensils size={30} />
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '19px',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '8px',
            letterSpacing: '-0.3px',
          }}
        >
          Replace Cart Items?
        </h3>

        {/* Detailed user-requested text */}
        <p
          style={{
            fontSize: '14px',
            color: '#475569',
            lineHeight: 1.5,
            marginBottom: '20px',
            padding: '0 6px',
          }}
        >
          Your cart already contains items from{' '}
          <strong style={{ color: '#0f172a' }}>{currentRestaurant?.name}</strong>.
          <br />
          Clear cart and add from{' '}
          <strong style={{ color: '#ea580c' }}>{newRestaurant?.name}</strong>?
        </p>

        {/* Comparison pill */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>
              Current Cart
            </span>
            <span style={{ fontWeight: 700, color: '#334155' }}>{currentRestaurant?.name}</span>
          </div>
          <span style={{ color: '#ea580c', fontWeight: 800 }}>➔</span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>
              New Selection
            </span>
            <span style={{ fontWeight: 700, color: '#ea580c' }}>{newRestaurant?.name}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={onConfirmReplace}
            style={{
              width: '100%',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            <RefreshCw size={16} />
            <span>Clear Cart & Add</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              padding: '11px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
          >
            Keep Existing Cart
          </button>
        </div>
      </div>
    </div>
  );
}
