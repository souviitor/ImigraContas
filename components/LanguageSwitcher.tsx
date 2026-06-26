'use client'

import { useLanguage } from '@/lib/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1">
      <button
        onClick={() => setLanguage('pt-BR')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          language === 'pt-BR'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-400 hover:text-white'
        }`}
        title="Português (Brasil)"
      >
        <span className="text-sm">🇧🇷</span>
        <span>PT</span>
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          language === 'es'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-400 hover:text-white'
        }`}
        title="Español"
      >
        <span className="text-sm">🇪🇸</span>
        <span>ES</span>
      </button>
    </div>
  )
}
