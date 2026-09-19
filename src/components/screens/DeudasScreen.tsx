import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatCOP, formatCOPPlain } from '../../utils/finance';

interface DeudasScreenProps {
  onOpenModal: (modalId: string) => void;
}

export const DeudasScreen: React.FC<DeudasScreenProps> = ({ onOpenModal }) => {
  const {
    debts,
    markDebtPaid,
    undoDebtPayment,
    triggerConfetti,
  } = useFinancial();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'up-to-date' | 'closed'>('all');
  const [openProofFormId, setOpenProofFormId] = useState<string | null>(null);
  const [proofDate, setProofDate] = useState<string>('2024-10-26');

  // Calculations
  const totalActiveDebt = debts.reduce((sum, d) => sum + d.remainingBalance, 0);
  const totalInitial = debts.reduce((sum, d) => sum + d.initialAmount, 0);
  const totalAmortizado = Math.max(0, totalInitial - totalActiveDebt);
  const amortizedPct = totalInitial > 0 ? Math.round((totalAmortizado / totalInitial) * 1000) / 10 : 0;

  const pendingCount = debts.filter((d) => !d.paidThisMonth && d.status === 'active').length;
  const upToDateCount = debts.filter((d) => d.paidThisMonth || d.status === 'up-to-date').length;
  const closedCount = debts.filter((d) => d.status === 'closed').length;

  const filteredDebts = debts.filter((debt) => {
    if (activeFilter === 'pending') return !debt.paidThisMonth && debt.status === 'active';
    if (activeFilter === 'up-to-date') return debt.paidThisMonth || debt.status === 'up-to-date';
    if (activeFilter === 'closed') return debt.status === 'closed';
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-10 space-y-4">
      {/* Dynamic Notification / Local Vault Banner */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#6ffbbe]/30 rounded-xl shadow-xs border border-[#6cf8bb]/40">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="material-symbols-outlined text-[18px] text-[#006c49] flex-shrink-0">
            verified_user
          </span>
          <span className="text-xs font-semibold text-[#002113] truncate">
            Privacidad activa: Datos cifrados localmente
          </span>
        </div>
        <button
          type="button"
          onClick={() => onOpenModal('reglas-ventana')}
          className="flex items-center gap-1 text-[#006c49] font-bold text-xs active:opacity-70 transition-opacity flex-shrink-0 ml-1"
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>Reglas ventana</span>
        </button>
      </div>

      {/* Hero Metrics Bento Card */}
      <div className="relative overflow-hidden bg-[#131b2e] text-[#ffffff] rounded-2xl p-4 sm:p-5 shadow-lg border border-[#dae2fd]/10">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[#006c49]/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[0.75rem] font-bold text-[#7c839b] uppercase tracking-wider block">
              Deuda Total Activa
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[2.25rem] font-extrabold text-[#ffffff] leading-tight tracking-tight">
                ${formatCOPPlain(totalActiveDebt)}
              </span>
              <span className="text-xs text-[#6ffbbe] font-bold">COP</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ffffff]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#6ffbbe] text-[22px]">
              account_balance_wallet
            </span>
          </div>
        </div>

        {/* Secondary Metric Splits */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#ffffff]/10">
          <div className="flex flex-col">
            <span className="text-xs text-[#7c839b]">Total amortizado</span>
            <span className="text-lg font-bold text-[#6ffbbe]">{formatCOP(totalAmortizado)}</span>
            <span className="text-xs text-[#7c839b] mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#6ffbbe]">trending_up</span>
              {amortizedPct}% saldado
            </span>
          </div>
          <div className="flex flex-col pl-3 border-l border-[#ffffff]/10">
            <span className="text-xs text-[#7c839b]">Próximo corte</span>
            <span className="text-lg font-bold text-[#ffffff]">30 Octubre</span>
            <span className="text-xs text-[#4edea3] mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">event_upcoming</span>
              {pendingCount} cuotas en ciclo
            </span>
          </div>
        </div>

        {/* Mini Progress Line */}
        <div className="w-full bg-[#ffffff]/15 h-1.5 rounded-full mt-3.5 overflow-hidden">
          <div
            className="bg-[#6ffbbe] h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, amortizedPct)}%` }}
          ></div>
        </div>
      </div>

      {/* Filter Pills Segmented */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-0.5 -mx-1 px-1">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'all'
              ? 'bg-[#000000] text-[#ffffff] shadow-xs'
              : 'bg-[#dce9ff] text-[#45464d] hover:text-[#0b1c30]'
          }`}
        >
          Todas ({debts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('pending')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeFilter === 'pending'
              ? 'bg-[#000000] text-[#ffffff] shadow-xs'
              : 'bg-[#dce9ff] text-[#45464d] hover:text-[#0b1c30]'
          }`}
        >
          <span>Por pagar</span>
          <span className="px-1.5 py-0.2 bg-[#ba1a1a] text-[#ffffff] rounded-full text-[10px]">
            {pendingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('up-to-date')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'up-to-date'
              ? 'bg-[#000000] text-[#ffffff] shadow-xs'
              : 'bg-[#dce9ff] text-[#45464d] hover:text-[#0b1c30]'
          }`}
        >
          Al día ({upToDateCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('closed')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'closed'
              ? 'bg-[#000000] text-[#ffffff] shadow-xs'
              : 'bg-[#dce9ff] text-[#45464d] hover:text-[#0b1c30]'
          }`}
        >
          Finalizadas ({closedCount})
        </button>
      </div>

      {/* Cards List Section */}
      <div className="flex flex-col space-y-3">
        {filteredDebts.length === 0 ? (
          <div className="bg-[#ffffff] rounded-2xl p-6 text-center text-xs text-[#45464d] border border-[#c6c6cd]/20">
            No hay obligaciones en este filtro.
          </div>
        ) : (
          filteredDebts.map((debt) => {
            const isPaid = debt.paidThisMonth;
            const isWaiting = debt.status === 'waiting';

            return (
              <div
                key={debt.id}
                className={`bg-[#ffffff] rounded-2xl p-4 shadow-sm transition-all relative overflow-hidden border ${
                  isPaid
                    ? 'border-[#006c49]/30 bg-[#eff4ff]/20'
                    : isWaiting
                    ? 'border-[#c6c6cd]/20'
                    : 'border-[#c6c6cd]/20'
                }`}
              >
                {!isWaiting && !isPaid && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#006c49]"></div>
                )}

                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-2 pl-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#e5eeff] flex items-center justify-center flex-shrink-0 text-[#131b2e]">
                      <span className="material-symbols-outlined text-[24px]">{debt.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#0b1c30] truncate">{debt.name}</h3>
                      <p className="text-xs text-[#45464d] flex items-center gap-1 truncate">
                        <span>{debt.entity}</span>
                        {debt.rateInfo && (
                          <>
                            <span>•</span>
                            <span>{debt.rateInfo}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 flex-shrink-0 ${
                      isPaid
                        ? 'bg-[#6ffbbe]/40 text-[#005236]'
                        : isWaiting
                        ? 'bg-[#e5eeff] text-[#45464d]'
                        : 'bg-[#6ffbbe]/40 text-[#005236]'
                    }`}
                  >
                    {isPaid ? (
                      <>
                        <span className="material-symbols-outlined text-[14px]">done_all</span>
                        Al día
                      </>
                    ) : isWaiting ? (
                      <>
                        <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                        En espera
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006c49] animate-pulse"></span>
                        Ventana activa
                      </>
                    )}
                  </span>
                </div>

                {/* Financial Data Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3 pl-1 bg-[#eff4ff] p-2.5 rounded-xl">
                  <div>
                    <span className="text-[11px] text-[#45464d] block">
                      Cuota vigente #{debt.currentInstallment}
                    </span>
                    <span className="text-lg font-bold text-[#0b1c30]">
                      {formatCOP(debt.installmentAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#45464d] block">Saldo Estimado</span>
                    <span className="text-sm font-bold text-[#0b1c30]">
                      {formatCOP(debt.remainingBalance)}
                    </span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="mt-2.5 pl-1">
                  <div className="flex justify-between items-center text-xs text-[#45464d] mb-1">
                    <span>
                      Progreso: Cuota {debt.currentInstallment} de {debt.totalInstallments}
                    </span>
                    <span className="font-bold text-[#006c49]">{debt.amortizedPct}% amortizado</span>
                  </div>
                  <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWaiting ? 'bg-[#131b2e]' : 'bg-[#006c49]'
                      }`}
                      style={{ width: `${debt.amortizedPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Window Info Badge */}
                <div
                  className={`flex items-center gap-1.5 mt-2.5 pl-1 py-1.5 px-2 rounded-lg text-xs ${
                    isWaiting
                      ? 'bg-[#e5eeff] text-[#45464d]'
                      : 'bg-[#6cf8bb]/30 text-[#00714d]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isWaiting ? 'schedule' : 'calendar_clock'}
                  </span>
                  <span className="truncate">{debt.paymentWindowNotice}</span>
                </div>

                {/* Action Area */}
                <div className="mt-3 pl-1">
                  {isPaid ? (
                    <div className="p-3 bg-[#6ffbbe]/30 rounded-xl flex items-center justify-between border border-[#6cf8bb]/30">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006c49] text-[20px]">
                          check_circle
                        </span>
                        <div>
                          <span className="text-xs font-bold text-[#002113] block">
                            ¡Cuota #{debt.currentInstallment} pagada!
                          </span>
                          <span className="text-[11px] text-[#005236]">
                            {debt.paidDate ? `Registrado: ${debt.paidDate}` : 'Al día este mes'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => undoDebtPayment(debt.id)}
                        className="text-[#005236] text-xs font-bold underline hover:opacity-80 p-1"
                      >
                        Deshacer
                      </button>
                    </div>
                  ) : isWaiting ? (
                    <div>
                      <button
                        disabled
                        type="button"
                        className="w-full h-12 bg-[#dce9ff] text-[#76777d] text-sm font-semibold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                        <span>Pago habilitado según ventana ({debt.ruleDaysBefore || 5} días antes)</span>
                      </button>
                      <div className="flex justify-between items-center mt-2 px-1 text-xs text-[#45464d]">
                        <span>Regla: {debt.ruleDaysBefore || 5} días antes del corte</span>
                        <button
                          type="button"
                          onClick={() => onOpenModal('reglas-ventana')}
                          className="text-[#006c49] font-bold"
                        >
                          Editar regla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        onClick={(e) => {
                          triggerConfetti(e.currentTarget);
                          markDebtPaid(debt.id, proofDate);
                        }}
                        className="w-full h-12 bg-[#006c49] hover:bg-[#005236] text-[#ffffff] font-bold text-sm rounded-xl shadow-xs active:scale-[0.985] transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        <span>Marcar como Pagada (Ya pagué)</span>
                      </button>

                      <div className="flex justify-center items-center mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenProofFormId(openProofFormId === debt.id ? null : debt.id)
                          }
                          className="text-xs text-[#45464d] hover:text-[#0b1c30] flex items-center gap-1 font-medium"
                        >
                          <span>Adjuntar comprobante o fecha exacta</span>
                          <span className="material-symbols-outlined text-[14px]">
                            {openProofFormId === debt.id ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                      </div>

                      {openProofFormId === debt.id && (
                        <div className="mt-2.5 p-3 bg-[#e5eeff] rounded-xl space-y-2.5 text-xs animate-toast">
                          <div>
                            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                              Fecha de Débito Real
                            </label>
                            <input
                              type="date"
                              value={proofDate}
                              onChange={(e) => setProofDate(e.target.value)}
                              className="w-full h-9 px-3 bg-[#ffffff] text-[#0b1c30] rounded-lg outline-none"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#0b1c30]">Subir Comprobante (PDF/Img)</span>
                            <label className="cursor-pointer bg-[#d3e4fe] hover:bg-[#c6c6cd] px-3 py-1.5 rounded-lg text-[#45464d] font-semibold active:opacity-75">
                              <span>Seleccionar</span>
                              <input
                                type="file"
                                className="hidden"
                                onChange={() => alert('Comprobante local cargado con éxito.')}
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Subtle Financial Tip Card */}
      <div className="p-4 bg-[#e5eeff] rounded-2xl flex items-start gap-3 border border-[#c6c6cd]/20">
        <span className="material-symbols-outlined text-[#006c49] text-[22px] flex-shrink-0 mt-0.5">
          lightbulb
        </span>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-[#0b1c30]">Estrategia Bola de Nieve</span>
          <p className="text-xs text-[#45464d] mt-0.5 leading-relaxed">
            Terminarás el crédito de <strong>Electrodoméstico</strong> el próximo mes. Esos $85.000
            liberados acelerarán tu pago del Libre Inversión.
          </p>
        </div>
      </div>

      {/* Sticky Action Trigger Container */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onOpenModal('anadir-deuda')}
          className="w-full h-12 bg-[#000000] text-[#ffffff] font-bold text-sm rounded-xl shadow-md active:scale-[0.985] transition-transform flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>+ Registrar Nueva Obligación</span>
        </button>
      </div>
    </div>
  );
};
