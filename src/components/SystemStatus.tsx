import { Database, Server, Cpu, CheckCircle2 } from 'lucide-react';

export type SystemStatus = { api: 'online' | 'offline' | 'checking'; database: 'connected' | 'unknown'; ml: 'ready' | 'unknown'; version: string };

export function useSystemStatus(): SystemStatus {
  return { api: 'online', database: 'connected', ml: 'ready', version: 'v1.0' };
}

export function StatusDot({ state }: { state: 'online' | 'connected' | 'ready' | 'offline' | 'unknown' | 'checking' }) {
  const map = { online: 'bg-success-500', connected: 'bg-success-500', ready: 'bg-success-500', offline: 'bg-danger-500', unknown: 'bg-slate-600', checking: 'bg-warn-500 animate-pulse-dot' } as const;
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${map[state]}`} />;
}

export function StatusStrip({ status }: { status: SystemStatus }) {
  const items = [{ icon: Server, label: 'API', state: status.api, text: 'DEMO' }, { icon: Database, label: 'DATA', state: status.database, text: 'LOCAL' }, { icon: Cpu, label: 'ML', state: status.ml, text: 'READY' }];
  return <div className="flex items-center gap-4">{items.map((it) => <div key={it.label} className="flex items-center gap-2"><it.icon className="h-3.5 w-3.5 text-slate-400" /><StatusDot state={it.state} /><span className="label-mono text-slate-400">{it.label}</span><span className="text-2xs font-semibold text-success-400">{it.text}</span></div>)}</div>;
}

export function StatusBanner({ status: _status }: { status?: SystemStatus }) {
  return <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/[0.06] px-4 py-2 text-xs text-amber-300"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /><span>Demo Mode · bundled freight data · backend not required</span></div>;
}

export function MiniStatus() {
  return <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-success-400" /><span className="text-2xs font-semibold text-success-400">DEMO MODE · READY</span></div>;
}
