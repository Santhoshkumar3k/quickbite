import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Utensils, Pizza, Soup, Salad, Fish, Cake, ChevronDown, Check, X, Sparkles } from 'lucide-react';
import VegNonVegSlider from './VegNonVegSlider';

const CATEGORIES = [
  { id: 'All', name: 'All Cuisines', icon: LayoutGrid },
  { id: 'Burgers', name: 'Burgers', icon: Utensils },
  { id: 'Pizza', name: 'Pizza & Pasta', icon: Pizza },
  { id: 'Biryani', name: 'Biryani', icon: Soup },
  { id: 'Healthy', name: 'Healthy Bowls', icon: Salad },
  { id: 'Japanese', name: 'Japanese & Ramen', icon: Fish },
  { id: 'Desserts', name: 'Desserts & Bakes', icon: Cake },
];

export default function CategoryFilter({
  activeCategory,
  onSelectCategory,
  dietFilter = 'BOTH',
  onDietChange,
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsMobileOpen(false);
      }
    };
    if (isMobileOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isMobileOpen]);

  const activeCatObj = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];
  const ActiveIcon = activeCatObj.icon;

  return (
    <section className="category-section">
      {/* ========================================================
          1. DESKTOP VIEW (Visible on larger screens > 640px)
          ======================================================== */}
      <div className="desktop-category-view">
        <div
          className="category-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Popular Cuisines</span>
          </div>

          {/* 3-Way Veg / Both (Default) / Non-Veg Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <VegNonVegSlider value={dietFilter} onChange={onDietChange} />
          </div>
        </div>

        <div className="category-pills">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                className={`category-pill ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                <Icon size={16} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          2. MOBILE NAVBAR FILTER BAR (Active on mobile screens <= 640px)
          ======================================================== */}
      <div className="mobile-category-view" ref={dropdownRef}>
        <div className="mobile-filter-nav-bar">
          {/* Cuisines Dropdown Toggle Button */}
          <button
            type="button"
            className={`mobile-cuisine-nav-btn ${activeCategory !== 'All' ? 'is-filtered' : ''}`}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-expanded={isMobileOpen}
            title="Click to choose food category / cuisine"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
              <div className="mobile-cuisine-icon-badge">
                <ActiveIcon size={14} />
              </div>
              <span className="mobile-cuisine-label">
                {activeCatObj.name}
              </span>
            </div>
            <ChevronDown
              size={15}
              style={{
                transform: isMobileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.22s ease',
                flexShrink: 0,
                color: activeCategory !== 'All' ? '#ea580c' : '#64748b',
              }}
            />
          </button>

          {/* Compact 3-way Veg / Both / Non-Veg Slider */}
          <div style={{ flexShrink: 0 }}>
            <VegNonVegSlider value={dietFilter} onChange={onDietChange} compact={true} />
          </div>
        </div>

        {/* Expandable Mobile Cuisines Dropdown Panel */}
        {isMobileOpen && (
          <div className="mobile-category-dropdown-panel">
            <div className="mobile-dropdown-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} color="#ea580c" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Choose Cuisine
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeCategory !== 'All' && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory('All');
                      setIsMobileOpen(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '11px',
                      color: '#ea580c',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '2px 6px',
                    }}
                  >
                    Reset All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="mobile-category-grid">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`mobile-category-chip ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      setIsMobileOpen(false);
                    }}
                  >
                    <Icon size={14} />
                    <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.name}
                    </span>
                    {isActive && <Check size={13} style={{ flexShrink: 0, marginLeft: '4px' }} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
