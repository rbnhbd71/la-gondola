import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(timeStr: string) {
  return timeStr?.slice(0, 5) ?? ''
}

export default async function ReservationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!restaurant) {
    return (
      <div className="min-h-screen p-8">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black">
          ← Dashboard
        </Link>
        <p className="text-red-600 text-sm mt-6">No restaurant found for this account.</p>
      </div>
    )
  }

  const { data: reservations, error } = await supabase
    .from('reservations')
    .select('id, nome, data, ora, ospiti, stato')
    .eq('restaurant_id', restaurant.id)
    .order('data', { ascending: true })
    .order('ora', { ascending: true })

  return (
    <div className="min-h-screen p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Reservations</h1>
      </div>

      {error && (
        <p className="text-red-600 text-sm">Error: {error.message}</p>
      )}

      {!error && reservations?.length === 0 && (
        <p className="text-gray-500 text-sm">No reservations found.</p>
      )}

      {!error && reservations && reservations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500 font-medium">
                <th className="pb-3 pr-8">Nome</th>
                <th className="pb-3 pr-8">Data</th>
                <th className="pb-3 pr-8">Ora</th>
                <th className="pb-3 pr-8">Ospiti</th>
                <th className="pb-3">Stato</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => {
                const cancelled = r.stato === 'cancellata'
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-gray-100 ${cancelled ? 'opacity-40' : ''}`}
                  >
                    <td className="py-3 pr-8">{r.nome}</td>
                    <td className="py-3 pr-8">{formatDate(r.data)}</td>
                    <td className="py-3 pr-8">{formatTime(r.ora)}</td>
                    <td className="py-3 pr-8">{r.ospiti}</td>
                    <td className="py-3">
                      {cancelled ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          Cancellata
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                          {r.stato}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
