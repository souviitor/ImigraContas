export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatEUR(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const PHASE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pre_viagem: { label: 'Pré-Viagem', color: 'text-blue-700', bg: 'bg-blue-50' },
  viagem: { label: 'Durante Viagem', color: 'text-amber-700', bg: 'bg-amber-50' },
  chegada: { label: 'Chegada', color: 'text-purple-700', bg: 'bg-purple-50' },
  pos_chegada: { label: 'Pós-Chegada', color: 'text-emerald-700', bg: 'bg-emerald-50' },
}
