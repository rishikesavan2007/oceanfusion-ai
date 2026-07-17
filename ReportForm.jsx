import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiMapPin, FiCalendar, FiMic, FiCheck, FiChevronRight, FiChevronLeft, FiWifi, FiWifiOff, FiDatabase, FiImage, FiX } from 'react-icons/fi';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useNotification } from '../context/NotificationContext';

const TYPES = ['Oil Spill', 'High Waves', 'Cyclone', 'Tsunami', 'Illegal Fishing', 'Water Pollution', 'Marine Animal Distress', 'Other'];
const STEPS = ['Location', 'Details', 'Media', 'Review'];

const ReportForm = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ locationName: '', latitude: '', longitude: '', incidentType: '', severity: 50, date: new Date().toISOString().split('T')[0], description: '', reporterName: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { addNotification } = useNotification();

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const next = () => setStep(p => Math.min(p + 1, 3));
  const prev = () => setStep(p => Math.max(p - 1, 0));
  const attachLoc = () => { setForm(p => ({ ...p, latitude: '34.0522', longitude: '-118.2437' })); addNotification('Location attached.', 'success'); };

  const submit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false); setShowSuccess(true);
      addNotification(isOnline ? '✔ Report sent.' : '⚠ Saved locally. Will sync when online.', isOnline ? 'success' : 'warning');
    }, 1200);
  };

  const reset = () => { setStep(0); setForm({ locationName: '', latitude: '', longitude: '', incidentType: '', severity: 50, date: new Date().toISOString().split('T')[0], description: '', reporterName: '' }); setSelectedFiles([]); };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold gradient-text">Report Incident</h1>
          <p className="text-sm text-slate-400 mt-0.5">OCEANFUSION AI — Sender Node data submission.</p>
        </div>
      </div>

      {/* Status Cards — Network + SQLite only. AI Assistant removed (lives in Dashboard). */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Network Status */}
        <Card className="p-4 flex items-center gap-3">
          {isOnline ? <FiWifi className="w-5 h-5 text-success" /> : <FiWifiOff className="w-5 h-5 text-slate-500" />}
          <div>
            <span className={`text-sm font-semibold ${isOnline ? 'text-success' : 'text-slate-400'}`}>{isOnline ? 'Online' : 'Offline'}</span>
            <p className="text-[10px] text-slate-500">{isOnline ? 'Connected to server' : 'No network detected'}</p>
          </div>
        </Card>

        {/* SQLite Offline Storage */}
        <Card className="p-4 flex items-center gap-3">
          <FiDatabase className="w-5 h-5 text-neon-cyan" />
          <div>
            <span className="text-sm font-semibold text-neon-cyan">Offline Mode Enabled</span>
            <p className="text-[10px] text-slate-500">Data stored locally via SQLite · Auto-sync when connectivity returns</p>
          </div>
        </Card>
      </div>

      {/* Form */}
      <Card className="p-6 sm:p-8">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-white/[0.06] -z-10 rounded-full" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-primary to-neon-cyan -z-10 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i <= step ? 'bg-gradient-to-br from-primary to-neon-cyan text-white shadow-lg shadow-primary/30' : 'bg-white/5 border border-white/10 text-slate-500'}`}>
                {i < step ? <FiCheck className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] font-semibold ${i <= step ? 'text-slate-200' : 'text-slate-500'}`}>{s}</span>
            </div>
          ))}
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.15 }}>
              {step === 0 && (
                <div className="space-y-5">
                  <h3 className="text-base font-bold text-white">Location & Coordinates</h3>
                  <Input label="Region / Location" name="locationName" value={form.locationName} onChange={set} placeholder="e.g. Coastal Bay" icon={FiMapPin} />
                  <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.06] space-y-4">
                    <div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-200">GPS</span><Button variant="neon" size="sm" onClick={attachLoc} icon={FiMapPin}>Attach Location</Button></div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Latitude" name="latitude" type="number" step="any" value={form.latitude} onChange={set} placeholder="0.0000" />
                      <Input label="Longitude" name="longitude" type="number" step="any" value={form.longitude} onChange={set} placeholder="0.0000" />
                    </div>
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="text-base font-bold text-white">Incident Details</h3>
                  <div><label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Incident Type</label><select name="incidentType" value={form.incidentType} onChange={set} className="w-full rounded-2xl bg-white/5 border border-white/10 text-sm text-slate-200 py-2.5 px-3 outline-none focus:ring-1 focus:ring-primary/30"><option value="" disabled>Select…</option>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  <div><div className="flex justify-between text-sm mb-2"><label className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">Priority / Severity</label><span className="font-grotesk font-bold text-primary">{form.severity}/100</span></div><input type="range" name="severity" min="1" max="100" value={form.severity} onChange={set} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" /></div>
                  <Input label="Date" name="date" type="date" icon={FiCalendar} value={form.date} onChange={set} />
                  <div><label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label><textarea name="description" value={form.description} onChange={set} rows="3" className="w-full rounded-2xl bg-white/5 border border-white/10 text-sm text-slate-200 p-3 outline-none focus:ring-1 focus:ring-primary/30 resize-none" placeholder="Details…" maxLength={500} /><div className="text-right text-[10px] text-slate-500 mt-0.5">{form.description.length}/500</div></div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-5">
                  <h3 className="text-base font-bold text-white">Upload Evidence</h3>
                  <div
                    className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const files = Array.from(e.dataTransfer.files); setSelectedFiles(prev => [...prev, ...files]); }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <FiUploadCloud className="w-10 h-10 mx-auto text-slate-500 mb-3" />
                    <p className="text-sm font-semibold text-slate-300 mb-1">Drag & drop images or click to browse</p>
                    <p className="text-xs text-slate-500 mb-4">PNG, JPG up to 10MB</p>
                    <Button variant="secondary" size="sm" icon={FiImage} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Browse Files</Button>
                  </div>
                  {/* Selected files preview */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{selectedFiles.length} file(s) attached</p>
                      {selectedFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
                          <FiImage className="w-4 h-4 text-neon-cyan shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-200 truncate">{f.name}</p>
                            <p className="text-[10px] text-slate-500">{(f.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button onClick={() => removeFile(i)} className="p-1 text-slate-500 hover:text-danger transition-colors rounded-lg hover:bg-white/5">
                            <FiX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4"><div className="flex-1 h-px bg-white/[0.06]" /><span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">OR</span><div className="flex-1 h-px bg-white/[0.06]" /></div>
                  <Button variant="secondary" fullWidth icon={FiMic}>Record Voice Note</Button>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="text-base font-bold text-white">Review & Submit</h3>
                  <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06]">
                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                      <span className="text-slate-500">Location</span><span className="font-medium text-slate-200">{form.locationName || 'N/A'}</span>
                      <span className="text-slate-500">Coords</span><span className="font-grotesk text-slate-200">{form.latitude && form.longitude ? `${form.latitude}, ${form.longitude}` : 'N/A'}</span>
                      <span className="text-slate-500">Type</span><span className="text-slate-200">{form.incidentType || 'N/A'}</span>
                      <span className="text-slate-500">Severity</span><span className="font-grotesk text-slate-200">{form.severity}/100</span>
                    </div>
                  </div>
                  <Input label="Reporter Name (Optional)" name="reporterName" value={form.reporterName} onChange={set} placeholder="John Doe" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 pt-5 border-t border-white/[0.06] flex justify-between">
          <Button variant="ghost" onClick={prev} disabled={step === 0}><FiChevronLeft className="mr-1" />Back</Button>
          {step < 3 ? <Button variant="primary" onClick={next}>Next<FiChevronRight className="ml-1" /></Button> : <Button variant="primary" onClick={submit} isLoading={isSubmitting}>Submit Report</Button>}
        </div>
      </Card>

      <Modal isOpen={showSuccess} onClose={() => { setShowSuccess(false); reset(); }} title="Status">
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-success/15 text-success mb-4 border border-success/20"><FiCheck className="w-7 h-7" /></div>
          <h3 className="text-lg font-bold text-white mb-1.5">{isOnline ? 'Report Submitted' : 'Saved Locally'}</h3>
          <p className="text-sm text-slate-400 mb-5">{isOnline ? 'Data sent to OCEANFUSION AI network.' : 'Will sync when connectivity returns.'}</p>
          <Button variant="primary" fullWidth onClick={() => { setShowSuccess(false); reset(); }}>Done</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ReportForm;
