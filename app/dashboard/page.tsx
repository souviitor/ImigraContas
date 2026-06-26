import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: expenses },
    { data: categories },
    { data: profiles },
    { data: budget }
  ] = await Promise.all([
    supabase
      .from('expenses')
      .select('*, category:categories(*), profiles(*)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
    supabase.from('profiles').select('*'),
    supabase.from('budget').select('*').single()
  ])

  const currentProfile = profiles?.find(p => p.id === user?.id)

  return (
    <DashboardClient
      initialExpenses={expenses || []}
      categories={categories || []}
      profiles={profiles || []}
      currentProfile={currentProfile || null}
      currentUserId={user?.id || ''}
      budget={budget || { total_brl: 0, total_eur: 0 }}
    />
  )
}
