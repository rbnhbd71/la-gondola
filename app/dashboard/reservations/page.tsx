import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/getLocale'
import { dictionary } from '@/lib/i18n/dictionary'
import TableSelect from './TableSelect'

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

  const [{ data: reservations, error }, { data: tables }] = await Promise.all([
    supabase
      .from('reservations')
      .select('id, nome, data, ora, ospiti, stato, table_id')
      .eq('restaurant_id', restaurant.id)
      .order('data', { ascending: true })
      .order('ora', { ascending: true }),
    supabase
      .from('tables')
      .select('id, label')
      .eq('restaurant_id', restaurant.id)
      .order('label', { ascending: true }),
  ])

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-stone-400 hover:text-ink">
          {dict.common.backToDashboard}
        </Link>
        <h1 className="font-display font-medium text-3xl text-ink mt-2">{dict.reservations.heading}</h1>
      </div>

      {error && (
        <p className="text-red-600 text-sm">{dict.common.errorPrefix} {error.message}</p>
      )}

      {!error && reservations?.length === 0 && (
        <p className="text-stone-500 text-sm">{dict.reservations.noReservationsFound}</p>
      )}

      {!error && reservations && reservations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="pb-3 pr-8 text-xs font-normal uppercase tracking-wide text-stone-400">{dict.reservations.colNome}</th>
                <th className="pb-3 pr-8 text-xs font-normal uppercase tracking-wide text-stone-400">{dict.reservations.colData}</th>
                <th className="pb-3 pr-8 text-xs font-normal uppercase tracking-wide text-stone-400">{dict.reservations.colOra}</th>
                <th className="pb-3 pr-8 text-xs font-normal uppercase tracking-wide text-stone-400">{dict.reservations.colOspiti}</th>
                <th className="pb-3 pr-8 text-xs font-normal uppercase tracking-wide text-stone-400">{dict.reservations.colStato}</th>
                <th className="pb-3 text-xs font-normal uppercase tracking-wide text-stone-400">{dict.reservations.colTable}</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => {
                const cancelled = r.stato === 'cancellata'
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-line ${cancelled ? 'opacity-40' : ''}`}
                  >
                    <td className="py-3 pr-8 text-ink">{r.nome}</td>
                    <td className="py-3 pr-8 text-ink">{formatDate(r.data)}</td>
                    <td className="py-3 pr-8 text-ink">{formatTime(r.ora)}</td>
                    <td className="py-3 pr-8 text-ink">{r.ospiti}</td>
                    <td className="py-3 pr-8">
                      {cancelled ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8E4DE] text-stone-400">
                          {dict.reservations.statoCancellata}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#E6EDE4] text-sage">
                          {r.stato}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <TableSelect
                        reservationId={r.id}
                        currentTableId={r.table_id ?? null}
                        tables={tables ?? []}
                        unassignedLabel={dict.reservations.unassigned}
                      />
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
