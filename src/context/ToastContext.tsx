import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const value: ToastContextType = {
    toast: addToast,
    success: (msg, t) => addToast('success', msg, t || 'Thành công'),
    error: (msg, t) => addToast('error', msg, t || 'Có lỗi xảy ra'),
    warning: (msg, t) => addToast('warning', msg, t || 'Cảnh báo'),
    info: (msg, t) => addToast('info', msg, t || 'Thông báo')
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-5 bg-white ${
              t.type === 'success' ? 'border-emerald-200 text-emerald-950' :
              t.type === 'error' ? 'border-rose-200 text-rose-950' :
              t.type === 'warning' ? 'border-amber-200 text-amber-950' :
              'border-blue-200 text-slate-900'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1 text-sm">
              {t.title && <div className="font-semibold">{t.title}</div>}
              <div className="text-slate-600 text-xs mt-0.5">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
