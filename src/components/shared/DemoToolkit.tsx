import { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, AlertCircle, Compass, Ticket, RotateCcw } from 'lucide-react';
import { useGlobal } from '../../store/globalStore';

export default function DemoToolkit() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    triggerDuplicatePotholeDemo,
    triggerMTCDriverDetourDemo,
    triggerWaterLinkTicketDemo,
    setDriverAlert,
    setDedupBanner,
  } = useGlobal();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      {/* Expanded Modal Box */}
      {isOpen && (
        <div className="bg-[#1C2541] border border-[#3A86FF] rounded-lg p-4 mb-2 shadow-card w-80 text-xs text-[#F8FAFC]">
          <div className="flex items-center justify-between pb-2 mb-4 border-b border-[#2A375E]">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#3A86FF]" />
              <span className="font-bold text-sm">Judge Demo Controls</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 mb-4 leading-normal">
            Automated test routines for evaluation. Each routine switches view, updates geospatial coordinates, and invokes municipal logic.
          </p>

          <div className="space-y-2">
            {/* Demo 1: Saidapet Duplicate Pothole */}
            <button
              onClick={() => {
                triggerDuplicatePotholeDemo();
                setIsOpen(false);
              }}
              className="w-full text-left p-2 rounded-lg bg-[#0B132B] hover:bg-[#2A375E] border border-[#2A375E] transition-colors"
            >
              <div className="flex items-center justify-between font-semibold text-[#00D4FF] mb-1">
                <span>1. Test Duplicate Pothole (Saidapet)</span>
                <Compass size={14} />
              </div>
              <p className="text-[10px] text-slate-300">
                Flies to Saidapet [13.0213, 80.2231], triggers 50m spatial de-duplication, escalates to Critical.
              </p>
            </button>

            {/* Demo 2: MTC Driver Detour */}
            <button
              onClick={() => {
                triggerMTCDriverDetourDemo();
                setIsOpen(false);
              }}
              className="w-full text-left p-2 rounded-lg bg-[#0B132B] hover:bg-[#2A375E] border border-[#2A375E] transition-colors"
            >
              <div className="flex items-center justify-between font-semibold text-[#FF6B00] mb-1">
                <span>2. Test MTC Driver Detour (T. Nagar)</span>
                <AlertCircle size={14} />
              </div>
              <p className="text-[10px] text-slate-300">
                Flies to Usman Rd [13.0418, 80.2341], triggers hazard radius, activates MTC driver alert & detour route.
              </p>
            </button>

            {/* Demo 3: WaterLink Ticket & Ledger */}
            <button
              onClick={() => {
                triggerWaterLinkTicketDemo();
                setIsOpen(false);
              }}
              className="w-full text-left p-2 rounded-lg bg-[#0B132B] hover:bg-[#2A375E] border border-[#2A375E] transition-colors"
            >
              <div className="flex items-center justify-between font-semibold text-[#48D6C5] mb-1">
                <span>3. Test WaterLink Ticket & Ledger</span>
                <Ticket size={14} />
              </div>
              <p className="text-[10px] text-slate-300">
                Books Saidapet to Srinivasapuram, displays QR boarding pass, updates revenue & passenger telemetry.
              </p>
            </button>

            {/* Reset Controls */}
            <button
              onClick={() => {
                setDriverAlert(false, false);
                setDedupBanner(null);
                setIsOpen(false);
              }}
              className="w-full mt-2 py-1 text-center text-[10px] font-mono text-slate-400 hover:text-white flex items-center justify-center gap-1"
            >
              <RotateCcw size={12} />
              <span>Reset Demo State Overrides</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Button (Non-negotiable requirement: rounded-full, #3A86FF background, #F8FAFC text, zero emojis) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3A86FF] text-[#F8FAFC] font-semibold text-xs border border-[#2A375E] shadow-card hover:bg-[#2B73EB] transition-colors"
      >
        <Layers size={14} />
        <span>Judge Demo Controls</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
    </div>
  );
}
