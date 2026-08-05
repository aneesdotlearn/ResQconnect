import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { triggerSOS, resolveSOS, fetchActiveSOS } from '@/store/slices/sosSlice';
import { locationActions } from '@/store/slices/locationSlice';
import {
  AlertTriangle, Mic, MicOff, CheckCircle, XCircle,
  MapPin, Shield, Brain, Cpu, ChevronDown, ChevronUp,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const COUNTDOWN = 5;

function getRiskColor(score) {
  if (score >= 80) return { text: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', label: 'Critical' };
  if (score >= 60) return { text: '#C2410C', bg: '#FFF7ED', border: '#FED7AA', label: 'High' };
  if (score >= 40) return { text: '#B45309', bg: '#FFFBEB', border: '#FDE68A', label: 'Medium' };
  return  { text: '#047857', bg: '#ECFDF5', border: '#A7F3D0', label: 'Low' };
}

// ─── ML Risk Panel ────────────────────────────────────────────────────────────
function RiskPanel({ alert }) {
  const [expanded, setExpanded] = useState(false);
  const score      = alert?.aiRiskScore;
  const confidence = alert?.aiConfidence;
  const factors    = alert?.aiRiskFactors ?? [];
  const modelName  = alert?.aiModel;

  if (score == null) return null;

  const { text: color, bg, border, label } = getRiskColor(score);
  const isML = modelName && !modelName.includes('rule-based');

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: border, background: bg }}>
      <button type="button" onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-2xl font-display font-black" style={{ color }}>{score}</p>
            <p className="text-xs font-semibold" style={{ color }}>{label}</p>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color }}>AI Risk Score</p>
            {confidence != null && (
              <p className="text-xs" style={{ color, opacity: 0.8 }}>
                {Math.round(confidence * 100)}% confidence
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {modelName && (
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border"
              style={{ color: isML ? '#7C3AED' : '#4a5568', background: '#fff', borderColor: isML ? '#DDD6FE' : '#e2e8f0' }}>
              {isML ? <Brain size={10} /> : <Cpu size={10} />}
              {isML ? 'ML' : 'Rules'}
            </span>
          )}
          {expanded ? <ChevronUp size={16} style={{ color }} /> : <ChevronDown size={16} style={{ color }} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: border }}>
          {confidence != null && (
            <div className="pt-3">
              <div className="flex justify-between mb-1">
                <span className="text-xs" style={{ color, opacity: 0.8 }}>Model confidence</span>
                <span className="text-xs font-bold" style={{ color }}>{Math.round(confidence * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: border }}>
                <div className="h-full rounded-full" style={{ width: `${confidence * 100}%`, background: color, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          )}
          {factors.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color, opacity: 0.8 }}>Risk factors detected</p>
              <div className="flex flex-wrap gap-1.5">
                {factors.map((f) => (
                  <span key={f} className="text-xs px-2 py-0.5 rounded-full border font-medium"
                    style={{ color, background: '#fff', borderColor: border }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
          {modelName && (
            <p className="text-xs opacity-50" style={{ color }}>Powered by: {modelName}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main SOS Page ────────────────────────────────────────────────────────────
export default function SOSPage() {
  const dispatch = useDispatch();
  const { activeAlert, triggering } = useSelector((s) => s.sos);
  const { current: location }       = useSelector((s) => s.location);

  const [countdown,   setCountdown]   = useState(null);
  const [voiceActive, setVoiceActive] = useState(false);

  const countdownRef   = useRef(null);
  const recognitionRef = useRef(null);
  const watchRef        = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => dispatch(locationActions.setLocation({
        coordinates: [pos.coords.longitude, pos.coords.latitude],
        accuracy: pos.coords.accuracy,
      })),
      (err) => dispatch(locationActions.setLocationError(err.message)),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    dispatch(fetchActiveSOS());
    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); };
  }, [dispatch]);

  useEffect(() => {
    if (!activeAlert || !location) return;
    const sosId = activeAlert.sosId || activeAlert._id;
    if (!sosId) return;
    api.patch(`/sos/${sosId}/location`, {
      coordinates: location.coordinates,
      accuracy: location.accuracy,
    }).catch(() => {});
  }, [location, activeAlert]);

  const startCountdown = useCallback(() => {
    if (!location) { toast.error('Location not available. Please enable GPS.'); return; }
    setCountdown(COUNTDOWN);
    let c = COUNTDOWN;
    countdownRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(countdownRef.current);
        setCountdown(null);
        dispatch(triggerSOS({
          coordinates: location.coordinates,
          accuracy: location.accuracy,
          triggerMethod: 'button',
        }));
      }
    }, 1000);
  }, [location, dispatch]);

  const cancelCountdown = () => { clearInterval(countdownRef.current); setCountdown(null); };

  const handleResolve = (isFalseAlarm = false) => {
    const sosId = activeAlert?.sosId || activeAlert?._id;
    if (!sosId) return;
    dispatch(resolveSOS({ sosId, isFalseAlarm, resolutionNote: '' }));
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice activation not supported in this browser.'); return; }
    if (voiceActive) { recognitionRef.current?.stop(); setVoiceActive(false); return; }

    const rec = new SR();
    rec.continuous = true; rec.lang = 'en-US'; rec.interimResults = false;
    rec.onresult = (e) => {
      const t = e.results[e.results.length - 1][0].transcript.toLowerCase();
      if (t.includes('help me') || t.includes('sos') || t.includes('emergency')) {
        rec.stop(); setVoiceActive(false);
        if (location) {
          dispatch(triggerSOS({ coordinates: location.coordinates, accuracy: location.accuracy, triggerMethod: 'voice' }));
          toast.success('Voice SOS triggered!');
        }
      }
    };
    rec.onerror = () => setVoiceActive(false);
    rec.onend   = () => setVoiceActive(false);
    rec.start();
    recognitionRef.current = rec;
    setVoiceActive(true);
    toast('Voice activated. Say "help me" or "SOS".', { icon: '🎤', duration: 5000 });
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal">SOS Emergency</h1>
        <p className="text-charcoal/60 text-sm mt-0.5">Press the button to send an emergency alert</p>
      </div>

      {/* Location status */}
      <div className={`glass-panel rounded-xl flex items-center gap-3 p-3 ${location ? 'border-success-500/30' : 'border-warn-500/30'}`}>
        <MapPin size={18} className={location ? 'text-success-500' : 'text-warn-500'} />
        <div>
          <p className={`text-sm font-semibold ${location ? 'text-success-500' : 'text-warn-500'}`}>
            {location ? 'GPS Location Active' : 'Location Not Available'}
          </p>
          <p className="text-xs text-charcoal/50">
            {location ? `Accuracy: ±${Math.round(location.accuracy || 0)}m` : 'Enable location for SOS to work'}
          </p>
        </div>
      </div>

      {/* ── Active SOS ───────────────────────────────────────────────────────── */}
      {activeAlert ? (
        <div className="glass-card border-2 border-error-500/30 space-y-4">
          <div className="flex justify-center">
            <div className="neu-fab w-20 h-20 flex items-center justify-center animate-ping-slow">
              <AlertTriangle size={36} />
            </div>
          </div>
          <div className="text-center">
            <h2 className="font-display font-bold text-xl text-error-600">SOS ACTIVE</h2>
            <p className="text-error-500 text-sm mt-1">Emergency alert sent. Help is on the way.</p>
          </div>

          <RiskPanel alert={activeAlert} />

          <div className="flex gap-3">
            <button onClick={() => handleResolve(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-warn-500/40 text-warn-500 font-semibold rounded-xl hover:bg-orange-50 transition-colors">
              <XCircle size={18} /> False Alarm
            </button>
            <button onClick={() => handleResolve(false)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-success-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
              <CheckCircle size={18} /> Resolved
            </button>
          </div>
        </div>
      ) : (
        /* ── SOS Trigger ─────────────────────────────────────────────────── */
        <div className="glass-card text-center space-y-6">
          <div>
            <h2 className="font-display font-bold text-lg text-charcoal">Press to Activate SOS</h2>
            <p className="text-charcoal/50 text-sm">
              {countdown != null ? 'Release to cancel' : 'Sends alert to all emergency contacts'}
            </p>
          </div>

          <div className="flex justify-center">
            {countdown != null ? (
              <div className="relative flex items-center justify-center">
                <div className="absolute w-44 h-44 rounded-full border-4 border-error-500/40 animate-ping" />
                <button onClick={cancelCountdown}
                  className="neu-fab relative w-40 h-40 flex flex-col items-center justify-center gap-1">
                  <span className="font-display font-black text-5xl">{countdown}</span>
                  <span className="text-sm font-semibold opacity-90">Tap to Cancel</span>
                </button>
              </div>
            ) : (
              <button onMouseDown={startCountdown} onTouchStart={startCountdown}
                disabled={triggering || !location}
                className="sos-button neu-fab relative w-40 h-40 flex flex-col items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                <AlertTriangle size={44} strokeWidth={2.5} />
                <span className="font-display font-bold text-sm tracking-wide">SOS</span>
              </button>
            )}
          </div>

          {/* Voice toggle — neumorphic */}
          <div className="flex justify-center">
            <button onClick={toggleVoice}
              className={`neu-btn flex items-center gap-2 px-5 py-3 text-sm font-medium ${voiceActive ? 'text-accent-600' : 'text-charcoal/70'}`}>
              {voiceActive ? <Mic size={16} className="animate-pulse text-accent-500" /> : <MicOff size={16} />}
              {voiceActive ? 'Voice Active — Say "Help Me"' : 'Enable Voice Activation'}
            </button>
          </div>

          <div className="flex items-start gap-2 p-3 bg-white/40 rounded-xl text-left">
            <Shield size={16} className="text-accent-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-charcoal/50">
              Your location and an AI-scored risk analysis will be sent instantly to your emergency contacts via SMS and email.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}