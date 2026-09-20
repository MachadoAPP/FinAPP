import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { ExpenseCategory, PaymentMethod, FixedKind } from '../../types';
import { formatCOP } from '../../utils/finance';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Color de cada categoria en la barra de distribucion
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'Alimentación': '#006c49',
  'Transporte': '#565e74',
  'Hogar': '#131b2e',
  'Salud': '#4edea3',
  'Ocio': '#7073ff',
  'Otros': '#c6c6cd',
};

interface GastosScreenProps {
  onOpenModal: (modalId: string) => void;
}

// Tipos de gasto fijo (recurrente mensual)
const KIND_OPTIONS: { id: FixedKind; label: string; icon: string }[] = [
  { id: 'servicio', label: 'Servicio público', icon: 'bolt' },
  { id: 'suscripcion', label: 'Suscripción', icon: 'subscriptions' },
  { id: 'otro', label: 'Otro', icon: 'event_repeat' },
];

export const GastosScreen: React.FC<GastosScreenProps> = ({ onOpenModal }) => {
  const {
    expenses,
    gastosHoyTotal,
    servicios,
    addExpense,
    addFixedExpense,
    deleteExpense,
    deleteFixedExpense,
    undoFixedPayment,
    triggerConfetti,
  } = useFinancial();

  // Form states
  const [amountInput, setAmountInput] = useState<string>('');
  const [conceptInput, setConceptInput] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>('Alimentación');
  const [selectedCategoryIcon, setSelectedCategoryIcon] = useState<string>('restaurant');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');

  // Gasto recurrente (mensual) o solo esta vez
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringKind, setRecurringKind] = useState<FixedKind>('suscripcion');
  const [dayInput, setDayInput] = useState<string>(String(new Date().getDate()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(amountInput);
    const conceptVal = conceptInput.trim();

    if (!amountVal || !conceptVal) return;

    if (isRecurring) {
      const day = parseInt(dayInput, 10);
      if (!(day >= 1 && day <= 31)) {
        alert('El día de pago debe estar entre 1 y 31.');
        return;
      }
      addFixedExpense({
        name: conceptVal,
        kind: recurringKind,
        amount: amountVal,
        dueDay: day,
        paidNow: true,
        paymentMethod: selectedPaymentMethod,
      });
    } else {
      addExpense({
        concept: conceptVal,
        amount: amountVal,
        category: selectedCategory,
        categoryIcon: selectedCategoryIcon,
        paymentMethod: selectedPaymentMethod,
        detail: selectedPaymentMethod === 'credit' ? 'T. Crédito' : (selectedPaymentMethod === 'debit' ? 'Débito' : 'Efectivo'),
      });
    }

    triggerConfetti();
    setAmountInput('');
    setConceptInput('');
    setIsRecurring(false);
  };

  const handleDeleteFixed = (id: string, name: string) => {
    if (window.confirm(`¿Quitar "${name}" de tus gastos fijos?\n\nDeja de aparecer cada mes. Lo que ya pagaste queda registrado en tus gastos.`)) {
      deleteFixedExpense(id);
    }
  };

  // Gastos fijos: cuánto falta por pagar este mes
  const fixedPendingTotal = servicios.filter((f) => !f.paid).reduce((sum, f) => sum + f.amount, 0);
  const fixedPendingCount = servicios.filter((f) => !f.paid).length;

  // Fechas reales (mes actual, hoy y ayer)
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const monthLabel = `${MESES[now.getMonth()]} ${now.getFullYear()}`;
  const todayLabel = `Hoy, ${now.getDate()} ${MESES[now.getMonth()]}`;
  const yesterdayLabel = `Ayer, ${yesterday.getDate()} ${MESES[yesterday.getMonth()]}`;

  // Grouped expenses
  const todayExpenses = expenses.filter((e) => e.dateGroup === 'hoy');
  const yesterdayExpenses = expenses.filter((e) => e.dateGroup === 'ayer');

  const todaySum = todayExpenses.reduce((sum, e) => sum + (e.active ? e.amount : 0), 0);
  const yesterdaySum = yesterdayExpenses.reduce((sum, e) => sum + (e.active ? e.amount : 0), 0);

  // Category distributions
  const totalAllExpenses = expenses.reduce((sum, e) => sum + (e.active ? e.amount : 0), 0);

  const categoriesConfig = [
    { label: 'Comida', cat: 'Alimentación' as ExpenseCategory, icon: 'restaurant' },
    { label: 'Movilidad', cat: 'Transporte' as ExpenseCategory, icon: 'directions_subway' },
    { label: 'Hogar', cat: 'Hogar' as ExpenseCategory, icon: 'home' },
    { label: 'Salud', cat: 'Salud' as ExpenseCategory, icon: 'medical_services' },
    { label: 'Ocio', cat: 'Ocio' as ExpenseCategory, icon: 'sports_esports' },
    { label: 'Otros', cat: 'Otros' as ExpenseCategory, icon: 'category' },
  ];

  // Distribucion real: solo categorias con gastos, con su porcentaje sobre el total
  const distribution = categoriesConfig
    .map((c) => {
      const amount = expenses.reduce(
        (sum, e) => sum + (e.active && e.category === c.cat ? e.amount : 0),
        0
      );
      return {
        label: c.label,
        color: CATEGORY_COLORS[c.cat],
        amount,
        pct: totalAllExpenses > 0 ? (amount / totalAllExpenses) * 100 : 0,
      };
    })
    .filter((c) => c.amount > 0);

  return (
    <div className="flex flex-col w-full pb-10 space-y-4">
      {/* Banner Estado */}
      <section className="bg-[#ffffff] p-4 rounded-2xl shadow-sm space-y-2 border border-[#c6c6cd]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#006c49] animate-pulse"></span>
            <span className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider">
              Cierre en tiempo real
            </span>
          </div>
          <span className="text-xs bg-[#e5eeff] text-[#0b1c30] px-2.5 py-0.5 rounded-full font-bold">
            {monthLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 pt-1">
          <div className="bg-[#eff4ff] p-3 rounded-xl flex flex-col justify-between">
            <span className="text-xs text-[#45464d] flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[15px] text-[#ba1a1a]">trending_down</span>
              Gasto hoy
            </span>
            <div className="mt-1">
              <span className="text-lg font-extrabold text-[#0b1c30] tracking-tight">
                {formatCOP(gastosHoyTotal)}
              </span>
              <span className="block text-[11px] text-[#45464d]">
                {todayExpenses.length} transacciones
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario de Entrada Rápida de Gastos */}
      <section className="bg-[#ffffff] p-4 rounded-2xl shadow-sm space-y-4 border border-[#c6c6cd]/20">
        <div className="flex items-center justify-between pb-1 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#000000] flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px] text-[#ffffff]">add</span>
            </div>
            <h2 className="font-bold text-[1.05rem] text-[#0b1c30]">Registrar Gasto</h2>
          </div>
          <span className="text-xs text-[#006c49] bg-[#6ffbbe]/40 px-2.5 py-0.5 rounded-full font-bold">
            Offline Ready
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input de Importe Gigante */}
          <div className="bg-[#eff4ff] p-4 rounded-2xl flex flex-col items-center justify-center transition-all focus-within:bg-[#e5eeff]">
            <label className="text-xs text-[#45464d] mb-1 font-semibold">
              Monto a desembolsar
            </label>
            <div className="flex items-center justify-center w-full">
              <span className="text-2xl font-bold text-[#45464d] mr-1">$</span>
              <input
                type="number"
                inputMode="numeric"
                step="any"
                min="1"
                required
                placeholder="0"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full text-center text-2xl font-extrabold text-[#0b1c30] bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Selector de Categorías en Chips (solo para gastos de una vez) */}
          {!isRecurring && (
          <div className="space-y-1.5">
            <span className="text-xs text-[#45464d] font-bold">Categoría</span>
            <div className="grid grid-cols-3 gap-1.5">
              {categoriesConfig.map((item) => {
                const isSelected = selectedCategory === item.cat;
                return (
                  <button
                    key={item.cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(item.cat);
                      setSelectedCategoryIcon(item.icon);
                    }}
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-left transition-all active:scale-95 text-xs font-semibold ${
                      isSelected
                        ? 'bg-[#e5eeff] text-[#0b1c30] border border-[#006c49]/40 shadow-xs'
                        : 'bg-[#eff4ff] text-[#45464d] hover:bg-[#e5eeff]'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isSelected ? 'text-[#006c49]' : 'text-[#45464d]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          )}

          {/* Concepto / Glosa */}
          <div className="space-y-1">
            <label className="text-xs text-[#45464d] font-bold">Concepto / Glosa</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#45464d] text-[18px]">
                edit_note
              </span>
              <input
                type="text"
                required
                placeholder="Ej: Almuerzo menú o combustible"
                value={conceptInput}
                onChange={(e) => setConceptInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#eff4ff] rounded-xl text-[#0b1c30] text-sm focus:bg-[#e5eeff] focus:outline-none border-none"
              />
            </div>
          </div>

          {/* Frecuencia: solo esta vez o recurrente mensual */}
          <div className="space-y-1.5">
            <span className="text-xs text-[#45464d] font-bold">Frecuencia</span>
            <div className="grid grid-cols-2 gap-1.5 bg-[#eff4ff] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setIsRecurring(false)}
                className={`py-2 px-1 rounded-lg text-xs font-bold text-center transition-all ${
                  !isRecurring ? 'bg-[#ffffff] text-[#0b1c30] shadow-xs' : 'text-[#45464d]'
                }`}
              >
                Solo esta vez
              </button>
              <button
                type="button"
                onClick={() => setIsRecurring(true)}
                className={`py-2 px-1 rounded-lg text-xs font-bold text-center transition-all ${
                  isRecurring ? 'bg-[#ffffff] text-[#0b1c30] shadow-xs' : 'text-[#45464d]'
                }`}
              >
                Recurrente mensual
              </button>
            </div>

            {isRecurring && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-3 gap-1.5">
                  {KIND_OPTIONS.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setRecurringKind(k.id)}
                      className={`flex items-center gap-1 p-2 rounded-xl text-left text-[11px] font-semibold transition-all active:scale-95 ${
                        recurringKind === k.id
                          ? 'bg-[#e5eeff] text-[#0b1c30] border border-[#006c49]/40'
                          : 'bg-[#eff4ff] text-[#45464d]'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          recurringKind === k.id ? 'text-[#006c49]' : 'text-[#45464d]'
                        }`}
                      >
                        {k.icon}
                      </span>
                      <span className="truncate">{k.label}</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#45464d] font-bold">Día de pago de cada mes (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dayInput}
                    onChange={(e) => setDayInput(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#eff4ff] rounded-xl text-[#0b1c30] text-sm focus:bg-[#e5eeff] focus:outline-none border-none"
                  />
                </div>
                <p className="text-[11px] text-[#45464d]">
                  Se registra el pago de hoy, y cada mes aparecerá en «Gastos Fijos» para que pongas el valor de ese mes.
                </p>
              </div>
            )}
          </div>

          {/* Método de Pago */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#45464d] font-bold">Método de liquidación</span>
              {selectedPaymentMethod === 'credit' && (
                <span className="text-[11px] text-[#ba1a1a] bg-[#ffdad6]/60 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold animate-pulse">
                  <span className="material-symbols-outlined text-[13px]">warning</span>
                  Computa a Deuda
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5 bg-[#eff4ff] p-1 rounded-xl">
              {[
                { id: 'cash' as PaymentMethod, label: 'Efectivo' },
                { id: 'debit' as PaymentMethod, label: 'Débito' },
                { id: 'credit' as PaymentMethod, label: 'T. Crédito' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedPaymentMethod(m.id)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold text-center transition-all ${
                    selectedPaymentMethod === m.id
                      ? 'bg-[#ffffff] text-[#0b1c30] shadow-xs'
                      : 'text-[#45464d]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Botón Primario de Guardado */}
          <button
            type="submit"
            className="w-full h-12 bg-[#006c49] hover:bg-[#005236] text-[#ffffff] rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.985] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            <span>{isRecurring ? 'Guardar Gasto Recurrente' : 'Guardar Gasto Localmente'}</span>
          </button>
        </form>
      </section>

      {/* Gastos fijos (recurrentes mensuales) */}
      <section className="bg-[#ffffff] p-4 rounded-2xl shadow-sm space-y-3 border border-[#c6c6cd]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#006c49]">event_repeat</span>
            <h3 className="font-bold text-[1.05rem] text-[#0b1c30]">Gastos Fijos</h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenModal('nuevo-fijo')}
            className="text-xs font-bold text-[#006c49] bg-[#6ffbbe]/40 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
          >
            + Agregar
          </button>
        </div>

        {servicios.length > 0 && (
          <p className="text-xs text-[#45464d]">
            {fixedPendingCount === 0
              ? 'Todos pagados este mes ✓'
              : `Por pagar este mes: ${formatCOP(fixedPendingTotal)} (${fixedPendingCount})`}
          </p>
        )}

        {servicios.length === 0 ? (
          <p className="text-xs text-[#45464d] bg-[#eff4ff] rounded-xl p-3">
            Aún no tienes gastos fijos. Agrega tus servicios públicos y suscripciones con «+ Agregar», o marca un gasto como
            «Recurrente mensual» al registrarlo.
          </p>
        ) : (
          <div className="space-y-2.5">
            {servicios.map((f) => (
              <div
                key={f.id}
                className={`rounded-xl p-3 border transition-all ${
                  f.paid ? 'border-[#006c49]/25 bg-[#eff4ff]/40' : 'border-[#c6c6cd]/20 bg-[#ffffff]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        f.paid ? 'bg-[#6cf8bb]/40 text-[#006c49]' : 'bg-[#e5eeff] text-[#0b1c30]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{f.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0b1c30] truncate">{f.name}</p>
                      <p className="text-[11px] text-[#45464d] truncate">
                        {f.proveedor} · día {f.dueDay ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-extrabold text-[#0b1c30]">
                      {f.amount > 0 ? formatCOP(f.amount) : 'Sin valor'}
                    </span>
                    <span className="block text-[10px] text-[#45464d]">
                      {f.paid ? 'Pagado' : f.amount > 0 ? 'Último valor' : 'Pon el valor al pagar'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#eff4ff]">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenModal(`editar-fijo:${f.id}`)}
                      className="flex items-center gap-1 text-xs font-semibold text-[#45464d] hover:text-[#0b1c30] p-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFixed(f.id, f.name)}
                      className="flex items-center gap-1 text-xs font-semibold text-[#ba1a1a] hover:opacity-80 p-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      <span>Quitar</span>
                    </button>
                  </div>

                  {f.paid ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#006c49] font-semibold">✓ {f.paidAt || 'Pagado'}</span>
                      <button
                        type="button"
                        onClick={() => undoFixedPayment(f.id)}
                        className="text-[#005236] text-xs font-bold underline hover:opacity-80 p-1"
                      >
                        Deshacer
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenModal(`pagar-fijo:${f.id}`)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#006c49] text-[#ffffff] active:scale-95 transition-transform flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">receipt</span>
                      <span>Pagar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Métrica Visual: Resumen por Categorías */}
      <section className="bg-[#ffffff] p-4 rounded-2xl shadow-sm space-y-2.5 border border-[#c6c6cd]/20">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#0b1c30] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#006c49]">pie_chart</span>
            <span>Distribución del Mes</span>
          </h3>
          <span className="text-xs text-[#45464d] font-medium">
            {formatCOP(totalAllExpenses)} acumulado
          </span>
        </div>

        {/* Barra porcentual segmentada (real) */}
        <div className="w-full h-3.5 bg-[#eff4ff] rounded-full overflow-hidden flex shadow-inner">
          {distribution.map((item) => (
            <div
              key={item.label}
              className="h-full transition-all"
              style={{ width: `${item.pct}%`, backgroundColor: item.color }}
            ></div>
          ))}
        </div>

        {/* Leyenda de Categorías (real) */}
        {distribution.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {distribution.map((item) => (
              <div key={item.label} className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-xs text-[#0b1c30]">
                  {item.label} <strong className="text-[#0b1c30]">{Math.round(item.pct)}%</strong>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#45464d] pt-1">
            Aún no hay gastos. Cuando registres el primero, verás aquí cómo se reparte.
          </p>
        )}
      </section>

      {/* Feed Cronológico de Gastos */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm text-[#0b1c30]">Movimientos Recientes</h3>
          <span className="text-xs text-[#006c49] font-bold">Guardado en este dispositivo</span>
        </div>

        <div className="space-y-3">
          {/* Grupo: Hoy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-[#45464d] font-extrabold uppercase tracking-wider">
                {todayLabel}
              </span>
              <span className="text-xs font-bold text-[#0b1c30]">{formatCOP(todaySum)}</span>
            </div>

            {todayExpenses.length === 0 && (
              <p className="text-xs text-[#45464d] px-1">Aún no has registrado gastos hoy.</p>
            )}

            {todayExpenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-[#ffffff] p-3 rounded-2xl shadow-xs flex items-center justify-between border border-[#c6c6cd]/20 transition-transform active:scale-[0.99]"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#6ffbbe]/40 flex items-center justify-center flex-shrink-0 text-[#006c49]">
                    <span className="material-symbols-outlined text-[20px]">
                      {exp.categoryIcon}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0b1c30] truncate">{exp.concept}</p>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span
                        className={`text-[11px] ${
                          exp.paymentMethod === 'credit'
                            ? 'text-[#ba1a1a] font-semibold'
                            : 'text-[#45464d]'
                        }`}
                      >
                        {exp.detail}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#c6c6cd]"></span>
                      <span className="text-[11px] text-[#45464d]">{exp.timeStr}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pl-2 flex-shrink-0">
                  <span className="text-sm font-extrabold text-[#0b1c30] whitespace-nowrap">
                    -{formatCOP(exp.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteExpense(exp.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#c6c6cd] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Grupo: Ayer */}
          {yesterdayExpenses.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] text-[#45464d] font-extrabold uppercase tracking-wider">
                  {yesterdayLabel}
                </span>
                <span className="text-xs font-bold text-[#45464d]">{formatCOP(yesterdaySum)}</span>
              </div>

              {yesterdayExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-[#ffffff] p-3 rounded-2xl shadow-xs flex items-center justify-between border border-[#c6c6cd]/20 transition-transform active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#e5eeff] flex items-center justify-center flex-shrink-0 text-[#0b1c30]">
                      <span className="material-symbols-outlined text-[20px]">
                        {exp.categoryIcon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0b1c30] truncate">{exp.concept}</p>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-[11px] text-[#45464d]">{exp.detail}</span>
                        <span className="w-1 h-1 rounded-full bg-[#c6c6cd]"></span>
                        <span className="text-[11px] text-[#45464d]">{exp.timeStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pl-2 flex-shrink-0">
                    <span className="text-sm font-extrabold text-[#0b1c30] whitespace-nowrap">
                      -{formatCOP(exp.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteExpense(exp.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#c6c6cd] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
