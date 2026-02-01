/**
 * 공통 배지 컴포넌트
 */

import type { Tier } from '@/lib/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-indigo-100 text-indigo-700',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
}

export function TierBadge({ tier }: { tier: Tier }) {
  const tierConfig = {
    light: { variant: 'default' as const, label: 'LIGHT' },
    pro: { variant: 'info' as const, label: 'PRO' },
    heavy: { variant: 'success' as const, label: 'HEAVY' },
  };

  const config = tierConfig[tier];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function StageBadge({ stage }: { stage: number }) {
  return (
    <Badge variant="info" size="sm">
      Stage {stage}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: 'available' | 'locked' | 'generating' | 'completed' }) {
  const statusConfig = {
    available: { variant: 'success' as const, label: '사용 가능' },
    locked: { variant: 'default' as const, label: '잠김' },
    generating: { variant: 'warning' as const, label: '생성 중' },
    completed: { variant: 'info' as const, label: '완료' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: 'must-have' | 'should-have' | 'nice-to-have' }) {
  const priorityConfig = {
    'must-have': { variant: 'error' as const, label: 'MUST' },
    'should-have': { variant: 'warning' as const, label: 'SHOULD' },
    'nice-to-have': { variant: 'default' as const, label: 'NICE' },
  };

  const config = priorityConfig[priority];

  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}
