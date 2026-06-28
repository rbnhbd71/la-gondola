import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/getLocale'
import { dictionary } from '@/lib/i18n/dictionary'
import StatsClient from './StatsClient'
import type { MonthBucket } from './types'

export default async function StatsPage() {
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
        <Link href="/dashboard" className="text-sm text-ink-faint hover:text-ink">
          {dict.common.backToDashboard}
        </Link>
        <p className="text-red-600 text-sm mt-6">{dict.common.noRestaurantFound}</p>
      </div>
    )
  }

  // Build date range: first day of 11 months ago → today (covers 12 months)
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-01`

  const [{ data: reservations }, { data: customers }] = await Promise.all([
    supabase
      .from('reservations')
      .select('data, stato, ora')
      .eq('restaurant_id', restaurant.id)
      .gte('data', startDateStr),
    supabase
      .from('customers')
      .select('created_at')
      .eq('restaurant_id', restaurant.id)
      .gte('created_at', startDateStr),
  ])

  // Build 12 monthly buckets (index 0 = oldest, index 11 = current month)
  const buckets: MonthBucket[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets.push({ month, reservations: 0, cancelled: 0, newCustomers: 0 })
  }

  const bucketMap = new Map(buckets.map(b => [b.month, b]))

  for (const r of reservations ?? []) {
    const key = (r.data as string).slice(0, 7)
    const b = bucketMap.get(key)
    if (!b) continue
    if (r.stato === 'cancellata') b.cancelled++
    else b.reservations++
  }

  for (const c of customers ?? []) {
    const key = (c.created_at as string).slice(0, 7)
    const b = bucketMap.get(key)
    if (!b) continue
    b.newCustomers++
  }

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-ink-faint hover:text-ink">
          {dict.common.backToDashboard}
        </Link>
        <h1 className="font-display font-medium text-3xl text-ink mt-2">
          {dict.stats.heading}
        </h1>
      </div>
      <StatsClient
        buckets={buckets}
        rawReservations={(reservations ?? []) as { data: string; stato: string; ora: string }[]}
        locale={locale}
        dict={dict.stats}
        lunchLabel={dict.floorPlan.lunch}
        dinnerLabel={dict.floorPlan.dinner}
      />
    </div>
  )
}
