'use client'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { MonthBucket } from './types'

type Range = 1 | 3 | 6

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

function formatMonth(key: string, locale: string): string {
  const [y, m] = key.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  return d.toLocaleDateString(locale, { month: 'short', year: '2-digit' })
}

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

export default function StatsClient({
  buckets,
  locale,
  dict,
}: {
  buckets: MonthBucket[]
  locale: string
  dict: StatsDict
}) {
  const [range, setRange] = useState<Range>(3)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Always 12 buckets: index 0 = oldest, index 11 = current month
  const currentPeriod = buckets.slice(12 - range)
  const prevPeriod = buckets.slice(12 - 2 * range, 12 - range)

  const totalRes = currentPeriod.reduce((s, b) => s + b.reservations, 0)
  const totalCancelled = currentPeriod.reduce((s, b) => s + b.cancelled, 0)
  const totalCustomers = currentPeriod.reduce((s, b) => s + b.newCustomers, 0)
  const prevTotalRes = prevPeriod.reduce((s, b) => s + b.reservations, 0)
  const resDelta = computeDelta(totalRes, prevTotalRes)

  const chartData = currentPeriod.map(b => ({
    month: formatMonth(b.month, locale),
    reservations: b.reservations,
  }))

  const hasData = totalRes + totalCancelled > 0

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
        {/* Total reservations */}
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
                dataKey="month"
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
