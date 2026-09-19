import React from 'react';
import { useFinancial } from '../context/FinancialContext';

export const Toast: React.FC = () => {
  const { toast } = useFinancial();

  if (!toast.show) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-[390px] pointer-events-none transition-all duration-300 animate-toast">
      <div className="bg-[#131b2e] text-[#ffffff] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#6cf8bb]/40 backdrop-blur-md">
        <div className="w-8 h-8 rounded-full bg-[#006c49] flex items-center justify-center flex-shrink-0 text-[#ffffff]">
          <span className="material-symbols-outlined text-[18px]">check</span>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-bold text-xs text-[#ffffff] leading-tight truncate">
            {toast.title}
          </span>
          <span className="text-[11px] text-[#cbdbf5] truncate">{toast.desc}</span>
        </div>
      </div>
    </div>
  );
};
