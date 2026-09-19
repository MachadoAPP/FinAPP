import React from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatCOP, formatCOPPlain } from '../../utils/finance';

interface InicioScreenProps {
  onOpenModal: (modalId: string) => void;
}

export const InicioScreen: React.FC<InicioScreenProps> = ({ onOpenModal }) => {
  const {
    balance,
    porPagarMes,
    gastosHoyTotal,
    pagadoMes,
    compromisoTotal,
    debts,
    servicios,
    expenses,
    savings,
    markDebtPaid,
    payService,
    deleteExpense,
    triggerConfetti,
    setCurrentTab,
  } = useFinancial();

  // Progress calculations
  const pctCubierto = compromisoTotal > 0 ? Math.min(100, Math.round((pagadoMes / compromisoTotal) * 100)) : 0;
  const pendiente = Math.max(0, compromisoTotal - pagadoMes);

  // Available dues to pay this month
  const availableDebts = debts.filter(
    (d) => d.id === 'bancolombia-prestamo' || d.id === 'visa-clasica' || d.id === 'bancolombia-libre'
  );
  const pendingDebtsCount = availableDebts.filter((d) => !d.paidThisMonth).length;

  // Pending services
  const pendingServicesCount = servicios.filter((s) => !s.paid).length;

  // Today expenses
  const todayExpenses = expenses.filter((e) => e.dateGroup === 'hoy');

  return (
    <div className="flex flex-col w-full gap-4 pb-10">
      {/* Privacy indicator toast banner */}
      <div className="flex items-center gap-2 bg-[#eff4ff] px-3.5 py-2.5 rounded-xl text-[#45464d] shadow-xs border border-[#c6c6cd]/20">
        <span className="material-symbols-outlined text-[18px] text-[#006c49]">encrypted</span>
        <span className="text-xs font-medium truncate">Datos guardados localmente en tu dispositivo</span>
        <span
          className="material-symbols-outlined text-[16px] text-[#006c49] ml-auto flex-shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          verified_user
        </span>
      </div>

      {/* Primary Balance Card */}
      <div className="bg-[#131b2e] text-[#ffffff] rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden flex flex-col gap-4 border border-[#dae2fd]/10">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#006c49]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between">
          <span className="text-[0.75rem] font-bold text-[#7c839b] uppercase tracking-wider">
            Balance Estimado Disponible
          </span>
          <span className="text-xs bg-[#ffffff]/10 text-[#ffffff] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6ffbbe]"></span> Octubre
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 my-0.5">
          <span className="text-xl font-bold text-[#6ffbbe]">$</span>
          <span className="text-[2.25rem] font-extrabold tracking-tight leading-none text-[#ffffff]">
            {formatCOPPlain(balance)}
          </span>
        </div>

        {/* Dual Mini Metric Display */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#ffffff]/10">
          <div className="bg-[#ffffff]/5 p-2.5 rounded-xl flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-[#7c839b]">
              <span className="material-symbols-outlined text-[14px]">event_upcoming</span>
              <span className="text-[11px] font-medium">Por pagar este mes</span>
            </div>
            <span className="text-lg font-bold text-[#ffffff]">{formatCOP(porPagarMes)}</span>
          </div>

          <div className="bg-[#ffffff]/5 p-2.5 rounded-xl flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-[#7c839b]">
              <span className="material-symbols-outlined text-[14px]">today</span>
              <span className="text-[11px] font-medium">Gastos de hoy</span>
            </div>
            <span className="text-lg font-bold text-[#6ffbbe]">{formatCOP(gastosHoyTotal)}</span>
          </div>
        </div>
      </div>

      {/* Monthly Commitments Progress Bar & Summary */}
      <div className="bg-[#ffffff] rounded-2xl p-4 shadow-sm flex flex-col gap-1.5 border border-[#c6c6cd]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#006c49]">donut_large</span>
            <span className="font-bold text-[0.95rem] text-[#0b1c30]">Compromisos Mensuales</span>
          </div>
          <span className="text-xs font-bold text-[#006c49]">{pctCubierto}% cubierto</span>
        </div>

        <div className="w-full bg-[#e5eeff] rounded-full h-2.5 mt-1.5 overflow-hidden flex">
          <div
            className="bg-[#006c49] h-full rounded-full transition-all duration-700"
            style={{ width: `${pctCubierto}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-[#45464d] text-xs pt-1">
          <span>Pagado: {formatCOP(pagadoMes)}</span>
          <span>Pendiente: {formatCOP(pendiente)}</span>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        <button
          type="button"
          onClick={() => onOpenModal('nuevo-gasto')}
          className="flex-shrink-0 flex items-center gap-1.5 bg-[#000000] text-[#ffffff] px-3.5 py-2 rounded-xl shadow-xs active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span className="text-xs font-bold whitespace-nowrap">+ Nuevo Gasto Diario</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('ahorro')}
          className="flex-shrink-0 flex items-center gap-1.5 bg-[#006c49] text-[#ffffff] px-3.5 py-2 rounded-xl shadow-xs active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">savings</span>
          <span className="text-xs font-bold whitespace-nowrap">Metas de Ahorro</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('calculadora')}
          className="flex-shrink-0 flex items-center gap-1.5 bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] px-3.5 py-2 rounded-xl shadow-xs active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px] text-[#45464d]">calculate</span>
          <span className="text-xs font-semibold whitespace-nowrap">Simular Crédito</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenModal('anadir-deuda')}
          className="flex-shrink-0 flex items-center gap-1.5 bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] px-3.5 py-2 rounded-xl shadow-xs active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px] text-[#45464d]">post_add</span>
          <span className="text-xs font-semibold whitespace-nowrap">Añadir Deuda</span>
        </button>
      </div>

      {/* Highlight Section: Cuotas Disponibles para Pago */}
      <div className="flex flex-col gap-3 mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-[#006c49]">
              notification_important
            </span>
            <h2 className="font-bold text-[1.05rem] text-[#0b1c30]">
              Cuotas Disponibles para Pago
            </h2>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
              pendingDebtsCount === 0
                ? 'bg-[#6cf8bb] text-[#00714d]'
                : 'bg-[#6ffbbe]/50 text-[#005236]'
            }`}
          >
            {pendingDebtsCount === 0 ? 'Al día ✓' : `${pendingDebtsCount} por vencer`}
          </span>
        </div>

        {/* Render Installment Cards */}
        {availableDebts.map((debt) => {
          const isPaid = debt.paidThisMonth;

          return (
            <div
              key={debt.id}
              className={`bg-[#ffffff] rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-all duration-300 relative border ${
                isPaid ? 'border-[#006c49]/30 bg-[#eff4ff]/40' : 'border-[#c6c6cd]/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#dce9ff] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#000000] text-[22px]">
                      {debt.icon}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[0.95rem] text-[#0b1c30] truncate">
                      {debt.name}
                    </span>
                    <span className="text-xs text-[#45464d]">
                      Cuota #{debt.currentInstallment} de {debt.totalInstallments}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                    isPaid ? 'bg-[#006c49] text-[#ffffff]' : 'bg-[#6cf8bb] text-[#00714d]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-white' : 'bg-[#006c49]'}`}
                  ></span>
                  {isPaid ? 'Pagado' : 'Disponible'}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-0.5">
                <div className="flex flex-col">
                  <span className="text-xs text-[#45464d] flex items-center gap-1">
                    <span
                      className={`material-symbols-outlined text-[14px] ${
                        isPaid ? 'text-[#006c49]' : 'text-[#ba1a1a]'
                      }`}
                    >
                      {isPaid ? 'check_circle' : 'alarm'}
                    </span>
                    {isPaid ? `Pagado: ${debt.paidDate}` : `Vence: ${debt.dueDate}`}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      isPaid ? 'text-[#006c49]' : 'text-[#ba1a1a]'
                    }`}
                  >
                    {isPaid ? 'Cuota al día' : debt.dueDaysNotice}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-[#0b1c30]">
                    {formatCOP(debt.installmentAmount)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isPaid}
                onClick={(e) => {
                  triggerConfetti(e.currentTarget);
                  markDebtPaid(debt.id);
                }}
                className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all ${
                  isPaid
                    ? 'bg-[#e5eeff] text-[#006c49] cursor-default border border-[#006c49]/20'
                    : 'bg-[#006c49] hover:bg-[#005236] active:scale-[0.985] text-[#ffffff]'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={isPaid ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {isPaid ? 'task_alt' : 'check_circle'}
                </span>
                <span>{isPaid ? 'Cuota registrada como pagada' : 'Ya pagué esta cuota'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Servicios Públicos Section */}
      <div className="flex flex-col gap-3 mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-[#006c49]">power</span>
            <h2 className="font-bold text-[1.05rem] text-[#0b1c30]">Servicios Públicos</h2>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
              pendingServicesCount === 0
                ? 'bg-[#6cf8bb] text-[#00714d]'
                : 'bg-[#6ffbbe]/50 text-[#005236]'
            }`}
          >
            {pendingServicesCount === 0 ? 'Todos Pagados ✓' : `${pendingServicesCount} pendientes`}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {servicios.map((serv) => {
            return (
              <div
                key={serv.id}
                className={`bg-[#ffffff] rounded-xl p-3.5 shadow-xs flex flex-col gap-2.5 border transition-all ${
                  serv.paid ? 'border-[#006c49]/25 bg-[#eff4ff]/30' : 'border-[#c6c6cd]/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        serv.paid ? 'bg-[#6cf8bb]/40 text-[#006c49]' : 'bg-[#e5eeff] text-[#0b1c30]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{serv.icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-[#0b1c30] truncate">{serv.name}</span>
                      <span className="text-[11px] text-[#45464d]">{serv.proveedor}</span>
                    </div>
                  </div>

                  <span className="text-sm font-extrabold text-[#0b1c30]">
                    {formatCOP(serv.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#eff4ff]">
                  <span className="text-xs text-[#45464d]">
                    {serv.paid ? `✓ Pagado: ${serv.paidAt || 'hoy'}` : `Vence: ${serv.dueDate}`}
                  </span>

                  <button
                    type="button"
                    disabled={serv.paid}
                    onClick={(e) => {
                      triggerConfetti(e.currentTarget);
                      payService(serv.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      serv.paid
                        ? 'bg-[#e5eeff] text-[#006c49]'
                        : 'bg-[#006c49] text-[#ffffff] active:scale-95'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {serv.paid ? 'check' : 'receipt'}
                    </span>
                    <span>{serv.paid ? 'Al día' : 'Pagar'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Expenses Micro-list */}
      <div className="bg-[#ffffff] rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-[#c6c6cd]/20 mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#45464d]">receipt</span>
            <span className="font-bold text-[0.95rem] text-[#0b1c30]">Gastos Registrados Hoy</span>
          </div>
          <button
            type="button"
            onClick={() => onOpenModal('nuevo-gasto')}
            className="text-xs font-bold text-[#006c49] hover:underline flex items-center gap-0.5"
          >
            <span>+ Añadir gasto</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {todayExpenses.length === 0 ? (
            <p className="text-xs text-[#45464d] text-center py-3">No hay gastos registrados hoy.</p>
          ) : (
            todayExpenses.map((exp) => (
              <div
                key={exp.id}
                className={`flex items-center justify-between p-2.5 rounded-xl bg-[#eff4ff] transition-all ${
                  !exp.active ? 'opacity-40 line-through' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#e5eeff] flex items-center justify-center flex-shrink-0 text-[#45464d]">
                    <span className="material-symbols-outlined text-[18px]">{exp.categoryIcon}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#0b1c30] truncate">{exp.concept}</span>
                    <span className="text-[11px] text-[#45464d] truncate">
                      {exp.detail} • {exp.timeStr}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold text-[#0b1c30]">
                    -{formatCOP(exp.amount)}
                  </span>
                  <button
                    type="button"
                    title="Eliminar gasto"
                    onClick={() => deleteExpense(exp.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#c6c6cd] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
