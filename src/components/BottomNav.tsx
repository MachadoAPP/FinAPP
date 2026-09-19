import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { TabType } from '../types';

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab, debts, servicios } = useFinancial();

  // Pending obligations count for red badge
  const pendingDebtsCount = debts.filter((d) => d.status === 'active' && !d.paidThisMonth).length;
  const pendingServiciosCount = servicios.filter((s) => !s.paid).length;
  const totalPendingBadges = pendingDebtsCount + pendingServiciosCount;

  const tabs: { id: TabType; label: string; icon: string; badge?: number }[] = [
    { id: 'inicio', label: 'Inicio', icon: 'dashboard' },
    { id: 'deudas', label: 'Deudas', icon: 'credit_card', badge: totalPendingBadges },
    { id: 'ahorro', label: 'Ahorro', icon: 'savings' },
    { id: 'calculadora', label: 'Simulador', icon: 'calculate' },
    { id: 'gastos', label: 'Gastos', icon: 'receipt_long' },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-[430px] z-50 pb-safe bg-[#ffffff]/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)] border-t border-[#c6c6cd]/25">
      <div className="flex justify-around items-center h-16 px-0.5">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-[50px] h-12 transition-all relative ${
                isActive ? 'text-[#006c49] font-extrabold' : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#ba1a1a] text-[#ffffff] font-bold text-[9px] rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[0.6875rem] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
