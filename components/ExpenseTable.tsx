'use client'

import { useState } from 'react'
import { ExpenseWithDetails, Category } from '@/lib/types'
import { formatBRL, formatEUR, formatDate, PHASE_LABELS } from '@/lib/utils'
import { useLanguage } from '@/lib/LanguageContext'

type Props = {
  expenses: ExpenseWithDetails[]
  currentUserId: string
  onDelete: (id: string) => void
  categories: Category[]
}

export default function ExpenseTable({ expenses, currentUserId, onDelete, categories }: Props) {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [filterPhase, setFilterPhase] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterDog, setFilterDog] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')

  const filtered = expenses
    .filter(e => {
      if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false
      if (filterPhase && e.phase !== filterPhase) return false
      if (filterCategory && e.category_id !== filterCategory) return false
      if (filterDog && !e.is_for_dog) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime()
      return b.amount_brl - a.amount_brl
    })

  const total = filtered.reduce((s, e) => s + (e.currency === 'BRL' ? e.amount_brl : 0), 0)
  const totalEUR = filtered.reduce((s, e) => s + (e.currency === 'EUR' ? (e.amount_eur || 0) : 0), 0)

  const confirmDelete = (id: string, desc: string) => {
    if (confirm(`${t('confirmarExcluir')} "${desc}"?`)) onDelete(id)
  }

  const phaseLabels: Record<string, string> = {
    pre_viagem: t('preViagem'),
    viagem: t('duranteViagem'),
    chegada: t('chegada'),
    pos_chegada: t('posChegada'),
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <input
            type="text"
            placeholder={t('buscar')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field col-span-2 md:col-span-1"
          />

          <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)} className="input-field">
            <option value="">{t('todasFases')}</option>
            {Object.keys(PHASE_LABELS).map(val => (
              <option key={val} value={val}>{phaseLabels[val]}</option>
            ))}
          </select>

          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="input-field">
            <option value="">{t('todasCategorias')}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
              <input type="checkbox" checked={filterDog} onChange={e => setFilterDog(e.target.checked)} className="rounded" />
              {t('somenteAnimais')}
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>{filtered.length} {t('registros')}</span>
            <span className="font-semibold text-slate-800">{formatBRL(total)}</span>
            {totalEUR > 0 && <span className="font-semibold text-amber-600">{formatEUR(totalEUR)}</span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('date')}
              className={`text-xs px-3 py-1.5 rounded-lg ${sortBy === 'date' ? 'bg-brand-100 text-brand-700 font-medium' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {t('data')}
            </button>
            <button
              onClick={() => setSortBy('amount')}
              className={`text-xs px-3 py-1.5 rounded-lg ${sortBy === 'amount' ? 'bg-brand-100 text-brand-700 font-medium' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {t('valor')}
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>{t('naoEncontrado')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{t('data')}</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{t('descricao')}</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{t('categoria')}</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{t('fase')}</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{t('pago')}</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{t('valor')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                      {formatDate(e.date)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{e.category?.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {e.description}
                            {e.is_for_dog && <span className="ml-1.5">🐕</span>}
                          </p>
                          {e.notes && <p className="text-xs text-slate-400 truncate max-w-[200px]">{e.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                        {e.category?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`phase-badge ${PHASE_LABELS[e.phase]?.bg} ${PHASE_LABELS[e.phase]?.color}`}>
                        {phaseLabels[e.phase] || PHASE_LABELS[e.phase]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: e.profiles?.avatar_color || '#6366f1' }}
                        title={e.profiles?.name}
                      >
                        {e.profiles?.name?.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-slate-800 text-sm">
                        {e.currency === 'BRL' ? formatBRL(e.amount_brl) : formatEUR(e.amount_eur || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {e.user_id === currentUserId && (
                        <button
                          onClick={() => confirmDelete(e.id, e.description)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all text-xs px-2 py-1 hover:bg-red-50 rounded-lg"
                        >
                          {t('excluir')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
