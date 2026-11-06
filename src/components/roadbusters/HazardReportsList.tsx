import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { useGlobal } from '../../store/globalStore';
import { HazardReport, HazardSeverity, getHazardCategoryLabel } from '../../data/hazardData';

export default function HazardReportsList() {
  const { state, addCivicPoints, addToast, setMapTarget } = useGlobal();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  const handleUpvote = (report: HazardReport) => {
    if (upvotedIds.has(report.id)) return;

    setUpvotedIds((prev) => new Set(prev).add(report.id));
    addCivicPoints(5);

    addToast({
      type: 'info',
      title: 'Incident Corroborated',
      message: `Upvote recorded for #${report.id}. +5 Civic Points awarded for civic vigilance.`,
    });
  };

  const getSeverityBadgeClass = (severity: HazardSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-[#EF4444] text-white';
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
    if (filterSeverity === 'all') return true;
    return r.severity === filterSeverity;
  });

  return (
    <div className="p-4 space-y-4 font-sans text-xs bg-[#171717] text-[#FFF8ED]">
      <div className="flex items-center justify-between pb-2 border-b border-[#303030]">
        <h3 className="font-bold text-sm text-[#FFF8ED]">
          Active Civic Hazards ({filteredReports.length})
        </h3>
        <div className="flex gap-1 text-[10px] font-mono">
          {['all', 'critical', 'high'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-0.5 rounded uppercase font-bold ${
                filterSeverity === sev
                  ? 'bg-[#FF6B00] text-[#171717]'
                  : 'bg-[#303030] text-slate-300'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="p-4 rounded-lg bg-[#303030] border border-[#444444] shadow-card flex flex-col gap-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono font-bold text-[#FF6B00]">#{report.id}</span>
                <h4 className="font-bold text-xs text-[#FFF8ED] mt-0.5">
                  {getHazardCategoryLabel(report.category)}
                </h4>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${getSeverityBadgeClass(
                  report.severity
                )}`}
              >
                {report.severity}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-normal">{report.description}</p>

            <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-[#444444] text-slate-400">
              <span>{report.gccZone.split(' - ')[1] || report.gccZone}</span>
              <span>SLA: {report.estimatedFixHours}h</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() =>
                  setMapTarget({
                    lat: report.lat,
                    lng: report.lng,
                    zoom: 16,
                    timestamp: Date.now(),
                  })
                }
                className="text-[10px] font-mono text-[#FFC145] hover:underline"
              >
                View on Map
              </button>

              <button
                onClick={() => handleUpvote(report)}
                disabled={upvotedIds.has(report.id)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-colors ${
                  upvotedIds.has(report.id)
                    ? 'bg-[#171717] text-[#22C55E]'
                    : 'bg-[#171717] text-[#FFF8ED] hover:bg-[#444444] border border-[#444444]'
                }`}
              >
                <ThumbsUp size={11} />
                <span>Upvote ({report.upvotes + (upvotedIds.has(report.id) ? 1 : 0)})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
