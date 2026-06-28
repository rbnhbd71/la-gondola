'use client'

type Table = { id: string; label: string; capacity: number; x: number; y: number }

export default function FloorCanvas({
  tables,
  editMode = false,
  onDelete,
  noTablesFound,
}: {
  tables: Table[]
  editMode?: boolean
  onDelete?: (id: string) => void
  noTablesFound: string
}) {
  if (tables.length === 0) {
    return (
      <div className="flex items-center justify-center bg-[#F0EBE1] rounded-xl" style={{ height: 520 }}>
        <p className="text-sm text-stone-400">{noTablesFound}</p>
      </div>
    )
  }

  return (
    <div className="relative bg-[#F0EBE1] rounded-xl overflow-auto" style={{ height: 520 }}>
      {tables.map((t) => (
        <div
          key={t.id}
          className="absolute flex flex-col items-center justify-center bg-paper border border-line rounded-lg shadow-sm select-none"
          style={{ left: t.x, top: t.y, width: 80, height: 80 }}
        >
          {editMode && onDelete && (
            <button
              onClick={() => onDelete(t.id)}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-wine text-white text-xs flex items-center justify-center hover:bg-wine/90 leading-none"
              aria-label={`Delete ${t.label}`}
            >
              ×
            </button>
          )}
          <span className="font-display font-medium text-sm text-ink leading-tight">{t.label}</span>
          <span className="text-xs text-stone-400 mt-0.5">{t.capacity}</span>
        </div>
      ))}
    </div>
  )
}
