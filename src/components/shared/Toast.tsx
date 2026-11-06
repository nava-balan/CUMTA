import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useGlobal, Toast } from '../../store/globalStore';

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          border: 'border-[#22C55E]',
          bg: 'bg-[#1C2541]',
          icon: <CheckCircle2 size={16} className="text-[#22C55E] shrink-0" />,
        };
      case 'warning':
        return {
          border: 'border-[#FFC145]',
          bg: 'bg-[#1C2541]',
          icon: <AlertTriangle size={16} className="text-[#FFC145] shrink-0" />,
        };
      case 'error':
        return {
          border: 'border-[#EF4444]',
          bg: 'bg-[#1C2541]',
          icon: <AlertCircle size={16} className="text-[#EF4444] shrink-0" />,
        };
      case 'info':
      default:
        return {
          border: 'border-[#3A86FF]',
          bg: 'bg-[#1C2541]',
          icon: <Info size={16} className="text-[#3A86FF] shrink-0" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`flex items-start gap-2 p-4 rounded-lg border ${style.border} ${style.bg} text-[#F8FAFC] shadow-card max-w-sm w-full font-sans text-xs`}>
      {style.icon}
      <div className="flex-1">
        <h4 className="font-semibold text-xs mb-1">{toast.title}</h4>
        <p className="text-[11px] text-slate-300 leading-normal">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white shrink-0 p-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { state, removeToast } = useGlobal();

  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9998] flex flex-col gap-2">
      {state.toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}
