import type { AlertSeverity, SimulatorScenario } from '@/types/api';

export function formatTimestamp(ts: string | null | undefined): string {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return ts;
  }
}

export function formatTimeShort(ts: string | null | undefined): string {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return ts;
  }
}

export function formatNumber(
  val: number | null | undefined,
  decimals = 1
): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return `${(val * 100).toFixed(1)}%`;
}

export function severityConfig(sev: AlertSeverity): {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
} {
  switch (sev) {
    case 'critical':
      return {
        label: 'Critical',
        color: 'text-status-critical',
        bg: 'bg-status-critical/10',
        border: 'border-status-critical/30',
        dot: 'bg-status-critical',
      };
    case 'warning':
      return {
        label: 'Warning',
        color: 'text-status-warning',
        bg: 'bg-status-warning/10',
        border: 'border-status-warning/30',
        dot: 'bg-status-warning',
      };
    case 'info':
      return {
        label: 'Info',
        color: 'text-status-info',
        bg: 'bg-status-info/10',
        border: 'border-status-info/30',
        dot: 'bg-status-info',
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-text-muted',
        bg: 'bg-white/5',
        border: 'border-white/10',
        dot: 'bg-gray-400',
      };
  }
}

export function scenarioLabel(s: SimulatorScenario): string {
  switch (s) {
    case 'normal':
      return 'Normal';
    case 'abnormal_high_temp':
      return 'Abnormal High Temperature';
    case 'abnormal_wear':
      return 'Abnormal Tool Wear';
    default:
      return s;
  }
}

export function relativeTime(ts: string | null | undefined): string {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    const diff = Date.now() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return ts;
  }
}
