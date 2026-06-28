'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const RESTAURANT_ID = 'fc1dc756-8e83-473d-9d6d-c32720e4d258'

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

  const { error } = await supabase
    .from('restaurants')
    .update(settings)
    .eq('id', RESTAURANT_ID)

  if (error) return { error: error.message }
  return {}
}
