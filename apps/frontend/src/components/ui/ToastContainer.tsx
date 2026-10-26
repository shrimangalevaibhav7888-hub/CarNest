"use client";

import React from 'react';
import { useCareNest } from '../../context/CareNestContext';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X, Bell } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCareNest();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const isEmergency = t.type === 'emergency';
        const isSuccess = t.type === 'success';
        const isWarning = t.type === 'warning';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-5 duration-200 ${
              isEmergency
                ? 'bg-slate-950 text-white border-amber-500 shadow-amber-950/40'
                : isSuccess
                ? 'bg-emerald-900 text-white border-emerald-600 shadow-emerald-900/30'
                : isWarning
                ? 'bg-amber-900 text-white border-amber-500 shadow-amber-900/30'
                : 'bg-stone-900 text-white border-stone-700 shadow-stone-900/30'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isEmergency ? (
                <AlertTriangle className="h-5 w-5 text-amber-400 animate-pulse" />
              ) : isSuccess ? (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              ) : isWarning ? (
                <AlertCircle className="h-5 w-5 text-amber-400" />
              ) : (
                <Info className="h-5 w-5 text-warmOrange-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold leading-tight">{t.title}</h4>
              <p className="text-[11px] text-stone-300 mt-0.5 leading-snug">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 text-stone-400 hover:text-white rounded-lg transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
