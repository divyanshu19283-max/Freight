import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Compass,
  SlidersHorizontal,
  ListOrdered,
  Database,
  BrainCircuit,
  History,
  Anchor,
  ShipWheel,
  X,
} from 'lucide-react';
import { StatusStrip, type SystemStatus } from './SystemStatus';

export type PageId =
  | 'command'
  | 'forecast'
  | 'charter'
  | 'whatif'
  | 'optimize'
  | 'market'
  | 'model'
  | 'scenarios'
  | 'maritime';

export const NAV: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'command', label: 'Command Center', icon: LayoutDashboard },
  { id: 'maritime', label: 'Maritime Operations', icon: ShipWheel },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  { id: 'charter', label: 'Charter Decision', icon: Compass },
  { id: 'whatif', label: 'What-If Simulator', icon: SlidersHorizontal },
  { id: 'optimize', label: 'Optimization', icon: ListOrdered },
  { id: 'market', label: 'Market Data', icon: Database },
  { id: 'model', label: 'Model Intelligence', icon: BrainCircuit },
  { id: 'scenarios', label: 'Scenarios', icon: History },
];

export function Sidebar({
  current,
  onNavigate,
  status,
  mobileOpen,
  onCloseMobile,
}: {
  current: PageId;
  onNavigate: (p: PageId) => void;
  status: SystemStatus;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed z-50 flex h-full w-[260px] flex-col border-r border-white/[0.06] bg-ink-950/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500/30 to-accent-700/10 ring-1 ring-accent-500/30">
              <Anchor className="h-4.5 w-4.5 text-accent-300" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide text-white">FREIGHT</div>
              <div className="text-2xs font-semibold uppercase tracking-ultra text-accent-300/80">
                Intelligence
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-5 divider" />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-2 label-mono">Navigation</div>
          <ul className="space-y-0.5">
            {NAV.map((item) => {
              const active = current === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      onCloseMobile();
                    }}
                    className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                      active
                        ? 'bg-white/[0.06] text-white'
                        : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent-400"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <item.icon className={`h-4 w-4 ${active ? 'text-accent-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom status */}
        <div className="border-t border-white/[0.06] px-4 py-4">
          <div className="mb-3 flex flex-col gap-1.5">
            <StatusStrip status={status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="label-mono">VERSION</span>
            <span className="font-mono text-2xs text-slate-400">{status.version}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
