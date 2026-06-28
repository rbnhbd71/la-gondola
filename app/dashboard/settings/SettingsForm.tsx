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

export type SettingsFormDict = {
  edit: string
  save: string
  saving: string
  cancel: string
  savedSuccessfully: string
  confirmSave: string
  mustBePositiveInt: string
  labelNomeRistorante: string
  labelIndirizzo: string
  labelNumeroTwilioFrom: string
  labelNumeroManager: string
  labelOrariApertura: string
  labelAccessibilita: string
  labelCapacitaTotale: string
  labelMaxGruppoSingolo: string
  labelFinestraOre: string
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

const inputCls = 'block w-full text-sm border border-line rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-line'
const readOnlyCls = 'block w-full text-sm text-ink py-2'
const labelCls = 'block text-xs font-normal text-stone-400 uppercase tracking-wide mb-1'

export default function SettingsForm({
  initial,
  t,
}: {
  initial: RestaurantSettings
  t: SettingsFormDict
}) {
  const [editing, setEditing] = useState(false)
  const [fields, setFields] = useState<FormFields>(toForm(initial))
  const [committed, setCommitted] = useState<FormFields>(toForm(initial))
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const numericErrors: Record<'capacita_totale' | 'max_gruppo_singolo' | 'finestra_ore', string | null> = {
    capacita_totale: isPositiveInt(fields.capacita_totale) ? null : t.mustBePositiveInt,
    max_gruppo_singolo: isPositiveInt(fields.max_gruppo_singolo) ? null : t.mustBePositiveInt,
    finestra_ore: isPositiveInt(fields.finestra_ore) ? null : t.mustBePositiveInt,
  }
  const hasErrors = Object.values(numericErrors).some(Boolean)

  function set(key: keyof FormFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  function handleEdit() { setEditing(true); setSuccess(false); setError(null) }
  function handleCancel() { setFields(committed); setEditing(false); setError(null) }

  function handleSave() {
    if (hasErrors) return
    if (!window.confirm(t.confirmSave)) return
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
    { key: 'nome_ristorante', label: t.labelNomeRistorante },
    { key: 'indirizzo', label: t.labelIndirizzo },
    { key: 'numero_twilio_from', label: t.labelNumeroTwilioFrom },
    { key: 'numero_manager', label: t.labelNumeroManager },
  ]

  const textareaFields: { key: keyof FormFields; label: string }[] = [
    { key: 'orari_apertura', label: t.labelOrariApertura },
    { key: 'accessibilita', label: t.labelAccessibilita },
  ]

  const numericFields: { key: 'capacita_totale' | 'max_gruppo_singolo' | 'finestra_ore'; label: string }[] = [
    { key: 'capacita_totale', label: t.labelCapacitaTotale },
    { key: 'max_gruppo_singolo', label: t.labelMaxGruppoSingolo },
    { key: 'finestra_ore', label: t.labelFinestraOre },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {!editing ? (
          <button
            onClick={handleEdit}
            className="text-sm px-4 py-2 bg-wine text-white rounded-md hover:bg-wine/90"
          >
            {t.edit}
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={isPending || hasErrors}
              className="text-sm px-4 py-2 bg-wine text-white rounded-md hover:bg-wine/90 disabled:opacity-50"
            >
              {isPending ? t.saving : t.save}
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="text-sm px-4 py-2 border border-line rounded-md hover:bg-[#F0EBE1] disabled:opacity-50"
            >
              {t.cancel}
            </button>
          </>
        )}
      </div>

      {success && <p className="text-sage text-sm mb-6">{t.savedSuccessfully}</p>}
      {error && <p className="text-red-600 text-sm mb-6">Error: {error}</p>}

      <div className="grid grid-cols-1 gap-6 max-w-lg">
        {textFields.map(({ key, label: fieldLabel }) => (
          <div key={key}>
            <label className={labelCls}>{fieldLabel}</label>
            {editing ? (
              <input
                type="text"
                value={fields[key]}
                onChange={(e) => set(key, e.target.value)}
                className={inputCls}
              />
            ) : (
              <p className={readOnlyCls}>{committed[key]}</p>
            )}
          </div>
        ))}

        {textareaFields.map(({ key, label: fieldLabel }) => (
          <div key={key}>
            <label className={labelCls}>{fieldLabel}</label>
            {editing ? (
              <textarea
                rows={3}
                value={fields[key]}
                onChange={(e) => set(key, e.target.value)}
                className={inputCls}
              />
            ) : (
              <p className={`${readOnlyCls} whitespace-pre-wrap`}>{committed[key]}</p>
            )}
          </div>
        ))}

        {numericFields.map(({ key, label: fieldLabel }) => (
          <div key={key}>
            <label className={labelCls}>{fieldLabel}</label>
            {editing ? (
              <>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={fields[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className={inputCls}
                />
                {numericErrors[key] && (
                  <p className="text-red-600 text-xs mt-1">{numericErrors[key]}</p>
                )}
              </>
            ) : (
              <p className={readOnlyCls}>{committed[key]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
