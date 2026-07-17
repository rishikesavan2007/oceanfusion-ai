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

const createIcon = (c) => L.divIcon({
  className: '',
  html: `<div style="position:relative;width:24px;height:24px"><div style="position:absolute;inset:0;background:${c};border-radius:50%;opacity:.3;animation:ping 2s cubic-bezier(0,0,.2,1) infinite"></div><div style="position:absolute;top:4px;left:4px;right:4px;bottom:4px;background:${c};border-radius:50%;border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 12px ${c}40"></div></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12],
});

const icons = { high: createIcon('#EF4444'), medium: createIcon('#F59E0B'), low: createIcon('#10B981') };

const ALERTS = [
  { id: '1', lat: 34.05, lng: -118.24, type: 'Oil Spill', severity: 'High', time: '2h ago', location: 'Pacific Coast', wave: '2.4m', wind: '15 kn' },
  { id: '2', lat: 25.76, lng: -80.19, type: 'Cyclone Warning', severity: 'High', time: '5h ago', location: 'Gulf of Mexico', wave: '6.1m', wind: '65 kn' },
  { id: '3', lat: 21.31, lng: -157.86, type: 'High Waves', severity: 'Medium', time: '1d ago', location: 'Hawaii', wave: '4.5m', wind: '22 kn' },
  { id: '4', lat: 51.51, lng: -0.13, type: 'Water Pollution', severity: 'Low', time: '3d ago', location: 'North Sea', wave: '1.2m', wind: '8 kn' },
  { id: '5', lat: 35.68, lng: 139.65, type: 'Tsunami Alert', severity: 'High', time: '10m ago', location: 'Sea of Japan', wave: '8.5m', wind: '12 kn' },
  { id: '6', lat: -33.87, lng: 151.21, type: 'Illegal Fishing', severity: 'Medium', time: '12h ago', location: 'Tasman Sea', wave: '1.8m', wind: '10 kn' },
];

const MapUpdater = ({ center, zoom }) => { const map = useMap(); useEffect(() => { map.setView(center, zoom, { animate: true }); }, [center, zoom, map]); return null; };
const MouseCoords = ({ setCoords }) => { useMapEvents({ mousemove(e) { setCoords({ lat: e.latlng.lat.toFixed(4), lng: e.latlng.lng.toFixed(4) }); } }); return null; };

const MapView = () => {
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

  const handleLocate = () => {
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => { setMapCenter([p.coords.latitude, p.coords.longitude]); setMapZoom(7); });
  };

  const toggleFullscreen = () => {
    const el = document.getElementById('map-wrapper');
    if (!document.fullscreenElement) el.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  };

  const severityColor = (s) => s === 'High' ? 'text-danger' : s === 'Medium' ? 'text-warning' : 'text-success';

  return (
    <div id="map-wrapper" className="relative flex-1 h-[calc(100vh-80px)] w-full overflow-hidden rounded-2xl border border-white/[0.06]">
      {/* Search */}
      <div className="absolute top-4 left-4 z-[1000] w-72">
        <Card className="p-3 backdrop-blur-2xl">
          <Input icon={FiSearch} placeholder="Search…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="mb-2" />
          <div className="flex flex-wrap gap-1.5">{['All', 'Critical', 'Medium', 'Safe'].map(f => <button key={f} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/5 text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors border border-white/[0.06]">{f}</button>)}</div>
        </Card>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Card className="p-1 flex flex-col gap-0.5 backdrop-blur-2xl">
          <button onClick={() => setMapType(mapType === 'dark' ? 'street' : mapType === 'street' ? 'satellite' : 'dark')} className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-white/5 transition-colors" title="Layer"><FiLayers className="w-[18px] h-[18px]" /></button>
          <button onClick={toggleFullscreen} className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-white/5 transition-colors" title="Fullscreen"><FiMaximize className="w-[18px] h-[18px]" /></button>
          <button onClick={handleLocate} className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-white/5 transition-colors" title="Locate"><FiCrosshair className="w-[18px] h-[18px]" /></button>
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
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger animate-pulse" />{ALERTS.filter(a => a.severity === 'High').length} Critical</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" />{ALERTS.filter(a => a.severity === 'Medium').length} Moderate</span>
          </div>
          <span className="text-slate-500 font-grotesk">{ALERTS.length} alerts</span>
        </Card>
      </div>

      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%', background: '#0a0f1a' }} zoomControl={false}>
        <TileLayer url={tiles[mapType]} />
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <MouseCoords setCoords={setCoords} />
        <Circle center={[34, -118]} radius={800000} pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.05, weight: 1 }} />
        <Circle center={[25.7, -80]} radius={500000} pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.12, weight: 1 }} />
        <Circle center={[35.6, 139.6]} radius={400000} pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.12, weight: 1 }} />
        <MarkerClusterGroup chunkedLoading>
          {ALERTS.map(a => (
            <Marker key={a.id} position={[a.lat, a.lng]} icon={icons[a.severity.toLowerCase()]}>
              <Popup><div className="p-1 min-w-[180px]"><h3 className="font-bold text-sm border-b pb-1.5 mb-2">{a.type}</h3><div className="text-xs space-y-1 text-slate-600"><p><strong>Location:</strong> {a.location}</p><p><strong>Severity:</strong> <span className={`font-bold ${severityColor(a.severity)}`}>{a.severity}</span></p><p className="flex items-center gap-1"><FiWind className="w-3 h-3" />{a.wind}</p><p className="flex items-center gap-1"><FiActivity className="w-3 h-3" />Wave: {a.wave}</p><p className="text-slate-400">{a.time}</p></div></div></Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default MapView;
