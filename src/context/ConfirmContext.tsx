import React, { createContext, useContext, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<ConfirmOptions | null>(null);

  const confirm = (options: ConfirmOptions) => {
    setDialogState(options);
  };

  const handleConfirm = () => {
    if (dialogState?.onConfirm) {
      dialogState.onConfirm();
    }
    setDialogState(null);
  };

  const handleCancel = () => {
    if (dialogState?.onCancel) {
      dialogState.onCancel();
    }
    setDialogState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialogState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl shrink-0 ${dialogState.isDanger ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">{dialogState.title}</h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{dialogState.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {dialogState.cancelText || 'Hủy bỏ'}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-colors ${
                  dialogState.isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {dialogState.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
};
