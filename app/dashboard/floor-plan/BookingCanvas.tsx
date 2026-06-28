'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Table = { id: string; label: string; capacity: number; x: number; y: number }
type Reservation = { id: string; nome: string | null; ospiti: number; ora: string; table_id: string }

function todayISO() { return new Date().toISOString().split('T')[0] }
function defaultService(): 'lunch' | 'dinner' { return new Date().getHours() < 16 ? 'lunch' : 'dinner' }
function fmtTime(ora: string) { return ora.slice(0, 5) }

export default function BookingCanvas({
  tables,
  restaurantId,
  t,
}: {
  tables: Table[]
  restaurantId: string
  t: { lunch: string; dinner: string; guests: string; noTablesFound: string }
}) {
  const [date, setDate] = useState(todayISO)
  const [service, setService] = useState<'lunch' | 'dinner'>(defaultService)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [activeTableId, setActiveTableId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    async function load() {
      let query = supabase
        .from('reservations')
        .select('id, nome, ospiti, ora, table_id')
        .eq('restaurant_id', restaurantId)
        .eq('data', date)
        .neq('stato', 'cancellata')
        .not('table_id', 'is', null)
      if (service === 'lunch') query = query.lt('ora', '16:00:00')
      else query = query.gte('ora', '16:00:00')
      const { data } = await query
      setReservations((data ?? []) as Reservation[])
      setActiveTableId(null)
    }
    load()
  }, [date, service, restaurantId])

  const bookedMap = new Map(reservations.map(r => [r.table_id, r]))

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
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="text-sm border border-line rounded-md px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-line"
        />
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

      <div
        className="relative bg-surface-sunk rounded-xl overflow-auto"
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
    </div>
  )
}
