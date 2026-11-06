import { Ship, AlertTriangle, LayoutDashboard, Shield, User, Award } from 'lucide-react';
import { useGlobal, AppMode } from '../../store/globalStore';

interface ModeOption {
  key: AppMode;
  title: string;
  subtitle: string;
  icon: typeof Ship;
}

const MODES: ModeOption[] = [
  {
    key: 'waterlink',
    title: 'WATERLINK',
    subtitle: 'Water Metro',
    icon: Ship,
  },
  {
    key: 'roadwatch',
    title: 'ROADWATCH',
    subtitle: 'Hazard Detector',
    icon: AlertTriangle,
  },
  {
    key: 'transitpulse',
    title: 'TRANSITPULSE',
    subtitle: 'Command Center',
    icon: LayoutDashboard,
  },
];

export default function ModeSwitcher() {
  const { state, setAppMode, setUserRole } = useGlobal();

  // Dynamic header styling according to active module
  const getHeaderStyle = () => {
    switch (state.appMode) {
      case 'waterlink':
        return {
          bg: 'bg-[#042F40]',
          border: 'border-[#075B66]',
          brandAccent: 'text-[#48D6C5]',
          text: 'text-[#E8FFFA]',
          subtext: 'text-[#48D6C5]',
        };
      case 'roadwatch':
        return {
          bg: 'bg-[#171717]',
          border: 'border-[#303030]',
          brandAccent: 'text-[#FF6B00]',
          text: 'text-[#FFF8ED]',
          subtext: 'text-[#FFC145]',
        };
      case 'transitpulse':
      default:
        return {
          bg: 'bg-[#0B132B]',
          border: 'border-[#1C2541]',
          brandAccent: 'text-[#3A86FF]',
          text: 'text-[#F8FAFC]',
          subtext: 'text-[#00D4FF]',
        };
    }
  };

  const headerTheme = getHeaderStyle();

  return (
    <header className={`sticky top-0 z-50 ${headerTheme.bg} border-b ${headerTheme.border} p-4`}>
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Architecture */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-[#3A86FF] flex items-center justify-center text-[#F8FAFC] font-bold text-base">
            360
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-[#F8FAFC]">
                CHENNAI 360
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-[#1C2541] text-[#00D4FF] border border-[#2A375E]">
                CUMTA
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-wide">
              One City. Infinite Possibilities.
            </p>
          </div>
        </div>

        {/* 3 Module Switcher Tabs */}
        <nav className="flex items-center gap-2 p-1 rounded-lg bg-[#1C2541] border border-[#2A375E]">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = state.appMode === mode.key;

            let activeBtnClass = 'bg-[#3A86FF] text-[#F8FAFC]';
            if (mode.key === 'waterlink') {
              activeBtnClass = 'bg-[#00A6A6] text-[#042F40] font-semibold';
            } else if (mode.key === 'roadwatch') {
              activeBtnClass = 'bg-[#FF6B00] text-[#171717] font-semibold';
            } else if (mode.key === 'transitpulse') {
              activeBtnClass = 'bg-[#3A86FF] text-[#F8FAFC] font-semibold';
            }

            return (
              <button
                key={mode.key}
                onClick={() => setAppMode(mode.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-colors ${
                  isActive
                    ? activeBtnClass
                    : 'bg-transparent text-slate-300 hover:bg-[#0B132B] hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span className="font-bold">{mode.title}</span>
                <span className="hidden md:inline text-[10px] opacity-75">
                  ({mode.subtitle})
                </span>
              </button>
            );
          })}
        </nav>

        {/* Role & Civic Points Counter */}
        <div className="flex items-center gap-4">
          {/* Civic Points Wallet Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1C2541] border border-[#2A375E] text-xs font-mono">
            <Award size={16} className="text-[#00D4FF]" />
            <div>
              <span className="text-slate-400 text-[10px] block leading-tight">Civic Points</span>
              <span className="font-bold text-[#00D4FF] text-sm leading-tight">
                {state.civicPoints} PTS
              </span>
            </div>
          </div>

          {/* Role Toggle Button (Secondary button style: surface bg, 1px solid border) */}
          <button
            onClick={() => setUserRole(state.userRole === 'commuter' ? 'admin' : 'commuter')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1C2541] border border-[#2A375E] text-xs font-medium text-[#F8FAFC] hover:bg-[#2A375E] transition-colors"
          >
            {state.userRole === 'admin' ? (
              <>
                <Shield size={14} className="text-[#3A86FF]" />
                <span>Admin View</span>
              </>
            ) : (
              <>
                <User size={14} className="text-[#00D4FF]" />
                <span>Commuter View</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
