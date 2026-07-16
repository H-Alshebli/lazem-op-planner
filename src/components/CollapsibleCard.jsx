import { useState } from 'react'

export default function CollapsibleCard({ title, badges, defaultOpen, onDelete, deleteLabel = 'حذف', children }) {
  const [open, setOpen] = useState(!!defaultOpen)

  return (
    <div className="indicator-card">
      <div className="indicator-header" onClick={() => setOpen((o) => !o)}>
        <div className="collapsed-summary">
          <span className="indicator-title">{title || 'بدون اسم'}</span>
          <div className="indicator-badges">{badges}</div>
        </div>
        <div className="card-actions">
          {onDelete && (
            <button
              type="button"
              className="icon-btn"
              title={deleteLabel}
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              ✕
            </button>
          )}
          <button
            type="button"
            className="icon-btn toggle-btn"
            aria-label={open ? 'طي البطاقة' : 'فتح البطاقة'}
            onClick={(e) => {
              e.stopPropagation()
              setOpen((o) => !o)
            }}
          >
            {open ? '▲' : '▼'}
          </button>
        </div>
      </div>
      {open && <div className="indicator-body">{children}</div>}
    </div>
  )
}
