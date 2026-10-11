import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Wrench, Zap, AlertTriangle, Info, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { SeverityBadge, StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/States';
import { DataTable } from '@/components/shared/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { formatTimestamp, relativeTime, scenarioLabel, formatNumber, formatPercent } from '@/lib/format';
import type { AlertRecord, MaintenanceHistoryRecord, EnergyRecord } from '@/types/api';

export function AlertsPage() {
  const queryClient = useQueryClient();

  const alertsQuery = useQuery({
    queryKey: ['alerts', 50],
    queryFn: () => api.getAlerts(50),
    refetchInterval: 30_000,
  });

  const maintenanceHistoryQuery = useQuery({
    queryKey: ['maintenance-history', 50],
    queryFn: () => api.getMaintenanceHistory(50),
    refetchInterval: 30_000,
  });

  const energyHistoryQuery = useQuery({
    queryKey: ['energy-history', 100],
    queryFn: () => api.getEnergyHistory(100),
    refetchInterval: 60_000,
  });

  const refresh = () => queryClient.invalidateQueries();

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Events & History"
        subtitle="Review available maintenance predictions, energy records, and alerts."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          className="border-white/15 bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary"
        >
          Refresh
        </Button>
      </PageHeader>

      <Tabs defaultValue="alerts">
        <TabsList className="border border-white/10 bg-surface-card">
          <TabsTrigger
            value="alerts"
            className="data-[state=active]:bg-indigo-royal data-[state=active]:text-text-primary"
          >
            <Bell className="mr-2 h-4 w-4" />
            Alerts
            {alertsQuery.data && alertsQuery.data.count > 0 && (
              <span className="ml-2 rounded-full bg-white/10 px-1.5 py-0.5 text-xs">
                {alertsQuery.data.count}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="maintenance"
            className="data-[state=active]:bg-indigo-royal data-[state=active]:text-text-primary"
          >
            <Wrench className="mr-2 h-4 w-4" />
            Maintenance History
          </TabsTrigger>
          <TabsTrigger
            value="energy"
            className="data-[state=active]:bg-indigo-royal data-[state=active]:text-text-primary"
          >
            <Zap className="mr-2 h-4 w-4" />
            Energy History
          </TabsTrigger>
        </TabsList>

        {/* Alerts tab */}
        <TabsContent value="alerts" className="mt-4">
          <div className="rounded-xl border border-white/10 bg-surface-card">
            {alertsQuery.isPending && (
              <div className="p-6">
                <LoadingState label="Loading alerts…" />
              </div>
            )}
            {alertsQuery.isError && (
              <div className="p-6">
                <ErrorState
                  message="Unable to load alerts."
                  onRetry={() => alertsQuery.refetch()}
                />
              </div>
            )}
            {alertsQuery.data && alertsQuery.data.alerts.length === 0 && (
              <EmptyState
                icon={Bell}
                title="No alerts recorded"
                description="Alerts will appear here when the system detects anomalous conditions."
                className="m-6"
              />
            )}
            {alertsQuery.data && alertsQuery.data.alerts.length > 0 && (
              <div className="divide-y divide-white/5">
                {alertsQuery.data.alerts.map((alert: AlertRecord) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-4 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="mt-0.5 shrink-0">
                      {alert.severity === 'critical' ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-critical/10">
                          <AlertTriangle className="h-4 w-4 text-status-critical" />
                        </div>
                      ) : alert.severity === 'warning' ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-warning/10">
                          <AlertTriangle className="h-4 w-4 text-status-warning" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-info/10">
                          <Info className="h-4 w-4 text-status-info" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={alert.severity} />
                        {alert.machine_id && (
                          <span className="text-xs text-text-muted">
                            Machine: <span className="font-mono text-text-secondary">{alert.machine_id}</span>
                          </span>
                        )}
                        {alert.prediction_id !== null && (
                          <span className="text-xs text-text-muted">
                            Prediction #{alert.prediction_id}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-sm text-text-primary">{alert.message}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-text-muted">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(alert.timestamp)}</span>
                        <span>·</span>
                        <span>{relativeTime(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Maintenance History tab */}
        <TabsContent value="maintenance" className="mt-4">
          <div className="rounded-xl border border-white/10 bg-surface-card">
            {maintenanceHistoryQuery.isPending && (
              <DataTable
                columns={[
                  { key: 'time', header: 'Timestamp', render: () => '' },
                  { key: 'machine', header: 'Machine', render: () => '' },
                  { key: 'class', header: 'Class', render: () => '' },
                  { key: 'prob', header: 'Probability', render: () => '' },
                  { key: 'scenario', header: 'Scenario', render: () => '' },
                ]}
                data={[]}
                loading
                rowKey={(_, i) => i as number}
                rowCount={8}
              />
            )}
            {maintenanceHistoryQuery.isError && (
              <div className="p-6">
                <ErrorState
                  message="Unable to load maintenance history."
                  onRetry={() => maintenanceHistoryQuery.refetch()}
                />
              </div>
            )}
            {maintenanceHistoryQuery.data && (
              <DataTable
                columns={[
                  {
                    key: 'time',
                    header: 'Timestamp',
                    render: (r: MaintenanceHistoryRecord) => (
                      <span className="text-text-secondary">{formatTimestamp(r.timestamp)}</span>
                    ),
                  },
                  {
                    key: 'machine',
                    header: 'Machine',
                    render: (r: MaintenanceHistoryRecord) => (
                      <span className="font-mono text-text-secondary">{r.machine_id || '—'}</span>
                    ),
                  },
                  {
                    key: 'class',
                    header: 'Predicted Class',
                    render: (r: MaintenanceHistoryRecord) => (
                      <span
                        className={
                          r.predicted_class.toLowerCase().includes('failure')
                            ? 'font-medium text-status-critical'
                            : 'font-medium text-status-success'
                        }
                      >
                        {r.predicted_class}
                      </span>
                    ),
                  },
                  {
                    key: 'mode',
                    header: 'Failure Mode',
                    render: (r: MaintenanceHistoryRecord) => (
                      <span className="text-text-secondary">{r.failure_mode || '—'}</span>
                    ),
                  },
                  {
                    key: 'prob',
                    header: 'Probability',
                    render: (r: MaintenanceHistoryRecord) => (
                      <span className="font-mono text-signal-yellow">
                        {r.probability !== null ? formatPercent(r.probability) : '—'}
                      </span>
                    ),
                  },
                  {
                    key: 'scenario',
                    header: 'Scenario',
                    render: (r: MaintenanceHistoryRecord) => (
                      <span className="text-text-muted">
                        {r.scenario ? scenarioLabel(r.scenario) : '—'}
                      </span>
                    ),
                  },
                ]}
                data={maintenanceHistoryQuery.data.records}
                loading={false}
                rowKey={(r) => r.id}
                emptyMessage="No maintenance predictions recorded yet."
              />
            )}
          </div>
        </TabsContent>

        {/* Energy History tab */}
        <TabsContent value="energy" className="mt-4">
          <div className="rounded-xl border border-white/10 bg-surface-card">
            {energyHistoryQuery.isPending && (
              <DataTable
                columns={[
                  { key: 'time', header: 'Timestamp', render: () => '' },
                  { key: 'kwh', header: 'Consumption (kWh)', render: () => '' },
                  { key: 'type', header: 'Type', render: () => '' },
                ]}
                data={[]}
                loading
                rowKey={(_, i) => i as number}
                rowCount={8}
              />
            )}
            {energyHistoryQuery.isError && (
              <div className="p-6">
                <ErrorState
                  message="Unable to load energy history."
                  onRetry={() => energyHistoryQuery.refetch()}
                />
              </div>
            )}
            {energyHistoryQuery.data && (
              <DataTable
                columns={[
                  {
                    key: 'time',
                    header: 'Timestamp',
                    render: (r: EnergyRecord) => (
                      <span className="text-text-secondary">{formatTimestamp(r.timestamp)}</span>
                    ),
                  },
                  {
                    key: 'kwh',
                    header: 'Consumption (kWh)',
                    render: (r: EnergyRecord) => (
                      <span className="font-mono text-teal-industrial">
                        {formatNumber(r.consumption_kwh, 2)}
                      </span>
                    ),
                  },
                  {
                    key: 'type',
                    header: 'Type',
                    render: (r: EnergyRecord) => (
                      <StatusBadge
                        status={r.is_forecast ? 'idle' : 'online'}
                        label={r.is_forecast ? 'Forecast' : 'Actual'}
                      />
                    ),
                  },
                ]}
                data={energyHistoryQuery.data.records}
                loading={false}
                rowKey={(r) => `${r.timestamp}-${r.consumption_kwh}`}
                emptyMessage="No energy records available."
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-surface-card p-3 text-xs text-text-muted">
        <Info className="h-3.5 w-3.5 shrink-0" />
        <span>
          History and alerts are stored in memory on the backend and may be lost on server restart.
        </span>
      </div>
    </div>
  );
}
