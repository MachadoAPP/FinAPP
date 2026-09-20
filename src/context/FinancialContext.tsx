import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CuotaObligacion, ServicioPublico, GastoItem, TabType, SimulationParams, AhorroMeta } from '../types';
import { calculateSimulation } from '../utils/finance';

interface ToastState {
  show: boolean;
  title: string;
  desc: string;
}

interface FinancialContextType {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  balance: number;
  setBalance: (value: number) => void;
  porPagarMes: number;
  gastosHoyTotal: number;
  pagadoMes: number;
  compromisoTotal: number;
  debts: CuotaObligacion[];
  servicios: ServicioPublico[];
  expenses: GastoItem[];
  savings: AhorroMeta[];
  simulationParams: SimulationParams;
  setSimulationParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  windowRuleDays: number;
  setWindowRuleDays: (days: number) => void;
  autoCloseOverdue: boolean;
  setAutoCloseOverdue: (val: boolean) => void;
  toast: ToastState;
  showNotification: (title: string, desc: string) => void;
  markDebtPaid: (debtId: string, customDate?: string) => void;
  undoDebtPayment: (debtId: string) => void;
  payService: (serviceId: string) => void;
  addExpense: (expense: {
    concept: string;
    amount: number;
    category: GastoItem['category'];
    categoryIcon: string;
    paymentMethod: GastoItem['paymentMethod'];
    detail?: string;
  }) => void;
  toggleExpense: (id: string) => void;
  deleteExpense: (id: string) => void;
  addNewDebt: (newDebt: {
    name: string;
    entity: string;
    totalAmount: number;
    totalInstallments: number;
    installmentAmount: number;
    paymentDay: number;
  }) => void;
  deleteDebt: (debtId: string) => void;
  updateDebt: (
    debtId: string,
    data: {
      name: string;
      entity: string;
      totalAmount: number;
      totalInstallments: number;
      installmentAmount: number;
      paymentDay: number;
    }
  ) => void;
  saveSimulationAsDebt: (conceptName?: string) => void;
  addSavingMeta: (newGoal: {
    title: string;
    purpose: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate?: string;
    icon?: string;
    color?: string;
    category: AhorroMeta['category'];
    notes?: string;
  }) => void;
  updateSavingMeta: (goalId: string, updated: Partial<AhorroMeta>) => void;
  deleteSavingMeta: (goalId: string) => void;
  depositToSaving: (goalId: string, amount: number, note?: string) => void;
  withdrawFromSaving: (goalId: string, amount: number, note?: string) => void;
  resetToDefaultState: () => void;
  triggerConfetti: (targetElem?: HTMLElement | null) => void;
}

// Version nueva de la llave: los datos de demostracion guardados antes (v3)
// se ignoran y se borran, asi la app arranca vacia en cualquier dispositivo.
const STORAGE_KEY = 'fincontrol_local_vault_v4';
const OLD_STORAGE_KEY = 'fincontrol_local_vault_v3';

// Estado inicial: todo en cero, sin datos de ejemplo.
const INITIAL_DEBTS: CuotaObligacion[] = [];
const INITIAL_SERVICIOS: ServicioPublico[] = [];
const INITIAL_EXPENSES: GastoItem[] = [];
const INITIAL_SAVINGS: AhorroMeta[] = [];

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<TabType>('inicio');
  const [balance, setBalance] = useState<number>(0);
  const [pagadoMes, setPagadoMes] = useState<number>(0);
  const [compromisoTotal, setCompromisoTotal] = useState<number>(0);
  const [debts, setDebts] = useState<CuotaObligacion[]>(INITIAL_DEBTS);
  const [servicios, setServicios] = useState<ServicioPublico[]>(INITIAL_SERVICIOS);
  const [expenses, setExpenses] = useState<GastoItem[]>(INITIAL_EXPENSES);
  const [savings, setSavings] = useState<AhorroMeta[]>(INITIAL_SAVINGS);
  const [windowRuleDays, setWindowRuleDays] = useState<number>(5);
  const [autoCloseOverdue, setAutoCloseOverdue] = useState<boolean>(true);

  // Simulation default parameters
  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    amount: 5000000,
    termMonths: 24,
    rate: 1.8,
    rateType: 'EM',
    amortizationSystem: 'frances',
    paymentDay: '15',
  });

  const [toast, setToast] = useState<ToastState>({
    show: false,
    title: '',
    desc: '',
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // Borra los datos de demostracion de la version anterior
      localStorage.removeItem(OLD_STORAGE_KEY);

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.balance !== undefined) setBalance(parsed.balance);
        if (parsed.pagadoMes !== undefined) setPagadoMes(parsed.pagadoMes);
        if (parsed.compromisoTotal !== undefined) setCompromisoTotal(parsed.compromisoTotal);
        if (parsed.debts) setDebts(parsed.debts);
        if (parsed.servicios) setServicios(parsed.servicios);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.savings) setSavings(parsed.savings);
        if (parsed.windowRuleDays) setWindowRuleDays(parsed.windowRuleDays);
        if (parsed.autoCloseOverdue !== undefined) setAutoCloseOverdue(parsed.autoCloseOverdue);
        if (parsed.simulationParams) setSimulationParams(parsed.simulationParams);
      }
    } catch (e) {
      console.error('Error loading localStorage state', e);
    }
  }, []);

  // Save to localStorage when critical values change
  useEffect(() => {
    try {
      const stateToSave = {
        balance,
        pagadoMes,
        compromisoTotal,
        debts,
        servicios,
        expenses,
        savings,
        windowRuleDays,
        autoCloseOverdue,
        simulationParams,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Error saving state to localStorage', e);
    }
  }, [balance, pagadoMes, compromisoTotal, debts, servicios, expenses, savings, windowRuleDays, autoCloseOverdue, simulationParams]);

  // Derived metrics
  const porPagarMes = debts
    .filter((d) => d.status === 'active' && !d.paidThisMonth)
    .reduce((sum, d) => sum + d.installmentAmount, 0) +
    servicios.filter(s => !s.paid).reduce((sum, s) => sum + s.amount, 0);

  const gastosHoyTotal = expenses
    .filter((e) => e.active && e.dateGroup === 'hoy')
    .reduce((sum, e) => sum + e.amount, 0);

  const showNotification = (title: string, desc: string) => {
    setToast({ show: true, title, desc });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const triggerConfetti = (targetElem?: HTMLElement | null) => {
    const colors = ['#006c49', '#6cf8bb', '#000000', '#dae2fd', '#4edea3', '#7073ff'];
    const rect = targetElem ? targetElem.getBoundingClientRect() : {
      left: window.innerWidth / 2,
      top: window.innerHeight / 2,
      width: 0,
      height: 0,
    };

    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      const angle = (Math.PI * 2 * i) / 24;
      const distance = 40 + Math.random() * 55;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 30;
      p.style.setProperty('--tx', `${tx}px`);
      p.style.setProperty('--ty', `${ty}px`);
      p.style.left = `${rect.left + rect.width / 2}px`;
      p.style.top = `${rect.top + rect.height / 2}px`;
      p.style.position = 'fixed';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 950);
    }
  };

  const markDebtPaid = (debtId: string, customDate?: string) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId && !d.paidThisMonth) {
          const paidDate = customDate || 'hoy';
          return {
            ...d,
            paidThisMonth: true,
            status: 'up-to-date',
            paidDate,
            paidAmount: d.installmentAmount,
            remainingBalance: Math.max(0, d.remainingBalance - d.installmentAmount),
            amortizedPct: Math.min(
              100,
              Math.round(((d.initialAmount - (d.remainingBalance - d.installmentAmount)) / d.initialAmount) * 100)
            ),
          };
        }
        return d;
      })
    );

    const debt = debts.find((d) => d.id === debtId);
    if (debt) {
      setBalance((b) => Math.max(0, b - debt.installmentAmount));
      setPagadoMes((p) => p + debt.installmentAmount);
      showNotification('¡Cuota pagada con éxito!', `${debt.name} (${debt.installmentAmount.toLocaleString('es-CO')}) registrada.`);
    }
  };

  const undoDebtPayment = (debtId: string) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt || !debt.paidThisMonth) return;

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          return {
            ...d,
            paidThisMonth: false,
            status: 'active',
            paidDate: undefined,
            paidAmount: undefined,
            remainingBalance: d.remainingBalance + d.installmentAmount,
          };
        }
        return d;
      })
    );

    setBalance((b) => b + debt.installmentAmount);
    setPagadoMes((p) => Math.max(0, p - debt.installmentAmount));
    showNotification('Pago revertido', `${debt.name} ha vuelto al estado pendiente.`);
  };

  const payService = (serviceId: string) => {
    const service = servicios.find((s) => s.id === serviceId);
    if (!service || service.paid) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setServicios((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, paid: true, paidAt: `hoy a las ${timeStr}` } : s))
    );

    setBalance((b) => Math.max(0, b - service.amount));
    setPagadoMes((p) => p + service.amount);
    showNotification('¡Servicio Pagado!', `${service.name} ($${service.amount.toLocaleString('es-CO')}) cancelado con éxito.`);
  };

  const addExpense = (newExp: {
    concept: string;
    amount: number;
    category: GastoItem['category'];
    categoryIcon: string;
    paymentMethod: GastoItem['paymentMethod'];
    detail?: string;
  }) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${mins}`;

    const item: GastoItem = {
      id: 'exp-' + Date.now(),
      concept: newExp.concept,
      amount: newExp.amount,
      category: newExp.category,
      categoryIcon: newExp.categoryIcon,
      paymentMethod: newExp.paymentMethod,
      dateGroup: 'hoy',
      timeStr,
      detail: newExp.detail || 'Gasto registrado',
      active: true,
    };

    setExpenses((prev) => [item, ...prev]);
    setBalance((b) => Math.max(0, b - newExp.amount));
    showNotification('¡Gasto registrado!', `${item.concept} (-$${item.amount.toLocaleString('es-CO')}) guardado localmente.`);
  };

  const toggleExpense = (id: string) => {
    const item = expenses.find((e) => e.id === id);
    if (!item) return;

    const nextActive = !item.active;
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, active: nextActive } : e))
    );

    if (!nextActive) {
      setBalance((b) => b + item.amount);
      showNotification('Gasto anulado', `Se restablecieron $${item.amount.toLocaleString('es-CO')} al balance.`);
    } else {
      setBalance((b) => Math.max(0, b - item.amount));
      showNotification('Gasto reactivado', `Se dedujeron $${item.amount.toLocaleString('es-CO')} del balance.`);
    }
  };

  const deleteExpense = (id: string) => {
    const item = expenses.find((e) => e.id === id);
    if (!item) return;

    if (item.active) {
      setBalance((b) => b + item.amount);
    }
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showNotification('Gasto eliminado', `${item.concept} removido del historial.`);
  };

  const addNewDebt = (newDebt: {
    name: string;
    entity: string;
    totalAmount: number;
    totalInstallments: number;
    installmentAmount: number;
    paymentDay: number;
  }) => {
    const debtObj: CuotaObligacion = {
      id: 'debt-' + Date.now(),
      name: newDebt.name,
      entity: newDebt.entity || 'Entidad Financiera',
      rateInfo: 'Crédito registrado',
      icon: 'post_add',
      currentInstallment: 1,
      totalInstallments: newDebt.totalInstallments,
      installmentAmount: newDebt.installmentAmount,
      initialAmount: newDebt.totalAmount,
      remainingBalance: newDebt.totalAmount,
      amortizedPct: 0,
      dueDate: `Día ${newDebt.paymentDay} de cada mes`,
      dueDaysNotice: 'Próximo corte',
      dueDaysCount: 5,
      paymentWindowNotice: `Habilitado 5 días antes del corte (Día ${newDebt.paymentDay})`,
      status: 'active',
      isWindowActive: true,
      paidThisMonth: false,
      ruleDaysBefore: windowRuleDays,
    };

    setDebts((prev) => [debtObj, ...prev]);
    setCompromisoTotal((c) => c + newDebt.installmentAmount);
    showNotification('¡Obligación Creada!', `${newDebt.name} añadida a tus compromisos activos.`);
  };

  // Elimina una obligacion. Si ya estaba pagada este mes, su cuota tambien se resta de lo
  // "pagado en el mes", y el compromiso mensual baja por el valor de su cuota.
  // El saldo no se toca: hoy la app no lleva el registro exacto de lo que descontó cada pago.
  const deleteDebt = (debtId: string) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return;

    setDebts((prev) => prev.filter((d) => d.id !== debtId));
    setCompromisoTotal((c) => Math.max(0, c - debt.installmentAmount));

    if (debt.paidThisMonth) {
      setPagadoMes((p) => Math.max(0, p - debt.installmentAmount));
    }

    showNotification('Obligación eliminada', `${debt.name} fue eliminada de tus compromisos.`);
  };

  // Edita una obligacion que NO esta pagada este mes (si esta pagada, primero se deshace el pago).
  // Lo ya amortizado se conserva: al cambiar el monto total, el saldo se recalcula con eso.
  const updateDebt = (
    debtId: string,
    data: {
      name: string;
      entity: string;
      totalAmount: number;
      totalInstallments: number;
      installmentAmount: number;
      paymentDay: number;
    }
  ) => {
    const old = debts.find((d) => d.id === debtId);
    if (!old) return;

    if (old.paidThisMonth) {
      showNotification('Primero deshaz el pago', 'Esta obligación está pagada este mes. Pulsa "Deshacer" y luego edítala.');
      return;
    }

    const amortizedAmount = Math.max(0, old.initialAmount - old.remainingBalance);
    const newRemaining = Math.max(0, data.totalAmount - amortizedAmount);
    const newPct =
      data.totalAmount > 0
        ? Math.min(100, Math.round(((data.totalAmount - newRemaining) / data.totalAmount) * 1000) / 10)
        : 0;

    setDebts((prev) =>
      prev.map((d) =>
        d.id === debtId
          ? {
              ...d,
              name: data.name,
              entity: data.entity || 'Entidad Financiera',
              totalInstallments: data.totalInstallments,
              currentInstallment: Math.min(d.currentInstallment, data.totalInstallments),
              installmentAmount: data.installmentAmount,
              initialAmount: data.totalAmount,
              remainingBalance: newRemaining,
              amortizedPct: newPct,
              dueDate: `Día ${data.paymentDay} de cada mes`,
              paymentWindowNotice: `Habilitado ${d.ruleDaysBefore ?? windowRuleDays} días antes del corte (Día ${data.paymentDay})`,
            }
          : d
      )
    );

    setCompromisoTotal((c) => Math.max(0, c + (data.installmentAmount - old.installmentAmount)));
    showNotification('Obligación actualizada', `${data.name} se guardó con los cambios.`);
  };

  const saveSimulationAsDebt = (conceptName?: string) => {
    const simResult = calculateSimulation(simulationParams);
    const name = conceptName || `Crédito Simulado ($${(simulationParams.amount / 1000000).toFixed(1)}M)`;

    const newObligation: CuotaObligacion = {
      id: 'sim-debt-' + Date.now(),
      name,
      entity: `Simulador Pro • ${simulationParams.rate}% ${simulationParams.rateType}`,
      rateInfo: `Sistema ${simulationParams.amortizationSystem === 'frances' ? 'Francés (Cuota Fija)' : 'Alemán (Abono Fijo)'}`,
      icon: 'calculate',
      currentInstallment: 1,
      totalInstallments: simulationParams.termMonths,
      installmentAmount: simResult.monthlyInstallment,
      initialAmount: simulationParams.amount,
      remainingBalance: simulationParams.amount,
      amortizedPct: 0,
      dueDate: `Día ${simulationParams.paymentDay} del mes`,
      dueDaysNotice: 'Ventana activa',
      dueDaysCount: 4,
      paymentWindowNotice: `Habilitado para pagar del 10 al ${simulationParams.paymentDay}`,
      status: 'active',
      isWindowActive: true,
      paidThisMonth: false,
      ruleDaysBefore: windowRuleDays,
    };

    setDebts((prev) => [newObligation, ...prev]);
    setCompromisoTotal((c) => c + simResult.monthlyInstallment);
    showNotification('¡Deuda Agregada!', `${name} transferida a Deudas con cuota de $${simResult.monthlyInstallment.toLocaleString('es-CO')}.`);
  };

  const addSavingMeta = (newGoal: {
    title: string;
    purpose: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate?: string;
    icon?: string;
    color?: string;
    category: AhorroMeta['category'];
    notes?: string;
  }) => {
    const goal: AhorroMeta = {
      id: 'meta-' + Date.now(),
      title: newGoal.title,
      purpose: newGoal.purpose,
      targetAmount: Math.max(1000, newGoal.targetAmount),
      currentAmount: Math.max(0, newGoal.currentAmount || 0),
      targetDate: newGoal.targetDate,
      icon: newGoal.icon || 'savings',
      color: newGoal.color || '#006c49',
      category: newGoal.category || 'otro',
      notes: newGoal.notes,
      createdAt: new Date().toISOString().split('T')[0],
      history: newGoal.currentAmount && newGoal.currentAmount > 0
        ? [
            {
              id: 'h-' + Date.now(),
              amount: newGoal.currentAmount,
              date: 'Hoy',
              note: 'Monto inicial registrado',
              type: 'deposit',
            },
          ]
        : [],
    };

    setSavings((prev) => [goal, ...prev]);
    showNotification('¡Meta de Ahorro Creada!', `"${goal.title}" se agregó con objetivo de $${goal.targetAmount.toLocaleString('es-CO')}.`);
  };

  const updateSavingMeta = (goalId: string, updated: Partial<AhorroMeta>) => {
    setSavings((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          return { ...g, ...updated };
        }
        return g;
      })
    );
    showNotification('Meta Actualizada', 'Los cambios se guardaron correctamente en tu dispositivo.');
  };

  const deleteSavingMeta = (goalId: string) => {
    const goal = savings.find((g) => g.id === goalId);
    setSavings((prev) => prev.filter((g) => g.id !== goalId));
    showNotification('Meta eliminada', `La meta "${goal?.title || ''}" ha sido removida.`);
  };

  const depositToSaving = (goalId: string, amount: number, note?: string) => {
    if (amount <= 0) return;
    setSavings((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newCurrent = g.currentAmount + amount;
          const newHistory = [
            {
              id: 'h-' + Date.now(),
              amount,
              date: 'Hoy',
              note: note || 'Aporte a la meta',
              type: 'deposit' as const,
            },
            ...(g.history || []),
          ];
          return {
            ...g,
            currentAmount: newCurrent,
            history: newHistory,
          };
        }
        return g;
      })
    );

    const goal = savings.find((g) => g.id === goalId);
    showNotification(
      '¡Aporte Registrado!',
      `Sumaste $${amount.toLocaleString('es-CO')} a "${goal?.title || 'tu meta'}".`
    );
  };

  const withdrawFromSaving = (goalId: string, amount: number, note?: string) => {
    if (amount <= 0) return;
    setSavings((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newCurrent = Math.max(0, g.currentAmount - amount);
          const newHistory = [
            {
              id: 'h-' + Date.now(),
              amount,
              date: 'Hoy',
              note: note || 'Retiro de fondos',
              type: 'withdraw' as const,
            },
            ...(g.history || []),
          ];
          return {
            ...g,
            currentAmount: newCurrent,
            history: newHistory,
          };
        }
        return g;
      })
    );

    const goal = savings.find((g) => g.id === goalId);
    showNotification(
      'Retiro Registrado',
      `Retiraste $${amount.toLocaleString('es-CO')} de "${goal?.title || 'tu meta'}".`
    );
  };

  // Ahora "restablecer" deja la app completamente vacia (ya no hay datos de demostracion).
  const resetToDefaultState = () => {
    setBalance(0);
    setPagadoMes(0);
    setCompromisoTotal(0);
    setDebts(INITIAL_DEBTS);
    setServicios(INITIAL_SERVICIOS);
    setExpenses(INITIAL_EXPENSES);
    setSavings(INITIAL_SAVINGS);
    setWindowRuleDays(5);
    setAutoCloseOverdue(true);
    localStorage.removeItem(STORAGE_KEY);
    showNotification('Datos borrados', 'La app quedó vacía y lista para empezar de nuevo.');
  };

  return (
    <FinancialContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        balance,
        setBalance,
        porPagarMes,
        gastosHoyTotal,
        pagadoMes,
        compromisoTotal,
        debts,
        servicios,
        expenses,
        savings,
        simulationParams,
        setSimulationParams,
        windowRuleDays,
        setWindowRuleDays,
        autoCloseOverdue,
        setAutoCloseOverdue,
        toast,
        showNotification,
        markDebtPaid,
        undoDebtPayment,
        payService,
        addExpense,
        toggleExpense,
        deleteExpense,
        addNewDebt,
        deleteDebt,
        updateDebt,
        saveSimulationAsDebt,
        addSavingMeta,
        updateSavingMeta,
        deleteSavingMeta,
        depositToSaving,
        withdrawFromSaving,
        resetToDefaultState,
        triggerConfetti,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
