import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { useNotification } from '../context/NotificationContext';

const ToastNotification = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-success" />;
      case 'error':
        return <FiAlertCircle className="w-5 h-5 text-danger" />;
      default:
        return <FiInfo className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map(({ id, message, type }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className="flex items-center justify-between p-4 w-80 bg-light-card dark:bg-dark-card rounded-xl shadow-hover dark:shadow-dark-hover border border-slate-200 dark:border-slate-700 pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              {getIcon(type)}
              <p className="text-sm font-medium text-text-main dark:text-text-light">
                {message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(id)}
              className="text-text-muted hover:text-text-main dark:hover:text-text-light transition-colors p-1"
            >
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotification;
