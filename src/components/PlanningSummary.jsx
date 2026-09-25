import { useMemo } from 'react'

const money = (value) => new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(value)

export default function PlanningSummary({ plan, objectives }) {
  const { months, byGoal, byPerson, total } = useMemo(() => {
    const start = plan.start?.slice(0, 7)
    const end = plan.end?.slice(0, 7)
    const months = []
    if (start && end && start <= end) {
      let [year, month] = start.split('-').map(Number)
      while (`${year}-${String(month).padStart(2, '0')}` <= end && months.length < 12) {
        const key = `${year}-${String(month).padStart(2, '0')}`
        months.push({ key, tasks: [], cost: 0 })
        month += 1
        if (month === 13) { month = 1; year += 1 }
      }
    }
    const people = new Map()
    const byGoal = objectives.map((goal) => {
      const tasks = goal.tasks || []
      tasks.forEach((task) => {
        const period = months.find((m) => m.key === task.due?.slice(0, 7))
        if (period) {
          period.tasks.push({ ...task, goal: goal.title })
          period.cost += Number(task.cost) || 0
        }
        const name = task.responsible?.trim() || 'غير محدد'
        const person = people.get(name) || { name, total: 0, done: 0, overdue: 0 }
        person.total += 1
        if (task.done) person.done += 1
        if (!task.done && task.due && task.due < new Date().toISOString().slice(0, 10)) person.overdue += 1
        people.set(name, person)
      })
      return { title: goal.title, count: tasks.length, cost: tasks.reduce((sum, task) => sum + (Number(task.cost) || 0), 0) }
    })
    return { months, byGoal, byPerson: [...people.values()], total: byGoal.reduce((sum, goal) => sum + goal.cost, 0) }
  }, [plan.start, plan.end, objectives])

  return <>
    <div className="card">
      <h2>البرنامج الزمني الشهري</h2>
      <p>تُعرض الإجراءات في شهر موعد انتهائها. الإجراءات بلا موعد لا تظهر هنا.</p>
      {months.length === 0 && <p>حدد تاريخ بدء وانتهاء صالحين للخطة، على ألا تتجاوز سنة.</p>}
      {months.map((month) => <div key={month.key} style={{ marginBottom: 18 }}>
        <h3>{month.key} — {month.tasks.length} إجراء — {money(month.cost)} ر.س</h3>
        {month.tasks.length > 0 && <table><thead><tr><th>الهدف</th><th>الإجراء</th><th>المسؤول</th><th>الموعد</th><th>الحالة</th></tr></thead><tbody>
          {month.tasks.map((task) => <tr key={task.id}><td>{task.goal}</td><td>{task.action || '—'}</td><td>{task.responsible || '—'}</td><td>{task.due}</td><td>{task.done ? 'منجز' : 'غير منجز'}</td></tr>)}
        </tbody></table>}
      </div>)}
    </div>
    <div className="card">
      <h2>الموازنة التقديرية للأهداف</h2>
      <table><thead><tr><th>الهدف</th><th>عدد الإجراءات</th><th>التكلفة التقديرية (ر.س)</th></tr></thead><tbody>
        {byGoal.map((goal, index) => <tr key={index}><td>{goal.title}</td><td>{goal.count}</td><td>{money(goal.cost)}</td></tr>)}
      </tbody><tfoot><tr><th>إجمالي الخطة</th><th></th><th>{money(total)} ر.س</th></tr></tfoot></table>
      <p>التكاليف تقديرية، وتشمل الإجراءات التي لم يحدد لها موعد.</p>
    </div>
    <div className="card">
      <h2>جدول أعمال المسؤولين</h2>
      <table><thead><tr><th>المسؤول</th><th>الإجراءات</th><th>المنجزة</th><th>المتأخرة</th><th>نسبة الإنجاز</th></tr></thead><tbody>
        {byPerson.map((person) => <tr key={person.name}><td>{person.name}</td><td>{person.total}</td><td>{person.done}</td><td>{person.overdue}</td><td>{Math.round(person.done / person.total * 100)}%</td></tr>)}
      </tbody></table>
      <p>هذا تقرير متابعة للإجراءات، ولا يحل محل نموذج تقييم الأداء الفني والسلوكي.</p>
    </div>
  </>
}
