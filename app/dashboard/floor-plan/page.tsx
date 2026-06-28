import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/getLocale'
import { dictionary } from '@/lib/i18n/dictionary'
import FloorEditor from './FloorEditor'

export default async function FloorPlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const locale = await getLocale()
  const dict = dictionary[locale]

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!restaurant) {
    return (
      <div className="p-10">
        <Link href="/dashboard" className="text-sm text-stone-400 hover:text-ink">
          {dict.common.backToDashboard}
        </Link>
        <p className="text-red-600 text-sm mt-6">{dict.common.noRestaurantFound}</p>
      </div>
    )
  }

  const { data: tables, error } = await supabase
    .from('tables')
    .select('id, label, capacity, x, y')
    .eq('restaurant_id', restaurant.id)
    .order('label', { ascending: true })

  return (
    <div className="p-10">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-stone-400 hover:text-ink">
          {dict.common.backToDashboard}
        </Link>
        <h1 className="font-display font-medium text-3xl text-ink mt-2">{dict.floorPlan.heading}</h1>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4">{dict.common.errorPrefix} {error.message}</p>
      )}

      <FloorEditor
        initialTables={tables ?? []}
        restaurantId={restaurant.id}
        t={{
          edit: dict.common.edit,
          done: dict.floorPlan.done,
          addTable: dict.floorPlan.addTable,
          noTablesFound: dict.floorPlan.noTablesFound,
        }}
      />
    </div>
  )
}
