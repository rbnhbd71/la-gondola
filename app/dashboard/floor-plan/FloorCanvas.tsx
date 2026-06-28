'use client'
import {
  DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'

type Table = { id: string; label: string; capacity: number; x: number; y: number }

function DraggableTable({
  table, editMode, onDelete,
}: {
  table: Table; editMode: boolean; onDelete?: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: table.id,
    disabled: !editMode,
  })

  return (
    <div
      ref={setNodeRef}
      className="absolute flex flex-col items-center justify-center bg-paper border border-line rounded-lg shadow-sm select-none"
      style={{
        left: table.x, top: table.y, width: 80, height: 80,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        touchAction: 'none',
        cursor: editMode ? 'grab' : 'default',
        zIndex: transform ? 10 : 1,
      }}
      {...(editMode ? { ...listeners, ...attributes } : {})}
    >
      {editMode && onDelete && (
        <button
          onClick={() => onDelete(table.id)}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-wine text-white text-xs flex items-center justify-center hover:bg-wine/90 leading-none"
          aria-label={`Delete ${table.label}`}
        >
          ×
        </button>
      )}
      <span className="font-display font-medium text-sm text-ink leading-tight">{table.label}</span>
      <span className="text-xs text-stone-400 mt-0.5">{table.capacity}</span>
    </div>
  )
}

export default function FloorCanvas({
  tables, editMode = false, onDelete, onDragEnd, noTablesFound,
}: {
  tables: Table[]
  editMode?: boolean
  onDelete?: (id: string) => void
  onDragEnd?: (id: string, delta: { x: number; y: number }) => void
  noTablesFound: string
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    if (onDragEnd && event.delta) {
      onDragEnd(event.active.id as string, event.delta)
    }
  }

  if (tables.length === 0) {
    return (
      <div className="flex items-center justify-center bg-[#F0EBE1] rounded-xl" style={{ height: 520 }}>
        <p className="text-sm text-stone-400">{noTablesFound}</p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="relative bg-[#F0EBE1] rounded-xl overflow-hidden" style={{ height: 520 }}>
        {tables.map((t) => (
          <DraggableTable key={t.id} table={t} editMode={editMode} onDelete={onDelete} />
        ))}
      </div>
    </DndContext>
  )
}
