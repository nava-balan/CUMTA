import { useState, useEffect } from 'react';
import { Cpu, X } from 'lucide-react';

interface AIVerificationModalProps {
  isOpen: boolean;
  onComplete: () => void;
  category: string;
  confidence?: number;
  fixHours?: number;
}

export default function AIVerificationModal({
  isOpen,
  onComplete,
  category,
  confidence = 96.8,
  fixHours = 12,
}: AIVerificationModalProps) {
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      return;
    }

    const t1 = setTimeout(() => setStep(1), 300);
    const t2 = setTimeout(() => setStep(2), 600);
    const t3 = setTimeout(() => setStep(3), 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70 p-4 font-sans text-xs">
      <div className="bg-[#171717] border border-[#FF6B00] rounded-lg p-4 max-w-md w-full relative shadow-card text-[#FFF8ED]">
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#303030]">
          <Cpu size={18} className="text-[#FF6B00]" />
          <div>
            <h3 className="font-bold text-sm text-[#FFF8ED]">
              Tier 1 — Edge Vision AI Verification
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              On-Device Surface Distress Classifier {category ? `(${category})` : ''}
            </p>
          </div>
        </div>

        {/* Status Steps */}
        <div className="space-y-2 font-mono mb-4">
          <div className="p-2 rounded bg-[#303030] border border-[#444444] flex items-center justify-between">
            <span className="text-slate-300">1. Spatial Metadata & Exif Timestamp:</span>
            <span className="text-[#22C55E] font-bold">VERIFIED</span>
          </div>
          <div className="p-2 rounded bg-[#303030] border border-[#444444] flex items-center justify-between">
            <span className="text-slate-300">2. Surface Severity Model:</span>
            <span className={step >= 2 ? 'text-[#22C55E] font-bold' : 'text-[#FFC145]'}>
              {step >= 2 ? `${confidence}% CONFIDENCE` : 'INSPECTING...'}
            </span>
          </div>
          <div className="p-2 rounded bg-[#303030] border border-[#444444] flex items-center justify-between">
            <span className="text-slate-300">3. Estimated Municipal SLA:</span>
            <span className={step >= 3 ? 'text-[#00D4FF] font-bold' : 'text-slate-500'}>
              {step >= 3 ? `${fixHours} HOURS` : 'CALCULATING...'}
            </span>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full py-2 rounded-lg bg-[#FF6B00] text-[#171717] font-bold text-xs hover:opacity-90"
        >
          Confirm & Dispatch to Ward Office
        </button>
      </div>
    </div>
  );
}
