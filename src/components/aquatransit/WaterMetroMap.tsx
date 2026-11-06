import { Fragment, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { waterMetroRoutes, WaterMetroStation } from '../../data/waterMetroRoutes';
import { ferryFleet, Ferry } from '../../data/ferryFleet';
import { useGlobal } from '../../store/globalStore';
import { Ship } from 'lucide-react';

type MapTileMode = 'dark' | 'street' | 'satellite';

// Controller component to handle map flying & invalidation
function MapCameraController({
  target,
  tileMode,
}: {
  target: { lat: number; lng: number; zoom: number; timestamp: number } | null;
  tileMode: MapTileMode;
}) {
  const map = useMap();

  // Apply CSS filter directly to tile pane depending on mode
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

  // Handle mapTarget updates
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

export default function WaterMetroMap() {
  const { state, setMapTarget } = useGlobal();
  const [tileMode, setTileMode] = useState<MapTileMode>('dark');
  const [activeRouteIds, setActiveRouteIds] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [selectedStation, setSelectedStation] = useState<WaterMetroStation | null>(null);

  // 12 live moving ferries with 100ms coordinate interpolation loop
  const [ferries, setFerries] = useState<Ferry[]>(state.ferries.length > 0 ? state.ferries : ferryFleet);

  useEffect(() => {
    // 100ms smooth coordinate interpolation loop
    const interval = setInterval(() => {
      setFerries((prev) =>
        prev.map((f) => {
          const route = waterMetroRoutes.find((r) => r.id === f.routeId);
          if (!route || route.stations.length < 2) return f;

          // Speed factor: 14 knots -> reasonable step per 100ms
          const stepDelta = (f.speed / 100) * 0.003;
          let newProgress = f.progress + f.direction * stepDelta;
          let newStation = f.currentStationIndex;
          let newDirection = f.direction;

          if (newProgress >= 1) {
            newProgress = 0;
            newStation = newStation + 1;
            if (newStation >= route.stations.length - 1) {
              newStation = route.stations.length - 2;
              newDirection = -1;
              newProgress = 1;
            }
          } else if (newProgress <= 0) {
            newProgress = 1;
            newStation = newStation - 1;
            if (newStation < 0) {
              newStation = 0;
              newDirection = 1;
              newProgress = 0;
            }
          }

          return {
            ...f,
            progress: Number(newProgress.toFixed(4)),
            currentStationIndex: newStation,
            direction: newDirection,
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const toggleRoute = (routeId: number) => {
    setActiveRouteIds((prev) =>
      prev.includes(routeId) ? prev.filter((id) => id !== routeId) : [...prev, routeId]
    );
  };

  // Interpolate lat/lng coordinates between current station and next station
  const getFerryCoords = (ferry: Ferry): [number, number] => {
    const route = waterMetroRoutes.find((r) => r.id === ferry.routeId);
    if (!route || route.stations.length < 2) return [13.0418, 80.2341];

    const idx = Math.min(Math.max(0, ferry.currentStationIndex), route.stations.length - 2);
    const start = route.stations[idx].coords;
    const end = route.stations[idx + 1].coords;

    const lat = start[0] + (end[0] - start[0]) * ferry.progress;
    const lng = start[1] + (end[1] - start[1]) * ferry.progress;
    return [lat, lng];
  };

  // Google Maps tile URL configuration
  const tileUrl =
    tileMode === 'satellite'
      ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
      : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

  return (
    <div className="relative w-full h-full min-h-[560px] flex flex-col bg-[#042F40]">
      {/* 3-Mode Map Layer Switcher (Top-Right Corner - Text-Only Pill Buttons, No Emojis) */}
      <div className="absolute top-4 right-4 z-[400] flex items-center p-1 gap-1 rounded-lg bg-[#075B66] border border-[#0A7D8C] shadow-card font-mono text-xs">
        <button
          onClick={() => setTileMode('dark')}
          className={`px-2 py-1 rounded font-semibold transition-colors ${
            tileMode === 'dark'
              ? 'bg-[#00A6A6] text-[#042F40]'
              : 'bg-transparent text-[#E8FFFA] hover:bg-[#042F40]'
          }`}
        >
          Dark Map
        </button>
        <button
          onClick={() => setTileMode('street')}
          className={`px-2 py-1 rounded font-semibold transition-colors ${
            tileMode === 'street'
              ? 'bg-[#00A6A6] text-[#042F40]'
              : 'bg-transparent text-[#E8FFFA] hover:bg-[#042F40]'
          }`}
        >
          Street Map
        </button>
        <button
          onClick={() => setTileMode('satellite')}
          className={`px-2 py-1 rounded font-semibold transition-colors ${
            tileMode === 'satellite'
              ? 'bg-[#00A6A6] text-[#042F40]'
              : 'bg-transparent text-[#E8FFFA] hover:bg-[#042F40]'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Corridor Legend Toggles (Top-Left Corner) */}
      <div className="absolute top-4 left-4 z-[400] p-2 rounded-lg bg-[#075B66] border border-[#0A7D8C] shadow-card text-[11px] font-mono text-[#E8FFFA] max-w-xs">
        <div className="font-bold text-xs mb-2 pb-1 border-b border-[#0A7D8C] flex items-center justify-between">
          <span>Water Metro Corridors (6)</span>
          <span className="text-[10px] text-[#48D6C5]">Google Maps Engine</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {waterMetroRoutes.map((r) => {
            const isActive = activeRouteIds.includes(r.id);
            return (
              <button
                key={r.id}
                onClick={() => toggleRoute(r.id)}
                className={`flex items-center gap-1.5 p-1 rounded text-left transition-colors ${
                  isActive ? 'bg-[#042F40]' : 'opacity-40 hover:opacity-80'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: r.color }}
                />
                <span className="truncate">{r.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Leaflet Google Map Container */}
      <div className="flex-1 w-full h-full min-h-[460px] relative">
        <MapContainer
          center={[13.0418, 80.2341]}
          zoom={11}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
          attributionControl={false}
        >
          <MapCameraController target={state.mapTarget} tileMode={tileMode} />

          {/* Google Maps Tile Layer (Zero API Key Required) */}
          <TileLayer
            url={tileUrl}
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            maxZoom={20}
          />

          {/* Render 6 Waterway Network Corridors */}
          {waterMetroRoutes.map((route) => {
            if (!activeRouteIds.includes(route.id)) return null;

            const polylineCoords = route.stations.map((s) => s.coords);

            return (
              <Fragment key={`route-layer-${route.id}`}>
                {/* Route Polyline */}
                <Polyline
                  positions={polylineCoords}
                  pathOptions={{
                    color: route.color,
                    weight: 4,
                    opacity: 0.9,
                    lineJoin: 'round',
                  }}
                />

                {/* Stations */}
                {route.stations.map((st) => {
                  return (
                    <CircleMarker
                      key={`st-${route.id}-${st.id}`}
                      center={st.coords}
                      radius={st.isInterchange ? 6 : 4}
                      pathOptions={{
                        color: '#FFFFFF',
                        fillColor: route.color,
                        fillOpacity: 1,
                        weight: st.isInterchange ? 2.5 : 1.5,
                      }}
                      eventHandlers={{
                        click: () => setSelectedStation(st),
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                        <div className="text-xs font-sans font-medium text-slate-900">
                          {st.name} {st.isInterchange ? `(${st.interchangeType})` : ''}
                        </div>
                      </Tooltip>
                      <Popup>
                        <div className="text-xs font-mono text-[#F8FAFC]">
                          <div className="font-bold text-sm text-[#00D4FF] mb-1">{st.name}</div>
                          <div className="text-slate-300 mb-1">Corridor: {route.name}</div>
                          {st.isInterchange && (
                            <div className="text-[#48D6C5] font-semibold text-[11px] mb-1">
                              Interchange: {st.interchangeType}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400">
                            Coords: {st.coords[0].toFixed(4)}, {st.coords[1].toFixed(4)}
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </Fragment>
            );
          })}

          {/* Render 12 Live Moving Ferries */}
          {ferries.map((ferry) => {
            const coords = getFerryCoords(ferry);
            const route = waterMetroRoutes.find((r) => r.id === ferry.routeId);

            return (
              <CircleMarker
                key={ferry.id}
                center={coords}
                radius={7}
                pathOptions={{
                  color: '#FFFFFF',
                  fillColor: '#00D4FF',
                  fillOpacity: 1,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-xs font-mono text-[#F8FAFC]">
                    <div className="font-bold text-sm text-[#00D4FF] mb-1">
                      {ferry.name} ({ferry.id})
                    </div>
                    <div className="text-slate-300 mb-1">Route: {route?.name}</div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] pt-1 border-t border-[#2A375E]">
                      <div>Speed: {ferry.speed} kts</div>
                      <div>SoC: {ferry.batterySoC}%</div>
                      <div>Solar: {ferry.solarChargeRate} kW</div>
                      <div>Pax: {ferry.currentPassengers}/{ferry.maxPassengers}</div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Bottom Telemetry Strip (Solid #075B66 cards, p-4, rounded-lg, clickable to flyTo) */}
      <div className="p-4 bg-[#042F40] border-t border-[#0A7D8C]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-[#E8FFFA]">
            <Ship size={14} className="text-[#48D6C5]" />
            <span>Active Battery-Electric Fleet Telemetry (12 Vessels Live)</span>
          </div>
          <span className="text-[10px] font-mono text-[#48D6C5]">
            Click any card to track vessel
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 overflow-x-auto pb-1">
          {ferries.slice(0, 6).map((ferry) => {
            const coords = getFerryCoords(ferry);
            return (
              <button
                key={ferry.id}
                onClick={() => {
                  setMapTarget({ lat: coords[0], lng: coords[1], zoom: 15, timestamp: Date.now() });
                }}
                className="p-4 rounded-lg bg-[#075B66] border border-[#0A7D8C] text-left hover:border-[#48D6C5] transition-colors shadow-card flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold font-mono text-xs text-[#E8FFFA]">
                    {ferry.id}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#042F40] text-[#48D6C5]">
                    {ferry.speed} kts
                  </span>
                </div>
                <div className="text-[11px] text-slate-200 truncate mb-2">
                  {ferry.name}
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-300 pt-2 border-t border-[#0A7D8C]">
                  <div>
                    <span className="block text-[9px] text-[#48D6C5]">SoC</span>
                    <span>{ferry.batterySoC}%</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-[#48D6C5]">Solar</span>
                    <span>{ferry.solarChargeRate}k</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-[#48D6C5]">Pax</span>
                    <span>{ferry.currentPassengers}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
