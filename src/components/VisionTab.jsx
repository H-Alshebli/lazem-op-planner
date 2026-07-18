import { useState } from 'react'
import { newKpi, newMainTask, KPI_AXES } from '../utils/calc'
import KpiCard from './KpiCard'
import MainTaskCard from './MainTaskCard'

const AXIS_HELP = {
  products: 'مؤشرات تقيس أداء المنتجات والخدمات المقدَّمة، وجودتها، وكفاءة تقديمها.',
  hr: 'مؤشرات تقيس كفاءة الفريق المسؤول عن هذه العملية، وتطويره، واستقراره.',
  financial: 'مؤشرات الأداء المالية المعتمدة والواردة من الخطة الاستراتيجية أو من الإدارة العليا.',
  tech: 'مؤشرات مرتبطة بكفاءة الأنظمة والبنية التقنية وجاهزيتها واستمراريتها.',
  customers: 'مؤشرات تقيس رضا العملاء، وحصة السوق، ونمو قاعدة العملاء.',
}

export default function VisionTab({
  vision,
  setVision,
  kpis,
  setKpis,
  mainTasks,
  setMainTasks,
  strategicLinks,
  setStrategicLinks,
}) {
  const [justAddedId, setJustAddedId] = useState(null)

  const financialKpis = kpis.filter((k) => k.axis === 'financial')

  const updateKpi = (id, patch) => {
    setKpis(kpis.map((k) => (k.id === id ? patch : k)))
  }
  const addStrategicLink = (text) => {
    if (!strategicLinks.includes(text)) setStrategicLinks([...strategicLinks, text])
  }
  const removeKpi = (id) => {
    if (!confirm('حذف هذا المؤشر؟')) return
    setKpis(
      kpis
        .filter((k) => k.id !== id)
        .map((k) => (k.linkedFinancialKpiId === id ? { ...k, linkedFinancialKpiId: '' } : k))
    )
  }
  const addKpi = (axis) => {
    const kpi = newKpi(axis)
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

      {KPI_AXES.map((axis) => {
        const axisKpis = kpis.filter((k) => k.axis === axis.key)
        return (
          <div className="card indicators-section" key={axis.key}>
            <h2>{axis.label}</h2>
            <p className="section-help">{AXIS_HELP[axis.key]}</p>

            {axisKpis.length === 0 && <div className="empty-note">لا توجد مؤشرات في هذا المحور بعد.</div>}
            {axisKpis.map((kpi) => (
              <KpiCard
                key={kpi.id}
                kpi={kpi}
                onChange={(patch) => updateKpi(kpi.id, patch)}
                onDelete={() => removeKpi(kpi.id)}
                financialKpis={financialKpis}
                strategicLinks={strategicLinks}
                onAddStrategicLink={addStrategicLink}
                defaultOpen={kpi.id === justAddedId}
              />
            ))}

            <button type="button" className="primary-btn" onClick={() => addKpi(axis.key)}>
              + إضافة مؤشر في {axis.label}
            </button>
          </div>
        )
      })}

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
