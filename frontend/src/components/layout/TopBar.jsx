import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '@/store/slices/authSlice';
import {
  Search, Bell, Sun, Moon, ChevronDown, MapPin,
  ShieldCheck, AlertTriangle, User, LogOut, Zap,
} from 'lucide-react';
import api from '@/lib/api';
import { notificationActions } from '@/store/slices/notificationSlice';

function useGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function useLocationLabel() {
  const { current } = useSelector((s) => s.location);
  const [label, setLabel] = useState(null);

  useEffect(() => {
    if (!current?.coordinates) return;
    const [lng, lat] = current.coordinates;
    const controller = new AbortController();
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((d) => {
        const city = d?.address?.city || d?.address?.town || d?.address?.village || d?.address?.county;
        const state = d?.address?.state;
        if (city && state) setLabel(`${city}, ${state.length > 2 ? state.slice(0, 2).toUpperCase() : state}`);
        else if (city) setLabel(city);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [current?.coordinates]);

  return label;
}

export default function TopBar({ sidebarCollapsed }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const { activeAlert } = useSelector((s) => s.sos);

  const greeting = useGreeting();
  const locationLabel = useLocationLabel();

  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    api.get('/notifications?limit=1').then((r) => {
      dispatch(notificationActions.setNotifications(r.data.data));
    }).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const plan = user?.subscription?.plan || 'free';
  const isFree = plan === 'free' || user?.subscription?.status !== 'active';

  return (
    <header className="glass-navbar px-4 md:px-6 h-16 flex items-center gap-4 flex-shrink-0 z-20 shadow-xl">
      <div className="md:hidden w-8 flex-shrink-0" />

      {sidebarCollapsed && (
        <span className="hidden md:block font-display font-bold text-lg text-charcoal whitespace-nowrap flex-shrink-0">
          Res<span className="text-accent-500">Q</span>connect
        </span>
      )}

      {/* <div className="hidden lg:block flex-shrink-0">
        <p className="text-sm font-semibold text-charcoal leading-tight">
          {greeting}, {user?.name?.split(' ')[0] || 'there'}
        </p>
        <p className="text-xs text-charcoal/50 leading-tight">You are safe. Stay aware.</p>
      </div> */}

      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/30" />
          <input
            type="text"
            placeholder="Search contacts, incidents, safe zones..."
            className="w-full pl-10 pr-3 py-2 bg-white/60 border border-white/50 rounded-xl text-sm text-charcoal placeholder-charcoal/30 focus:outline-none focus:ring-2 focus:ring-accent-600/20 glass-card"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto flex-shrink-0">

        <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
          activeAlert ? 'bg-error-50 text-error-600' : 'bg-green-50 text-success-500'
        }`}>
          {activeAlert ? <AlertTriangle size={13} /> : <ShieldCheck size={13} />}
          {activeAlert ? 'SOS Active' : 'You are Safe'}
        </span>

        <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/50 text-charcoal/60">
          <MapPin size={13} />
          {locationLabel || 'Location Off'}
        </span>

        <Link to="/notifications" className="relative p-2 rounded-xl text-accent-800/70 hover:bg-white/40 transition-colors">
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-accent-600 text-white text-[10px] font-bold rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
{/* 
        <button onClick={toggleDarkMode} className="p-2 rounded-xl text-charcoal/60 hover:bg-white/40 transition-colors" aria-label="Toggle dark mode">
          {darkMode ? <Sun size={19} /> : <Moon size={19} />}
        </button> */}

        {isFree && (
          <Link to="/subscription" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold rounded-xl transition-colors glass-card">
            <Zap size={13} /> Upgrade
          </Link>
        )}

        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((p) => !p)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/40 transition-colors">
            <span className="w-8 h-8 bg-accent-50 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-accent-600 font-bold text-xs">{user?.name?.slice(0, 1).toUpperCase() || 'U'}</span>
            </span>
            <span className="hidden md:block text-left">
              <span className="block text-sm font-semibold text-charcoal leading-tight">{user?.name?.split(' ')[0] || 'Account'}</span>
              <span className="block text-xs text-charcoal/40 leading-tight capitalize">{plan} Plan</span>
            </span>
            <ChevronDown size={14} className="text-charcoal/40 hidden md:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 glass-card p-1.5 bg-white/95 animate-fade-in z-10 overflow-visible">
              <Link to="/profile" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-charcoal/80 hover:bg-base transition-colors">
                <User size={16} /> Profile
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-charcoal/80 hover:bg-base transition-colors">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}