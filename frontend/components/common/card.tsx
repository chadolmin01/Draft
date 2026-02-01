/**
 * 공통 카드 컴포넌트
 */

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm ${paddingClasses[padding]} ${
        hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ icon, title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
}

export function CardContent({ children }: CardContentProps) {
  return <div className="text-gray-700">{children}</div>;
}

interface InfoCardProps {
  icon: string;
  title: string;
  content: string;
  highlight?: boolean;
}

export function InfoCard({ icon, title, content, highlight = false }: InfoCardProps) {
  return (
    <Card className={highlight ? 'ring-2 ring-indigo-600' : ''}>
      <CardHeader icon={icon} title={title} />
      <CardContent>
        <p className="leading-relaxed">{content}</p>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  description?: string;
  color?: 'indigo' | 'green' | 'yellow' | 'red';
}

export function StatCard({ label, value, description, color = 'indigo' }: StatCardProps) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className={`${colorClasses[color]} p-4 rounded-lg`}>
      <div className="text-xs mb-1">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {description && <div className="text-xs mt-1 opacity-75">{description}</div>}
    </div>
  );
}
