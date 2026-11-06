import { 
  DollarSign, 
  Users, 
  Calendar, 
  BatteryCharging, 
  Leaf, 
  Ship, 
  Zap
} from 'lucide-react';
import { useGlobal } from '../../store/globalStore';
import KPICard from '../shared/KPICard';

export default function WaterMetroDashboard() {
  const { state } = useGlobal();

  const routeStats = [
    { name: 'Adyar River Corridor', color: '#A855F7', ridership: '34%', vessels: 2 },
    { name: 'Cooum River Corridor', color: '#EF4444', ridership: '22%', vessels: 2 },
    { name: 'Kovalam Basin & IT Express', color: '#EC4899', ridership: '18%', vessels: 2 },
    { name: 'Buckingham Canal Spine', color: '#22C55E', ridership: '14%', vessels: 2 },
    { name: 'Kosasthalaiyar River', color: '#9F1239', ridership: '7%', vessels: 2 },
    { name: 'Coastal Heritage Express', color: '#EAB308', ridership: '5%', vessels: 2 },
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* 5 Core Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Ticket Revenue"
          value={state.totalRevenue}
          prefix="₹"
          icon={DollarSign}
          color="#22C55E"
          trend={14.8}
          format="currency"
        />
        <KPICard
          title="Waterway Passengers"
          value={state.totalPassengers}
          icon={Users}
          color="#3A86FF"
          trend={22.4}
          format="number"
        />
        <KPICard
          title="Days in Operation"
          value={state.daysInOperation}
          suffix=" Days"
          icon={Calendar}
          color="#00D4FF"
          format="number"
        />
        <KPICard
          title="Electric Fleet Health"
          value={98.2}
          suffix="%"
          icon={BatteryCharging}
          color="#00D4FF"
          format="decimal"
        />
        <KPICard
          title="Active Fleet"
          value={12}
          suffix=" Vessels"
          icon={Ship}
          color="#3A86FF"
          format="number"
        />
      </div>

      {/* Grid: Route Allocation Matrix & Multi-Modal Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Route Distribution Matrix */}
        <div className="lg:col-span-2 bg-[#1C2541] border border-[#2A375E] rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2A375E]">
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                <Ship size={16} className="text-[#00D4FF]" />
                <span>Waterway Corridor Utilization & Fleet Dispatch</span>
              </h3>
              <p className="text-xs text-slate-400">Real-time corridor throughput and vessel deployment across 6 lines</p>
            </div>
            <span className="text-[10px] bg-[#0B132B] text-[#00D4FF] border border-[#2A375E] px-2 py-1 rounded font-mono">
              6 Active Corridors
            </span>
          </div>

          <div className="space-y-2">
            {routeStats.map((r) => (
              <div key={r.name} className="bg-[#0B132B] border border-[#2A375E] rounded p-2">
                <div className="flex items-center justify-between mb-1 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                    <span className="text-[#F8FAFC] font-semibold">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{r.vessels} Ferries</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ color: r.color, backgroundColor: '#1C2541' }}
                    >
                      {r.ridership} Load
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[#1C2541] rounded h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{
                      width: r.ridership,
                      backgroundColor: r.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Modal Integration Card */}
        <div className="bg-[#1C2541] border border-[#2A375E] rounded-lg p-4 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#00D4FF] uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={14} />
                CMRL Integrated Sync
              </span>
              <span className="text-[10px] bg-[#0B132B] text-[#22C55E] border border-[#2A375E] px-2 py-0.5 rounded font-mono">
                99.8% Sync Rate
              </span>
            </div>

            <h4 className="text-sm font-bold text-[#F8FAFC] mb-2">
              Multi-Modal Single Token Mobility
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Water Metro fares automatically cross-settle with Chennai Metro Rail Ltd (CMRL) and Metropolitan Transport Corp (MTC) transit accounts.
            </p>

            <div className="space-y-2 text-xs font-mono bg-[#0B132B] p-4 rounded border border-[#2A375E]">
              <div className="flex justify-between text-slate-300">
                <span>Ekkatuthangal Interchange:</span>
                <span className="text-[#22C55E] font-bold">1,420 transfers/day</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Saidapet Feeder Bridge:</span>
                <span className="text-[#22C55E] font-bold">2,180 transfers/day</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Central Rail Canal Hub:</span>
                <span className="text-[#22C55E] font-bold">3,650 transfers/day</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#2A375E] text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Automated Clearing House:</span>
            <span className="text-[#00D4FF] font-bold">Active Every 15m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
