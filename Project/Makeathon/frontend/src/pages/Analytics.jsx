import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFilter } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';
import Card from '../components/Card';
import Button from '../components/Button';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, Title, Tooltip, Legend, Filler);

const Analytics = () => {
  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { usePointStyle: true, color: '#64748B', font: { family: 'Inter', size: 11 } } }, tooltip: { backgroundColor: '#1E293B', titleColor: '#F8FAFC', bodyColor: '#F8FAFC', padding: 10, cornerRadius: 12, borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1 } },
    scales: { x: { grid: { display: false }, ticks: { color: '#475569', font: { family: 'Inter', size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,0.04)', borderDash: [4, 4] }, ticks: { color: '#475569', font: { family: 'Inter', size: 10 } }, border: { display: false } } },
  };
  const radarOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.06)' }, pointLabels: { color: '#64748B', font: { family: 'Inter', size: 10 } } } } };

  const areaData = { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], datasets: [{ label: 'Incidents', data: [120, 190, 150, 220, 180, 250, 310], fill: true, backgroundColor: 'rgba(99,102,241,0.1)', borderColor: '#6366F1', tension: 0.4 }] };
  const barData = { labels: ['Pacific', 'Gulf', 'North Sea', 'Tasman', 'Bering'], datasets: [{ label: 'High', data: [45, 30, 15, 20, 35], backgroundColor: '#EF4444', borderRadius: 8 }, { label: 'Medium', data: [60, 45, 30, 25, 40], backgroundColor: '#F59E0B', borderRadius: 8 }, { label: 'Safe', data: [80, 90, 120, 85, 50], backgroundColor: '#10B981', borderRadius: 8 }] };
  const radarData = { labels: ['Oil Spills', 'Cyclones', 'High Waves', 'Fishing', 'Tsunami', 'Pollution'], datasets: [{ data: [65, 59, 90, 81, 56, 55], backgroundColor: 'rgba(34,211,238,0.1)', borderColor: '#22D3EE', pointBackgroundColor: '#22D3EE' }] };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-2xl font-extrabold gradient-text">Analytics</h1><p className="text-sm text-slate-400 mt-0.5">OCEANFUSION AI — Historical data and modeling.</p></div>
        <div className="flex gap-2"><Button variant="secondary" size="sm" icon={FiDownload}>CSV</Button><Button variant="secondary" size="sm" icon={FiDownload}>PDF</Button></div>
      </div>
      <Card className="p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px]"><label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Range</label><div className="flex gap-2"><input type="date" defaultValue="2026-01-01" className="w-full rounded-xl bg-white/5 border border-white/[0.06] text-xs text-slate-300 p-2.5 outline-none" /><input type="date" defaultValue="2026-07-15" className="w-full rounded-xl bg-white/5 border border-white/[0.06] text-xs text-slate-300 p-2.5 outline-none" /></div></div>
        <div className="w-40"><label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Region</label><select className="w-full rounded-xl bg-white/5 border border-white/[0.06] text-xs text-slate-300 p-2.5 outline-none"><option>All</option><option>Pacific</option><option>Atlantic</option></select></div>
        <Button variant="primary" size="sm" icon={FiFilter}>Apply</Button>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card animated delay={0.1} className="p-5 h-[360px] flex flex-col"><h3 className="text-sm font-bold text-white mb-3">Incident Volume</h3><div className="flex-1"><Line options={chartOpts} data={areaData} /></div></Card>
        <Card animated delay={0.15} className="p-5 h-[360px] flex flex-col"><h3 className="text-sm font-bold text-white mb-3">Regional Severity</h3><div className="flex-1"><Bar options={chartOpts} data={barData} /></div></Card>
        <Card animated delay={0.2} className="p-5 h-[360px] flex flex-col items-center"><h3 className="text-sm font-bold text-white w-full mb-3">Hazard Frequency</h3><div className="flex-1 w-full max-w-xs"><Radar options={radarOpts} data={radarData} /></div></Card>
        <Card animated delay={0.25} className="p-5 h-[360px] flex flex-col">
          <h3 className="text-sm font-bold text-white mb-3">Heatmap (30d)</h3>
          <div className="flex-1 w-full">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
              <div key={d} className="flex gap-1 items-center mb-1"><div className="w-8 text-[10px] text-slate-500 font-medium">{d}</div>
                {[0, 1, 2, 3, 4, 5].map(j => { const v = Math.floor(Math.abs(Math.sin(i * 3 + j * 7)) * 100);
                  return <div key={j} className={`flex-1 h-7 rounded-lg transition-all cursor-crosshair ${v > 80 ? 'bg-primary' : v > 50 ? 'bg-primary/60' : v > 20 ? 'bg-primary/30' : 'bg-primary/10'}`} title={`${v} incidents`} />; })}
              </div>
            ))}
            <div className="flex justify-end items-center gap-2 mt-2 text-[10px] text-slate-500"><span>Low</span><div className="w-16 h-1.5 rounded-full bg-gradient-to-r from-primary/10 to-primary" /><span>High</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
