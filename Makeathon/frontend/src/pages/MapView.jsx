import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiCrosshair, FiMaximize, FiLayers, FiWind, FiActivity } from 'react-icons/fi';
import Input from '../components/Input';
import Card from '../components/Card';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const FLASK_BASE = 'http://localhost:5000';

const createIcon = (c) => L.divIcon({
  className: '',
  html: `<div style="position:relative;width:24px;height:24px"><div style="position:absolute;inset:0;background:${c};border-radius:50%;opacity:.3;animation:ping 2s cubic-bezier(0,0,.2,1) infinite"></div><div style="position:absolute;top:4px;left:4px;right:4px;bottom:4px;background:${c};border-radius:50%;border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 12px ${c}40"></div></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12],
});

// Backend sends priority as lowercase: "high" | "medium" | "low"
const icons = { high: createIcon('#EF4444'), medium: createIcon('#F59E0B'), low: createIcon('#10B981') };

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom, { animate: true }); }, [center, zoom, map]);
  return null;
};

const MouseCoords = ({ setCoords }) => {
  useMapEvents({ mousemove(e) { setCoords({ lat: e.latlng.lat.toFixed(4), lng: e.latlng.lng.toFixed(4) }); } });
  return null;
};

const MapView = () => {
  const [alerts, setAlerts] = useState([]);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(3);
  const [mapType, setMapType] = useState('dark');
  const [coords, setCoords] = useState({ lat: '0.0000', lng: '0.0000' });
  const [searchQuery, setSearchQuery] = useState('');

  const tiles = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  // Fetch real incident data from the backend and map it into the shape
  // this component's markers/popups expect. Polls every 5s so new
  // incidents (from newly clustered/scored reports) appear automatically.
  useEffect(() => {
    const fetchIncidents = () => {
      fetch(`${FLASK_BASE}/incidents`)
        .then((res) => res.json())
        .then((data) => {
          const formatted = data
            .filter((item) => item.merged_lat != null && item.merged_long != null)
            .map((item) => ({
              id: item.incident_id || item.id,
              lat: item.merged_lat,
              lng: item.merged_long,
              type: item.hazard_type,
              severity: (item.priority || 'medium').toLowerCase(),
              time: item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown time',
              location: `${item.merged_lat.toFixed(2)}, ${item.merged_long.toFixed(2)}`,
              trustScore: item.trust_score,
              action: item.action,
              wave: 'N/A',
              wind: 'N/A',
            }));

          setAlerts(formatted);
        })
        .catch((err) => {
          console.error('Backend error:', err);
        });
    };

    fetchIncidents();
    const timer = setInterval(fetchIncidents, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) => {
        setMapCenter([p.coords.latitude, p.coords.longitude]);
        setMapZoom(7);
      });
    }
  };

  const toggleFullscreen = () => {
    const el = document.getElementById('map-wrapper');
    if (!document.fullscreenElement) el.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  };

  const severityColor = (s) =>
    s === 'high' ? 'text-danger' : s === 'medium' ? 'text-warning' : 'text-success';

  return (
    <div id="map-wrapper" className="relative flex-1 h-[calc(100vh-80px)] w-full overflow-hidden rounded-2xl border border-white/[0.06]">
      {/* Search */}
      <div className="absolute top-4 left-4 z-[1000] w-72">
        <Card className="p-3 backdrop-blur-2xl">
          <Input icon={FiSearch} placeholder="Search…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="mb-2" />
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Critical', 'Medium', 'Safe'].map((f) => (
              <button key={f} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/5 text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors border border-white/[0.06]">
                {f}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Card className="p-1 flex flex-col gap-0.5 backdrop-blur-2xl">
          <button onClick={() => setMapType(mapType === 'dark' ? 'street' : mapType === 'street' ? 'satellite' : 'dark')} className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-white/5 transition-colors" title="Layer">
            <FiLayers className="w-[18px] h-[18px]" />
          </button>
          <button onClick={toggleFullscreen} className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-white/5 transition-colors" title="Fullscreen">
            <FiMaximize className="w-[18px] h-[18px]" />
          </button>
          <button onClick={handleLocate} className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-white/5 transition-colors" title="Locate">
            <FiCrosshair className="w-[18px] h-[18px]" />
          </button>
        </Card>
      </div>

      {/* Legend */}
      <div className="absolute bottom-20 right-4 z-[1000]">
        <Card className="p-3 backdrop-blur-2xl space-y-2">
          <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Legend</h4>
          <div className="flex flex-col gap-1.5 text-[10px]">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-danger shadow-lg shadow-danger/30" /><span className="text-slate-300">Critical</span></span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-warning shadow-lg shadow-warning/30" /><span className="text-slate-300">Moderate</span></span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-success shadow-lg shadow-success/30" /><span className="text-slate-300">Safe</span></span>
          </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000]">
        <Card className="px-4 py-2.5 backdrop-blur-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-slate-400 font-medium">
            <span className="font-grotesk">{coords.lat}, {coords.lng}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger animate-pulse" />{alerts.filter((a) => a.severity === 'high').length} Critical</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" />{alerts.filter((a) => a.severity === 'medium').length} Moderate</span>
          </div>
          <span className="text-slate-500 font-grotesk">{alerts.length} alerts</span>
        </Card>
      </div>

      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%', background: '#0a0f1a' }} zoomControl={false}>
        <TileLayer url={tiles[mapType]} />
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <MouseCoords setCoords={setCoords} />

        {alerts.map((a) => (
          <Circle
            key={`circle-${a.id}`}
            center={[a.lat, a.lng]}
            radius={30000}
            pathOptions={{ color: '#EF4444', fillOpacity: 0.1 }}
          />
        ))}

        <MarkerClusterGroup chunkedLoading>
          {alerts.map((a) => (
            <Marker key={a.id} position={[a.lat, a.lng]} icon={icons[a.severity] || icons.medium}>
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <h3 className="font-bold text-sm border-b pb-1.5 mb-2 capitalize">{a.type?.replace('_', ' ')}</h3>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><strong>Location:</strong> {a.location}</p>
                    <p><strong>Severity:</strong> <span className={`font-bold capitalize ${severityColor(a.severity)}`}>{a.severity}</span></p>
                    {a.trustScore != null && <p><strong>Trust Score:</strong> {a.trustScore}/100</p>}
                    {a.action && <p className="text-slate-500">{a.action}</p>}
                    <p className="text-slate-400">{a.time}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default MapView;
