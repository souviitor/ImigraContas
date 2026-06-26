'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'
import { ActiveView } from './DashboardClient'
import { formatBRL, formatEUR } from '@/lib/utils'
import { useLanguage } from '@/lib/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'

type Props = {
  currentProfile: Profile | null
  profiles: Profile[]
  onlineUsers: string[]
  activeView: ActiveView
  setActiveView: (v: ActiveView) => void
  onAddExpense: () => void
  totalBRL: number
  totalEUR: number
}

export default function Sidebar({
  currentProfile,
  profiles,
  onlineUsers,
  activeView,
  setActiveView,
  onAddExpense,
  totalBRL,
  totalEUR,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems: { id: ActiveView; labelKey: 'visaoGeral' | 'gastos' | 'graficos'; icon: string }[] = [
    { id: 'overview', labelKey: 'visaoGeral', icon: '📊' },
    { id: 'expenses', labelKey: 'gastos', icon: '📋' },
    { id: 'charts', labelKey: 'graficos', icon: '📈' },
  ]

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🛫</span>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">Rumbo +34</h1>
            <p className="text-slate-400 text-xs">🇧🇷 → 🇪🇸</p>
          </div>
        </div>
        {/* Language Switcher */}
        <div className="mt-3">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Quem está online */}
      <div className="px-4 py-3 border-b border-slate-700">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {t('familiaOnline')}
        </p>
        <div className="space-y-2">
          {profiles.map(p => (
            <div key={p.id} className="flex items-center gap-2.5">
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: p.avatar_color }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                {onlineUsers.includes(p.id) ? (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
                ) : (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-slate-600 rounded-full border-2 border-slate-900" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {p.name}
                  {p.id === currentProfile?.id && (
                    <span className="text-slate-400 text-xs ml-1">{t('voce')}</span>
                  )}
                </p>
                <p className={`text-xs ${onlineUsers.includes(p.id) ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {onlineUsers.includes(p.id) ? `● ${t('online')}` : `○ ${t('offline')}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totais rápidos */}
      <div className="px-4 py-3 border-b border-slate-700">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {t('totalGasto')}
        </p>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">{t('emReais')}</span>
            <span className="text-sm font-bold text-white">{formatBRL(totalBRL)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">{t('emEuros')}</span>
            <span className="text-sm font-bold text-spain-yellow">{formatEUR(totalEUR)}</span>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {t('menu')}
        </p>
        <div className="space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeView === item.id
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {t(item.labelKey)}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <button
            onClick={onAddExpense}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white transition-all"
          >
            <span className="text-lg">+</span>
            {t('adicionarGasto')}
          </button>
        </div>
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0"
            style={{ backgroundColor: currentProfile?.avatar_color || '#6366f1' }}
          >
            {currentProfile?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{currentProfile?.name}</p>
            <p className="text-xs text-slate-400 truncate">{currentProfile?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-xs text-slate-400 hover:text-white transition-colors py-1.5 rounded-lg hover:bg-slate-800"
        >
          {t('sair')}
        </button>
      </div>
    </aside>
  )
}
