import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  const { data: customers, error } = await supabase
    .from('customers')
    .select('id, nome, telefono, visite, ultima_visita, note')
    .eq('restaurant_id', restaurant.id)
    .order('ultima_visita', { ascending: false })

  return (
    <div className="min-h-screen p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Customers</h1>
      </div>

      {error && (
        <p className="text-red-600 text-sm">Error: {error.message}</p>
      )}

      {!error && customers?.length === 0 && (
        <p className="text-gray-500 text-sm">No customers found.</p>
      )}

      {!error && customers && customers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500 font-medium">
                <th className="pb-3 pr-8">Nome</th>
                <th className="pb-3 pr-8">Telefono</th>
                <th className="pb-3 pr-8">Visite</th>
                <th className="pb-3 pr-8">Ultima Visita</th>
                <th className="pb-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="py-3 pr-8">{c.nome}</td>
                  <td className="py-3 pr-8 text-gray-500">{formatPhone(c.telefono)}</td>
                  <td className="py-3 pr-8">{c.visite}</td>
                  <td className="py-3 pr-8">{c.ultima_visita ? formatDate(c.ultima_visita) : '—'}</td>
                  <td className="py-3 text-gray-500">{c.note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
