import fs from 'fs';
import path from 'path';
import os from 'os';

export interface BookedTicket {
  id: string;
  routeId: number;
  routeName: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  passengerName: string;
  passengerCount: number;
  vesselClass: 'Eco-Catamaran' | 'Business Hydrofoil';
  baseFare: number;
  pointsDiscount: number;
  fare: number;
  bookedAt: string;
  qrCode: string;
  status: 'confirmed' | 'boarded' | 'completed';
}

export interface HazardReport {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lat: number;
  lng: number;
  description: string;
  imageUrl: string;
  reporterName: string;
  reportedAt: string;
  gccZone: string;
  upvotes: number;
  duplicateCount: number;
  aiConfidence: number;
  verificationStatus: 'pending-ai' | 'ai-verified' | 'pending-municipal' | 'verified' | 'rejected';
  assignedWard: string;
  estimatedFixHours: number;
  rewardPoints: number;
}

export interface Ferry {
  id: string;
  name: string;
  routeId: number;
  speed: number;
  batterySoC: number;
  solarChargeRate: number;
  currentPassengers: number;
  maxPassengers: number;
  captainId: string;
  currentStationIndex: number;
  progress: number;
  direction: 1 | -1;
}

export interface CumtaDatabase {
  civicPoints: number;
  totalRevenue: number;
  totalPassengers: number;
  daysInOperation: number;
  tickets: BookedTicket[];
  hazardReports: HazardReport[];
  ferries: Ferry[];
}

const TMP_DB_PATH = path.join(os.tmpdir(), 'cumta_db.json');
const SOURCE_DB_PATH = path.join(process.cwd(), 'api', 'data', 'db.json');

export function readDb(): CumtaDatabase {
  try {
    if (fs.existsSync(TMP_DB_PATH)) {
      const raw = fs.readFileSync(TMP_DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[DB] Failed to read from /tmp cache, falling back to source', err);
  }

  // Load from source json
  try {
    if (fs.existsSync(SOURCE_DB_PATH)) {
      const raw = fs.readFileSync(SOURCE_DB_PATH, 'utf-8');
      const data = JSON.parse(raw);
      // Initialize tmp copy
      try {
        fs.writeFileSync(TMP_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
      } catch (writeErr) {
        // continue
      }
      return data;
    }
  } catch (err) {
    console.error('[DB] Failed to read source db.json', err);
  }

  // Fallback empty structure
  return {
    civicPoints: 350,
    totalRevenue: 2847500,
    totalPassengers: 18420,
    daysInOperation: 47,
    tickets: [],
    hazardReports: [],
    ferries: [],
  };
}

export function writeDb(data: CumtaDatabase): void {
  const jsonStr = JSON.stringify(data, null, 2);
  try {
    fs.writeFileSync(TMP_DB_PATH, jsonStr, 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to write to TMP_DB_PATH', err);
  }
}

export function getHaversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
