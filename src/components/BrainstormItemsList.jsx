import { uid } from '../utils/calc'

const TYPE_OPTIONS = [
  { value: 'question', label: 'سؤال' },
  { value: 'idea', label: 'فكرة' },
  { value: 'note', label: 'ملاحظة' },
  { value: 'possibleCause', label: 'سبب محتمل' },
  { value: 'challenge', label: 'تحدٍ' },
  { value: 'proposedPath', label: 'مسار مقترح' },
  { value: 'potentialInitiative', label: 'مبادرة محتملة' },
]

export default function BrainstormItemsList({ items, onChange }) {
  const list = Array.isArray(items) ? items : []

  const update = (id, patch) => onChange(list.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  const remove = (id) => onChange(list.filter((it) => it.id !== id))
  const add = () => onChange([...list, { id: uid(), type: 'idea', text: '' }])

  return (
    <div className="field brainstorm-list">
      <label>العصف الذهني وطرق تحسين المؤشر</label>
      <p className="field-help">
        يمكن تسجيل أسئلة أو أفكار أو ملاحظات أو تحديات أو مسارات محتملة. تظل هذه النقاط أفكاراً أولية غير
        معتمدة، ولا تتحول إلى أهداف أو إجراءات تنفيذية إلا بعد المراجعة.
      </p>

      {list.map((item) => (
        <div className="brainstorm-row" key={item.id}>
          <select value={item.type} onChange={(e) => update(item.id, { type: e.target.value })}>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="اكتب النقطة هنا..."
            value={item.text}
            onChange={(e) => update(item.id, { text: e.target.value })}
          />
          <button type="button" className="icon-btn" onClick={() => remove(item.id)}>✕</button>
        </div>
      ))}

      <button type="button" className="add-btn" onClick={add}>+ إضافة نقطة</button>
    </div>
  )
}
