// Tidal & Bridge Clearance Data — Chennai Water Metro Safety Module
// Real-time bridge clearance monitoring and tidal alerts

export type BridgeStatus = 'safe' | 'caution' | 'closed';

export interface BridgeClearance {
  bridgeName: string;
  location: [number, number]; // [lat, lng]
  normalClearance: number; // meters
  currentClearance: number; // meters
  status: BridgeStatus;
  waterLevel: number; // meters above mean sea level
}

export interface TidalAlert {
  id: string;
  message: string;
  timestamp: string; // ISO 8601
  severity: 'info' | 'warning' | 'critical';
  affectedRoutes: number[];
}

export const bridgeClearances: BridgeClearance[] = [
  {
    bridgeName: 'Napier Bridge',
    location: [13.0695, 80.2892],
    normalClearance: 4.8,
    currentClearance: 3.9,
    status: 'caution',
    waterLevel: 1.7,
  },
  {
    bridgeName: 'MRTS Bridge Adyar',
    location: [13.0136, 80.2588],
    normalClearance: 5.2,
    currentClearance: 4.8,
    status: 'safe',
    waterLevel: 1.2,
  },
  {
    bridgeName: 'Ennore Creek Bridge',
    location: [13.2185, 80.3201],
    normalClearance: 6.0,
    currentClearance: 5.5,
    status: 'safe',
    waterLevel: 1.0,
  },
  {
    bridgeName: 'Chetpet Rail Bridge',
    location: [13.0734, 80.2415],
    normalClearance: 3.5,
    currentClearance: 2.1,
    status: 'closed',
    waterLevel: 2.4,
  },
  {
    bridgeName: 'Buckingham Canal Overpass',
    location: [13.0630, 80.2812],
    normalClearance: 4.2,
    currentClearance: 3.6,
    status: 'caution',
    waterLevel: 1.5,
  },
];

export const tidalAlerts: TidalAlert[] = [
  {
    id: 'TIDE-001',
    message:
      'High tide warning: Bay of Bengal surge expected at 14:30 IST. Water levels may rise 0.8m above normal at coastal stations. Routes 4 and 6 ferries advised to reduce speed.',
    timestamp: '2026-11-05T12:00:00.000Z',
    severity: 'warning',
    affectedRoutes: [4, 6],
  },
  {
    id: 'TIDE-002',
    message:
      'Chetpet Rail Bridge clearance below safe threshold (2.1m). Route 2 ferries diverted via alternative channel. Estimated normal clearance restoration by 18:00 IST.',
    timestamp: '2026-11-05T10:45:00.000Z',
    severity: 'critical',
    affectedRoutes: [2],
  },
  {
    id: 'TIDE-003',
    message:
      'Adyar estuary water levels stabilizing. MRTS Bridge Adyar clearance confirmed safe at 4.8m. Route 1 ferries operating at normal capacity.',
    timestamp: '2026-11-05T09:30:00.000Z',
    severity: 'info',
    affectedRoutes: [1],
  },
  {
    id: 'TIDE-004',
    message:
      'Napier Bridge clearance reduced to 3.9m due to monsoon runoff from Cooum River. Caution advisory issued for Route 2 vessels. Low-profile ferry Sangam-04 cleared for passage.',
    timestamp: '2026-11-05T08:15:00.000Z',
    severity: 'warning',
    affectedRoutes: [2],
  },
  {
    id: 'TIDE-005',
    message:
      'Ennore Creek tidal cycle normal. All Route 4 and Route 5 vessels cleared for full-speed operations. Next high tide at 22:10 IST.',
    timestamp: '2026-11-05T07:00:00.000Z',
    severity: 'info',
    affectedRoutes: [4, 5],
  },
  {
    id: 'TIDE-006',
    message:
      'Buckingham Canal water level rising — Overpass clearance at 3.6m (caution threshold). Route 4 southbound ferries advised to use low-draft configuration.',
    timestamp: '2026-11-05T11:20:00.000Z',
    severity: 'warning',
    affectedRoutes: [4],
  },
];

export const getSafeBridges = (): BridgeClearance[] =>
  bridgeClearances.filter((b) => b.status === 'safe');

export const getUnsafeBridges = (): BridgeClearance[] =>
  bridgeClearances.filter((b) => b.status !== 'safe');

export const getCriticalAlerts = (): TidalAlert[] =>
  tidalAlerts.filter((a) => a.severity === 'critical');

export const getAlertsByRoute = (routeId: number): TidalAlert[] =>
  tidalAlerts.filter((a) => a.affectedRoutes.includes(routeId));
