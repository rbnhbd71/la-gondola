'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface RestaurantSettings {
  nome_ristorante: string
  indirizzo: string
  numero_twilio_from: string
  capacita_totale: number
  max_gruppo_singolo: number
  orari_apertura: string
  accessibilita: string
  finestra_ore: number
  numero_manager: string
}

export async function updateRestaurantSettings(
  settings: RestaurantSettings
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
    .from('restaurants')
    .update(settings)
    .eq('id', restaurant.id)

  if (error) return { error: error.message }
  return {}
}
