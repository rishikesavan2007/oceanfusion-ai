import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiMapPin, FiActivity, FiNavigation, FiMoreVertical, FiSearch, FiDownload, FiArrowUpRight, FiArrowDownRight, FiCheckCircle, FiClock, FiSend, FiTrash2, FiRefreshCw, FiZap, FiWifiOff, FiMessageSquare, FiX, FiChevronUp } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import Card from '../components/Card';
import Button from '../components/Button';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const FLASK_BASE = 'http://localhost:5000';

/* ─── Alert data ─── */
const rawAlerts = [
  { id: 'ALT-9921', type: 'Oil Spill Detected', location: 'Sector 7G', priority: 1, time: '10m ago' },
  { id: 'ALT-9922', type: 'Severe Storm Warning', location: 'Pacific Alpha', priority: 2, time: '1h ago' },
  { id: 'ALT-9923', type: 'Vessel Off Course', location: 'Atlantic Route 4', priority: 3, time: '2h ago' },
  { id: 'ALT-9924', type: 'Routine Check', location: 'Indian Ocean Buoy', priority: 4, time: '5h ago' },
  { id: 'ALT-9925', type: 'Tsunami Watch', location: 'Coastal Region B', priority: 1, time: '15m ago' },
];
const ALERTS = [...rawAlerts].sort((a, b) => a.priority - b.priority);

const pBadge = (p) => {
  const m = { 1: { l: 'P1 Critical', c: 'bg-danger/15 text-danger border-danger/20' }, 2: { l: 'P2 High', c: 'bg-warning/15 text-warning border-warning/20' }, 3: { l: 'P3 Medium', c: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' }, 4: { l: 'P4 Low', c: 'bg-slate-500/15 text-slate-400 border-slate-500/20' } };
  const { l, c } = m[p] || m[4];
  return <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${c}`}>{l}</span>;
};

const heatPoints = [
  { lat: 34.05, lng: -118.24, r: 300000, opacity: 0.35 },
  { lat: 25.76, lng: -80.19, r: 500000, opacity: 0.45 },
  { lat: 35.68, lng: 139.65, r: 400000, opacity: 0.4 },
  { lat: -33.87, lng: 151.21, r: 250000, opacity: 0.25 },
  { lat: 21.31, lng: -157.86, r: 350000, opacity: 0.3 },
];

/* ─── Metric Card ─── */
const MetricCard = ({ title, value, icon: Icon, trend, isPos, spark, color, delay }) => {
  const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false, min: Math.min(...spark) * 0.9, max: Math.max(...spark) * 1.1 } }, elements: { point: { radius: 0 } } };
  const data = { labels: spark.map((_, i) => i), datasets: [{ data: spark, borderColor: color, borderWidth: 2, tension: 0.4 }] };
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      <Card className="p-5 h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/[0.06] flex items-center justify-center"><Icon className="w-5 h-5" style={{ color }} /></div>
          <span className={`flex items-center gap-0.5 text-xs font-bold ${isPos ? 'text-success' : 'text-danger'}`}>{isPos ? <FiArrowUpRight className="w-3 h-3" /> : <FiArrowDownRight className="w-3 h-3" />}{trend}</span>
        </div>
        <h3 className="text-slate-400 text-xs font-medium mb-1">{title}</h3>
        <div className="flex items-end justify-between"><span className="stat-number text-2xl text-white">{value}</span><div className="w-20 h-8"><Line options={opts} data={data} /></div></div>
      </Card>
    </motion.div>
  );
};

/* ─── Embedded AI Assistant Panel ─── */
const AIChatPanel = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: 0, text: "Hello! I'm OCEANFUSION AI. Ask me anything about the dashboard data.", isUser: false, ts: fmt(new Date()) }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailed, setLastFailed] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => {
    const on = () => { setIsOnline(true); setError(null); };
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  function fmt(d) { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

  const send = async (text, retry = 0) => {
    if (!isOnline) { setError('AI Assistant is unavailable while offline.'); return; }
    const t = (text || input).trim();
    if (!t || loading) return;
    setError(null); setLastFailed(null);
    if (retry === 0) {
      setMessages(p => [...p, { id: Date.now(), text: t, isUser: true, ts: fmt(new Date()) }]);
      setInput('');
    }
    setLoading(true);
    try {
      const res = await axios.post(`${FLASK_BASE}/get`, { message: t }, { timeout: 30000, headers: { 'Content-Type': 'application/json' } });
      setMessages(p => [...p, { id: Date.now() + 1, text: res.data.reply || 'No response.', isUser: false, ts: fmt(new Date()) }]);
      setRetryCount(0);
    } catch (err) {
      if (retry < 2) {
        // Auto-retry up to 2 times
        setTimeout(() => send(t, retry + 1), 1500 * (retry + 1));
        return;
      }
      const msg = !navigator.onLine
        ? 'AI Assistant is unavailable while offline.'
        : err.response
          ? `Server error (${err.response.status}). Please try again.`
          : 'Unable to connect to chatbot server. Check that the Flask backend is running on port 5000.';
      setError(msg);
      setLastFailed(t);
      setRetryCount(retry);
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  const clear = async () => {
    try { await axios.post(`${FLASK_BASE}/clear`, {}, { timeout: 5000 }); } catch {}
    setMessages([{ id: Date.now(), text: 'Chat cleared. How can I help?', isUser: false, ts: fmt(new Date()) }]);
    setError(null); setLastFailed(null);
  };

  return (
    <>
      {/* Floating toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ y: -2, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center shadow-xl shadow-primary/30 relative"
        >
          {open ? <FiX className="w-5 h-5" /> : <FiMessageSquare className="w-5 h-5" />}
          {!open && !isOnline && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warning flex items-center justify-center">
              <FiWifiOff className="w-2.5 h-2.5 text-white" />
            </span>
          )}
        </motion.button>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] flex flex-col glass-card overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20"><FiZap className="w-3.5 h-3.5 text-white" /></div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">OCEANFUSION AI</h3>
                  <p className="text-[9px] text-slate-500">Groq · Llama 3.1</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isOnline && <span className="text-[9px] font-semibold text-warning bg-warning/10 border border-warning/20 rounded-md px-1.5 py-0.5 flex items-center gap-1"><FiWifiOff className="w-2.5 h-2.5" />Offline</span>}
                <button onClick={clear} className="p-1.5 text-slate-500 hover:text-danger rounded-lg hover:bg-white/5 transition-colors"><FiTrash2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => setOpen(false)} className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"><FiX className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Offline banner */}
            {!isOnline && (
              <div className="px-4 py-2 bg-warning/10 border-b border-warning/20 text-[11px] text-warning font-medium flex items-center gap-2">
                <FiWifiOff className="w-3 h-3 shrink-0" />
                AI Assistant is unavailable while offline. Will auto-reconnect when back online.
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {messages.map(m => (
                <div key={m.id} className={`flex items-end gap-2 mb-3 ${m.isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[8px] font-bold ${m.isUser ? 'bg-secondary text-white' : 'bg-gradient-to-br from-primary to-accent text-white'}`}>
                    {m.isUser ? 'U' : <FiZap className="w-3 h-3" />}
                  </div>
                  <div className="max-w-[80%]">
                    <div className={`px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words rounded-xl ${m.isUser ? 'bg-gradient-to-r from-secondary to-neon-cyan text-white rounded-br-sm' : 'bg-white/[0.04] border border-white/[0.06] text-slate-200 rounded-bl-sm'}`}>{m.text}</div>
                    <span className={`block text-[9px] mt-0.5 text-slate-600 ${m.isUser ? 'text-right' : ''}`}>{m.ts}</span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-end gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center"><FiZap className="w-3 h-3 text-white" /></div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl rounded-bl-sm px-3 py-2 flex gap-1 items-center">
                    {[0, 1, 2].map(i => <motion.span key={i} className="w-1 h-1 rounded-full bg-primary" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.1 }} />)}
                  </div>
                </div>
              )}
              {error && (
                <div className="mb-3 flex items-center gap-2 bg-danger/10 border border-danger/20 text-danger rounded-lg px-3 py-2 text-[11px]">
                  <FiAlertTriangle className="w-3 h-3 shrink-0" /><span className="flex-1">{error}</span>
                  {lastFailed && <button onClick={() => send(lastFailed)} className="text-[10px] font-bold hover:underline flex items-center gap-0.5"><FiRefreshCw className="w-3 h-3" />Retry</button>}
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/[0.06] shrink-0 relative group">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={isOnline ? 'Ask something…' : 'Offline — AI unavailable'}
                  disabled={!isOnline}
                  rows={1}
                  className="flex-1 resize-none bg-white/[0.03] border border-white/[0.06] rounded-xl text-[13px] text-slate-200 placeholder:text-slate-600 outline-none px-3 py-2 max-h-20 custom-scrollbar disabled:opacity-40 disabled:cursor-not-allowed focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => send()}
                  disabled={!input.trim() || loading || !isOnline}
                  className="w-9 h-9 rounded-xl bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center shrink-0 disabled:opacity-20 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                >
                  <FiSend className="w-3.5 h-3.5" />
                </motion.button>
              </div>
              {!isOnline && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block px-2.5 py-1 bg-slate-800 text-[9px] text-white rounded-lg shadow-lg border border-white/10 whitespace-nowrap">
                  AI Assistant is available only when an internet connection is detected.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ─── Dashboard Page ─── */
const Dashboard = () => {
  const summary = { active: 12, resolved: 87, pending: 5 };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold gradient-text">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">OCEANFUSION AI — Receiver Node command center.</p>
        </div>
        <Button variant="secondary" icon={FiDownload} size="sm">Export</Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Critical Disasters" value="2" icon={FiAlertTriangle} trend="+1" isPos={false} spark={[0,0,1,1,2,1,2]} color="#EF4444" delay={0.05} />
        <MetricCard title="Vessels Monitoring" value="1,284" icon={FiNavigation} trend="+3.2%" isPos={true} spark={[1200,1210,1225,1240,1230,1270,1284]} color="#6366F1" delay={0.1} />
        <MetricCard title="Safe Regions" value="89%" icon={FiMapPin} trend="-1.5%" isPos={false} spark={[92,91,91,90,89,88,89]} color="#F59E0B" delay={0.15} />
        <MetricCard title="Sensors Online" value="9,942" icon={FiActivity} trend="+0.8%" isPos={true} spark={[9800,9850,9840,9900,9920,9935,9942]} color="#22D3EE" delay={0.2} />
      </div>

      {/* Incident Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Incidents', value: summary.active, icon: FiAlertTriangle, color: 'text-danger', bg: 'from-danger/10 to-danger/5' },
          { label: 'Resolved', value: summary.resolved, icon: FiCheckCircle, color: 'text-success', bg: 'from-success/10 to-success/5' },
          { label: 'Pending Review', value: summary.pending, icon: FiClock, color: 'text-warning', bg: 'from-warning/10 to-warning/5' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}>
            <Card className="p-5 relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} opacity-50`} />
              <div className="relative z-10 flex items-center justify-between">
                <div><p className="text-xs font-medium text-slate-400 mb-1">{s.label}</p><span className="stat-number text-3xl text-white">{s.value}</span></div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/[0.06] flex items-center justify-center"><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Heat Map */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex justify-between items-center">
            <h2 className="text-sm font-bold text-white">Incident Density Heat Map</h2>
            <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-danger" />High</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-warning" />Medium</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success" />Low</span>
            </div>
          </div>
          <div className="h-[350px] w-full relative z-10">
            <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%', background: '#0a0f1a' }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {heatPoints.map((p, i) => <Circle key={i} center={[p.lat, p.lng]} radius={p.r} pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: p.opacity, weight: 1 }} />)}
              <Circle center={[34, -40]} radius={600000} pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.08, weight: 1 }} />
              <Circle center={[10, 50]} radius={500000} pathOptions={{ color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.12, weight: 1 }} />
            </MapContainer>
          </div>
        </Card>
      </motion.div>

      {/* Priority Reports Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><FiAlertTriangle className="text-danger w-4 h-4" /> Priority Reports</h2>
            <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" /><input type="text" placeholder="Search…" className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 text-xs border border-white/[0.06] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/30 w-48" /></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-slate-500 text-xs font-medium"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Time</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-white/[0.04]">
                {ALERTS.map((a, i) => (
                  <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="group hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 font-grotesk font-medium text-slate-300 text-xs">{a.id}</td>
                    <td className="px-4 py-3">{pBadge(a.priority)}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{a.type}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{a.location}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{a.time}</td>
                    <td className="px-4 py-3 text-right"><button className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-white/5 transition-colors"><FiMoreVertical className="w-4 h-4" /></button></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* AI Assistant — floating panel inside Dashboard */}
      <AIChatPanel />
    </div>
  );
};

export default Dashboard;
