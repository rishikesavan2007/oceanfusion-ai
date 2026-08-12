import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiBell, FiSettings, FiDatabase, FiMap, FiSave } from 'react-icons/fi';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useNotification } from '../context/NotificationContext';

const TABS = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'security', label: 'Password', icon: FiLock },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'preferences', label: 'Preferences', icon: FiSettings },
  { id: 'api', label: 'API', icon: FiDatabase },
  { id: 'map', label: 'Map', icon: FiMap },
];

const Settings = () => {
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const { addNotification } = useNotification();
  const save = () => { setSaving(true); setTimeout(() => { setSaving(false); addNotification('Settings saved.', 'success'); }, 1000); };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-6"><h1 className="text-2xl font-extrabold gradient-text">Settings</h1><p className="text-sm text-slate-400 mt-0.5">OCEANFUSION AI — Account and preferences.</p></div>
      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="w-full lg:w-56 shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${tab === t.id ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </nav>
        <div className="flex-1">
          <Card className="p-6 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-6">
                {tab === 'profile' && (
                  <>
                    <h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-3">Profile</h3>
                    <div className="flex items-center gap-5"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">A</div><div><Button variant="secondary" size="sm">Change Avatar</Button><p className="text-[10px] text-slate-500 mt-1">1MB max.</p></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4"><Input label="Name" defaultValue="Admin User" /><Input label="Email" defaultValue="admin@oceanfusion.ai" type="email" /><Input label="Role" defaultValue="Operator" disabled /><Input label="Organization" defaultValue="OCEANFUSION AI" /></div>
                  </>
                )}
                {tab === 'security' && (<><h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-3">Password</h3><div className="max-w-md space-y-4"><Input label="Current Password" type="password" /><Input label="New Password" type="password" /><Input label="Confirm" type="password" /></div><div className="pt-4"><h4 className="text-sm font-semibold text-white mb-2">2FA</h4><p className="text-sm text-slate-400 mb-3">Add extra security.</p><Button variant="neon" size="sm">Enable 2FA</Button></div></>)}
                {tab === 'notifications' && (<><h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-3">Notifications</h3><div className="space-y-3">{[{ t: 'Email Alerts', d: 'High severity alerts.', on: true }, { t: 'SMS', d: 'Critical system SMS.', on: false }, { t: 'Weekly Reports', d: 'Automated PDF.', on: true }, { t: 'New Logins', d: 'New device access.', on: true }].map((item, i) => (<label key={i} className="flex items-start justify-between cursor-pointer p-4 rounded-xl border border-white/[0.06] hover:bg-white/[0.03] transition-colors"><div className="pr-4"><span className="block text-sm font-semibold text-slate-200">{item.t}</span><span className="block text-xs text-slate-500 mt-0.5">{item.d}</span></div><div className="relative inline-flex"><input type="checkbox" className="sr-only peer" defaultChecked={item.on} /><div className="w-9 h-5 bg-slate-700 peer-checked:bg-primary rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" /></div></label>))}</div></>)}
                {tab === 'preferences' && (<><h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-3">Preferences</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-5">{[['Language', ['English (US)']], ['Timezone', ['UTC', 'EST', 'PST']], ['Units', ['Metric', 'Imperial']]].map(([l, opts]) => (<div key={l}><label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{l}</label><select className="w-full rounded-xl bg-white/5 border border-white/[0.06] text-sm text-slate-300 p-2.5 outline-none">{opts.map(o => <option key={o}>{o}</option>)}</select></div>))}</div></>)}
                {tab === 'api' && (<><h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-3">API</h3><p className="text-sm text-slate-400 mb-4">API keys for programmatic access.</p><div className="bg-white/[0.03] rounded-xl p-4 flex items-center justify-between border border-white/[0.06]"><div><p className="text-sm font-semibold text-slate-200">Production Key</p><p className="text-xs text-slate-500 font-grotesk mt-0.5">pk_live_*************************</p></div><div className="flex gap-2"><Button variant="ghost" size="sm">Reveal</Button><Button variant="secondary" size="sm">Roll</Button></div></div></>)}
                {tab === 'map' && (<><h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-3">Map Settings</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Default Layer</label><select className="w-full rounded-xl bg-white/5 border border-white/[0.06] text-sm text-slate-300 p-2.5 outline-none"><option>Dark (Carto)</option><option>Street (OSM)</option><option>Satellite</option></select></div><div><label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Clustering</label><select className="w-full rounded-xl bg-white/5 border border-white/[0.06] text-sm text-slate-300 p-2.5 outline-none"><option>40px</option><option>60px</option><option>Off</option></select></div></div></>)}
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 pt-5 border-t border-white/[0.06] flex justify-end"><Button variant="primary" onClick={save} isLoading={saving} icon={FiSave}>Save</Button></div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
