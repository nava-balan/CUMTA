import { Waves, ShieldCheck, AlertCircle, Compass } from 'lucide-react';
import { bridgeClearances } from '../../data/tidalData';

export default function TidalAlertBar() {
  const keyBridges = bridgeClearances.filter((b) =>
    ['Napier Bridge', 'MRTS Bridge Adyar', 'Ennore Creek Bridge'].includes(b.bridgeName)
  );

  return (
    <div className="bg-[#075B66] border-b border-[#0A7D8C] px-4 py-2 text-[#E8FFFA] text-xs font-mono flex flex-wrap items-center justify-between gap-4">
      {/* Tide Telemetry */}
      <div className="flex items-center gap-2">
        <Waves size={14} className="text-[#48D6C5]" />
        <span className="font-bold">Bay of Bengal Tidal Level:</span>
        <span className="px-1.5 py-0.5 rounded bg-[#042F40] text-[#48D6C5] font-bold">
          +1.14m MSL (Safe)
        </span>
        <span className="hidden sm:inline text-slate-300 text-[11px]">
          Flood Gates: Operational
        </span>
      </div>

      {/* 3 Bridge Clearances */}
      <div className="flex items-center gap-4 flex-wrap text-[11px]">
        {keyBridges.map((bridge) => {
          const isSafe = bridge.currentClearance >= 3.5;
          return (
            <div key={bridge.bridgeName} className="flex items-center gap-1.5">
              <span className="text-slate-300">{bridge.bridgeName}:</span>
              <span
                className={`px-1 rounded font-bold ${
                  isSafe
                    ? 'bg-[#042F40] text-[#48D6C5]'
                    : 'bg-[#FF6B00] text-[#171717]'
                }`}
              >
                {bridge.currentClearance}m
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
