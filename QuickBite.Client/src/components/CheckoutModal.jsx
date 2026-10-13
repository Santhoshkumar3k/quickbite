import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Banknote,
  Lock,
  ArrowLeft,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Tag,
  Sparkles,
  ChevronRight,
  MapPin,
  Check,
  Wallet,
  Laptop,
  Cog,
  Construction,
  Wrench,
} from 'lucide-react';
import { fetchOrders, deductUserWallet } from '../services/api';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  restaurant,
  onConfirmOrder,
  isPlacingOrder,
  currentUser,
  pastOrders = [],
}) {
  if (!isOpen) return null;

  // Multi-step modal state: 'ADDRESS' -> 'PAYMENT' -> 'OTP' / 'UPI'
  const [step, setStep] = useState('ADDRESS');

  // Customer & Delivery Address details
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(
    currentUser?.address || currentUser?.homeAddress || currentUser?.workAddress || ''
  );

  // Coupon / Promo Code state
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [shakeCoupon, setShakeCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [recentCopiedCode, setRecentCopiedCode] = useState('');

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [selectedCardType, setSelectedCardType] = useState('');
  const [cardNumber, setCardNumber] = useState('4532 8912 7734 8892');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || '');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('742');

  // Verification Sub-screens
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const [upiTimer, setUpiTimer] = useState(299);
  const [isUpiVerifying, setIsUpiVerifying] = useState(false);

  // Sync user details and copied coupon on open
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setCustomerName(currentUser.name);
      if (currentUser.phone) setPhone(currentUser.phone);
      const userAddr = currentUser.address || currentUser.homeAddress || currentUser.workAddress || '';
      if (userAddr) setAddress(userAddr);
      if (currentUser.name) setCardHolder(currentUser.name);
    }

    const copied =
      sessionStorage.getItem('quickbite_copied_coupon') ||
      localStorage.getItem('quickbite_copied_coupon');
    if (copied) {
      setRecentCopiedCode(copied);
    }
  }, [currentUser, isOpen]);

  // UPI countdown timer
  useEffect(() => {
    let interval = null;
    if (step === 'UPI' && upiTimer > 0) {
      interval = setInterval(() => {
        setUpiTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, upiTimer]);

  // Wallet deduction state
  const [useWallet, setUseWallet] = useState(false);

  // Pricing calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.price + (item.modifierAdditionalPrice || 0)) * item.quantity,
    0
  );
  const baseDeliveryFee = restaurant?.deliveryFee || 35;
  const isFreeDelivery = appliedCoupon?.code === 'FREEDEL';
  const deliveryFee = isFreeDelivery ? 0 : baseDeliveryFee;
  const tax = Math.round(subtotal * 0.05); // 5% GST

  // Calculate discount amount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.code === 'FREEDEL') {
      discountAmount = baseDeliveryFee;
    } else {
      discountAmount = appliedCoupon.discount || 0;
    }
  }

  const initialTotal = subtotal + baseDeliveryFee + tax;
  const totalAfterCoupon = Math.max(Math.round(initialTotal - discountAmount), 0);

  // Wallet deduction
  const userWalletBalance = Number(currentUser?.walletBalance) || 0;
  const walletApplied = useWallet ? Math.min(userWalletBalance, totalAfterCoupon) : 0;
  const finalTotal = Math.max(Math.round(totalAfterCoupon - walletApplied), 0);

  // STEP 1: Address submission -> Proceed to Payment
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Customer name is required.');
      return;
    }
    if (!phone.trim()) {
      alert('Contact phone number is required.');
      return;
    }
    if (!address.trim()) {
      alert('Delivery address is mandatory. Please provide or select an address.');
      return;
    }

    setStep('PAYMENT');
  };

  // Coupon validation engine
  const triggerCouponError = (errMsg) => {
    setCouponError(errMsg);
    setShakeCoupon(false);
    setTimeout(() => {
      setShakeCoupon(true);
    }, 15);
    setTimeout(() => {
      setShakeCoupon(false);
    }, 550);
  };

  const handleApplyCoupon = async (codeToTest) => {
    const code = (codeToTest || couponInput).trim().toUpperCase();
    setCouponError('');

    if (!code) {
      triggerCouponError('Please enter a coupon code.');
      return;
    }

    // 1. FIRST100: First order only! Check prior order history
    if (code === 'FIRST100') {
      // First check past orders count: if count is NOT 0, reject immediately!
      let orderCount = Array.isArray(pastOrders) ? pastOrders.length : 0;

      try {
        const userPhone = (phone || currentUser?.phone || '').trim();
        if (userPhone) {
          const userOrders = await fetchOrders(userPhone);
          if (Array.isArray(userOrders) && userOrders.length > 0) {
            orderCount = Math.max(orderCount, userOrders.length);
          }
        }
        // Also verify all orders from server
        const allOrders = await fetchOrders();
        if (Array.isArray(allOrders) && allOrders.length > 0) {
          orderCount = Math.max(orderCount, allOrders.length);
        }
      } catch (e) {
        // Use available pastOrders count
      }

      if (orderCount > 0) {
        triggerCouponError('FIRST100 is valid only on your first order.');
        return;
      }

      if (subtotal < 249) {
        triggerCouponError('FIRST100 requires minimum order of ₹249.');
        return;
      }

      setAppliedCoupon({
        code: 'FIRST100',
        discount: 100,
        title: 'Flat ₹100 First Order Discount',
      });
      setCouponInput('');
      return;
    }

    // 2. TASTY70: Min order ₹500
    if (code === 'TASTY70') {
      if (subtotal < 500) {
        triggerCouponError('TASTY70 requires minimum order of ₹500.');
        return;
      }

      setAppliedCoupon({
        code: 'TASTY70',
        discount: 70,
        title: 'Flat ₹70 Gourmet Savings',
      });
      setCouponInput('');
      return;
    }

    // 3. FREEDEL: Free express delivery (Min order ₹199)
    if (code === 'FREEDEL') {
      if (subtotal < 199) {
        triggerCouponError('FREEDEL requires minimum order of ₹199.');
        return;
      }

      setAppliedCoupon({
        code: 'FREEDEL',
        discount: baseDeliveryFee,
        title: '100% Free Express Delivery',
      });
      setCouponInput('');
      return;
    }

    // 4. NIGHT50: 50% off late night cravings (10:00 PM to 6:00 AM only!)
    if (code === 'NIGHT50') {
      const currentHour = new Date().getHours();
      const isLateNight = currentHour >= 22 || currentHour < 6;
      if (!isLateNight) {
        triggerCouponError('NIGHT50 is valid only between 10:00 PM and 6:00 AM.');
        return;
      }

      if (subtotal < 199) {
        triggerCouponError('NIGHT50 requires minimum order of ₹199.');
        return;
      }

      const disc = Math.min(Math.round(subtotal * 0.5), 120);
      setAppliedCoupon({
        code: 'NIGHT50',
        discount: disc,
        title: '50% Late Night Discount (Up to ₹120)',
      });
      setCouponInput('');
      return;
    }

    // 5. FEAST40: 40% off weekend feast (Sat/Sun) or group feast above ₹499
    if (code === 'FEAST40') {
      const dayOfWeek = new Date().getDay(); // 0 is Sunday, 6 is Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (!isWeekend && subtotal < 499) {
        triggerCouponError('FEAST40 is valid on weekends or orders above ₹499.');
        return;
      }

      const disc = Math.min(Math.round(subtotal * 0.4), 150);
      setAppliedCoupon({
        code: 'FEAST40',
        discount: disc,
        title: '40% Feast Discount (Up to ₹150)',
      });
      setCouponInput('');
      return;
    }

    // Referral codes are applied to Wallet cash, not as checkout promo coupons
    const isUserReferralCode = currentUser?.referralCode && code === currentUser.referralCode.toUpperCase();
    const isReferralCodeFormat = /^[A-Z]{4}\d{3}$/.test(code) && code !== 'NIGHT50' && code !== 'FEAST40';
    if (code === 'REFER200' || isUserReferralCode || isReferralCodeFormat) {
      triggerCouponError('Referral rewards are added directly to your Wallet. Toggle "Use Wallet Cash" below to deduct from your bill!');
      return;
    }

    // 5. NIGHT50: 50% off late night cravings (10:00 PM to 6:00 AM only!)
    // Invalid code
    triggerCouponError('Invalid coupon code.');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // STEP 2: Final Payment Submit
  const [comingSoonType, setComingSoonType] = useState('UPI'); // 'UPI' or 'CUSTOM_CARD'

  const handleCloseComingSoon = () => {
    if (comingSoonType === 'CUSTOM_CARD') {
      setSelectedCardType('');
    }
    setStep('PAYMENT');
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    if (paymentMethod === 'CARD') {
      if (!selectedCardType) {
        alert('Please select a card from the dropdown to continue.');
        return;
      }
      if (selectedCardType === 'CUSTOM_CARD') {
        setComingSoonType('CUSTOM_CARD');
        setStep('COMING_SOON');
        return;
      }
      // Instant Test Card -> Proceed to OTP simulation
      setStep('OTP');
      setOtpError('');
      setEnteredOtp('');
    } else if (paymentMethod === 'UPI') {
      setComingSoonType('UPI');
      setStep('COMING_SOON');
    } else {
      // Cash on Delivery
      submitOrder('COD');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (enteredOtp.trim() !== '111111') {
      setOtpError('Incorrect OTP. Please enter 111111 to authorize test payment.');
      return;
    }

    setOtpError('');
    submitOrder('CARD');
  };

  const handleSimulateUpiSuccess = () => {
    setIsUpiVerifying(true);
    setTimeout(() => {
      setIsUpiVerifying(false);
      submitOrder('UPI');
    }, 1200);
  };

  const submitOrder = async (methodUsed) => {
    // If wallet deduction is selected and applicable, deduct from DB in real time
    if (walletApplied > 0 && currentUser?.phone) {
      try {
        await deductUserWallet(currentUser.phone, walletApplied);
      } catch (err) {
        console.warn('Could not deduct wallet in DB:', err);
      }
    }

    onConfirmOrder({
      restaurantId: restaurant.id,
      customerName,
      phone,
      deliveryAddress: address,
      paymentMethod: finalTotal === 0 ? 'WALLET' : (methodUsed || paymentMethod),
      couponCode: appliedCoupon?.code || '',
      discountAmount: (discountAmount || 0) + walletApplied,
      totalAmount: finalTotal,
      items: cartItems.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        selectedModifiers: item.selectedModifiers || '',
        modifierAdditionalPrice: item.modifierAdditionalPrice || 0,
      })),
    });
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="modal-overlay"
      onClick={step === 'COMING_SOON' ? handleCloseComingSoon : onClose}
      style={{ zIndex: 100000 }}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '540px',
          padding: step === 'COMING_SOON' ? '20px' : '26px',
          overflow: step === 'COMING_SOON' ? 'hidden' : 'auto',
          maxHeight: '94vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================
            SUB-SCREEN 3: BANK 3D-SECURE 2.0 CARD OTP SCREEN
            ======================================================== */}
        {step === 'OTP' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => setStep('PAYMENT')}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--slate-600)', fontSize: '13px', fontWeight: 700 }}
              >
                <ArrowLeft size={16} /> Back to Payment
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#1e40af', backgroundColor: '#dbeafe', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                <Lock size={12} /> 3D-Secure 2.0 Gateway
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '10px 0 16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--slate-900)' }}>
                Bank OTP Authorization
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--slate-500)', marginTop: '4px' }}>
                Authorizing <strong>₹{finalTotal}</strong> to <strong>QuickBite</strong>
              </p>
              {discountAmount > 0 && (
                <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 800, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', marginTop: '4px' }}>
                  🎉 Saved ₹{discountAmount} with {appliedCoupon?.code}
                </div>
              )}
            </div>

            {/* Prominent Helper Box */}
            <div
              style={{
                backgroundColor: '#fff7ed',
                border: '1.5px dashed #ea580c',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                textAlign: 'center',
                marginBottom: '18px',
              }}
            >
              <span style={{ fontSize: '12px', color: '#9a3412', fontWeight: 600 }}>
                Demo Verification Code:
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#ea580c', letterSpacing: '4px', marginTop: '2px' }}>
                111111
              </div>
              <span style={{ fontSize: '11px', color: '#c2410c' }}>
                👉 Enter <strong>111111</strong> in the field below to complete payment
              </span>
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '6px' }}>
                    Enter 6-Digit SMS OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="Enter 111111"
                    className="search-input"
                    value={enteredOtp}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value);
                      if (otpError) setOtpError('');
                    }}
                    style={{
                      paddingLeft: '16px',
                      fontSize: '20px',
                      fontWeight: 800,
                      letterSpacing: '6px',
                      textAlign: 'center',
                      borderRadius: 'var(--radius-sm)',
                      borderColor: otpError ? '#ef4444' : 'var(--slate-300)',
                    }}
                    required
                  />
                  {otpError && (
                    <p style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700, marginTop: '6px', textAlign: 'center' }}>
                      {otpError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-checkout"
                  disabled={isPlacingOrder}
                  style={{ marginTop: '8px' }}
                >
                  {isPlacingOrder ? 'Processing Payment...' : `Confirm & Authorize ₹${finalTotal}`}
                </button>
              </div>
            </form>
          </div>
        ) : step === 'UPI' ? (
          /* ========================================================
             SUB-SCREEN 4: REALISTIC UPI SCAN & PAY SCREEN
             ======================================================== */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setStep('PAYMENT')}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--slate-600)', fontSize: '13px', fontWeight: 700 }}
              >
                <ArrowLeft size={16} /> Back to Payment
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                <Clock size={12} /> Expiring in {formatTimer(upiTimer)}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--slate-900)' }}>
                Scan UPI QR Code
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--slate-500)', marginTop: '2px' }}>
                Amount to Pay: <strong style={{ color: '#0f172a', fontSize: '16px' }}>₹{finalTotal}</strong>
              </p>
            </div>

            {/* Realistic High-Res Dynamic QR Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                marginBottom: '16px',
                position: 'relative',
              }}
            >
              <div style={{ width: '190px', height: '190px', margin: '0 auto 12px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #0f172a', padding: '6px', backgroundColor: '#ffffff' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=quickbite.orders@okhdfcbank%26pn=QuickBite%20Food%20Delivery%26am=${finalTotal}%26cu=INR`}
                  alt="UPI QR Code"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: '#ecfdf5', color: '#047857' }}>
                  GPay
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: '#ede9fe', color: '#6d28d9' }}>
                  PhonePe
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                  Paytm
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffedd5', color: '#c2410c' }}>
                  BHIM UPI
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn-checkout"
              onClick={handleSimulateUpiSuccess}
              disabled={isUpiVerifying || isPlacingOrder}
            >
              {isUpiVerifying
                ? 'Verifying UPI Gateway Response...'
                : `Confirm Payment (Simulate Approval • ₹${finalTotal})`}
            </button>
          </div>
        ) : step === 'COMING_SOON' ? (
          /* ========================================================
             SUB-SCREEN: FEATURE COMING SOON SCREEN (MATCHES HOME BG & LOGO)
             ======================================================== */
          <div
            style={{
              backgroundImage: 'linear-gradient(180deg, #fff7ed 0%, #ffeedd 140px, #fff4eb 100%)',
              borderRadius: '20px',
              padding: '18px 20px 20px',
              border: '1.5px solid #fed7aa',
              boxShadow: 'inset 0 2px 10px rgba(234, 88, 12, 0.04)',
              textAlign: 'center',
            }}
          >
            {/* Top Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={handleCloseComingSoon}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  color: '#ea580c',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                }}
              >
                <ArrowLeft size={16} /> Back to Payment
              </button>
              <button
                type="button"
                onClick={handleCloseComingSoon}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* QuickBite Brand Logo matching Home Page */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '14px' }}>
              <img
                src="/logo.jpg"
                alt="QuickBite"
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
                  border: '2.5px solid #ffffff',
                }}
              />
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffedd5',
                  color: '#c2410c',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 800,
                  border: '1px solid #fdba74',
                }}
              >
                {comingSoonType === 'UPI' ? <QrCode size={14} /> : <CreditCard size={14} />}
                <span>{comingSoonType === 'UPI' ? 'UPI Scan & Pay' : 'Custom Debit / Credit Card'}</span>
              </div>
            </div>

            {/* IT Team Working Illustration Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #fed7aa',
                borderRadius: '16px',
                padding: '16px 18px 18px',
                margin: '0 auto',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.08)',
              }}
            >
              {/* IT Engineering Team Image - Medium Size */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '350px',
                  height: '145px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1.5px solid #fed7aa',
                  margin: '0 auto 12px',
                  backgroundColor: '#f8fafc',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.07)',
                }}
              >
                <img
                  src="/it_team_working.jpg"
                  alt="IT Team Working On Feature"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>

              {/* Work In Progress Badge */}
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#fff7ed',
                  border: '1.5px solid #fdba74',
                  color: '#ea580c',
                  fontWeight: 800,
                  fontSize: '11.5px',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  marginBottom: '8px',
                }}
              >
                💻 Team Working On It
              </div>

              <p style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', lineHeight: 1.35, marginBottom: '4px' }}>
                This feature will be added soon!
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, maxWidth: '420px', margin: '0 auto' }}>
                {comingSoonType === 'UPI'
                  ? 'Our tech team is actively developing and testing the live UPI QR payment gateway integration. Stay tuned!'
                  : 'Our tech team is actively developing and testing direct debit & credit card payment integration. Stay tuned!'}
              </p>
            </div>
          </div>
        ) : step === 'PAYMENT' ? (
          /* ========================================================
             SCREEN 2: PAYMENT & COUPON / PROMO CODE MODAL
             ======================================================== */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setStep('ADDRESS')}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--slate-600)', fontSize: '13px', fontWeight: 700 }}
              >
                <ArrowLeft size={16} /> Back to Address
              </button>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--slate-900)' }}>
                Payment & Offers
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--slate-500)' }}>
                Delivering to: <strong style={{ color: '#0f172a' }}>{customerName}</strong> • {address.slice(0, 35)}...
              </p>
            </div>

            {/* ====================================================
                PROMO CODE SECTION (TOP OF PAYMENT MODAL)
                ==================================================== */}
            <div
              className={`coupon-wrapper ${couponError ? 'coupon-box-invalid' : ''} ${shakeCoupon ? 'coupon-box-shake' : ''}`}
              style={{
                backgroundColor: couponError ? '#fff9f9' : '#f8fafc',
                border: couponError ? '1.5px solid #fca5a5' : '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '16px',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Tag size={16} color={couponError ? '#f87171' : '#ea580c'} />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  Have a Coupon / Promo Code?
                </span>
              </div>

              {appliedCoupon ? (
                /* Applied Coupon Banner */
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1.5px solid #a7f3d0',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#065f46' }}>
                        {appliedCoupon.code} Applied!
                      </div>
                      <div style={{ fontSize: '11px', color: '#047857' }}>
                        {appliedCoupon.title} (You saved ₹{discountAmount})
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                /* Coupon Input Box */
                <div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className={`search-input ${couponError ? 'coupon-input-invalid' : ''}`}
                      placeholder="Enter code (e.g. FIRST100, TASTY70)"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        if (couponError) setCouponError('');
                      }}
                      style={{
                        paddingLeft: '12px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon(couponInput)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '10px',
                        backgroundColor: '#ea580c',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#b91c1c',
                        backgroundColor: '#fff1f2',
                        border: '1px solid #fecdd3',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <AlertCircle size={14} color="#f43f5e" />
                      <span>{couponError}</span>
                    </div>
                  )}

                  {/* Recently copied from slider banner shortcut */}
                  {recentCopiedCode && !appliedCoupon && (
                    <div
                      style={{
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#fff7ed',
                        border: '1px dashed #fed7aa',
                        borderRadius: '8px',
                        padding: '6px 10px',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: '#9a3412', fontWeight: 600 }}>
                        📋 Copied Code: <strong>{recentCopiedCode}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon(recentCopiedCode)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ea580c',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          padding: '2px 6px',
                        }}
                      >
                        Apply Now →
                      </button>
                    </div>
                  )}

                  {/* Available Codes Quick Chips */}
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                      Available Offers:
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['FIRST100', 'TASTY70', 'FREEDEL', 'NIGHT50', 'FEAST40'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleApplyCoupon(c)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#334155',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ====================================================
                QUICKBITE WALLET CASH SECTION
                ==================================================== */}
            <div
              style={{
                backgroundColor: useWallet ? '#fff7ed' : '#ffffff',
                border: useWallet ? '2px solid #ea580c' : '1.5px solid #fed7aa',
                borderRadius: '14px',
                padding: '12px 16px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: useWallet ? '0 4px 12px rgba(234, 88, 12, 0.12)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: useWallet ? '#ea580c' : '#ffedd5',
                    color: useWallet ? '#ffffff' : '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Wallet size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                      QuickBite Wallet
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        padding: '1px 6px',
                        borderRadius: '999px',
                      }}
                    >
                      Available: ₹{userWalletBalance}
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                    {userWalletBalance > 0
                      ? 'Apply your referral earnings to deduct from this bill'
                      : 'No wallet cash available right now'}
                  </p>
                </div>
              </div>

              {userWalletBalance > 0 ? (
                useWallet ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#ea580c',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
                      }}
                    >
                      <Check size={13} />
                      <span>Applied</span>
                    </div>
                    {/* Small X button to cancel/retrieve wallet cash */}
                    <button
                      type="button"
                      onClick={() => setUseWallet(false)}
                      title="Remove wallet cash from this bill"
                      aria-label="Remove wallet cash"
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fca5a5',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setUseWallet(true)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#ea580c';
                      e.currentTarget.style.color = '#ea580c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.color = '#334155';
                    }}
                  >
                    <span>Use Cash</span>
                  </button>
                )
              ) : (
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>₹0</span>
              )}
            </div>

            {/* ====================================================
                BILL SUMMARY TALLY (REAL-WORLD PRICING DEDUCTION)
                ==================================================== */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: '14px 16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>
                BILL DETAILS
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Item Total</span>
                  <span style={{ fontWeight: 600 }}>₹{Math.round(subtotal)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Partner Fee</span>
                  <span>
                    {isFreeDelivery ? (
                      <span style={{ color: '#059669', fontWeight: 700 }}>FREE (₹{baseDeliveryFee} saved)</span>
                    ) : (
                      `₹${baseDeliveryFee}`
                    )}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Govt. Taxes & Restaurant GST (5%)</span>
                  <span>₹{tax}</span>
                </div>

                {discountAmount > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#059669',
                      fontWeight: 800,
                      backgroundColor: '#ecfdf5',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      margin: '2px -4px',
                    }}
                  >
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}

                {walletApplied > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#ea580c',
                      fontWeight: 800,
                      backgroundColor: '#fff7ed',
                      border: '1px dashed #fed7aa',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      margin: '2px -4px',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Wallet size={13} color="#ea580c" />
                      QuickBite Wallet Cash
                    </span>
                    <span>- ₹{walletApplied}</span>
                  </div>
                )}

                <div
                  style={{
                    borderTop: '1.5px dashed #cbd5e1',
                    marginTop: '6px',
                    paddingTop: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '15px',
                    fontWeight: 900,
                    color: '#0f172a',
                  }}
                >
                  <span>To Pay (Final Bill)</span>
                  <span style={{ fontSize: '17px', color: '#ea580c' }}>
                    {finalTotal === 0 ? '₹0 (Paid with Wallet)' : `₹${finalTotal}`}
                  </span>
                </div>
              </div>
            </div>

            {/* ====================================================
                PAYMENT METHOD SELECTOR
                ==================================================== */}
            <form onSubmit={handlePaymentSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px' }}>
                    Choose Payment Option
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: paymentMethod === 'CARD' ? '2px solid #ea580c' : '1px solid #cbd5e1',
                        backgroundColor: paymentMethod === 'CARD' ? '#fff7ed' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      <CreditCard size={18} color={paymentMethod === 'CARD' ? '#ea580c' : '#64748b'} />
                      <span>Card (OTP)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: paymentMethod === 'UPI' ? '2px solid #ea580c' : '1px solid #cbd5e1',
                        backgroundColor: paymentMethod === 'UPI' ? '#fff7ed' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      <QrCode size={18} color={paymentMethod === 'UPI' ? '#ea580c' : '#64748b'} />
                      <span>Scan UPI QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: paymentMethod === 'COD' ? '2px solid #ea580c' : '1px solid #cbd5e1',
                        backgroundColor: paymentMethod === 'COD' ? '#fff7ed' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      <Banknote size={18} color={paymentMethod === 'COD' ? '#ea580c' : '#64748b'} />
                      <span>Cash on Del.</span>
                    </button>
                  </div>
                </div>

                {/* Card dropdown options if CARD is selected */}
                {paymentMethod === 'CARD' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                      Select Card for Payment
                    </label>
                    <select
                      className="search-input"
                      value={selectedCardType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedCardType(val);
                        if (val === 'CUSTOM_CARD') {
                          setComingSoonType('CUSTOM_CARD');
                          setStep('COMING_SOON');
                        }
                      }}
                      style={{ paddingLeft: '12px', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}
                    >
                      <option value="">-- Select Card --</option>
                      <option value="TEST_CARD">QuickBite Instant Test Card (•••• 8892)</option>
                      <option value="CUSTOM_CARD">Enter Custom Debit / Credit Card</option>
                    </select>

                    {selectedCardType === 'TEST_CARD' && (
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                          color: '#ffffff',
                          padding: '14px',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>
                          <span>PRE-CONFIGURED TEST CARD</span>
                          <span style={{ color: '#38bdf8' }}>VISA PLATINUM</span>
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '2px', fontFamily: 'monospace', marginBottom: '8px' }}>
                          {cardNumber}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <div>
                            <div style={{ color: '#94a3b8', fontSize: '9px' }}>CARDHOLDER</div>
                            <div style={{ fontWeight: 700 }}>{cardHolder || 'Santhosh Kumar'}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <div>
                              <div style={{ color: '#94a3b8', fontSize: '9px' }}>EXPIRES</div>
                              <div style={{ fontWeight: 700 }}>{cardExpiry}</div>
                            </div>
                            <div>
                              <div style={{ color: '#94a3b8', fontSize: '9px' }}>CVV</div>
                              <div style={{ fontWeight: 700 }}>{cardCvv}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-checkout"
                  disabled={isPlacingOrder}
                  style={{ marginTop: '6px' }}
                >
                  {paymentMethod === 'CARD'
                    ? selectedCardType === 'CUSTOM_CARD'
                      ? `Continue with Custom Card (₹${finalTotal})`
                      : `Proceed to Card OTP Verification (₹${finalTotal})`
                    : paymentMethod === 'UPI'
                    ? `Proceed to Scan UPI QR (₹${finalTotal})`
                    : `Place Cash on Delivery Order (₹${finalTotal})`}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ========================================================
             SCREEN 1: DELIVERY ADDRESS & DETAILS MODAL (PAYMENT REMOVED)
             ======================================================== */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Confirm Delivery Address
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>
                  Ordering from <strong>{restaurant?.name}</strong>
                </p>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleProceedToPayment}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Full Name */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Customer Full Name
                  </label>
                  <input
                    type="text"
                    className="search-input"
                    style={{ paddingLeft: '14px', borderRadius: 'var(--radius-sm)' }}
                    value={customerName}
                    placeholder="Enter your name"
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    className="search-input"
                    style={{ paddingLeft: '14px', borderRadius: 'var(--radius-sm)' }}
                    value={phone}
                    placeholder="Enter 10-digit mobile number"
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Delivery Address */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--slate-700)' }}>
                      Delivery Address *
                    </label>
                    {/* Quick switch pills if home or work addresses exist in profile */}
                    {(currentUser?.homeAddress || currentUser?.workAddress) && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {currentUser?.homeAddress && (
                          <button
                            type="button"
                            onClick={() => setAddress(currentUser.homeAddress)}
                            style={{
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: 700,
                              borderRadius: 'var(--radius-sm)',
                              border: address === currentUser.homeAddress ? '1px solid #ea580c' : '1px solid #cbd5e1',
                              backgroundColor: address === currentUser.homeAddress ? '#fff7ed' : '#ffffff',
                              color: address === currentUser.homeAddress ? '#ea580c' : '#475569',
                              cursor: 'pointer',
                            }}
                          >
                            🏠 Home
                          </button>
                        )}
                        {currentUser?.workAddress && (
                          <button
                            type="button"
                            onClick={() => setAddress(currentUser.workAddress)}
                            style={{
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: 700,
                              borderRadius: 'var(--radius-sm)',
                              border: address === currentUser.workAddress ? '1px solid #ea580c' : '1px solid #cbd5e1',
                              backgroundColor: address === currentUser.workAddress ? '#fff7ed' : '#ffffff',
                              color: address === currentUser.workAddress ? '#ea580c' : '#475569',
                              cursor: 'pointer',
                            }}
                          >
                            💼 Work
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <textarea
                    className="search-input"
                    style={{ paddingLeft: '14px', borderRadius: 'var(--radius-sm)', minHeight: '65px', resize: 'vertical' }}
                    value={address}
                    placeholder="Enter complete house/flat no., street, locality, Bengaluru"
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                {/* Summary Pill */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    Cart: <strong>{cartItems.length} items</strong>
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    Est. Total: ₹{initialTotal}
                  </span>
                </div>

                {/* Action button leading to Payment & Coupon popup */}
                <button
                  type="submit"
                  className="btn-checkout"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '4px',
                  }}
                >
                  <span>Proceed to Payment & Offers</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
