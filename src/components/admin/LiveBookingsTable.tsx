import { Ticket, CheckCircle2 } from 'lucide-react';
import { useGlobal } from '../../store/globalStore';

export default function LiveBookingsTable() {
  const { state } = useGlobal();

  return (
    <div className="bg-[#1C2541] border border-[#2A375E] rounded-lg p-4 text-[#F8FAFC] shadow-card font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-[#2A375E]">
        <div>
          <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
            <Ticket size={16} className="text-[#00D4FF]" />
            <span>WaterLink Real-Time Ticket Ledger & Boarding Stream</span>
          </h3>
          <p className="text-xs text-slate-400">
            Immutable ticketing transactions with civic point discounts and automated CUMTA revenue split.
          </p>
        </div>
        <div className="text-xs font-mono px-2 py-1 rounded bg-[#0B132B] border border-[#2A375E] text-[#00D4FF]">
          Total Ledger Entries: {state.tickets.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[#2A375E] text-slate-400 text-[10px] uppercase">
              <th className="pb-2 font-semibold">Pass ID</th>
              <th className="pb-2 font-semibold">Corridor</th>
              <th className="pb-2 font-semibold">From Terminal</th>
              <th className="pb-2 font-semibold">To Terminal</th>
              <th className="pb-2 font-semibold">Class</th>
              <th className="pb-2 font-semibold">Pax</th>
              <th className="pb-2 font-semibold">Fare Paid</th>
              <th className="pb-2 font-semibold">Booked Timestamp</th>
              <th className="pb-2 font-semibold text-right">Gate Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A375E]">
            {state.tickets.map((t) => (
              <tr key={t.id} className="hover:bg-[#0B132B] transition-colors">
                <td className="py-2.5 font-bold text-[#00D4FF]">{t.id}</td>
                <td className="py-2.5 text-slate-200">{t.routeName}</td>
                <td className="py-2.5 text-slate-300">{t.fromStation}</td>
                <td className="py-2.5 text-slate-300">{t.toStation}</td>
                <td className="py-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#0B132B] text-[10px] text-slate-300 border border-[#2A375E]">
                    {t.vesselClass}
                  </span>
                </td>
                <td className="py-2.5 text-slate-300">{t.passengerCount}</td>
                <td className="py-2.5 font-bold text-[#22C55E]">₹{t.fare}</td>
                <td className="py-2.5 text-slate-400 text-[11px]">
                  {new Date(t.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td className="py-2.5 text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#22C55E] font-bold">
                    <CheckCircle2 size={12} />
                    <span>Confirmed</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
