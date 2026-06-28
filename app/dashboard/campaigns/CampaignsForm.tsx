'use client'

import { useState, useTransition } from 'react'
import { updateBirthdayMessage } from './actions'

export type CampaignsFormDict = {
  edit: string
  save: string
  saving: string
  cancel: string
  templateLabel: string
  savedSuccessfully: string
}

const inputCls = 'block w-full text-sm border border-line rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-line'
const readOnlyCls = 'block w-full text-sm text-ink py-2 whitespace-pre-wrap'
const labelCls = 'block text-xs font-normal text-ink-faint uppercase tracking-wide mb-1'

export default function CampaignsForm({
  initial,
  t,
}: {
  initial: string
  t: CampaignsFormDict
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initial)
  const [committed, setCommitted] = useState(initial)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleEdit() { setEditing(true); setSuccess(false); setError(null) }
  function handleCancel() { setValue(committed); setEditing(false); setError(null) }

  function handleSave() {
    startTransition(async () => {
      setError(null)
      const result = await updateBirthdayMessage(value)
      if (result.error) {
        setError(result.error)
      } else {
        setCommitted(value)
        setSuccess(true)
        setEditing(false)
      }
    })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {!editing ? (
          <button
            onClick={handleEdit}
            className="text-sm px-4 py-2 bg-clay text-white rounded-md hover:bg-clay-dark"
          >
            {t.edit}
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="text-sm px-4 py-2 bg-clay text-white rounded-md hover:bg-clay-dark disabled:opacity-50"
            >
              {isPending ? t.saving : t.save}
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="text-sm px-4 py-2 border border-line rounded-md hover:bg-surface-sunk disabled:opacity-50"
            >
              {t.cancel}
            </button>
          </>
        )}
      </div>

      {success && <p className="text-sage text-sm mb-6">{t.savedSuccessfully}</p>}
      {error && <p className="text-red-600 text-sm mb-6">Error: {error}</p>}

      <div className="max-w-lg">
        <label className={labelCls}>{t.templateLabel}</label>
        {editing ? (
          <textarea
            rows={5}
            value={value}
            onChange={(e) => { setValue(e.target.value); setSuccess(false) }}
            className={inputCls}
          />
        ) : (
          <p className={readOnlyCls}>{committed || '—'}</p>
        )}
      </div>
    </div>
  )
}
