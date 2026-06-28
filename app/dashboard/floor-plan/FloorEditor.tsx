'use client'
import { useState, useTransition } from 'react'
import { addTable, deleteTable } from './actions'
import FloorCanvas from './FloorCanvas'

type Table = { id: string; label: string; capacity: number; x: number; y: number }

export default function FloorEditor({
  initialTables,
  restaurantId,
  t,
}: {
  initialTables: Table[]
  restaurantId: string
  t: { edit: string; done: string; addTable: string; noTablesFound: string }
}) {
  const [tables, setTables] = useState<Table[]>(initialTables)
  const [editMode, setEditMode] = useState(false)
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

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setEditMode(e => !e)}
          className={`text-sm px-4 py-2 rounded-md border transition-colors ${
            editMode
              ? 'bg-wine text-white border-wine hover:bg-wine/90'
              : 'border-line text-ink hover:bg-[#F0EBE1]'
          }`}
        >
          {editMode ? t.done : t.edit}
        </button>
        {editMode && (
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
        editMode={editMode}
        onDelete={handleDelete}
        noTablesFound={t.noTablesFound}
      />
    </div>
  )
}
