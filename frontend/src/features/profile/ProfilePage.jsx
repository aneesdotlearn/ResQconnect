import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '@/store/slices/authSlice';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Save, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const phone = form.phone.startsWith('+') ? form.phone : `+${form.phone}`;
    dispatch(updateProfile({ name: form.name, phone }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    setPwLoading(true);
    try {
      await api.patch('/auth/change-password', pwForm);
      toast.success('Password changed. Please sign in again.');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal">Profile</h1>
        <p className="text-charcoal/60 text-sm mt-0.5">Manage your account details</p>
      </div>

      <div className="glass-card flex items-center gap-4">
        <span className="w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-accent-600 font-bold text-xl">{user?.name?.slice(0, 1).toUpperCase() || 'U'}</span>
        </span>
        <div className="min-w-0">
          <p className="font-display font-bold text-lg text-charcoal truncate">{user?.name}</p>
          <p className="text-sm text-charcoal/50 truncate">{user?.email}</p>
          <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-accent-600 capitalize">
            <ShieldCheck size={13} /> {user?.subscription?.plan || 'free'} Plan
          </span>
        </div>
      </div>

      <div className="glass-card">
        <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Account Details</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required className="input-field opacity-60 pl-10 text-charcoal glass-card" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input type="email" value={user?.email || ''} disabled
                className="input-field pl-10 opacity-60 cursor-not-allowed text-charcoal opacity-60 glass-card"/>
            </div>
            <p className="text-xs text-charcoal/40 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-1.5">Phone (E.91)</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                required className="input-field pl-10 text-charcoal glass-card"/>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary text-sm">
            <Save size={15} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="glass-card">
        <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-1.5">Current Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input type={showPw ? 'text' : 'password'} value={pwForm.currentPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                required className="input-field pl-10 pr-10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-1.5">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input type={showPw ? 'text' : 'password'} value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                required minLength={8} className="input-field pl-10 pr-10" />
              <button type="button" onClick={() => setShowPw((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-charcoal">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={pwLoading} className="btn-outline text-sm">
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}