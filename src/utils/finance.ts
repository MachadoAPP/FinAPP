import { AmortizationRow, SimulationParams, SimulationResult } from '../types';

export function formatCOP(val: number): string {
  if (isNaN(val)) return '$0';
  return '$' + Math.round(val).toLocaleString('es-CO');
}

export function formatCOPPlain(val: number): string {
  if (isNaN(val)) return '0';
  return Math.round(val).toLocaleString('es-CO');
}

export function calculateSimulation(params: SimulationParams): SimulationResult {
  const { amount, termMonths, rate, rateType, amortizationSystem, paymentDay } = params;

  if (amount <= 0 || termMonths <= 0) {
    return {
      monthlyInstallment: 0,
      totalInterest: 0,
      totalCost: 0,
      capitalPct: 100,
      interestPct: 0,
      effectiveMonthlyRate: 0,
      schedule: [],
    };
  }

  // Calculate monthly effective rate (decimal)
  let i = 0;
  if (rateType === 'EA') {
    // i_mensual = (1 + EA)^(1/12) - 1
    i = Math.pow(1 + rate / 100, 1 / 12) - 1;
  } else {
    // E.M.
    i = rate / 100;
  }

  const schedule: AmortizationRow[] = [];
  let remainingBalance = amount;
  let totalInterest = 0;
  let firstInstallment = 0;

  const dayNum = parseInt(paymentDay, 10) || 15;
  const now = new Date();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  if (amortizationSystem === 'frances') {
    // Cuota fija
    const cuota = i > 0
      ? (amount * (i * Math.pow(1 + i, termMonths))) / (Math.pow(1 + i, termMonths) - 1)
      : amount / termMonths;
    
    firstInstallment = cuota;

    for (let m = 1; m <= termMonths; m++) {
      const interestMonth = remainingBalance * i;
      let capitalMonth = cuota - interestMonth;

      if (m === termMonths || capitalMonth > remainingBalance) {
        capitalMonth = remainingBalance;
      }
      remainingBalance = Math.max(0, remainingBalance - capitalMonth);
      totalInterest += interestMonth;

      // Project date:
      const projDate = new Date(now.getFullYear(), now.getMonth() + m, dayNum);
      const dateStr = `${dayNum} ${months[projDate.getMonth()]} ${projDate.getFullYear()}`;

      schedule.push({
        installmentNumber: m,
        dateStr,
        capital: Math.round(capitalMonth),
        interest: Math.round(interestMonth),
        remainingBalance: Math.round(remainingBalance),
      });
    }
  } else {
    // Alemán: Abono fijo a capital
    const abonoCapital = amount / termMonths;

    for (let m = 1; m <= termMonths; m++) {
      const interestMonth = remainingBalance * i;
      const capitalMonth = Math.min(abonoCapital, remainingBalance);
      const cuotaMonth = capitalMonth + interestMonth;

      if (m === 1) {
        firstInstallment = cuotaMonth;
      }

      remainingBalance = Math.max(0, remainingBalance - capitalMonth);
      totalInterest += interestMonth;

      const projDate = new Date(now.getFullYear(), now.getMonth() + m, dayNum);
      const dateStr = `${dayNum} ${months[projDate.getMonth()]} ${projDate.getFullYear()}`;

      schedule.push({
        installmentNumber: m,
        dateStr,
        capital: Math.round(capitalMonth),
        interest: Math.round(interestMonth),
        remainingBalance: Math.round(remainingBalance),
      });
    }
  }

  const totalCost = amount + totalInterest;
  const capitalPct = totalCost > 0 ? (amount / totalCost) * 100 : 100;
  const interestPct = totalCost > 0 ? (totalInterest / totalCost) * 100 : 0;

  return {
    monthlyInstallment: Math.round(firstInstallment),
    totalInterest: Math.round(totalInterest),
    totalCost: Math.round(totalCost),
    capitalPct: Math.round(capitalPct * 10) / 10,
    interestPct: Math.round(interestPct * 10) / 10,
    effectiveMonthlyRate: i * 100,
    schedule,
  };
}
