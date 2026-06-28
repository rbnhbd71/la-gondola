import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/getLocale'
import { dictionary } from '@/lib/i18n/dictionary'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
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
        <p className="text-red-600 text-sm">{dict.common.noRestaurantFound}</p>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [todayResult, weekResult, customerResult] = await Promise.all([
    supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id)
      .eq('data', today)
      .neq('stato', 'cancellata'),
    supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id)
      .gte('data', today)
      .lt('data', in7Days)
      .neq('stato', 'cancellata'),
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id),
  ])

  const stats = [
    { label: dict.dashboard.todaysReservations, value: todayResult.count },
    { label: dict.dashboard.next7Days, value: weekResult.count },
    { label: dict.dashboard.totalCustomers, value: customerResult.count },
  ]

  return (
    <div className="p-10">
      <h1 className="font-display font-medium text-3xl text-ink mb-8">{dict.dashboard.heading}</h1>
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-surface-sunk rounded-xl p-5">
            <p className="font-display font-medium text-4xl text-clay">{value ?? '—'}</p>
            <p className="text-sm text-ink-soft mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
