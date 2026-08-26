import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForecast, useOptimize } from '@/lib/hooks';
import { RouteSelector, type RouteSelection } from '@/components/RouteSelector';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { DemoBadge, LiveBadge, SkeletonBlock, InlineError } from '@/components/states';
import { fmtInr, fmtPct, riskTone, changeTone } from '@/lib/format';
import { Check, Clock, Eye, ShieldAlert, ArrowRight, ListChecks } from 'lucide-react';
import type { PageId } from '@/components/Sidebar';

type DecisionState = 'CHARTER NOW' | 'WAIT' | 'WAIT & MONITOR';

export function CharterDecision({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [sel, setSel] = useState<RouteSelection>({
    origin: 'Australia',
    destination: 'East Coast India',
    vessel: 'Panamax',
    horizon: 30,
  });
  const forecastQ = useForecast(sel);
  const optimizeQ = useOptimize(sel);
  const f = forecastQ.data;
  const o = optimizeQ.data;
  const isDemo = !!f?._demo;

  const active: DecisionState = 'WAIT & MONITOR';

  const states: { id: DecisionState; icon: typeof Check; desc: string }[] = [
    { id: 'CHARTER NOW', icon: Check, desc: 'Lock the current rate. Zero exposure.' },
    { id: 'WAIT', icon: Clock, desc: 'Delay for a modeled lower entry.' },
    { id: 'WAIT & MONITOR', icon: Eye, desc: 'Hold and watch the 7-day signal.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-white">Charter Decision</h1>
          {isDemo ? <DemoBadge /> : f ? <LiveBadge /> : null}
        </div>
        <p className="text-sm text-slate-400">Risk-adjusted chartering recommendation.</p>
      </div>

      <div className="panel p-4">
        <RouteSelector value={sel} onChange={setSel} />
      </div>

      {/* Three decision states */}
      <div className="grid gap-4 lg:grid-cols-3">
        {states.map((s, i) => {
          const isActive = s.id === active;
          const tone = isActive ? 'border-warn-500/40 bg-warn-500/[0.06] ring-1 ring-warn-500/30' : 'border-white/[0.06] bg-white/[0.02]';
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className={`panel relative overflow-hidden p-5 ${isActive ? tone : ''} ${isActive ? 'lg:scale-[1.03]' : ''}`}
            >
              {isActive && (
                <span className="absolute right-3 top-3 chip border-warn-500/40 bg-warn-500/15 text-warn-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-warn-400 animate-pulse-dot" /> Active
                </span>
              )}
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${isActive ? 'bg-warn-500/15 text-warn-300 ring-1 ring-warn-500/30' : 'bg-white/[0.04] text-slate-400'}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="text-lg font-bold text-white">{s.id}</div>
              </div>
              <p className="mt-3 text-sm text-slate-400">{s.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Decision detail */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="panel p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">Decision Summary</h2>
          <p className="mt-1 text-xs text-slate-500">{sel.origin} → {sel.destination} · {sel.vessel}</p>

          {forecastQ.isLoading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-10" />)}
            </div>
          ) : forecastQ.isError ? (
            <div className="mt-4"><InlineError error={forecastQ.error} onRetry={() => forecastQ.refetch()} /></div>
          ) : f ? (
            <div className="mt-5 space-y-3">
              <DetailRow label="Decision" value="WAIT & MONITOR" tone="text-warn-300" />
              <DetailRow label="Confidence" value={`${f.confidence.toFixed(1)}%`} tone="text-success-400" />
              <DetailRow label="Risk" value="MEDIUM" tone={riskTone('MEDIUM').text} />
              <DetailRow label="Expected savings" value={fmtInr(73000)} tone="text-success-400" />
              <DetailRow label="Expected movement" value={fmtPct(f.expected_change_pct)} tone={changeTone(f.expected_change_pct)} />
              <div className="my-2 divider" />
              <div>
                <div className="label-mono mb-2">Reason</div>
                <p className="text-sm leading-relaxed text-slate-400">
                  {f.reason ?? 'Current signals do not justify an immediate charter. The model projects a modest upward drift within the horizon; watch the short-term signal before committing.'}
                </p>
              </div>
            </div>
          ) : null}

          <button onClick={() => onNavigate('whatif')} className="btn-primary mt-6 w-full sm:w-auto">
            Run What-If Analysis
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Decision factors */}
        <div className="panel p-6">
          <div className="mb-4 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-accent-300" />
            <h2 className="text-base font-semibold text-white">Decision Factors</h2>
          </div>
          <div className="space-y-3">
            <Factor label="Forecast movement" value={f ? fmtPct(f.expected_change_pct) : '—'} tone={f ? changeTone(f.expected_change_pct) : ''} />
            <Factor label="Confidence" value={f ? `${f.confidence.toFixed(1)}%` : '—'} tone="text-success-400" />
            <Factor label="Current rate" value={f ? `$${f.current_rate.toFixed(2)}` : '—'} />
            <Factor label="Future rate" value={f ? `$${f.predicted_rate.toFixed(2)}` : '—'} tone="text-accent-300" />
            <Factor label="Risk adjustment" value="MEDIUM" tone={riskTone('MEDIUM').text} />
          </div>
          {o && (
            <>
              <div className="my-4 divider" />
              <div className="label-mono mb-2">Recommended</div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-warn-400" />
                <span className="text-sm font-semibold text-warn-300">{o.recommended}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, tone = 'text-white' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.04] pb-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`num text-sm font-semibold ${tone}`}>{value}</span>
    </div>
  );
}

function Factor({ label, value, tone = 'text-slate-200' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`num text-sm font-semibold ${tone}`}>{value}</span>
    </div>
  );
}
