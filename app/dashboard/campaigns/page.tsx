import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/getLocale'
import { dictionary } from '@/lib/i18n/dictionary'
import CampaignsForm from './CampaignsForm'

export default async function CampaignsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const locale = await getLocale()
  const dict = dictionary[locale]

  const { data } = await supabase
    .from('restaurants')
    .select('messaggio_compleanno')
    .eq('owner_id', user.id)
    .single()

  if (!data) {
    return (
      <div className="p-10">
        <Link href="/dashboard" className="text-sm text-stone-400 hover:text-ink">
          {dict.common.backToDashboard}
        </Link>
        <p className="text-red-600 text-sm mt-6">{dict.common.noRestaurantFound}</p>
      </div>
    )
  }

  return (
    <div className="p-10">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-stone-400 hover:text-ink">
          {dict.common.backToDashboard}
        </Link>
        <h1 className="font-display font-medium text-3xl text-ink mt-2">{dict.campaigns.heading}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#F0EBE1] rounded-xl p-5">
          <h2 className="font-display font-medium text-lg text-ink mb-4">{dict.campaigns.birthdayMessages}</h2>
          <CampaignsForm
            initial={data.messaggio_compleanno ?? ''}
            t={{
              edit: dict.common.edit,
              save: dict.common.save,
              saving: dict.common.saving,
              cancel: dict.common.cancel,
              templateLabel: dict.campaigns.templateLabel,
              savedSuccessfully: dict.campaigns.savedSuccessfully,
            }}
          />
        </div>

        <div className="bg-[#F0EBE1] rounded-xl p-5">
          <h2 className="font-display font-medium text-lg text-ink mb-2">{dict.campaigns.winbackTitle}</h2>
          <p className="text-sm text-stone-500 mb-4">{dict.campaigns.winbackDescription}</p>
          <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-stone-200 text-stone-500">
            {dict.campaigns.comingSoon}
          </span>
        </div>

        <div className="bg-[#F0EBE1] rounded-xl p-5">
          <h2 className="font-display font-medium text-lg text-ink mb-2">{dict.campaigns.seasonalTitle}</h2>
          <p className="text-sm text-stone-500 mb-4">{dict.campaigns.seasonalDescription}</p>
          <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-stone-200 text-stone-500">
            {dict.campaigns.comingSoon}
          </span>
        </div>
      </div>
    </div>
  )
}
