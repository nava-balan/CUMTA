import { useState } from 'react';
import { Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useGlobal } from '../../store/globalStore';
import { HazardReport, HazardSeverity, getHazardCategoryLabel } from '../../data/hazardData';

export default function MunicipalOperationsDesk() {
  const { state, verifyReport, addToast } = useGlobal();
  const [selectedZone, setSelectedZone] = useState<string>('all');

  const handleVerifyOnSpot = (report: HazardReport) => {
    verifyReport(report.id, 'verified');

    addToast({
      type: 'success',
      title: 'Municipal Field On-Spot Verified',
      message: `Report #${report.id} verified at ${report.gccZone}. SLA: ${report.estimatedFixHours}h. +100 Civic Points credited to citizen wallet.`,
    });
  };

  const getSeverityBadgeClass = (severity: HazardSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-[#EF4444] text-[#FFFFFF]';
      case 'high':
        return 'bg-[#FF6B00] text-[#171717]';
      case 'medium':
        return 'bg-[#FFC145] text-[#171717]';
      case 'low':
      default:
        return 'bg-[#22C55E] text-[#171717]';
    }
  };

  const filteredReports = state.hazardReports.filter((r) => {
    if (selectedZone === 'all') return true;
    return r.gccZone.includes(selectedZone);
  });

  return (
    <div className="bg-[#1C2541] border border-[#2A375E] rounded-lg p-4 text-[#F8FAFC] shadow-card font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-[#2A375E]">
        <div>
          <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
            <Building2 size={16} className="text-[#3A86FF]" />
            <span>GCC Municipal Verification Queue & Enforcement Desk</span>
          </h3>
          <p className="text-xs text-slate-400">
            Greater Chennai Corporation (GCC) field dispatch, on-spot auditing, and SLA enforcement.
          </p>
        </div>

        {/* Zone Filter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Filter Zone:</span>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-[#0B132B] border border-[#2A375E] rounded p-1 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#3A86FF]"
          >
            <option value="all">All 15 GCC Zones</option>
            <option value="Teynampet">Zone 9 - Teynampet</option>
            <option value="Kodambakkam">Zone 10 - Kodambakkam</option>
            <option value="Adyar">Zone 13 - Adyar</option>
            <option value="Royapuram">Zone 5 - Royapuram</option>
            <option value="Perungudi">Zone 14 - Perungudi</option>
          </select>
        </div>
      </div>

      {/* Tabular Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[#2A375E] text-slate-400 text-[10px] uppercase">
              <th className="pb-2 font-semibold">Incident Ref</th>
              <th className="pb-2 font-semibold">Category</th>
              <th className="pb-2 font-semibold">Severity</th>
              <th className="pb-2 font-semibold">GCC Zone & Ward</th>
              <th className="pb-2 font-semibold">AI Conf.</th>
              <th className="pb-2 font-semibold">SLA</th>
              <th className="pb-2 font-semibold">Status</th>
              <th className="pb-2 font-semibold text-right">Municipal Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A375E]">
            {filteredReports.map((report) => {
              const isVerified = report.verificationStatus === 'verified';

              return (
                <tr key={report.id} className="hover:bg-[#0B132B] transition-colors">
                  <td className="py-2.5 font-bold text-[#00D4FF]">{report.id}</td>
                  <td className="py-2.5 text-slate-200">{getHazardCategoryLabel(report.category)}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getSeverityBadgeClass(report.severity)}`}>
                      {report.severity}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300">
                    <div>{report.gccZone.split(' - ')[1] || report.gccZone}</div>
                    <div className="text-[10px] text-slate-500">{report.assignedWard}</div>
                  </td>
                  <td className="py-2.5 text-[#00D4FF]">{report.aiConfidence}%</td>
                  <td className="py-2.5 text-slate-300">{report.estimatedFixHours}h</td>
                  <td className="py-2.5">
                    <span className={`text-[10px] uppercase font-bold ${
                      isVerified ? 'text-[#22C55E]' : 'text-[#FFC145]'
                    }`}>
                      {report.verificationStatus}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#22C55E] font-bold">
                        <CheckCircle2 size={12} />
                        <span>Verified (+100 Pts)</span>
                      </span>
                    ) : (
                      /* Strict Secondary style button: solid surface background, 1px solid border */
                      <button
                        onClick={() => handleVerifyOnSpot(report)}
                        className="px-2 py-1 rounded bg-[#0B132B] text-[#00D4FF] border border-[#3A86FF] hover:bg-[#3A86FF] hover:text-[#FFFFFF] text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <ShieldCheck size={12} />
                        <span>Verify On-Spot (+100 Pts)</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
