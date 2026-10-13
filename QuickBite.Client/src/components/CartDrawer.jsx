import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  restaurant,
  onUpdateQuantity,
  onClearCart,
  onOpenCheckout,
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? (restaurant?.deliveryFee || 35) : 0;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + deliveryFee + tax;

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <div>
            <h3 className="cart-drawer-title">Your Order</h3>
            {restaurant && (
              <p style={{ fontSize: '13px', color: 'var(--slate-500)', marginTop: '2px' }}>
                from <strong>{restaurant.name}</strong>
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {cartItems.length > 0 && onClearCart && (
              <button
                type="button"
                className="btn-clear-cart"
                onClick={onClearCart}
                title="Remove all items from cart"
              >
                Clear Cart
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍔</div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--slate-800)' }}>Your cart is empty</h4>
            <p style={{ fontSize: '14px', color: 'var(--slate-500)', marginTop: '6px' }}>
              Explore tasty dishes and add them to your cart!
            </p>
          </div>
        ) : (
          <>
            <div className="cart-items-container">
              {cartItems.map((item) => {
                const itemKey = item.cartId || item.id;
                return (
                  <div key={itemKey} className="cart-item-row">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="cart-item-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="cart-item-details">
                      <div className="cart-item-name">{item.name}</div>
                      {item.selectedModifiers && (
                        <div style={{ fontSize: '11px', color: 'var(--slate-500)', marginTop: '2px', lineHeight: '1.2' }}>
                          {item.selectedModifiers}
                        </div>
                      )}
                      <div className="cart-item-price">₹{Math.round(item.price * item.quantity)}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className="quantity-control">
                        <button
                          type="button"
                          className="qty-btn"
                          title={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                          onClick={() => onUpdateQuantity(itemKey, item.quantity - 1)}
                        >
                          {item.quantity === 1 ? <Trash2 size={13} color="#ef4444" /> : <Minus size={13} />}
                        </button>
                        <span className="qty-number">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          title="Increase quantity"
                          onClick={() => onUpdateQuantity(itemKey, item.quantity + 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Dedicated Direct Delete Button */}
                      <button
                        type="button"
                        className="btn-item-delete"
                        title="Delete item"
                        onClick={() => onUpdateQuantity(itemKey, 0)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  color: '#ea580c',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
              >
                <Plus size={15} /> Add more items from menu
              </button>
            </div>

            <div className="cart-bill-section">
              <div className="bill-row">
                <span>Subtotal</span>
                <span>₹{Math.round(subtotal)}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Fee</span>
                <span>₹{Math.round(deliveryFee)}</span>
              </div>
              <div className="bill-row">
                <span>Govt Taxes & GST (5%)</span>
                <span>₹{Math.round(tax)}</span>
              </div>
              <div className="bill-row total">
                <span>Total Amount</span>
                <span>₹{Math.round(total)}</span>
              </div>

              <button className="btn-checkout" onClick={onOpenCheckout}>
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

