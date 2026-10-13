import React, { useState, useEffect } from 'react';
import {
  Check,
  Clock,
  Bike,
  ChefHat,
  CheckCircle2,
  Phone,
  RotateCw,
  MapPin,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Search,
  Star
} from 'lucide-react';
import ReviewOrderModal from './ReviewOrderModal';
import { getOrderReview } from '../services/reviewService';

const STEPS = [
  { id: 'Placed', label: 'Order Placed', icon: Check },
  { id: 'Preparing', label: 'Food Preparing', icon: ChefHat },
  { id: 'RiderAssigned', label: 'Rider Assigned', icon: UserCheck },
  { id: 'OutForDelivery', label: 'Out for Delivery', icon: Bike },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrderTracker({ order, onAdvanceStatus, onClose, currentUser }) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    if (order?.id) {
      setExistingReview(getOrderReview(order.id));
    }
  }, [order?.id, order?.status]);
  if (!order) return null;

  const currentStatus = (order.status || 'placed').toLowerCase();

  const currentStepIndex = STEPS.findIndex(
    (s) => s.id.toLowerCase() === currentStatus
  );
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  // Rider details are only revealed AFTER rider is assigned (i.e. RiderAssigned, OutForDelivery, Delivered)
  const isRiderAssigned = activeIndex >= 2;

  const riderName = order.deliveryRiderName || 'Michael R.';
  const riderVehicle = order.deliveryRiderVehicle || 'Honda CB 125F - AB 123 CD';
  const riderPhone = order.deliveryRiderPhone || '+91 98450 12345';

  const progressPercent = (activeIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="tracker-container">
      <div className="tracker-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="tracker-title">Live Order Status</h2>
            <span style={{
              fontSize: '11px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: 700
            }}>
              Live Tracking
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--slate-500)', marginTop: '4px' }}>
            Delivering from <strong>{order.restaurantName}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="order-id-badge">Order #{order.orderNumber}</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid var(--slate-200)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* 5-Step Animated Progress Stepper */}
      <div className="stepper-bar">
        <div className="stepper-line" style={{ left: '30px', right: '30px' }}></div>
        <div
          className="stepper-line-active"
          style={{
            left: '30px',
            width: `calc((100% - 60px) * ${progressPercent / 100})`,
            transition: 'width 0.4s ease'
          }}
        ></div>

        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;

          return (
            <div
              key={step.id}
              className={`stepper-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="step-node">
                {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
              </div>
              <span className="step-label" style={{ textAlign: 'center', maxWidth: '80px', fontSize: '12px' }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* DYNAMIC RIDER ASSIGNMENT CARD:
          Shown ONLY once the order reaches "Rider Assigned" (or later)!
          Before that, shows a clean 'Looking for nearby delivery partner' card.
      */}
      {isRiderAssigned ? (
        <div
          className="driver-card"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '2px solid #fdba74',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Status highlight ribbon */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '3px',
            background: 'linear-gradient(90deg, #ea580c, #10b981)'
          }}></div>

          <div className="driver-info">
            <div
              className="driver-avatar"
              style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#ffedd5',
                color: '#ea580c',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.2)'
              }}
            >
              <Bike size={28} />
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff'
              }}>
                <Check size={11} color="#ffffff" strokeWidth={3} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="driver-name" style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                  {riderName}
                </span>
                <span style={{
                  fontSize: '11px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  ⭐ 4.9 • Delivery Partner
                </span>
              </div>

              {/* Vehicle Number & Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#ea580c',
                  backgroundColor: '#fff7ed',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #fed7aa',
                  letterSpacing: '0.5px'
                }}>
                  🏍️ {riderVehicle}
                </span>
              </div>

              {/* Rider Mobile Number with Click to Call */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <a
                  href={`tel:${riderPhone}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#059669',
                    backgroundColor: '#ecfdf5',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    border: '1px solid #a7f3d0',
                    textDecoration: 'none'
                  }}
                  title="Click to call delivery partner"
                >
                  <Phone size={13} />
                  <span>{riderPhone}</span>
                </a>

                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: activeIndex === 2 ? '#ea580c' : activeIndex === 3 ? '#2563eb' : '#059669'
                }}>
                  {activeIndex === 2 && '• Heading to restaurant for pickup'}
                  {activeIndex === 3 && '• Out for Delivery: Rider is en route to your address'}
                  {activeIndex === 4 && '• Delivered at your doorstep'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 700 }}>
                Est. Arrival
              </span>
              <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)' }}>
                {order.status === 'Delivered' ? 'Arrived!' : `${order.estimatedMinutes} mins`}
              </div>
            </div>

            {order.status === 'Delivered' ? (
              <button
                onClick={() => setIsReviewOpen(true)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                }}
                title="Rate and review your delivered food"
              >
                <Star size={14} fill="#ffffff" />
                {existingReview ? `Reviewed ⭐ ${existingReview.rating}` : 'Rate & Review Order'}
              </button>
            ) : (
              <button
                className="btn-advance-status"
                onClick={() => onAdvanceStatus(order.id)}
                title="Step through order stages"
              >
                <RotateCw size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                Advance Stage
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Status Card when rider is NOT yet assigned (Placed / Food Preparing) */
        <div
          className="driver-card"
          style={{
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            padding: '18px 22px'
          }}
        >
          <div className="driver-info">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#e2e8f0',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Search size={22} className="animate-spin-slow" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#334155' }}>
                  Assigning Delivery Partner...
                </span>
                <span style={{
                  fontSize: '11px',
                  backgroundColor: '#fed7aa',
                  color: '#9a3412',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 700
                }}>
                  {activeIndex === 0 ? 'Step 1: Order Placed' : 'Step 2: Kitchen Cooking'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', maxWidth: '420px', lineHeight: '1.4' }}>
                Rider details (Name, vehicle number & mobile) will be displayed once assigned in the next step.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 700 }}>
                Est. Arrival
              </span>
              <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)' }}>
                {order.estimatedMinutes} mins
              </div>
            </div>

            <button
              className="btn-advance-status"
              onClick={() => onAdvanceStatus(order.id)}
              style={{ backgroundColor: '#ffffff', borderColor: '#ea580c', color: '#ea580c', fontWeight: 800 }}
              title="Click to advance status to Rider Assigned"
            >
              <RotateCw size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
              Assign Rider (Next)
            </button>
          </div>
        </div>
      )}

      {/* Order Items & Customer Delivery Details */}
      <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: 'var(--slate-50)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '10px' }}>
            Ordered Items ({order.items?.length || 0})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {order.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <div>
                  <span>{item.quantity}x {item.itemName}</span>
                  {item.selectedModifiers && (
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      ↳ {item.selectedModifiers}
                    </div>
                  )}
                </div>
                <strong>₹{Math.round(item.subtotal)}</strong>
              </div>
            ))}
            <div style={{ borderTop: '1px dashed var(--slate-300)', paddingTop: '8px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800 }}>
              <span>Total Paid ({order.paymentMethod})</span>
              <span style={{ color: 'var(--emerald)' }}>₹{Math.round(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--slate-50)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color="#ea580c" /> Delivery Details
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--slate-700)', lineHeight: '1.5' }}>
            <strong>Recipient:</strong> {order.customerName} ({order.phone})<br />
            <strong>Address:</strong> {order.deliveryAddress}
          </p>
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--slate-500)' }}>
            Order ID: <strong>{order.orderNumber}</strong> • Confirmed & Verified
          </div>
        </div>
      </div>

      {/* Review Modal for Live Order Tracker */}
      <ReviewOrderModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        order={order}
        currentUser={currentUser}
        onReviewSubmitted={(orderId, reviewData) => {
          setExistingReview(reviewData);
        }}
      />
    </div>
  );
}
