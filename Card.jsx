import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Card = ({ children, className, animated = false, delay = 0, glow = false, ...props }) => {
  const Comp = animated ? motion.div : 'div';
  const anim = animated ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] } } : {};

  return (
    <Comp className={clsx('glass-card', glow && 'shadow-glow', className)} {...anim} {...props}>
      {children}
    </Comp>
  );
};

export default Card;
