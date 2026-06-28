'use client'

import { useState, useTransition } from 'react'
import { updateCompleanno } from './actions'

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function BirthdayCell({
  customerId,
  initial,
}: {
  customerId: string
  initial: string | null
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initial ?? '')
  const [saved, setSaved] = useState(initial)
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleBlur() {
    const newValue = value || null
    if (newValue === saved) {
      setEditing(false)
      return
    }
    startTransition(async () => {
      const result = await updateCompleanno(customerId, newValue)
      if (result.error) {
        setStatus('error')
        setErrorMsg(result.error)
        setEditing(false)
      } else {
        setSaved(newValue)
        setStatus('ok')
        setEditing(false)
      }
    })
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          disabled={isPending}
          className="text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50"
        />
        {isPending && <span className="text-xs text-gray-400">Saving…</span>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span>{formatDate(saved)}</span>
      {status === 'ok' && <span className="text-xs text-green-600">✓</span>}
      {status === 'error' && (
        <span className="text-xs text-red-600" title={errorMsg ?? ''}>✗</span>
      )}
      <button
        onClick={() => { setEditing(true); setStatus('idle') }}
        className="text-xs text-gray-400 hover:text-black"
      >
        Edit
      </button>
    </div>
  )
}
