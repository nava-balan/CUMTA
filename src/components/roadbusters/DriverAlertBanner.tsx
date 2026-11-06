import { AlertTriangle, Navigation, X } from 'lucide-react';
import { useGlobal } from '../../store/globalStore';

export default function DriverAlertBanner() {
  const { state, setDriverAlert } = useGlobal();

  if (!state.isDriverAlertActive) return null;

  return (
    <div className="bg-[#FF6B00] text-[#171717] px-4 py-2 border-b border-[#171717] font-mono text-xs flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 font-bold">
        <AlertTriangle size={16} className="text-[#171717] shrink-0" />
        <span className="bg-[#171717] text-[#FFF8ED] px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
          MTC Driver Broadcast
        </span>
        <span className="text-[11px] font-semibold">
          CRITICAL HAZARD ACTIVE: Usman Road / Anna Salai Corridor. Suggested Bus Detour Route active on Google Map.
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1 font-bold text-[#171717] bg-[#FFF8ED] px-2 py-0.5 rounded">
          <Navigation size={12} />
          <span>Detour Active (Green Dashed Route)</span>
        </div>
        <button
          onClick={() => setDriverAlert(false, false)}
          className="text-[#171717] hover:opacity-75 font-bold"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
