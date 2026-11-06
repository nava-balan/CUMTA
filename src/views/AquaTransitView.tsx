import WaterMetroMap from '../components/aquatransit/WaterMetroMap';
import TicketBookingPanel from '../components/aquatransit/TicketBookingPanel';
import TidalAlertBar from '../components/aquatransit/TidalAlertBar';

export default function AquaTransitView() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#042F40] overflow-hidden">
      {/* Real-time Tidal & Bridge Clearance Alert Bar */}
      <TidalAlertBar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar: Ticket Zone & Multi-Modal Journey Planner */}
        <div className="w-full md:w-96 lg:w-[420px] shrink-0 border-r border-[#0A7D8C] overflow-y-auto">
          <TicketBookingPanel />
        </div>

        {/* Center: Interactive Waterway Network Google Map & Live Telemetry */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <WaterMetroMap />
        </div>
      </div>
    </div>
  );
}
