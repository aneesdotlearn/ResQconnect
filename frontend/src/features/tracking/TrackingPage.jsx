import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationActions } from '@/store/slices/locationSlice';
import api from '@/lib/api';
import { MapPin, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;background:#F20C63;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(242,12,99,0.5)"></div>`,
  className: '', iconAnchor: [8, 8],
});

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.setView([coords[1], coords[0]], map.getZoom()); }, [coords]);
  return null;
}

export default function TrackingPage() {
  const dispatch = useDispatch();
  const { current: location } = useSelector((s) => s.location);
  const [zones, setZones] = useState([]);
  const [tracking, setTracking] = useState(false);
  const watchRef = useRef(null);
  const updateTimerRef = useRef(null);

  useEffect(() => {
    api.get('/zones').then((r) => setZones(r.data.data.zones)).catch(() => {});
    return () => stopTracking();
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported.'); return; }
    setTracking(true);
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        dispatch(locationActions.setLocation({ coordinates: coords, accuracy: pos.coords.accuracy }));
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = setTimeout(() => {
          api.post('/location/update', { coordinates: coords, accuracy: pos.coords.accuracy }).catch(() => {});
        }, 10000);
      },
      (err) => { toast.error('Location error: ' + err.message); setTracking(false); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
    toast.success('Live tracking started');
  };

  const stopTracking = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    clearTimeout(updateTimerRef.current);
    setTracking(false);
  };

  const defaultCenter = location ? [location.coordinates[1], location.coordinates[0]] : [20.5937, 78.9629];

  return (
    <div className="space-y-4 animate-fade-in h-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal">Live Tracking</h1>
          <p className="text-charcoal/60 text-sm mt-0.5">Monitor your real-time location and safe zones</p>
        </div>
        <div className="flex gap-2">
          {tracking ? (
            <button onClick={stopTracking} className="btn-outline text-sm">
              <Navigation size={16} /> Stop Tracking
            </button>
          ) : (
            <button onClick={startTracking} className="btn-primary text-sm">
              <Navigation size={16} /> Start Tracking
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Status', value: tracking ? '● Live' : '○ Idle', idle: !tracking },
          { label: 'Accuracy', value: location ? `±${Math.round(location.accuracy || 0)}m` : '—' },
          { label: 'Safe Zones', value: zones.filter((z) => z.isActive).length },
        ].map(({ label, value, idle }) => (
          <div key={label} className="card py-3 px-4 text-center">
            <p className={`font-display font-bold text-lg ${idle ? 'text-charcoal/30' : 'text-accent-600'}`}>{value}</p>
            <p className="text-xs text-charcoal/50">{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden" style={{ height: '420px' }}>
        <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {location && (
            <>
              <RecenterMap coords={location.coordinates} />
              <Marker position={[location.coordinates[1], location.coordinates[0]]} icon={userIcon}>
                <Popup>
                  <strong>Your Location</strong><br />
                  Accuracy: ±{Math.round(location.accuracy || 0)}m
                </Popup>
              </Marker>
              {location.accuracy && (
                <Circle
                  center={[location.coordinates[1], location.coordinates[0]]}
                  radius={location.accuracy}
                  pathOptions={{ color: '#F20C63', fillColor: '#F20C63', fillOpacity: 0.1, weight: 1 }}
                />
              )}
            </>
          )}
          {zones.filter((z) => z.isActive).map((zone) => (
            <React.Fragment key={zone._id}>
              <Circle
                center={[zone.location.coordinates[1], zone.location.coordinates[0]]}
                radius={zone.radius}
                pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.15, weight: 2 }}
              />
              <Marker position={[zone.location.coordinates[1], zone.location.coordinates[0]]}>
                <Popup><strong>{zone.name}</strong><br />Radius: {zone.radius}m</Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      {location && (
        <div className="card flex items-center gap-3 py-3">
          <MapPin size={18} className="text-accent-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-charcoal/90">Current Position</p>
            <p className="text-xs text-charcoal/50 font-mono">
              {location.coordinates[1].toFixed(6)}°N, {location.coordinates[0].toFixed(6)}°E
            </p>
          </div>
        </div>
      )}
    </div>
  );
}