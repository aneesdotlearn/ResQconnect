import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api';
import { BarChart2, TrendingUp, AlertTriangle, FileText } from 'lucide-react';

const COLORS = ['#F20C63', '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'];

function StatCard({ icon: Icon, label, value, color = 'accent' }) {
  const bg = {
    accent: 'bg-accent-50 text-accent-600',
    green:  'bg-green-50 text-success-500',
    blue:   'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-warn-500',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg[color]}`}><Icon size={22} /></div>
      <div>
        <p className="text-2xl font-display font-bold text-charcoal">{value ?? '—'}</p>
        <p className="text-sm text-charcoal/70">{label}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/me').then((r) => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-100 rounded-xl animate-pulse w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-24 bg-neutral-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const totalSOS = data?.sosSummary?.reduce((a, b) => a + b.count, 0) || 0;
  const resolvedSOS = data?.sosSummary?.find((s) => s._id === 'resolved')?.count || 0;
  const totalIncidents = data?.incidentSummary?.reduce((a, b) => a + b.count, 0) || 0;
  const avgRisk = data?.sosSummary?.[0]?.avgRiskScore ? Math.round(data.sosSummary[0].avgRiskScore) : 0;

  const monthlyData = (data?.sosMonthly || []).map((m) => ({
    name: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short' }),
    SOS: m.count,
  }));

  const incidentPieData = (data?.incidentSummary || []).map((i) => ({ name: i._id.replace('_', ' '), value: i.count }));
  const sosPieData = (data?.sosSummary || []).map((s) => ({ name: s._id, value: s.count }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal">Analytics</h1>
        <p className="text-charcoal/60 text-sm mt-0.5">Your personal safety data overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={AlertTriangle} label="Total SOS" value={totalSOS} color="accent" />
        <StatCard icon={TrendingUp} label="Resolved" value={resolvedSOS} color="green" />
        <StatCard icon={FileText} label="Incidents" value={totalIncidents} color="orange" />
        <StatCard icon={BarChart2} label="Avg Risk Score" value={avgRisk} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-display font-semibold text-charcoal mb-4">SOS Alerts — Last 12 Months</h3>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-charcoal/40 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="SOS" fill="#F20C63" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="font-display font-semibold text-charcoal mb-4">SOS by Status</h3>
          {sosPieData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-charcoal/40 text-sm">No data yet</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={sosPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {sosPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {sosPieData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-charcoal/70 capitalize">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-display font-semibold text-charcoal mb-4">Incidents by Type</h3>
          {incidentPieData.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-charcoal/40 text-sm">No incidents reported</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={incidentPieData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#9ca3af' }} width={110} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}