import type { RoutesResponse } from './types';

// Only corridors represented by the SIH demo dataset are exposed.
export const DEMO_ROUTES: RoutesResponse = {
  routes: [
    { origin: 'Australia', destinations: ['East Coast India'] },
    { origin: 'Brazil', destinations: ['East Coast India'] },
    { origin: 'Indonesia', destinations: ['East Coast India'] },
    { origin: 'South Africa', destinations: ['East Coast India'] },
    { origin: 'USA Gulf', destinations: ['East Coast India'] },
  ],
  vessel_types: ['Bulk Carrier', 'Capesize', 'Panamax', 'Supramax'],
};
