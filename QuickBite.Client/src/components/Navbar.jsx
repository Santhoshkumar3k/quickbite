import React, { useState, useEffect } from 'react';
import { Home, MapPin, Search, ShoppingBag, Clock, ChevronDown, Check, User } from 'lucide-react';
import BurgerBiteIcon from './BurgerBiteIcon';

const BLR_LOCALITIES = [
  'Indiranagar, Bengaluru',
  'Koramangala 5th Block, Bengaluru',
  'HSR Layout Sector 3, Bengaluru',
  'Whitefield Tech Hub, Bengaluru',
  'Jayanagar 4th Block, Bengaluru',
  'Church Street & MG Road, Bengaluru',
  'Malleshwaram 7th Cross, Bengaluru',
  'Electronic City Phase 1, Bengaluru'
];

export default function Navbar({
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  onOpenHistory,
  onResetView,
  currentUser,
  onOpenProfile,
}) {
  const [currentLocation, setCurrentLocation] = useState('Indiranagar, Bengaluru');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const handleLogoClick = () => {
    if (onResetView) onResetView();
  };

  // Try to detect customer location via Browser Geolocation API on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Fetch reverse geocoding from free Nominatim OpenStreetMap API
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            if (res.ok) {
              const data = await res.json();
              const suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || 'Bengaluru';
              const city = data.address?.city || data.address?.state_district || 'Bengaluru';
              setCurrentLocation(`${suburb}, ${city}`);
            }
          } catch (e) {
            // fallback stays on default Indiranagar
          }
        },
        () => {
          // Permission denied / timeout -> fallback to default
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const handleSelectLocation = (loc) => {
    setCurrentLocation(loc);
    setShowLocationPicker(false);
  };

  const handleDetectGPS = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            if (res.ok) {
              const data = await res.json();
              const suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.road || 'Current Location';
              const city = data.address?.city || 'Bengaluru';
              setCurrentLocation(`${suburb}, ${city}`);
              setShowLocationPicker(false);
            }
          } catch (err) {
            alert('Could not determine address from GPS coordinates.');
          } finally {
            setIsLocating(false);
          }
        },
        () => {
          setIsLocating(false);
          alert('Location access denied or unavailable. You can select your area manually.');
        }
      );
    } else {
      setIsLocating(false);
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Left Section: Logo in leftmost corner, followed by enlarged Home button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Brand Logo in the leftmost corner */}
          <div
            className="brand-wrap"
            onClick={handleLogoClick}
            title="QuickBite Home"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <img
              src="/logo.jpg"
              alt="QuickBite"
              className="navbar-brand-logo"
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
                border: '2.5px solid #ffffff',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            />
          </div>

          {/* Small Compact Home Drawing Button */}
          <button
            onClick={handleLogoClick}
            title="Back to Home"
            aria-label="Back to Home"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#fff7ed',
              border: '1.5px solid #fdba74',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(234, 88, 12, 0.12)',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ea580c';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = '#ea580c';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff7ed';
              e.currentTarget.style.color = '#ea580c';
              e.currentTarget.style.borderColor = '#fdba74';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Home size={16} strokeWidth={2.2} />
          </button>
        </div>

        {/* Dynamic Location Pill with Dropdown Selector */}
        <div style={{ position: 'relative' }}>
          <div
            className="location-pill"
            style={{ cursor: 'pointer', userSelect: 'none', padding: '6px 12px' }}
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            title="Click to change delivery location"
          >
            <MapPin size={15} color="#ea580c" />
            <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
              {currentLocation}
            </span>
            <ChevronDown size={14} color="#64748b" />
          </div>

          {showLocationPicker && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '280px',
                backgroundColor: 'var(--white)',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 100,
                padding: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                  Choose Location
                </span>
                <button
                  onClick={handleDetectGPS}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isLocating ? 'Detecting...' : '📍 Use GPS'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '220px', overflowY: 'auto' }}>
                {BLR_LOCALITIES.map((loc) => (
                  <div
                    key={loc}
                    onClick={() => handleSelectLocation(loc)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: currentLocation === loc ? 'var(--primary-light)' : 'transparent',
                      color: currentLocation === loc ? 'var(--primary)' : 'var(--slate-700)',
                      fontWeight: currentLocation === loc ? 700 : 500,
                    }}
                  >
                    <span>{loc}</span>
                    {currentLocation === loc && <Check size={14} color="#ea580c" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Food Search */}
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search Meghana biryani, Truffles burgers, Mandi, rolls..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Clean Nav Actions: User Profile, Orders & Cart */}
        <div className="nav-actions">
          {currentUser && (
            <button
              className="nav-btn nav-btn-outline"
              onClick={onOpenProfile}
              title="Click to view profile, wallet & referral code"
              style={{ borderColor: '#fed7aa', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <User size={15} color="#ea580c" />
              <span style={{ maxWidth: '95px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700 }}>
                {currentUser.name}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#ea580c', color: '#ffffff', padding: '1px 6px', borderRadius: '999px', boxShadow: '0 1px 3px rgba(234, 88, 12, 0.3)' }}>
                ₹{currentUser.walletBalance || 0}
              </span>
            </button>
          )}

          <button className="nav-btn nav-btn-outline" onClick={onOpenHistory}>
            <Clock size={16} />
            <span>Orders</span>
          </button>

          <button className="nav-btn nav-btn-primary" onClick={onOpenCart}>
            <ShoppingBag size={18} />
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
