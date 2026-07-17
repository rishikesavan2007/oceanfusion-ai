import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({
  children, onClick, type = 'button', variant = 'primary', size = 'md',
  className, isLoading = false, disabled = false, fullWidth = false, icon: Icon, ...props
}) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 focus:outline-none relative overflow-hidden';

  const variants = {
    primary: 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30',
    secondary: 'bg-white/5 text-text-light border border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm',
    danger: 'bg-gradient-to-r from-danger to-red-500 text-white shadow-lg shadow-danger/20',
    ghost: 'bg-transparent text-text-muted hover:text-text-light hover:bg-white/5',
    neon: 'bg-transparent text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/10 hover:border-neon-cyan/50 shadow-neon',
  };

  const sizes = {
    sm: 'text-xs px-4 py-2 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5',
  };

  return (
    <motion.button
      type={type}
      className={twMerge(clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', (disabled || isLoading) && 'opacity-40 cursor-not-allowed', className))}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { y: -2, scale: 1.01 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.97 } : {}}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
};

export default Button;
