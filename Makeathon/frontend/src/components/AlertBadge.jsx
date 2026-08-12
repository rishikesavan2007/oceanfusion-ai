import React from 'react';
import clsx from 'clsx';

const AlertBadge = ({ severity, className }) => {
  const getColors = () => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'red':
      case 'danger':
        return 'bg-danger/10 text-danger border-danger/20';
      case 'medium':
      case 'orange':
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
      case 'green':
      case 'safe':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize tracking-wide',
      getColors(),
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current"></span>
      {severity}
    </span>
  );
};

export default AlertBadge;
