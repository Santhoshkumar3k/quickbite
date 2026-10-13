import React, { useState } from 'react';
import { X, Star, Clock, MapPin, Plus, SlidersHorizontal, AlertCircle } from 'lucide-react';
import VegNonVegSlider from './VegNonVegSlider';
import RestaurantReviewSlider from './RestaurantReviewSlider';

export default function MenuModal({
  restaurant,
  onClose,
  onAddToCart,
  onOpenModifiers,
}) {
  const [localDietFilter, setLocalDietFilter] = useState('BOTH');

  if (!restaurant) return null;

  const filteredItems = (restaurant.menuItems || []).filter((item) => {
    if (localDietFilter === 'VEG') return item.isVeg;
    if (localDietFilter === 'NON_VEG') return !item.isVeg;
    return true; // BOTH
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Banner with close button */}
        <div className="modal-header-banner">
          <img src={restaurant.bannerUrl} alt={restaurant.name} />
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Restaurant metadata */}
        <div className="modal-info">
          <h2 className="modal-restaurant-title">{restaurant.name}</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '14px', marginTop: '4px' }}>
            {restaurant.cuisine}
          </p>

          <div className="modal-pills-row">
            <div className="modal-meta-pill">
              <Star size={13} fill="#fbbf24" stroke="none" />
              <span><strong>{restaurant.rating.toFixed(1)}</strong> ({restaurant.reviewCount}+ reviews)</span>
            </div>
            <div className="modal-meta-pill">
              <Clock size={13} color="#ea580c" />
              <span>{restaurant.deliveryMinutes} mins</span>
            </div>
            <div className="modal-meta-pill">
              <MapPin size={13} color="#ea580c" />
              <span className="modal-meta-address">{restaurant.address}</span>
            </div>
          </div>

          {/* Customer Reviews & Ratings Carousel Slider */}
          <RestaurantReviewSlider restaurant={restaurant} />
        </div>

        {/* Menu items list */}
        <div className="menu-items-list">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                Menu & Dishes ({filteredItems.length})
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {localDietFilter === 'VEG'
                  ? 'Showing Pure Vegetarian dishes'
                  : localDietFilter === 'NON_VEG'
                  ? 'Showing Non-Vegetarian dishes'
                  : 'Showing complete menu (Veg & Non-Veg)'}
              </span>
            </div>

            {/* In-modal Veg / Both / Non-Veg Slider (Independent from home page) */}
            <VegNonVegSlider value={localDietFilter} onChange={setLocalDietFilter} compact={true} />
          </div>

          {filteredItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                border: '1px dashed #cbd5e1',
                margin: '20px 0',
              }}
            >
              <AlertCircle size={32} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                No {localDietFilter === 'VEG' ? 'vegetarian' : 'non-vegetarian'} dishes found in this restaurant.
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Slide to <strong>"Both"</strong> to explore all available dishes!
              </p>
              <button
                type="button"
                onClick={() => setLocalDietFilter('BOTH')}
                style={{
                  marginTop: '12px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: '#ea580c',
                }}
              >
                Show All Dishes (Both)
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const hasModifiers = item.modifiersJson && item.modifiersJson.length > 5;

              return (
                <div key={item.id} className="menu-item-card">
                  <div className="menu-item-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={item.isVeg ? 'veg-indicator' : 'non-veg-indicator'}></span>
                      {hasModifiers && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#fff7ed',
                            color: '#ea580c',
                            border: '1px solid #ffedd5',
                          }}
                        >
                          Customizable
                        </span>
                      )}
                    </div>
                    <h4 className="menu-item-name">{item.name}</h4>
                    <div className="menu-item-price">₹{Math.round(item.price)}</div>
                    <p className="menu-item-desc">{item.description}</p>
                  </div>

                  <div className="menu-item-action">
                    <div className="menu-item-img-wrap">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        className="menu-item-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = item.isVeg
                            ? 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
                            : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <button
                      className="btn-add-cart"
                      onClick={() => {
                        if (hasModifiers) {
                          onOpenModifiers(item, restaurant);
                        } else {
                          onAddToCart(restaurant, item);
                        }
                      }}
                    >
                      {hasModifiers ? (
                        <>
                          <SlidersHorizontal
                            size={12}
                            style={{ display: 'inline', verticalAlign: '-1px', marginRight: '3px' }}
                          />
                          Custom
                        </>
                      ) : (
                        <>
                          <Plus size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '2px' }} /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
