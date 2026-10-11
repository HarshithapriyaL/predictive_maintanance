import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Sidebar, type PageId } from './Sidebar';
import { Topbar } from './Topbar';
import { Info } from 'lucide-react';

interface AppLayoutProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
  children: React.ReactNode;
}

export function AppLayout({ current, onNavigate, children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const handleNavigate = (page: PageId) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-main">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar current={current} onNavigate={handleNavigate} />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[240px] border-white/10 bg-indigo-deep p-0">
          <Sidebar current={current} onNavigate={handleNavigate} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          page={current}
          onRefresh={handleRefresh}
          onToggleMobileNav={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-grid">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
            {children}
          </div>
        </main>
        <footer className="flex items-center gap-2 border-t border-white/10 bg-surface-secondary px-4 py-2.5 text-xs text-text-muted lg:px-6">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            Proof of concept — synthetic AI4I dataset, simulated telemetry, in-memory history.
            Not a certified industrial safety system.
          </span>
        </footer>
      </div>
    </div>
  );
}
