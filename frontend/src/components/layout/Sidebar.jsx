import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '@/store/slices/authSlice';
import {
  LayoutDashboard, AlertTriangle, MapPin, Users, FileText,
  Shield, CreditCard, BarChart2, Bell, LogOut, Menu, X
} from 'lucide-react';
import clsx from 'clsx';
import Logo from '@/components/ui/Logo';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sos', icon: AlertTriangle, label: 'SOS Alert', highlight: true },
  { to: '/tracking', icon: MapPin, label: 'Live Tracking' },
  { to: '/contacts', icon: Users, label: 'Emergency Contacts' },
  { to: '/incidents', icon: FileText, label: 'Incidents' },
  { to: '/zones', icon: Shield, label: 'Safe Zones' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/subscription', icon: CreditCard, label: 'Subscription' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/40">
        <Logo size={32} showWordmark={false} />
        <span className="font-display font-bold text-lg text-charcoal">
          Res<span className="text-accent-500">Q</span>connect
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, highlight }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-accent-500/10 text-accent-600 backdrop-blur-sm'
                : highlight
                  ? 'text-accent-500 hover:bg-white/40'
                  : 'text-charcoal/70 hover:bg-white/40 hover:text-charcoal'
            )}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/40">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-accent-50 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-accent-600 font-bold text-xs">{user?.name?.slice(0, 2).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-charcoal truncate">{user?.name}</p>
            <p className="text-xs text-charcoal/50 truncate">{user?.subscription?.plan || 'Free'} plan</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-charcoal/70 hover:bg-white/40 hover:text-charcoal transition-all duration-150">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button className="md:hidden fixed top-4 left-4 z-50 p-2 glass-panel rounded-xl"
        onClick={() => setOpen(!open)}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && <div className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />}

      <div className={clsx('md:hidden fixed inset-y-0 left-0 z-50 w-64 glass-panel rounded-none transform transition-transform duration-300', open ? 'translate-x-0' : '-translate-x-full')}>
        <SidebarContent />
      </div>

      <div className="hidden md:flex w-64 glass-panel rounded-none border-y-0 border-l-0 flex-col flex-shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}