import { useMemo, useState } from 'react'
import { computeObjective, statusLabel, isOverdue } from '../utils/calc'

export default function Dashboard({ objectives }) {
  const [filterResponsible, setFilterResponsible] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const { allTasks, sumTotalW, sumDoneW, overdueCount } = useMemo(() => {
    let sumTotalW = 0
    let sumDoneW = 0
    let overdueCount = 0
    const allTasks = []
    objectives.forEach((obj) => {
      obj.tasks.forEach((t) => {
        sumTotalW += Number(t.weight) || 0
        if (t.done) sumDoneW += Number(t.weight) || 0
        const overdue = isOverdue(t)
        if (overdue) overdueCount++
        allTasks.push({ ...t, objTitle: obj.title, overdue })
      })
    })
    return { allTasks, sumTotalW, sumDoneW, overdueCount }
  }, [objectives])

  const overallPct = sumTotalW > 0 ? Math.round((sumDoneW / sumTotalW) * 100) : 0
  const totalTasks = allTasks.length
  const responsibleSet = Array.from(new Set(allTasks.map((t) => t.responsible).filter(Boolean)))

  const rows = allTasks
    .filter((t) => {
      if (filterResponsible && t.responsible !== filterResponsible) return false
      if (filterStatus === 'done' && !t.done) return false
      if (filterStatus === 'pending' && t.done) return false
      if (filterStatus === 'overdue' && !t.overdue) return false
      return true
    })
    .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))

  const workload = {}
  allTasks.forEach((t) => {
    const name = t.responsible || 'غير محدد'
    if (!workload[name]) workload[name] = { count: 0, done: 0 }
    workload[name].count++
    if (t.done) workload[name].done++
  })
  const workloadEntries = Object.entries(workload)
  const maxCount = Math.max(1, ...workloadEntries.map(([, w]) => w.count))

  return (
    <>
      <div className="stat-row">
        <div className="stat"><div className="val">{objectives.length}</div><div className="lbl">إجمالي الأهداف</div></div>
        <div className="stat"><div className="val">{overallPct}%</div><div className="lbl">نسبة الإنجاز الكلي</div></div>
        <div className="stat"><div className="val">{totalTasks}</div><div className="lbl">إجمالي الإجراءات</div></div>
        <div className={`stat ${overdueCount > 0 ? 'danger' : ''}`}>
          <div className="val">{overdueCount}</div><div className="lbl">إجراءات متأخرة</div>
        </div>
      </div>

      <div className="card">
        <h2>تقدّم الأهداف</h2>
        {objectives.length === 0 ? (
          <div className="empty-note">لا توجد أهداف بعد — أضفها من تبويب "الأهداف وخطط العمل".</div>
        ) : (
          objectives.map((obj) => {
            const { pct, status } = computeObjective(obj)
            return (
              <div className="obj-card" key={obj.id}>
                <div className="obj-top">
                  <div className="obj-title">{obj.title}</div>
                  <span className={`badge ${status}`}>{statusLabel(status)} · {pct}%</span>
                </div>
                <div className="progress-bar"><div style={{ width: `${pct}%` }} /></div>
                <div className="obj-meta">{obj.tasks.filter((t) => t.done).length} من {obj.tasks.length} إجراء منجز</div>
              </div>
            )
          })
        )}
      </div>

      <div className="card">
        <h2>جميع الإجراءات</h2>
        <div className="filters">
          <select value={filterResponsible} onChange={(e) => setFilterResponsible(e.target.value)}>
            <option value="">كل المسؤولين</option>
            {responsibleSet.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">كل الحالات</option>
            <option value="done">منجز</option>
            <option value="pending">غير منجز</option>
            <option value="overdue">متأخر</option>
          </select>
        </div>
        <table>
          <thead>
            <tr><th>الهدف</th><th>الإجراء</th><th>المسؤول</th><th>موعد الانتهاء</th><th>الوزن</th><th>الحالة</th></tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td>{t.objTitle}</td>
                <td style={{ textAlign: 'right' }}>{t.action || '—'}</td>
                <td>{t.responsible || '—'}</td>
                <td>{t.due || '—'}</td>
                <td>{t.weight}</td>
                <td>
                  {t.done ? (
                    <span className="badge done">منجز</span>
                  ) : t.overdue ? (
                    <span className="badge overdue">متأخر</span>
                  ) : (
                    <span className="badge notstarted">غير منجز</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="empty-note">لا توجد إجراءات مطابقة.</div>}
      </div>

      <div className="card">
        <h2>توزيع الإجراءات حسب المسؤول</h2>
        {workloadEntries.length === 0 ? (
          <div className="empty-note">لا توجد إجراءات بعد.</div>
        ) : (
          workloadEntries.map(([name, w]) => (
            <div className="workload-row" key={name}>
              <div className="workload-name">{name}</div>
              <div className="workload-bar"><div style={{ width: `${(w.count / maxCount) * 100}%` }} /></div>
              <div className="workload-count">{w.done}/{w.count} منجز</div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
