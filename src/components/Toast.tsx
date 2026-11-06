import React from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  isError?: boolean;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold pointer-events-auto transform transition-all duration-300 animate-slide-up border ${
            toast.isError
              ? 'bg-[#ba1a1a] text-white border-red-800'
              : 'bg-[#1A3620] text-white border-[#277E39]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {toast.isError ? 'error' : 'check_circle'}
          </span>
          <span>{toast.text}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-2 opacity-70 hover:opacity-100"
            aria-label="Kapat"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
