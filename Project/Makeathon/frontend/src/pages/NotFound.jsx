import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiZap } from 'react-icons/fi';
import Button from '../components/Button';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#030712] px-6 relative overflow-hidden">
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center max-w-md relative z-10">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 mb-6"><FiZap className="w-7 h-7 text-primary" /></div>
      <h1 className="stat-number text-7xl gradient-text mb-3">404</h1>
      <p className="text-lg font-semibold text-white mb-1">Page Not Found</p>
      <p className="text-sm text-slate-400 mb-8">This page doesn't exist in the OCEANFUSION AI platform.</p>
      <Link to="/dashboard"><Button variant="primary" icon={FiArrowLeft}>Back to Dashboard</Button></Link>
    </motion.div>
  </div>
);

export default NotFound;
