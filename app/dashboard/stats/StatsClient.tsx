'use client'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { MonthBucket } from './types'

type Range = 1 | 3 | 6
type RawRes = { data: string; stato: string }
type ChartPoint = { label: string; reservations: number }

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

// ── Date helpers ──────────────────────────────────────────────────────────────

function padDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ISO-week Monday (Mon–Sun, ISO 8601) for a YYYY-MM-DD string.
function isoWeekMonday(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const dow = d.getDay() // 0=Sun … 6=Sat
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
  locale: string,
): ChartPoint[] {
  const filtered = raw.filter(r => r.data >= startDateStr && r.stato !== 'cancellata')

  const todayDate = new Date()
  todayDate.setHours(12, 0, 0, 0)
  const todayStr = padDate(todayDate)

  if (range === 1) {
    // Daily: one bar per calendar day from period start → today
    const map = new Map<string, number>()
    const d = new Date(startDateStr + 'T12:00:00')
    while (true) {
      const key = padDate(d)
      if (key > todayStr) break
      map.set(key, 0)
      d.setDate(d.getDate() + 1)
    }
    for (const r of filtered) {
      if (r.data <= todayStr && map.has(r.data)) {
        map.set(r.data, (map.get(r.data) ?? 0) + 1)
      }
    }
    return Array.from(map.entries()).map(([key, count]) => ({
      label: formatDateLabel(key, locale),
      reservations: count,
    }))
  }

  if (range === 3) {
    // Weekly: one bar per ISO week (Mon–Sun). Weeks start on the Monday
    // on or before the period start; iterate forward while Monday ≤ today.
    const periodStart = new Date(startDateStr + 'T12:00:00')
    const startDow = periodStart.getDay()
    const firstMonday = new Date(periodStart)
    firstMonday.setDate(firstMonday.getDate() - (startDow === 0 ? 6 : startDow - 1))
    firstMonday.setHours(12, 0, 0, 0)

    const map = new Map<string, number>()
    const w = new Date(firstMonday)
    while (padDate(w) <= todayStr) {
      map.set(padDate(w), 0)
      w.setDate(w.getDate() + 7)
    }
    for (const r of filtered) {
      if (r.data <= todayStr) {
        const monday = isoWeekMonday(r.data)
        if (map.has(monday)) {
          map.set(monday, (map.get(monday) ?? 0) + 1)
        }
      }
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => ({
        label: formatDateLabel(key, locale),
        reservations: count,
      }))
  }

  // Monthly (range === 6): one bar per calendar month for the last 6 months
  const now = new Date()
  const map = new Map<string, number>()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    map.set(key, 0)
  }
  for (const r of filtered) {
    const key = r.data.slice(0, 7)
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([key, count]) => ({
    label: formatMonthLabel(key, locale),
    reservations: count,
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
}: {
  buckets: MonthBucket[]
  rawReservations: RawRes[]
  locale: string
  dict: StatsDict
}) {
  const [range, setRange] = useState<Range>(3)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Always 12 buckets: index 0 = oldest, index 11 = current month
  const currentPeriod = buckets.slice(12 - range)
  const prevPeriod = buckets.slice(12 - 2 * range, 12 - range)

  // Stat-card totals always derived from MonthBuckets (period-level, unchanged)
  const totalRes = currentPeriod.reduce((s, b) => s + b.reservations, 0)
  const totalCancelled = currentPeriod.reduce((s, b) => s + b.cancelled, 0)
  const totalCustomers = currentPeriod.reduce((s, b) => s + b.newCustomers, 0)
  const prevTotalRes = prevPeriod.reduce((s, b) => s + b.reservations, 0)
  const resDelta = computeDelta(totalRes, prevTotalRes)

  // Chart granularity is range-dependent; re-groups raw rows client-side
  const startDateStr = buckets[12 - range].month + '-01'
  const chartData = buildChartData(rawReservations, range, startDateStr, locale)

  const hasData = totalRes + totalCancelled > 0

  // Reduce label density for high-bar-count views
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
        <div className="bg-surface rounded-xl border border-line p-5">
          <p className="text-xs text-ink-faint uppercase tracking-wide mb-3">
            {dict.totalReservations}
          </p>
          <p className="font-display font-medium text-4xl text-ink">{totalRes}</p>
          {resDelta ? (
            <p className={`text-xs mt-1.5 ${resDelta.color}`}>
              {resDelta.label} {dict.vsPrevPeriod}
            </p>
          ) : (
            <p className="text-xs mt-1.5 text-ink-faint">— {dict.vsPrevPeriod}</p>
          )}
        </div>

        <div className="bg-surface rounded-xl border border-line p-5">
          <p className="text-xs text-ink-faint uppercase tracking-wide mb-3">
            {dict.newCustomers}
          </p>
          <p className="font-display font-medium text-4xl text-ink">{totalCustomers}</p>
        </div>

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
        <h2 className="font-display font-medium text-lg text-ink mb-6">
          {dict.chartHeading}
        </h2>
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
              <Bar dataKey="reservations" fill="#C2693D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[240px] bg-surface-sunk rounded-lg" />
        )}
      </div>
    </div>
  )
}
