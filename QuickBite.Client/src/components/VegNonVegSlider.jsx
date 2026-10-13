import React from 'react';

export default function VegNonVegSlider({ value = 'BOTH', onChange, compact = false }) {
  const isVeg = value === 'VEG';
  const isBoth = value === 'BOTH';
  const isNonVeg = value === 'NON_VEG';

  return (
    <div
      className="veg-slider-container"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: compact ? '4px' : '6px',
          backgroundColor: '#f8fafc',
          borderRadius: '100px',
          padding: '3px 4px',
          border: '1.5px solid #e2e8f0',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Option 1: Pure Veg */}
        <button
          type="button"
          onClick={() => onChange('VEG')}
          title="Filter Vegetarian dishes only"
          style={{
            border: 'none',
            outline: 'none',
            padding: compact ? '3px 8px' : '4px 10px',
            borderRadius: '100px',
            backgroundColor: isVeg ? '#16a34a' : 'transparent',
            boxShadow: isVeg ? '0 2px 6px rgba(22, 163, 74, 0.35)' : 'none',
            color: isVeg ? '#ffffff' : '#15803d',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: compact ? '10.5px' : '11.5px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            transition: 'all 0.18s ease',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              border: `1.2px solid ${isVeg ? '#ffffff' : '#16a34a'}`,
              borderRadius: '2px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isVeg ? 'rgba(255,255,255,0.2)' : '#ffffff',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                backgroundColor: isVeg ? '#ffffff' : '#16a34a',
              }}
            />
          </span>
          <span>Veg</span>
        </button>

        {/* Option 2: Both (Background color strictly for this text only with clean spacing) */}
        <button
          type="button"
          onClick={() => onChange('BOTH')}
          title="Show both Vegetarian and Non-Vegetarian"
          style={{
            border: 'none',
            outline: 'none',
            padding: compact ? '3px 9px' : '4px 11px',
            borderRadius: '100px',
            backgroundColor: isBoth ? '#334155' : 'transparent',
            boxShadow: isBoth ? '0 2px 6px rgba(51, 65, 85, 0.25)' : 'none',
            color: isBoth ? '#ffffff' : '#64748b',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: compact ? '10.5px' : '11.5px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            transition: 'all 0.18s ease',
          }}
        >
          <span>Both</span>
        </button>

        {/* Option 3: Non-Veg */}
        <button
          type="button"
          onClick={() => onChange('NON_VEG')}
          title="Filter Non-Vegetarian dishes"
          style={{
            border: 'none',
            outline: 'none',
            padding: compact ? '3px 8px' : '4px 10px',
            borderRadius: '100px',
            backgroundColor: isNonVeg ? '#dc2626' : 'transparent',
            boxShadow: isNonVeg ? '0 2px 6px rgba(220, 38, 38, 0.35)' : 'none',
            color: isNonVeg ? '#ffffff' : '#dc2626',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: compact ? '10.5px' : '11.5px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            transition: 'all 0.18s ease',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              border: `1.2px solid ${isNonVeg ? '#ffffff' : '#dc2626'}`,
              borderRadius: '2px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isNonVeg ? 'rgba(255,255,255,0.2)' : '#ffffff',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 0,
                height: 0,
                borderLeft: '2.5px solid transparent',
                borderRight: '2.5px solid transparent',
                borderBottom: `4px solid ${isNonVeg ? '#ffffff' : '#dc2626'}`,
              }}
            />
          </span>
          <span>Non-Veg</span>
        </button>
      </div>
    </div>
  );
}
