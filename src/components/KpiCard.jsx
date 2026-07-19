import { useState } from 'react'
import CollapsibleCard from './CollapsibleCard'
import BrainstormItemsList from './BrainstormItemsList'
import { axisLabel, KPI_QUARTERS, KPI_MONTHS } from '../utils/calc'

const UNIT_OPTIONS = ['ريال سعودي', 'نسبة مئوية', 'عدد', 'يوم', 'ساعة', 'معدل', 'درجة', 'أخرى']

const INDICATOR_SOURCE_OPTIONS = [
  'الخطة الاستراتيجية',
  'الإدارة العليا',
  'لجنة التخطيط',
  'متطلب تنظيمي',
  'مهمة رئيسية',
  'تحليل SWOT',
  'خطة مالية أو ميزانية',
  'أخرى',
]

const RELATIONSHIP_OPTIONS = [
  { value: 'direct', label: 'ارتباط مباشر' },
  { value: 'indirect', label: 'ارتباط غير مباشر' },
  { value: 'enabler', label: 'عامل تمكين' },
  { value: 'unspecified', label: 'لا يوجد ارتباط مباشر' },
]

const FREQUENCY_OPTIONS = ['أسبوعي', 'شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي', 'عند الحاجة']

const IMPROVEMENT_DIRECTION_OPTIONS = [
  { value: 'increase', label: 'الارتفاع أفضل' },
  { value: 'decrease', label: 'الانخفاض أفضل' },
  { value: 'maintain', label: 'المحافظة ضمن نطاق' },
  { value: 'unspecified', label: 'غير محدد' },
]

const FINANCIAL_REFERENCE_OPTIONS = [
  'قائمة الدخل',
  'قائمة التدفقات النقدية',
  'الميزانية العمومية',
  'نموذج الإيرادات',
  'الميزانية السنوية',
  'خطة المبيعات',
  'أخرى',
]

const FINANCIAL_LINE_ITEM_OPTIONS = [
  'الإيرادات',
  'تكلفة الإيرادات',
  'إجمالي الربح',
  'المصروفات التشغيلية',
  'الربح التشغيلي',
  'صافي الربح',
  'التدفقات النقدية',
  'الذمم المدينة',
  'المصروفات الرأسمالية',
  'أخرى',
]

const STATUS_OPTIONS = [
  { value: 'draft', label: 'مسودة' },
  { value: 'review', label: 'تحت المراجعة' },
  { value: 'approved', label: 'معتمد' },
  { value: 'rejected', label: 'مستبعد' },
]

const ADD_NEW_VALUE = '__add_new__'

export default function KpiCard({
  kpi,
  onChange,
  onDelete,
  financialKpis = [],
  strategicLinks = [],
  onAddStrategicLink,
  defaultOpen,
}) {
  const isFinancial = kpi.axis === 'financial'
  const set = (patch) => onChange({ ...kpi, ...patch })
  const statusLabel = STATUS_OPTIONS.find((s) => s.value === kpi.status)?.label

  const [addingLink, setAddingLink] = useState(false)
  const [newLinkText, setNewLinkText] = useState('')

  const handleStrategicObjectiveChange = (value) => {
    if (value === ADD_NEW_VALUE) {
      setNewLinkText('')
      setAddingLink(true)
      return
    }
    set({ strategicObjective: value })
  }
  const confirmNewLink = () => {
    const text = newLinkText.trim()
    if (!text) {
      setAddingLink(false)
      return
    }
    if (!strategicLinks.includes(text)) onAddStrategicLink?.(text)
    set({ strategicObjective: text })
    setAddingLink(false)
    setNewLinkText('')
  }

  return (
    <CollapsibleCard
      defaultOpen={defaultOpen}
      onDelete={onDelete}
      deleteLabel="حذف المؤشر"
      title={kpi.title || 'مؤشر جديد'}
      badges={
        <>
          <span className={`indicator-badge axis-badge axis-${kpi.axis}`}>
            {axisLabel(kpi.axis)}
          </span>
          {statusLabel && <span className="indicator-badge status-badge">{statusLabel}</span>}
          {kpi.baselineValue && <span className="indicator-badge value-badge">الحالي: {kpi.baselineValue}</span>}
          {kpi.targetValue && <span className="indicator-badge value-badge">المستهدف: {kpi.targetValue}</span>}
        </>
      }
    >
      {/* أ. تعريف المؤشر */}
      <h3 className="kpi-subsection-title kpi-subsection-title-first">تعريف المؤشر</h3>
      <div className="indicator-grid grid2">
        <div className="field">
          <label>اسم المؤشر *</label>
          <input
            type="text"
            required
            value={kpi.title}
            placeholder="مثال: إجمالي الإيرادات"
            onChange={(e) => set({ title: e.target.value })}
          />
        </div>

        <div className="field">
          <label>الهدف الاستراتيجي المرتبط</label>
          {addingLink ? (
            <div className="row-item">
              <input
                type="text"
                autoFocus
                placeholder="اكتب الهدف الاستراتيجي الجديد..."
                value={newLinkText}
                onChange={(e) => setNewLinkText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    confirmNewLink()
                  }
                }}
              />
              <button type="button" className="add-btn" onClick={confirmNewLink}>إضافة</button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  setAddingLink(false)
                  setNewLinkText('')
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <select value={kpi.strategicObjective} onChange={(e) => handleStrategicObjectiveChange(e.target.value)}>
              <option value="">اختر هدفاً استراتيجياً</option>
              {[...strategicLinks, kpi.strategicObjective]
                .filter((v, i, arr) => v && arr.indexOf(v) === i)
                .map((link) => (
                  <option key={link} value={link}>{link}</option>
                ))}
              <option value={ADD_NEW_VALUE}>+ إضافة هدف استراتيجي جديد...</option>
            </select>
          )}
        </div>

        <div className="field field-span2">
          <label>وصف وتعريف المؤشر</label>
          <p className="field-help">اشرح ما الذي يقيسه المؤشر، وما الذي يدخل أو لا يدخل ضمن احتسابه.</p>
          <textarea
            style={{ minHeight: 90 }}
            value={kpi.description}
            onChange={(e) => set({ description: e.target.value })}
          />
        </div>
      </div>

      {/* ب. القياس والمستهدف */}
      <h3 className="kpi-subsection-title">القياس والمستهدف</h3>
      <div className="indicator-grid grid2">
        <div className="field field-span2">
          <label>طريقة القياس أو المعادلة</label>
          <textarea
            style={{ minHeight: 90 }}
            placeholder="مثال: عدد العملاء الراضين ÷ إجمالي المشاركين × 100"
            value={kpi.measurementMethod}
            onChange={(e) => set({ measurementMethod: e.target.value })}
          />
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

        <div className="field">
          <label>القيمة الحالية</label>
          <input
            type="text"
            placeholder="مثال: 70% أو 25,000,000 ريال أو غير متوفر"
            value={kpi.baselineValue}
            onChange={(e) => set({ baselineValue: e.target.value })}
          />
        </div>

        <div className="field">
          <label>القيمة المستهدفة</label>
          <input
            type="text"
            placeholder="مثال: 90% أو 3 أيام"
            value={kpi.targetValue}
            onChange={(e) => set({ targetValue: e.target.value })}
          />
        </div>

        <div className="field">
          <label>وصف الفترة المستهدفة (اختياري)</label>
          <input
            type="text"
            placeholder="مثال: نهاية الربع الثالث، أو بحلول إغلاق السنة المالية"
            value={kpi.targetPeriod}
            onChange={(e) => set({ targetPeriod: e.target.value })}
          />
        </div>

        <div className="field">
          <label>السنة المستهدفة</label>
          <input
            type="number"
            placeholder="مثال: 2026"
            value={kpi.targetYear}
            onChange={(e) => set({ targetYear: e.target.value })}
          />
        </div>

        <div className="field">
          <label>الربع السنوي المستهدف</label>
          <select value={kpi.targetQuarter} onChange={(e) => set({ targetQuarter: e.target.value })}>
            <option value="">غير محدد</option>
            {KPI_QUARTERS.map((q) => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>الشهر المستهدف</label>
          <select value={kpi.targetMonth} onChange={(e) => set({ targetMonth: e.target.value })}>
            <option value="">غير محدد</option>
            {KPI_MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>اتجاه التحسن</label>
          <select value={kpi.improvementDirection} onChange={(e) => set({ improvementDirection: e.target.value })}>
            <option value="">اختر اتجاهاً</option>
            {IMPROVEMENT_DIRECTION_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ج. المسؤولية ومصدر البيانات */}
      <h3 className="kpi-subsection-title">المسؤولية ومصدر البيانات</h3>
      <div className="indicator-grid grid2">
        <div className="field">
          <label>مصدر بيانات القياس</label>
          <input
            type="text"
            placeholder="مثال: النظام المالي، CRM، استبيان العملاء"
            value={kpi.dataSource}
            onChange={(e) => set({ dataSource: e.target.value })}
          />
        </div>

        <div className="field">
          <label>دورية القياس</label>
          <select value={kpi.measurementFrequency} onChange={(e) => set({ measurementFrequency: e.target.value })}>
            <option value="">اختر دورية</option>
            {FREQUENCY_OPTIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>مالك المؤشر</label>
          <input
            type="text"
            placeholder="الشخص أو الإدارة المسؤولة عن تحديث المؤشر"
            value={kpi.owner}
            onChange={(e) => set({ owner: e.target.value })}
          />
        </div>
      </div>

      {/* د. الارتباط والاستنباط */}
      <h3 className="kpi-subsection-title">الارتباط والاستنباط</h3>
      <div className="indicator-grid grid2">
        <div className="field">
          <label>مصدر المؤشر</label>
          <select value={kpi.indicatorSource} onChange={(e) => set({ indicatorSource: e.target.value })}>
            <option value="">اختر مصدراً</option>
            {INDICATOR_SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>حالة المؤشر</label>
          <select value={kpi.status} onChange={(e) => set({ status: e.target.value })}>
            <option value="">اختر الحالة</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="field field-span2">
          <label>مبرر اختيار المؤشر</label>
          <p className="field-help">لماذا تم اختيار هذا المؤشر؟ وما الفائدة من متابعته؟</p>
          <textarea value={kpi.selectionRationale} onChange={(e) => set({ selectionRationale: e.target.value })} />
        </div>

        {isFinancial && (
          <div className="field">
            <label>المرجع المالي</label>
            <select value={kpi.financialReference} onChange={(e) => set({ financialReference: e.target.value })}>
              <option value="">اختر مرجعاً</option>
              {FINANCIAL_REFERENCE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}

        {isFinancial && (
          <div className="field">
            <label>البند المالي المرتبط</label>
            <select value={kpi.financialLineItem} onChange={(e) => set({ financialLineItem: e.target.value })}>
              <option value="">اختر بنداً</option>
              {FINANCIAL_LINE_ITEM_OPTIONS.map((li) => (
                <option key={li} value={li}>{li}</option>
              ))}
            </select>
          </div>
        )}

        {!isFinancial && (
          <div className="field">
            <label>المؤشر المالي الذي يدعمه</label>
            <select value={kpi.linkedFinancialKpiId} onChange={(e) => set({ linkedFinancialKpiId: e.target.value })}>
              <option value="">لا يوجد ارتباط مالي مباشر</option>
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
      </div>

      {/* هـ. العصف الذهني والملاحظات */}
      <h3 className="kpi-subsection-title">العصف الذهني والملاحظات</h3>
      <BrainstormItemsList
        items={kpi.brainstormItems}
        onChange={(brainstormItems) => set({ brainstormItems })}
      />

      <div className="field">
        <label>ملاحظات اللجنة والافتراضات</label>
        <p className="field-help">اكتب القرارات أو الافتراضات أو المعلومات التي تحتاج مراجعة أو اعتماداً لاحقاً.</p>
        <textarea value={kpi.committeeNotes} onChange={(e) => set({ committeeNotes: e.target.value })} />
      </div>
    </CollapsibleCard>
  )
}
