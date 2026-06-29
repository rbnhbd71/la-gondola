'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

type ChartPoint = { label: string; reservations: number; conversations: number }

export default function UsageChart({ data }: { data: ChartPoint[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <div className="h-[240px] bg-surface-sunk rounded-lg" />

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
        <XAxis
          dataKey="label"
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
        <Bar dataKey="reservations" name="Reservations" fill="#C2693D" radius={[4, 4, 0, 0]} />
        <Bar dataKey="conversations" name="Conversations" fill="#5C7C8C" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
