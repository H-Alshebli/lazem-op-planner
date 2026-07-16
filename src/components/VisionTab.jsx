import { useState } from 'react'
import { newKpi, newMainTask } from '../utils/calc'
import KpiCard from './KpiCard'
import MainTaskCard from './MainTaskCard'

export default function VisionTab({ vision, setVision, kpis, setKpis, mainTasks, setMainTasks }) {
  const [justAddedId, setJustAddedId] = useState(null)

  const financialKpis = kpis.filter((k) => k.type === 'financial')
  const nonFinancialKpis = kpis.filter((k) => k.type === 'nonFinancial')

  const updateKpi = (id, patch) => {
    setKpis(kpis.map((k) => (k.id === id ? patch : k)))
  }
  const removeKpi = (id) => {
    if (!confirm('حذف هذا المؤشر؟')) return
    setKpis(
      kpis
        .filter((k) => k.id !== id)
        .map((k) => (k.linkedFinancialKpiId === id ? { ...k, linkedFinancialKpiId: '' } : k))
    )
  }
  const addKpi = (type) => {
    const kpi = newKpi(type)
    setKpis([...kpis, kpi])
    setJustAddedId(kpi.id)
  }

  const updateTask = (id, patch) => {
    setMainTasks(mainTasks.map((t) => (t.id === id ? patch : t)))
  }
  const removeTask = (id) => {
    if (!confirm('حذف هذه المهمة؟')) return
    setMainTasks(mainTasks.filter((t) => t.id !== id))
  }
  const addTask = () => {
    const task = newMainTask('main')
    setMainTasks([...mainTasks, task])
    setJustAddedId(task.id)
  }

  return (
    <>
      <p className="page-intro">
        تُستخدم هذه الصفحة لجمع المرجعيات والمؤشرات والمهام والأفكار التي ستساعد لجنة التخطيط لاحقاً على
        استنباط وصياغة الأهداف التشغيلية.
      </p>

      <div className="card">
        <h2><span className="n">2</span> رؤية المنظمة</h2>
        <p className="section-help">
          تمثل رؤية المنظمة المرجعية العامة التي يجب أن تتجه نحوها جميع الخطط والأهداف التشغيلية.
        </p>
        <textarea
          placeholder="اكتب رؤية المنظمة هنا..."
          value={vision}
          onChange={(e) => setVision(e.target.value)}
        />
      </div>

      <div className="card indicators-section">
        <h2>مؤشرات الأداء المالية الواردة من الخطة الاستراتيجية</h2>
        <p className="section-help">
          تُسجل هنا مؤشرات الأداء المالية المعتمدة والواردة من الخطة الاستراتيجية أو من الإدارة العليا، ثم
          تُستخدم كمرجعية لاستنباط مؤشرات وأهداف تشغيلية مساندة.
        </p>

        {financialKpis.length === 0 && <div className="empty-note">لا توجد مؤشرات مالية بعد.</div>}
        {financialKpis.map((kpi) => (
          <KpiCard
            key={kpi.id}
            kpi={kpi}
            onChange={(patch) => updateKpi(kpi.id, patch)}
            onDelete={() => removeKpi(kpi.id)}
            defaultOpen={kpi.id === justAddedId}
          />
        ))}

        <button type="button" className="primary-btn" onClick={() => addKpi('financial')}>
          + إضافة مؤشر مالي
        </button>
      </div>

      <div className="card indicators-section">
        <h2>مؤشرات الأداء غير المالية المستنبطة</h2>
        <p className="section-help">
          تُقترح هنا مؤشرات غير مالية تساعد على تحسين العملاء والعمليات والجودة والموظفين والتقنية
          والمخاطر، وقد تساهم بصورة مباشرة أو غير مباشرة في تحقيق النتائج المالية والاستراتيجية.
        </p>

        {nonFinancialKpis.length === 0 && <div className="empty-note">لا توجد مؤشرات غير مالية بعد.</div>}
        {nonFinancialKpis.map((kpi) => (
          <KpiCard
            key={kpi.id}
            kpi={kpi}
            onChange={(patch) => updateKpi(kpi.id, patch)}
            onDelete={() => removeKpi(kpi.id)}
            financialKpis={financialKpis}
            defaultOpen={kpi.id === justAddedId}
          />
        ))}

        <button type="button" className="primary-btn" onClick={() => addKpi('nonFinancial')}>
          + إضافة مؤشر غير مالي
        </button>
      </div>

      <div className="card">
        <h2><span className="n">3</span> المهام الرئيسية / الروتينية</h2>
        <p className="section-help">
          تُراجع المهام الرئيسية والروتينية لاكتشاف فرص التطوير أو التبسيط أو معالجة القصور، ومن ثم استنباط
          أهداف تشغيلية منها.
        </p>

        {mainTasks.length === 0 && <div className="empty-note">لا توجد مهام بعد.</div>}
        {mainTasks.map((task) => (
          <MainTaskCard
            key={task.id}
            task={task}
            onChange={(patch) => updateTask(task.id, patch)}
            onDelete={() => removeTask(task.id)}
            defaultOpen={task.id === justAddedId}
          />
        ))}

        <button type="button" className="primary-btn" onClick={addTask}>
          + إضافة مهمة رئيسية أو روتينية
        </button>
      </div>
    </>
  )
}
