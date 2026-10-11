import { AlertTriangle, Bell } from 'lucide-react';
import { SeverityBadge } from './StatusBadge';
import { EmptyState, ErrorState, LoadingState } from './States';
import { formatTimestamp, relativeTime } from '@/lib/format';
import type { AlertRecord } from '@/types/api';

interface RecentAlertsProps {
  alerts: AlertRecord[] | undefined;
  loading: boolean;
  error: Error | null;
  onRetry?: () => void;
  maxItems?: number;
}

export function RecentAlerts({
  alerts,
  loading,
  error,
  onRetry,
  maxItems = 6,
}: RecentAlertsProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="h-4 w-4 text-status-warning" />
        <h3 className="text-sm font-semibold text-text-primary">Recent Alerts</h3>
      </div>

      {loading && <LoadingState label="Loading alerts…" />}

      {error && (
        <ErrorState
          message={error.message || 'Failed to load alerts.'}
          onRetry={onRetry}
        />
      )}

      {!loading && !error && alerts && alerts.length === 0 && (
        <EmptyState
          icon={Bell}
          title="No active alerts"
          description="The system has not generated any alerts."
        />
      )}

      {!loading && !error && alerts && alerts.length > 0 && (
        <div className="space-y-2.5">
          {alerts.slice(0, maxItems).map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 rounded-lg border border-white/5 bg-surface-secondary/50 p-3 transition-colors hover:border-white/10"
            >
              <div className="mt-0.5 shrink-0">
                {alert.severity === 'critical' ? (
                  <AlertTriangle className="h-4 w-4 text-status-critical" />
                ) : alert.severity === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-status-warning" />
                ) : (
                  <Bell className="h-4 w-4 text-status-info" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={alert.severity} />
                  {alert.machine_id && (
                    <span className="text-xs text-text-muted">
                      {alert.machine_id}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-text-secondary">
                  {alert.message}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {formatTimestamp(alert.timestamp)} · {relativeTime(alert.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
