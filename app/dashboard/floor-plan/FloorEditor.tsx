'use client'
import { useState, useTransition } from 'react'
import { addTable, deleteTable, updateTablePosition } from './actions'
import FloorCanvas from './FloorCanvas'
import BookingCanvas from './BookingCanvas'

type Table = { id: string; label: string; capacity: number; x: number; y: number }

export default function FloorEditor({
  initialTables,
  restaurantId,
  t,
}: {
  initialTables: Table[]
  restaurantId: string
  t: {
    edit: string
    done: string
    addTable: string
    noTablesFound: string
    bookingView: string
    editLayout: string
    lunch: string
    dinner: string
    guests: string
  }
}) {
  const [tables, setTables] = useState<Table[]>(initialTables)
  const [viewMode, setViewMode] = useState<'booking' | 'layout'>('booking')
  const [layoutEditing, setLayoutEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    startTransition(async () => {
      const result = await addTable(restaurantId)
      if (result.data) setTables(prev => [...prev, result.data!])
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteTable(id)
      if (!result.error) setTables(prev => prev.filter(t => t.id !== id))
    })
  }

  function handleDragEnd(id: string, delta: { x: number; y: number }) {
    const table = tables.find(t => t.id === id)
    if (!table) return
    const newX = Math.max(0, table.x + delta.x)
    const newY = Math.max(0, table.y + delta.y)
    setTables(prev => prev.map(t => t.id === id ? { ...t, x: newX, y: newY } : t))
    startTransition(async () => { await updateTablePosition(id, newX, newY) })
  }

  return (
    <div>
      <div className="flex rounded-md border border-line overflow-hidden mb-4 w-fit">
        <button
          onClick={() => { setViewMode('booking'); setLayoutEditing(false) }}
          className={`text-sm px-4 py-2 transition-colors ${
            viewMode === 'booking' ? 'bg-wine text-white' : 'text-stone-500 hover:bg-[#F0EBE1]'
          }`}
        >
          {t.bookingView}
        </button>
        <button
          onClick={() => setViewMode('layout')}
          className={`text-sm px-4 py-2 border-l border-line transition-colors ${
            viewMode === 'layout' ? 'bg-wine text-white' : 'text-stone-500 hover:bg-[#F0EBE1]'
          }`}
        >
          {t.editLayout}
        </button>
      </div>

      {viewMode === 'booking' && (
        <BookingCanvas
          tables={tables}
          restaurantId={restaurantId}
          t={{ lunch: t.lunch, dinner: t.dinner, guests: t.guests, noTablesFound: t.noTablesFound }}
        />
      )}

      {viewMode === 'layout' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setLayoutEditing(e => !e)}
              className={`text-sm px-4 py-2 rounded-md border transition-colors ${
                layoutEditing
                  ? 'bg-wine text-white border-wine hover:bg-wine/90'
                  : 'border-line text-ink hover:bg-[#F0EBE1]'
              }`}
            >
              {layoutEditing ? t.done : t.edit}
            </button>
            {layoutEditing && (
              <button
                onClick={handleAdd}
                disabled={isPending}
                className="text-sm px-4 py-2 bg-wine text-white rounded-md hover:bg-wine/90 disabled:opacity-50"
              >
                {t.addTable}
              </button>
            )}
          </div>
          <FloorCanvas
            tables={tables}
            editMode={layoutEditing}
            onDelete={handleDelete}
            onDragEnd={handleDragEnd}
            noTablesFound={t.noTablesFound}
          />
        </div>
      )}
    </div>
  )
}
