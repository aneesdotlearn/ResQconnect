import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AlertTriangle, Users, Shield, FileText,
  TrendingUp, Activity, Clock, RefreshCw, WifiOff,
  Brain, Cpu,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDistanceToNow, isValid } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function safeTimeAgo(dateStr) {
  try {
    const d = new Date(dateStr);
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : 'Unknown time';
  } catch { return 'Unknown time'; }
}

function formatCoords(sos) {
  try {
    if (sos?.location?.address) return sos.location.address;
    const lat = sos?.location?.coordinates?.[1];
    const lng = sos?.location?.coordinates?.[0];
    if (lat != null && lng != null) return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
    return 'Location unavailable';
  } catch { return 'Location unavailable'; }
}

function getRiskColor(score) {
  if (score >= 80) return { text: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', label: 'Critical' };
  if (score >= 60) return { text: '#C2410C', bg: '#FFF7ED', border: '#FED7AA', label: 'High' };
  if (score >= 40) return { text: '#B45309', bg: '#FFFBEB', border: '#FDE68A', label: 'Medium' };
  return { text: '#047857', bg: '#ECFDF5', border: '#A7F3D0', label: 'Low' };
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'accent', sub, loading }) {
  const colors = {
    accent: 'bg-accent-50 text-accent-600',
    green:  'bg-green-50 text-success-500',
    orange: 'bg-orange-50 text-warn-500',
    blue:   'bg-blue-50 text-blue-600',
  };
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        {loading
          ? <div className="h-8 w-16 bg-neutral-100 rounded-lg animate-pulse mb-1" />
          : <p className="text-2xl font-display font-bold text-charcoal">{value ?? 0}</p>}
        <p className="text-sm font-medium text-charcoal/70">{label}</p>
        {sub && <p className="text-xs text-charcoal/40 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Risk Meter ────────────────────────────────────────────────────────────
function RiskMeter({ score, confidence, factors, modelName, loading }) {
  const safeScore = Math.min(Math.max(Number(score) || 0, 0), 100);
  const { text: color, bg, border, label } = getRiskColor(safeScore);
  const angle  = (safeScore / 100) * 180 - 90;
  const arcLen = (safeScore / 100) * 157;

  const isML = modelName && !modelName.includes('rule-based');

  return (
    <div className="card flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-charcoal">AI Risk Score</h3>
        {!loading && modelName && (
          <span
            className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border"
            title={`Powered by: ${modelName}`}
            style={{ color: isML ? '#7C3AED' : '#4a5568', background: isML ? '#F5F3FF' : '#f7fafc', borderColor: isML ? '#DDD6FE' : '#e2e8f0' }}
          >
            {isML ? <Brain size={11} /> : <Cpu size={11} />}
            {isML ? 'ML Model' : 'Rule Engine'}
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-36 bg-neutral-100 rounded-2xl animate-pulse" />
      ) : (
        <>
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 120 70" className="w-44">
              <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="#e5e5e5" strokeWidth="12" strokeLinecap="round" />
              <path
                d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke={color}
                strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${arcLen} 157`}
                style={{ transition: 'stroke-dasharray 0.8s ease' }}
              />
              <line x1="60" y1="60" x2="60" y2="20"
                transform={`rotate(${angle}, 60, 60)`}
                stroke="#111827" strokeWidth="2" strokeLinecap="round"
                style={{ transition: 'transform 0.8s ease' }}
              />
              <circle cx="60" cy="60" r="4" fill="#111827" />
            </svg>
            <p className="text-4xl font-display font-black mt-1" style={{ color }}>{safeScore}</p>
            <span className="badge mt-1 text-xs font-semibold" style={{ background: bg, color, border: `1px solid ${border}` }}>
              {label} Risk
            </span>
          </div>

          {confidence != null && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-charcoal/50">Model confidence</span>
                <span className="text-xs font-semibold text-charcoal/80">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${confidence * 100}%`, background: color }}
                />
              </div>
            </div>
          )}

          {factors?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-charcoal/50 mb-2">Risk factors</p>
              <div className="flex flex-wrap gap-1.5">
                {factors.map((f) => (
                  <span
                    key={f}
                    className="text-xs px-2 py-0.5 rounded-full border font-medium"
                    style={{ background: bg, color, borderColor: border }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!factors?.length && (
            <p className="text-xs text-charcoal/40 text-center mt-3">
              Trigger an SOS to see risk factors
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-error-50 border border-error-500/20 rounded-xl text-sm">
      <div className="flex items-center gap-2 text-error-600">
        <WifiOff size={16} className="flex-shrink-0" />
        <span>{message}</span>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-error-50 hover:bg-error-100 text-error-600 font-medium rounded-lg transition-colors flex-shrink-0"
      >
        <RefreshCw size={13} /> Retry
      </button>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { to: '/sos',       icon: AlertTriangle, label: 'Trigger SOS',  color: 'bg-error-500 hover:bg-error-600 text-white' },
  { to: '/contacts',  icon: Users,         label: 'Contacts',     color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
  { to: '/zones',     icon: Shield,        label: 'Safe Zones',   color: 'bg-green-50 hover:bg-green-100 text-success-500' },
  { to: '/incidents', icon: FileText,      label: 'Report',       color: 'bg-orange-50 hover:bg-orange-100 text-warn-500' },
];

const STATUS_DOT   = { active: 'bg-error-500 animate-pulse', resolved: 'bg-success-500', false_alarm: 'bg-warn-500' };
const STATUS_BADGE = { active: 'badge-error', resolved: 'badge-success', false_alarm: 'badge-warn' };

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user }        = useSelector((s) => s.auth);
  const activeAlert     = useSelector((s) => s.sos?.activeAlert);

  const [analytics,     setAnalytics]     = useState(null);
  const [recentSOS,     setRecentSOS]     = useState([]);
  const [analyticsErr,  setAnalyticsErr]  = useState(null);
  const [sosErr,        setSosErr]        = useState(null);
  const [analyticsLoad, setAnalyticsLoad] = useState(true);
  const [sosLoad,       setSosLoad]       = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoad(true); setAnalyticsErr(null);
    try {
      const { data } = await api.get('/analytics/me');
      setAnalytics(data.data);
    } catch (err) {
      setAnalyticsErr(err?.response?.data?.message || err?.message || 'Failed to load analytics');
    } finally { setAnalyticsLoad(false); }
  }, []);

  const fetchRecentSOS = useCallback(async () => {
    setSosLoad(true); setSosErr(null);
    try {
      const { data } = await api.get('/sos/history?limit=5');
      setRecentSOS(Array.isArray(data?.data?.sos) ? data.data.sos : []);
    } catch (err) {
      setSosErr(err?.response?.data?.message || err?.message || 'Failed to load SOS history');
    } finally { setSosLoad(false); }
  }, []);

  useEffect(() => { fetchAnalytics(); fetchRecentSOS(); }, [fetchAnalytics, fetchRecentSOS]);

  const totalSOS  = analytics?.sosSummary?.reduce((a, s) => a + (s.count || 0), 0) ?? 0;
  const resolved  = analytics?.sosSummary?.find((s) => s._id === 'resolved')?.count ?? 0;
  const incidents = analytics?.incidentSummary?.reduce((a, s) => a + (s.count || 0), 0) ?? 0;
  const avgRisk   = analytics?.riskStats?.avgRiskScore != null
    ? Math.round(analytics.riskStats.avgRiskScore) : 0;

  const latestSOS   = recentSOS[0];
  const meterScore  = latestSOS?.aiRiskScore      ?? avgRisk;
  const meterConf   = latestSOS?.aiConfidence     ?? null;
  const meterModel  = latestSOS?.aiModel          ?? null;
  const meterFacts  = latestSOS?.aiRiskFactors    ?? [];

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal">
            {greeting}, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-charcoal/60 text-sm mt-0.5">
            {activeAlert
              ? <span className="text-error-600 font-semibold animate-pulse">🚨 Active SOS alert in progress</span>
              : 'You are safe. Stay aware of your surroundings.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge capitalize ${user?.subscription?.plan && user.subscription.plan !== 'free' ? 'badge-success' : 'badge-gray'}`}>
            {user?.subscription?.plan || 'Free'} Plan
          </span>
          <button
            onClick={() => { fetchAnalytics(); fetchRecentSOS(); }}
            disabled={analyticsLoad || sosLoad}
            className="p-2 rounded-xl hover:bg-base text-charcoal/50 transition-colors disabled:opacity-40"
            title="Refresh dashboard"
          >
            <RefreshCw size={16} className={(analyticsLoad || sosLoad) ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl font-semibold text-sm transition-all duration-150 shadow-sm ${color}`}>
            <Icon size={22} />{label}
          </Link>
        ))}
      </div>

      {analyticsErr && !analyticsLoad && (
        <ErrorBanner message={`Analytics: ${analyticsErr}`} onRetry={fetchAnalytics} />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={AlertTriangle} label="Total SOS"      value={totalSOS}  color="accent" loading={analyticsLoad} />
        <StatCard icon={Activity}      label="Resolved"       value={resolved}  color="green"  loading={analyticsLoad} />
        <StatCard icon={FileText}      label="Incidents"      value={incidents} color="orange" loading={analyticsLoad} />
        <StatCard icon={TrendingUp}    label="Avg Risk Score" value={avgRisk}   color="blue"   loading={analyticsLoad} sub="Across all SOS alerts" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <RiskMeter
          score={meterScore}
          confidence={meterConf}
          factors={meterFacts}
          modelName={meterModel}
          loading={analyticsLoad || sosLoad}
        />

        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-charcoal">Recent SOS History</h3>
            <Link to="/sos" className="text-xs text-accent-500 font-medium hover:text-accent-600">View all →</Link>
          </div>

          {sosErr && !sosLoad && (
            <ErrorBanner message={`SOS history: ${sosErr}`} onRetry={fetchRecentSOS} />
          )}
          {sosLoad && !sosErr && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-neutral-100 rounded-xl animate-pulse" />)}
            </div>
          )}
          {!sosLoad && !sosErr && recentSOS.length === 0 && (
            <div className="text-center py-10 text-charcoal/30">
              <AlertTriangle size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No SOS history yet</p>
              <p className="text-xs mt-1 opacity-70">SOS alerts you trigger will appear here</p>
            </div>
          )}
          {!sosLoad && !sosErr && recentSOS.length > 0 && (
            <div className="space-y-2">
              {recentSOS.map((sos) => {
                const { text: riskColor, bg: riskBg } = getRiskColor(sos.aiRiskScore ?? 0);
                return (
                  <div key={sos._id} className="flex items-center gap-3 p-3 bg-base rounded-xl">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[sos.status] || 'bg-neutral-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal/90 capitalize">{sos.triggerMethod || 'unknown'} trigger</p>
                      <p className="text-xs text-charcoal/50 truncate">{formatCoords(sos)}</p>
                      {sos.aiRiskFactors?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sos.aiRiskFactors.slice(0, 2).map((f) => (
                            <span key={f} className="text-xs px-1.5 py-0.5 rounded-full"
                              style={{ background: riskBg, color: riskColor, fontSize: '10px' }}>
                              {f}
                            </span>
                          ))}
                          {sos.aiRiskFactors.length > 2 && (
                            <span className="text-xs text-charcoal/40" style={{ fontSize: '10px' }}>
                              +{sos.aiRiskFactors.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <div className="flex items-center gap-1 justify-end">
                        <span className={`badge text-xs ${STATUS_BADGE[sos.status] || 'badge-gray'}`}>
                          {sos.status || 'unknown'}
                        </span>
                        {sos.aiRiskScore != null && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: riskBg, color: riskColor, fontSize: '10px' }}>
                            {sos.aiRiskScore}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-charcoal/40 flex items-center justify-end gap-1">
                        <Clock size={10} />{safeTimeAgo(sos.createdAt)}
                      </p>
                      {sos.aiModel && (
                        <p className="text-xs text-charcoal/30" style={{ fontSize: '9px' }}>
                          {sos.aiModel.includes('ml-service') ? '🧠 ML' : '⚙️ Rules'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}