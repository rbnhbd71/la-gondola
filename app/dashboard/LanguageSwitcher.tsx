'use client'
import { useTransition } from 'react'
import { setLocale } from '@/lib/i18n/setLocale'
import type { Locale } from '@/lib/i18n/dictionary'

const options: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'it', label: 'Italiano' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
]

export default function LanguageSwitcher({ current }: { current: Locale }) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      value={current}
      onChange={(e) => {
        const locale = e.target.value as Locale
        startTransition(async () => { await setLocale(locale) })
      }}
      disabled={isPending}
      className="text-sm text-ink bg-paper border border-line rounded-lg px-3 py-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-line cursor-pointer disabled:opacity-50"
    >
      {options.map(({ value, label }) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  )
}
