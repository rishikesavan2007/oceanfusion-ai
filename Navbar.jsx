import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiSearch, FiBell, FiUser, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const tick = () => setUtcTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="glass-nav sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><FiMenu className="w-5 h-5" /></button>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/[0.06] font-grotesk tabular-nums text-slate-400">{utcTime} UTC</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="hidden sm:flex items-center">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input type="text" placeholder="Search…" className="w-48 lg:w-56 pl-9 pr-3 py-2 rounded-xl bg-white/5 text-sm text-slate-200 placeholder:text-slate-600 border border-white/[0.06] focus:border-primary/40 focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
          </div>
        </div>
        <button className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors relative">
          <FiBell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger shadow-lg shadow-danger/50" />
        </button>
        <div className="flex items-center gap-2.5 ml-1 pl-3 border-l border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white text-xs font-bold">{(user?.name || 'A')[0]}</span>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold text-slate-200 leading-tight">{user?.name || 'Admin'}</span>
            <span className="text-[10px] text-slate-500 leading-tight">Operator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
