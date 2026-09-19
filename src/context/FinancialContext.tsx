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

const STORAGE_KEY = 'fincontrol_local_vault_v3';

const INITIAL_DEBTS: CuotaObligacion[] = [
  {
    id: 'bancolombia-libre',
    name: 'Crédito de Libre Inversión',
    entity: 'Bancolombia',
    rateInfo: 'Tasa 1.6% M.V.',
    icon: 'assured_workload',
    currentInstallment: 13,
    totalInstallments: 36,
    installmentAmount: 380000,
    initialAmount: 10000000,
    remainingBalance: 6700000,
    amortizedPct: 33,
    dueDate: '28 de Octubre',
    dueDaysNotice: 'En 3 días',
    dueDaysCount: 3,
    paymentWindowNotice: 'Habilitado para pagar del 25 al 30 de cada mes',
    status: 'active',
    isWindowActive: true,
    paidThisMonth: false,
    ruleDaysBefore: 5,
  },
  {
    id: 'bancolombia-prestamo',
    name: 'Préstamo Bancolombia',
    entity: 'Bancolombia',
    rateInfo: 'Cuota fija mensual',
    icon: 'account_balance',
    currentInstallment: 8,
    totalInstallments: 24,
    installmentAmount: 245000,
    initialAmount: 5880000,
    remainingBalance: 3920000,
    amortizedPct: 33.3,
    dueDate: '28 de Octubre',
    dueDaysNotice: 'En 3 días',
    dueDaysCount: 3,
    paymentWindowNotice: 'Habilitado para pagar del 23 al 28 de cada mes',
    status: 'active',
    isWindowActive: true,
    paidThisMonth: false,
    ruleDaysBefore: 5,
  },
  {
    id: 'visa-clasica',
    name: 'Tarjeta Visa Clásica',
    entity: 'Banco de Bogotá',
    rateInfo: 'Pago Mínimo del Mes',
    icon: 'credit_card',
    currentInstallment: 1,
    totalInstallments: 1,
    installmentAmount: 120000,
    initialAmount: 120000,
    remainingBalance: 120000,
    amortizedPct: 0,
    dueDate: '31 de Octubre',
    dueDaysNotice: 'En 6 días',
    dueDaysCount: 6,
    paymentWindowNotice: 'Habilitado para pagar del 25 al 31 de cada mes',
    status: 'active',
    isWindowActive: true,
    paidThisMonth: false,
    ruleDaysBefore: 5,
  },
  {
    id: 'prestamo-vehicular',
    name: 'Préstamo Vehicular',
    entity: 'Banco de Occidente • Plazo 48M',
    rateInfo: 'Tasa 1.2% M.V.',
    icon: 'directions_car',
    currentInstallment: 20,
    totalInstallments: 48,
    installmentAmount: 520000,
    initialAmount: 24960000,
    remainingBalance: 14560000,
    amortizedPct: 41.6,
    dueDate: '10 de Noviembre',
    dueDaysNotice: 'Faltan 9 días',
    dueDaysCount: 9,
    paymentWindowNotice: 'Próxima cuota se habilita el 05 Nov (Faltan 9 días)',
    status: 'waiting',
    isWindowActive: false,
    paidThisMonth: false,
    ruleDaysBefore: 5,
  },
  {
    id: 'electrodomestico-falabella',
    name: 'Electrodoméstico Falabella',
    entity: 'Tarjeta CMR • Cero Interés',
    rateInfo: 'Cuotas sin interés',
    icon: 'tv',
    currentInstallment: 5,
    totalInstallments: 6,
    installmentAmount: 85000,
    initialAmount: 510000,
    remainingBalance: 85000,
    amortizedPct: 83.3,
    dueDate: '15 de Octubre',
    dueDaysNotice: 'Al día',
    dueDaysCount: 0,
    paymentWindowNotice: 'Ciclo cerrado',
    status: 'up-to-date',
    isWindowActive: false,
    paidThisMonth: true,
    paidDate: '15 Oct',
    paidAmount: 85000,
    ruleDaysBefore: 5,
  },
];

const INITIAL_SERVICIOS: ServicioPublico[] = [
  {
    id: 'agua',
    name: 'Agua y Alcantarillado',
    proveedor: 'EPM / Acueducto',
    icon: 'water_drop',
    amount: 68000,
    dueDate: '25 de Octubre',
    dueDaysNotice: 'En 1 día',
    paid: false,
  },
  {
    id: 'energia',
    name: 'Energía Eléctrica',
    proveedor: 'Codensa / Enel',
    icon: 'bolt',
    amount: 94000,
    dueDate: '27 de Octubre',
    dueDaysNotice: 'En 3 días',
    paid: false,
  },
  {
    id: 'gas',
    name: 'Gas Natural',
    proveedor: 'Vanti Gas Natural',
    icon: 'mode_heat',
    amount: 32000,
    dueDate: '29 de Octubre',
    dueDaysNotice: 'En 5 días',
    paid: false,
  },
  {
    id: 'internet',
    name: 'Internet Fibra Óptica',
    proveedor: 'Claro Hogar 300MB',
    icon: 'wifi',
    amount: 89900,
    dueDate: '02 de Noviembre',
    dueDaysNotice: 'En 9 días',
    paid: false,
  },
  {
    id: 'movil',
    name: 'Plan Móvil Pospago',
    proveedor: 'Tigo Ilimitado',
    icon: 'smartphone',
    amount: 45000,
    dueDate: '05 de Noviembre',
    dueDaysNotice: 'En 12 días',
    paid: false,
  },
];

const INITIAL_EXPENSES: GastoItem[] = [
  {
    id: 'exp-1',
    concept: 'Supermercado Éxito',
    category: 'Alimentación',
    categoryIcon: 'shopping_cart',
    amount: 22000,
    paymentMethod: 'debit',
    dateGroup: 'hoy',
    timeStr: '11:20 AM',
    detail: 'Víveres del hogar',
    active: true,
  },
  {
    id: 'exp-2',
    concept: 'Café de la Mañana',
    category: 'Alimentación',
    categoryIcon: 'local_cafe',
    amount: 4500,
    paymentMethod: 'cash',
    dateGroup: 'hoy',
    timeStr: '08:15 AM',
    detail: 'Gasto personal',
    active: true,
  },
  {
    id: 'exp-3',
    concept: 'Transporte Metro',
    category: 'Transporte',
    categoryIcon: 'directions_subway',
    amount: 8000,
    paymentMethod: 'cash',
    dateGroup: 'hoy',
    timeStr: '07:45 AM',
    detail: 'Recarga tarjeta cívica',
    active: true,
  },
  {
    id: 'exp-4',
    concept: 'Supermercado Líder',
    category: 'Hogar',
    categoryIcon: 'shopping_cart',
    amount: 52400,
    paymentMethod: 'debit',
    dateGroup: 'ayer',
    timeStr: '19:10 PM',
    detail: 'Débito Banco',
    active: true,
  },
  {
    id: 'exp-5',
    concept: 'Carga Tarjeta Metro',
    category: 'Transporte',
    categoryIcon: 'directions_subway',
    amount: 6500,
    paymentMethod: 'cash',
    dateGroup: 'ayer',
    timeStr: '08:05 AM',
    detail: 'Efectivo',
    active: true,
  },
];

const INITIAL_SAVINGS: AhorroMeta[] = [
  {
    id: 'meta-1',
    title: 'Fondo de Emergencia',
    purpose: 'Cubrir 3 meses de gastos esenciales ante cualquier eventualidad médica o laboral',
    targetAmount: 3000000,
    currentAmount: 1250000,
    targetDate: '2025-06-30',
    icon: 'health_and_safety',
    color: '#006c49',
    category: 'emergencia',
    notes: 'Aportar mínimo $200.000 quincenales en cuenta de alto rendimiento.',
    createdAt: '2024-09-01',
    history: [
      { id: 'h-1', amount: 500000, date: '01 Sep', note: 'Aporte inicial', type: 'deposit' },
      { id: 'h-2', amount: 450000, date: '15 Sep', note: 'Ahorro quincenal', type: 'deposit' },
      { id: 'h-3', amount: 300000, date: '01 Oct', note: 'Ahorro mensual', type: 'deposit' },
    ],
  },
  {
    id: 'meta-2',
    title: 'Vacaciones Fin de Año',
    purpose: 'Viaje a Santa Marta con tiquetes, hospedaje y tours pagados sin endeudarse',
    targetAmount: 2200000,
    currentAmount: 1400000,
    targetDate: '2024-12-15',
    icon: 'flight_takeoff',
    color: '#005236',
    category: 'viajes',
    notes: 'Meta al 63%. Falta poco para completar tiquetes.',
    createdAt: '2024-08-10',
    history: [
      { id: 'h-4', amount: 700000, date: '15 Ago', note: 'Primera cuota tiquetes', type: 'deposit' },
      { id: 'h-5', amount: 700000, date: '30 Sep', note: 'Ahorro hospedaje', type: 'deposit' },
    ],
  },
  {
    id: 'meta-3',
    title: 'Nueva Laptop de Trabajo',
    purpose: 'Renovación de equipo portátil para mayor productividad y rendimiento',
    targetAmount: 3500000,
    currentAmount: 850000,
    targetDate: '2025-04-15',
    icon: 'laptop_mac',
    color: '#131b2e',
    category: 'tecnologia',
    notes: 'Ahorro programado con aportes de proyectos extra.',
    createdAt: '2024-10-01',
    history: [
      { id: 'h-6', amount: 850000, date: '05 Oct', note: 'Ingreso freelance', type: 'deposit' },
    ],
  },
];

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<TabType>('inicio');
  const [balance, setBalance] = useState<number>(1820500);
  const [pagadoMes, setPagadoMes] = useState<number>(315000);
  const [compromisoTotal, setCompromisoTotal] = useState<number>(485000);
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

  const resetToDefaultState = () => {
    setBalance(1820500);
    setPagadoMes(315000);
    setCompromisoTotal(485000);
    setDebts(INITIAL_DEBTS);
    setServicios(INITIAL_SERVICIOS);
    setExpenses(INITIAL_EXPENSES);
    setSavings(INITIAL_SAVINGS);
    setWindowRuleDays(5);
    setAutoCloseOverdue(true);
    localStorage.removeItem(STORAGE_KEY);
    showNotification('Datos restablecidos', 'Se han recargado los datos de demostración originales.');
  };

  return (
    <FinancialContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        balance,
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
