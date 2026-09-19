export type TabType = 'inicio' | 'deudas' | 'ahorro' | 'calculadora' | 'gastos';

export type DebtStatus = 'active' | 'waiting' | 'up-to-date' | 'closed';

export interface CuotaObligacion {
  id: string;
  name: string;
  entity: string;
  rateInfo: string;
  icon: string;
  currentInstallment: number;
  totalInstallments: number;
  installmentAmount: number;
  initialAmount: number;
  remainingBalance: number;
  amortizedPct: number;
  dueDate: string;
  dueDaysNotice: string;
  dueDaysCount: number;
  paymentWindowNotice: string;
  status: DebtStatus;
  isWindowActive: boolean;
  paidThisMonth: boolean;
  paidDate?: string;
  paidAmount?: number;
  receiptNote?: string;
  ruleDaysBefore?: number;
}

export interface ServicioPublico {
  id: string;
  name: string;
  proveedor: string;
  icon: string;
  amount: number;
  dueDate: string;
  dueDaysNotice: string;
  paid: boolean;
  paidAt?: string;
}

export type ExpenseCategory = 'Alimentación' | 'Transporte' | 'Hogar' | 'Salud' | 'Ocio' | 'Otros';

export type PaymentMethod = 'cash' | 'debit' | 'credit';

export interface GastoItem {
  id: string;
  concept: string;
  category: ExpenseCategory;
  categoryIcon: string;
  amount: number;
  paymentMethod: PaymentMethod;
  dateGroup: 'hoy' | 'ayer' | 'anteriores';
  timeStr: string;
  detail?: string;
  active: boolean;
}

export interface AmortizationRow {
  installmentNumber: number;
  dateStr: string;
  capital: number;
  interest: number;
  remainingBalance: number;
}

export interface SimulationParams {
  amount: number;
  termMonths: number;
  rate: number;
  rateType: 'EM' | 'EA';
  amortizationSystem: 'frances' | 'aleman';
  paymentDay: string;
}

export interface SimulationResult {
  monthlyInstallment: number;
  totalInterest: number;
  totalCost: number;
  capitalPct: number;
  interestPct: number;
  effectiveMonthlyRate: number;
  schedule: AmortizationRow[];
}

export interface AhorroAbono {
  id: string;
  amount: number;
  date: string;
  note?: string;
  type: 'deposit' | 'withdraw';
}

export interface AhorroMeta {
  id: string;
  title: string;
  purpose: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  icon: string;
  color: string;
  category: 'viajes' | 'emergencia' | 'educacion' | 'hogar' | 'vehiculo' | 'tecnologia' | 'otro';
  notes?: string;
  history?: AhorroAbono[];
  createdAt: string;
}
