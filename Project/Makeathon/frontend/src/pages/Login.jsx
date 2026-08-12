import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiZap } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const [identifier, setIdentifier] = useState('admin@oceansentinel.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) { addNotification('Please enter your credentials.', 'error'); return; }
    setIsLoading(true);
    try { await login(identifier, password); addNotification('Welcome back!', 'success'); navigate('/home'); }
    catch { addNotification('Invalid credentials.', 'error'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#030712] relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-16">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <FiZap className="w-6 h-6 text-white" />
            </div>
            <div><span className="text-xl font-extrabold gradient-text block leading-tight">OCEANFUSION</span><span className="text-[10px] font-semibold text-slate-500 tracking-[0.3em]">AI PLATFORM</span></div>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">Maritime Intelligence<br/>Command Center.</h2>
          <p className="text-lg text-slate-400 leading-relaxed mb-12">Real-time monitoring, AI-powered analytics, and automated hazard response for modern maritime operations.</p>
          <div className="flex gap-10">
            {[{ v: '24/7', l: 'Monitoring' }, { v: '99.9%', l: 'Uptime' }, { v: '< 2s', l: 'Alert Time' }].map((s, i) => (
              <div key={i}><span className="stat-number text-2xl text-white">{s.v}</span><span className="block text-xs text-slate-500 mt-0.5">{s.l}</span></div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-[480px] flex items-center justify-center p-8 lg:p-16 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20"><FiZap className="w-5 h-5 text-white" /></div>
            <div><span className="text-lg font-extrabold gradient-text block leading-tight">OCEANFUSION</span><span className="text-[9px] font-semibold text-slate-500 tracking-[0.25em]">AI PLATFORM</span></div>
          </div>
          <div className="glass-card p-8">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-sm text-slate-400 mb-8">Sign in to the command center.</p>
            <form onSubmit={handleLogin} className="space-y-5">
              <Input id="identifier" type="text" label="Email or Phone" placeholder="name@company.com" icon={FiMail} value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
              <Input id="password" type="password" label="Password" placeholder="••••••••" icon={FiLock} value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-slate-400 cursor-pointer"><input type="checkbox" className="rounded border-slate-600 bg-transparent text-primary focus:ring-primary/30 mr-2 h-4 w-4" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />Remember me</label>
                <a href="#" className="text-primary hover:text-secondary font-medium transition-colors">Forgot?</a>
              </div>
              <Button type="submit" variant="primary" fullWidth isLoading={isLoading} size="lg">Sign In</Button>
            </form>
            <p className="mt-6 text-center text-[11px] text-slate-500">Demo: <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-slate-400">admin@oceansentinel.com</span></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
