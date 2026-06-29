import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type BillingStatus = 'trial' | 'active' | 'paused' | 'cancelled'

const statusStyles: Record<BillingStatus, { bg: string; color: string }> = {
  trial:     { bg: '#F5EDD6', color: '#C99A3C' },
  active:    { bg: '#E0EAD6', color: '#74875F' },
  paused:    { bg: '#EDEBE8', color: '#6B655C' },
  cancelled: { bg: '#F6E3D7', color: '#9A4E2A' },
}

function statusStyle(s: string | undefined): { bg: string; color: string } {
  return statusStyles[(s as BillingStatus) ?? 'trial'] ?? statusStyles.trial
}

export default async function AdminClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Belt-and-suspenders — layout already checked, but actions must re-verify
  const { data: adminRow } = await supabase
    .from('super_admins')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!adminRow) redirect('/dashboard')

  const [{ data: restaurants }, { data: billings }] = await Promise.all([
    supabase
      .from('restaurants')
      .select('id, nome_ristorante, created_at')
      .order('nome_ristorante'),
    supabase
      .from('client_billing')
      .select('restaurant_id, billing_status, monthly_rate, client_since'),
  ])

  const billingMap = new Map(
    (billings ?? []).map(b => [b.restaurant_id as string, b])
  )

  return (
    <div className="p-10 max-w-4xl">
      <h1 className="font-display font-medium text-3xl text-ink mb-8">Clients</h1>

      <div className="bg-surface rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left px-5 py-3 text-xs font-normal text-ink-faint uppercase tracking-wide">
                Restaurant
              </th>
              <th className="text-left px-5 py-3 text-xs font-normal text-ink-faint uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-5 py-3 text-xs font-normal text-ink-faint uppercase tracking-wide">
                Monthly rate
              </th>
              <th className="text-left px-5 py-3 text-xs font-normal text-ink-faint uppercase tracking-wide">
                Client since
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {(restaurants ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-ink-faint">
                  No clients yet.
                </td>
              </tr>
            )}
            {(restaurants ?? []).map(r => {
              const billing = billingMap.get(r.id)
              const style = statusStyle(billing?.billing_status)
              return (
                <tr
                  key={r.id}
                  className="border-b border-line last:border-0 hover:bg-surface-sunk transition-colors"
                >
                  <td className="px-5 py-4 font-medium text-ink">{r.nome_ristorante}</td>
                  <td className="px-5 py-4">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {billing?.billing_status ?? 'trial'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">
                    {billing?.monthly_rate != null
                      ? `€${Number(billing.monthly_rate).toFixed(2)}/mo`
                      : '—'}
                  </td>
                  <td className="px-5 py-4 text-ink-soft">
                    {billing?.client_since
                      ? new Date(billing.client_since as string).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/clients/${r.id}`}
                      className="text-xs text-clay hover:text-clay-dark transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
