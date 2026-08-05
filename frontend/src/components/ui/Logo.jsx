import React from 'react';

export default function Logo({ size = 40, showWordmark = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.png"
        alt="ResQconnect"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="object-contain shrink-0"
      />
      {showWordmark && (
        <span className="font-display font-bold text-xl text-charcoal tracking-tight">
          Res<span className="text-accent-500">Q</span>connect
        </span>
      )}
    </div>
  );
}