import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type ConnectionStatus = 'online' | 'offline' | 'checking';

export function useConnectionStatus() {
  const query = useQuery({
    queryKey: ['health'],
    queryFn: api.getHealth,
    refetchInterval: 30_000,
    retry: 0,
  });

  const status: ConnectionStatus = query.isPending
    ? 'checking'
    : query.isError
    ? 'offline'
    : 'online';

  return { status, query, lastSuccess: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null };
}
