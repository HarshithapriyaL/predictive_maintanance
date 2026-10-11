import { cn } from '@/lib/utils';
import { severityConfig } from '@/lib/format';
import type { AlertSeverity } from '@/types/api';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'checking' | 'idle' | 'running' | 'stopped' | 'ready' | 'not-ready';
  label?: string;
  className?: string;
}

const statusMap = {
  online: { dot: 'bg-status-success', text: 'text-status-success', label: 'Online' },
  offline: { dot: 'bg-status-critical', text: 'text-status-critical', label: 'Offline' },
  checking: { dot: 'bg-status-info animate-pulse', text: 'text-status-info', label: 'Checking…' },
  idle: { dot: 'bg-text-muted', text: 'text-text-muted', label: 'Idle' },
  running: { dot: 'bg-status-success animate-pulse-slow', text: 'text-status-success', label: 'Running' },
  stopped: { dot: 'bg-text-muted', text: 'text-text-muted', label: 'Stopped' },
  ready: { dot: 'bg-status-success', text: 'text-status-success', label: 'Ready' },
  'not-ready': { dot: 'bg-status-warning', text: 'text-status-warning', label: 'Not Ready' },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const cfg = statusMap[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs font-medium',
        cfg.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {label || cfg.label}
    </span>
  );
}

export function SeverityBadge({
  severity,
  className,
}: {
  severity: AlertSeverity;
  className?: string;
}) {
  const cfg = severityConfig(severity);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        cfg.bg,
        cfg.border,
        cfg.color,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}
