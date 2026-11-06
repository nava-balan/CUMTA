import { Fragment, useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Polyline, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { useGlobal } from '../../store/globalStore';
import { HazardSeverity, getHazardCategoryLabel } from '../../data/hazardData';

type MapTileMode = 'dark' | 'street' | 'satellite';

// Controller component to handle tile filter, camera flying, and invalidation
function MapCameraController({
  target,
  tileMode,
}: {
  target: { lat: number; lng: number; zoom: number; timestamp: number } | null;
  tileMode: MapTileMode;
}) {
  const map = useMap();

  useEffect(() => {
    const pane = map.getPane('tilePane');
    if (pane) {
      if (tileMode === 'dark') {
        pane.className = 'leaflet-pane leaflet-tile-pane tile-filter-dark';
      } else {
        pane.className = 'leaflet-pane leaflet-tile-pane tile-filter-none';
      }
    }
  }, [tileMode, map]);

  useEffect(() => {
    if (!target) return;
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 });
    }, 150);

    return () => clearTimeout(timer);
  }, [target, map]);

  return null;
}

// Click listener to let commuter click on map to lock coordinates
function MapClickListener({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function HazardMap({
  selectedCoords,
  onSelectCoords,
}: {
  selectedCoords?: [number, number];
  onSelectCoords?: (lat: number, lng: number) => void;
}) {
  const { state, setMapTarget } = useGlobal();
  const [tileMode, setTileMode] = useState<MapTileMode>('dark');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Suggested MTC Bus Detour Route (dashed #48D6C5 polyline around Saidapet / Usman Road)
  const busDetourCoords: [number, number][] = [
    [13.0470, 80.2280],
    [13.0440, 80.2310],
    [13.0380, 80.2360],
    [13.0310, 80.2340],
    [13.0250, 80.2280],
    [13.0210, 80.2210],
  ];

  const getSeverityColor = (severity: HazardSeverity): string => {
    switch (severity) {
      case 'critical':
        return '#EF4444';
      case 'high':
        return '#FF6B00';
      case 'medium':
        return '#FFC145';
      case 'low':
      default:
        return '#22C55E';
    }
  };

  const filteredReports = state.hazardReports.filter((r) => {
    if (filterSeverity === 'all') return true;
    return r.severity === filterSeverity;
  });

  const tileUrl =
    tileMode === 'satellite'
      ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
      : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

  return (
    <div className="relative w-full h-full min-h-[560px] flex flex-col bg-[#171717]">
      {/* 3-Mode Map Layer Switcher (Top-Right Corner - Text-Only Pill Buttons, No Emojis) */}
      <div className="absolute top-4 right-4 z-[400] flex items-center p-1 gap-1 rounded-lg bg-[#303030] border border-[#444444] shadow-card font-mono text-xs">
        <button
          onClick={() => setTileMode('dark')}
          className={`px-2 py-1 rounded font-semibold transition-colors ${
            tileMode === 'dark'
              ? 'bg-[#FF6B00] text-[#171717]'
              : 'bg-transparent text-[#FFF8ED] hover:bg-[#171717]'
          }`}
        >
          Dark Map
        </button>
        <button
          onClick={() => setTileMode('street')}
          className={`px-2 py-1 rounded font-semibold transition-colors ${
            tileMode === 'street'
              ? 'bg-[#FF6B00] text-[#171717]'
              : 'bg-transparent text-[#FFF8ED] hover:bg-[#171717]'
          }`}
        >
          Street Map
        </button>
        <button
          onClick={() => setTileMode('satellite')}
          className={`px-2 py-1 rounded font-semibold transition-colors ${
            tileMode === 'satellite'
              ? 'bg-[#FF6B00] text-[#171717]'
              : 'bg-transparent text-[#FFF8ED] hover:bg-[#171717]'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Filter Severity Bar (Top-Left Corner) */}
      <div className="absolute top-4 left-4 z-[400] p-2 rounded-lg bg-[#303030] border border-[#444444] shadow-card text-[11px] font-mono text-[#FFF8ED]">
        <div className="font-bold text-xs mb-1 text-[#FFC145]">Severity Filter:</div>
        <div className="flex gap-1">
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-0.5 rounded font-mono uppercase text-[10px] transition-colors ${
                filterSeverity === sev
                  ? 'bg-[#FF6B00] text-[#171717] font-bold'
                  : 'bg-[#171717] text-slate-300 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Leaflet Google Map Container */}
      <div className="flex-1 w-full h-full min-h-[460px] relative">
        <MapContainer
          center={[13.0418, 80.2341]}
          zoom={12}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
          attributionControl={false}
        >
          <MapCameraController target={state.mapTarget} tileMode={tileMode} />
          {onSelectCoords && <MapClickListener onMapClick={onSelectCoords} />}

          {/* Google Maps Tile Layer */}
          <TileLayer
            url={tileUrl}
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            maxZoom={20}
          />

          {/* Suggested MTC Bus Detour Route (Dashed #48D6C5 polyline) */}
          {(state.activeDetourVisible || state.isDriverAlertActive) && (
            <Polyline
              positions={busDetourCoords}
              pathOptions={{
                color: '#48D6C5',
                weight: 4,
                dashArray: '8, 8',
                opacity: 0.95,
              }}
            />
          )}

          {/* User Pin / Selected Coordinate Pin */}
          {selectedCoords && (
            <CircleMarker
              center={selectedCoords}
              radius={8}
              pathOptions={{
                color: '#FFFFFF',
                fillColor: '#FF6B00',
                fillOpacity: 1,
                weight: 2,
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -8]}>
                <span className="font-mono text-[10px] font-bold text-slate-900">
                  Selected Hazard Location
                </span>
              </Tooltip>
            </CircleMarker>
          )}

          {/* Render Hazards */}
          {filteredReports.map((report) => {
            const color = getSeverityColor(report.severity);
            const isCriticalOrHigh = report.severity === 'critical' || report.severity === 'high';

            return (
              <Fragment key={report.id}>
                {/* Danger Radius Circle for Critical / High Hazards */}
                {isCriticalOrHigh && (
                  <Circle
                    center={[report.lat, report.lng]}
                    radius={report.severity === 'critical' ? 250 : 150}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.25,
                      weight: 1.5,
                    }}
                  />
                )}

                {/* Solid Marker Node */}
                <CircleMarker
                  center={[report.lat, report.lng]}
                  radius={report.severity === 'critical' ? 7 : 5}
                  pathOptions={{
                    color: '#FFFFFF',
                    fillColor: color,
                    fillOpacity: 1,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-xs font-mono text-[#F8FAFC]">
                      <div className="font-bold text-sm text-[#FF6B00] mb-1">
                        #{report.id} — {getHazardCategoryLabel(report.category)}
                      </div>
                      <div className="text-slate-300 mb-1">{report.description}</div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 border-t border-[#444444]">
                        <div>Zone: {report.gccZone}</div>
                        <div>Severity: <span className="uppercase font-bold" style={{ color }}>{report.severity}</span></div>
                        <div>Duplicates: {report.duplicateCount}</div>
                        <div>Status: {report.verificationStatus}</div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              </Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Footer Bar */}
      <div className="p-2 bg-[#171717] border-t border-[#303030] text-[11px] font-mono text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[#FFC145] font-bold">CLICK MAP TO LOCK COORDINATES</span>
          <span>Active Hazards: {filteredReports.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Critical
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" /> High
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFC145]" /> Medium
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /> Low
        </div>
      </div>
    </div>
  );
}
