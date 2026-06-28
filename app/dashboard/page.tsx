import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/getLocale'
import { dictionary } from '@/lib/i18n/dictionary'
import { CalendarDays, UserPlus, Users, MessageCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

function formatTime(timeStr: string) {
  return timeStr?.slice(0, 5) ?? ''
}

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  note,
}: {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  label: string
  value: string | number
  note?: string
}) {
  return (
    <div className="bg-surface rounded-xl border border-line p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <p className="text-xs text-ink-faint uppercase tracking-wide">{label}</p>
      </div>
      <p className="font-display font-medium text-4xl text-ink">{value}</p>
      {note && <p className="text-xs text-ink-faint mt-1.5 italic">{note}</p>}
    </div>
  )
}

function RingChart({
  pct,
  color,
  label,
  note,
}: {
  pct: number
  color: string
  label: string
  note?: string
}) {
  const r = 28
  const c = 2 * Math.PI * r
  const safe = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0
  const dash = (safe / 100) * c
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--line)" strokeWidth="7" />
        <circle
          cx="40" cy="40" r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 40 40)"
        />
        <text
          x="40" y="40"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="500"
          fill="var(--ink)"
          className="font-display"
        >
          {safe}%
        </text>
      </svg>
      <p className="text-xs text-ink-soft text-center leading-tight max-w-[80px]">{label}</p>
      {note && (
        <p className="text-[10px] text-ink-faint italic text-center leading-tight max-w-[80px]">
          {note}
        </p>
      )}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const locale = await getLocale()
  const dict = dictionary[locale]

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, nome_ristorante')
    .eq('owner_id', user.id)
    .single()

  if (!restaurant) {
    return (
      <div className="p-10">
        <p className="text-red-600 text-sm">{dict.common.noRestaurantFound}</p>
      </div>
    )
  }

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const hour = now.getHours()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const firstOfMonthDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const service: 'lunch' | 'dinner' = hour < 16 ? 'lunch' : 'dinner'

  const greeting =
    hour < 12 ? dict.dashboard.greetingMorning
    : hour < 17 ? dict.dashboard.greetingAfternoon
    : dict.dashboard.greetingEvening

  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now)

  let floorResQuery = supabase
    .from('reservations')
    .select('table_id')
    .eq('restaurant_id', restaurant.id)
    .eq('data', today)
    .neq('stato', 'cancellata')
    .not('table_id', 'is', null)
  if (service === 'lunch') floorResQuery = floorResQuery.lt('ora', '16:00:00')
  else floorResQuery = floorResQuery.gte('ora', '16:00:00')

  const [
    { count: todayCount },
    { count: newCustomersCount },
    { data: upcoming },
    { data: tables },
    { data: floorReservations },
    { count: birthdaySentCount },
    { data: topCustomers },
    { data: resThisMonth },
    { count: repeatCustomersCount },
    { count: totalCustomersCount },
  ] = await Promise.all([
    supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id)
      .eq('data', today)
      .neq('stato', 'cancellata'),
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id)
      .gte('created_at', firstOfMonth),
    supabase
      .from('reservations')
      .select('id, nome, data, ora, ospiti, stato, table_id')
      .eq('restaurant_id', restaurant.id)
      .gte('data', today)
      .neq('stato', 'cancellata')
      .order('data', { ascending: true })
      .order('ora', { ascending: true })
      .limit(8),
    supabase
      .from('tables')
      .select('id, label, capacity')
      .eq('restaurant_id', restaurant.id)
      .order('label', { ascending: true }),
    floorResQuery,
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id)
      .not('ultimo_messaggio_compleanno', 'is', null),
    supabase
      .from('customers')
      .select('id, nome, visite')
      .eq('restaurant_id', restaurant.id)
      .order('visite', { ascending: false })
      .limit(5),
    supabase
      .from('reservations')
      .select('stato')
      .eq('restaurant_id', restaurant.id)
      .gte('data', firstOfMonthDate),
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id)
      .gt('visite', 1),
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id),
  ])

  const tableLabel = new Map((tables ?? []).map(t => [t.id, t.label]))
  const bookedTableIds = new Set(
    (floorReservations ?? []).map(r => r.table_id as string)
  )

  const totalThisMonth = (resThisMonth ?? []).length
  const nonCancelledThisMonth = (resThisMonth ?? []).filter(r => r.stato !== 'cancellata').length
  const fulfillmentPct = totalThisMonth > 0
    ? Math.round(nonCancelledThisMonth / totalThisMonth * 100)
    : 0
  const repeatPct = (totalCustomersCount ?? 0) > 0
    ? Math.round((repeatCustomersCount ?? 0) / (totalCustomersCount ?? 0) * 100)
    : 0

  return (
    <div className="p-10 max-w-6xl">

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="text-xs text-ink-faint uppercase tracking-wide mb-1">
          {formattedDate}
        </p>
        <h1 className="font-display font-medium text-3xl text-ink">
          {greeting}, {restaurant.nome_ristorante}
        </h1>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={CalendarDays}
          iconBg="bg-clay-tint"
          iconColor="text-clay-dark"
          label={dict.dashboard.statReservationsToday}
          value={todayCount ?? 0}
        />
        <StatCard
          icon={UserPlus}
          iconBg="bg-sky-tint"
          iconColor="text-sky"
          label={dict.dashboard.statNewCustomers}
          value={newCustomersCount ?? 0}
        />
        <StatCard
          icon={Users}
          iconBg="bg-sage-tint"
          iconColor="text-sage"
          label={dict.dashboard.statOccupancy}
          value="78%"
          note={dict.dashboard.estimateNote}
        />
        <StatCard
          icon={MessageCircle}
          iconBg="bg-amber-tint"
          iconColor="text-amber"
          label={dict.dashboard.statAiHandled}
          value="91%"
          note={dict.dashboard.estimateNote}
        />
      </div>

      {/* ── Upcoming + mini floor plan ────────────────────────────── */}
      <div className="grid grid-cols-3 gap-6 mb-8">

        {/* Upcoming reservations */}
        <div className="col-span-2 bg-surface rounded-xl border border-line p-6">
          <h2 className="font-display font-medium text-lg text-ink mb-4">
            {dict.dashboard.upcomingHeading}
          </h2>
          {!upcoming || upcoming.length === 0 ? (
            <p className="text-sm text-ink-soft">{dict.dashboard.noUpcoming}</p>
          ) : (
            <div className="divide-y divide-line">
              {upcoming.map((r) => (
                <div key={r.id} className="flex items-center gap-4 py-3 text-sm">
                  <span className="text-ink-faint w-11 shrink-0 tabular-nums">
                    {formatTime(r.ora)}
                  </span>
                  <span className="font-medium text-ink flex-1 truncate">
                    {r.nome ?? '—'}
                  </span>
                  <span className="text-ink-soft shrink-0">
                    {r.ospiti} {dict.floorPlan.guests}
                  </span>
                  <span className="text-ink-faint shrink-0 w-16 text-right truncate">
                    {r.table_id ? (tableLabel.get(r.table_id) ?? '—') : '—'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    r.stato === 'cancellata'
                      ? 'bg-surface-sunk text-ink-faint'
                      : 'bg-sage-tint text-sage'
                  }`}>
                    {r.stato === 'cancellata' ? dict.reservations.statoCancellata : r.stato}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mini floor plan */}
        <div className="bg-surface rounded-xl border border-line p-6 flex flex-col">
          <h2 className="font-display font-medium text-lg text-ink mb-1">
            {dict.dashboard.floorTonightHeading}
          </h2>
          <p className="text-xs text-ink-faint mb-4">
            {service === 'lunch' ? dict.dashboard.floorLunch : dict.dashboard.floorDinner}
          </p>
          {!tables || tables.length === 0 ? (
            <p className="text-sm text-ink-soft flex-1">{dict.floorPlan.noTablesFound}</p>
          ) : (
            <div className="flex flex-wrap gap-2 flex-1 content-start">
              {tables.map((t) => (
                <div
                  key={t.id}
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${
                    bookedTableIds.has(t.id)
                      ? 'bg-clay-tint text-clay-dark'
                      : 'bg-surface-sunk text-ink-soft'
                  }`}
                >
                  {t.label}
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-4 text-xs text-ink-faint mt-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-clay" />
              {dict.dashboard.legendBooked}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-line" />
              {dict.dashboard.legendFree}
            </span>
          </div>
          <Link
            href="/dashboard/floor-plan"
            className="text-xs text-clay-dark hover:text-clay mt-3 transition-colors"
          >
            {dict.dashboard.viewFloorPlan}
          </Link>
        </div>
      </div>

      {/* ── Performance rings ────────────────────────────────────── */}
      <div className="bg-surface rounded-xl border border-line px-8 py-6 mb-8">
        <div className="grid grid-cols-4 gap-4">
          <RingChart
            pct={78}
            color="#C2693D"
            label={dict.dashboard.perfOccupancy}
            note={dict.dashboard.estimateNote}
          />
          <RingChart
            pct={fulfillmentPct}
            color="#74875F"
            label={dict.dashboard.perfFulfillment}
          />
          <RingChart
            pct={repeatPct}
            color="#5C7C8C"
            label={dict.dashboard.perfRepeatCustomers}
          />
          <RingChart
            pct={91}
            color="#C99A3C"
            label={dict.dashboard.perfAiHandled}
            note={dict.dashboard.estimateNote}
          />
        </div>
      </div>

      {/* ── Campaigns strip ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-sunk rounded-xl p-5">
          <h3 className="font-display font-medium text-base text-ink mb-3">
            {dict.campaigns.birthdayMessages}
          </h3>
          <p className="font-display font-medium text-4xl text-clay mb-1">
            {birthdaySentCount ?? 0}
          </p>
          <p className="text-xs text-ink-soft">{dict.dashboard.birthdaySentLabel}</p>
        </div>
        <div className="bg-surface-sunk rounded-xl p-5">
          <h3 className="font-display font-medium text-base text-ink mb-2">
            {dict.campaigns.winbackTitle}
          </h3>
          <p className="text-sm text-ink-soft mb-4">{dict.campaigns.winbackDescription}</p>
          <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-clay-tint text-ink-soft">
            {dict.campaigns.comingSoon}
          </span>
        </div>
        <div className="bg-surface-sunk rounded-xl p-5">
          <h3 className="font-display font-medium text-base text-ink mb-2">
            {dict.campaigns.seasonalTitle}
          </h3>
          <p className="text-sm text-ink-soft mb-4">{dict.campaigns.seasonalDescription}</p>
          <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-clay-tint text-ink-soft">
            {dict.campaigns.comingSoon}
          </span>
        </div>
      </div>

      {/* ── Top customers ────────────────────────────────────────── */}
      <div className="bg-surface rounded-xl border border-line p-6">
        <h2 className="font-display font-medium text-lg text-ink mb-4">
          {dict.dashboard.topCustomersHeading}
        </h2>
        {!topCustomers || topCustomers.length === 0 ? (
          <p className="text-sm text-ink-soft">{dict.customers.noCustomersFound}</p>
        ) : (
          <div className="divide-y divide-line">
            {topCustomers.map((c, i) => (
              <div key={c.id} className="flex items-center gap-4 py-3 text-sm">
                <span className="text-ink-faint w-5 text-center shrink-0">{i + 1}</span>
                <span className="font-medium text-ink flex-1 truncate">{c.nome ?? '—'}</span>
                <span className="text-ink-soft shrink-0">
                  {c.visite} {dict.dashboard.visits}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
