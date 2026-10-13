import React from 'react';

export default function BurgerBiteIcon({ size = 26, color = '#ffffff' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Bun with Bite Mark on Right */}
      <path
        d="M8 22C8 14.268 14.268 8 22 8C26.1 8 29.8 9.77 32.36 12.6C30.5 13.5 29.2 15.4 29.2 17.6C29.2 20.6 31.6 23 34.6 23C36.1 23 37.4 22.4 38.4 21.4C39.4 22.8 40 24.5 40 26.5C40 27.3 39.9 28 39.7 28.7H8.3C8.1 28 8 27.3 8 26.5V22Z"
        fill={color}
      />
      {/* Sesame Seeds */}
      <circle cx="16" cy="14" r="1.5" fill="#ea580c" opacity="0.6" />
      <circle cx="22" cy="12" r="1.5" fill="#ea580c" opacity="0.6" />
      <circle cx="20" cy="17" r="1.5" fill="#ea580c" opacity="0.6" />
      <circle cx="26" cy="15" r="1.5" fill="#ea580c" opacity="0.6" />

      {/* Lettuce Layer with Wavy Edge */}
      <path
        d="M6 29C7 27.5 9 27.5 10 29C11 30.5 13 30.5 14 29C15 27.5 17 27.5 18 29C19 30.5 21 30.5 22 29C23 27.5 25 27.5 26 29C27 30.5 29 30.5 30 29C31 27.5 33 27.5 34 29C35 30.5 37 30.5 38 29C39 27.5 41 27.5 42 29V31H6V29Z"
        fill="#22c55e"
      />

      {/* Melted Cheese Triangle */}
      <path
        d="M7 31H41L36 36L28 34L20 37L7 31Z"
        fill="#eab308"
      />

      {/* Savory Patty */}
      <rect
        x="6"
        y="33"
        width="36"
        height="5"
        rx="2.5"
        fill="#78350f"
      />

      {/* Bottom Bun */}
      <path
        d="M8 39H40C40 43.4 36.4 47 32 47H16C11.6 47 8 43.4 8 39Z"
        fill={color}
      />
    </svg>
  );
}
