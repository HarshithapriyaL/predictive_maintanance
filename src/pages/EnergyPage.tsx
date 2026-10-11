import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Zap,
  TrendingUp,
  Clock,
  Brain,
  Activity,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState, ErrorState } from '@/components/shared/States';
import { EnergyChart } from '@/components/charts/EnergyChart';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { formatTimestamp, formatNumber } from '@/lib/format';

const MIN_OBSERVATIONS = 673;

export function EnergyPage() {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ['energy-history', 100],
    queryFn: () => api.getEnergyHistory(100),
    refetchInterval: 60_000,
  });

  const forecastQuery = useQuery({
    queryKey: ['energy-forecast'],
    queryFn: api.getEnergyForecast,
    refetchInterval: 60_000,
  });

  const modelInfoQuery = useQuery({
    queryKey: ['energy-model-info'],
    queryFn: api.getEnergyModelInfo,
    staleTime: 120_000,
  });

  const forecastMutation = useMutation({
    mutationFn: () => api.getEnergyForecast(),
    onSuccess: (data) => {
      toast({
        title: 'Forecast generated',
        description: `Next interval: ${formatNumber(data.forecast_kwh, 2)} kWh`,
      });
      queryClient.invalidateQueries({ queryKey: ['energy-forecast'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Forecast request failed';
      toast({ title: 'Forecast failed', description: msg, variant: 'destructive' });
    },
  });

  const records = historyQuery.data?.records ?? [];
  const forecast = forecastQuery.data;
  const lastObserved = records.length > 0 ? records[records.length - 1] : null;
  const observationCount = forecast?.observations_used ?? historyQuery.data?.count ?? 0;
  const hasInsufficientData = observationCount > 0 && observationCount < MIN_OBSERVATIONS;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Energy Intelligence"
        subtitle="Analyze historical facility consumption and forecast the next interval."
      />

      {/* Key metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Zap}
          label="Latest Observed"
          value={lastObserved ? formatNumber(lastObserved.consumption_kwh, 2) : 'No data'}
          unit="kWh"
          accent="teal"
          subtitle={lastObserved ? formatTimestamp(lastObserved.timestamp) : undefined}
        />

        <MetricCard
          icon={TrendingUp}
          label="Forecast (Next 15min)"
          value={forecast ? formatNumber(forecast.forecast_kwh, 2) : 'No data'}
          unit="kWh"
          highlight
          accent="yellow"
          subtitle={forecast ? 'One-step-ahead prediction' : undefined}
        />

        <MetricCard
          icon={Clock}
          label="Forecast Timestamp"
          value={forecast ? formatTimestamp(forecast.forecast_timestamp) : '—'}
          accent="indigo"
          subtitle={forecast ? forecast.status : 'Awaiting forecast'}
        >
          {forecast && (
            <StatusBadge
              status={
                forecast.status?.toLowerCase().includes('error')
                  ? 'offline'
                  : 'ready'
              }
              label={forecast.status}
            />
          )}
        </MetricCard>

        <MetricCard
          icon={Activity}
          label="Observations Available"
          value={observationCount}
          accent={hasInsufficientData ? 'warning' : 'success'}
          subtitle={
            hasInsufficientData
              ? `${MIN_OBSERVATIONS - observationCount} more needed`
              : `Minimum ${MIN_OBSERVATIONS} required`
          }
        />
      </div>

      {/* Main forecast chart */}
      <div className="rounded-xl border border-white/10 bg-surface-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-teal-industrial" />
            <h3 className="text-sm font-semibold text-text-primary">
              Energy Consumption & Forecast
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-text-muted">
              <span className="h-2 w-3 rounded-sm bg-teal-industrial" />
              Historical
            </span>
            <span className="flex items-center gap-1.5 text-text-muted">
              <span className="h-2 w-3 rounded-sm bg-signal-yellow" />
              Forecast
            </span>
          </div>
        </div>

        <EnergyChart
          data={records}
          loading={historyQuery.isPending}
          forecastPoint={
            forecast
              ? {
                  timestamp: forecast.forecast_timestamp,
                  consumption_kwh: forecast.forecast_kwh,
                }
              : null
          }
          showForecastRef
          height={320}
        />

        {historyQuery.isError && (
          <ErrorState
            message="Unable to load energy history."
            onRetry={() => historyQuery.refetch()}
            className="mt-4"
          />
        )}
      </div>

      {/* Forecast controls + model info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Forecast controls */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-surface-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-signal-yellow" />
            <h3 className="text-sm font-semibold text-text-primary">Forecast Controls</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => forecastMutation.mutate()}
                disabled={forecastMutation.isPending}
                className="bg-signal-yellow text-indigo-deep hover:bg-signal-yellow/90"
              >
                {forecastMutation.isPending ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Calculating…
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate Forecast
                  </>
                )}
              </Button>
              {forecast && (
                <span className="text-xs text-text-muted">
                  Last forecast: {formatTimestamp(forecast.forecast_timestamp)}
                </span>
              )}
            </div>

            {forecastMutation.isError && (
              <ErrorState
                message={
                  forecastMutation.error instanceof ApiError
                    ? forecastMutation.error.message
                    : 'Forecast request failed.'
                }
              />
            )}

            {hasInsufficientData && (
              <div className="flex items-start gap-2 rounded-lg border border-status-warning/20 bg-status-warning/5 p-3 text-xs text-text-secondary">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
                <div>
                  <p className="font-medium text-status-warning">
                    Insufficient historical data
                  </p>
                  <p className="mt-1">
                    The forecast model requires at least {MIN_OBSERVATIONS} historical observations.
                    Currently {observationCount} available. Continue running the simulator to collect more data.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg border border-status-info/20 bg-status-info/5 p-3 text-xs text-text-secondary">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-status-info" />
              <p>
                This is a one-step-ahead forecast for the next 15-minute interval.
                The energy dataset describes facility-level consumption, not individual machine consumption.
                Tariff data is unavailable, so verified cost optimization cannot be claimed.
              </p>
            </div>
          </div>
        </div>

        {/* Model info */}
        <div className="rounded-xl border border-white/10 bg-surface-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-royal" />
            <h3 className="text-sm font-semibold text-text-primary">Forecast Model</h3>
          </div>
          {modelInfoQuery.isPending && <LoadingState label="Loading…" />}
          {modelInfoQuery.isError && (
            <ErrorState
              message="Unable to load model info."
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
              <div>
                <p className="text-xs text-text-muted">Lookback Window</p>
                <p className="mt-0.5 font-mono font-medium text-text-secondary">
                  {modelInfoQuery.data.lookback_window} obs
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Forecast Horizon</p>
                <p className="mt-0.5 font-medium text-text-secondary">
                  {modelInfoQuery.data.forecast_horizon}
                </p>
              </div>
              {modelInfoQuery.data.metrics && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {modelInfoQuery.data.metrics.rmse !== null && (
                    <div>
                      <p className="text-xs text-text-muted">RMSE</p>
                      <p className="mt-0.5 font-mono text-sm font-medium text-text-secondary">
                        {formatNumber(modelInfoQuery.data.metrics.rmse, 4)}
                      </p>
                    </div>
                  )}
                  {modelInfoQuery.data.metrics.mae !== null && (
                    <div>
                      <p className="text-xs text-text-muted">MAE</p>
                      <p className="mt-0.5 font-mono text-sm font-medium text-text-secondary">
                        {formatNumber(modelInfoQuery.data.metrics.mae, 4)}
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-text-muted">Status:</span>
                <StatusBadge status={modelInfoQuery.data.loaded ? 'ready' : 'not-ready'} />
              </div>
              <p className="pt-1 text-xs text-text-muted">
                Note: Training metrics shown for reference only — not live operating measurements.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
