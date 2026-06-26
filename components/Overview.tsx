'use client'

import { ExpenseWithDetails, Category, Profile } from '@/lib/types'
import { formatBRL, formatEUR, formatDate, PHASE_LABELS } from '@/lib/utils'

type Props = {
  expenses: ExpenseWithDetails[]
  profiles: Profile[]
  budget: { total_brl: number; total_eur: number }
  totalBRL: number
  totalEUR: number
  onViewAll: () => void
  onAddExpense: () => void
}

export default function Overview({ expenses, profiles, budget, totalBRL, totalEUR, onViewAll, onAddExpense }: Props) {
  const dogExpenses = expenses.filter(e => e.is_for_dog)
  const totalDog = dogExpenses.reduce((s, e) => s + (e.currency === 'BRL' ? e.amount_brl : 0), 0)

  const byPhase = Object.entries(PHASE_LABELS).map(([phase, meta]) => {
    const phaseExpenses = expenses.filter(e => e.phase === phase)
    const total = phaseExpenses.reduce((s, e) => s + (e.currency === 'BRL' ? e.amount_brl : e.amount_brl), 0)
    return { phase, ...meta, total, count: phaseExpenses.length }
  })

  const byPerson = profiles.map(p => {
    const pExpenses = expenses.filter(e => e.user_id === p.id)
    const total = pExpenses.reduce((s, e) => s + e.amount_brl, 0)
    return { ...p, total, count: pExpenses.length }
  })

  const recent = expenses.slice(0, 8)

  const budgetPctBRL = budget.total_brl > 0 ? (totalBRL / budget.total_brl) * 100 : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0">
          <p className="text-brand-200 text-xs font-semibold uppercase tracking-wider mb-1">Total em R$</p>
          <p className="text-2xl font-bold">{formatBRL(totalBRL)}</p>
          <p className="text-brand-200 text-xs mt-1">{expenses.filter(e=>e.currency==='BRL').length} registros</p>
        </div>

        <div className="card bg-gradient-to-br from-amber-400 to-amber-500 text-white border-0">
          <p className="text-amber-100 text-xs font-semibold uppercase tracking-wider mb-1">Total em €</p>
          <p className="text-2xl font-bold">{formatEUR(totalEUR)}</p>
          <p className="text-amber-100 text-xs mt-1">{expenses.filter(e=>e.currency==='EUR').length} registros</p>
        </div>

        <div className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">Gastos do Bidu 🐕</p>
          <p className="text-2xl font-bold">{formatBRL(totalDog)}</p>
          <p className="text-emerald-100 text-xs mt-1">{dogExpenses.length} registros</p>
        </div>

        <div className="card">
          <p className="label">Total de Registros</p>
          <p className="text-2xl font-bold text-slate-800">{expenses.length}</p>
          <p className="text-slate-400 text-xs mt-1">por {profiles.length} pessoas</p>
        </div>
      </div>

      {/* Budget progress */}
      {budget.total_brl > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="font-semibold text-slate-800">Orçamento Total</p>
              <p className="text-sm text-slate-500">Meta: {formatBRL(budget.total_brl)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-800">{formatBRL(totalBRL)}</p>
              <p className={`text-sm font-medium ${budgetPctBRL > 90 ? 'text-red-500' : budgetPctBRL > 70 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {budgetPctBRL.toFixed(1)}% utilizado
              </p>
            </div>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                budgetPctBRL > 90 ? 'bg-red-500' : budgetPctBRL > 70 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(budgetPctBRL, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Disponível: {formatBRL(Math.max(0, budget.total_brl - totalBRL))}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Fase */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Por Fase da Imigração</h3>
          <div className="space-y-3">
            {byPhase.map(p => (
              <div key={p.phase} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`phase-badge ${p.bg} ${p.color}`}>{p.label}</span>
                  <span className="text-xs text-slate-400">{p.count} itens</span>
                </div>
                <span className="font-semibold text-slate-800 text-sm">{formatBRL(p.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Por Pessoa */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Por Pessoa</h3>
          <div className="space-y-4">
            {byPerson.map(p => (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: p.avatar_color }}
                    >
                      {p.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{p.name}</span>
                    <span className="text-xs text-slate-400">{p.count} itens</span>
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">{formatBRL(p.total)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: p.avatar_color,
                      width: totalBRL > 0 ? `${(p.total / totalBRL) * 100}%` : '0%'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimos gastos */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-800">Últimos Gastos</h3>
          <button onClick={onViewAll} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            Ver todos →
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">✈️</p>
            <p className="text-slate-500 font-medium mb-1">Nenhum gasto registrado ainda!</p>
            <p className="text-slate-400 text-sm mb-4">Comece adicionando suas despesas da imigração</p>
            <button onClick={onAddExpense} className="btn-primary">+ Adicionar primeiro gasto</button>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map(e => (
              <div key={e.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-xl">{e.category?.icon || '💰'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800 truncate">{e.description}</p>
                    {e.is_for_dog && <span className="text-xs">🐕</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs ${PHASE_LABELS[e.phase]?.bg} ${PHASE_LABELS[e.phase]?.color} px-1.5 py-0.5 rounded`}>
                      {PHASE_LABELS[e.phase]?.label}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(e.date)}</span>
                    <span className="text-xs text-slate-400">· {e.profiles?.name}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-slate-800 text-sm">
                    {e.currency === 'BRL' ? formatBRL(e.amount_brl) : formatEUR(e.amount_eur || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
