'use server'
import { createClient } from '@/lib/supabase/server'

export async function assignTable(
  reservationId: string,
  tableId: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (tableId) {
    const { data: table } = await supabase
      .from('tables')
      .select('id')
      .eq('id', tableId)
      .single()
    if (!table) return { error: 'Invalid table' }
  }

  const { error } = await supabase
    .from('reservations')
    .update({ table_id: tableId })
    .eq('id', reservationId)

  if (error) return { error: error.message }
  return {}
}
