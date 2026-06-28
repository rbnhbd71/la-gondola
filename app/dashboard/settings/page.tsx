import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/getLocale'
import { dictionary } from '@/lib/i18n/dictionary'
import SettingsForm from './SettingsForm'
import type { RestaurantSettings } from './actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const locale = await getLocale()
  const dict = dictionary[locale]

  const { data } = await supabase
    .from('restaurants')
    .select(
      'nome_ristorante, indirizzo, numero_twilio_from, capacita_totale, max_gruppo_singolo, orari_apertura, accessibilita, finestra_ore, numero_manager'
    )
    .eq('owner_id', user.id)
    .single()

  if (!data) {
    return (
      <div className="p-10">
        <Link href="/dashboard" className="text-sm text-ink-faint hover:text-ink">
          {dict.common.backToDashboard}
        </Link>
        <p className="text-red-600 text-sm mt-6">{dict.common.noRestaurantFound}</p>
      </div>
    )
  }

  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-ink-faint hover:text-ink">
          {dict.common.backToDashboard}
        </Link>
        <h1 className="font-display font-medium text-3xl text-ink mt-2">{dict.settings.heading}</h1>
      </div>
      <SettingsForm
        initial={data as RestaurantSettings}
        t={{
          edit: dict.common.edit,
          save: dict.common.save,
          saving: dict.common.saving,
          cancel: dict.common.cancel,
          savedSuccessfully: dict.settings.savedSuccessfully,
          confirmSave: dict.settings.confirmSave,
          mustBePositiveInt: dict.settings.mustBePositiveInt,
          labelNomeRistorante: dict.settings.labelNomeRistorante,
          labelIndirizzo: dict.settings.labelIndirizzo,
          labelNumeroTwilioFrom: dict.settings.labelNumeroTwilioFrom,
          labelNumeroManager: dict.settings.labelNumeroManager,
          labelOrariApertura: dict.settings.labelOrariApertura,
          labelAccessibilita: dict.settings.labelAccessibilita,
          labelCapacitaTotale: dict.settings.labelCapacitaTotale,
          labelMaxGruppoSingolo: dict.settings.labelMaxGruppoSingolo,
          labelFinestraOre: dict.settings.labelFinestraOre,
        }}
      />
    </div>
  )
}
