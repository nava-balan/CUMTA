import { useState } from 'react';
import { Ship, BatteryCharging, Sun, Users, Gauge, Zap } from 'lucide-react';
import { useGlobal } from '../../store/globalStore';
import { ferryFleet, Ferry } from '../../data/ferryFleet';
import { waterMetroRoutes } from '../../data/waterMetroRoutes';

export default function FleetManagementGrid() {
  const { state, addToast } = useGlobal();
  const [fleet, setFleet] = useState<Ferry[]>(state.ferries.length > 0 ? state.ferries : ferryFleet);

  const handleChargeBoost = (ferry: Ferry) => {
    setFleet((prev) =>
      prev.map((f) => (f.id === ferry.id ? { ...f, batterySoC: Math.min(100, f.batterySoC + 15) } : f))
    );

    addToast({
      type: 'success',
      title: 'Pantograph Fast-Charge Connected',
      message: `${ferry.name} connected to terminal fast-charge pantograph. Battery SoC boosted to ${Math.min(
        100,
        ferry.batterySoC + 15
      )}%.`,
    });
  };

  const getRoute = (routeId: number) => {
    return waterMetroRoutes.find((r) => r.id === routeId);
  };

  return (
    <div className="bg-[#1C2541] border border-[#2A375E] rounded-lg p-4 text-[#F8FAFC] shadow-card font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-[#2A375E]">
        <div>
          <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
            <Ship size={16} className="text-[#00D4FF]" />
            <span>Battery-Electric Vessel Fleet Console (12 Vessels)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time pantograph charging, propulsion telemetry, and master captain rosters across 6 corridors
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[10px] bg-[#0B132B] text-[#22C55E] border border-[#2A375E] px-2 py-1 rounded">
            12 of 12 Vessels In Active Service
          </span>
        </div>
      </div>

      {/* Grid of 12 Ferries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {fleet.map((ferry) => {
          const route = getRoute(ferry.routeId);

          return (
            <div
              key={ferry.id}
              className="bg-[#0B132B] border border-[#2A375E] rounded-lg p-4 flex flex-col justify-between shadow-card"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-[#00D4FF]">{ferry.id}</span>
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold"
                    style={{ color: route?.color, backgroundColor: '#1C2541' }}
                  >
                    R{ferry.routeId}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-[#F8FAFC] mb-1">{ferry.name}</h4>
                <p className="text-[11px] text-slate-400 mb-3 truncate">{route?.name}</p>

                {/* Telemetry data */}
                <div className="space-y-1.5 text-xs font-mono mb-4 bg-[#1C2541] p-2 rounded border border-[#2A375E]">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Gauge size={12} className="text-[#00D4FF]" /> Speed:
                    </span>
                    <span className="font-bold text-[#F8FAFC]">{ferry.speed} Knots</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1 text-[11px]">
                      <BatteryCharging size={12} className="text-[#22C55E]" /> Battery SoC:
                    </span>
                    <span
                      className={`font-bold ${
                        ferry.batterySoC < 50 ? 'text-[#FFC145]' : 'text-[#22C55E]'
                      }`}
                    >
                      {ferry.batterySoC}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Sun size={12} className="text-[#FFC145]" /> Solar Feed:
                    </span>
                    <span className="text-[#F8FAFC]">{ferry.solarChargeRate} kW</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Users size={12} className="text-[#3A86FF]" /> Occupancy:
                    </span>
                    <span className="text-[#F8FAFC]">
                      {ferry.currentPassengers}/{ferry.maxPassengers}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary button style */}
              <button
                onClick={() => handleChargeBoost(ferry)}
                className="w-full py-1.5 px-2 rounded bg-[#1C2541] border border-[#3A86FF] text-[#00D4FF] hover:bg-[#3A86FF] hover:text-[#FFFFFF] text-[10px] font-mono font-bold transition-colors flex items-center justify-center gap-1"
              >
                <Zap size={12} />
                <span>Pantograph Boost (+15%)</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
