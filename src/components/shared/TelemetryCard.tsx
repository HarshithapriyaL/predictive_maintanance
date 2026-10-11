import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimestamp, formatNumber } from '@/lib/format';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { TelemetryReading } from '@/types/api';

interface TelemetryCardProps {
  icon: LucideIcon;
  label: string;
  value: number | null | undefined;
  unit: string;
  tooltip?: string;
  accent?: 'teal' | 'yellow' | 'indigo';
}

const accentMap = {
  teal: 'text-teal-industrial',
  yellow: 'text-signal-yellow',
  indigo: 'text-indigo-royal',
};

export function TelemetryCard({
  icon: Icon,
  label,
  value,
  unit,
  tooltip,
  accent = 'teal',
}: TelemetryCardProps) {
  const content = (
    <div className="rounded-lg border border-white/10 bg-surface-card p-4 transition-colors hover:border-white/20">
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', accentMap[accent])} />
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-mono text-xl font-semibold tabular-nums text-text-primary">
          {formatNumber(value, value !== null && value !== undefined && Math.abs(value) >= 100 ? 0 : 2)}
        </span>
        <span className="text-xs text-text-secondary">{unit}</span>
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">{content}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

export function TelemetryMeta({
  reading,
}: {
  reading: TelemetryReading | null;
}) {
  if (!reading) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
      {reading.machine_id && (
        <span>
          Machine: <span className="font-mono text-text-secondary">{reading.machine_id}</span>
        </span>
      )}
      {reading.product_type && (
        <span>
          Product: <span className="text-text-secondary">{reading.product_type}</span>
        </span>
      )}
      <span>
        Last reading: <span className="text-text-secondary">{formatTimestamp(reading.timestamp)}</span>
      </span>
    </div>
  );
}
