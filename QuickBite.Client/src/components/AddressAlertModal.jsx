import React from 'react';
import { MapPin, AlertCircle, ArrowRight, X } from 'lucide-react';

export default function AddressAlertModal({ isOpen, onClose, onAddAddress }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100000 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '460px',
          padding: '28px',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          textAlign: 'center',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
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
          }}
        >
          <X size={18} color="#64748b" />
        </button>

        {/* Attention Icon */}
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
            boxShadow: '0 8px 16px rgba(234, 88, 12, 0.15)',
          }}
        >
          <MapPin size={32} />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Delivery Address Mandatory
        </h3>

        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '22px' }}>
          You have items ready in your cart, but you cannot proceed to the payment section without a delivery address. Please add your <strong>Home</strong> or <strong>Work</strong> address in your profile to continue.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => {
              onClose();
              onAddAddress();
            }}
            className="btn-checkout"
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>Add Delivery Address in Profile</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            Cancel & Return to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
