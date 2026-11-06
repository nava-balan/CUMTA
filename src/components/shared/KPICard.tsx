import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  color?: string;
  trend?: number;
  format?: 'number' | 'currency' | 'decimal';
}

export default function KPICard({
  title,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  color = '#00D4FF',
  trend,
  format = 'number',
}: KPICardProps) {
  const formatValue = (v: number) => {
    if (format === 'currency') return v.toLocaleString('en-IN');
    if (format === 'decimal') return v.toFixed(1);
    return v.toLocaleString('en-IN');
  };

  return (
    <div className="bg-[#1C2541] border border-[#2A375E] rounded-lg p-4 shadow-card text-[#F8FAFC]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold font-mono" style={{ color }}>
            {prefix}{formatValue(value)}{suffix}
          </p>
          {trend !== undefined && (
            <p className={`text-[10px] font-mono mt-1 ${trend >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {trend >= 0 ? '+' : '-'} {Math.abs(trend)}% vs last period
            </p>
          )}
        </div>
        <div className="p-2 rounded bg-[#0B132B] text-[#3A86FF] border border-[#2A375E]">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}
