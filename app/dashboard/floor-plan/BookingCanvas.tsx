'use client'
import { useState, useEffect, useTransition } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createReservationAtTable, cancelReservation, updateReservation } from './actions'

type Table = { id: string; label: string; capacity: number; x: number; y: number }
type Reservation = { id: string; nome: string | null; ospiti: number; ora: string; table_id: string }

function todayISO() { return new Date().toISOString().split('T')[0] }
function defaultService(): 'lunch' | 'dinner' { return new Date().getHours() < 16 ? 'lunch' : 'dinner' }
function fmtTime(ora: string) { return ora.slice(0, 5) }

function stepDate(current: string, delta: number): string {
  const d = new Date(current + 'T12:00:00')
  d.setDate(d.getDate() + delta)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function BookingCanvas({
  tables,
  restaurantId,
  t,
}: {
  tables: Table[]
  restaurantId: string
  t: {
    lunch: string
    dinner: string
    guests: string
    noTablesFound: string
    edit: string
    save: string
    cancel: string
    cancelBooking: string
    capacityWarning: string
    createBooking: string
  }
}) {
  const [date, setDate] = useState(todayISO)
  const [service, setService] = useState<'lunch' | 'dinner'>(defaultService)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [activeTableId, setActiveTableId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Editor state
  const [editorTableId, setEditorTableId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formNome, setFormNome] = useState('')
  const [formOspiti, setFormOspiti] = useState(2)
  const [formOra, setFormOra] = useState('19:00')
  const [editorError, setEditorError] = useState<string | null>(null)
  const [editorPending, startEditorTransition] = useTransition()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    async function load() {
      setLoading(true)
      setFetchError(null)
      let query = supabase
        .from('reservations')
        .select('id, nome, ospiti, ora, table_id')
        .eq('restaurant_id', restaurantId)
        .eq('data', date)
        .neq('stato', 'cancellata')
        .not('table_id', 'is', null)
      if (service === 'lunch') query = query.lt('ora', '16:00:00')
      else query = query.gte('ora', '16:00:00')
      const { data, error } = await query
      if (error) {
        setFetchError(error.message)
      } else {
        setReservations((data ?? []) as Reservation[])
        setActiveTableId(null)
      }
      setLoading(false)
    }
    load()
  }, [date, service, restaurantId])

  // Reset edit mode when date/service changes so the panel shows fresh state
  useEffect(() => {
    setIsEditing(false)
    setEditorError(null)
  }, [date, service])

  const bookedMap = new Map(reservations.map(r => [r.table_id, r]))

  const editorTable = editorTableId
    ? (tables.find(tb => tb.id === editorTableId) ?? null)
    : null
  const editorReservation = editorTableId ? bookedMap.get(editorTableId) : undefined

  function openEditor(tableId: string) {
    const res = bookedMap.get(tableId)
    setEditorTableId(tableId)
    setIsEditing(false)
    setEditorError(null)
    setActiveTableId(null)
    setFormNome(res?.nome ?? '')
    setFormOspiti(res?.ospiti ?? 2)
    setFormOra((res?.ora ?? (service === 'lunch' ? '12:00' : '19:00')).slice(0, 5))
  }

  function handleCreate() {
    if (!editorTableId) return
    startEditorTransition(async () => {
      const result = await createReservationAtTable({
        tableId: editorTableId,
        nome: formNome.trim() || null,
        ospiti: Math.max(1, formOspiti),
        data: date,
        ora: formOra,
      })
      if (result.error) {
        setEditorError(result.error)
      } else {
        setReservations(prev => [...prev, result.data!])
        setEditorError(null)
      }
    })
  }

  function handleUpdate() {
    const res = bookedMap.get(editorTableId ?? '')
    if (!res) return
    startEditorTransition(async () => {
      const result = await updateReservation(res.id, {
        nome: formNome.trim() || null,
        ospiti: Math.max(1, formOspiti),
        ora: formOra,
      })
      if (result.error) {
        setEditorError(result.error)
      } else {
        setReservations(prev => prev.map(r =>
          r.id === res.id
            ? { ...r, nome: formNome.trim() || null, ospiti: Math.max(1, formOspiti), ora: formOra }
            : r
        ))
        setIsEditing(false)
        setEditorError(null)
      }
    })
  }

  function handleCancelBooking() {
    const res = bookedMap.get(editorTableId ?? '')
    if (!res) return
    startEditorTransition(async () => {
      const result = await cancelReservation(res.id)
      if (result.error) {
        setEditorError(result.error)
      } else {
        setReservations(prev => prev.filter(r => r.id !== res.id))
        setEditorError(null)
        setFormNome('')
        setFormOspiti(2)
        setFormOra(service === 'lunch' ? '12:00' : '19:00')
      }
    })
  }

  if (tables.length === 0) {
    return (
      <div className="flex items-center justify-center bg-surface-sunk rounded-xl" style={{ height: 520 }}>
        <p className="text-sm text-ink-faint">{t.noTablesFound}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center border border-line rounded-md overflow-hidden">
          <button
            onClick={() => setDate(stepDate(date, -1))}
            aria-label="Previous day"
            className="px-2 py-2 text-ink-soft hover:bg-surface-sunk transition-colors border-r border-line"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="text-sm px-3 py-2 bg-surface text-ink focus:outline-none"
          />
          <button
            onClick={() => setDate(stepDate(date, 1))}
            aria-label="Next day"
            className="px-2 py-2 text-ink-soft hover:bg-surface-sunk transition-colors border-l border-line"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex rounded-md border border-line overflow-hidden">
          <button
            onClick={() => setService('lunch')}
            className={`text-sm px-4 py-2 transition-colors ${
              service === 'lunch' ? 'bg-clay text-white' : 'text-ink-soft hover:bg-surface-sunk'
            }`}
          >
            {t.lunch}
          </button>
          <button
            onClick={() => setService('dinner')}
            className={`text-sm px-4 py-2 border-l border-line transition-colors ${
              service === 'dinner' ? 'bg-clay text-white' : 'text-ink-soft hover:bg-surface-sunk'
            }`}
          >
            {t.dinner}
          </button>
        </div>
      </div>

      {fetchError && (
        <p className="text-sm text-red-600 mb-3">{fetchError}</p>
      )}

      <div
        className={`relative bg-surface-sunk rounded-xl overflow-auto transition-opacity ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        style={{ height: 520 }}
        onClick={() => setActiveTableId(null)}
      >
        {tables.map(table => {
          const reservation = bookedMap.get(table.id)
          const isBooked = !!reservation
          const isActive = activeTableId === table.id

          return (
            <div
              key={table.id}
              className="absolute"
              style={{ left: table.x, top: table.y, width: 80, height: 80, zIndex: isActive ? 20 : 1 }}
              onClick={isBooked
                ? (e) => { e.stopPropagation(); setActiveTableId(p => p === table.id ? null : table.id) }
                : undefined
              }
              onDoubleClick={(e) => {
                e.stopPropagation()
                openEditor(table.id)
              }}
            >
              {isActive && reservation && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[160px] bg-ink text-surface text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none">
                  <p className="font-medium">{fmtTime(reservation.ora)}</p>
                  {reservation.nome && <p className="mt-0.5">{reservation.nome}</p>}
                  <p className="mt-0.5 opacity-70">{reservation.ospiti} {t.guests}</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink" />
                </div>
              )}
              <div className={`w-full h-full flex flex-col items-center justify-center rounded-lg border shadow-sm select-none ${
                isBooked
                  ? 'bg-clay border-clay text-white cursor-pointer'
                  : 'bg-surface border-line text-ink'
              }`}>
                <span className="font-display font-medium text-sm leading-tight">{table.label}</span>
                <span className={`text-xs mt-0.5 ${isBooked ? 'text-white/70' : 'text-ink-faint'}`}>
                  {table.capacity}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Inline booking editor */}
      {editorTable && (
        <div className="mt-4 rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-medium text-lg text-ink">
              {editorTable.label}
              <span className="ml-2 text-sm font-normal text-ink-faint">
                {editorTable.capacity} {t.guests}
              </span>
            </h3>
            <button
              onClick={() => setEditorTableId(null)}
              className="text-xl leading-none text-ink-faint hover:text-ink"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Date — syncs with canvas */}
          <div className="flex items-center gap-3 mb-4">
            <label className="text-xs text-ink-faint uppercase tracking-wide w-12">Data</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="text-sm border border-line rounded-md px-2 py-1 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-line"
            />
          </div>

          {loading ? (
            <p className="text-sm text-ink-faint">…</p>
          ) : editorReservation && !isEditing ? (
            /* View — show existing booking */
            <>
              <div className="rounded-lg bg-surface-sunk p-4 mb-4">
                <p className="text-sm font-medium text-ink mb-1">{editorReservation.nome ?? '—'}</p>
                <p className="text-sm text-ink-soft">
                  {fmtTime(editorReservation.ora)} · {editorReservation.ospiti} {t.guests}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormNome(editorReservation.nome ?? '')
                    setFormOspiti(editorReservation.ospiti)
                    setFormOra(editorReservation.ora.slice(0, 5))
                    setIsEditing(true)
                  }}
                  disabled={editorPending}
                  className="text-sm px-3 py-1.5 border border-line rounded-md text-ink hover:bg-surface-sunk disabled:opacity-50"
                >
                  {t.edit}
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={editorPending}
                  className="text-sm px-3 py-1.5 border border-red-200 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {t.cancelBooking}
                </button>
              </div>
            </>
          ) : (
            /* Create or edit form */
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-xs text-ink-faint uppercase tracking-wide w-12">Nome</label>
                <input
                  type="text"
                  value={formNome}
                  onChange={e => setFormNome(e.target.value)}
                  disabled={editorPending}
                  placeholder="—"
                  className="text-sm border border-line rounded-md px-2 py-1 flex-1 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-line disabled:opacity-50"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-ink-faint uppercase tracking-wide w-12">Ospiti</label>
                <input
                  type="number"
                  min="1"
                  value={formOspiti}
                  onChange={e => setFormOspiti(Number(e.target.value))}
                  disabled={editorPending}
                  className="text-sm border border-line rounded-md px-2 py-1 w-20 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-line disabled:opacity-50"
                />
                {formOspiti > editorTable.capacity && (
                  <p className="text-xs text-amber">{t.capacityWarning}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-ink-faint uppercase tracking-wide w-12">Ora</label>
                <input
                  type="time"
                  value={formOra}
                  onChange={e => setFormOra(e.target.value)}
                  disabled={editorPending}
                  className="text-sm border border-line rounded-md px-2 py-1 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-line disabled:opacity-50"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={isEditing ? handleUpdate : handleCreate}
                  disabled={editorPending}
                  className="text-sm px-4 py-1.5 bg-clay text-white rounded-md hover:bg-clay-dark disabled:opacity-50"
                >
                  {isEditing ? t.save : t.createBooking}
                </button>
                {isEditing && (
                  <button
                    onClick={() => { setIsEditing(false); setEditorError(null) }}
                    disabled={editorPending}
                    className="text-sm px-4 py-1.5 border border-line rounded-md text-ink hover:bg-surface-sunk disabled:opacity-50"
                  >
                    {t.cancel}
                  </button>
                )}
              </div>
            </div>
          )}

          {editorError && (
            <p className="text-sm text-red-600 mt-3">{editorError}</p>
          )}
        </div>
      )}
    </div>
  )
}
