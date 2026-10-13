import React, { useState } from 'react';
import { X, CheckCircle2, Circle } from 'lucide-react';

export default function ModifierModal({ item, restaurant, onClose, onConfirmAdd }) {
  if (!item) return null;

  let modifierGroups = [];
  try {
    if (item.modifiersJson) {
      modifierGroups = JSON.parse(item.modifiersJson);
    }
  } catch (e) {
    modifierGroups = [];
  }

  // Do NOT pre-select mandatory modifiers - user must select manually
  const initialSelected = {};
  modifierGroups.forEach((group) => {
    initialSelected[group.id] = [];
  });

  const [selectedOptions, setSelectedOptions] = useState(initialSelected);
  const [shakingGroupId, setShakingGroupId] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Toggle or select option
  const handleSelectOption = (group, option) => {
    setValidationError('');
    setShakingGroupId(null);
    if (group.mandatory) {
      // Single selection for mandatory groups
      setSelectedOptions((prev) => ({
        ...prev,
        [group.id]: [option],
      }));
    } else {
      // Multi-selection for optional add-ons
      setSelectedOptions((prev) => {
        const current = prev[group.id] || [];
        const exists = current.some((o) => o.name === option.name);
        const updated = exists
          ? current.filter((o) => o.name !== option.name)
          : [...current, option];
        return { ...prev, [group.id]: updated };
      });
    }
  };

  // Validate all mandatory groups have at least 1 selection
  const unsatisfiedMandatoryGroup = modifierGroups
    .filter((g) => g.mandatory)
    .find((g) => !selectedOptions[g.id] || selectedOptions[g.id].length === 0);

  const allMandatorySatisfied = !unsatisfiedMandatoryGroup;

  // Calculate extra price
  let additionalPrice = 0;
  const modifierSummaryList = [];

  Object.values(selectedOptions).forEach((optionsArray) => {
    optionsArray.forEach((opt) => {
      additionalPrice += opt.price || 0;
      modifierSummaryList.push(opt.name);
    });
  });

  const finalUnitPrice = item.price + additionalPrice;

  const handleAdd = () => {
    // Find ALL unsatisfied mandatory groups
    const missingMandatoryGroups = modifierGroups.filter(
      (g) => g.mandatory && (!selectedOptions[g.id] || selectedOptions[g.id].length === 0)
    );

    if (missingMandatoryGroups.length > 0) {
      // Mark all missing groups for shaking and alert
      const missingIds = missingMandatoryGroups.map((g) => g.id);
      setShakingGroupId(missingIds);
      const names = missingMandatoryGroups.map((g) => `"${g.title}"`).join(', ');
      setValidationError(`Please select mandatory options for: ${names}`);

      // Smooth scroll to the first missing group inside the modal
      const firstElem = document.getElementById(`modifier-group-${missingMandatoryGroups[0].id}`);
      if (firstElem) {
        firstElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      setTimeout(() => setShakingGroupId(null), 850);
      return;
    }

    onConfirmAdd(restaurant, item, {
      selectedModifiers: modifierSummaryList.join(' • '),
      modifierAdditionalPrice: additionalPrice,
      unitPrice: finalUnitPrice,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '520px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={item.isVeg ? 'veg-indicator' : 'non-veg-indicator'}></span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--slate-900)' }}>
                {item.name}
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 700, marginTop: '4px' }}>
              Base: ₹{Math.round(item.price)}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Validation Warning Alert */}
        {validationError && (
          <div
            style={{
              marginBottom: '14px',
              padding: '8px 12px',
              backgroundColor: '#fef2f2',
              border: '1.5px solid #f87171',
              borderRadius: '10px',
              color: '#b91c1c',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>⚠️ {validationError}</span>
          </div>
        )}

        {/* Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '4px' }}>
          {modifierGroups.map((group) => {
            const currentSelected = selectedOptions[group.id] || [];
            const isSatisfied = !group.mandatory || currentSelected.length > 0;
            const isShaking = Array.isArray(shakingGroupId)
              ? shakingGroupId.includes(group.id)
              : shakingGroupId === group.id;

            return (
              <div
                key={group.id}
                id={`modifier-group-${group.id}`}
                className={isShaking ? 'coupon-box-shake' : ''}
                style={{
                  backgroundColor: !isSatisfied && validationError ? '#fff5f5' : 'var(--slate-50)',
                  border: !isSatisfied && validationError
                    ? '2px solid #ef4444'
                    : isSatisfied
                    ? '1.5px solid var(--slate-200)'
                    : '1.5px solid #fed7aa',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  transition: 'all 0.25s ease',
                  boxShadow: !isSatisfied && validationError ? '0 0 0 3px rgba(239, 68, 68, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--slate-900)' }}>
                    {group.title}
                  </h4>
                  {group.mandatory ? (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: !isSatisfied && validationError ? '#ef4444' : '#fee2e2',
                        color: !isSatisfied && validationError ? '#ffffff' : '#dc2626',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Mandatory · Choose 1
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--slate-500)' }}>
                      Optional
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {group.options?.map((opt) => {
                    const isSelected = currentSelected.some((o) => o.name === opt.name);

                    return (
                      <div
                        key={opt.name}
                        onClick={() => handleSelectOption(group, opt)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--white)',
                          border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--slate-200)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {isSelected ? (
                            <CheckCircle2 size={16} color="#ea580c" />
                          ) : (
                            <Circle size={16} color="#94a3b8" />
                          )}
                          <span style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--primary)' : 'var(--slate-800)' }}>
                            {opt.name}
                          </span>
                        </div>

                        {opt.price > 0 && (
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate-600)' }}>
                            +₹{Math.round(opt.price)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Add CTA - Always enabled, validates with shake & alerts on click */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--slate-200)' }}>
          <button
            className="btn-checkout"
            onClick={handleAdd}
            style={{
              opacity: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.28)',
            }}
          >
            <span>Add to Cart</span>
            <span>•</span>
            <span>₹{Math.round(finalUnitPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
