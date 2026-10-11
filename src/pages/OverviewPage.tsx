import { useQuery } from '@tanstack/react-query';
import {
  Cpu,
  Wrench,
  Zap,
  Bell,
  Thermometer,
  Gauge,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '@/components/shared/States';
import { TelemetryCard } from '@/components/shared/TelemetryCard';
import { RecentAlerts } from '@/components/shared/RecentAlerts';
import { EnergyChart } from '@/components/charts/EnergyChart';
import { formatTimestamp, formatNumber, formatPercent } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

export function OverviewPage() {
  const queryClient = useQueryClient();

  const telemetryQuery = useQuery({
    queryKey: ['latest-telemetry'],
    queryFn: api.getLatestTelemetry,
    refetchInterval: 15_000,
  });

  const predictionQuery = useQuery({
    queryKey: ['maintenance-prediction'],
    queryFn: api.getMaintenancePrediction,
    refetchInterval: 30_000,
  });

  const energyHistoryQuery = useQuery({
    queryKey: ['energy-history', 50],
    queryFn: () => api.getEnergyHistory(50),
    refetchInterval: 60_000,
  });

  const alertsQuery = useQuery({
    queryKey: ['alerts', 10],
    queryFn: () => api.getAlerts(10),
    refetchInterval: 30_000,
  });

  const summaryQuery = useQuery({
    queryKey: ['system-summary'],
    queryFn: api.getSystemSummary,
    refetchInterval: 30_000,
  });

  const refresh = () => queryClient.invalidateQueries();

  const reading = telemetryQuery.data?.reading;
  const prediction = predictionQuery.data;
  const energyRecords = energyHistoryQuery.data?.records ?? [];
  const lastEnergy = energyRecords.length > 0 ? energyRecords[energyRecords.length - 1] : null;
  const activeAlerts = alertsQuery.data?.alerts ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Industrial Intelligence Overview"
        subtitle="Monitor machine health, maintenance predictions, and facility energy trends."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          className="border-white/15 bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </PageHeader>

      {/* Summary metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Machine status */}
        <MetricCard
          icon={Cpu}
          label="Machine Status"
          value={
            telemetryQuery.data
              ? telemetryQuery.data.simulator_running
                ? 'Active'
                : 'Idle'
              : '—'
          }
          subtitle={reading ? `Machine ${reading.machine_id}` : 'No telemetry'}
          accent="teal"
        >
          {telemetryQuery.data && (
            <StatusBadge
              status={telemetryQuery.data.simulator_running ? 'running' : 'stopped'}
            />
          )}
        </MetricCard>

        {/* Maintenance prediction */}
        <MetricCard
          icon={Wrench}
          label="Maintenance Prediction"
          value={prediction ? prediction.predicted_class : 'No data'}
          highlight={prediction?.predicted_class?.toLowerCase().includes('failure')}
          accent={
            prediction?.predicted_class?.toLowerCase().includes('failure')
              ? 'critical'
              : 'indigo'
          }
          subtitle={
            prediction
              ? prediction.probability !== null
                ? `Confidence: ${formatPercent(prediction.probability)}`
                : formatTimestamp(prediction.timestamp)
              : 'No prediction requested yet'
          }
        />

        {/* Energy info */}
        <MetricCard
          icon={Zap}
          label="Latest Energy"
          value={lastEnergy ? formatNumber(lastEnergy.consumption_kwh, 2) : 'No data'}
          unit="kWh"
          highlight
          accent="yellow"
          subtitle={
            lastEnergy
              ? formatTimestamp(lastEnergy.timestamp)
              : energyHistoryQuery.isError
              ? 'Failed to load'
              : 'No records available'
          }
        />

        {/* Active alerts */}
        <MetricCard
          icon={Bell}
          label="Active Alerts"
          value={summaryQuery.data?.total_alerts ?? '—'}
          accent={
            (summaryQuery.data?.total_alerts ?? 0) > 0 ? 'warning' : 'success'
          }
          subtitle={
            activeAlerts.length > 0
              ? `${activeAlerts.length} recent`
              : 'No alerts generated'
          }
        >
          {activeAlerts.length > 0 && (
            <div className="flex items-center gap-1.5">
              {activeAlerts.slice(0, 3).map((a) => (
                <span
                  key={a.id}
                  className={
                    a.severity === 'critical'
                      ? 'h-1.5 w-1.5 rounded-full bg-status-critical'
                      : a.severity === 'warning'
                      ? 'h-1.5 w-1.5 rounded-full bg-status-warning'
                      : 'h-1.5 w-1.5 rounded-full bg-status-info'
                  }
                />
              ))}
            </div>
          )}
        </MetricCard>
      </div>

      {/* Telemetry + Alerts section */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Recent telemetry */}
        <div className="rounded-xl border border-white/10 bg-surface-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-industrial" />
              <h3 className="text-sm font-semibold text-text-primary">
                Recent Machine Telemetry
              </h3>
            </div>
            {telemetryQuery.data?.simulator_running && (
              <StatusBadge status="running" />
            )}
          </div>

          {telemetryQuery.isPending && <LoadingState label="Loading telemetry…" />}
          {telemetryQuery.isError && (
            <ErrorState
              message="Unable to load telemetry data."
              onRetry={() => telemetryQuery.refetch()}
            />
          )}
          {telemetryQuery.data && !reading && (
            <EmptyState
              icon={Cpu}
              title="No telemetry readings"
              description="Start the simulator to generate machine readings."
            />
          )}
          {reading && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                <TelemetryCard
                  icon={Thermometer}
                  label="Air Temp"
                  value={reading.air_temperature_k}
                  unit="K"
                  tooltip="Ambient air temperature in Kelvin"
                  accent="teal"
                />
                <TelemetryCard
                  icon={Thermometer}
                  label="Process Temp"
                  value={reading.process_temperature_k}
                  unit="K"
                  tooltip="Process temperature in Kelvin"
                  accent="teal"
                />
                <TelemetryCard
                  icon={Gauge}
                  label="Rotational Speed"
                  value={reading.rotational_speed_rpm}
                  unit="rpm"
                  tooltip="Rotational speed in revolutions per minute"
                  accent="indigo"
                />
                <TelemetryCard
                  icon={Activity}
                  label="Torque"
                  value={reading.torque_nm}
                  unit="Nm"
                  tooltip="Torque in Newton-meters"
                  accent="indigo"
                />
                <TelemetryCard
                  icon={Wrench}
                  label="Tool Wear"
                  value={reading.tool_wear_min}
                  unit="min"
                  tooltip="Tool wear in minutes"
                  accent="yellow"
                />
                <TelemetryCard
                  icon={Cpu}
                  label="Product Type"
                  value={reading.product_type || '—'}
                  unit=""
                  tooltip="Product variant quality classification"
                  accent="teal"
                />
              </div>
              <p className="text-xs text-text-muted">
                Last reading: {formatTimestamp(reading.timestamp)} · Machine:{' '}
                <span className="font-mono text-text-secondary">
                  {reading.machine_id}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Right: Recent alerts */}
        <RecentAlerts
          alerts={alertsQuery.data?.alerts}
          loading={alertsQuery.isPending}
          error={alertsQuery.error}
          onRetry={() => alertsQuery.refetch()}
        />
      </div>

      {/* Energy visualization */}
      <div className="mt-6 rounded-xl border border-white/10 bg-surface-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-signal-yellow" />
            <h3 className="text-sm font-semibold text-text-primary">
              Facility Energy Consumption
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-text-muted">
              <span className="h-2 w-3 rounded-sm bg-teal-industrial" />
              Actual
            </span>
            <span className="flex items-center gap-1.5 text-text-muted">
              <span className="h-2 w-3 rounded-sm bg-signal-yellow" />
              Forecast
            </span>
          </div>
        </div>
        <EnergyChart
          data={energyRecords}
          loading={energyHistoryQuery.isPending}
          showForecastRef
        />
        {energyHistoryQuery.isError && (
          <ErrorState
            message="Unable to load energy history."
            onRetry={() => energyHistoryQuery.refetch()}
            className="mt-4"
          />
        )}
      </div>
    </div>
  );
}
