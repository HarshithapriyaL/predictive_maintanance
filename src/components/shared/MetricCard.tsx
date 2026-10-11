import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  highlight?: boolean;
  accent?: 'teal' | 'yellow' | 'indigo' | 'success' | 'warning' | 'critical' | 'info';
  children?: React.ReactNode;
  className?: string;
}

const accentMap = {
  teal: { icon: 'text-teal-industrial bg-teal-industrial/10' },
  yellow: { icon: 'text-signal-yellow bg-signal-yellow/10' },
  indigo: { icon: 'text-indigo-royal bg-indigo-royal/20' },
  success: { icon: 'text-status-success bg-status-success/10' },
  warning: { icon: 'text-status-warning bg-status-warning/10' },
  critical: { icon: 'text-status-critical bg-status-critical/10' },
  info: { icon: 'text-status-info bg-status-info/10' },
};

export function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  subtitle,
  highlight = false,
  accent = 'teal',
  children,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-white/10 bg-surface-card p-5 transition-all duration-200 hover:border-white/20 hover:bg-surface-elevated',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={cn(
                'font-mono text-2xl font-semibold tabular-nums',
                highlight ? 'text-signal-yellow' : 'text-text-primary'
              )}
            >
              {value}
            </span>
            {unit && (
              <span className="text-sm text-text-secondary">{unit}</span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 truncate text-xs text-text-secondary">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            accentMap[accent].icon
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
