// Water Metro Routes — CHENNAI 360 | WATERLINK
// 6 Official Corridors across Chennai waterways

export interface WaterMetroStation {
  id: string;
  name: string;
  coords: [number, number]; // [lat, lng]
  isInterchange: boolean;
  interchangeType?: string;
}

export interface WaterMetroRoute {
  id: number;
  name: string;
  lineLabel: string;
  color: string;
  colorName: string;
  stations: WaterMetroStation[];
}

export const waterMetroRoutes: WaterMetroRoute[] = [
  {
    id: 1,
    name: 'Adyar River Corridor',
    lineLabel: 'Purple Line',
    color: '#A855F7',
    colorName: 'Purple',
    stations: [
      { id: 'R1-S1', name: 'Thiruneermalai', coords: [12.9698, 80.1147], isInterchange: false },
      { id: 'R1-S2', name: 'Manapakkam', coords: [13.0183, 80.1744], isInterchange: false },
      { id: 'R1-S3', name: 'Ekkatuthangal', coords: [13.0225, 80.2055], isInterchange: true, interchangeType: 'CMRL Interchange' },
      { id: 'R1-S4', name: 'Saidapet', coords: [13.0213, 80.2231], isInterchange: true, interchangeType: 'CMRL Interchange' },
      { id: 'R1-S5', name: 'Kotturpuram', coords: [13.0189, 80.2411], isInterchange: false },
      { id: 'R1-S6', name: 'Adyar Eco-Park', coords: [13.0136, 80.2588], isInterchange: false },
      { id: 'R1-S7', name: 'Srinivasapuram / Boat Club', coords: [13.0145, 80.2735], isInterchange: false },
    ],
  },
  {
    id: 2,
    name: 'Cooum River Corridor',
    lineLabel: 'Red Line',
    color: '#EF4444',
    colorName: 'Red',
    stations: [
      { id: 'R2-S1', name: 'Maduravoyal', coords: [13.0658, 80.1656], isInterchange: false },
      { id: 'R2-S2', name: 'Koyambedu', coords: [13.0732, 80.1912], isInterchange: true, interchangeType: 'CMRL Interchange' },
      { id: 'R2-S3', name: 'Anna Nagar East', coords: [13.0850, 80.2185], isInterchange: false },
      { id: 'R2-S4', name: 'Chetpet Eco-Park', coords: [13.0734, 80.2415], isInterchange: false },
      { id: 'R2-S5', name: 'Egmore', coords: [13.0782, 80.2618], isInterchange: false },
      { id: 'R2-S6', name: 'Chintadripet', coords: [13.0744, 80.2711], isInterchange: false },
      { id: 'R2-S7', name: 'Napier Bridge / Marina', coords: [13.0695, 80.2892], isInterchange: false },
    ],
  },
  {
    id: 3,
    name: 'Kovalam Basin & IT Express',
    lineLabel: 'Pink Line',
    color: '#EC4899',
    colorName: 'Pink',
    stations: [
      { id: 'R3-S1', name: 'Okkiyam Thoraipakkam', coords: [12.9365, 80.2372], isInterchange: false },
      { id: 'R3-S2', name: 'Sholinganallur', coords: [12.9010, 80.2379], isInterchange: false },
      { id: 'R3-S3', name: 'Siruseri IT Park Canal Terminal', coords: [12.8350, 80.2295], isInterchange: false },
      { id: 'R3-S4', name: 'Kelambakkam Creek', coords: [12.7932, 80.2288], isInterchange: false },
      { id: 'R3-S5', name: 'Kovalam Basin Hub', coords: [12.7895, 80.2512], isInterchange: false },
    ],
  },
  {
    id: 4,
    name: 'Buckingham Canal Spine',
    lineLabel: 'Green Line',
    color: '#22C55E',
    colorName: 'Green',
    stations: [
      { id: 'R4-S1', name: 'Ennore Creek', coords: [13.2185, 80.3201], isInterchange: false },
      { id: 'R4-S2', name: 'Tondiarpet', coords: [13.1288, 80.2895], isInterchange: false },
      { id: 'R4-S3', name: 'Basin Bridge', coords: [13.1022, 80.2735], isInterchange: false },
      { id: 'R4-S4', name: 'Chennai Central', coords: [13.0827, 80.2755], isInterchange: true, interchangeType: 'Central Hub' },
      { id: 'R4-S5', name: 'Chepauk', coords: [13.0630, 80.2812], isInterchange: false },
      { id: 'R4-S6', name: 'Mylapore / Luz', coords: [13.0336, 80.2685], isInterchange: false },
      { id: 'R4-S7', name: 'Thiruvanmiyur', coords: [12.9865, 80.2605], isInterchange: false },
      { id: 'R4-S8', name: 'Neelankarai', coords: [12.9492, 80.2555], isInterchange: false },
    ],
  },
  {
    id: 5,
    name: 'Kosasthalaiyar River Corridor',
    lineLabel: 'Burgundy Line',
    color: '#9F1239',
    colorName: 'Burgundy',
    stations: [
      { id: 'R5-S1', name: 'Poondi Reservoir Hub', coords: [13.1950, 79.8820], isInterchange: false },
      { id: 'R5-S2', name: 'Thamaraipakkam', coords: [13.1890, 80.0350], isInterchange: false },
      { id: 'R5-S3', name: 'Vallur', coords: [13.2085, 80.2650], isInterchange: false },
      { id: 'R5-S4', name: 'Manali New Town', coords: [13.1955, 80.2790], isInterchange: false },
      { id: 'R5-S5', name: 'Ennore Port Terminal', coords: [13.2280, 80.3280], isInterchange: false },
    ],
  },
  {
    id: 6,
    name: 'Coastal Heritage Express',
    lineLabel: 'Yellow Line',
    color: '#EAB308',
    colorName: 'Yellow',
    stations: [
      { id: 'R6-S1', name: 'Marina Lighthouse', coords: [13.0398, 80.2794], isInterchange: false },
      { id: 'R6-S2', name: 'Besant Nagar', coords: [12.9988, 80.2735], isInterchange: false },
      { id: 'R6-S3', name: 'Injambakkam', coords: [12.9125, 80.2545], isInterchange: false },
      { id: 'R6-S4', name: 'Muttukadu Boat House', coords: [12.8055, 80.2442], isInterchange: false },
      { id: 'R6-S5', name: 'Kovalam Beach', coords: [12.7895, 80.2545], isInterchange: false },
      { id: 'R6-S6', name: 'Mahabalipuram Terminal', coords: [12.6162, 80.1992], isInterchange: false },
    ],
  },
];

export const getAllStations = (): WaterMetroStation[] =>
  waterMetroRoutes.flatMap((route) => route.stations);

export const getRouteById = (id: number): WaterMetroRoute | undefined =>
  waterMetroRoutes.find((route) => route.id === id);

export const getStationById = (stationId: string): WaterMetroStation | undefined =>
  getAllStations().find((station) => station.id === stationId);
