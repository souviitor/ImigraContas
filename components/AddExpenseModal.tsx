'use client'

import { useState } from 'react'
import { Category, ExpenseWithDetails } from '@/lib/types'
import { PHASE_LABELS } from '@/lib/utils'

type Props = {
  categories: Category[]
  onClose: () => void
  onAdd: (expense: Partial<ExpenseWithDetails>) => Promise<{ error: unknown }>
}

export default function AddExpenseModal({ categories, onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    description: '',
    amount_brl: '',
    amount_eur: '',
    currency: 'BRL' as 'BRL' | 'EUR',
    category_id: categories[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    phase: 'pre_viagem' as const,
    is_for_dog: false,
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedCategory = categories.find(c => c.id === form.category_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim() || !form.category_id) {
      setError('Preencha a descrição e categoria')
      return
    }

    const amountValue = form.currency === 'BRL'
      ? parseFloat(form.amount_brl)
      : parseFloat(form.amount_eur)

    if (!amountValue || amountValue <= 0) {
      setError('Digite um valor válido')
      return
    }

    setLoading(true)
    const { error: err } = await onAdd({
      ...form,
      amount_brl: form.currency === 'BRL' ? parseFloat(form.amount_brl) : 0,
      amount_eur: form.currency === 'EUR' ? parseFloat(form.amount_eur) : null,
    })

    if (err) {
      setError('Erro ao salvar. Tente novamente.')
      setLoading(false)
    }
  }

  const set = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }))

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{selectedCategory?.icon || '💰'}</div>
            <div>
              <h2 className="font-bold text-slate-800">Novo Gasto</h2>
              <p className="text-sm text-slate-400">🇧🇷 → 🇪🇸 · Imigração</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Descrição */}
          <div>
            <label className="label">Descrição *</label>
            <input
              type="text"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Ex: Passagem aérea TAP Lisboa"
              className="input-field"
              required
              autoFocus
            />
          </div>

          {/* Valor e moeda */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Moeda</label>
              <div className="flex gap-2">
                {(['BRL', 'EUR'] as const).map(curr => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => set('currency', curr)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                      form.currency === curr
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-slate-200 text-slate-600 hover:border-brand-300'
                    }`}
                  >
                    {curr === 'BRL' ? '🇧🇷 R$' : '🇪🇸 €'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Valor *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.currency === 'BRL' ? form.amount_brl : form.amount_eur}
                onChange={e => set(form.currency === 'BRL' ? 'amount_brl' : 'amount_eur', e.target.value)}
                placeholder="0,00"
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="label">Categoria *</label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {categories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => set('category_id', c.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                    form.category_id === c.id
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <span className="text-base shrink-0">{c.icon}</span>
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Data */}
            <div>
              <label className="label">Data</label>
              <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Fase */}
            <div>
              <label className="label">Fase</label>
              <select value={form.phase} onChange={e => set('phase', e.target.value)} className="input-field">
                {Object.entries(PHASE_LABELS).map(([val, { label }]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cachorro */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <input
              type="checkbox"
              id="is_dog"
              checked={form.is_for_dog}
              onChange={e => set('is_for_dog', e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500"
            />
            <label htmlFor="is_dog" className="text-sm text-emerald-700 cursor-pointer font-medium">
              🐕 Este gasto é relacionado ao cachorro
            </label>
          </div>

          {/* Notas */}
          <div>
            <label className="label">Observações (opcional)</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Detalhes adicionais..."
              className="input-field resize-none"
              rows={2}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">⚠️ {error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? '⏳ Salvando...' : '✅ Salvar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
