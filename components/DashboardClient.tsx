'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ExpenseWithDetails, Category, Profile } from '@/lib/types'
import Sidebar from './Sidebar'
import Overview from './Overview'
import ExpenseTable from './ExpenseTable'
import AddExpenseModal from './AddExpenseModal'
import ChartsPanel from './ChartsPanel'
import { formatBRL, formatEUR } from '@/lib/utils'
import { useLanguage } from '@/lib/LanguageContext'

type Props = {
  initialExpenses: ExpenseWithDetails[]
  categories: Category[]
  profiles: Profile[]
  currentProfile: Profile | null
  currentUserId: string
  budget: { total_brl: number; total_eur: number; notes?: string }
}

export type ActiveView = 'overview' | 'expenses' | 'charts'

export default function DashboardClient({
  initialExpenses,
  categories,
  profiles: initialProfiles,
  currentProfile,
  currentUserId,
  budget: initialBudget,
}: Props) {
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>(initialExpenses)
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [budget, setBudget] = useState(initialBudget)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [activeView, setActiveView] = useState<ActiveView>('overview')
  const [showAddModal, setShowAddModal] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const supabase = createClient()
  const { t } = useLanguage()

  const showNotification = useCallback((msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3500)
  }, [])

  useEffect(() => {
    // Realtime: expenses
    const expensesChannel = supabase
      .channel('expenses-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'expenses' },
        async (payload) => {
          const { data } = await supabase
            .from('expenses')
            .select('*, category:categories(*), profiles(*)')
            .eq('id', payload.new.id)
            .single()
          if (data && data.user_id !== currentUserId) {
            setExpenses(prev => [data as ExpenseWithDetails, ...prev])
            showNotification(`💰 ${data.profiles?.name || 'Alguém'} ${t('alguemAdicionou')}: ${data.description}`)
          }
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'expenses' },
        (payload) => {
          setExpenses(prev => prev.filter(e => e.id !== payload.old.id))
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'expenses' },
        async (payload) => {
          const { data } = await supabase
            .from('expenses')
            .select('*, category:categories(*), profiles(*)')
            .eq('id', payload.new.id)
            .single()
          if (data) {
            setExpenses(prev => prev.map(e => e.id === data.id ? data as ExpenseWithDetails : e))
          }
        }
      )
      .subscribe()

    // Presença ao vivo (quem está online)
    const presenceChannel = supabase.channel('online-users', {
      config: { presence: { key: currentUserId } }
    })
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        setOnlineUsers(Object.keys(state))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: currentUserId,
            name: currentProfile?.name || 'Usuário',
            online_at: new Date().toISOString()
          })
        }
      })

    return () => {
      supabase.removeChannel(expensesChannel)
      supabase.removeChannel(presenceChannel)
    }
  }, [currentUserId, supabase, showNotification, currentProfile])

  const handleAddExpense = async (expense: Partial<ExpenseWithDetails>) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: currentUserId }])
      .select('*, category:categories(*), profiles(*)')
      .single()

    if (!error && data) {
      setExpenses(prev => [data as ExpenseWithDetails, ...prev])
      setShowAddModal(false)
      showNotification(t('gastoAdicionado'))
    }
    return { error }
  }

  const handleDeleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (!error) {
      setExpenses(prev => prev.filter(e => e.id !== id))
    }
  }

  const totalBRL = expenses.reduce((sum, e) => sum + (e.currency === 'BRL' ? e.amount_brl : 0), 0)
  const totalEUR = expenses.reduce((sum, e) => sum + (e.currency === 'EUR' ? (e.amount_eur || 0) : 0), 0)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        currentProfile={currentProfile}
        profiles={profiles}
        onlineUsers={onlineUsers}
        activeView={activeView}
        setActiveView={setActiveView}
        onAddExpense={() => setShowAddModal(true)}
        totalBRL={totalBRL}
        totalEUR={totalEUR}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {activeView === 'overview' && '📊 ' + t('visaoGeral')}
              {activeView === 'expenses' && t('todosOsGastos')}
              {activeView === 'charts' && t('graficosAnalises')}
            </h1>
            <p className="text-sm text-slate-500">
              {expenses.length} {expenses.length !== 1 ? t('registros') : t('registro')} {expenses.length !== 1 ? t('registrados') : t('registrado')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Online status */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 text-sm">
              {profiles.map(p => (
                <div key={p.id} className="flex items-center gap-1.5" title={p.name}>
                  <div className="relative">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: p.avatar_color }}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    {onlineUsers.includes(p.id) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white pulse-dot" />
                    )}
                  </div>
                </div>
              ))}
              <span className="text-slate-500 text-xs ml-1">
                {onlineUsers.length} online
              </span>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <span className="text-lg">+</span> {t('novoGasto')}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeView === 'overview' && (
            <Overview
              expenses={expenses}
              profiles={profiles}
              budget={budget}
              totalBRL={totalBRL}
              totalEUR={totalEUR}
              onViewAll={() => setActiveView('expenses')}
              onAddExpense={() => setShowAddModal(true)}
            />
          )}
          {activeView === 'expenses' && (
            <ExpenseTable
              expenses={expenses}
              currentUserId={currentUserId}
              onDelete={handleDeleteExpense}
              categories={categories}
            />
          )}
          {activeView === 'charts' && (
            <ChartsPanel expenses={expenses} categories={categories} profiles={profiles} />
          )}
        </div>
      </main>

      {/* Add Expense Modal */}
      {showAddModal && (
        <AddExpenseModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddExpense}
        />
      )}

      {/* Live notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl animate-fade-in text-sm font-medium z-50">
          {notification}
        </div>
      )}
    </div>
  )
}
