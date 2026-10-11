import { useState } from 'react';
import { QueryProvider } from '@/lib/query-provider';
import { AppLayout } from '@/components/layout/AppLayout';
import type { PageId } from '@/components/layout/Sidebar';
import { OverviewPage } from '@/pages/OverviewPage';
import { MaintenancePage } from '@/pages/MaintenancePage';
import { EnergyPage } from '@/pages/EnergyPage';
import { AlertsPage } from '@/pages/AlertsPage';

function App() {
  const [page, setPage] = useState<PageId>('overview');

  return (
    <QueryProvider>
      <AppLayout current={page} onNavigate={setPage}>
        {page === 'overview' && <OverviewPage />}
        {page === 'maintenance' && <MaintenancePage />}
        {page === 'energy' && <EnergyPage />}
        {page === 'alerts' && <AlertsPage />}
      </AppLayout>
    </QueryProvider>
  );
}

export default App;
