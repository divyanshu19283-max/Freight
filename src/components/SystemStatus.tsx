import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Database, Server, Cpu, CheckCircle2, MinusCircle, AlertCircle } from 'lucide-react';

export type SystemStatus = {
  api: 'online' | 'offline' | 'checking';
  database: 'connected' | 'unknown';
  ml: 'ready' | 'unknown';
  version: string;
};

export function useSystemStatus(): SystemStatus {
  const q = useQuery({
    queryKey: ['health'],
    queryFn: () => api.health(),
    refetchInterval: 20000,
    retry: 0,
    staleTime: 10000,
  });

  if (q.isLoading) {
    return { api: 'checking', database: 'unknown', ml: 'unknown', version: 'v1.0' };
  }
  if (q.isError || !q.data) {
    return { api: 'offline', database: 'unknown', ml: 'unknown', version: 'v1.0' };
  }
  const h = q.data;
  return {
    api: 'online',
    database: h.database === 'connected' || h.database === 'ok' ? 'connected' : 'unknown',
    ml: h.model_loaded ? 'ready' : 'unknown',
    version: h.version ?? 'v1.0',
  };
}

export function StatusDot({ state }: { state: 'online' | 'connected' | 'ready' | 'offline' | 'unknown' | 'checking' }) {
  const map = {
    online: 'bg-success-500',
    connected: 'bg-success-500',
    ready: 'bg-success-500',
    offline: 'bg-danger-500',
    unknown: 'bg-slate-600',
    checking: 'bg-warn-500 animate-pulse-dot',
  } as const;
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${map[state]}`} />;
}

export function StatusStrip({ status }: { status: SystemStatus }) {
  const items = [
    { icon: Server, label: 'API', state: status.api, okText: 'ONLINE', badText: 'OFFLINE' },
    { icon: Database, label: 'DATABASE', state: status.database, okText: 'CONNECTED', badText: 'UNKNOWN' },
    { icon: Cpu, label: 'ML ENGINE', state: status.ml, okText: 'READY', badText: 'UNKNOWN' },
  ];
  return (
    <div className="flex items-center gap-4">
      {items.map((it) => {
        const ok = it.state === 'online' || it.state === 'connected' || it.state === 'ready';
        return (
          <div key={it.label} className="flex items-center gap-2">
            <it.icon className={`h-3.5 w-3.5 ${ok ? 'text-slate-400' : 'text-slate-600'}`} />
            <StatusDot state={it.state} />
            <span className={`label-mono ${ok ? 'text-slate-400' : 'text-slate-600'}`}>
              {it.label}
            </span>
            <span className={`text-2xs font-semibold ${ok ? 'text-success-400' : 'text-slate-600'}`}>
              {ok ? it.okText : it.badText}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function StatusBanner({ status }: { status: SystemStatus }) {
  if (status.api !== 'offline') return null;
  return (
    <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/[0.06] px-4 py-2 text-xs text-amber-300">
      <AlertCircle className="h-3.5 w-3.5" />
      <span>Backend unavailable — interface running in demo mode.</span>
    </div>
  );
}

export function MiniStatus({ status }: { status: SystemStatus }) {
  const ok = status.api === 'online';
  return (
    <div className="flex items-center gap-2">
      {ok ? <CheckCircle2 className="h-3.5 w-3.5 text-success-400" /> : <MinusCircle className="h-3.5 w-3.5 text-slate-600" />}
      <span className={`text-2xs font-semibold ${ok ? 'text-success-400' : 'text-slate-500'}`}>
        {ok ? 'ALL SYSTEMS NOMINAL' : 'DEMO MODE'}
      </span>
    </div>
  );
}
