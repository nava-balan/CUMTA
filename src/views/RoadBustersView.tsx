import { useState } from 'react';
import HazardReportForm from '../components/roadbusters/HazardReportForm';
import HazardMap from '../components/roadbusters/HazardMap';
import DriverAlertBanner from '../components/roadbusters/DriverAlertBanner';

export default function RoadBustersView() {
  const [coords, setCoords] = useState<[number, number]>([13.0213, 80.2231]); // Saidapet default

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#171717] overflow-hidden">
      {/* Automated Public Transport Driver Broadcast Bar (Solid #FF6B00) */}
      <DriverAlertBanner />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar: 10-Category Civic Hazard Reporting Studio */}
        <div className="w-full md:w-96 lg:w-[420px] shrink-0 border-r border-[#303030] overflow-y-auto bg-[#171717]">
          <HazardReportForm
            currentCoords={coords}
            onCoordsChange={(lat, lng) => setCoords([lat, lng])}
          />
        </div>

        {/* Right Side: Google Maps Leaflet Engine with Detour Polyline & Danger Radius */}
        <div className="flex-1 relative overflow-hidden">
          <HazardMap
            selectedCoords={coords}
            onSelectCoords={(lat, lng) => setCoords([lat, lng])}
          />
        </div>
      </div>
    </div>
  );
}
