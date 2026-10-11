import { type LucideIcon, AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function LoadingState({
  label = 'Loading…',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-surface-card/50 p-8 text-center',
        className
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-status-info" />
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No data available',
  description,
  className,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-surface-card/50 p-8 text-center',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        <Icon className="h-6 w-6 text-text-muted" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        {description && (
          <p className="mt-1 text-xs text-text-muted">{description}</p>
        )}
      </div>
    </div>
  );
}

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-status-critical/20 bg-status-critical/5 p-6 text-center',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-critical/10">
        <AlertCircle className="h-5 w-5 text-status-critical" />
      </div>
      <p className="text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-white/15 bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary"
        >
          Retry
        </Button>
      )}
    </div>
  );
}
