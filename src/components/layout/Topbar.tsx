import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Menu, Activity } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useConnectionStatus } from '@/hooks/use-connection';
import { formatTimeShort } from '@/lib/format';
import type { PageId } from './Sidebar';

interface TopbarProps {
  page: PageId;
  onRefresh: () => void;
  onToggleMobileNav: () => void;
}

const pageTitles: Record<PageId, string> = {
  overview: 'Overview',
  maintenance: 'Predictive Maintenance',
  energy: 'Energy Management',
  alerts: 'Alerts & History',
};

export function Topbar({ page, onRefresh, onToggleMobileNav }: TopbarProps) {
  const { status, lastSuccess } = useConnectionStatus();

  const readinessQuery = useQuery({
    queryKey: ['readiness'],
    queryFn: api.getReadiness,
    refetchInterval: 30_000,
    retry: 0,
  });

  const ready = readinessQuery.data?.ready;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-surface-main/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-text-secondary"
          onClick={onToggleMobileNav}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Industria AI</span>
            <span className="text-text-muted">/</span>
            <span className="text-text-secondary">{pageTitles[page]}</span>
          </div>
          <h2 className="text-lg font-semibold text-text-primary">
            {pageTitles[page]}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Model readiness */}
        <div className="hidden items-center gap-2 sm:flex">
          <Activity className="h-4 w-4 text-text-muted" />
          <span className="text-xs text-text-muted">Models</span>
          <StatusBadge
            status={
              ready === undefined ? 'checking' : ready ? 'ready' : 'not-ready'
            }
          />
        </div>

        {/* Connection */}
        <div className="hidden sm:flex">
          <StatusBadge
            status={status}
            label={status === 'online' ? 'Connected' : status === 'offline' ? 'Disconnected' : 'Connecting…'}
          />
        </div>

        {/* Last refresh */}
        {lastSuccess && (
          <span className="hidden text-xs text-text-muted md:inline">
            Updated {formatTimeShort(lastSuccess.toISOString())}
          </span>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          className="border-white/15 bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary"
          title="Refresh data"
        >
          <RefreshCw className={cn('h-4 w-4')} />
        </Button>
      </div>
    </header>
  );
}
