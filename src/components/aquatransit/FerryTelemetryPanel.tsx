import { Ship } from 'lucide-react';
import { useGlobal } from '../../store/globalStore';
import { ferryFleet, Ferry } from '../../data/ferryFleet';

interface FerryTelemetryPanelProps {
  onSelectFerry?: (ferry: Ferry) => void;
}

export default function FerryTelemetryPanel({ onSelectFerry }: FerryTelemetryPanelProps) {
  const { state } = useGlobal();
  const ferries = state.ferries.length > 0 ? state.ferries : ferryFleet;

  return (
    <div className="bg-[#042F40] border-t border-[#0A7D8C] p-4 text-[#E8FFFA] font-sans text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold font-mono text-xs text-[#E8FFFA] flex items-center gap-1.5">
          <Ship size={14} className="text-[#48D6C5]" />
          Live Battery-Electric Fleet Telemetry (12 Vessels)
        </span>
        <span className="text-[10px] font-mono text-[#48D6C5]">
          Click card to track vessel
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {ferries.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelectFerry?.(f)}
            className="p-4 rounded-lg bg-[#075B66] border border-[#0A7D8C] text-left hover:border-[#48D6C5] transition-colors shadow-card flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono font-bold text-xs text-[#E8FFFA]">{f.id}</span>
              <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-[#042F40] text-[#48D6C5]">
                {f.speed} kts
              </span>
            </div>
            <div className="text-[11px] text-slate-200 truncate mb-2">{f.name}</div>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-300 pt-1 border-t border-[#0A7D8C]">
              <div>
                <span className="block text-[9px] text-[#48D6C5]">SoC</span>
                <span>{f.batterySoC}%</span>
              </div>
              <div>
                <span className="block text-[9px] text-[#48D6C5]">Solar</span>
                <span>{f.solarChargeRate}k</span>
              </div>
              <div>
                <span className="block text-[9px] text-[#48D6C5]">Pax</span>
                <span>{f.currentPassengers}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
