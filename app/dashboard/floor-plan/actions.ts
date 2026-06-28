'use server'
import { createClient } from '@/lib/supabase/server'

type TableRow = { id: string; label: string; capacity: number; x: number; y: number }

export async function addTable(restaurantId: string): Promise<{ data?: TableRow; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: existing } = await supabase
    .from('tables')
    .select('label, x, y')
    .eq('restaurant_id', restaurantId)

  const rows = existing ?? []

  const tableNumRe = /^Table (\d+)$/
  const maxNum = rows.reduce((max, t) => {
    const m = t.label.match(tableNumRe)
    return m ? Math.max(max, parseInt(m[1], 10)) : max
  }, 0)

  const label = `Table ${maxNum + 1}`
  const n = rows.length
  const x = 50 + (n % 5) * 110
  const y = 50 + Math.floor(n / 5) * 110

  const { data, error } = await supabase
    .from('tables')
    .insert({ restaurant_id: restaurantId, label, capacity: 4, x, y })
    .select('id, label, capacity, x, y')
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deleteTable(tableId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('tables').delete().eq('id', tableId)
  if (error) return { error: error.message }
  return {}
}

export async function updateTablePosition(tableId: string, x: number, y: number): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('tables').update({ x, y }).eq('id', tableId)
  if (error) return { error: error.message }
  return {}
}
