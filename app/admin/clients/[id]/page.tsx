import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BillingForm, { type Tier } from './BillingForm'
import UsageChart from './UsageChart'
import type { BillingData } from './actions'

function padDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatMonth(key: string): string {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-GB', {
    month: 'short',
    year: '2-digit',
  })
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminRow } = await supabase
    .from('super_admins')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!adminRow) redirect('/dashboard')

  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const sixMonthsAgoStr = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`
  const thirtyDaysAgo = padDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30))

  const [
    { data: restaurant },
    { data: billingRaw },
    { data: reservations },
    { data: conversations },
    { data: customers },
    { data: tiersRaw },
  ] = await Promise.all([
    supabase
      .from('restaurants')
      .select('id, nome_ristorante, created_at')
      .eq('id', id)
      .single(),
    supabase
      .from('client_billing')
      .select('billing_status, billing_notes, monthly_rate, client_since, tier_id')
      .eq('restaurant_id', id)
      .maybeSingle(),
    supabase
      .from('reservations')
      .select('data, stato')
      .eq('restaurant_id', id)
      .gte('data', sixMonthsAgoStr),
    supabase
      .from('conversations')
      .select('updated_at, stato')
      .eq('restaurant_id', id),
    supabase
      .from('customers')
      .select('ultimo_messaggio_compleanno')
      .eq('restaurant_id', id),
    supabase
      .from('tiers')
      .select('id, name, monthly_message_limit, monthly_price')
      .order('monthly_price'),
  ])

  if (!restaurant) notFound()

  // ── Monthly buckets (6 months) ──────────────────────────────────────────────
  const months: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const resByMonth = new Map(months.map(m => [m, 0]))
  const convByMonth = new Map(months.map(m => [m, 0]))

  for (const r of reservations ?? []) {
    if ((r.stato as string) === 'cancellata') continue
    const key = (r.data as string).slice(0, 7)
    if (resByMonth.has(key)) resByMonth.set(key, (resByMonth.get(key) ?? 0) + 1)
  }

  for (const c of conversations ?? []) {
    const key = (c.updated_at as string).slice(0, 7)
    if (convByMonth.has(key)) convByMonth.set(key, (convByMonth.get(key) ?? 0) + 1)
  }

  const chartData = months.map(m => ({
    label: formatMonth(m),
    reservations: resByMonth.get(m) ?? 0,
    conversations: convByMonth.get(m) ?? 0,
  }))

  // ── Stat card numbers ────────────────────────────────────────────────────────
  const res30d = (reservations ?? []).filter(
    r => (r.stato as string) !== 'cancellata' && (r.data as string) >= thirtyDaysAgo,
  ).length
  const activeConversations = (conversations ?? []).filter(
    c => (c.stato as string) === 'aperta',
  ).length
  const totalCustomers = customers?.length ?? 0
  const totalCampaigns = (customers ?? []).filter(
    c => c.ultimo_messaggio_compleanno != null,
  ).length

  const billing: BillingData | null = billingRaw
    ? {
        billing_status: billingRaw.billing_status as string,
        billing_notes: billingRaw.billing_notes as string | null,
        monthly_rate: billingRaw.monthly_rate != null ? Number(billingRaw.monthly_rate) : null,
        client_since: billingRaw.client_since as string | null,
        tier_id: billingRaw.tier_id as string | null,
      }
    : null

  const tiers: Tier[] = (tiersRaw ?? []).map(t => ({
    id: t.id as string,
    name: t.name as string,
    monthly_message_limit: t.monthly_message_limit as number,
    monthly_price: Number(t.monthly_price),
  }))

  return (
    <div className="p-10 max-w-4xl">
      <div className="mb-8">
        <Link href="/admin/clients" className="text-sm text-ink-faint hover:text-ink transition-colors">
          ← Clients
        </Link>
        <h1 className="font-display font-medium text-3xl text-ink mt-2">
          {restaurant.nome_ristorante as string}
        </h1>
      </div>

      {/* ── Billing ──────────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="font-display font-medium text-lg text-ink mb-4">Billing</h2>
        <div className="bg-surface rounded-xl border border-line p-6">
          <BillingForm billing={billing} restaurantId={id} tiers={tiers} />
        </div>
      </section>

      {/* ── Usage ────────────────────────────────────────────────────────────── */}
      <section>
        <h2 className="font-display font-medium text-lg text-ink mb-4">Usage</h2>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-surface rounded-xl border border-line p-4">
            <p className="text-xs text-ink-faint uppercase tracking-wide mb-2">Reservations (30d)</p>
            <p className="font-display font-medium text-3xl text-ink">{res30d}</p>
          </div>
          <div className="bg-surface rounded-xl border border-line p-4">
            <p className="text-xs text-ink-faint uppercase tracking-wide mb-2">Active conversations</p>
            <p className="font-display font-medium text-3xl text-ink">{activeConversations}</p>
          </div>
          <div className="bg-surface rounded-xl border border-line p-4">
            <p className="text-xs text-ink-faint uppercase tracking-wide mb-2">Total customers</p>
            <p className="font-display font-medium text-3xl text-ink">{totalCustomers}</p>
          </div>
          <div className="bg-surface rounded-xl border border-line p-4">
            <p className="text-xs text-ink-faint uppercase tracking-wide mb-2">Campaigns sent</p>
            <p className="font-display font-medium text-3xl text-ink">{totalCampaigns}</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-line p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-medium text-base text-ink">
              Activity (last 6 months)
            </h3>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                <span className="inline-block w-2 h-2 rounded-sm" style={{ background: '#C2693D' }} />
                Reservations
              </span>
              <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                <span className="inline-block w-2 h-2 rounded-sm" style={{ background: '#5C7C8C' }} />
                Conversations
              </span>
            </div>
          </div>
          <UsageChart data={chartData} />
          <p className="text-xs text-ink-faint mt-3">
            Conversations = WhatsApp threads active in each month (by last update time).
          </p>
        </div>
      </section>
    </div>
  )
}
