import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isInfo = toast.type === 'info';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start justify-between gap-3 transition-all animate-in slide-in-from-right-10 duration-200 ${
              isSuccess 
                ? 'bg-slate-900 text-white border-emerald-500/50'
                : isError
                ? 'bg-red-950 text-white border-red-500/50'
                : 'bg-slate-900 text-white border-blue-500/50'
            }`}
          >
            <div className="flex items-start gap-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
              {isInfo && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
              <div>
                <h5 className="text-xs font-bold">{toast.title}</h5>
                <p className="text-[11px] text-slate-300 mt-0.5">{toast.description}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
