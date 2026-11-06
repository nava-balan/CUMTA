// Hazard Data — CHENNAI 360 | ROADWATCH
// 10 Civic Hazard Categories, GCC Municipal Zones, and Reports

export type HazardCategory =
  | 'potholes'
  | 'broken-road-surfaces'
  | 'waterlogging'
  | 'damaged-manholes'
  | 'damaged-traffic-signals'
  | 'illegal-parking'
  | 'road-obstruction'
  | 'damaged-pedestrian-footpaths'
  | 'missing-road-signs'
  | 'street-light-failures';

export type HazardSeverity = 'low' | 'medium' | 'high' | 'critical';

export type VerificationStatus =
  | 'pending-ai'
  | 'ai-verified'
  | 'pending-municipal'
  | 'verified'
  | 'rejected';

export interface HazardReport {
  id: string;
  category: HazardCategory;
  severity: HazardSeverity;
  lat: number;
  lng: number;
  description: string;
  imageUrl: string;
  reporterName: string;
  reportedAt: string; // ISO 8601
  gccZone: string;
  upvotes: number;
  duplicateCount: number;
  aiConfidence: number; // 0-100%
  verificationStatus: VerificationStatus;
  assignedWard: string;
  estimatedFixHours: number;
  rewardPoints: number;
}

export interface GCCZone {
  id: number;
  name: string;
  center: [number, number];
}

export interface HazardCategoryInfo {
  label: string;
  value: HazardCategory;
  iconName: string;
}

export const GCC_ZONES: GCCZone[] = [
  { id: 1, name: 'Zone 1 - Tiruvottiyur', center: [13.1600, 80.3000] },
  { id: 2, name: 'Zone 2 - Manali', center: [13.1667, 80.2667] },
  { id: 3, name: 'Zone 3 - Madhavaram', center: [13.1500, 80.2333] },
  { id: 4, name: 'Zone 4 - Tondiarpet', center: [13.1250, 80.2850] },
  { id: 5, name: 'Zone 5 - Royapuram', center: [13.1100, 80.2950] },
  { id: 6, name: 'Zone 6 - Thiru Vi Ka Nagar', center: [13.1150, 80.2450] },
  { id: 7, name: 'Zone 7 - Ambattur', center: [13.1143, 80.1548] },
  { id: 8, name: 'Zone 8 - Anna Nagar', center: [13.0850, 80.2100] },
  { id: 9, name: 'Zone 9 - Teynampet', center: [13.0400, 80.2500] },
  { id: 10, name: 'Zone 10 - Kodambakkam', center: [13.0520, 80.2240] },
  { id: 11, name: 'Zone 11 - Valasaravakkam', center: [13.0500, 80.1700] },
  { id: 12, name: 'Zone 12 - Alandur', center: [13.0020, 80.2060] },
  { id: 13, name: 'Zone 13 - Adyar', center: [13.0060, 80.2570] },
  { id: 14, name: 'Zone 14 - Perungudi', center: [12.9650, 80.2400] },
  { id: 15, name: 'Zone 15 - Sholinganallur', center: [12.9010, 80.2270] },
];

export const HAZARD_CATEGORIES: HazardCategoryInfo[] = [
  { label: 'Potholes', value: 'potholes', iconName: 'CircleDot' },
  { label: 'Broken Road Surfaces', value: 'broken-road-surfaces', iconName: 'AlertTriangle' },
  { label: 'Waterlogging', value: 'waterlogging', iconName: 'Droplets' },
  { label: 'Damaged Manholes', value: 'damaged-manholes', iconName: 'CircleDotDashed' },
  { label: 'Damaged Traffic Signals', value: 'damaged-traffic-signals', iconName: 'TrafficCone' },
  { label: 'Illegal Parking', value: 'illegal-parking', iconName: 'Car' },
  { label: 'Road Obstruction', value: 'road-obstruction', iconName: 'Ban' },
  { label: 'Damaged Pedestrian Footpaths', value: 'damaged-pedestrian-footpaths', iconName: 'Footprints' },
  { label: 'Missing Road Signs', value: 'missing-road-signs', iconName: 'Signpost' },
  { label: 'Street Light Failures', value: 'street-light-failures', iconName: 'Lightbulb' },
];

export const mockHazardReports: HazardReport[] = [
  {
    id: 'HZR-701',
    category: 'potholes',
    severity: 'medium',
    lat: 13.0213,
    lng: 80.2231,
    description: 'Recurrent pothole on Saidapet bridge approach ramp. Vehicles swerving sharply into oncoming lane.',
    imageUrl: '',
    reporterName: 'Suresh Kumar',
    reportedAt: '2026-11-05T08:30:00.000Z',
    gccZone: 'Zone 9 - Teynampet',
    upvotes: 42,
    duplicateCount: 2,
    aiConfidence: 96,
    verificationStatus: 'ai-verified',
    assignedWard: 'Ward 141',
    estimatedFixHours: 12,
    rewardPoints: 20,
  },
  {
    id: 'HZR-702',
    category: 'waterlogging',
    severity: 'critical',
    lat: 13.0418,
    lng: 80.2341,
    description: 'Severe monsoon inundation at Usman Road subway. Water level 2.5ft, traffic stranded. MTC buses requiring diversion.',
    imageUrl: '',
    reporterName: 'Karthik Raja',
    reportedAt: '2026-11-05T07:15:00.000Z',
    gccZone: 'Zone 10 - Kodambakkam',
    upvotes: 89,
    duplicateCount: 8,
    aiConfidence: 98,
    verificationStatus: 'verified',
    assignedWard: 'Ward 114',
    estimatedFixHours: 4,
    rewardPoints: 50,
  },
  {
    id: 'HZR-703',
    category: 'damaged-manholes',
    severity: 'critical',
    lat: 13.0827,
    lng: 80.2755,
    description: 'Displaced iron manhole cover near Chennai Central station exit. High hazard for two-wheelers at night.',
    imageUrl: '',
    reporterName: 'Priya Mohan',
    reportedAt: '2026-11-04T21:40:00.000Z',
    gccZone: 'Zone 5 - Royapuram',
    upvotes: 114,
    duplicateCount: 14,
    aiConfidence: 99,
    verificationStatus: 'pending-municipal',
    assignedWard: 'Ward 68',
    estimatedFixHours: 6,
    rewardPoints: 50,
  },
  {
    id: 'HZR-704',
    category: 'damaged-traffic-signals',
    severity: 'high',
    lat: 13.0336,
    lng: 80.2685,
    description: 'Traffic signal head broken and flickering at Mylapore Luz Corner. Police manually managing traffic.',
    imageUrl: '',
    reporterName: 'Deepa V',
    reportedAt: '2026-11-05T09:00:00.000Z',
    gccZone: 'Zone 13 - Adyar',
    upvotes: 38,
    duplicateCount: 3,
    aiConfidence: 92,
    verificationStatus: 'pending-municipal',
    assignedWard: 'Ward 148',
    estimatedFixHours: 8,
    rewardPoints: 35,
  },
  {
    id: 'HZR-705',
    category: 'broken-road-surfaces',
    severity: 'medium',
    lat: 12.9865,
    lng: 80.2605,
    description: 'Asphalt surface sheared off on Thiruvanmiyur ECR link road for 150m. Gravel loose.',
    imageUrl: '',
    reporterName: 'Arun Balan',
    reportedAt: '2026-11-04T15:20:00.000Z',
    gccZone: 'Zone 14 - Perungudi',
    upvotes: 27,
    duplicateCount: 1,
    aiConfidence: 89,
    verificationStatus: 'ai-verified',
    assignedWard: 'Ward 173',
    estimatedFixHours: 24,
    rewardPoints: 20,
  },
  {
    id: 'HZR-706',
    category: 'damaged-pedestrian-footpaths',
    severity: 'low',
    lat: 13.0063,
    lng: 80.2574,
    description: 'Dislodged granite walkway slabs outside Adyar Depot. Tripping hazard for pedestrians.',
    imageUrl: '',
    reporterName: 'Venkatesh S',
    reportedAt: '2026-11-05T10:10:00.000Z',
    gccZone: 'Zone 13 - Adyar',
    upvotes: 19,
    duplicateCount: 0,
    aiConfidence: 85,
    verificationStatus: 'pending-ai',
    assignedWard: 'Ward 171',
    estimatedFixHours: 48,
    rewardPoints: 10,
  },
];

export const getHazardCategoryLabel = (category: HazardCategory): string =>
  HAZARD_CATEGORIES.find((c) => c.value === category)?.label ?? category;
