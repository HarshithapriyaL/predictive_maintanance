import type {
  HealthResponse,
  ReadinessResponse,
  SystemSummaryResponse,
  LatestTelemetryResponse,
  SimulatorStatusResponse,
  SimulatorActionRequest,
  MaintenancePredictionResponse,
  MaintenanceModelInfoResponse,
  EnergyHistoryResponse,
  EnergyForecastResponse,
  EnergyModelInfoResponse,
  MaintenanceHistoryResponse,
  AlertsResponse,
  SimulatorScenario,
} from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_BASE_URL = BASE_URL;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit & { expectJson?: boolean }
): Promise<T> {
  const { expectJson = true, ...init } = options || {};
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
  } catch {
    throw new ApiError('Unable to reach the backend server.', 0);
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      detail = body.detail || body.message || detail;
    } catch {
      // response body is not JSON
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204 || !expectJson) return undefined as T;
  return res.json() as Promise<T>;
}

// --- Health & System ---

export const api = {
  getHealth: () => request<HealthResponse>('/health'),
  getReadiness: () => request<ReadinessResponse>('/readiness'),
  getSystemSummary: () => request<SystemSummaryResponse>('/api/system/summary'),

  // --- Telemetry Simulator ---
  getSimulatorStatus: () =>
    request<SimulatorStatusResponse>('/api/telemetry/simulator/status'),
  startSimulator: (body: SimulatorActionRequest = {}) =>
    request<SimulatorStatusResponse>('/api/telemetry/simulator/start', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  stopSimulator: () =>
    request<SimulatorStatusResponse>('/api/telemetry/simulator/stop', {
      method: 'POST',
    }),
  getLatestTelemetry: () =>
    request<LatestTelemetryResponse>('/api/telemetry/latest'),

  // --- Maintenance Prediction ---
  getMaintenancePrediction: () =>
    request<MaintenancePredictionResponse>('/api/maintenance/predict'),
  getMaintenanceModelInfo: () =>
    request<MaintenanceModelInfoResponse>('/api/maintenance/model/info'),

  // --- Energy ---
  getEnergyHistory: (limit = 100) =>
    request<EnergyHistoryResponse>(
      `/api/energy/history?limit=${limit}`
    ),
  getEnergyForecast: () =>
    request<EnergyForecastResponse>('/api/energy/forecast'),
  getEnergyModelInfo: () =>
    request<EnergyModelInfoResponse>('/api/energy/model/info'),

  // --- Maintenance History ---
  getMaintenanceHistory: (limit = 50) =>
    request<MaintenanceHistoryResponse>(
      `/api/maintenance/history?limit=${limit}`
    ),

  // --- Alerts ---
  getAlerts: (limit = 50) =>
    request<AlertsResponse>(`/api/alerts?limit=${limit}`),
};
