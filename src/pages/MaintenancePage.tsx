import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Play,
  Square,
  Wrench,
  Thermometer,
  Gauge,
  Activity,
  Cpu,
  Brain,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '@/components/shared/States';
import { TelemetryCard, TelemetryMeta } from '@/components/shared/TelemetryCard';
import { MiniLineChart } from '@/components/charts/EnergyChart';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { formatTimestamp, formatPercent, formatNumber, scenarioLabel } from '@/lib/format';
import type { SimulatorScenario } from '@/types/api';
import { cn } from '@/lib/utils';

const SCENARIOS: SimulatorScenario[] = ['normal', 'abnormal_high_temp', 'abnormal_wear'];

export function MaintenancePage() {
  const queryClient = useQueryClient();
  const [selectedScenario, setSelectedScenario] = useState<SimulatorScenario>('normal');

  const statusQuery = useQuery({
    queryKey: ['simulator-status'],
    queryFn: api.getSimulatorStatus,
    refetchInterval: 10_000,
  });

  const telemetryQuery = useQuery({
    queryKey: ['latest-telemetry'],
    queryFn: api.getLatestTelemetry,
    refetchInterval: 10_000,
  });

  const predictionQuery = useQuery({
    queryKey: ['maintenance-prediction'],
    queryFn: api.getMaintenancePrediction,
    refetchInterval: 30_000,
  });

  const modelInfoQuery = useQuery({
    queryKey: ['maintenance-model-info'],
    queryFn: api.getMaintenanceModelInfo,
    staleTime: 120_000,
  });

  const historyQuery = useQuery({
    queryKey: ['maintenance-history', 20],
    queryFn: () => api.getMaintenanceHistory(20),
    refetchInterval: 30_000,
  });

  const startMutation = useMutation({
    mutationFn: () =>
      api.startSimulator({ scenario: selectedScenario }),
    onSuccess: (data) => {
      toast({
        title: 'Simulator started',
        description: `Scenario: ${scenarioLabel(data.scenario)}`,
      });
      queryClient.invalidateQueries({ queryKey: ['simulator-status'] });
      queryClient.invalidateQueries({ queryKey: ['latest-telemetry'] });
      queryClient.invalidateQueries({ queryKey: ['system-summary'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Failed to start simulator';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });

  const stopMutation = useMutation({
    mutationFn: () => api.stopSimulator(),
    onSuccess: () => {
      toast({ title: 'Simulator stopped' });
      queryClient.invalidateQueries({ queryKey: ['simulator-status'] });
      queryClient.invalidateQueries({ queryKey: ['system-summary'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Failed to stop simulator';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });

  const predictMutation = useMutation({
    mutationFn: () => api.getMaintenancePrediction(),
    onSuccess: (data) => {
      toast({
        title: 'Prediction complete',
        description: `Class: ${data.predicted_class}`,
      });
      queryClient.invalidateQueries({ queryKey: ['maintenance-prediction'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-history'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Prediction request failed';
      toast({ title: 'Prediction failed', description: msg, variant: 'destructive' });
    },
  });

  const isRunning = statusQuery.data?.running ?? false;
  const reading = telemetryQuery.data?.reading;
  const prediction = predictionQuery.data;

  const isFailure = prediction?.predicted_class?.toLowerCase().includes('failure');

  // Build chart data from maintenance history (probability over time)
  const chartData = (historyQuery.data?.records ?? [])
    .slice()
    .reverse()
    .map((r) => ({
      timestamp: r.timestamp,
      value: r.probability !== null ? r.probability * 100 : 0,
    }))
    .slice(-30);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Predictive Maintenance"
        subtitle="Monitor simulated machine telemetry and evaluate model predictions."
      />

      {/* A. Simulator Control Panel */}
      <div className="rounded-xl border border-white/10 bg-surface-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-teal-industrial" />
          <h3 className="text-sm font-semibold text-text-primary">Simulator Control</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-text-muted">
                Scenario
              </label>
              <Select
                value={selectedScenario}
                onValueChange={(v) => setSelectedScenario(v as SimulatorScenario)}
                disabled={isRunning}
              >
                <SelectTrigger className="w-full border-white/15 bg-surface-secondary text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/15 bg-surface-elevated">
                  {SCENARIOS.map((s) => (
                    <SelectItem key={s} value={s} className="text-text-primary focus:bg-indigo-royal/30">
                      {scenarioLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => startMutation.mutate()}
                disabled={isRunning || startMutation.isPending}
                className="bg-status-success/90 text-white hover:bg-status-success"
              >
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
              <Button
                onClick={() => stopMutation.mutate()}
                disabled={!isRunning || stopMutation.isPending}
                variant="outline"
                className="border-status-critical/30 text-status-critical hover:bg-status-critical/10 hover:text-status-critical"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-muted">Status:</span>
              <StatusBadge status={isRunning ? 'running' : 'stopped'} />
              {statusQuery.data?.started_at && (
                <span className="text-text-muted">
                  · Since {formatTimestamp(statusQuery.data.started_at)}
                </span>
              )}
            </div>
          </div>

          {/* Status info */}
          <div className="rounded-lg border border-white/5 bg-surface-secondary/50 p-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-text-muted">Current Scenario</p>
                <p className="mt-1 font-medium text-text-secondary">
                  {statusQuery.data ? scenarioLabel(statusQuery.data.scenario) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Readings Generated</p>
                <p className="mt-1 font-mono font-medium text-text-secondary">
                  {statusQuery.data?.readings_count ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Interval</p>
                <p className="mt-1 font-mono font-medium text-text-secondary">
                  {statusQuery.data?.interval_seconds ? `${statusQuery.data.interval_seconds}s` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Latest Reading</p>
                <p className="mt-1 font-medium text-text-secondary">
                  {reading ? formatTimestamp(reading.timestamp) : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* B. Machine Telemetry Panel */}
      <div className="rounded-xl border border-white/10 bg-surface-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-industrial" />
            <h3 className="text-sm font-semibold text-text-primary">Machine Telemetry</h3>
          </div>
          {telemetryQuery.data?.simulator_running && <StatusBadge status="running" />}
        </div>

        {telemetryQuery.isPending && <LoadingState label="Loading telemetry…" />}
        {telemetryQuery.isError && (
          <ErrorState
            message="Unable to load telemetry."
            onRetry={() => telemetryQuery.refetch()}
          />
        )}
        {telemetryQuery.data && !reading && (
          <EmptyState
            icon={Cpu}
            title="No telemetry available"
            description="Start the simulator to begin generating machine readings."
          />
        )}
        {reading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <TelemetryCard icon={Thermometer} label="Air Temp" value={reading.air_temperature_k} unit="K" tooltip="Ambient air temperature in Kelvin" accent="teal" />
              <TelemetryCard icon={Thermometer} label="Process Temp" value={reading.process_temperature_k} unit="K" tooltip="Process temperature in Kelvin" accent="teal" />
              <TelemetryCard icon={Gauge} label="Speed" value={reading.rotational_speed_rpm} unit="rpm" tooltip="Rotational speed in RPM" accent="indigo" />
              <TelemetryCard icon={Activity} label="Torque" value={reading.torque_nm} unit="Nm" tooltip="Torque in Newton-meters" accent="indigo" />
              <TelemetryCard icon={Wrench} label="Tool Wear" value={reading.tool_wear_min} unit="min" tooltip="Tool wear in minutes" accent="yellow" />
              <TelemetryCard icon={Cpu} label="Product" value={reading.product_type || '—'} unit="" tooltip="Product quality variant" accent="teal" />
            </div>
            <TelemetryMeta reading={reading} />

            {/* Probability trend chart */}
            {chartData.length > 1 && (
              <div className="mt-4 rounded-lg border border-white/5 bg-surface-secondary/50 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">
                  Failure Probability Trend (recent predictions)
                </p>
                <MiniLineChart data={chartData} color="#E8E085" unit="%" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* C. Prediction Result Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-surface-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-indigo-royal" />
              <h3 className="text-sm font-semibold text-text-primary">Prediction Result</h3>
            </div>
            <Button
              onClick={() => predictMutation.mutate()}
              disabled={predictMutation.isPending}
              className="bg-indigo-royal text-text-primary hover:bg-indigo-royal/80"
            >
              {predictMutation.isPending ? (
                <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" />
                  Predicting…
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Request Prediction
                </>
              )}
            </Button>
          </div>

          {predictMutation.isError && (
            <ErrorState
              message={
                predictMutation.error instanceof ApiError
                  ? predictMutation.error.message
                  : 'Prediction request failed.'
              }
              className="mb-4"
            />
          )}

          {!prediction && !predictMutation.isPending && !predictMutation.isError && (
            <EmptyState
              icon={Brain}
              title="No prediction yet"
              description="Request a prediction to evaluate the current machine state. The result is a model prediction, not confirmation of a physical failure."
            />
          )}

          {prediction && (
            <div className="space-y-4">
              <div
                className={cn(
                  'rounded-lg border p-4',
                  isFailure
                    ? 'border-status-critical/30 bg-status-critical/5'
                    : 'border-status-success/30 bg-status-success/5'
                )}
              >
                <div className="flex items-center gap-3">
                  {isFailure ? (
                    <AlertCircle className="h-8 w-8 shrink-0 text-status-critical" />
                  ) : (
                    <CheckCircle2 className="h-8 w-8 shrink-0 text-status-success" />
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-muted">
                      Predicted Class
                    </p>
                    <p
                      className={cn(
                        'text-xl font-semibold',
                        isFailure ? 'text-status-critical' : 'text-status-success'
                      )}
                    >
                      {prediction.predicted_class}
                    </p>
                    {prediction.failure_mode && (
                      <p className="text-sm text-text-secondary">
                        Failure mode: {prediction.failure_mode}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {prediction.probability !== null && (
                  <div className="rounded-lg border border-white/5 bg-surface-secondary/50 p-3">
                    <p className="text-xs text-text-muted">Probability</p>
                    <p className="mt-1 font-mono text-lg font-semibold text-signal-yellow">
                      {formatPercent(prediction.probability)}
                    </p>
                  </div>
                )}
                <div className="rounded-lg border border-white/5 bg-surface-secondary/50 p-3">
                  <p className="text-xs text-text-muted">Timestamp</p>
                  <p className="mt-1 text-sm font-medium text-text-secondary">
                    {formatTimestamp(prediction.timestamp)}
                  </p>
                </div>
                {prediction.machine_id && (
                  <div className="rounded-lg border border-white/5 bg-surface-secondary/50 p-3">
                    <p className="text-xs text-text-muted">Machine ID</p>
                    <p className="mt-1 font-mono text-sm font-medium text-text-secondary">
                      {prediction.machine_id}
                    </p>
                  </div>
                )}
              </div>

              {prediction.probabilities && (
                <div className="rounded-lg border border-white/5 bg-surface-secondary/50 p-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">
                    Class Probabilities
                  </p>
                  <div className="space-y-2">
                    {Object.entries(prediction.probabilities).map(([cls, prob]) => (
                      <div key={cls} className="flex items-center gap-3">
                        <span className="w-32 truncate text-xs text-text-secondary">
                          {cls}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              cls.toLowerCase().includes('failure')
                                ? 'bg-status-critical'
                                : 'bg-teal-industrial'
                            )}
                            style={{ width: `${(prob * 100).toFixed(1)}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-mono text-xs text-text-muted">
                          {formatPercent(prob)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 rounded-lg border border-status-info/20 bg-status-info/5 p-3 text-xs text-text-secondary">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-status-info" />
                <p>
                  This is a model prediction based on the AI4I synthetic dataset, not confirmation
                  that a physical machine has failed. Abnormal scenarios do not guarantee a failure prediction.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Model info sidebar */}
        <div className="rounded-xl border border-white/10 bg-surface-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-royal" />
            <h3 className="text-sm font-semibold text-text-primary">Model Information</h3>
          </div>
          {modelInfoQuery.isPending && <LoadingState label="Loading model info…" />}
          {modelInfoQuery.isError && (
            <ErrorState
              message="Unable to load model information."
              onRetry={() => modelInfoQuery.refetch()}
            />
          )}
          {modelInfoQuery.data && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-text-muted">Model Name</p>
                <p className="mt-0.5 font-medium text-text-secondary">
                  {modelInfoQuery.data.model_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Type</p>
                <p className="mt-0.5 font-medium text-text-secondary">
                  {modelInfoQuery.data.model_type}
                </p>
              </div>
              {modelInfoQuery.data.training_accuracy !== null && (
                <div>
                  <p className="text-xs text-text-muted">Training Accuracy</p>
                  <p className="mt-0.5 font-mono font-medium text-text-secondary">
                    {formatPercent(modelInfoQuery.data.training_accuracy)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-text-muted">Features</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {modelInfoQuery.data.features.map((f) => (
                    <span
                      key={f}
                      className="rounded border border-white/10 bg-surface-secondary px-2 py-0.5 font-mono text-xs text-text-muted"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-text-muted">Classes</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {modelInfoQuery.data.classes.map((c) => (
                    <span
                      key={c}
                      className={cn(
                        'rounded border px-2 py-0.5 text-xs',
                        c.toLowerCase().includes('failure')
                          ? 'border-status-critical/30 bg-status-critical/10 text-status-critical'
                          : 'border-status-success/30 bg-status-success/10 text-status-success'
                      )}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-text-muted">Status:</span>
                <StatusBadge status={modelInfoQuery.data.loaded ? 'ready' : 'not-ready'} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
