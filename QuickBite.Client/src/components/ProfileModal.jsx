import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Home,
  Briefcase,
  Check,
  LogOut,
  Save,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { updateUserProfile, deleteUserAccount, generateReferralCode } from '../services/api';

export default function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  onDeleteAccount,
  onSaveSuccess,
}) {
  if (!isOpen || !currentUser) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [workAddress, setWorkAddress] = useState('');
  const [activeAddressType, setActiveAddressType] = useState('HOME');

  const [validationError, setValidationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setHomeAddress(currentUser.homeAddress || currentUser.address || '');
      setWorkAddress(currentUser.workAddress || '');
      setActiveAddressType(currentUser.activeAddressType || 'HOME');
      setValidationError('');
      setShowDeleteConfirm(false);
      setIsDeleting(false);
    }
  }, [isOpen, currentUser]);

  const handleSelectAddress = (type) => {
    setActiveAddressType(type);
  };

  const handleSave = async (e) => {
    e?.preventDefault();

    if (!name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setValidationError('Please enter your contact phone number.');
      return;
    }

    const trimmedHome = homeAddress.trim();
    const trimmedWork = workAddress.trim();

    let currentActive = activeAddressType;
    let selectedAddress = '';

    if (currentActive === 'HOME' && trimmedHome) {
      selectedAddress = trimmedHome;
    } else if (currentActive === 'WORK' && trimmedWork) {
      selectedAddress = trimmedWork;
    } else if (trimmedHome) {
      selectedAddress = trimmedHome;
      currentActive = 'HOME';
    } else if (trimmedWork) {
      selectedAddress = trimmedWork;
      currentActive = 'WORK';
    }

    const updated = {
      ...currentUser,
      name: name.trim(),
      phone: phone.trim(),
      address: selectedAddress,
      homeAddress: trimmedHome,
      workAddress: trimmedWork,
      activeAddressType: currentActive,
      referralCode: generateReferralCode(name.trim(), phone.trim()),
    };

    try {
      setIsSaving(true);
      if (currentUser.phone) {
        await updateUserProfile(currentUser.phone, {
          name: updated.name,
          address: updated.address,
          homeAddress: updated.homeAddress,
          workAddress: updated.workAddress,
          activeAddressType: updated.activeAddressType,
        }).catch((err) => console.warn('Could not sync user update to DB:', err));
      }

      localStorage.setItem('quickbite_user', JSON.stringify(updated));
      onUpdateUser(updated);
      onClose();

      if (onSaveSuccess) {
        onSaveSuccess(updated);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const userPhone = currentUser.phone || phone;
      if (userPhone) {
        await deleteUserAccount(userPhone).catch((err) => console.error('Error deleting from DB:', err));
      }

      if (onDeleteAccount) {
        onDeleteAccount();
      } else {
        localStorage.removeItem('quickbite_user');
        onLogout();
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div
      className="profile-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflow: 'hidden',
      }}
      onClick={onClose}
    >
      <div
        className="profile-modal-card"
        style={{
          width: '100%',
          maxWidth: '470px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            padding: '14px 18px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                color: '#ea580c',
                fontSize: '15px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                border: '2px solid #ffedd5',
                flexShrink: 0,
              }}
            >
              {getInitials(name)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  {name || 'My Profile'}
                </h3>
                <span style={{ fontSize: '9.5px', backgroundColor: '#ffffff', color: '#ea580c', padding: '1px 6px', borderRadius: '999px', fontWeight: 800 }}>
                  ACTIVE
                </span>
              </div>
              <p style={{ margin: '1px 0 0', fontSize: '11.5px', color: '#fed7aa' }}>
                📱 +91 {phone}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Wallet Cash Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '11.5px',
                fontWeight: 800,
                color: '#fed7aa',
              }}
            >
              <Wallet size={13} color="#fed7aa" />
              <span>₹{currentUser.walletBalance || 0}</span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                transition: 'background 0.15s ease',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Form Body - Compact & Non-scrollable */}
        <div style={{ padding: '14px 18px 16px', backgroundColor: '#ffffff' }}>
          {validationError && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '5px 8px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '8px',
              }}
            >
              <AlertCircle size={13} />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {/* Name & Phone in 2 compact columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    required
                    style={{
                      width: '100%',
                      height: '34px',
                      paddingLeft: '28px',
                      paddingRight: '6px',
                      fontSize: '12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
                  Mobile Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit phone"
                    required
                    style={{
                      width: '100%',
                      height: '34px',
                      paddingLeft: '28px',
                      paddingRight: '6px',
                      fontSize: '12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Addresses Cards (Home & Work) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#1e293b' }}>
                  Delivery Addresses
                </span>
                <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 700 }}>
                  Click to select default
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* 1. HOME ADDRESS */}
                <div
                  onClick={() => handleSelectAddress('HOME')}
                  style={{
                    border: activeAddressType === 'HOME' ? '2px solid #ea580c' : '1px solid #cbd5e1',
                    backgroundColor: activeAddressType === 'HOME' ? '#fff7ed' : '#ffffff',
                    borderRadius: '8px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Home size={13} color={activeAddressType === 'HOME' ? '#ea580c' : '#64748b'} />
                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a' }}>
                        Home Address
                      </span>
                    </div>
                    {activeAddressType === 'HOME' ? (
                      <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#ea580c', backgroundColor: '#fed7aa', padding: '1px 5px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Check size={10} strokeWidth={3} /> Active
                      </span>
                    ) : (
                      <span style={{ fontSize: '9.5px', color: '#94a3b8' }}>Select</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Enter home flat/street/locality address"
                    style={{
                      width: '100%',
                      height: '28px',
                      padding: '2px 6px',
                      fontSize: '11.5px',
                      borderRadius: '5px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </div>

                {/* 2. WORK ADDRESS */}
                <div
                  onClick={() => handleSelectAddress('WORK')}
                  style={{
                    border: activeAddressType === 'WORK' ? '2px solid #ea580c' : '1px solid #cbd5e1',
                    backgroundColor: activeAddressType === 'WORK' ? '#fff7ed' : '#ffffff',
                    borderRadius: '8px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Briefcase size={13} color={activeAddressType === 'WORK' ? '#ea580c' : '#64748b'} />
                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a' }}>
                        Work / Office Address
                      </span>
                    </div>
                    {activeAddressType === 'WORK' ? (
                      <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#ea580c', backgroundColor: '#fed7aa', padding: '1px 5px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Check size={10} strokeWidth={3} /> Active
                      </span>
                    ) : (
                      <span style={{ fontSize: '9.5px', color: '#94a3b8' }}>Select</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={workAddress}
                    onChange={(e) => setWorkAddress(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Enter office building/tech park address"
                    style={{
                      width: '100%',
                      height: '28px',
                      padding: '2px 6px',
                      fontSize: '11.5px',
                      borderRadius: '5px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions: Save, Logout, Delete Account */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  flex: 1,
                  height: '38px',
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  boxShadow: '0 4px 10px rgba(234, 88, 12, 0.2)',
                }}
              >
                <Save size={14} />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
                title="Log out from this session"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  height: '38px',
                  padding: '0 10px',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '9px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
                title="Permanently delete account from database"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Popup for Account Deletion */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            zIndex: 100005,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '22px',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              animation: 'modalSlideUp 0.2s ease-out',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <AlertTriangle size={26} />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Delete Account?
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: '1.45', margin: '0 0 18px' }}>
              Are you sure you want to delete your account? This will permanently delete your user profile and history completely from the database.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                style={{
                  height: '38px',
                  borderRadius: '9px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{
                  height: '38px',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
