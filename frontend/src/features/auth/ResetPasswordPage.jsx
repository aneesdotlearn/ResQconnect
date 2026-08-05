import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Logo from '@/components/ui/Logo';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (!token) { toast.error('Invalid reset link'); return; }
    setLoading(true);
    try {
      await api.patch(`/auth/reset-password/${token}`, { password: form.password });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center p-2 mb-3">
            <Logo size={48} showWordmark={false} />
          </div>
          <h1 className="font-display font-bold text-2xl text-charcoal">
            Res<span className="text-accent-500">Q</span>connect
          </h1>
        </div>
        <div className="card shadow-md">
          <h2 className="font-display font-bold text-xl text-charcoal mb-6">Set new password</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'password', label: 'New password', placeholder: '••••••••' },
              { name: 'confirm', label: 'Confirm password', placeholder: '••••••••' },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-charcoal/80 mb-1.5">{label}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type={showPw ? 'text' : 'password'} value={form[name]}
                    onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
                    placeholder={placeholder} required className="input-field pl-10 pr-10" />
                  {name === 'confirm' && (
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-charcoal">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full 
                bg-gradient-to-r
                from-surface-gradientStart
                to-accent-400
                hover:from-accent-700
                hover:to-accent-500
                transition-all
                duration-600
                shadow-lg 
                disabled:cursor-not-allowed disabled:opacity-60 py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export { ResetPasswordPage as default } from './ForgotPasswordPage';