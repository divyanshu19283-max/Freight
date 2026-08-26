import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function KpiCard({
  label,
  value,
  sub,
  tone = 'neutral',
  icon,
  delay = 0,
  isDemo = false,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: 'neutral' | 'positive' | 'negative' | 'warning' | 'accent';
  icon?: ReactNode;
  delay?: number;
  isDemo?: boolean;
}) {
  const toneRing = {
    neutral: 'ring-white/[0.06]',
    positive: 'ring-success-500/20',
    negative: 'ring-danger-500/20',
    warning: 'ring-warn-500/20',
    accent: 'ring-accent-500/20',
  }[tone];
  const toneText = {
    neutral: 'text-slate-200',
    positive: 'text-success-400',
    negative: 'text-danger-400',
    warning: 'text-warn-400',
    accent: 'text-accent-300',
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`panel relative overflow-hidden p-4 ring-1 ${toneRing}`}
    >
      <div className="flex items-start justify-between">
        <span className="label-mono">{label}</span>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <div className={`mt-3 text-2xl font-bold tracking-tight ${toneText}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
      {isDemo && (
        <span className="absolute right-2 top-2 chip border-amber-500/30 bg-amber-500/10 text-amber-300">
          Demo
        </span>
      )}
    </motion.div>
  );
}

export function TrendPill({ value }: { value: number }) {
  const up = value > 0;
  const flat = value === 0;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  const tone = flat ? 'text-slate-400 bg-white/5' : up ? 'text-success-400 bg-success-500/10' : 'text-danger-400 bg-danger-500/10';
  return (
    <span className={`chip ${tone}`}>
      <Icon className="h-3 w-3" />
      {up ? '+' : ''}
      {value.toFixed(1)}%
    </span>
  );
}
