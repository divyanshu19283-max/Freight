import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend,
} from 'recharts';
import type { ForecastPoint } from '@/lib/types';
import { fmtUsd } from '@/lib/format';

function finite(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-ink-900/95 px-3 py-2 text-xs shadow-glass backdrop-blur-xl">
      <div className="mb-1 font-mono text-2xs uppercase tracking-widest text-slate-500">{label}</div>
      {payload.filter((p) => finite(p.value)).map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 capitalize text-slate-300"><span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />{p.name}</span>
          <span className="num font-semibold text-white">{fmtUsd(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function ForecastChart({ series, currentRate, height = 340 }: { series: ForecastPoint[]; currentRate?: number; height?: number }) {
  const safeSeries = series
    .filter((s) => typeof s.date === 'string' && s.date.length > 0)
    .map((s) => ({
      date: s.date,
      historical: finite(s.historical) ? s.historical : null,
      forecast: finite(s.forecast) ? s.forecast : null,
      lower: finite(s.lower) ? s.lower : null,
      upper: finite(s.upper) ? s.upper : null,
    }));
  const todayIdx = safeSeries.findIndex((s) => finite(s.forecast) && !finite(s.historical));
  const refX = todayIdx > 0 ? safeSeries[todayIdx - 1].date : undefined;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={safeSeries} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} /></linearGradient>
          <linearGradient id="histLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#64748b" /><stop offset="100%" stopColor="#94a3b8" /></linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={40} />
        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `$${v}`} />
        <Tooltip content={<ChartTooltip />} />
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingBottom: 8 }} />
        <Area type="monotone" dataKey="upper" name="Upper" stroke="none" fill="url(#confBand)" legendType="none" isAnimationActive={false} connectNulls={false} />
        <Area type="monotone" dataKey="lower" name="Lower" stroke="none" fill="#0a0f1c" legendType="none" isAnimationActive={false} connectNulls={false} />
        <Line type="monotone" dataKey="historical" name="Historical" stroke="url(#histLine)" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
        <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#3b82f6" strokeWidth={2.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} connectNulls />
        {finite(currentRate) && <ReferenceLine y={currentRate} stroke="#475569" strokeDasharray="2 4" strokeWidth={1} label={{ value: 'Current', fill: '#64748b', fontSize: 10, position: 'insideLeft' }} />}
        {refX && <ReferenceLine x={refX} stroke="#33455f" strokeDasharray="2 3" strokeWidth={1} />}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
