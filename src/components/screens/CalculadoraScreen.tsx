import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { calculateSimulation, formatCOP } from '../../utils/finance';

export const CalculadoraScreen: React.FC = () => {
  const {
    simulationParams,
    setSimulationParams,
    saveSimulationAsDebt,
    triggerConfetti,
    setCurrentTab,
  } = useFinancial();

  const [expandedSchedule, setExpandedSchedule] = useState<boolean>(false);

  const simulation = calculateSimulation(simulationParams);

  const handleAmountPreset = (val: number) => {
    setSimulationParams((prev) => ({ ...prev, amount: val }));
  };

  const handleTermSelect = (term: number) => {
    setSimulationParams((prev) => ({ ...prev, termMonths: term }));
  };

  const handleAmortSelect = (sys: 'frances' | 'aleman') => {
    setSimulationParams((prev) => ({ ...prev, amortizationSystem: sys }));
  };

  const visibleSchedule = expandedSchedule
    ? simulation.schedule
    : simulation.schedule.slice(0, 6);

  return (
    <div className="flex flex-col w-full pb-10 space-y-4">
      {/* Encabezado de Página */}
      <div className="flex flex-col pt-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="material-symbols-outlined text-[#006c49] text-[20px]">calculate</span>
          <span className="text-xs font-bold text-[#006c49] uppercase tracking-wider">
            Simulador Pro
          </span>
        </div>
        <h1 className="font-extrabold text-[1.375rem] text-[#0b1c30] leading-tight">
          Calculadora de Crédito
        </h1>
        <p className="text-xs text-[#45464d] mt-0.5 leading-relaxed">
          Simula tus condiciones antes de adquirir una deuda o proyecta tus cuotas con total certeza.
        </p>
      </div>

      {/* Formulario de Parámetros de Simulación */}
      <div className="bg-[#ffffff] rounded-2xl p-4 shadow-sm space-y-4 border border-[#c6c6cd]/20">
        {/* Monto a Financiar */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0b1c30] flex justify-between items-center">
            <span>Monto a financiar</span>
            <span className="text-[#006c49] text-[11px] font-bold bg-[#6cf8bb]/30 px-2 py-0.5 rounded-full">
              COP ($)
            </span>
          </label>

          <div className="flex items-center bg-[#eff4ff] rounded-xl px-4 py-2.5 transition-all">
            <span className="text-xl font-bold text-[#45464d] mr-1">$</span>
            <input
              type="number"
              step="100000"
              value={simulationParams.amount}
              onChange={(e) =>
                setSimulationParams((prev) => ({
                  ...prev,
                  amount: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-full bg-transparent text-xl font-extrabold text-[#0b1c30] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleAmountPreset(5000000)}
              title="Restablecer monto a $5.000.000"
              className="text-[#45464d] hover:text-[#000000] transition-colors ml-2 p-1"
            >
              <span className="material-symbols-outlined text-[20px]">sync</span>
            </button>
          </div>

          <div className="flex gap-2 pt-1 overflow-x-auto pb-1 no-scrollbar">
            {[
              { label: '$1M', val: 1000000 },
              { label: '$5M', val: 5000000 },
              { label: '$12M', val: 12000000 },
              { label: '$25M', val: 25000000 },
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => handleAmountPreset(preset.val)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-transform active:scale-95 ${
                  simulationParams.amount === preset.val
                    ? 'bg-[#000000] text-[#ffffff]'
                    : 'bg-[#e5eeff] text-[#0b1c30] hover:bg-[#dce9ff]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plazo del Crédito */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-[#0b1c30]">Plazo del crédito</label>
            <span className="text-xs font-bold text-[#006c49] bg-[#6ffbbe]/50 px-2 py-0.5 rounded-md">
              {simulationParams.termMonths} meses
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {[6, 12, 24, 36, 48].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleTermSelect(term)}
                className={`py-2 text-center rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  simulationParams.termMonths === term
                    ? 'bg-[#000000] text-[#ffffff] shadow-xs'
                    : 'bg-[#e5eeff] text-[#0b1c30] hover:bg-[#dce9ff]'
                }`}
              >
                {term}m
              </button>
            ))}
          </div>

          <input
            type="range"
            min="6"
            max="60"
            step="6"
            value={simulationParams.termMonths}
            onChange={(e) => handleTermSelect(parseInt(e.target.value, 10))}
            className="w-full accent-[#006c49] mt-2 h-1.5 bg-[#e5eeff] rounded-lg cursor-pointer"
          />
        </div>

        {/* Tasa de Interés y Modalidad */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#0b1c30]">Tasa (%)</label>
            <div className="flex items-center bg-[#eff4ff] rounded-xl px-3 py-2.5">
              <input
                type="number"
                step="0.01"
                value={simulationParams.rate}
                onChange={(e) =>
                  setSimulationParams((prev) => ({
                    ...prev,
                    rate: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full bg-transparent text-base font-bold text-[#0b1c30] focus:outline-none"
              />
              <span className="text-xs text-[#45464d] font-bold">%</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#0b1c30]">Modalidad</label>
            <select
              value={simulationParams.rateType}
              onChange={(e) =>
                setSimulationParams((prev) => ({
                  ...prev,
                  rateType: e.target.value as 'EM' | 'EA',
                }))
              }
              className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs font-bold rounded-xl px-3 py-3 focus:outline-none border-none cursor-pointer"
            >
              <option value="EM">E.M. (Mensual)</option>
              <option value="EA">E.A. (Anual)</option>
            </select>
          </div>
        </div>

        {/* Sistema de Amortización */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0b1c30]">Sistema de amortización</label>
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#eff4ff] rounded-xl">
            <button
              type="button"
              onClick={() => handleAmortSelect('frances')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                simulationParams.amortizationSystem === 'frances'
                  ? 'bg-[#ffffff] text-[#0b1c30] shadow-sm'
                  : 'text-[#45464d]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-[#006c49]">equalizer</span>
              <span>Cuota Fija (Francés)</span>
            </button>

            <button
              type="button"
              onClick={() => handleAmortSelect('aleman')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                simulationParams.amortizationSystem === 'aleman'
                  ? 'bg-[#ffffff] text-[#0b1c30] shadow-sm'
                  : 'text-[#45464d]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">trending_down</span>
              <span>Abono Fijo (Alemán)</span>
            </button>
          </div>
        </div>

        {/* Día de pago deseado */}
        <div className="flex items-center justify-between bg-[#eff4ff] p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c49] text-[22px]">
              event_repeat
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#0b1c30]">Día de pago cada mes</span>
              <span className="text-[11px] text-[#45464d]">Generación automática de fechas</span>
            </div>
          </div>

          <select
            value={simulationParams.paymentDay}
            onChange={(e) =>
              setSimulationParams((prev) => ({ ...prev, paymentDay: e.target.value }))
            }
            className="bg-[#ffffff] text-[#0b1c30] text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs focus:outline-none border-none cursor-pointer"
          >
            <option value="05">Día 05</option>
            <option value="15">Día 15</option>
            <option value="20">Día 20</option>
            <option value="30">Día 30</option>
          </select>
        </div>
      </div>

      {/* Resumen de la Simulación Card */}
      <div className="bg-[#131b2e] rounded-2xl p-4 sm:p-5 text-[#ffffff] relative overflow-hidden shadow-lg border border-[#dae2fd]/10">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#006c49]/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 bg-[#006c49]/30 px-2.5 py-1 rounded-full border border-[#006c49]/40">
            <span className="w-2 h-2 rounded-full bg-[#6ffbbe] inline-block animate-pulse"></span>
            <span className="text-xs text-[#6ffbbe] font-bold">Proyección Estimada</span>
          </div>
          <span className="text-xs text-[#7c839b] bg-[#ffffff]/10 px-2.5 py-0.5 rounded-md font-medium">
            {simulationParams.rate.toFixed(2)}% {simulationParams.rateType === 'EM' ? 'M.V.' : 'E.A.'}
          </span>
        </div>

        {/* Métrica Principal: Cuota Mensual */}
        <div className="flex flex-col mb-3">
          <span className="text-xs text-[#7c839b] font-medium">Cuota Mensual Estimada</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[2rem] font-extrabold text-[#ffffff] tracking-tight">
              {formatCOP(simulation.monthlyInstallment)}
            </span>
            <span className="text-xs text-[#7c839b]">/ mes</span>
          </div>
        </div>

        {/* Mini Desglose Visual Bento */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="bg-[#ffffff]/10 rounded-xl p-3 shadow-xs">
            <div className="flex items-center gap-1 text-[#bec6e0] mb-0.5">
              <span className="material-symbols-outlined text-[15px] text-[#ffdad6]">
                price_change
              </span>
              <span className="text-[11px] font-medium">Total Intereses</span>
            </div>
            <p className="text-base font-extrabold text-[#ffffff]">
              {formatCOP(simulation.totalInterest)}
            </p>
            <span className="text-[10px] text-[#bec6e0]">Costo financiero</span>
          </div>

          <div className="bg-[#ffffff]/10 rounded-xl p-3 shadow-xs">
            <div className="flex items-center gap-1 text-[#bec6e0] mb-0.5">
              <span className="material-symbols-outlined text-[15px] text-[#6ffbbe]">
                account_balance_wallet
              </span>
              <span className="text-[11px] font-medium">Costo Total</span>
            </div>
            <p className="text-base font-extrabold text-[#ffffff]">
              {formatCOP(simulation.totalCost)}
            </p>
            <span className="text-[10px] text-[#bec6e0]">Capital + Interés</span>
          </div>
        </div>

        {/* Proporción Visual Interés vs Capital */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-[#bec6e0]">
            <span>Capital ({simulation.capitalPct}%)</span>
            <span>Intereses ({simulation.interestPct}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#ffffff]/15 flex overflow-hidden">
            <div className="bg-[#6ffbbe] h-full" style={{ width: `${simulation.capitalPct}%` }}></div>
            <div className="bg-[#ba1a1a] h-full" style={{ width: `${simulation.interestPct}%` }}></div>
          </div>
        </div>
      </div>

      {/* Botón de Acción Principal */}
      <button
        type="button"
        onClick={(e) => {
          triggerConfetti(e.currentTarget);
          saveSimulationAsDebt();
          setTimeout(() => setCurrentTab('deudas'), 1200);
        }}
        className="w-full py-3.5 px-4 bg-[#006c49] hover:bg-[#005236] text-[#ffffff] rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-[0.985] transition-all"
      >
        <span className="material-symbols-outlined text-[20px]">add_task</span>
        <span>Guardar como Deuda Activa en mis Finanzas</span>
      </button>

      {/* Cronograma de Pagos / Plan de Amortización */}
      <div className="bg-[#ffffff] rounded-2xl p-4 shadow-sm space-y-3 border border-[#c6c6cd]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0b1c30] text-[22px]">
              calendar_month
            </span>
            <div className="flex flex-col">
              <h2 className="font-bold text-sm text-[#0b1c30]">Cronograma de Pagos</h2>
              <span className="text-[11px] text-[#45464d]">Detalle mensual de cuotas</span>
            </div>
          </div>
          <span className="text-xs font-semibold bg-[#e5eeff] text-[#0b1c30] px-2.5 py-0.5 rounded-full">
            {simulation.schedule.length} Pagos
          </span>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-12 text-[#45464d] text-[11px] font-bold px-2 py-1">
          <span className="col-span-2"># Cuota</span>
          <span className="col-span-3">F. Estimada</span>
          <span className="col-span-4 text-right">Capital / Int.</span>
          <span className="col-span-3 text-right">Saldo</span>
        </div>

        {/* Schedule Rows */}
        <div className="space-y-1.5">
          {visibleSchedule.map((row) => (
            <div
              key={row.installmentNumber}
              className="grid grid-cols-12 items-center bg-[#eff4ff] p-2.5 rounded-xl text-xs"
            >
              <div className="col-span-2 flex items-center gap-1 font-bold text-[#0b1c30]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]"></span>
                <span>C-{row.installmentNumber < 10 ? `0${row.installmentNumber}` : row.installmentNumber}</span>
              </div>
              <div className="col-span-3 text-[11px] text-[#45464d]">{row.dateStr}</div>
              <div className="col-span-4 text-right">
                <p className="font-bold text-[#006c49] text-[11px]">
                  {formatCOP(row.capital)}
                </p>
                <p className="text-[10px] text-[#ba1a1a]/90 font-medium">
                  {formatCOP(row.interest)}
                </p>
              </div>
              <div className="col-span-3 text-right font-bold text-[#0b1c30] text-[11px]">
                {formatCOP(row.remainingBalance)}
              </div>
            </div>
          ))}
        </div>

        {/* Toggle Expandir/Colapsar */}
        {simulation.schedule.length > 6 && (
          <button
            type="button"
            onClick={() => setExpandedSchedule(!expandedSchedule)}
            className="w-full py-2.5 rounded-xl bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors mt-2"
          >
            <span>
              {expandedSchedule
                ? 'Mostrar solo primeras 6 cuotas'
                : `Ver plan completo (${simulation.schedule.length} cuotas)`}
            </span>
            <span className="material-symbols-outlined text-[18px]">
              {expandedSchedule ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
