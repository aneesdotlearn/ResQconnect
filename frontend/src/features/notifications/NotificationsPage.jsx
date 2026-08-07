import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationActions } from '@/store/slices/notificationSlice';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Bell, CheckCheck, Trash2, AlertTriangle, Shield,
  FileText, CreditCard, Settings, Receipt,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICON = {
  sos: AlertTriangle,
  zone_alert: Shield,
  incident: FileText,
  subscription: CreditCard,
  system: Settings,
  payment: Receipt,
};

const TYPE_COLOR = {
  sos: 'bg-error-50 text-error-500',
  zone_alert: 'bg-green-50 text-success-500',
  incident: 'bg-orange-50 text-warn-500',
  subscription: 'bg-accent-50 text-accent-600',
  system: 'bg-neutral-100 text-neutral-500',
  payment: 'bg-blue-50 text-blue-600',
};

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector((s) => s.notifications);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(notificationActions.setLoading(true));
    api.get('/notifications?limit=50').then((r) => {
      dispatch(notificationActions.setNotifications(r.data.data));
    }).finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      dispatch(notificationActions.markRead(id));
    } catch { toast.error('Failed to mark as read'); }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      dispatch(notificationActions.markAllRead());
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to mark all as read'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      dispatch(notificationActions.setNotifications({
        notifications: items.filter((n) => n._id !== id),
        unreadCount: items.find((n) => n._id === id && !n.isRead) ? unreadCount - 1 : unreadCount,
      }));
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = filter === 'unread' ? items.filter((n) => !n.isRead) : items;

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal">Notifications</h1>
          <p className="text-charcoal/60 text-sm mt-0.5">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-ghost text-sm flex items-center gap-1.5">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl w-fit">
        {['all', 'unread'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? 'bg-white text-charcoal shadow-sm' : 'text-charcoal/50 hover:text-charcoal/80'}`}>
            {f} {f === 'unread' && unreadCount > 0 && <span className="ml-1 text-accent-600">({unreadCount})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map((i) => <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card text-center py-16">
          <Bell size={40} className="mx-auto mb-3 text-neutral-300" />
          <p className="font-semibold text-charcoal/70">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const Icon = TYPE_ICON[n.type] || Bell;
            const iconColor = TYPE_COLOR[n.type] || 'bg-neutral-100 text-neutral-500';
            return (
              <div key={n._id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
                  n.isRead ? 'bg-white border-neutral-100' : 'bg-accent-50/50 border-accent-100'
                }`}
                onClick={() => !n.isRead && handleMarkRead(n._id)}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                  <Icon size={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${n.isRead ? 'text-charcoal/70' : 'text-charcoal'}`}>{n.title}</p>
                  <p className="text-xs text-charcoal/50 mt-0.5">{n.body}</p>
                  <p className="text-xs text-charcoal/40 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.isRead && <span className="w-2 h-2 bg-accent-500 rounded-full" />}
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                    className="p-1.5 hover:bg-neutral-100 rounded-lg text-charcoal/30 hover:text-error-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}