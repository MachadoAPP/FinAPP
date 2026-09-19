import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';

export const Header: React.FC = () => {
  const { resetToDefaultState } = useFinancial();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const LOGO_SRC =
    'https://lh3.googleusercontent.com/aida/AEtjO1U23mjMz2X25pZ4UP8wshZXhYdwqbJKaS7vDTcuupRajUGvE_0EsKNpYj66AAxSbSrFzNn6EB_h6c4LnzP9oO2SBeMh9QXwn8CjiP75AVwhutS5O96GmVC4R3gFAgr2SVgLR8UJE8aqAFxqNKdfL35jKQoZ6C8xFDYk3IEQvMTuYp6jhhHo-ujKl2P8xfo-ixoASaWq7ufwrSpabgfYU5MF3ASK55pOpel2VM5qNoE5PlDfwWQENZ3TNEaI';

  return (
    <header className="fixed top-0 w-full max-w-[430px] z-50 bg-[#f8f9ff]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe border-b border-[#c6c6cd]/20">
      <div className="h-16 px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            alt="FinControl Logo"
            className="h-8 w-8 object-contain flex-shrink-0 rounded-lg shadow-xs"
            src={LOGO_SRC}
            referrerPolicy="no-referrer"
            onError={(e) => {
              // fallback styling if image fails
              const target = e.target as HTMLElement;
              target.style.display = 'none';
            }}
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[1.125rem] text-[#0b1c30] tracking-tight truncate">
                FinControl
              </span>
              <span className="text-[0.6875rem] font-bold text-[#006c49] bg-[#6ffbbe]/40 px-1.5 py-0.5 rounded-full">
                Personal
              </span>
            </div>
            <span className="text-[0.6875rem] text-[#45464d] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006c49] inline-block"></span>
              Modo Local / Privado
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="Perfil y opciones locales"
            className="w-8 h-8 rounded-full bg-[#000000] hover:bg-[#131b2e] active:scale-95 transition-all flex items-center justify-center flex-shrink-0 shadow-sm"
          >
            <span className="material-symbols-outlined text-[#ffffff] text-[18px]">
              person
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-10 w-56 bg-[#ffffff] border border-[#c6c6cd]/40 rounded-xl shadow-xl p-2 z-50 animate-toast">
              <div className="px-3 py-2 border-b border-[#e5eeff]">
                <p className="text-xs font-bold text-[#0b1c30]">Bóveda Local Cifrada</p>
                <p className="text-[11px] text-[#45464d]">Sin servidores externos</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  if (confirm('¿Restablecer datos de prueba a valores iniciales?')) {
                    resetToDefaultState();
                  }
                }}
                className="w-full text-left px-3 py-2.5 text-xs text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg flex items-center gap-2 transition-colors mt-1 font-medium"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                Restablecer datos demo
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
