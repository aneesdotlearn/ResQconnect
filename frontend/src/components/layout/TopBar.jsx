import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="glass-navbar px-4 md:px-6 h-16 flex items-center justify-between flex-shrink-0">
      <div className="md:hidden w-8" />
      <div />
      <div className="flex items-center gap-2">
        <Link to="/notifications" className="relative p-2 rounded-xl text-charcoal/60 hover:bg-white/40 transition-colors">
          <Bell size={20} />
        </Link>
      </div>
    </header>
  );
}