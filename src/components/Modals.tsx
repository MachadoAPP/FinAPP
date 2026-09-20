import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { ExpenseCategory, PaymentMethod } from '../types';

// Lee el día de pago (1-31) del texto "Día 15 de cada mes"
const parseDay = (text: string): number => {
  const m = text.match(/\d{1,2}/);
  const n = m ? parseInt(m[0], 10) : 15;
  return Math.min(31, Math.max(1, n));
};

// Prefijo del modal de edición: el id del modal es "editar-deuda:<id de la obligación>"
const EDIT_PREFIX = 'editar-deuda:';

interface ModalsProps {
  activeModal: string | null;
  onClose: () => void;
}

export const Modals: React.FC<ModalsProps> = ({ activeModal, onClose }) => {
  const {
    addExpense,
    addNewDebt,
    debts,
    updateDebt,
    windowRuleDays,
    setWindowRuleDays,
    autoCloseOverdue,
    setAutoCloseOverdue,
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

  // Edit Debt form state
  const [editName, setEditName] = useState<string>('');
  const [editEntity, setEditEntity] = useState<string>('');
  const [editTotal, setEditTotal] = useState<string>('');
  const [editInstallments, setEditInstallments] = useState<string>('');
  const [editInstallmentAmount, setEditInstallmentAmount] = useState<string>('');
  const [editDay, setEditDay] = useState<string>('15');

  // Obligación que se está editando (si el modal abierto es el de edición)
  const editDebtId =
    activeModal && activeModal.startsWith(EDIT_PREFIX) ? activeModal.slice(EDIT_PREFIX.length) : null;
  const editingDebt = editDebtId ? debts.find((d) => d.id === editDebtId) : undefined;

  // Al abrir el modal de edición, carga los datos actuales de la obligación
  useEffect(() => {
    if (!editingDebt) return;
    setEditName(editingDebt.name);
    setEditEntity(editingDebt.entity);
    setEditTotal(String(editingDebt.initialAmount));
    setEditInstallments(String(editingDebt.totalInstallments));
    setEditInstallmentAmount(String(editingDebt.installmentAmount));
    setEditDay(String(parseDay(editingDebt.dueDate)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDebtId]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDebt) return;

    const total = parseFloat(editTotal);
    const installments = parseInt(editInstallments, 10);
    const instAmount = parseFloat(editInstallmentAmount);
    const day = parseInt(editDay, 10);

    if (!editName.trim() || !(total > 0) || !(instAmount > 0) || !(installments >= 1) || !(day >= 1 && day <= 31)) {
      alert('Revisa los campos: nombre, monto total, cuotas, valor de la cuota y día de pago (1-31).');
      return;
    }

    updateDebt(editingDebt.id, {
      name: editName.trim(),
      entity: editEntity.trim() || 'Entidad Financiera',
      totalAmount: total,
      totalInstallments: installments,
      installmentAmount: instAmount,
      paymentDay: day,
    });
    onClose();
  };

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

        {/* MODAL 2B: EDITAR OBLIGACIÓN */}
        {editingDebt && (
          <div>
            <div className="flex justify-between items-start mb-4 border-b border-[#eff4ff] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#dae2fd] flex items-center justify-center text-[#131b2e]">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </div>
                <div>
                  <h3 className="font-bold text-[1.125rem] text-[#0b1c30]">Editar Obligación</h3>
                  <p className="text-xs text-[#45464d]">Corrige los datos que registraste mal</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#45464d] hover:text-[#0b1c30] p-1 rounded-full hover:bg-[#eff4ff]"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#45464d] mb-1">
                  Nombre o Concepto *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm outline-none border border-transparent focus:border-[#006c49]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#45464d] mb-1">
                  Entidad o Acreedor
                </label>
                <input
                  type="text"
                  value={editEntity}
                  onChange={(e) => setEditEntity(e.target.value)}
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
                    min="1"
                    required
                    value={editTotal}
                    onChange={(e) => setEditTotal(e.target.value)}
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
                    value={editInstallments}
                    onChange={(e) => setEditInstallments(e.target.value)}
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
                    min="1"
                    required
                    value={editInstallmentAmount}
                    onChange={(e) => setEditInstallmentAmount(e.target.value)}
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
                    value={editDay}
                    onChange={(e) => setEditDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm outline-none border border-transparent focus:border-[#006c49]"
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#45464d]">
                Si cambias el monto total, el saldo pendiente se recalcula conservando lo que ya llevas pagado.
              </p>

              <button
                type="submit"
                className="w-full h-12 bg-[#006c49] text-[#ffffff] font-bold text-sm rounded-xl active:scale-[0.985] transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                Guardar Cambios
              </button>
            </form>
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
