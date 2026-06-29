'use client'
import { useState, useTransition } from 'react'
import { assignTable } from './actions'

type TableOption = { id: string; label: string }

export default function TableSelect({
  reservationId,
  currentTableId,
  tables,
  unassignedLabel,
}: {
  reservationId: string
  currentTableId: string | null
  tables: TableOption[]
  unassignedLabel: string
}) {
  const [value, setValue] = useState(currentTableId ?? '')
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newValue = e.target.value
    setValue(newValue)
    setErrorMsg(null)
    startTransition(async () => {
      const result = await assignTable(reservationId, newValue === '' ? null : newValue)
      if (result.error) {
        setValue(currentTableId ?? '')
        setErrorMsg(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-0.5">
      <select
        value={value}
        onChange={handleChange}
        disabled={isPending}
        className="text-sm border border-line rounded-md px-2 py-1 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-line disabled:opacity-50"
      >
        <option value="">{unassignedLabel}</option>
        {tables.map(t => (
          <option key={t.id} value={t.id}>{t.label}</option>
        ))}
      </select>
      {errorMsg && (
        <span className="text-xs text-red-600">{errorMsg}</span>
      )}
    </div>
  )
}
