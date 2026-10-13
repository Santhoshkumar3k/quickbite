import React, { useState, useEffect } from 'react';
import { X, Clock, ChevronRight, Star, CheckCircle2 } from 'lucide-react';
import ReviewOrderModal from './ReviewOrderModal';
import { getOrderReview } from '../services/reviewService';

export default function OrderHistory({ isOpen, onClose, orders, onSelectOrder, currentUser }) {
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [reviewedOrdersMap, setReviewedOrdersMap] = useState({});

  // Load existing reviews for delivered orders
  const refreshOrderReviews = () => {
    if (!orders || orders.length === 0) return;
    const map = {};
    orders.forEach((order) => {
      const rev = getOrderReview(order.id);
      if (rev) {
        map[order.id] = rev;
      }
    });
    setReviewedOrdersMap(map);
  };

  useEffect(() => {
    refreshOrderReviews();
  }, [orders, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content"
          style={{ maxWidth: '640px', padding: '28px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--slate-900)' }}>
                Past Orders
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>
                Your recent orders ({orders.length} total)
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
            >
              <X size={22} />
            </button>
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
              No past orders found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '60vh', overflowY: 'auto' }}>
              {orders.map((order) => {
                const isDelivered = (order.status || '').toLowerCase() === 'delivered';
                const existingReview = reviewedOrdersMap[order.id];

                return (
                  <div
                    key={order.id}
                    style={{
                      backgroundColor: 'var(--slate-50)',
                      border: '1px solid var(--slate-200)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                    onClick={() => {
                      onSelectOrder(order);
                      onClose();
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '15px', color: 'var(--slate-900)' }}>
                          {order.restaurantName}
                        </strong>
                        <span
                          style={{
                            fontSize: '12px',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            fontWeight: 700,
                          }}
                        >
                          #{order.orderNumber}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', color: 'var(--slate-500)', marginTop: '4px' }}>
                        {order.items?.map((i) => `${i.quantity}x ${i.itemName}`).join(', ')}
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--slate-400)', marginTop: '4px' }}>
                        Status:{' '}
                        <strong
                          style={{
                            color: isDelivered ? '#059669' : 'var(--slate-700)',
                          }}
                        >
                          {order.status}
                        </strong>{' '}
                        • Total: <strong style={{ color: 'var(--emerald)' }}>₹{Math.round(order.totalAmount)}</strong>
                      </div>

                      {/* Review Section for Delivered Orders */}
                      {isDelivered && (
                        <div style={{ marginTop: '8px' }}>
                          {existingReview ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  color: '#059669',
                                  backgroundColor: '#ecfdf5',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #a7f3d0',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <CheckCircle2 size={12} />
                                Reviewed ⭐ {existingReview.rating}
                              </span>
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: '#64748b',
                                  fontStyle: 'italic',
                                  maxWidth: '260px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                "{existingReview.comment}"
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReviewingOrder(order);
                              }}
                              style={{
                                padding: '5px 12px',
                                borderRadius: '8px',
                                border: '1px solid #ea580c',
                                backgroundColor: '#fff7ed',
                                color: '#ea580c',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#ea580c';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fff7ed';
                                e.currentTarget.style.color = '#ea580c';
                              }}
                            >
                              <Star size={13} fill="currentColor" />
                              Rate & Review Order
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                      <span>Track</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Order Popup Modal */}
      {reviewingOrder && (
        <ReviewOrderModal
          isOpen={Boolean(reviewingOrder)}
          onClose={() => setReviewingOrder(null)}
          order={reviewingOrder}
          currentUser={currentUser}
          onReviewSubmitted={(orderId, reviewData) => {
            setReviewedOrdersMap((prev) => ({
              ...prev,
              [orderId]: reviewData,
            }));
          }}
        />
      )}
    </>
  );
}
