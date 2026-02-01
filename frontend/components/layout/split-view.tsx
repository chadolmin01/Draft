'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  reverse?: boolean;
}

export function SplitView({ left, right, className, reverse = false }: SplitViewProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-screen',
        reverse && 'lg:grid-flow-dense',
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, x: reverse ? 40 : -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] }}
        className={cn(
          'flex flex-col justify-center p-8 lg:p-16',
          reverse && 'lg:col-start-2'
        )}
      >
        {left}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: reverse ? -40 : 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.6, 0.05, 0.01, 0.9] }}
        className={cn(
          'relative flex flex-col justify-center p-8 lg:p-16',
          reverse && 'lg:col-start-1 lg:row-start-1'
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border/50 to-transparent lg:bg-gradient-to-b lg:bg-none lg:via-transparent" />
        {right}
      </motion.div>
    </div>
  );
}
