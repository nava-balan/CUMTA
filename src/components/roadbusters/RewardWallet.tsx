import { useState } from 'react';
import { Award, Train, Bus, Ship, Check, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { useGlobal } from '../../store/globalStore';

export default function RewardWallet() {
  const { state, addCivicPoints, addToast } = useGlobal();
  const [redeemedCode, setRedeemedCode] = useState<{ title: string; code: string } | null>(null);

  const rewards = [
    {
      id: 'cmrl-pass',
      title: 'CMRL Metro Day Pass',
      category: 'Rail Transit',
      description: 'Hop-on/hop-off pass across Blue & Green line corridors.',
      cost: 200,
      icon: Train,
    },
    {
      id: 'mtc-pass',
      title: 'MTC Express Bus Day Pass',
      category: 'Bus Network',
      description: 'Deluxe & electric MTC bus routes across Chennai.',
      cost: 150,
      icon: Bus,
    },
    {
      id: 'waterlink-pass',
      title: 'WATERLINK Single Ride Pass',
      category: 'Water Metro',
      description: '1 Free trip on any of the 6 Chennai Water Metro River Corridors.',
      cost: 100,
      icon: Ship,
    },
  ];

  const handleRedeem = (item: typeof rewards[0]) => {
    if (state.civicPoints < item.cost) {
      addToast({
        type: 'warning',
        title: 'Insufficient Civic Points',
        message: `You need ${item.cost} points for ${item.title}. Current balance: ${state.civicPoints} PTS.`,
      });
      return;
    }

    addCivicPoints(-item.cost);
    const code = `CHN360-${item.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setRedeemedCode({ title: item.title, code });

    addToast({
      type: 'success',
      title: 'Civic Reward Redeemed',
      message: `${item.title} redeemed for ${item.cost} points. Transit voucher code: ${code}.`,
    });
  };

  return (
    <div className="p-4 space-y-4 font-sans text-xs bg-[#171717] text-[#FFF8ED]">
      <div className="p-4 rounded-lg bg-[#303030] border border-[#444444] shadow-card flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">Current Balance</span>
          <div className="text-xl font-bold font-mono text-[#FFC145]">
            {state.civicPoints} PTS
          </div>
        </div>
        <div className="p-2 rounded bg-[#171717] text-[#FF6B00]">
          <Award size={22} />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-bold text-xs text-[#FFF8ED]">Redeemable Transit Passes</h4>
        {rewards.map((item) => {
          const Icon = item.icon;
          const canAfford = state.civicPoints >= item.cost;

          return (
            <div
              key={item.id}
              className="p-4 rounded-lg bg-[#303030] border border-[#444444] shadow-card flex flex-col gap-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-[#171717] text-[#FF6B00]">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#FFF8ED]">{item.title}</h5>
                    <span className="text-[10px] font-mono text-slate-400">{item.category}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-[#FFC145]">
                  {item.cost} PTS
                </span>
              </div>

              <p className="text-[11px] text-slate-300">{item.description}</p>

              <button
                onClick={() => handleRedeem(item)}
                disabled={!canAfford}
                className={`w-full py-1.5 rounded font-mono font-bold text-xs transition-colors ${
                  canAfford
                    ? 'bg-[#FF6B00] text-[#171717] hover:opacity-90'
                    : 'bg-[#171717] text-slate-500 border border-[#444444] cursor-not-allowed'
                }`}
              >
                {canAfford ? `Redeem for ${item.cost} Points` : `Need ${item.cost - state.civicPoints} More Points`}
              </button>
            </div>
          );
        })}
      </div>

      {redeemedCode && (
        <div className="p-4 rounded-lg bg-[#171717] border border-[#FF6B00] shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-[#22C55E]">Voucher Issued</span>
            <button onClick={() => setRedeemedCode(null)} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 mb-1">{redeemedCode.title}</p>
          <div className="p-2 rounded bg-[#303030] font-mono font-bold text-sm text-[#FFC145] text-center">
            {redeemedCode.code}
          </div>
        </div>
      )}
    </div>
  );
}
