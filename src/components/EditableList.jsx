export default function EditableList({ items, placeholder, onChange, addLabel }) {
  const update = (i, val) => {
    const next = [...items]
    next[i] = val
    onChange(next)
  }
  const remove = (i) => {
    onChange(items.filter((_, idx) => idx !== i))
  }
  const add = () => onChange([...items, ''])

  return (
    <>
      <div className="row-list">
        {items.map((val, i) => (
          <div className="row-item" key={i}>
            <input
              type="text"
              placeholder={placeholder}
              value={val}
              onChange={(e) => update(i, e.target.value)}
            />
            <button className="icon-btn" onClick={() => remove(i)}>✕</button>
          </div>
        ))}
      </div>
      <button className="add-btn" style={{ marginTop: 10 }} onClick={add}>
        + {addLabel || 'إضافة'}
      </button>
    </>
  )
}
