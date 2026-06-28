import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/getLocale'
import { dictionary } from '@/lib/i18n/dictionary'
import BirthdayCell from './BirthdayCell'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatPhone(telefono: string) {
  return telefono.replace('whatsapp:', '')
}

export default async function CustomersPage() {
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

  const { data: customers, error } = await supabase
    .from('customers')
    .select('id, nome, telefono, visite, ultima_visita, note, compleanno')
    .eq('restaurant_id', restaurant.id)
    .order('ultima_visita', { ascending: false })

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-stone-400 hover:text-ink">
          {dict.common.backToDashboard}
        </Link>
        <h1 className="font-display font-medium text-3xl text-ink mt-2">{dict.customers.heading}</h1>
      </div>

      {error && (
        <p className="text-red-600 text-sm">{dict.common.errorPrefix} {error.message}</p>
      )}

      {!error && customers?.length === 0 && (
        <p className="text-stone-500 text-sm">{dict.customers.noCustomersFound}</p>
      )}

      {!error && customers && customers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="pb-3 pr-8 text-xs font-normal uppercase tracking-wide text-stone-400">{dict.customers.colNome}</th>
                <th className="pb-3 pr-8 text-xs font-normal uppercase tracking-wide text-stone-400">{dict.customers.colTelefono}</th>
                <th className="pb-3 pr-8 text-xs font-normal uppercase tracking-wide text-stone-400">{dict.customers.colVisite}</th>
                <th className="pb-3 pr-8 text-xs font-normal uppercase tracking-wide text-stone-400">{dict.customers.colUltimaVisita}</th>
                <th className="pb-3 pr-8 text-xs font-normal uppercase tracking-wide text-stone-400">{dict.customers.colCompleanno}</th>
                <th className="pb-3 text-xs font-normal uppercase tracking-wide text-stone-400">{dict.customers.colNote}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-line">
                  <td className="py-3 pr-8 text-ink">{c.nome}</td>
                  <td className="py-3 pr-8 text-stone-500">{formatPhone(c.telefono)}</td>
                  <td className="py-3 pr-8 text-ink">{c.visite}</td>
                  <td className="py-3 pr-8 text-ink">{c.ultima_visita ? formatDate(c.ultima_visita) : '—'}</td>
                  <td className="py-3 pr-8">
                    <BirthdayCell
                      customerId={c.id}
                      initial={c.compleanno ?? null}
                      tEdit={dict.birthday.edit}
                      tSaving={dict.birthday.saving}
                    />
                  </td>
                  <td className="py-3 text-stone-500">{c.note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
