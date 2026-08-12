import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiInfo, FiMap, FiBarChart2, FiSettings, FiChevronLeft, FiChevronRight, FiUser, FiLogOut, FiZap } from 'react-icons/fi';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /*
   * Sidebar keeps: Home, How It Works, Ocean Map, Analytics, Settings.
   * Removed from sidebar: Dashboard, Report Incident, AI Assistant
   * (accessed via Home cards or Dashboard panel).
   */
  const navItems = [
    { path: '/home', label: 'Home', icon: FiHome },
    { path: '/how-it-works', label: 'How It Works', icon: FiInfo },
    { path: '/map', label: 'Ocean Map', icon: FiMap, badge: 'Live' },
    { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
    { path: '/settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: window.innerWidth >= 1024 ? (collapsed ? 72 : 240) : 240,
          x: isOpen ? 0 : (window.innerWidth >= 1024 ? 0 : -260),
        }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
        className={clsx(
          'fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col',
          'bg-[#030712]/90 backdrop-blur-xl border-r border-white/[0.06]',
          !isOpen && 'hidden lg:flex'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <FiZap className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                <span className="text-sm font-extrabold text-white tracking-tight leading-none gradient-text">OCEANFUSION</span>
                <span className="text-[9px] font-semibold text-slate-500 tracking-[0.25em]">AI PLATFORM</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-white/10 rounded-full items-center justify-center text-slate-400 hover:text-white transition-colors shadow-lg z-10"
        >
          {collapsed ? <FiChevronRight className="w-3 h-3" /> : <FiChevronLeft className="w-3 h-3" />}
        </button>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6 px-2.5 flex flex-col gap-1 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                  isActive ? 'bg-primary/15 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-pill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-primary to-neon-cyan rounded-r-full"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <item.icon className={clsx('w-[18px] h-[18px] shrink-0', collapsed && 'mx-auto')} />
                  {!collapsed && <span className="text-sm font-medium flex-1 whitespace-nowrap">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-danger/20 text-danger rounded-md animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06] space-y-3">
          {!collapsed && (
            <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 p-3 border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[11px] font-semibold text-slate-200">Systems Online</span>
              </div>
              <p className="text-[10px] text-slate-500">7 nodes · 99.9% uptime</p>
            </div>
          )}
          <div className={clsx('flex items-center gap-3', collapsed ? 'justify-center' : '')}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <FiUser className="w-3.5 h-3.5 text-white" />
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-slate-200 truncate">{user?.name || 'Admin'}</span>
                  <span className="block text-[10px] text-slate-500">Operator</span>
                </div>
                <button onClick={() => { logout(); navigate('/'); }} className="p-1.5 text-slate-500 hover:text-danger transition-colors rounded-lg hover:bg-white/5">
                  <FiLogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
