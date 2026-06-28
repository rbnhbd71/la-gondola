'use client'

import { useState, useTransition } from 'react'
import { updateRestaurantSettings, type RestaurantSettings } from './actions'

type FormFields = {
  nome_ristorante: string
  indirizzo: string
  numero_twilio_from: string
  capacita_totale: string
  max_gruppo_singolo: string
  orari_apertura: string
  accessibilita: string
  finestra_ore: string
  numero_manager: string
}

function toForm(s: RestaurantSettings): FormFields {
  return {
    ...s,
    capacita_totale: String(s.capacita_totale),
    max_gruppo_singolo: String(s.max_gruppo_singolo),
    finestra_ore: String(s.finestra_ore),
  }
}

function isPositiveInt(v: string): boolean {
  const n = Number(v)
  return Number.isInteger(n) && n > 0
}

const input = 'block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black'
const readOnly = 'block w-full text-sm text-gray-900 py-2'
const label = 'block text-xs font-medium text-gray-500 mb-1'

export default function SettingsForm({ initial }: { initial: RestaurantSettings }) {
  const [editing, setEditing] = useState(false)
  const [fields, setFields] = useState<FormFields>(toForm(initial))
  const [committed, setCommitted] = useState<FormFields>(toForm(initial))
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const numericErrors: Record<'capacita_totale' | 'max_gruppo_singolo' | 'finestra_ore', string | null> = {
    capacita_totale: isPositiveInt(fields.capacita_totale) ? null : 'Must be a positive whole number',
    max_gruppo_singolo: isPositiveInt(fields.max_gruppo_singolo) ? null : 'Must be a positive whole number',
    finestra_ore: isPositiveInt(fields.finestra_ore) ? null : 'Must be a positive whole number',
  }
  const hasErrors = Object.values(numericErrors).some(Boolean)

  function set(key: keyof FormFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  function handleEdit() {
    setEditing(true)
    setSuccess(false)
    setError(null)
  }

  function handleCancel() {
    setFields(committed)
    setEditing(false)
    setError(null)
  }

  function handleSave() {
    if (hasErrors) return
    const confirmed = window.confirm(
      'This will update the live restaurant settings used by the WhatsApp bot. Continue?'
    )
    if (!confirmed) return
    startTransition(async () => {
      setError(null)
      const result = await updateRestaurantSettings({
        nome_ristorante: fields.nome_ristorante,
        indirizzo: fields.indirizzo,
        numero_twilio_from: fields.numero_twilio_from,
        capacita_totale: Number(fields.capacita_totale),
        max_gruppo_singolo: Number(fields.max_gruppo_singolo),
        orari_apertura: fields.orari_apertura,
        accessibilita: fields.accessibilita,
        finestra_ore: Number(fields.finestra_ore),
        numero_manager: fields.numero_manager,
      })
      if (result.error) {
        setError(result.error)
      } else {
        setCommitted(fields)
        setSuccess(true)
        setEditing(false)
      }
    })
  }

  const textFields: { key: keyof FormFields; label: string }[] = [
    { key: 'nome_ristorante', label: 'Nome Ristorante' },
    { key: 'indirizzo', label: 'Indirizzo' },
    { key: 'numero_twilio_from', label: 'Numero Twilio (From)' },
    { key: 'numero_manager', label: 'Numero Manager' },
  ]

  const textareaFields: { key: keyof FormFields; label: string }[] = [
    { key: 'orari_apertura', label: 'Orari Apertura' },
    { key: 'accessibilita', label: 'Accessibilità' },
  ]

  const numericFields: { key: 'capacita_totale' | 'max_gruppo_singolo' | 'finestra_ore'; label: string }[] = [
    { key: 'capacita_totale', label: 'Capacità Totale' },
    { key: 'max_gruppo_singolo', label: 'Max Gruppo Singolo' },
    { key: 'finestra_ore', label: 'Finestra Ore' },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {!editing ? (
          <button
            onClick={handleEdit}
            className="text-sm px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={isPending || hasErrors}
              className="text-sm px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {success && (
        <p className="text-green-700 text-sm mb-6">Settings saved successfully.</p>
      )}
      {error && (
        <p className="text-red-600 text-sm mb-6">Error: {error}</p>
      )}

      <div className="grid grid-cols-1 gap-6 max-w-lg">
        {textFields.map(({ key, label: fieldLabel }) => (
          <div key={key}>
            <label className={label}>{fieldLabel}</label>
            {editing ? (
              <input
                type="text"
                value={fields[key]}
                onChange={(e) => set(key, e.target.value)}
                className={input}
              />
            ) : (
              <p className={readOnly}>{committed[key]}</p>
            )}
          </div>
        ))}

        {textareaFields.map(({ key, label: fieldLabel }) => (
          <div key={key}>
            <label className={label}>{fieldLabel}</label>
            {editing ? (
              <textarea
                rows={3}
                value={fields[key]}
                onChange={(e) => set(key, e.target.value)}
                className={input}
              />
            ) : (
              <p className={`${readOnly} whitespace-pre-wrap`}>{committed[key]}</p>
            )}
          </div>
        ))}

        {numericFields.map(({ key, label: fieldLabel }) => (
          <div key={key}>
            <label className={label}>{fieldLabel}</label>
            {editing ? (
              <>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={fields[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className={input}
                />
                {numericErrors[key] && (
                  <p className="text-red-600 text-xs mt-1">{numericErrors[key]}</p>
                )}
              </>
            ) : (
              <p className={readOnly}>{committed[key]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
