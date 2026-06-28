import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'
import type { RestaurantSettings } from './actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('restaurants')
    .select(
      'nome_ristorante, indirizzo, numero_twilio_from, capacita_totale, max_gruppo_singolo, orari_apertura, accessibilita, finestra_ore, numero_manager'
    )
    .eq('owner_id', user.id)
    .single()

  if (!data) {
    return (
      <div className="min-h-screen p-8">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black">
          ← Dashboard
        </Link>
        <p className="text-red-600 text-sm mt-6">No restaurant found for this account.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Settings</h1>
      </div>
      <SettingsForm initial={data as RestaurantSettings} />
    </div>
  )
}
