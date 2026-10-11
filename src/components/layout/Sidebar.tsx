import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  LayoutDashboard,
  Wrench,
  Zap,
  Bell,
  Cpu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useConnectionStatus } from '@/hooks/use-connection';
import { Button } from '@/components/ui/button';

export type PageId = 'overview' | 'maintenance' | 'energy' | 'alerts';

interface SidebarProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
}

const navItems: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'maintenance', label: 'Predictive Maintenance', icon: Wrench },
  { id: 'energy', label: 'Energy Management', icon: Zap },
  { id: 'alerts', label: 'Alerts & History', icon: Bell },
];

export function Sidebar({ current, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { status } = useConnectionStatus();

  const summaryQuery = useQuery({
    queryKey: ['system-summary'],
    queryFn: api.getSystemSummary,
    refetchInterval: 30_000,
    retry: 0,
  });

  const modelsLoaded = summaryQuery.data?.models_loaded;

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-white/10 bg-indigo-deep transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-royal/30 ring-1 ring-indigo-royal/40">
          <Cpu className="h-5 w-5 text-signal-yellow" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-wide text-text-primary">
              INDUSTRIA AI
            </p>
            <p className="truncate text-xs text-text-muted">
              Predictive Intelligence
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = current === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-indigo-royal text-text-primary shadow-sm ring-1 ring-indigo-royal/50'
                  : 'text-text-muted hover:bg-white/5 hover:text-text-secondary',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  active ? 'text-signal-yellow' : ''
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="space-y-2.5 rounded-lg bg-surface-main/40 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Backend</span>
              <StatusBadge status={status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Models</span>
              <StatusBadge
                status={
                  modelsLoaded === undefined
                    ? 'checking'
                    : modelsLoaded
                    ? 'ready'
                    : 'not-ready'
                }
              />
            </div>
            {summaryQuery.data && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Simulator</span>
                <StatusBadge
                  status={summaryQuery.data.simulator_running ? 'running' : 'stopped'}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                status === 'online' ? 'bg-status-success' : 'bg-status-critical'
              )}
            />
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 w-full justify-center text-text-muted hover:bg-white/5 hover:text-text-secondary"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
