// Ferry Fleet — CHENNAI 360 | WATERLINK
// 12 Battery-Electric Ferries (2 per corridor)

export interface Ferry {
  id: string;
  name: string;
  routeId: number;
  speed: number; // Knots
  batterySoC: number; // % State of Charge
  solarChargeRate: number; // kW Solar Generation
  currentPassengers: number;
  maxPassengers: number;
  captainId: string;
  currentStationIndex: number;
  progress: number; // 0 to 1
  direction: 1 | -1; // 1 = forward, -1 = reverse
}

export const ferryFleet: Ferry[] = [
  // Route 1 — Adyar River Corridor
  {
    id: 'WM-ADY-01',
    name: 'Kaveri Electric-01',
    routeId: 1,
    speed: 14.5,
    batterySoC: 88,
    solarChargeRate: 5.4,
    currentPassengers: 68,
    maxPassengers: 100,
    captainId: 'CPT-ADY-101',
    currentStationIndex: 3,
    progress: 0.45,
    direction: 1,
  },
  {
    id: 'WM-ADY-02',
    name: 'Pallava Wave-02',
    routeId: 1,
    speed: 16.0,
    batterySoC: 74,
    solarChargeRate: 6.1,
    currentPassengers: 42,
    maxPassengers: 100,
    captainId: 'CPT-ADY-102',
    currentStationIndex: 5,
    progress: 0.72,
    direction: -1,
  },

  // Route 2 — Cooum River Corridor
  {
    id: 'WM-COU-03',
    name: 'Sangam Solar-03',
    routeId: 2,
    speed: 12.0,
    batterySoC: 92,
    solarChargeRate: 4.8,
    currentPassengers: 84,
    maxPassengers: 100,
    captainId: 'CPT-COU-201',
    currentStationIndex: 1,
    progress: 0.35,
    direction: 1,
  },
  {
    id: 'WM-COU-04',
    name: 'Cheran Hydro-04',
    routeId: 2,
    speed: 15.2,
    batterySoC: 64,
    solarChargeRate: 5.2,
    currentPassengers: 51,
    maxPassengers: 100,
    captainId: 'CPT-COU-202',
    currentStationIndex: 4,
    progress: 0.60,
    direction: -1,
  },

  // Route 3 — Kovalam Basin & IT Express
  {
    id: 'WM-KOV-05',
    name: 'Pandya Express-05',
    routeId: 3,
    speed: 21.0,
    batterySoC: 81,
    solarChargeRate: 7.2,
    currentPassengers: 92,
    maxPassengers: 100,
    captainId: 'CPT-KOV-301',
    currentStationIndex: 0,
    progress: 0.80,
    direction: 1,
  },
  {
    id: 'WM-KOV-06',
    name: 'Marina Shuttle-06',
    routeId: 3,
    speed: 18.4,
    batterySoC: 70,
    solarChargeRate: 6.5,
    currentPassengers: 63,
    maxPassengers: 100,
    captainId: 'CPT-KOV-302',
    currentStationIndex: 3,
    progress: 0.25,
    direction: -1,
  },

  // Route 4 — Buckingham Canal Spine
  {
    id: 'WM-BUC-07',
    name: 'Coromandel-07',
    routeId: 4,
    speed: 11.8,
    batterySoC: 95,
    solarChargeRate: 4.2,
    currentPassengers: 89,
    maxPassengers: 100,
    captainId: 'CPT-BUC-401',
    currentStationIndex: 2,
    progress: 0.50,
    direction: 1,
  },
  {
    id: 'WM-BUC-08',
    name: 'Buckingham Runner-08',
    routeId: 4,
    speed: 13.5,
    batterySoC: 58,
    solarChargeRate: 5.7,
    currentPassengers: 37,
    maxPassengers: 100,
    captainId: 'CPT-BUC-402',
    currentStationIndex: 6,
    progress: 0.40,
    direction: -1,
  },

  // Route 5 — Kosasthalaiyar River Corridor
  {
    id: 'WM-KOS-09',
    name: 'Chola Cruiser-09',
    routeId: 5,
    speed: 22.5,
    batterySoC: 78,
    solarChargeRate: 7.0,
    currentPassengers: 45,
    maxPassengers: 100,
    captainId: 'CPT-KOS-501',
    currentStationIndex: 1,
    progress: 0.90,
    direction: 1,
  },
  {
    id: 'WM-KOS-10',
    name: 'Pulicat Eco-10',
    routeId: 5,
    speed: 14.0,
    batterySoC: 49,
    solarChargeRate: 4.0,
    currentPassengers: 22,
    maxPassengers: 100,
    captainId: 'CPT-KOS-502',
    currentStationIndex: 3,
    progress: 0.15,
    direction: -1,
  },

  // Route 6 — Coastal Heritage Express
  {
    id: 'WM-COA-11',
    name: 'Shoreline Spirit-11',
    routeId: 6,
    speed: 19.0,
    batterySoC: 86,
    solarChargeRate: 6.8,
    currentPassengers: 77,
    maxPassengers: 100,
    captainId: 'CPT-COA-601',
    currentStationIndex: 1,
    progress: 0.42,
    direction: 1,
  },
  {
    id: 'WM-COA-12',
    name: 'Bay Heritage-12',
    routeId: 6,
    speed: 17.2,
    batterySoC: 62,
    solarChargeRate: 5.5,
    currentPassengers: 58,
    maxPassengers: 100,
    captainId: 'CPT-COA-602',
    currentStationIndex: 4,
    progress: 0.70,
    direction: -1,
  },
];
