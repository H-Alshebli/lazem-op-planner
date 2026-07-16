export default function DynamicPointsList({ label, points, onChange, placeholder, addLabel }) {
  const items = Array.isArray(points) ? points : []

  const update = (i, val) => {
    const next = [...items]
    next[i] = val
    onChange(next)
  }
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => onChange([...items, ''])

  return (
    <div className="field dynamic-points-list">
      {label && <label>{label}</label>}
      {items.map((val, i) => (
        <div className="dynamic-point-row" key={i}>
          <input
            type="text"
            placeholder={placeholder}
            value={val}
            onChange={(e) => update(i, e.target.value)}
          />
          <button type="button" className="icon-btn" onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button type="button" className="add-btn" onClick={add}>+ {addLabel || 'إضافة نقطة'}</button>
    </div>
  )
}
