import React, { useState } from 'react';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { Modals } from './components/Modals';
import { InicioScreen } from './components/screens/InicioScreen';
import { DeudasScreen } from './components/screens/DeudasScreen';
import { AhorroScreen } from './components/screens/AhorroScreen';
import { CalculadoraScreen } from './components/screens/CalculadoraScreen';
import { GastosScreen } from './components/screens/GastosScreen';

const MainLayout: React.FC = () => {
  const { currentTab } = useFinancial();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalId: string) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col items-center justify-start antialiased selection:bg-[#6cf8bb] selection:text-[#005236]">
      {/* Mobile container centered on desktop */}
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative bg-[#f8f9ff] shadow-[0_0_40px_rgba(11,28,48,0.06)] border-x border-[#c6c6cd]/20">
        {/* Top Header */}
        <Header />

        {/* Main View Area */}
        <main className="flex-1 flex flex-col w-full pt-16 pb-24 bg-[#f8f9ff] px-4">
          {currentTab === 'inicio' && <InicioScreen onOpenModal={openModal} />}
          {currentTab === 'deudas' && <DeudasScreen onOpenModal={openModal} />}
          {currentTab === 'ahorro' && <AhorroScreen />}
          {currentTab === 'calculadora' && <CalculadoraScreen />}
          {currentTab === 'gastos' && <GastosScreen />}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Interactive Modals */}
        <Modals activeModal={activeModal} onClose={closeModal} />

        {/* Toast notifications */}
        <Toast />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FinancialProvider>
      <MainLayout />
    </FinancialProvider>
  );
}
