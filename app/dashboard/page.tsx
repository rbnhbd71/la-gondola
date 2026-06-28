import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, nome_ristorante')
    .eq('owner_id', user.id)
    .single()

  if (!restaurant) {
    return (
      <div className="min-h-screen p-8">
        <p className="text-red-600 text-sm">No restaurant found for this account.</p>
        <form action={signOut} className="mt-4">
          <button type="submit" className="text-sm text-gray-600 underline hover:text-black">
            Log out
          </button>
        </form>
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
    { label: "Today's reservations", value: todayResult.count },
    { label: 'Next 7 days', value: weekResult.count },
    { label: 'Total customers', value: customerResult.count },
  ]

  return (
    <div className="min-h-screen p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">{restaurant.nome_ristorante}</h1>
        <p className="text-sm text-gray-500 mt-1">{user.email}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value }) => (
          <div key={label} className="border border-gray-200 rounded-lg p-4">
            <p className="text-3xl font-semibold">{value ?? '—'}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <nav className="flex flex-col gap-2 mb-10">
        <Link href="/dashboard/reservations" className="text-sm text-blue-600 hover:underline">
          Reservations →
        </Link>
        <Link href="/dashboard/customers" className="text-sm text-blue-600 hover:underline">
          Customers →
        </Link>
        <Link href="/dashboard/settings" className="text-sm text-blue-600 hover:underline">
          Settings →
        </Link>
      </nav>

      <form action={signOut}>
        <button
          type="submit"
          className="text-sm text-gray-600 underline hover:text-black"
        >
          Log out
        </button>
      </form>
    </div>
  )
}
