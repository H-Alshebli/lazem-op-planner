import { useCallback, useMemo, useState } from 'react'
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
  pageIntro = 'تُستخدم هذه الصفحة لجمع المرجعيات والمؤشرات والمهام والأفكار التي ستساعد لجنة التخطيط لاحقاً على استنباط وصياغة الأهداف التشغيلية.',
  onOpenDashboard,
}) {
  const [justAddedId, setJustAddedId] = useState(null)

  // مرجع financialKpis يبقى ثابتاً طالما لم يتغيّر id أو عنوان أي مؤشر مالي فعلياً،
  // حتى لا تُعاد رسملة كل بطاقات المؤشرات غير المالية مع كل ضغطة مفتاح في أي مكان آخر
  const financialKpisKey = kpis
    .filter((k) => k.axis === 'financial')
    .map((k) => `${k.id}:${k.title}`)
    .join('|')
  const financialKpis = useMemo(
    () => kpis.filter((k) => k.axis === 'financial'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [financialKpisKey]
  )

  // كل دوال التحديث ثابتة المرجع (useCallback + الشكل الوظيفي لـ setKpis/setMainTasks)
  // وتُمرَّر كما هي (بدون لفّها بدالة جديدة لكل بطاقة) حتى يستفيد React.memo في
  // KpiCard/MainTaskCard فعلياً ويتجنب إعادة رسملة كل البطاقات الأخرى عند الكتابة في واحدة منها
  const updateKpi = useCallback(
    (id, patch) => setKpis((prev) => prev.map((k) => (k.id === id ? patch : k))),
    [setKpis]
  )
  const addStrategicLink = useCallback(
    (text) => setStrategicLinks((prev) => (prev.includes(text) ? prev : [...prev, text])),
    [setStrategicLinks]
  )
  const removeKpi = useCallback(
    (id) => {
      if (!confirm('حذف هذا المؤشر؟')) return
      setKpis((prev) =>
        prev
          .filter((k) => k.id !== id)
          .map((k) => (k.linkedFinancialKpiId === id ? { ...k, linkedFinancialKpiId: '' } : k))
      )
    },
    [setKpis]
  )
  const addKpi = useCallback(
    (axis) => {
      const kpi = newKpi(axis)
      setKpis((prev) => [...prev, kpi])
      setJustAddedId(kpi.id)
    },
    [setKpis]
  )

  const updateTask = useCallback(
    (id, patch) => setMainTasks((prev) => prev.map((t) => (t.id === id ? patch : t))),
    [setMainTasks]
  )
  const removeTask = useCallback(
    (id) => {
      if (!confirm('حذف هذه المهمة؟')) return
      setMainTasks((prev) => prev.filter((t) => t.id !== id))
    },
    [setMainTasks]
  )
  const addTask = useCallback(() => {
    const task = newMainTask('main')
    setMainTasks((prev) => [...prev, task])
    setJustAddedId(task.id)
  }, [setMainTasks])

  return (
    <>
      <div className="page-intro-row">
        <p className="page-intro">{pageIntro}</p>
        {onOpenDashboard && (
          <button type="button" className="primary-btn" onClick={onOpenDashboard}>
            📊 عرض لوحة متابعة المؤشرات
          </button>
        )}
      </div>

      <div className="card">
        <h2>رؤية المنظمة</h2>
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
                onChange={updateKpi}
                onDelete={removeKpi}
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
        <h2>المهام الرئيسية / الروتينية</h2>
        <p className="section-help">
          تُراجع المهام الرئيسية والروتينية لاكتشاف فرص التطوير أو التبسيط أو معالجة القصور، ومن ثم استنباط
          أهداف تشغيلية منها.
        </p>

        {mainTasks.length === 0 && <div className="empty-note">لا توجد مهام بعد.</div>}
        {mainTasks.map((task) => (
          <MainTaskCard
            key={task.id}
            task={task}
            onChange={updateTask}
            onDelete={removeTask}
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
