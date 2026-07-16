import CollapsibleCard from './CollapsibleCard'
import DynamicPointsList from './DynamicPointsList'

const CATEGORY_OPTIONS = [
  'العملاء والمستفيدون',
  'العمليات الداخلية',
  'الجودة والامتثال',
  'التعلم وتطوير الموظفين',
  'التقنية والتحول الرقمي',
  'المخاطر واستمرارية الأعمال',
  'أخرى',
]

const UNIT_OPTIONS = ['نسبة مئوية', 'مبلغ مالي', 'عدد', 'معدل', 'أخرى']

const SOURCE_OPTIONS = ['الخطة الاستراتيجية', 'الإدارة العليا', 'الميزانية', 'قرار إداري', 'أخرى']

const RELATIONSHIP_OPTIONS = [
  { value: 'direct', label: 'ارتباط مباشر' },
  { value: 'indirect', label: 'ارتباط غير مباشر' },
  { value: 'enabler', label: 'عامل تمكين' },
  { value: 'unspecified', label: 'غير محدد' },
]

const FREQUENCY_OPTIONS = ['شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي', 'عند الحاجة']

const FINANCIAL_STATUS_OPTIONS = [
  { value: 'draft', label: 'مسودة' },
  { value: 'review', label: 'تحت المراجعة' },
  { value: 'approved', label: 'معتمد' },
]

const NONFINANCIAL_STATUS_OPTIONS = [
  { value: 'proposed', label: 'مقترح' },
  { value: 'review', label: 'تحت المراجعة' },
  { value: 'approved', label: 'معتمد' },
  { value: 'rejected', label: 'مستبعد' },
]

export default function KpiCard({ kpi, onChange, onDelete, financialKpis = [], defaultOpen }) {
  const isFinancial = kpi.type === 'financial'
  const set = (patch) => onChange({ ...kpi, ...patch })
  const statusOptions = isFinancial ? FINANCIAL_STATUS_OPTIONS : NONFINANCIAL_STATUS_OPTIONS
  const statusLabel = statusOptions.find((s) => s.value === kpi.status)?.label

  return (
    <CollapsibleCard
      defaultOpen={defaultOpen}
      onDelete={onDelete}
      deleteLabel="حذف المؤشر"
      title={kpi.title || (isFinancial ? 'مؤشر مالي جديد' : 'مؤشر غير مالي جديد')}
      badges={
        <>
          <span className={`indicator-badge ${isFinancial ? 'badge-financial' : 'badge-nonfinancial'}`}>
            {isFinancial ? 'مالي' : 'غير مالي'}
          </span>
          {!isFinancial && kpi.category && <span className="indicator-badge badge-category">{kpi.category}</span>}
          {statusLabel && <span className="indicator-badge status-badge">{statusLabel}</span>}
        </>
      }
    >
      <div className="indicator-grid grid2">
        <div className="field">
          <label>اسم المؤشر</label>
          <input
            type="text"
            value={kpi.title}
            placeholder="مثال: نمو الإيرادات"
            onChange={(e) => set({ title: e.target.value })}
          />
        </div>

        <div className="field">
          <label>{isFinancial ? 'الهدف الاستراتيجي أو التوجه المرتبط به' : 'الهدف أو التوجه الاستراتيجي الذي يخدمه'}</label>
          <input type="text" value={kpi.strategicLink} onChange={(e) => set({ strategicLink: e.target.value })} />
        </div>

        {!isFinancial && (
          <div className="field">
            <label>تصنيف المؤشر</label>
            <select value={kpi.category} onChange={(e) => set({ category: e.target.value })}>
              <option value="">اختر تصنيفاً</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {!isFinancial && (
          <div className="field">
            <label>المؤشر المالي الذي يدعمه</label>
            <select value={kpi.linkedFinancialKpiId} onChange={(e) => set({ linkedFinancialKpiId: e.target.value })}>
              <option value="">لا يوجد ارتباط مباشر</option>
              {financialKpis.map((f) => (
                <option key={f.id} value={f.id}>{f.title || 'مؤشر مالي بدون اسم'}</option>
              ))}
            </select>
          </div>
        )}

        {!isFinancial && (
          <div className="field">
            <label>نوع العلاقة</label>
            <select value={kpi.relationshipType} onChange={(e) => set({ relationshipType: e.target.value })}>
              <option value="">اختر نوع العلاقة</option>
              {RELATIONSHIP_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        )}

        {isFinancial && (
          <div className="field">
            <label>مصدر المؤشر</label>
            <select value={kpi.source} onChange={(e) => set({ source: e.target.value })}>
              <option value="">اختر مصدراً</option>
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        <div className="field">
          <label>وصف مختصر للمؤشر</label>
          <input type="text" value={kpi.description} onChange={(e) => set({ description: e.target.value })} />
        </div>

        <div className="field">
          <label>طريقة القياس أو المعادلة الأولية</label>
          <input type="text" value={kpi.measurementMethod} onChange={(e) => set({ measurementMethod: e.target.value })} />
        </div>

        <div className="field">
          <label>وحدة القياس</label>
          <select value={kpi.measurementUnit} onChange={(e) => set({ measurementUnit: e.target.value })}>
            <option value="">اختر وحدة</option>
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {!isFinancial && (
          <div className="field">
            <label>مصدر البيانات المتوقع</label>
            <input type="text" value={kpi.dataSource} onChange={(e) => set({ dataSource: e.target.value })} />
          </div>
        )}

        {!isFinancial && (
          <div className="field">
            <label>دورية القياس</label>
            <select value={kpi.frequency} onChange={(e) => set({ frequency: e.target.value })}>
              <option value="">اختر دورية</option>
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        )}

        {!isFinancial && (
          <div className="field">
            <label>سبب اقتراح المؤشر</label>
            <input type="text" value={kpi.reason} onChange={(e) => set({ reason: e.target.value })} />
          </div>
        )}

        <div className="field">
          <label>حالة المؤشر</label>
          <select value={kpi.status} onChange={(e) => set({ status: e.target.value })}>
            <option value="">اختر الحالة</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <DynamicPointsList
        label="نقاط العصف الذهني"
        points={kpi.brainstormPoints}
        onChange={(brainstormPoints) => set({ brainstormPoints })}
        placeholder="مثال: ما الإجراءات التي يمكن أن ترفع هذا المؤشر؟"
        addLabel="إضافة نقطة"
      />

      <div className="field">
        <label>ملاحظات إضافية</label>
        <textarea value={kpi.notes} onChange={(e) => set({ notes: e.target.value })} />
      </div>
    </CollapsibleCard>
  )
}
