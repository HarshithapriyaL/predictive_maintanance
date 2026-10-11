import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';
import { formatTimeShort, formatNumber } from '@/lib/format';
import { EmptyState, LoadingState } from '@/components/shared/States';
import type { EnergyRecord } from '@/types/api';

interface EnergyChartProps {
  data: EnergyRecord[];
  loading?: boolean;
  forecastPoint?: { timestamp: string; consumption_kwh: number } | null;
  height?: number;
  showForecastRef?: boolean;
}

const tooltipStyle = {
  backgroundColor: '#1B2341',
  border: '1px solid #303955',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#F4F6FC',
  padding: '8px 12px',
};

const labelStyle = {
  color: '#929BB9',
  fontSize: '11px',
  marginBottom: '4px',
};

export function EnergyChart({
  data,
  loading = false,
  forecastPoint,
  height = 280,
  showForecastRef = false,
}: EnergyChartProps) {
  if (loading) {
    return <LoadingState label="Loading energy data…" className="h-[280px]" />;
  }

  const chartData = [...data];
  if (forecastPoint) {
    chartData.push({
      timestamp: forecastPoint.timestamp,
      consumption_kwh: forecastPoint.consumption_kwh,
      is_forecast: true,
    });
  }

  if (chartData.length === 0) {
    return (
      <EmptyState
        title="No energy data available"
        description="Historical energy consumption will appear here when the backend provides records."
        className="h-[280px]"
      />
    );
  }

  const lastActual = data.length > 0 ? data[data.length - 1] : null;
  const hasForecast = !!forecastPoint;

  // For area chart with forecast: we need to connect last actual to forecast
  const renderData = hasForecast && lastActual
    ? [...data, { timestamp: lastActual.timestamp, consumption_kwh: lastActual.consumption_kwh, is_forecast: false }, ...chartData.slice(data.length)]
    : chartData;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={renderData} margin={{ top: 10, right: 16, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="energyTeal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2D7495" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2D7495" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="energyYellow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E8E085" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#E8E085" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#303955"
          strokeOpacity={0.4}
          vertical={false}
        />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(v) => formatTimeShort(v)}
          stroke="#929BB9"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={50}
        />
        <YAxis
          tickFormatter={(v) => formatNumber(v, 1)}
          stroke="#929BB9"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={50}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={labelStyle}
          labelFormatter={(v) => formatTimeShort(v as string)}
          formatter={(value: number, _name: string, props) => {
            const isForecast = props?.payload?.is_forecast;
            return [
              `${formatNumber(value, 2)} kWh`,
              isForecast ? 'Forecast' : 'Actual',
            ];
          }}
        />
        <Area
          type="monotone"
          dataKey="consumption_kwh"
          stroke="#2D7495"
          strokeWidth={2}
          fill="url(#energyTeal)"
          dot={false}
          activeDot={{ r: 4, fill: '#2D7495' }}
          isAnimationActive={true}
          animationDuration={400}
        />
        {hasForecast && (
          <Area
            type="monotone"
            dataKey="consumption_kwh"
            stroke="#E8E085"
            strokeWidth={2}
            strokeDasharray="5 3"
            fill="url(#energyYellow)"
            dot={{ r: 4, fill: '#E8E085' }}
            isAnimationActive={true}
            animationDuration={400}
            connectNulls
          />
        )}
        {showForecastRef && lastActual && (
          <ReferenceLine
            x={lastActual.timestamp}
            stroke="#E8E085"
            strokeDasharray="2 4"
            strokeOpacity={0.5}
            label={{ value: 'Now', fill: '#E8E085', fontSize: 10, position: 'top' }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface MiniLineChartProps {
  data: { timestamp: string; value: number }[];
  color?: string;
  height?: number;
  unit?: string;
}

export function MiniLineChart({
  data,
  color = '#2D7495',
  height = 120,
  unit = '',
}: MiniLineChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No readings yet"
        className="h-[120px]"
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#303955"
          strokeOpacity={0.3}
          vertical={false}
        />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(v) => formatTimeShort(v)}
          stroke="#929BB9"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={60}
        />
        <YAxis
          stroke="#929BB9"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(v) => formatNumber(v, 0)}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={labelStyle}
          labelFormatter={(v) => formatTimeShort(v as string)}
          formatter={(value: number) => [`${formatNumber(value, 2)} ${unit}`, 'Value']}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: color }}
          isAnimationActive={true}
          animationDuration={400}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
