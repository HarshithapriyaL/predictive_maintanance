// API type definitions for Industria AI backend
// Based on FastAPI backend with functional groups:
// health/readiness, maintenance prediction, energy forecasting,
// telemetry simulator, maintenance history, energy history, alerts

export type SimulatorScenario = 'normal' | 'abnormal_high_temp' | 'abnormal_wear';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type ProductType = 'Low' | 'Medium' | 'High';

// --- Health & System ---

export interface HealthResponse {
  status: string;
  models_loaded?: boolean;
  version?: string;
}

export interface ReadinessResponse {
  ready: boolean;
  maintenance_model?: boolean;
  energy_model?: boolean;
  services?: Record<string, boolean>;
}

export interface SystemSummaryResponse {
  simulator_running: boolean;
  total_predictions: number;
  total_alerts: number;
  total_energy_records: number;
  total_maintenance_records: number;
  models_loaded: boolean;
  uptime_seconds?: number;
}

// --- Telemetry ---

export interface TelemetryReading {
  id?: number;
  machine_id: string;
  air_temperature_k: number;
  process_temperature_k: number;
  rotational_speed_rpm: number;
  torque_nm: number;
  tool_wear_min: number;
  product_type?: ProductType;
  timestamp: string;
}

export interface LatestTelemetryResponse {
  reading: TelemetryReading | null;
  simulator_running: boolean;
}

export interface SimulatorStatusResponse {
  running: boolean;
  scenario: SimulatorScenario;
  interval_seconds: number;
  started_at: string | null;
  readings_count: number;
}

export interface SimulatorActionRequest {
  scenario?: SimulatorScenario;
  interval_seconds?: number;
}

// --- Maintenance Prediction ---

export interface MaintenancePredictionResponse {
  predicted_class: string;
  failure_mode: string | null;
  probability: number | null;
  probabilities: Record<string, number> | null;
  timestamp: string;
  machine_id: string | null;
  input_summary: {
    air_temperature_k: number;
    process_temperature_k: number;
    rotational_speed_rpm: number;
    torque_nm: number;
    tool_wear_min: number;
    product_type?: ProductType;
  } | null;
}

export interface MaintenanceModelInfoResponse {
  model_name: string;
  model_type: string;
  features: string[];
  classes: string[];
  training_accuracy: number | null;
  loaded: boolean;
}

// --- Energy ---

export interface EnergyRecord {
  timestamp: string;
  consumption_kwh: number;
  is_forecast?: boolean;
}

export interface EnergyHistoryResponse {
  records: EnergyRecord[];
  count: number;
}

export interface EnergyForecastResponse {
  forecast_kwh: number;
  forecast_timestamp: string;
  model_name: string | null;
  last_observed_timestamp: string | null;
  last_observed_kwh: number | null;
  observations_used: number;
  status: string;
}

export interface EnergyModelInfoResponse {
  model_name: string;
  model_type: string;
  lookback_window: number;
  forecast_horizon: string;
  loaded: boolean;
  metrics: {
    rmse: number | null;
    mae: number | null;
  } | null;
}

// --- Maintenance History ---

export interface MaintenanceHistoryRecord {
  id: number;
  timestamp: string;
  machine_id: string | null;
  predicted_class: string;
  failure_mode: string | null;
  probability: number | null;
  scenario: SimulatorScenario | null;
}

export interface MaintenanceHistoryResponse {
  records: MaintenanceHistoryRecord[];
  count: number;
}

// --- Alerts ---

export interface AlertRecord {
  id: number;
  timestamp: string;
  severity: AlertSeverity;
  message: string;
  machine_id: string | null;
  prediction_id: number | null;
}

export interface AlertsResponse {
  alerts: AlertRecord[];
  count: number;
}
