// Public data facade for the dashboard. In SIH demo mode this facade never
// calls Render: all dashboard data is bundled locally so CORS/backend outages
// cannot interrupt navigation or interactions. The optional LLM is separate.
import { DEMO_ORIGINS, DEMO_PORTS, DEMO_VESSELS, buildDemoIntegratedDecision, getDemoMarketSignals } from '../demoMaritime';
import { DEMO_ROUTES } from '../demoRoutes';
import { DEMO_SUMMARY, DEMO_EDA, buildDemoForecast, buildDemoWhatIf, DEMO_OPTIMIZE, DEMO_RECOMMENDATIONS, DEMO_SCENARIOS, DEMO_MODEL_RUNS, DEMO_FORECAST_HISTORY } from '../demo';
import type { HealthResponse, WhatIfInput } from '../types';

const later = <T,>(value:T, delay=60) => new Promise<T>(resolve => setTimeout(() => resolve(value), delay));

export const getIntegratedDecision = async (input: Parameters<typeof buildDemoIntegratedDecision>[0]) => later(buildDemoIntegratedDecision(input), 100);
export const getMarketSignals = async (origin?: string, vesselType?: string) => later(getDemoMarketSignals(origin, vesselType));

export const api = {
  base: '',
  health: async (): Promise<HealthResponse> => later({ status:'healthy', database:'local-demo', model_loaded:true, version:'1.0.0' }),
  routes: async () => later(DEMO_ROUTES),
  summary: async () => later(DEMO_SUMMARY),
  eda: async () => later(DEMO_EDA),
  forecast: async (body:{origin:string;destination:string;vessel:string;horizon:number}) => later(buildDemoForecast(body.origin, body.destination, body.vessel, body.horizon), 100),
  forecastHistory: async () => later(DEMO_FORECAST_HISTORY),
  whatif: async (input:WhatIfInput) => later(buildDemoWhatIf(input), 100),
  optimize: async (body:{origin:string;destination:string;vessel:string}) => later({...DEMO_OPTIMIZE,origin:body.origin,destination:body.destination,vessel:body.vessel},100),
  recommendationsHistory: async () => later(DEMO_RECOMMENDATIONS),
  scenariosHistory: async () => later(DEMO_SCENARIOS),
  modelRuns: async () => later(DEMO_MODEL_RUNS),
  origins: async () => later(DEMO_ORIGINS),
  listPorts: async () => later(DEMO_PORTS),
  listVessels: async () => later(DEMO_VESSELS),
};

export const probeBackend = async () => 'online' as const;
export class ApiClientError extends Error { kind:'offline'|'error'|'no-data'|'server'|'unknown'='offline'; }
