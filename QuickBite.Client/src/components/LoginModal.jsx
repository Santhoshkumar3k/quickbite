import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Sparkles,
  X,
  ArrowRight,
  LogIn,
  UserPlus,
  AlertCircle,
  Gift,
  Zap,
  UtensilsCrossed,
  ShieldCheck
} from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

export default function LoginModal({ isOpen, onCompleteLogin, canClose = false, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setIsLoading(true);
      const user = await loginUser(cleanPhone);
      localStorage.setItem('quickbite_user', JSON.stringify(user));
      onCompleteLogin(user);
    } catch (err) {
      setError(err.message || 'Account not found. Please switch to New User to sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setIsLoading(true);
      const user = await registerUser({
        name: cleanName,
        phone: cleanPhone,
        address: address.trim(),
        homeAddress: address.trim(),
        workAddress: '',
        activeAddressType: address.trim() ? 'HOME' : '',
        referralCode: referralCode.trim(),
      });
      localStorage.setItem('quickbite_user', JSON.stringify(user));
      onCompleteLogin(user);
    } catch (err) {
      setError(err.message || 'Registration failed. Try logging in if you already have an account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="login-overlay-container"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#fff4eb',
        backgroundImage: 'linear-gradient(180deg, #fff7ed 0%, #ffeedd 260px, #fff4eb 100%)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflow: 'auto',
      }}
    >
      <div
        className="login-content-wrapper"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '48px',
          maxWidth: '900px',
          width: '100%',
        }}
      >
        {/* LEFT SIDE: Prominent QuickBite Logo & Brand Showcase */}
        <div
          className="login-brand-side"
          style={{
            flex: '1',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '10px',
          }}
        >
          {/* Logo with warm badge border & glow */}
          <div
            style={{
              position: 'relative',
              width: '170px',
              height: '170px',
              borderRadius: '50%',
              padding: '6px',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              boxShadow: '0 20px 40px rgba(234, 88, 12, 0.35)',
              marginBottom: '18px',
            }}
          >
            <img
              src="/logo.jpg"
              alt="QuickBite Logo"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #ffffff',
                display: 'block',
              }}
            />
          </div>

          <h1
            style={{
              fontSize: '32px',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.8px',
              margin: '0 0 6px',
            }}
          >
            Quick<span style={{ color: '#ea580c' }}>Bite</span>
          </h1>

          <p
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#c2410c',
              margin: '0 0 12px',
            }}
          >
            Bengaluru’s Favorite Food Delivery
          </p>

          <p
            style={{
              fontSize: '13px',
              color: '#64748b',
              lineHeight: '1.5',
              margin: '0 0 18px',
              maxWidth: '320px',
            }}
          >
            Hot & fresh food from 22+ iconic kitchens like Meghana Foods, Truffles, Nagarjuna & more.
          </p>

          {/* Value Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '300px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                backgroundColor: '#ffffff',
                borderRadius: '999px',
                border: '1px solid #fed7aa',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
              }}
            >
              <Zap size={14} color="#ea580c" />
              <span>⚡ 25 Mins Superfast Delivery</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                backgroundColor: '#ffffff',
                borderRadius: '999px',
                border: '1px solid #fed7aa',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
              }}
            >
              <UtensilsCrossed size={14} color="#ea580c" />
              <span>🍔 22+ Iconic Bengaluru Kitchens</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Compact Login / Sign Up Popup Card */}
        <div
          className="login-card-side"
          style={{
            flex: '1',
            maxWidth: '410px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1.5px solid #fed7aa',
            boxShadow: '0 25px 50px -12px rgba(234, 88, 12, 0.22), 0 10px 25px -5px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {canClose && (
            <button
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 10,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease',
              }}
            >
              <X size={17} color="#475569" />
            </button>
          )}

          {/* Card Top Strip */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              padding: '16px 20px 14px',
              color: '#ffffff',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0, letterSpacing: '-0.3px' }}>
              {activeTab === 'login' ? 'Welcome Back!' : 'Create an Account'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#ffedd5', opacity: 0.95 }}>
              {activeTab === 'login'
                ? 'Enter your mobile number to log in'
                : 'Sign up to start placing delicious orders'}
            </p>
          </div>

          {/* Tab Switcher: Log In vs New User */}
          <div style={{ padding: '12px 18px 0', backgroundColor: '#ffffff' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                backgroundColor: '#f1f5f9',
                borderRadius: '12px',
                padding: '4px',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: activeTab === 'login' ? '#ffffff' : 'transparent',
                  color: activeTab === 'login' ? '#ea580c' : '#64748b',
                  boxShadow: activeTab === 'login' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <LogIn size={15} />
                <span>Log In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: activeTab === 'register' ? '#ffffff' : 'transparent',
                  color: activeTab === 'register' ? '#ea580c' : '#64748b',
                  boxShadow: activeTab === 'register' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <UserPlus size={15} />
                <span>New User</span>
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div style={{ padding: '14px 18px 18px', backgroundColor: '#ffffff' }}>
            {error && (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '10px',
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {activeTab === 'login' ? (
              /* TAB 1: EXISTING USER LOGIN */
              <form onSubmit={handlePhoneLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Mobile Number
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#475569',
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    >
                      <Phone size={14} color="#94a3b8" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit number"
                      autoFocus
                      required
                      style={{
                        width: '100%',
                        height: '42px',
                        paddingLeft: '68px',
                        paddingRight: '12px',
                        fontSize: '14px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        outline: 'none',
                        backgroundColor: '#f8fafc',
                      }}
                    />
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>
                    Enter registered mobile to log in immediately.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    height: '42px',
                    backgroundColor: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                    marginTop: '2px',
                  }}
                >
                  {isLoading ? (
                    <span>Logging in...</span>
                  ) : (
                    <>
                      <span>Log In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ea580c',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    New user? Create a QuickBite account
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: NEW USER SIGN UP */
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '2px' }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      autoFocus
                      required
                      style={{
                        width: '100%',
                        height: '36px',
                        paddingLeft: '32px',
                        paddingRight: '10px',
                        fontSize: '12.5px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        outline: 'none',
                        backgroundColor: '#f8fafc',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '2px' }}>
                    Mobile Number *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        color: '#475569',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      <Phone size={13} color="#94a3b8" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit number"
                      required
                      style={{
                        width: '100%',
                        height: '36px',
                        paddingLeft: '62px',
                        paddingRight: '10px',
                        fontSize: '12.5px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        outline: 'none',
                        backgroundColor: '#f8fafc',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '2px' }}>
                    Delivery Address (Optional)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 12th Main, Indiranagar"
                      style={{
                        width: '100%',
                        height: '36px',
                        paddingLeft: '32px',
                        paddingRight: '10px',
                        fontSize: '12.5px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        outline: 'none',
                        backgroundColor: '#f8fafc',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                      Referral Code (Optional)
                    </label>
                    <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 700 }}>
                      +₹100 Wallet Cash
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Gift size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#ea580c' }} />
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="Friend's code (e.g. SAND552) or REFER200"
                      style={{
                        width: '100%',
                        height: '36px',
                        paddingLeft: '32px',
                        paddingRight: '10px',
                        fontSize: '12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        outline: 'none',
                        backgroundColor: '#f8fafc',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    height: '40px',
                    backgroundColor: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                    marginTop: '2px',
                  }}
                >
                  {isLoading ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <span>Register & Continue</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ea580c',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Already registered? Log in here
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
