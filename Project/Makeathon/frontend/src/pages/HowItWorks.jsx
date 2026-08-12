import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSend, FiLayout, FiFileText, FiMap, FiMessageSquare, FiWifiOff, FiZap, FiDatabase, FiRadio, FiShield } from 'react-icons/fi';
import Card from '../components/Card';
import Button from '../components/Button';

const sections = [
  { icon: FiZap, title: 'App Overview', color: 'text-primary', desc: 'OCEANFUSION AI is a real-time maritime disaster management platform. It connects field operators (Sender Nodes) with command centers (Receiver Nodes) to enable rapid incident reporting, monitoring, and AI-assisted response.' },
  { icon: FiRadio, title: 'Workflow', color: 'text-neon-cyan', desc: 'Field operators submit incident reports via the Sender Node. Data flows to the Receiver Node dashboard where operators view live stats, heat maps, and priority-sorted incidents. AI assists with analysis when online.' },
  { icon: FiSend, title: 'Sender Node', color: 'text-neon-cyan', desc: 'The Sender Node allows field operators to report incidents with type classification, GPS coordinates, severity levels, and media attachments. Reports are stored locally in SQLite when offline and auto-sync when connectivity returns.' },
  { icon: FiLayout, title: 'Receiver Node', color: 'text-accent', desc: 'The Receiver Node displays the command dashboard with real-time incident summaries, active/resolved/pending counts, priority distribution, live statistics, and an embedded heat map showing incident density.' },
  { icon: FiFileText, title: 'Incident Reporting', color: 'text-warning', desc: 'Reports include incident type, description, GPS location, priority selection (P1–P4), and image attachments. The multi-step form guides users through each field with validation and progress tracking.' },
  { icon: FiMap, title: 'Dashboard & Heat Map', color: 'text-success', desc: 'The dashboard shows live widgets for incident summary, active/resolved/pending counts, and priority distribution. An embedded heat map visualizes incident density geographically with animated transitions.' },
  { icon: FiMessageSquare, title: 'AI Assistant', color: 'text-primary', desc: 'OCEANFUSION AI includes a Groq-powered chat assistant for maritime intelligence queries. The assistant is available only when an internet connection is detected. Offline, the feature is disabled with a clear explanation.' },
  { icon: FiWifiOff, title: 'Offline Functionality', color: 'text-danger', desc: 'All incident reports are stored locally in SQLite when no network is available. Data auto-syncs to the server when connectivity is restored. The UI shows a clear offline status indicator and disables network-dependent features.' },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Button variant="ghost" onClick={() => navigate('/home')} icon={FiArrowLeft} className="mb-4">Back to Home</Button>
        <h1 className="text-3xl font-extrabold gradient-text mb-2">How OCEANFUSION AI Works</h1>
        <p className="text-slate-400 text-sm max-w-xl">A complete guide to the platform's workflow, architecture, and offline capabilities.</p>
      </motion.div>

      {/* Flow diagram */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <Card className="p-6 overflow-hidden">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Navigation Flow</h3>
          <div className="flex flex-col sm:flex-row items-center gap-3 text-sm font-medium">
            {[
              { label: 'Home', color: 'from-primary to-secondary' },
              { label: 'How It Works', color: 'from-secondary to-neon-cyan' },
              { label: 'Sender → Report', color: 'from-neon-cyan to-accent' },
              { label: 'Receiver → Dashboard', color: 'from-accent to-primary' },
            ].map((item, i) => (
              <React.Fragment key={i}>
                <span className={`px-4 py-2 rounded-xl bg-gradient-to-r ${item.color} text-white text-xs font-bold whitespace-nowrap`}>{item.label}</span>
                {i < 3 && <span className="text-slate-600 hidden sm:block">→</span>}
              </React.Fragment>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}>
            <Card className="p-6 flex items-start gap-5 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:border-white/10 transition-colors">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1.5">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
