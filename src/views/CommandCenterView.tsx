import { useState } from 'react';
import MunicipalOperationsDesk from '../components/admin/MunicipalOperationsDesk';
import LiveBookingsTable from '../components/admin/LiveBookingsTable';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Ship, 
  CheckCircle2, 
  Building2, 
  Ticket,
  LayoutDashboard
} from 'lucide-react';
import { useGlobal } from '../store/globalStore';

export default function CommandCenterView() {
  const { state } = useGlobal();
  const [activeTab, setActiveTab] = useState<'queue' | 'ledger'>('queue');

  const verifiedHazardsCount = state.hazardReports.filter(
    (r) => r.verificationStatus === 'verified'
  ).length;

  return (
    <div className="bg-[#0B132B] text-[#F8FAFC] min-h-[calc(100vh-64px)] p-8 space-y-8 font-sans">
      {/* Header Headline */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1C2541]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard size={20} className="text-[#3A86FF]" />
            <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
              TRANSITPULSE — Unified Command Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Chennai Urban Mobility Authority (CUMTA) Integrated Telemetry & Operations Console
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
          <span className="text-xs font-mono text-[#00D4FF]">CUMTA Central Gateway Live</span>
        </div>
      </div>

      {/* Executive Metrics Row: Solid #1C2541 cards (p-4, rounded-lg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Revenue Generated */}
        <div className="bg-[#1C2541] border border-[#2A375E] rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Total Revenue (₹)</span>
            <DollarSign size={16} className="text-[#3A86FF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F8FAFC]">
            ₹{state.totalRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#00D4FF] font-mono mt-1">
            +₹{(state.tickets.length * 45).toLocaleString()} from WaterLink Passes
          </div>
        </div>

        {/* Metric 2: Total Passengers Travelled */}
        <div className="bg-[#1C2541] border border-[#2A375E] rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Total Passengers</span>
            <Users size={16} className="text-[#00D4FF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F8FAFC]">
            {state.totalPassengers.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Multi-modal transit riders
          </div>
        </div>

        {/* Metric 3: Days in Operation */}
        <div className="bg-[#1C2541] border border-[#2A375E] rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Days in Operation</span>
            <Calendar size={16} className="text-[#3A86FF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F8FAFC]">
            {state.daysInOperation}
          </div>
          <div className="text-[10px] text-[#22C55E] font-mono mt-1">
            99.8% Service Uptime
          </div>
        </div>

        {/* Metric 4: Active Fleet Status */}
        <div className="bg-[#1C2541] border border-[#2A375E] rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Active Fleet Status</span>
            <Ship size={16} className="text-[#00D4FF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#00D4FF]">
            {state.ferries.length} / {state.ferries.length} Ferries
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            100% Electric Propulsion
          </div>
        </div>

        {/* Metric 5: Total Verified Hazards */}
        <div className="bg-[#1C2541] border border-[#2A375E] rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Verified Hazards</span>
            <CheckCircle2 size={16} className="text-[#22C55E]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#22C55E]">
            {verifiedHazardsCount} Verified
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            GCC Field Audited
          </div>
        </div>
      </div>

      {/* Tabs for Operations Desk & Live Ledger */}
      <div className="flex items-center gap-2 border-b border-[#1C2541] pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
            activeTab === 'queue'
              ? 'bg-[#3A86FF] text-[#F8FAFC]'
              : 'bg-[#1C2541] text-slate-400 hover:text-white border border-[#2A375E]'
          }`}
        >
          <Building2 size={14} />
          <span>GCC Municipal Verification Queue ({state.hazardReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
            activeTab === 'ledger'
              ? 'bg-[#3A86FF] text-[#F8FAFC]'
              : 'bg-[#1C2541] text-slate-400 hover:text-white border border-[#2A375E]'
          }`}
        >
          <Ticket size={14} />
          <span>Live Ticket Ledger ({state.tickets.length})</span>
        </button>
      </div>

      {/* Sub-Views */}
      <div>
        {activeTab === 'queue' && <MunicipalOperationsDesk />}
        {activeTab === 'ledger' && <LiveBookingsTable />}
      </div>
    </div>
  );
}
