import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '@/store/slices/authSlice';
import {
  LayoutDashboard, AlertTriangle, MapPin, Users, FileText,
  Shield, CreditCard, BarChart2, Bell, LogOut, Menu, X, ChevronDown,
  ChevronLeft, ChevronRight,
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

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  
  const plan = user?.subscription?.plan || 'free';
  const isFree = plan === 'free' || user?.subscription?.status !== 'active';
  


  const SidebarContent = ({ isCollapsed = false }) => (
    <div className="flex flex-col h-full bg-gradient-to-b from-surface-gradientEnd via-surface-gradientstart to-accent-700 hide-scrollbar">
      <div className={clsx('flex items-center gap-3 px-6 py-3.5 border-b border-white/40', isCollapsed && 'justify-center px-0 gap-0')}>
        <Logo size={36} showWordmark={false} />
        {!isCollapsed && (
          <span className="font-display  font-bold text-xl tracking-tight text-white">
            Res<span className="text-accent-500">Q</span>connect
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto hide-scrollbar">
        {NAV_ITEMS.map(({ to, icon: Icon, label, highlight }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)} title={isCollapsed ? label : undefined}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isCollapsed && 'justify-center px-0 gap-0 w-11 h-11 mx-auto',
              isActive
                ? 'bg-accent-500/20 text-accent-600 backdrop-blur-sm shadow-md border border-accent-800/20 shadow-red-700/10 hover:shadow-red-700/10'
                : highlight
                  ? 'text-accent-400 hover:bg-accent-100/40 hover:text-accent-700 hover:backdrop-blur-sm hover:shadow-md hover:border hover:border-accent-800/20'
                  : 'text-white/70 hover:bg-accent-100/40 hover:text-charcoal hover:backdrop-blur-sm hover:shadow-md hover:border hover:border-accent-800/20'
            )}>
            <Icon size={18} />
            {!isCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/40">
        <div className="flex items-center gap-3 px-3 py-1 mb-1">
          {/* <div className="w-8 h-8 bg-accent-50 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-accent-600 font-bold text-xs">{user?.name?.slice(0, 2).toUpperCase()}</span>
          </div> */}
          <div className="min-w-0">
                      <button onClick={() => navigate('/profile')} title={isCollapsed ? user?.name : undefined} className={clsx('flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl', isCollapsed && 'pl-0 pr-0 gap-0 justify-center w-11')}>
            <span className="w-8 h-8 bg-accent-100/80 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-accent-600 font-bold text-xs">{user?.name?.slice(0, 1).toUpperCase() || 'U'}</span>
            </span>
            {!isCollapsed && (
            <span className="hidden md:block text-left">
              <span className="block text-sm font-semibold text-charcoal leading-tight">{user?.name?.split(' ')[0] || 'Account'}</span>
              <span className="block text-xs text-charcoal/40 leading-tight capitalize">{plan} Plan</span>
            </span>
            )}
            {/* <ChevronDown size={14} className="text-charcoal/40 hidden md:block" /> */}
          </button>
          </div>
        </div>
        <button onClick={handleLogout} title={isCollapsed ? 'Sign Out' : undefined}
          className={clsx('flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-accent-800 hover:bg-white/40 hover:text-accent-800 transition-all duration-150', isCollapsed && 'justify-center gap-0 px-0 w-11 mx-auto')}>
          <LogOut size={18} />
          {!isCollapsed && 'Sign Out'}
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

      <div className={clsx('hidden md:flex glass-panel rounded-none border-y-0 border-l-0 flex-col flex-shrink-0 relative transition-all duration-300', collapsed ? 'w-20' : 'w-72')}>
        <SidebarContent isCollapsed={collapsed} />
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-border rounded-full shadow-md flex items-center justify-center text-charcoal/50 hover:text-accent-600 transition-colors z-10"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>
    </>
  );
}