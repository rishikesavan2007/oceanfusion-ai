import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSend, FiLayout, FiArrowRight, FiZap, FiShield, FiRadio } from 'react-icons/fi';
import Card from '../components/Card';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl md:text-4xl font-extrabold gradient-text mb-2">OCEANFUSION AI</h1>
        <p className="text-slate-400 text-sm max-w-lg">Maritime intelligence and disaster response platform. Choose your role to begin.</p>
      </motion.div>

      {/* Two primary floating cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sender Node → Report Incident */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <div onClick={() => navigate('/report')} className="glass-card p-8 cursor-pointer group relative overflow-hidden h-full min-h-[280px]">
            <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-gradient-to-tr from-neon-cyan/20 to-secondary/10 rounded-full blur-3xl opacity-40 group-hover:opacity-80 transition-opacity duration-700" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-secondary/20 border border-white/10 flex items-center justify-center mb-6">
                <FiSend className="w-7 h-7 text-neon-cyan" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Sender Node</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-6">
                Report incidents from the field. Capture incident type, GPS location, priority, and media. Data is stored locally via SQLite when offline and syncs automatically.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-neon-cyan font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                  Report Incident <FiArrowRight className="w-4 h-4" />
                </span>
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">Sender</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Receiver Node → Dashboard */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <div onClick={() => navigate('/dashboard')} className="glass-card p-8 cursor-pointer group relative overflow-hidden h-full min-h-[280px]">
            <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-gradient-to-tl from-accent/20 to-primary/10 rounded-full blur-3xl opacity-40 group-hover:opacity-80 transition-opacity duration-700" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 border border-white/10 flex items-center justify-center mb-6">
                <FiLayout className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Receiver Node</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-6">
                Access the command dashboard. View live incident data, priority distribution, active/resolved reports, heat maps, and the AI Assistant.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-accent font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                  Open Dashboard <FiArrowRight className="w-4 h-4" />
                </span>
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">Receiver</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Uptime', value: '99.9%', icon: FiZap, color: 'text-primary' },
          { label: 'Response', value: '< 2s', icon: FiRadio, color: 'text-neon-cyan' },
          { label: 'Monitoring', value: '24/7', icon: FiShield, color: 'text-accent' },
          { label: 'Nodes Active', value: '7', icon: FiSend, color: 'text-success' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}>
            <Card className="p-4 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
              <div className="stat-number text-2xl text-white mb-0.5">{s.value}</div>
              <div className="text-[11px] text-slate-500 font-medium">{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
