import React from 'react';
import Logo from './Logo';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark-gradient flex flex-col items-center justify-center gap-5 z-50">
      <div className="relative">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center p-2">
          <Logo size={56} showWordmark={false} />
        </div>
        <div className="absolute -inset-2 border-4 border-accent-500/30 rounded-3xl animate-ping" />
      </div>
      <p className="font-display font-bold text-xl text-white">
        Res<span className="text-accent-500">Q</span>connect
      </p>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-accent-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}