import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { AhorroMeta } from '../../types';
import { formatCOP, formatCOPPlain } from '../../utils/finance';

const ICONS_LIST = [
  { icon: 'savings', label: 'Alcancía' },
  { icon: 'flight_takeoff', label: 'Viajes' },
  { icon: 'health_and_safety', label: 'Emergencia' },
  { icon: 'home', label: 'Hogar' },
  { icon: 'laptop_mac', label: 'Tecnología' },
  { icon: 'directions_car', label: 'Vehículo' },
  { icon: 'school', label: 'Educación' },
  { icon: 'diamond', label: 'Inversión' },
  { icon: 'favorite', label: 'Bienestar' },
  { icon: 'star', label: 'Sueño' },
];

const CATEGORIES: { id: AhorroMeta['category']; label: string }[] = [
  { id: 'emergencia', label: 'Emergencias' },
  { id: 'viajes', label: 'Viajes' },
  { id: 'tecnologia', label: 'Tecnología' },
  { id: 'hogar', label: 'Hogar' },
  { id: 'vehiculo', label: 'Vehículo' },
  { id: 'educacion', label: 'Educación' },
  { id: 'otro', label: 'Otro' },
];

export const AhorroScreen: React.FC = () => {
  const {
    savings,
    addSavingMeta,
    updateSavingMeta,
    deleteSavingMeta,
    depositToSaving,
    withdrawFromSaving,
    triggerConfetti,
  } = useFinancial();

  // Modals & form state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<AhorroMeta | null>(null);
  const [actionGoal, setActionGoal] = useState<{ goal: AhorroMeta; type: 'deposit' | 'withdraw' } | null>(null);
  const [expandedHistoryGoalId, setExpandedHistoryGoalId] = useState<string | null>(null);

  // Form inputs for create/edit
  const [formTitle, setFormTitle] = useState<string>('');
  const [formPurpose, setFormPurpose] = useState<string>('');
  const [formTargetAmount, setFormTargetAmount] = useState<string>('');
  const [formCurrentAmount, setFormCurrentAmount] = useState<string>('');
  const [formTargetDate, setFormTargetDate] = useState<string>('');
  const [formCategory, setFormCategory] = useState<AhorroMeta['category']>('emergencia');
  const [formIcon, setFormIcon] = useState<string>('savings');
  const [formNotes, setFormNotes] = useState<string>('');

  // Form input for deposit/withdraw action
  const [actionAmount, setActionAmount] = useState<string>('');
  const [actionNote, setActionNote] = useState<string>('');

  // Metrics
  const totalSaved = savings.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savings.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
  const completedGoalsCount = savings.filter((g) => g.currentAmount >= g.targetAmount).length;

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormTitle('');
    setFormPurpose('');
    setFormTargetAmount('');
    setFormCurrentAmount('');
    setFormTargetDate('');
    setFormCategory('emergencia');
    setFormIcon('savings');
    setFormNotes('');
    setShowCreateModal(true);
  };

  const openEditModal = (goal: AhorroMeta) => {
    setEditingGoal(goal);
    setFormTitle(goal.title);
    setFormPurpose(goal.purpose);
    setFormTargetAmount(goal.targetAmount.toString());
    setFormCurrentAmount(goal.currentAmount.toString());
    setFormTargetDate(goal.targetDate || '');
    setFormCategory(goal.category);
    setFormIcon(goal.icon);
    setFormNotes(goal.notes || '');
    setShowCreateModal(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(formTargetAmount);
    if (!formTitle.trim() || !formPurpose.trim() || !target || target <= 0) {
      return;
    }

    if (editingGoal) {
      // Edit existing
      updateSavingMeta(editingGoal.id, {
        title: formTitle.trim(),
        purpose: formPurpose.trim(),
        targetAmount: target,
        targetDate: formTargetDate || undefined,
        category: formCategory,
        icon: formIcon,
        notes: formNotes.trim() || undefined,
      });
    } else {
      // Create new
      const initial = parseFloat(formCurrentAmount) || 0;
      addSavingMeta({
        title: formTitle.trim(),
        purpose: formPurpose.trim(),
        targetAmount: target,
        currentAmount: initial,
        targetDate: formTargetDate || undefined,
        category: formCategory,
        icon: formIcon,
        notes: formNotes.trim() || undefined,
      });
    }

    triggerConfetti();
    setShowCreateModal(false);
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionGoal) return;
    const amount = parseFloat(actionAmount);
    if (!amount || amount <= 0) return;

    if (actionGoal.type === 'deposit') {
      depositToSaving(actionGoal.goal.id, amount, actionNote.trim() || undefined);
      triggerConfetti();
    } else {
      withdrawFromSaving(actionGoal.goal.id, amount, actionNote.trim() || undefined);
    }

    setActionGoal(null);
    setActionAmount('');
    setActionNote('');
  };

  return (
    <div className="flex flex-col w-full pb-10 space-y-4">
      {/* Privacy / Local vault banner */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#eff4ff] rounded-xl shadow-xs border border-[#c6c6cd]/25">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[18px] text-[#006c49] flex-shrink-0">
            lock
          </span>
          <span className="text-xs font-semibold text-[#0b1c30] truncate">
            Bóveda Local: Metas de Ahorro en tu Celular
          </span>
        </div>
        <span className="text-[10px] bg-[#6ffbbe]/50 text-[#005236] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0">
          100% Privado
        </span>
      </div>

      {/* Hero Bento Card: Total Ahorrado */}
      <div className="relative overflow-hidden bg-[#131b2e] text-[#ffffff] rounded-2xl p-4 sm:p-5 shadow-lg border border-[#dae2fd]/10">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[#006c49]/30 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[0.75rem] font-bold text-[#7c839b] uppercase tracking-wider block">
              Total Ahorrado Acumulado
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[2.25rem] font-extrabold text-[#ffffff] leading-tight tracking-tight">
                ${formatCOPPlain(totalSaved)}
              </span>
              <span className="text-xs text-[#6ffbbe] font-bold">COP</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#ffffff]/10 flex items-center justify-center border border-[#ffffff]/10">
            <span className="material-symbols-outlined text-[#6ffbbe] text-[24px]">savings</span>
          </div>
        </div>

        {/* Target and completion summary */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#ffffff]/10">
          <div className="flex flex-col">
            <span className="text-xs text-[#7c839b]">Meta Global</span>
            <span className="text-base font-bold text-[#ffffff]">{formatCOP(totalTarget)}</span>
            <span className="text-[11px] text-[#6ffbbe] mt-0.5 flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[13px]">flag</span>
              {overallPct}% completado
            </span>
          </div>
          <div className="flex flex-col pl-3 border-l border-[#ffffff]/10">
            <span className="text-xs text-[#7c839b]">Metas Activas</span>
            <span className="text-base font-bold text-[#ffffff]">{savings.length} metas</span>
            <span className="text-[11px] text-[#4edea3] mt-0.5 flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[13px]">task_alt</span>
              {completedGoalsCount} logradas
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#ffffff]/15 h-2 rounded-full mt-3.5 overflow-hidden">
          <div
            className="bg-[#6ffbbe] h-full rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Action Bar / Create Goal Trigger */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <h2 className="font-extrabold text-[1.125rem] text-[#0b1c30]">Mis Metas de Ahorro</h2>
          <span className="text-xs text-[#45464d]">
            Define el propósito de cada ahorro y haz seguimiento constante
          </span>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="h-10 px-3.5 bg-[#006c49] hover:bg-[#005236] text-[#ffffff] font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Nueva Meta</span>
        </button>
      </div>

      {/* List of Saving Goals */}
      <div className="flex flex-col space-y-3.5">
        {savings.length === 0 ? (
          <div className="bg-[#ffffff] rounded-2xl p-8 text-center border border-[#c6c6cd]/25 shadow-xs flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#e5eeff] flex items-center justify-center text-[#006c49]">
              <span className="material-symbols-outlined text-[30px]">savings</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[#0b1c30]">No tienes metas de ahorro aún</h3>
              <p className="text-xs text-[#45464d] max-w-[260px] leading-relaxed">
                Crea tu primera meta con el motivo por el cual quieres ahorrar (viajes, emergencias, compras, etc.).
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-2 px-4 py-2.5 bg-[#000000] text-[#ffffff] text-xs font-bold rounded-xl shadow-sm active:scale-95"
            >
              + Crear mi primera meta
            </button>
          </div>
        ) : (
          savings.map((goal) => {
            const pct = goal.targetAmount > 0
              ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
              : 0;
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const isHistoryOpen = expandedHistoryGoalId === goal.id;

            return (
              <div
                key={goal.id}
                className="bg-[#ffffff] rounded-2xl p-4 shadow-sm border border-[#c6c6cd]/20 relative overflow-hidden transition-all"
              >
                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-[#006c49] text-[#ffffff] text-[10px] font-extrabold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[13px]">military_tech</span>
                    ¡META LOGRADA!
                  </div>
                )}

                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#eff4ff] flex items-center justify-center flex-shrink-0 text-[#006c49] border border-[#dce9ff]">
                      <span className="material-symbols-outlined text-[24px]">{goal.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm text-[#0b1c30] truncate">{goal.title}</h3>
                      <span className="inline-block text-[11px] text-[#006c49] bg-[#6ffbbe]/30 px-2 py-0.2 rounded-md font-semibold mt-0.5 capitalize">
                        {goal.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions dropdown/buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(goal)}
                      title="Editar meta"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Deseas eliminar la meta "${goal.title}"?`)) {
                          deleteSavingMeta(goal.id);
                        }
                      }}
                      title="Eliminar meta"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c6c6cd] hover:bg-[#ffdad6]/40 hover:text-[#ba1a1a] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Purpose / Motivo del ahorro */}
                <div className="mt-2.5 bg-[#eff4ff] p-2.5 rounded-xl text-xs">
                  <div className="flex items-start gap-1.5 text-[#0b1c30]">
                    <span className="material-symbols-outlined text-[16px] text-[#006c49] flex-shrink-0 mt-0.5">
                      psychology_alt
                    </span>
                    <p className="leading-relaxed">
                      <strong className="text-[#45464d] font-semibold block text-[10px] uppercase">
                        ¿Para qué quiero este ahorro?
                      </strong>
                      <span className="font-medium text-[#0b1c30]">{goal.purpose}</span>
                    </p>
                  </div>
                  {goal.notes && (
                    <p className="text-[11px] text-[#45464d] mt-1.5 pl-5 italic border-t border-[#dce9ff] pt-1">
                      Nota: {goal.notes}
                    </p>
                  )}
                </div>

                {/* Financial Progress Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3 bg-[#f8f9ff] p-2.5 rounded-xl border border-[#eff4ff]">
                  <div>
                    <span className="text-[11px] text-[#45464d] block font-semibold">Ahorrado actual</span>
                    <span className="text-lg font-extrabold text-[#006c49]">
                      {formatCOP(goal.currentAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#45464d] block font-semibold">Meta fijada</span>
                    <span className="text-sm font-bold text-[#0b1c30]">
                      {formatCOP(goal.targetAmount)}
                    </span>
                    <span className="text-[10px] text-[#45464d] block">
                      {isCompleted ? 'Completado' : `Faltan ${formatCOP(remaining)}`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2.5">
                  <div className="flex justify-between items-center text-xs text-[#45464d] mb-1">
                    <span className="text-[11px] font-medium">Progreso de meta</span>
                    <span className="font-extrabold text-[#006c49]">{pct}%</span>
                  </div>
                  <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-[#006c49]' : 'bg-[#006c49]'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Target Date Notice */}
                {goal.targetDate && (
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#45464d]">
                    <span className="material-symbols-outlined text-[14px] text-[#006c49]">
                      event_available
                    </span>
                    <span>Fecha límite objetivo: <strong>{goal.targetDate}</strong></span>
                  </div>
                )}

                {/* Action Buttons: Aportar / Retirar */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#eff4ff]">
                  <button
                    type="button"
                    onClick={() => {
                      setActionGoal({ goal, type: 'deposit' });
                      setActionAmount('');
                      setActionNote('');
                    }}
                    className="h-10 rounded-xl bg-[#006c49] hover:bg-[#005236] text-[#ffffff] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[17px]">add_circle</span>
                    <span>+ Aportar dinero</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionGoal({ goal, type: 'withdraw' });
                      setActionAmount('');
                      setActionNote('');
                    }}
                    className="h-10 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#ba1a1a]">remove_circle</span>
                    <span>Retirar dinero</span>
                  </button>
                </div>

                {/* Toggle History movements */}
                {goal.history && goal.history.length > 0 && (
                  <div className="mt-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setExpandedHistoryGoalId(isHistoryOpen ? null : goal.id)}
                      className="w-full text-center text-xs text-[#45464d] hover:text-[#0b1c30] flex items-center justify-center gap-1 font-semibold py-1"
                    >
                      <span>Ver historial de aportes ({goal.history.length})</span>
                      <span className="material-symbols-outlined text-[14px]">
                        {isHistoryOpen ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>

                    {isHistoryOpen && (
                      <div className="mt-2 bg-[#f8f9ff] rounded-xl p-2.5 space-y-1.5 border border-[#eff4ff] text-xs animate-toast">
                        {goal.history.map((h) => (
                          <div
                            key={h.id}
                            className="flex items-center justify-between py-1 border-b border-[#eff4ff] last:border-none"
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`material-symbols-outlined text-[15px] ${
                                  h.type === 'deposit' ? 'text-[#006c49]' : 'text-[#ba1a1a]'
                                }`}
                              >
                                {h.type === 'deposit' ? 'arrow_downward' : 'arrow_upward'}
                              </span>
                              <div>
                                <span className="font-semibold text-[#0b1c30] block leading-none">
                                  {h.note || (h.type === 'deposit' ? 'Aporte' : 'Retiro')}
                                </span>
                                <span className="text-[10px] text-[#45464d]">{h.date}</span>
                              </div>
                            </div>
                            <span
                              className={`font-bold ${
                                h.type === 'deposit' ? 'text-[#006c49]' : 'text-[#ba1a1a]'
                              }`}
                            >
                              {h.type === 'deposit' ? '+' : '-'}{formatCOP(h.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Motivational Tip Card */}
      <div className="p-4 bg-[#6ffbbe]/25 rounded-2xl flex items-start gap-3 border border-[#6cf8bb]/40">
        <span className="material-symbols-outlined text-[#006c49] text-[22px] flex-shrink-0 mt-0.5">
          tips_and_updates
        </span>
        <div className="flex flex-col">
          <span className="font-bold text-xs text-[#002113]">Regla de Oro del Ahorro</span>
          <p className="text-xs text-[#005236] mt-0.5 leading-relaxed">
            Cuando fijas un <strong>propósito claro</strong> (como viajar o tener colchón de emergencia),
            es un 42% más probable que alcances tu meta. ¡Abona pequeñas sumas recurrentes cada semana!
          </p>
        </div>
      </div>

      {/* MODAL: CREATE OR EDIT GOAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] bg-[#000000]/60 backdrop-blur-xs flex items-center justify-center p-3 animate-toast">
          <div className="w-full max-w-[390px] bg-[#ffffff] rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-[#c6c6cd]/25">
            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#006c49] flex items-center justify-center text-[#ffffff]">
                  <span className="material-symbols-outlined text-[18px]">
                    {editingGoal ? 'edit' : 'add'}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-[#0b1c30]">
                  {editingGoal ? 'Editar Meta de Ahorro' : 'Nueva Meta de Ahorro'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#45464d] hover:bg-[#eff4ff]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3.5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Nombre de la meta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Fondo de Emergencia, Vacaciones, Casa..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#eff4ff] text-[#0b1c30] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#006c49]/30"
                />
              </div>

              {/* Purpose (Para qué quiero el ahorro) */}
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  ¿Para qué quieres este ahorro? (Propósito) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ej: Estar tranquilo 3 meses sin deudas si me quedo sin trabajo..."
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  className="w-full p-3 bg-[#eff4ff] text-[#0b1c30] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006c49]/30 resize-none"
                />
              </div>

              {/* Target amount & Current amount */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Meta en COP ($) *
                  </label>
                  <input
                    type="number"
                    step="10000"
                    min="1000"
                    required
                    placeholder="Ej: 2000000"
                    value={formTargetAmount}
                    onChange={(e) => setFormTargetAmount(e.target.value)}
                    className="w-full h-11 px-3 bg-[#eff4ff] text-[#0b1c30] rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#006c49]/30"
                  />
                </div>

                {!editingGoal && (
                  <div>
                    <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                      Ahorro inicial ($)
                    </label>
                    <input
                      type="number"
                      step="10000"
                      min="0"
                      placeholder="0"
                      value={formCurrentAmount}
                      onChange={(e) => setFormCurrentAmount(e.target.value)}
                      className="w-full h-11 px-3 bg-[#eff4ff] text-[#0b1c30] rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#006c49]/30"
                    />
                  </div>
                )}
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Categoría
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AhorroMeta['category'])}
                    className="w-full h-11 px-3 bg-[#eff4ff] text-[#0b1c30] rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                    className="w-full h-11 px-3 bg-[#eff4ff] text-[#0b1c30] rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Icon selection */}
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                  Ícono representativo
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {ICONS_LIST.map((item) => (
                    <button
                      key={item.icon}
                      type="button"
                      onClick={() => setFormIcon(item.icon)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 ${
                        formIcon === item.icon
                          ? 'bg-[#006c49] text-[#ffffff] shadow-xs'
                          : 'bg-[#eff4ff] text-[#45464d]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Notas o estrategia (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Aportar $50.000 cada viernes"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full h-10 px-3 bg-[#eff4ff] text-[#0b1c30] rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Submit buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 h-12 rounded-xl bg-[#eff4ff] text-[#45464d] font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-[#006c49] hover:bg-[#005236] text-[#ffffff] font-bold text-xs shadow-xs active:scale-95"
                >
                  {editingGoal ? 'Guardar Cambios' : 'Crear Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DEPOSIT OR WITHDRAW */}
      {actionGoal && (
        <div className="fixed inset-0 z-[100] bg-[#000000]/60 backdrop-blur-xs flex items-center justify-center p-3 animate-toast">
          <div className="w-full max-w-[360px] bg-[#ffffff] rounded-3xl p-5 shadow-2xl space-y-4 border border-[#c6c6cd]/25">
            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[#ffffff] ${
                    actionGoal.type === 'deposit' ? 'bg-[#006c49]' : 'bg-[#ba1a1a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {actionGoal.type === 'deposit' ? 'add_circle' : 'remove_circle'}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0b1c30]">
                    {actionGoal.type === 'deposit' ? 'Aportar a Meta' : 'Retirar Fondos'}
                  </h3>
                  <span className="text-[11px] text-[#45464d] truncate block max-w-[200px]">
                    {actionGoal.goal.title}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActionGoal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#45464d] hover:bg-[#eff4ff]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-3.5">
              <div className="bg-[#eff4ff] p-3.5 rounded-2xl flex flex-col items-center">
                <label className="text-[11px] text-[#45464d] mb-1 font-semibold">
                  Monto en COP ($)
                </label>
                <div className="flex items-center justify-center w-full">
                  <span className="text-2xl font-bold text-[#45464d] mr-1">$</span>
                  <input
                    type="number"
                    step="1000"
                    min="100"
                    required
                    autoFocus
                    placeholder="0"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    className="w-full text-center text-2xl font-extrabold text-[#0b1c30] bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick presets */}
              <div className="flex gap-1.5 justify-center">
                {[20000, 50000, 100000, 200000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setActionAmount(preset.toString())}
                    className="px-2.5 py-1 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold rounded-lg"
                  >
                    +${preset / 1000}k
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Nota / Detalle (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ahorro de la quincena, bono, etc."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full h-10 px-3 bg-[#eff4ff] text-[#0b1c30] rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActionGoal(null)}
                  className="flex-1 h-11 rounded-xl bg-[#eff4ff] text-[#45464d] font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 h-11 rounded-xl text-[#ffffff] font-bold text-xs shadow-xs active:scale-95 ${
                    actionGoal.type === 'deposit'
                      ? 'bg-[#006c49] hover:bg-[#005236]'
                      : 'bg-[#ba1a1a] hover:bg-[#93000a]'
                  }`}
                >
                  {actionGoal.type === 'deposit' ? 'Confirmar Aporte' : 'Confirmar Retiro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
