import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { buildDemoForecast, buildDemoWhatIf, DEMO_SUMMARY, DEMO_EDA, DEMO_OPTIMIZE, DEMO_RECOMMENDATIONS, DEMO_SCENARIOS, DEMO_MODEL_RUNS, DEMO_FORECAST_HISTORY } from './demo';
import { DEMO_ROUTES } from './demoRoutes';
import { buildDemoIntegratedDecision, getDemoMarketSignals } from './demoMaritime';
import type { RoutesResponse, DataSummary, EDAStats, ForecastResult, WhatIfInput, WhatIfResult, OptimizeResult, RecommendationHistoryItem, ScenarioHistoryItem, ModelRun, ForecastHistoryItem } from './types';

const demo = <T,>(value: T, delay = 70) => new Promise<T>((resolve) => setTimeout(() => resolve(value), delay));

export function useHealth() {
  return useQuery({ queryKey: ['health'], queryFn: () => demo({ status: 'healthy', database: 'local-demo', model_loaded: true, version: '1.0.0' }), staleTime: Infinity, retry: 0 });
}
export function useRoutes() {
  return useQuery<RoutesResponse & { _demo?: boolean }>({ queryKey: ['routes'], queryFn: () => demo({ ...DEMO_ROUTES, _demo: true }), staleTime: Infinity, retry: 0 });
}
export function useSummary() {
  return useQuery<DataSummary & { _demo?: boolean }>({ queryKey: ['summary'], queryFn: () => demo({ ...DEMO_SUMMARY, _demo: true }), staleTime: Infinity, retry: 0 });
}
export function useEda() {
  return useQuery<EDAStats & { _demo?: boolean }>({ queryKey: ['eda'], queryFn: () => demo({ ...DEMO_EDA, _demo: true }), staleTime: Infinity, retry: 0 });
}
function valid(body: { origin: string; destination: string; vessel: string; horizon: number } | null) {
  return !!body && !!body.origin?.trim() && !!body.destination?.trim() && !!body.vessel?.trim() && Number.isFinite(body.horizon) && body.horizon > 0;
}
export function useForecast(body: { origin: string; destination: string; vessel: string; horizon: number } | null) {
  const enabled = valid(body);
  return useQuery<ForecastResult & { _demo?: boolean }>({ queryKey: ['forecast', body], queryFn: () => demo({ ...buildDemoForecast(body!.origin, body!.destination, body!.vessel, body!.horizon), _demo: true }, 120), enabled, placeholderData: keepPreviousData, staleTime: Infinity, retry: 0 });
}
export function useForecastHistory() { return useQuery<ForecastHistoryItem[]>({ queryKey: ['forecast-history'], queryFn: () => demo(DEMO_FORECAST_HISTORY), staleTime: Infinity, retry: 0 }); }
export function useWhatIf() { return useMutation<WhatIfResult & { _demo?: boolean }, Error, WhatIfInput>({ mutationFn: (input) => demo({ ...buildDemoWhatIf(input), _demo: true }, 140) }); }
export function useOptimize(body: { origin: string; destination: string; vessel: string } | null) { return useQuery<OptimizeResult & { _demo?: boolean }>({ queryKey: ['optimize', body], queryFn: () => demo({ ...DEMO_OPTIMIZE, origin: body!.origin, destination: body!.destination, vessel: body!.vessel, _demo: true }, 120), enabled: !!body, placeholderData: keepPreviousData, staleTime: Infinity, retry: 0 }); }
export function useRecommendationsHistory() { return useQuery<RecommendationHistoryItem[]>({ queryKey: ['recommendations'], queryFn: () => demo(DEMO_RECOMMENDATIONS), staleTime: Infinity, retry: 0 }); }
export function useScenariosHistory() { return useQuery<ScenarioHistoryItem[]>({ queryKey: ['scenarios'], queryFn: () => demo(DEMO_SCENARIOS), staleTime: Infinity, retry: 0 }); }
export function useModelRuns() { return useQuery<ModelRun[]>({ queryKey: ['model-runs'], queryFn: () => demo(DEMO_MODEL_RUNS), staleTime: Infinity, retry: 0 }); }
export function useIntegratedDecision(input: Parameters<typeof buildDemoIntegratedDecision>[0] | null) { return useQuery({ queryKey: ['integrated-decision', input], queryFn: () => demo(buildDemoIntegratedDecision(input!), 140), enabled: !!input && input.cargoQuantity > 0 && input.currentFreightRate > 0 && input.fuelPrice > 0, staleTime: Infinity, retry: 0 }); }
export function useMarketSignals(origin?: string, vesselType?: string) { return useQuery({ queryKey: ['market-signals', origin, vesselType], queryFn: () => demo(getDemoMarketSignals(origin, vesselType)), staleTime: Infinity, retry: 0 }); }
