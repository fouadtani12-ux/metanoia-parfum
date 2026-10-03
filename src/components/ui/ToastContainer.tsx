import React from 'react';
import { useStore } from '../../lib/store';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-[#D8B08C] shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
          warning: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
          info: <Info className="w-4 h-4 text-[#A7A3A0] shrink-0" />,
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-[#151518]/95 backdrop-blur-md border border-[#D8B08C]/20 shadow-2xl rounded-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <p className="text-xs text-[#F5F1EB] font-medium leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#A7A3A0] hover:text-[#F5F1EB] transition-colors p-1"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
