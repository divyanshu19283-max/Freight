import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { ArrowRight, TrendingUp, Anchor, Activity, Cpu, Database, Radio } from 'lucide-react';
import type { SystemStatus } from '@/components/SystemStatus';
import { MiniStatus } from '@/components/SystemStatus';

// Subtle animated maritime visualization behind the hero.
function HeroVisual() {
  // Pre-compute stable route lines + floating points
  const routes = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        id: i,
        x1: 8 + ((i * 13) % 30),
        y1: 20 + ((i * 7) % 50),
        x2: 60 + ((i * 9) % 32),
        y2: 30 + ((i * 11) % 45),
        delay: i * 0.6,
        dur: 6 + (i % 4),
      })),
    [],
  );
  const points = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        cx: 10 + ((i * 23) % 80),
        cy: 15 + ((i * 17) % 70),
        r: 1 + (i % 3) * 0.6,
        delay: (i % 7) * 0.5,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* grid */}
      <div className="absolute inset-0 bg-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      {/* radial glow */}
      <div className="absolute inset-0 bg-radial-fade" />

      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {/* route lines */}
        {routes.map((r) => (
          <g key={r.id}>
            <line
              x1={`${r.x1}%`}
              y1={`${r.y1}%`}
              x2={`${r.x2}%`}
              y2={`${r.y2}%`}
              stroke="rgba(59,130,246,0.18)"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
            <motion.circle
              r="2.5"
              fill="#60a5fa"
              initial={{ cx: `${r.x1}%`, cy: `${r.y1}%`, opacity: 0 }}
              animate={{ cx: [`${r.x1}%`, `${r.x2}%`], cy: [`${r.y1}%`, `${r.y2}%`], opacity: [0, 1, 0] }}
              transition={{ duration: r.dur, delay: r.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        ))}
        {/* floating data points */}
        {points.map((p) => (
          <motion.circle
            key={p.id}
            cx={`${p.cx}%`}
            cy={`${p.cy}%`}
            r={p.r}
            fill="rgba(148,163,184,0.5)"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.15, 0.6, 0.15], cy: [`${p.cy}%`, `${p.cy - 3}%`, `${p.cy}%`] }}
            transition={{ duration: 5 + p.id, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        {/* faint market graph */}
        <motion.path
          d="M0,80 Q15,72 25,68 T50,55 T75,48 T100,35"
          stroke="rgba(59,130,246,0.35)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
          style={{ transform: 'scaleY(1.6) translateY(-20px)' }}
        />
      </svg>

      {/* vessel silhouette */}
      <motion.div
        className="absolute bottom-[12%] left-[14%] text-accent-400/30"
        animate={{ x: [0, 40, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Anchor className="h-6 w-6" />
      </motion.div>
    </div>
  );
}

const TRUST = [
  { label: 'LOCAL ML', icon: Cpu },
  { label: 'POSTGRESQL', icon: Database },
  { label: 'REAL-TIME API', icon: Radio },
  { label: '7 / 30 / 90 DAY FORECASTS', icon: Activity },
];

export function Landing({ onEnter, status }: { onEnter: () => void; status: SystemStatus }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      <HeroVisual />

      {/* top bar */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500/30 to-accent-700/10 ring-1 ring-accent-500/30">
            <Anchor className="h-4.5 w-4.5 text-accent-300" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide text-white">FREIGHT</div>
            <div className="text-2xs font-semibold uppercase tracking-ultra text-accent-300/80">Intelligence</div>
          </div>
        </div>
        <MiniStatus status={status} />
      </header>

      {/* hero */}
      <main className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-16 text-center sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-2xs font-semibold uppercase tracking-widest text-slate-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse-dot" />
          SIH 2026 · Problem Statement 26006
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl"
        >
          Freight Intelligence.
          <br />
          <span className="bg-gradient-to-r from-accent-200 via-accent-400 to-accent-300 bg-clip-text text-transparent">
            Decisions Before the Market Moves.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-2xl text-balance text-base text-slate-400 sm:text-lg"
        >
          AI-powered freight forecasting and chartering intelligence for bulk cargo procurement.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <button onClick={onEnter} className="btn-primary px-6 py-3 text-base">
            Open Command Center
            <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={onEnter} className="btn-outline px-6 py-3 text-base">
            <TrendingUp className="h-4 w-4" />
            Explore Forecast
          </button>
        </motion.div>

        {/* trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        >
          {TRUST.map((t) => (
            <div key={t.label} className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-widest text-slate-500">
              <t.icon className="h-3.5 w-3.5 text-slate-600" />
              {t.label}
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 max-w-md text-xs text-slate-600"
        >
          Prototype uses historical + synthetic data. Not live market data.
        </motion.p>
      </main>
    </div>
  );
}
