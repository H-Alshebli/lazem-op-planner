import { uid, computeObjective, statusLabel, isOverdue } from '../utils/calc'

export default function ObjectivesTab({ objectives, setObjectives }) {
  const updateObjective = (id, patch) => {
    setObjectives(objectives.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }
  const removeObjective = (id) => {
    if (confirm('حذف هذا الهدف وكل إجراءاته؟')) {
      setObjectives(objectives.filter((o) => o.id !== id))
    }
  }
  const addObjective = () => {
    setObjectives([...objectives, { id: uid(), title: 'هدف جديد', tasks: [] }])
  }
  const addTask = (objId) => {
    setObjectives(
      objectives.map((o) =>
        o.id === objId
          ? { ...o, tasks: [...o.tasks, { id: uid(), action: '', responsible: '', due: '', cost: '', weight: 3, done: false }] }
          : o
      )
    )
  }
  const updateTask = (objId, taskId, field, value) => {
    setObjectives(
      objectives.map((o) =>
        o.id !== objId
          ? o
          : { ...o, tasks: o.tasks.map((t) => (t.id === taskId ? { ...t, [field]: value } : t)) }
      )
    )
  }
  const removeTask = (objId, taskId) => {
    setObjectives(
      objectives.map((o) => (o.id !== objId ? o : { ...o, tasks: o.tasks.filter((t) => t.id !== taskId) }))
    )
  }

  return (
    <div className="card">
      <h2><span className="n">5</span> الأهداف الذكية وخطط العمل</h2>
      <p style={{ fontSize: 12.5, color: 'var(--gray50)', marginTop: -6 }}>
        لكل هدف، أضف الإجراءات المطلوبة مع تحديد المسؤول وموعد الانتهاء والتكلفة والوزن، وحدّث حالة
        الإنجاز أولاً بأول — وستنعكس تلقائياً في لوحة المتابعة.
      </p>

      {objectives.map((obj) => {
        const { pct, status } = computeObjective(obj)
        return (
          <div className="card" style={{ background: '#FBFDFD' }} key={obj.id}>
            <div className="obj-top">
              <input
                className="obj-title-input"
                value={obj.title}
                onChange={(e) => updateObjective(obj.id, { title: e.target.value })}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge ${status}`}>{statusLabel(status)} · {pct}%</span>
                <button className="del-obj" onClick={() => removeObjective(obj.id)}>حذف الهدف ✕</button>
              </div>
            </div>
            <div className="progress-bar" style={{ marginBottom: 14 }}>
              <div style={{ width: `${pct}%` }} />
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 34 }}>م</th>
                  <th>الإجراء</th>
                  <th style={{ width: 120 }}>المسؤول</th>
                  <th style={{ width: 130 }}>موعد الانتهاء</th>
                  <th style={{ width: 90 }}>التكلفة</th>
                  <th style={{ width: 70 }}>الوزن</th>
                  <th style={{ width: 60 }}>تم؟</th>
                  <th style={{ width: 34 }}></th>
                </tr>
              </thead>
              <tbody>
                {obj.tasks.map((t, i) => {
                  const overdue = isOverdue(t)
                  return (
                    <tr key={t.id}>
                      <td>{i + 1}</td>
                      <td className="task-action-cell">
                        <input
                          type="text"
                          value={t.action}
                          onChange={(e) => updateTask(obj.id, t.id, 'action', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          style={{ textAlign: 'center' }}
                          value={t.responsible}
                          onChange={(e) => updateTask(obj.id, t.id, 'responsible', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          value={t.due || ''}
                          onChange={(e) => updateTask(obj.id, t.id, 'due', e.target.value)}
                        />
                        {overdue && <div className="overdue-tag">متأخر</div>}
                      </td>
                      <td>
                        <input
                          type="number"
                          value={t.cost}
                          onChange={(e) => updateTask(obj.id, t.id, 'cost', e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          value={t.weight}
                          onChange={(e) => updateTask(obj.id, t.id, 'weight', Number(e.target.value))}
                        >
                          {[1, 2, 3, 4, 5].map((w) => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="done-check"
                          checked={t.done}
                          onChange={(e) => updateTask(obj.id, t.id, 'done', e.target.checked)}
                        />
                      </td>
                      <td>
                        <button className="icon-btn" onClick={() => removeTask(obj.id, t.id)}>✕</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <button className="add-btn" style={{ marginTop: 10 }} onClick={() => addTask(obj.id)}>
              + إضافة إجراء
            </button>
          </div>
        )
      })}

      <button className="primary-btn" style={{ marginTop: 6 }} onClick={addObjective}>
        + إضافة هدف جديد
      </button>
    </div>
  )
}
