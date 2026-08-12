import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiTrash2, FiAlertTriangle, FiRefreshCw, FiZap, FiWifiOff } from 'react-icons/fi';
import axios from 'axios';

const FLASK_BASE = 'http://localhost:5000';

const TypingIndicator = () => (
  <div className="flex items-end gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/20"><FiZap className="w-3.5 h-3.5 text-white" /></div>
    <div className="glass-card px-5 py-3 rounded-2xl rounded-bl-md">
      <div className="flex gap-1.5 items-center h-5">{[0, 1, 2].map(i => <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} />)}</div>
    </div>
  </div>
);

const ChatBubble = ({ message, isUser, timestamp }) => (
  <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }} className={`flex items-end gap-2.5 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-bold ${isUser ? 'bg-gradient-to-br from-secondary to-neon-cyan text-white' : 'bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/20'}`}>
      {isUser ? 'U' : <FiZap className="w-3.5 h-3.5" />}
    </div>
    <div className="max-w-[70%]">
      <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${isUser ? 'bg-gradient-to-r from-secondary to-neon-cyan text-white rounded-2xl rounded-br-md shadow-lg shadow-secondary/20' : 'glass-card rounded-2xl rounded-bl-md text-slate-200'}`}>{message}</div>
      <span className={`block text-[10px] mt-1 text-slate-500 ${isUser ? 'text-right' : ''}`}>{timestamp}</span>
    </div>
  </motion.div>
);

const Chatbot = () => {
  const [messages, setMessages] = useState([{ id: 0, text: "Hello! I'm OCEANFUSION AI, your maritime intelligence assistant. How can I help?", isUser: false, timestamp: fmt(new Date()) }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailed, setLastFailed] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  function fmt(d) { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

  const sendMessage = async (text) => {
    if (!isOnline) { setError('⚠ AI Assistant requires an internet connection.'); return; }
    const t = (text || input).trim();
    if (!t || isLoading) return;
    setError(null); setLastFailed(null);
    setMessages(p => [...p, { id: Date.now(), text: t, isUser: true, timestamp: fmt(new Date()) }]);
    setInput('');
    setIsLoading(true);
    try {
      const res = await axios.post(`${FLASK_BASE}/get`, { message: t }, { timeout: 30000 });
      setMessages(p => [...p, { id: Date.now() + 1, text: res.data.reply || 'No response.', isUser: false, timestamp: fmt(new Date()) }]);
    } catch (err) {
      setError(err.response ? `⚠ Server error (${err.response.status}).` : '⚠ Unable to connect to chatbot server.');
      setLastFailed(t);
    } finally { setIsLoading(false); inputRef.current?.focus(); }
  };

  const clearChat = async () => {
    try { await axios.post(`${FLASK_BASE}/clear`, {}, { timeout: 5000 }); } catch {}
    setMessages([{ id: Date.now(), text: 'Chat cleared. How can I help?', isUser: false, timestamp: fmt(new Date()) }]);
    setError(null); setLastFailed(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20"><FiZap className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-lg font-extrabold gradient-text leading-tight">OCEANFUSION AI</h1>
            <p className="text-[11px] text-slate-500">Powered by Groq · Llama 3.1</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && <span className="flex items-center gap-1.5 text-[11px] font-semibold text-warning bg-warning/10 border border-warning/20 rounded-lg px-2.5 py-1"><FiWifiOff className="w-3 h-3" />Offline</span>}
          <button onClick={clearChat} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-danger px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"><FiTrash2 className="w-4 h-4" /><span className="hidden sm:inline">Clear</span></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 sm:p-6 custom-scrollbar">
        <AnimatePresence>{messages.map(m => <ChatBubble key={m.id} message={m.text} isUser={m.isUser} timestamp={m.timestamp} />)}</AnimatePresence>
        {isLoading && <TypingIndicator />}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="mx-2 mb-3 flex items-center gap-3 bg-danger/10 border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm">
              <FiAlertTriangle className="w-4 h-4 shrink-0" /><span className="flex-1">{error}</span>
              {lastFailed && <button onClick={() => sendMessage(lastFailed)} className="flex items-center gap-1 text-xs font-semibold hover:underline"><FiRefreshCw className="w-3 h-3" />Retry</button>}
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      <div className="pt-4 shrink-0">
        <div className="relative group">
          <div className="flex items-end gap-2 glass-card p-2 focus-within:shadow-glow transition-shadow">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={isOnline ? 'Type your message…' : 'AI Assistant requires internet…'} disabled={!isOnline} rows={1} className="flex-1 resize-none bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none px-3 py-2.5 max-h-32 custom-scrollbar disabled:opacity-50 disabled:cursor-not-allowed" />
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }} onClick={() => sendMessage()} disabled={!input.trim() || isLoading || !isOnline} className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all"><FiSend className="w-4 h-4" /></motion.button>
          </div>
          {!isOnline && <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block px-3 py-1 bg-slate-800 text-white text-[10px] rounded-lg shadow-lg border border-white/10 whitespace-nowrap">AI Assistant is available only when internet is detected.</div>}
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
};

export default Chatbot;
