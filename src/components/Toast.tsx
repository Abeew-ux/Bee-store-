import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, isDarkMode } = useStore();

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-3 inset-x-0 z-50 flex flex-col items-center pointer-events-none px-3 gap-1.5 max-w-md mx-auto"
    >
      {toasts.slice(-2).map((toast) => {
        let accentColor = 'bg-slate-900 border-slate-700 text-white';
        let Icon = Info;
        let iconColor = 'text-sky-400';

        if (toast.type === 'success') {
          accentColor = isDarkMode
            ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100'
            : 'bg-white/95 border-emerald-500/30 text-slate-900';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-500';
        } else if (toast.type === 'error') {
          accentColor = isDarkMode
            ? 'bg-slate-900/95 border-rose-500/40 text-slate-100'
            : 'bg-white/95 border-rose-500/30 text-slate-900';
          Icon = AlertCircle;
          iconColor = 'text-rose-500';
        } else if (toast.type === 'warning') {
          accentColor = isDarkMode
            ? 'bg-slate-900/95 border-amber-500/40 text-slate-100'
            : 'bg-white/95 border-amber-500/30 text-slate-900';
          Icon = AlertTriangle;
          iconColor = 'text-amber-500';
        } else {
          accentColor = isDarkMode
            ? 'bg-slate-900/95 border-slate-700 text-slate-100'
            : 'bg-white/95 border-slate-200 text-slate-900';
          Icon = Info;
          iconColor = 'text-sky-500';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl border shadow-lg backdrop-blur-md transition-all duration-200 transform animate-in slide-in-from-top-2 fade-in ${accentColor}`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight truncate">{toast.message}</p>
                {toast.subMessage && (
                  <p className="text-[11px] opacity-75 truncate mt-0.5 leading-none">
                    {toast.subMessage}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/20 transition-colors"
              title="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </aside>
  );
};
