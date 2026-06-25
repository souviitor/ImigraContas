export type Category = {
  id: string
  name: string
  icon: string
  color: string
  created_at: string
}

export type Expense = {
  id: string
  user_id: string
  category_id: string
  description: string
  amount_brl: number
  amount_eur: number | null
  currency: 'BRL' | 'EUR'
  date: string
  phase: 'pre_viagem' | 'viagem' | 'chegada' | 'pos_chegada'
  is_for_dog: boolean
  notes: string | null
  created_at: string
  updated_at: string
  category?: Category
  profiles?: Profile
}

export type Profile = {
  id: string
  email: string
  name: string
  avatar_color: string
  created_at: string
}

export type ExpenseWithDetails = Expense & {
  category: Category
  profiles: Profile
}
