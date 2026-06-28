'use client'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { MonthBucket } from './types'

type Range = 1 | 3 | 6
type RawRes = { data: string; stato: string; ora: string }
type ChartPoint = { label: string; lunch: number; dinner: number }

type StatsDict = {
  heading: string
  lastMonth: string
  last3Months: string
  last6Months: string
  totalReservations: string
  newCustomers: string
  cancellationRate: string
  chartHeading: string
  vsPrevPeriod: string
  noDataYet: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function padDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Matches the `ora < '16:00:00'` boundary used in BookingCanvas.tsx
function isLunch(ora: string): boolean {
  return !!ora && ora < '16:00:00'
}

// ISO-week Monday (Mon–Sun, ISO 8601)
function isoWeekMonday(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  return padDate(d)
}

function formatDateLabel(dateStr: string, locale: string): string {
  const [y, m, day] = dateStr.split('-')
  return new Date(Number(y), Number(m) - 1, Number(day))
    .toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

function formatMonthLabel(key: string, locale: string): string {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString(locale, { month: 'short', year: '2-digit' })
}

// ── Chart data builder ────────────────────────────────────────────────────────

function buildChartData(
  raw: RawRes[],
  range: Range,
  startDateStr: string,
  todayStr: string,
  locale: string,
): ChartPoint[] {
  // Chart shows only past reservations (future-date exclusion) and non-cancelled
  const filtered = raw.filter(
    r => r.data >= startDateStr && r.data <= todayStr && r.stato !== 'cancellata'
  )

  if (range === 1) {
    // Daily: one group per calendar day
    const map = new Map<string, { lunch: number; dinner: number }>()
    const d = new Date(startDateStr + 'T12:00:00')
    while (true) {
      const key = padDate(d)
      if (key > todayStr) break
      map.set(key, { lunch: 0, dinner: 0 })
      d.setDate(d.getDate() + 1)
    }
    for (const r of filtered) {
      const entry = map.get(r.data)
      if (entry) isLunch(r.ora) ? entry.lunch++ : entry.dinner++
    }
    return Array.from(map.entries()).map(([key, v]) => ({
      label: formatDateLabel(key, locale), ...v,
    }))
  }

  if (range === 3) {
    // Weekly: one group per ISO week, starting from Monday on or before period start
    const periodStart = new Date(startDateStr + 'T12:00:00')
    const startDow = periodStart.getDay()
    const firstMonday = new Date(periodStart)
    firstMonday.setDate(firstMonday.getDate() - (startDow === 0 ? 6 : startDow - 1))
    firstMonday.setHours(12, 0, 0, 0)

    const map = new Map<string, { lunch: number; dinner: number }>()
    const w = new Date(firstMonday)
    while (padDate(w) <= todayStr) {
      map.set(padDate(w), { lunch: 0, dinner: 0 })
      w.setDate(w.getDate() + 7)
    }
    for (const r of filtered) {
      const monday = isoWeekMonday(r.data)
      const entry = map.get(monday)
      if (entry) isLunch(r.ora) ? entry.lunch++ : entry.dinner++
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({ label: formatDateLabel(key, locale), ...v }))
  }

  // Monthly: one group per calendar month for the last 6 months
  const now = new Date()
  const map = new Map<string, { lunch: number; dinner: number }>()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    map.set(key, { lunch: 0, dinner: 0 })
  }
  for (const r of filtered) {
    const key = r.data.slice(0, 7)
    const entry = map.get(key)
    if (entry) isLunch(r.ora) ? entry.lunch++ : entry.dinner++
  }
  return Array.from(map.entries()).map(([key, v]) => ({
    label: formatMonthLabel(key, locale), ...v,
  }))
}

// ── Stat helpers ──────────────────────────────────────────────────────────────

function cancellationPct(cancelled: number, total: number): string {
  if (total === 0) return '—'
  return `${Math.round((cancelled / total) * 100)}%`
}

function computeDelta(
  current: number,
  prev: number,
): { label: string; color: string } | null {
  if (prev === 0) return null
  const d = Math.round(((current - prev) / prev) * 100)
  if (d > 0) return { label: `↑ ${d}%`, color: 'text-sage' }
  if (d < 0) return { label: `↓ ${Math.abs(d)}%`, color: 'text-clay-dark' }
  return { label: '= 0%', color: 'text-ink-faint' }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StatsClient({
  buckets,
  rawReservations,
  locale,
  dict,
  lunchLabel,
  dinnerLabel,
}: {
  buckets: MonthBucket[]
  rawReservations: RawRes[]
  locale: string
  dict: StatsDict
  lunchLabel: string
  dinnerLabel: string
}) {
  const [range, setRange] = useState<Range>(3)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // todayStr computed once; used for chart (future-date exclusion) and subtotals
  const todayDate = new Date()
  todayDate.setHours(12, 0, 0, 0)
  const todayStr = padDate(todayDate)

  // Always 12 buckets: index 0 = oldest, index 11 = current month
  const currentPeriod = buckets.slice(12 - range)
  const prevPeriod = buckets.slice(12 - 2 * range, 12 - range)

  // Stat-card totals from MonthBuckets (unchanged)
  const totalRes = currentPeriod.reduce((s, b) => s + b.reservations, 0)
  const totalCancelled = currentPeriod.reduce((s, b) => s + b.cancelled, 0)
  const totalCustomers = currentPeriod.reduce((s, b) => s + b.newCustomers, 0)
  const prevTotalRes = prevPeriod.reduce((s, b) => s + b.reservations, 0)
  const resDelta = computeDelta(totalRes, prevTotalRes)

  // Lunch/dinner subtotals: filter by the exact months in currentPeriod
  // (no today-cap, so lunchTotal + dinnerTotal === totalRes exactly)
  const periodMonths = new Set(currentPeriod.map(b => b.month))
  const periodRaw = rawReservations.filter(
    r => periodMonths.has(r.data.slice(0, 7)) && r.stato !== 'cancellata'
  )
  const lunchTotal = periodRaw.filter(r => isLunch(r.ora)).length
  const dinnerTotal = periodRaw.filter(r => !isLunch(r.ora)).length

  // Chart data re-grouped per range with lunch/dinner split
  const startDateStr = buckets[12 - range].month + '-01'
  const chartData = buildChartData(rawReservations, range, startDateStr, todayStr, locale)

  const hasData = totalRes + totalCancelled > 0
  const xInterval = range === 1 ? 4 : range === 3 ? 1 : 0

  const ranges: { value: Range; label: string }[] = [
    { value: 1, label: dict.lastMonth },
    { value: 3, label: dict.last3Months },
    { value: 6, label: dict.last6Months },
  ]

  return (
    <div>
      {/* ── Range toggle ─────────────────────────────────────── */}
      <div className="flex rounded-md border border-line overflow-hidden w-fit mb-8">
        {ranges.map(({ value, label }, i) => (
          <button
            key={value}
            onClick={() => setRange(value)}
            className={`text-sm px-4 py-2 transition-colors ${
              i < ranges.length - 1 ? 'border-r border-line' : ''
            } ${
              range === value
                ? 'bg-clay text-white'
                : 'text-ink-soft hover:bg-surface-sunk'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Total reservations with lunch/dinner breakdown */}
        <div className="bg-surface rounded-xl border border-line p-5">
          <p className="text-xs text-ink-faint uppercase tracking-wide mb-3">
            {dict.totalReservations}
          </p>
          <p className="font-display font-medium text-4xl text-ink">{totalRes}</p>
          {totalRes > 0 && (
            <p className="text-xs mt-1.5 text-ink-faint">
              <span style={{ color: '#C2693D' }}>{lunchTotal}</span>
              {' '}{lunchLabel}
              {' · '}
              <span style={{ color: '#5C7C8C' }}>{dinnerTotal}</span>
              {' '}{dinnerLabel}
            </p>
          )}
          {resDelta ? (
            <p className={`text-xs mt-1 ${resDelta.color}`}>
              {resDelta.label} {dict.vsPrevPeriod}
            </p>
          ) : (
            <p className="text-xs mt-1 text-ink-faint">— {dict.vsPrevPeriod}</p>
          )}
        </div>

        {/* New customers */}
        <div className="bg-surface rounded-xl border border-line p-5">
          <p className="text-xs text-ink-faint uppercase tracking-wide mb-3">
            {dict.newCustomers}
          </p>
          <p className="font-display font-medium text-4xl text-ink">{totalCustomers}</p>
        </div>

        {/* Cancellation rate */}
        <div className="bg-surface rounded-xl border border-line p-5">
          <p className="text-xs text-ink-faint uppercase tracking-wide mb-3">
            {dict.cancellationRate}
          </p>
          <p className="font-display font-medium text-4xl text-ink">
            {cancellationPct(totalCancelled, totalRes + totalCancelled)}
          </p>
          {hasData && (
            <p className="text-xs mt-1.5 text-ink-faint">
              {totalCancelled} / {totalRes + totalCancelled}
            </p>
          )}
        </div>
      </div>

      {/* ── Bar chart ────────────────────────────────────────── */}
      <div className="bg-surface rounded-xl border border-line p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-medium text-lg text-ink">
            {dict.chartHeading}
          </h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-ink-soft">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ background: '#C2693D' }} />
              {lunchLabel}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-ink-soft">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ background: '#5C7C8C' }} />
              {dinnerLabel}
            </span>
          </div>
        </div>
        {!hasData ? (
          <div className="flex items-center justify-center h-[240px]">
            <p className="text-sm text-ink-soft">{dict.noDataYet}</p>
          </div>
        ) : mounted ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis
                dataKey="label"
                interval={xInterval}
                tick={{ fontSize: 11, fill: 'var(--ink-faint)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--ink-faint)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--ink)',
                }}
                cursor={{ fill: 'var(--surface-sunk)' }}
              />
              <Bar dataKey="lunch" name={lunchLabel} fill="#C2693D" radius={[4, 4, 0, 0]} />
              <Bar dataKey="dinner" name={dinnerLabel} fill="#5C7C8C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[240px] bg-surface-sunk rounded-lg" />
        )}
      </div>
    </div>
  )
}
