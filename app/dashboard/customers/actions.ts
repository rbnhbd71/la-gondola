'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateCompleanno(
  customerId: string,
  compleanno: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!restaurant) return { error: 'No restaurant found for this account.' }

  const { error } = await supabase
    .from('customers')
    .update({ compleanno: compleanno || null })
    .eq('id', customerId)
    .eq('restaurant_id', restaurant.id)

  if (error) return { error: error.message }
  return {}
}
