'use client'

import { useState, useTransition } from 'react'
import { updateBilling } from './actions'
import type { BillingData } from './actions'

type BillingStatus = 'trial' | 'active' | 'paused' | 'cancelled'

const statusStyles: Record<BillingStatus, { bg: string; color: string }> = {
  trial:     { bg: '#F5EDD6', color: '#C99A3C' },
  active:    { bg: '#E0EAD6', color: '#74875F' },
  paused:    { bg: '#EDEBE8', color: '#6B655C' },
  cancelled: { bg: '#F6E3D7', color: '#9A4E2A' },
}

const inputCls = 'block w-full text-sm border border-line rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-line'
const readOnlyCls = 'block w-full text-sm text-ink py-2'
const labelCls = 'block text-xs font-normal text-ink-faint uppercase tracking-wide mb-1'

export default function BillingForm({
  billing,
  restaurantId,
}: {
  billing: BillingData | null
  restaurantId: string
}) {
  const initial: BillingData = {
    billing_status: billing?.billing_status ?? 'trial',
    billing_notes: billing?.billing_notes ?? null,
    monthly_rate: billing?.monthly_rate != null ? Number(billing.monthly_rate) : null,
    client_since: billing?.client_since ?? null,
  }

  const [editing, setEditing] = useState(false)
  const [fields, setFields] = useState<BillingData>(initial)
  const [committed, setCommitted] = useState<BillingData>(initial)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function set<K extends keyof BillingData>(key: K, value: BillingData[K]) {
    setFields(prev => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  function handleEdit() { setEditing(true); setSuccess(false); setError(null) }
  function handleCancel() { setFields(committed); setEditing(false); setError(null) }

  function handleSave() {
    startTransition(async () => {
      setError(null)
      const result = await updateBilling(restaurantId, fields)
      if (result.error) {
        setError(result.error)
      } else {
        setCommitted(fields)
        setSuccess(true)
        setEditing(false)
      }
    })
  }

  const style = statusStyles[(committed.billing_status as BillingStatus)] ?? statusStyles.trial

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {!editing ? (
          <button
            onClick={handleEdit}
            className="text-sm px-4 py-2 bg-clay text-white rounded-md hover:bg-clay-dark transition-colors"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="text-sm px-4 py-2 bg-clay text-white rounded-md hover:bg-clay-dark disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="text-sm px-4 py-2 border border-line rounded-md hover:bg-surface-sunk disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {success && <p className="text-sage text-sm mb-6">Saved successfully.</p>}
      {error && <p className="text-red-600 text-sm mb-6">Error: {error}</p>}

      <div className="grid grid-cols-2 gap-6 max-w-lg">
        {/* Billing status */}
        <div>
          <label className={labelCls}>Billing status</label>
          {editing ? (
            <select
              value={fields.billing_status}
              onChange={e => set('billing_status', e.target.value)}
              className={inputCls}
            >
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          ) : (
            <span
              className="inline-block px-2 py-0.5 rounded text-xs font-medium"
              style={{ background: style.bg, color: style.color }}
            >
              {committed.billing_status}
            </span>
          )}
        </div>

        {/* Monthly rate */}
        <div>
          <label className={labelCls}>Monthly rate (€)</label>
          {editing ? (
            <input
              type="number"
              min="0"
              step="0.01"
              value={fields.monthly_rate ?? ''}
              onChange={e => set('monthly_rate', e.target.value !== '' ? Number(e.target.value) : null)}
              placeholder="0.00"
              className={inputCls}
            />
          ) : (
            <p className={readOnlyCls}>
              {committed.monthly_rate != null ? `€${Number(committed.monthly_rate).toFixed(2)}` : '—'}
            </p>
          )}
        </div>

        {/* Client since */}
        <div>
          <label className={labelCls}>Client since</label>
          {editing ? (
            <input
              type="date"
              value={fields.client_since ?? ''}
              onChange={e => set('client_since', e.target.value || null)}
              className={inputCls}
            />
          ) : (
            <p className={readOnlyCls}>
              {committed.client_since
                ? new Date(committed.client_since).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </p>
          )}
        </div>

        {/* Billing notes — full width */}
        <div className="col-span-2">
          <label className={labelCls}>Billing notes</label>
          {editing ? (
            <textarea
              rows={3}
              value={fields.billing_notes ?? ''}
              onChange={e => set('billing_notes', e.target.value || null)}
              placeholder="Internal notes about billing, contract details, etc."
              className={inputCls}
            />
          ) : (
            <p className={`${readOnlyCls} whitespace-pre-wrap`}>
              {committed.billing_notes ?? <span className="text-ink-faint">—</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
