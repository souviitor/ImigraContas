'use client'

import { ExpenseWithDetails, Category, Profile } from '@/lib/types'
import { formatBRL, PHASE_LABELS } from '@/lib/utils'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts'

type Props = {
  expenses: ExpenseWithDetails[]
  categories: Category[]
  profiles: Profile[]
}

const COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#3b82f6','#ec4899','#f97316','#14b8a6','#64748b','#dc2626','#7c3aed','#059669','#0891b2','#94a3b8']

export default function ChartsPanel({ expenses, categories, profiles }: Props) {
  // Por categoria
  const byCategory = categories.map((c, i) => {
    const total = expenses.filter(e => e.category_id === c.id).reduce((s, e) => s + e.amount_brl, 0)
    return { name: c.name, icon: c.icon, value: total, color: COLORS[i % COLORS.length] }
  }).filter(c => c.value > 0).sort((a, b) => b.value - a.value)

  // Por fase
  const byPhase = Object.entries(PHASE_LABELS).map(([phase, meta]) => {
    const total = expenses.filter(e => e.phase === phase).reduce((s, e) => s + e.amount_brl, 0)
    return { name: meta.label, value: total }
  })

  // Por pessoa
  const byPerson = profiles.map(p => {
    const total = expenses.filter(e => e.user_id === p.id).reduce((s, e) => s + e.amount_brl, 0)
    return { name: p.name, value: total, color: p.avatar_color }
  })

  // Evolução por semana
  const expensesByWeek = expenses.reduce((acc, e) => {
    const date = new Date(e.date + 'T12:00:00')
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const key = weekStart.toISOString().split('T')[0]
    acc[key] = (acc[key] || 0) + e.amount_brl
    return acc
  }, {} as Record<string, number>)

  const weeklyData = Object.entries(expensesByWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([date, total]) => ({
      week: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      total
    }))

  const CustomTooltipBRL = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-sm">
          <p className="font-medium text-slate-800">{formatBRL(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  const totalDog = expenses.filter(e => e.is_for_dog).reduce((s, e) => s + e.amount_brl, 0)
  const totalHumans = expenses.filter(e => !e.is_for_dog).reduce((s, e) => s + e.amount_brl, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cachorro vs Humanos */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl mb-2">👨‍👩‍</p>
          <p className="label">Gastos do Casal</p>
          <p className="text-xl font-bold text-slate-800">{formatBRL(totalHumans)}</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl mb-2">🐕</p>
          <p className="label">Gastos do Cachorro</p>
          <p className="text-xl font-bold text-emerald-600">{formatBRL(totalDog)}</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl mb-2">🏠→✈️→🏙️</p>
          <p className="label">Total Geral</p>
          <p className="text-xl font-bold text-brand-600">{formatBRL(totalDog + totalHumans)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de pizza por categoria */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Por Categoria</h3>
          {byCategory.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Sem dados ainda</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={2}>
                    {byCategory.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipBRL />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                {byCategory.slice(0, 8).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-slate-600">{c.icon} {c.name}</span>
                    </div>
                    <span className="font-medium text-slate-800">{formatBRL(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Por fase */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Por Fase da Imigração</h3>
          {byPhase.every(p => p.value === 0) ? (
            <p className="text-slate-400 text-sm text-center py-8">Sem dados ainda</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byPhase} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltipBRL />} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Evolução semanal */}
      {weeklyData.length > 1 && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Evolução dos Gastos por Semana</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltipBRL />} />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Por pessoa */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">Contribuição por Pessoa</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={byPerson}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltipBRL />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {byPerson.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
