import { computeObjective } from '../utils/calc'

const fmt = (n) => new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(Number(n) || 0)
const items = (values) => (values || []).filter(Boolean).join('، ') || '—'

export default function PrintableReport({ state }) {
  const { plan, vision, kpis = [], mainTasks = [], swot = {}, objectives = [], policies } = state
  const actions = objectives.flatMap((o) => (o.tasks || []).map((t) => ({ ...t, goal: o.title })))
  const total = actions.reduce((n, t) => n + (Number(t.cost) || 0), 0)
  const months = [...new Set(actions.map((t) => t.due?.slice(0, 7)).filter(Boolean))].sort()
  const responsible = [...new Set(actions.map((t) => t.responsible?.trim()).filter(Boolean))]
  return <article className="print-report" dir="rtl" lang="ar">
    <div className="report-cover">
      <div className="report-brand">LAZEM <span>لازم</span></div>
      <div className="report-kicker">دبلوم القيادة الإدارية · المستوى الثاني</div>
      <h1>الخطة التشغيلية</h1>
      <p className="report-dept">{plan.dept || 'الإدارة / القسم'}</p>
      <p>الفترة: {plan.start || '—'} إلى {plan.end || '—'}</p>
      <div className="report-cover-foot">إعداد: {plan.team?.find((m) => m.role?.includes('المسؤول'))?.name || '—'}<br />النسخة التفاعلية: https://lazem-op-planner-ryjh.vercel.app/</div>
    </div>
    <section><h2>١. تشكيل فريق التخطيط والاعتماد</h2><table><thead><tr><th>الدور</th><th>الاسم</th></tr></thead><tbody>{(plan.team || []).map((m, i) => <tr key={i}><td>{m.role}</td><td>{m.name}</td></tr>)}</tbody></table>
      <h3>الموافقة من الإدارة العليا</h3><table><thead><tr><th>الاسم</th><th>التوقيع / الملاحظة</th></tr></thead><tbody>{(plan.approvals || []).map((a, i) => <tr key={i}><td>{a.name}</td><td>{a.signature || '—'}</td></tr>)}</tbody></table></section>
    <section><h2>٢. الرؤية والمؤشرات والمهام</h2><p>{vision || '—'}</p>
      <table><thead><tr><th>المؤشر</th><th>النوع</th><th>طريقة القياس</th><th>مصدر البيانات</th></tr></thead><tbody>{kpis.map((k) => <tr key={k.id}><td>{k.title || '—'}</td><td>{k.type === 'financial' ? 'مالي' : 'غير مالي'}</td><td>{k.measurementMethod || '—'}</td><td>{k.dataSource || '—'}</td></tr>)}</tbody></table>
      <h3>المهام الرئيسية والروتينية</h3><ul>{mainTasks.map((t) => <li key={t.id}>{t.title || '—'} ({t.taskType === 'routine' ? 'روتينية' : 'رئيسية'})</li>)}</ul></section>
    <section><h2>٣. التحليل الموقفي SWOT</h2><table><tbody><tr><th>نقاط القوة</th><td>{items(swot.strengths)}</td></tr><tr><th>نقاط الضعف</th><td>{items(swot.weaknesses)}</td></tr><tr><th>الفرص</th><td>{items(swot.opportunities)}</td></tr><tr><th>التهديدات</th><td>{items(swot.threats)}</td></tr></tbody></table></section>
    <section><h2>٤. الأهداف والإجراءات</h2>{objectives.map((o) => <div className="report-objective" key={o.id}>
      <h3>{o.title || 'هدف غير مسمى'} <small>الإنجاز: {computeObjective(o).pct}%</small></h3>
      <p><b>المؤشر:</b> {o.indicator || '—'} · <b>المستهدف:</b> {o.target || '—'} · <b>الموعد:</b> {o.deadline || '—'}</p>
      <table><thead><tr><th>الإجراء</th><th>المسؤول</th><th>موعد الانتهاء</th><th>التكلفة (ر.س)</th><th>الحالة</th></tr></thead><tbody>{(o.tasks || []).map((t) => <tr key={t.id}><td>{t.action || '—'}</td><td>{t.responsible || '—'}</td><td>{t.due || '—'}</td><td>{fmt(t.cost)}</td><td>{t.done ? 'منجز' : 'غير منجز'}</td></tr>)}</tbody></table>
    </div>)}</section>
    <section><h2>٥. البرنامج الزمني الشهري</h2>{months.length ? months.map((m) => <div key={m} className="report-month"><h3>{m}</h3><ul>{actions.filter((t) => t.due?.startsWith(m)).map((t) => <li key={t.id}>{t.goal} — {t.action || '—'} ({t.due})</li>)}</ul></div>) : <p>لم تُحدد مواعيد للإجراءات.</p>}</section>
    <section><h2>٦. موازنة الأهداف</h2><table><thead><tr><th>الهدف</th><th>التكلفة التقديرية (ر.س)</th></tr></thead><tbody>{objectives.map((o) => <tr key={o.id}><td>{o.title}</td><td>{fmt((o.tasks || []).reduce((n, t) => n + (Number(t.cost) || 0), 0))}</td></tr>)}</tbody><tfoot><tr><th>الإجمالي</th><th>{fmt(total)}</th></tr></tfoot></table></section>
    <section><h2>٧. أعمال المسؤولين ومتابعة الإنجاز</h2><table><thead><tr><th>المسؤول</th><th>عدد الإجراءات</th><th>المنجزة</th><th>نسبة الإنجاز</th></tr></thead><tbody>{responsible.map((name) => { const own = actions.filter((t) => t.responsible?.trim() === name); const done = own.filter((t) => t.done).length; return <tr key={name}><td>{name}</td><td>{own.length}</td><td>{done}</td><td>{Math.round(done / own.length * 100)}%</td></tr> })}</tbody></table>
      <p className="report-note">نسبة الإنجاز هنا متابعة للإجراءات، وليست تقييم الأداء الفني والسلوكي للموظف.</p></section>
    <section><h2>٨. سياسات الأداء</h2><p className="report-multiline">{policies || 'لم تُدخل سياسات الأداء بعد.'}</p></section>
  </article>
}
