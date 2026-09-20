import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { ExpenseCategory, PaymentMethod } from '../types';
import { formatCOP } from '../utils/finance';

interface ModalsProps {
  activeModal: string | null;
  onClose: () => void;
}

export const Modals: React.FC<ModalsProps> = ({ activeModal, onClose }) => {
  const {
    addExpense,
    addNewDebt,
    windowRuleDays,
    setWindowRuleDays,
    autoCloseOverdue,
    setAutoCloseOverdue,
    setCurrentTab,
    showNotification,
  } = useFinancial();

  // New Expense form state
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseConcept, setExpenseConcept] = useState<string>('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Alimentación');
  const [expenseCategoryIcon, setExpenseCategoryIcon] = useState<string>('restaurant');
  const [expenseMethod, setExpenseMethod] = useState<PaymentMethod>('cash');
  const [expenseDetail, setExpenseDetail] = useState<string>('');

  // New Debt form state
  const [debtName, setDebtName] = useState<string>('');
  const [debtEntity, setDebtEntity] = useState<string>('');
  const [debtTotal, setDebtTotal] = useState<string>('');
  const [debtInstallments, setDebtInstallments] = useState<string>('24');
  const [debtInstallmentAmount, setDebtInstallmentAmount] = useState<string>('');
  const [debtDay, setDebtDay] = useState<string>('15');

  // Quick Simulation state
  const [simMonto, setSimMonto] = useState<number>(2000000);
  const [simPlazo, setSimPlazo] = useState<number>(12);
  const [simTasa, setSimTasa] = useState<number>(1.8);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!amt || !expenseConcept.trim()) return;

    addExpense({
      concept: expenseConcept.trim(),
      amount: amt,
      category: expenseCategory,
      categoryIcon: expenseCategoryIcon,
      paymentMethod: expenseMethod,
      detail: expenseDetail.trim() || undefined,
    });

    setExpenseAmount('');
    setExpenseConcept('');
    setExpenseDetail('');
    onClose();
  };

  const handleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(debtTotal.replace(/\D/g, ''));
    const installments = parseInt(debtInstallments, 10);
    const instAmount = parseFloat(debtInstallmentAmount.replace(/\D/g, ''));
    const day = parseInt(debtDay, 10) || 15;

    if (!debtName.trim() || isNaN(total) || isNaN(instAmount)) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    addNewDebt({
      name: debtName.trim(),
      entity: debtEntity.trim() || 'Entidad Financiera',
      totalAmount: total,
      totalInstallments: installments || 12,
      installmentAmount: instAmount,
      paymentDay: day,
    });

    setDebtName('');
    setDebtEntity('');
    setDebtTotal('');
    setDebtInstallmentAmount('');
    onClose();
  };

  const calculatedSimCuota = () => {
    const i = simTasa / 100;
    if (i <= 0) return simMonto / simPlazo;
    return (simMonto * (i * Math.pow(1 + i, simPlazo))) / (Math.pow(1 + i, simPlazo) - 1);
  };

  if (!activeModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0b1c30]/50 backdrop-blur-sm transition-opacity p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Animacion propia de la ventana: solo sube y aparece, sin mover el ancho.
          (Antes usaba la animacion del aviso emergente, que la corria hacia la izquierda.) */}
      <style>{`
        @keyframes finapp-modal-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="w-full max-w-[430px] bg-[#ffffff] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[90dvh] overflow-y-auto overscroll-contain"
        style={{ animation: 'finapp-modal-up 0.22s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-[#c6c6cd] rounded-full mx-auto mb-4 sm:hidden"></div>

        {/* MODAL 1: NUEVO GASTO DIARIO */}
        {activeModal === 'nuevo-gasto' && (
          <div>
            <div className="flex justify-between items-start mb-4 border-b border-[#eff4ff] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#6cf8bb]/40 flex items-center justify-center text-[#006c49]">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                </div>
                <div>
                  <h3 className="font-bold text-[1.125rem] text-[#0b1c30]">Registrar Gasto</h3>
                  <p className="text-xs text-[#45464d]">Almacenado localmente en tu dispositivo</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#45464d] hover:text-[#0b1c30] p-1 rounded-full hover:bg-[#eff4ff]"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#45464d] mb-1">
                  Monto a desembolsar ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#45464d] text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    step="100"
                    min="100"
                    required
                    autoFocus
                    placeholder="Ej: 25000"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-lg font-bold outline-none border border-transparent focus:border-[#006c49] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#45464d] mb-1.5">Categoría</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'Comida', cat: 'Alimentación' as ExpenseCategory, icon: 'restaurant' },
                    { label: 'Movilidad', cat: 'Transporte' as ExpenseCategory, icon: 'directions_subway' },
                    { label: 'Hogar', cat: 'Hogar' as ExpenseCategory, icon: 'home' },
                    { label: 'Salud', cat: 'Salud' as ExpenseCategory, icon: 'medical_services' },
                    { label: 'Ocio', cat: 'Ocio' as ExpenseCategory, icon: 'sports_esports' },
                    { label: 'Otros', cat: 'Otros' as ExpenseCategory, icon: 'category' },
                  ].map((item) => {
                    const isSelected = expenseCategory === item.cat;
                    return (
                      <button
                        key={item.cat}
                        type="button"
                        onClick={() => {
                          setExpenseCategory(item.cat);
                          setExpenseCategoryIcon(item.icon);
                        }}
                        className={`flex items-center gap-1.5 p-2 rounded-lg text-left transition-all active:scale-95 text-xs font-semibold ${
                          isSelected
                            ? 'bg-[#e5eeff] text-[#006c49] border border-[#006c49]/30'
                            : 'bg-[#eff4ff] text-[#45464d]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#45464d] mb-1">
                  Concepto / Glosa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Almuerzo ejecutivo o combustible"
                  value={expenseConcept}
                  onChange={(e) => setExpenseConcept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm outline-none border border-transparent focus:border-[#006c49]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#45464d] mb-1.5">
                  Método de liquidación
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-[#eff4ff] p-1 rounded-xl">
                  {[
                    { id: 'cash' as PaymentMethod, label: 'Efectivo' },
                    { id: 'debit' as PaymentMethod, label: 'Débito' },
                    { id: 'credit' as PaymentMethod, label: 'T. Crédito' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setExpenseMethod(m.id)}
                      className={`py-1.5 text-xs font-semibold rounded-lg text-center transition-all ${
                        expenseMethod === m.id
                          ? 'bg-[#ffffff] text-[#0b1c30] shadow-xs'
                          : 'text-[#45464d]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                {expenseMethod === 'credit' && (
                  <p className="text-[11px] text-[#ba1a1a] mt-1 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">warning</span>
                    Computa a saldo diferido / tarjeta
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#006c49] text-[#ffffff] font-bold text-sm rounded-xl active:scale-[0.985] transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                Guardar Gasto Localmente
              </button>
            </form>
          </div>
        )}

        {/* MODAL 2: AÑADIR OBLIGACIÓN / DEUDA */}
        {activeModal === 'anadir-deuda' && (
          <div>
            <div className="flex justify-between items-start mb-4 border-b border-[#eff4ff] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#dae2fd] flex items-center justify-center text-[#131b2e]">
                  <span className="material-symbols-outlined text-[20px]">post_add</span>
                </div>
                <div>
                  <h3 className="font-bold text-[1.125rem] text-[#0b1c30]">Nueva Obligación</h3>
                  <p className="text-xs text-[#45464d]">Préstamo, crédito bancario o cuotas</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#45464d] hover:text-[#0b1c30] p-1 rounded-full hover:bg-[#eff4ff]"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <form onSubmit={handleDebtSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#45464d] mb-1">
                  Nombre o Concepto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Crédito Hipotecario / Libre Inversión"
                  value={debtName}
                  onChange={(e) => setDebtName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm outline-none border border-transparent focus:border-[#006c49]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#45464d] mb-1">
                  Entidad o Acreedor
                </label>
                <input
                  type="text"
                  placeholder="Ej: Bancolombia, Banco de Bogotá, Falabella"
                  value={debtEntity}
                  onChange={(e) => setDebtEntity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm outline-none border border-transparent focus:border-[#006c49]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#45464d] mb-1">
                    Monto Total *
                  </label>
                  <input
                    type="number"
                    step="10000"
                    required
                    placeholder="$ 5.000.000"
                    value={debtTotal}
                    onChange={(e) => setDebtTotal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm outline-none border border-transparent focus:border-[#006c49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#45464d] mb-1">
                    Total Cuotas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    placeholder="24"
                    value={debtInstallments}
                    onChange={(e) => setDebtInstallments(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm outline-none border border-transparent focus:border-[#006c49]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#45464d] mb-1">
                    Valor Cuota *
                  </label>
                  <input
                    type="number"
                    step="100"
                    required
                    placeholder="$ 245.000"
                    value={debtInstallmentAmount}
                    onChange={(e) => setDebtInstallmentAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm outline-none border border-transparent focus:border-[#006c49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#45464d] mb-1">
                    Día de Pago (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    placeholder="Ej: 28"
                    value={debtDay}
                    onChange={(e) => setDebtDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm outline-none border border-transparent focus:border-[#006c49]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#006c49] text-[#ffffff] font-bold text-sm rounded-xl active:scale-[0.985] transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_task</span>
                Guardar Obligación
              </button>
            </form>
          </div>
        )}

        {/* MODAL 3: SIMULAR CRÉDITO RÁPIDO */}
        {activeModal === 'simular-credito' && (
          <div>
            <div className="flex justify-between items-start mb-4 border-b border-[#eff4ff] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#6cf8bb]/40 flex items-center justify-center text-[#006c49]">
                  <span className="material-symbols-outlined text-[20px]">calculate</span>
                </div>
                <div>
                  <h3 className="font-bold text-[1.125rem] text-[#0b1c30]">Simulador Rápido</h3>
                  <p className="text-xs text-[#45464d]">Calcula tu cuota mensual estimada</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#45464d] hover:text-[#0b1c30] p-1 rounded-full hover:bg-[#eff4ff]"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#45464d] mb-1">
                  Monto a financiar ($)
                </label>
                <input
                  type="number"
                  step="100000"
                  value={simMonto}
                  onChange={(e) => setSimMonto(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-base font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#45464d] mb-1">
                    Plazo (meses)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={simPlazo}
                    onChange={(e) => setSimPlazo(parseInt(e.target.value, 10) || 12)}
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#45464d] mb-1">
                    Tasa mensual (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={simTasa}
                    onChange={(e) => setSimTasa(parseFloat(e.target.value) || 1.8)}
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#eff4ff] p-3.5 rounded-xl flex flex-col items-center justify-center border border-[#e5eeff]">
                <span className="text-xs text-[#45464d]">Cuota Mensual Estimada</span>
                <span className="text-xl font-extrabold text-[#006c49] mt-0.5">
                  {formatCOP(calculatedSimCuota())} / mes
                </span>
                <span className="text-[11px] text-[#45464d] mt-1">
                  Costo total aprox: {formatCOP(calculatedSimCuota() * simPlazo)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setCurrentTab('calculadora');
                  }}
                  className="h-11 bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  Ver Plan Completo
                </button>

                <button
                  type="button"
                  onClick={() => {
                    addNewDebt({
                      name: `Préstamo ${formatCOP(simMonto)}`,
                      entity: 'Simulación Rápida',
                      totalAmount: simMonto,
                      totalInstallments: simPlazo,
                      installmentAmount: Math.round(calculatedSimCuota()),
                      paymentDay: 15,
                    });
                    onClose();
                  }}
                  className="h-11 bg-[#006c49] text-[#ffffff] font-bold text-xs rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Agregar a Deudas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: CONFIGURACIÓN DE VENTANAS DE PAGO */}
        {activeModal === 'reglas-ventana' && (
          <div>
            <div className="flex justify-between items-start mb-4 border-b border-[#eff4ff] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6ffbbe]/40 flex items-center justify-center text-[#006c49]">
                  <span className="material-symbols-outlined text-[20px]">event_available</span>
                </div>
                <div>
                  <h3 className="font-bold text-[1.125rem] text-[#0b1c30]">
                    Ventana de Habilitación
                  </h3>
                  <p className="text-xs text-[#45464d]">Controla cuándo se activa el botón 'Ya pagué'</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#45464d] hover:text-[#0b1c30] p-1 rounded-full hover:bg-[#eff4ff]"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#45464d] mb-4">
              Para evitar confusiones o marcas accidentales, define con cuántos días de anticipación
              a la fecha límite se debe activar el botón verde de pago.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-2">
                  Días de anticipación al corte
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 5, 7, 10].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setWindowRuleDays(days)}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                        windowRuleDays === days
                          ? 'bg-[#006c49] text-[#ffffff] shadow-sm'
                          : 'bg-[#eff4ff] text-[#45464d] hover:bg-[#e5eeff]'
                      }`}
                    >
                      {days} días
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#eff4ff] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#0b1c30] font-semibold">Cierre automático</span>
                  <input
                    type="checkbox"
                    checked={autoCloseOverdue}
                    onChange={(e) => setAutoCloseOverdue(e.target.checked)}
                    className="w-4 h-4 accent-[#006c49] rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-[#45464d]">
                  Inhabilitar el botón si la fecha ya pasó y transferir a estado 'Mora / Pendiente urgente'.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  showNotification('Regla de ventana actualizada', `Botón activo ${windowRuleDays} días antes de la fecha límite.`);
                }}
                className="w-full h-12 bg-[#006c49] text-[#ffffff] font-bold text-sm rounded-xl active:scale-[0.985] shadow-sm"
              >
                Guardar Regla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
