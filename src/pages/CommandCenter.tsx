import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForecast, useOptimize } from '@/lib/hooks';
import { RouteSelector, type RouteSelection } from '@/components/RouteSelector';
import { ForecastChart } from '@/components/ForecastChart';
import { KpiCard, TrendPill } from '@/components/KpiCard';
import { CostComparison, CostBreakdownCards } from '@/components/CostComparison';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { DemoBadge, LiveBadge, SkeletonBlock, InlineError } from '@/components/states';
import { fmtUsd, fmtPct, fmtInr, riskTone, changeTone } from '@/lib/format';
import { ArrowRight, DollarSign, TrendingUp, Gauge, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import type { PageId } from '@/components/Sidebar';

export function CommandCenter({ onNavigate }: { onNavigate: (p: PageId) => void }) {
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
  const risk = f ? riskTone('MEDIUM') : riskTone('MEDIUM');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-white">Command Center</h1>
          {isDemo ? <DemoBadge /> : f ? <LiveBadge /> : null}
        </div>
        <p className="text-sm text-slate-400">Market intelligence for your next procurement decision.</p>
      </div>

      {/* Route selector */}
      <div className="panel p-4">
        <RouteSelector value={sel} onChange={setSel} />
      </div>

      {/* Prominent route */}
      <div className="panel relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-grid opacity-20 [mask-image:linear-gradient(to_right,black,transparent)]" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
          <RoutePill label="Origin" value={sel.origin} />
          <div className="flex flex-col items-center text-accent-400">
            <ArrowRight className="h-5 w-5 rotate-90 sm:rotate-0" />
          </div>
          <RoutePill label="Destination" value={sel.destination} />
          <div className="rounded-lg border border-accent-500/30 bg-accent-500/10 px-4 py-2">
            <div className="label-mono text-accent-300/80">Vessel</div>
            <div className="text-lg font-bold text-accent-200">{sel.vessel}</div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      {forecastQ.isLoading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-[110px]" />
          ))}
        </div>
      ) : forecastQ.isError ? (
        <InlineError error={forecastQ.error} onRetry={() => forecastQ.refetch()} />
      ) : f ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <KpiCard
            label="Current Rate"
            value={<AnimatedNumber value={f.current_rate} prefix="$" decimals={2} />}
            sub="per tonne"
            icon={<DollarSign className="h-4 w-4" />}
            delay={0}
            isDemo={isDemo}
          />
          <KpiCard
            label={`${sel.horizon}D Forecast`}
            value={<AnimatedNumber value={f.predicted_rate} prefix="$" decimals={2} />}
            sub={f.model}
            tone="accent"
            icon={<TrendingUp className="h-4 w-4" />}
            delay={0.06}
            isDemo={isDemo}
          />
          <KpiCard
            label="Expected Change"
            value={<span className={changeTone(f.expected_change_pct)}><AnimatedNumber value={f.expected_change_pct} decimals={1} suffix="%" /></span>}
            sub={<TrendPill value={f.expected_change_pct} />}
            tone={f.expected_change_pct >= 0 ? 'positive' : 'negative'}
            icon={<Activity className="h-4 w-4" />}
            delay={0.12}
            isDemo={isDemo}
          />
          <KpiCard
            label="Confidence"
            value={<AnimatedNumber value={f.confidence} decimals={1} suffix="%" />}
            sub="model confidence"
            tone="positive"
            icon={<Gauge className="h-4 w-4" />}
            delay={0.18}
            isDemo={isDemo}
          />
          <KpiCard
            label="Risk"
            value={<span className={risk.text}>MEDIUM</span>}
            sub="risk-adjusted"
            tone="warning"
            icon={<ShieldAlert className="h-4 w-4" />}
            delay={0.24}
            isDemo={isDemo}
          />
        </div>
      ) : null}

      {/* Main forecast chart */}
      <div className="panel p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Freight Rate Outlook</h2>
            <p className="text-xs text-slate-500">Historical rate + model forecast</p>
          </div>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((h) => (
              <button
                key={h}
                onClick={() => setSel({ ...sel, horizon: h })}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  sel.horizon === h
                    ? 'bg-accent-500/20 text-accent-200 ring-1 ring-accent-500/40'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {h}D
              </button>
            ))}
          </div>
        </div>
        {forecastQ.isLoading ? (
          <SkeletonBlock className="h-[340px] w-full" />
        ) : forecastQ.isError ? (
          <InlineError error={forecastQ.error} onRetry={() => forecastQ.refetch()} />
        ) : f ? (
          <>
            <ForecastChart series={f.series} currentRate={f.current_rate} />
            {isDemo && (
              <p className="mt-3 text-center text-xs text-amber-300/80">
                Illustrative data — backend unavailable. Values shown are for demonstration only.
              </p>
            )}
          </>
        ) : null}
      </div>

      {/* Decision panel + cost comparison */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Decision card */}
        <div className="panel relative overflow-hidden p-6 lg:col-span-1">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-warn-500/10 blur-3xl" />
          <div className="relative">
            <div className="label-mono">Recommendation</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warn-500/15 ring-1 ring-warn-500/30">
                <ShieldAlert className="h-6 w-6 text-warn-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">WAIT & MONITOR</div>
                <div className="text-xs text-slate-400">Current signals do not justify an immediate charter.</div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <DecisionRow label="Expected movement" value={fmtPct(f?.expected_change_pct ?? 2.2)} tone={changeTone(f?.expected_change_pct ?? 2.2)} />
              <DecisionRow label="Confidence" value={`${(f?.confidence ?? 88).toFixed(1)}%`} tone="text-success-400" />
              <DecisionRow label="Risk" value="MEDIUM" tone={risk.text} />
              <DecisionRow label="Expected saving" value={fmtInr(73000)} tone="text-success-400" />
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              The model projects a modest upward drift within the forecast horizon. Locking now avoids exposure but forgoes a small modeled saving. Watch the 7-day signal before committing.
            </p>

            <button
              onClick={() => onNavigate('whatif')}
              className="btn-primary mt-5 w-full"
            >
              Run What-If Analysis
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Cost comparison */}
        <div className="panel p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Cost Comparison</h2>
              <p className="text-xs text-slate-500">Risk-adjusted total cost across horizons</p>
            </div>
            {o?._demo && <DemoBadge />}
          </div>
          {optimizeQ.isLoading ? (
            <SkeletonBlock className="h-[260px] w-full" />
          ) : optimizeQ.isError ? (
            <InlineError error={optimizeQ.error} onRetry={() => optimizeQ.refetch()} />
          ) : o ? (
            <>
              <CostComparison options={o.options.map((opt) => ({ label: opt.label, total: opt.total_cost, savings: opt.savings }))} recommended={o.recommended} />
              <div className="mt-5">
                <CostBreakdownCards options={o.options.map((opt) => ({ label: opt.label, total: opt.total_cost, savings: opt.savings }))} recommended={o.recommended} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RoutePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-center">
      <div className="label-mono">{label}</div>
      <div className="mt-1 text-lg font-bold tracking-wide text-white">{value}</div>
    </div>
  );
}

function DecisionRow({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`num text-sm font-semibold ${tone}`}>{value}</span>
    </div>
  );
}
