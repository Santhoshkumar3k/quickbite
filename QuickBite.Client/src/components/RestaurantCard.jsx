import React from 'react';
import { Star, Clock, MapPin } from 'lucide-react';

// Distance in km based on restaurant ID & delivery time
const getDistanceKm = (r) => {
  if (r.distanceKm) return `${r.distanceKm} km`;
  const km = (1.2 + ((r.id * 7 + (r.deliveryMinutes || 25)) % 45) / 10).toFixed(1);
  return `${km} km`;
};

export default function RestaurantCard({ restaurant, onClick }) {
  const isPureVeg = restaurant.menuItems?.length > 0 && restaurant.menuItems.every((m) => m.isVeg);
  const vegFallback = 'https://images.unsplash.com/photo-1788621879512-0aefb7a774ff?w=800&auto=format&fit=crop&q=80';
  const defaultFallback = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="restaurant-card" onClick={onClick}>
      <div className="card-image-wrap">
        <img
          src={restaurant.bannerUrl || (isPureVeg ? vegFallback : defaultFallback)}
          alt={restaurant.name}
          className="card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = isPureVeg ? vegFallback : defaultFallback;
          }}
        />
        <div className="rating-badge">
          <Star size={13} fill="#fbbf24" stroke="none" />
          <span>{restaurant.rating.toFixed(1)}</span>
        </div>
        <div className="time-badge">
          <Clock size={12} color="#ea580c" />
          <span>{restaurant.deliveryMinutes} mins</span>
        </div>
        {restaurant.menuItems?.length > 0 && restaurant.menuItems.every((m) => m.isVeg) && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              backgroundColor: 'rgba(22, 163, 74, 0.92)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            <span>🌱 Pure Veg</span>
          </div>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-title">{restaurant.name}</h3>
        <p className="card-cuisine">{restaurant.cuisine}</p>

        <div className="card-footer">
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--slate-700)', fontWeight: 700, fontSize: '13px' }}>
            <MapPin size={14} color="#ea580c" />
            <span>{getDistanceKm(restaurant)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
