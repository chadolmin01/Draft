'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AsymmetricGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}

const gridConfigs = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export function AsymmetricGrid({
  children,
  className,
  columns = 3,
}: AsymmetricGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      }}
      className={cn(
        'grid gap-4 md:gap-6',
        gridConfigs[columns],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface AsymmetricGridItemProps {
  children: React.ReactNode;
  className?: string;
  span?: 1 | 2 | 3;
}

export function AsymmetricGridItem({
  children,
  className,
  span = 1,
}: AsymmetricGridItemProps) {
  const spanClasses = {
    1: '',
    2: 'md:col-span-2',
    3: 'md:col-span-2 lg:col-span-3',
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5, ease: [0.6, 0.05, 0.01, 0.9] }}
      className={cn(spanClasses[span], className)}
    >
      {children}
    </motion.div>
  );
}
