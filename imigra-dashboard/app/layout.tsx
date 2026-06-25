import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ImigraContas 🇧🇷→🇪🇸 | Controle de Gastos',
  description: 'Dashboard de controle de gastos da imigração Brasil → Espanha',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 antialiased">
        {children}
      </body>
    </html>
  )
}
