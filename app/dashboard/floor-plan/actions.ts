'use server'
import { createClient } from '@/lib/supabase/server'

type TableRow = { id: string; label: string; capacity: number; x: number; y: number }

export async function addTable(): Promise<{ data?: TableRow; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!restaurant) return { error: 'No restaurant found.' }

  const { data: existing } = await supabase
    .from('tables')
    .select('label, x, y')
    .eq('restaurant_id', restaurant.id)

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
    .insert({ restaurant_id: restaurant.id, label, capacity: 4, x, y })
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

type ReservationRow = { id: string; nome: string | null; ospiti: number; ora: string; table_id: string }

export async function createReservationAtTable(args: {
  tableId: string
  nome: string | null
  ospiti: number
  data: string
  ora: string
}): Promise<{ data?: ReservationRow; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', user.id)
    .single()
  if (!restaurant) return { error: 'No restaurant found.' }

  const { data: table } = await supabase
    .from('tables')
    .select('id')
    .eq('id', args.tableId)
    .eq('restaurant_id', restaurant.id)
    .single()
  if (!table) return { error: 'Table not found.' }

  const { data, error } = await supabase
    .from('reservations')
    .insert({
      restaurant_id: restaurant.id,
      table_id: args.tableId,
      nome: args.nome,
      ospiti: args.ospiti,
      data: args.data,
      ora: args.ora,
      stato: 'attiva',
      telefono: null,
    })
    .select('id, nome, ospiti, ora, table_id')
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function cancelReservation(reservationId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', user.id)
    .single()
  if (!restaurant) return { error: 'No restaurant found.' }

  const { error } = await supabase
    .from('reservations')
    .update({ stato: 'cancellata' })
    .eq('id', reservationId)
    .eq('restaurant_id', restaurant.id)

  if (error) return { error: error.message }
  return {}
}

export async function updateReservation(
  reservationId: string,
  updates: { nome: string | null; ospiti: number; ora: string }
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', user.id)
    .single()
  if (!restaurant) return { error: 'No restaurant found.' }

  const { error } = await supabase
    .from('reservations')
    .update({ nome: updates.nome, ospiti: updates.ospiti, ora: updates.ora })
    .eq('id', reservationId)
    .eq('restaurant_id', restaurant.id)

  if (error) return { error: error.message }
  return {}
}
