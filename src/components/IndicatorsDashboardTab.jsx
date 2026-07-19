import { useMemo, useState } from 'react'
import { KPI_AXES, KPI_QUARTERS, KPI_MONTHS, quarterLabel, monthLabel } from '../utils/calc'
import CollapsibleCard from './CollapsibleCard'

const KPI_STATUS_LABELS = { draft: 'مسودة', review: 'تحت المراجعة', approved: 'معتمد', rejected: 'مستبعد' }
const KPI_DIRECTION_LABELS = {
  increase: '▲ الارتفاع أفضل',
  decrease: '▼ الانخفاض أفضل',
  maintain: 'المحافظة ضمن نطاق',
  unspecified: 'غير محدد',
}

function formatTargetPeriod(k) {
  const parts = []
  if (k.targetMonth) parts.push(monthLabel(k.targetMonth))
  else if (k.targetQuarter) parts.push(quarterLabel(k.targetQuarter))
  if (k.targetYear) parts.push(k.targetYear)
  return parts.length ? parts.join(' ') : (k.targetPeriod || '—')
}

export default function IndicatorsDashboardTab({ kpis }) {
  const [filterYear, setFilterYear] = useState('')
  const [filterQuarter, setFilterQuarter] = useState('')
  const [filterMonth, setFilterMonth] = useState('')

  const years = useMemo(
    () => Array.from(new Set(kpis.map((k) => k.targetYear).filter(Boolean))).sort(),
    [kpis]
  )

  const filteredKpis = useMemo(
    () =>
      kpis.filter((k) => {
        if (filterYear && k.targetYear !== filterYear) return false
        if (filterQuarter && k.targetQuarter !== filterQuarter) return false
        if (filterMonth && k.targetMonth !== filterMonth) return false
        return true
      }),
    [kpis, filterYear, filterQuarter, filterMonth]
  )

  const hasActiveFilter = !!(filterYear || filterQuarter || filterMonth)

  const overallStatusCounts = { draft: 0, review: 0, approved: 0, rejected: 0 }
  filteredKpis.forEach((k) => {
    if (overallStatusCounts[k.status] !== undefined) overallStatusCounts[k.status]++
  })

  return (
    <>
      <p className="page-intro">
        لوحة متابعة تفاعلية لمؤشرات الأداء المسجَّلة في صفحة «الرؤية والمؤشرات»، مقسّمة حسب المحاور
        الخمسة، مع إمكانية الفلترة حسب الفترة الزمنية المستهدفة لكل مؤشر.
      </p>

      <div className="card">
        <h2>الفلاتر</h2>
        <div className="filters">
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="">كل السنوات</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterQuarter} onChange={(e) => setFilterQuarter(e.target.value)}>
            <option value="">كل الأرباع</option>
            {KPI_QUARTERS.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
          </select>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="">كل الأشهر</option>
            {KPI_MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          {hasActiveFilter && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                setFilterYear('')
                setFilterQuarter('')
                setFilterMonth('')
              }}
            >
              ✕ إلغاء الفلاتر
            </button>
          )}
        </div>
      </div>

      <div className="stat-row">
        <div className="stat"><div className="val">{filteredKpis.length}</div><div className="lbl">إجمالي المؤشرات</div></div>
        <div className="stat"><div className="val">{overallStatusCounts.approved}</div><div className="lbl">مؤشرات معتمدة</div></div>
        <div className="stat"><div className="val">{overallStatusCounts.review}</div><div className="lbl">تحت المراجعة</div></div>
        <div className="stat"><div className="val">{overallStatusCounts.draft}</div><div className="lbl">مسودات</div></div>
      </div>

      <div className="card">
        <h2>المؤشرات حسب المحور</h2>
        {kpis.length === 0 ? (
          <div className="empty-note">لا توجد مؤشرات بعد — أضفها من تبويب "الرؤية والمؤشرات".</div>
        ) : (
          KPI_AXES.map((axis) => {
            const axisKpis = filteredKpis.filter((k) => k.axis === axis.key)
            const statusCounts = { draft: 0, review: 0, approved: 0, rejected: 0 }
            axisKpis.forEach((k) => {
              if (statusCounts[k.status] !== undefined) statusCounts[k.status]++
            })
            return (
              <CollapsibleCard
                key={axis.key}
                defaultOpen={axisKpis.length > 0}
                title={axis.label}
                badges={
                  <>
                    <span className={`indicator-badge axis-badge axis-${axis.key}`}>{axisKpis.length} مؤشر</span>
                    <span className="indicator-badge status-badge">مسودة: {statusCounts.draft}</span>
                    <span className="indicator-badge status-badge">تحت المراجعة: {statusCounts.review}</span>
                    <span className="indicator-badge status-badge">معتمد: {statusCounts.approved}</span>
                    <span className="indicator-badge status-badge">مستبعد: {statusCounts.rejected}</span>
                  </>
                }
              >
                {axisKpis.length === 0 ? (
                  <div className="empty-note">لا توجد مؤشرات مطابقة في هذا المحور.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>اسم المؤشر</th>
                        <th>الفترة المستهدفة</th>
                        <th>القيمة الحالية</th>
                        <th>القيمة المستهدفة</th>
                        <th>اتجاه التحسن</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {axisKpis.map((k) => (
                        <tr key={k.id}>
                          <td style={{ textAlign: 'right' }}>{k.title || '—'}</td>
                          <td>{formatTargetPeriod(k)}</td>
                          <td>{k.baselineValue || '—'}</td>
                          <td>{k.targetValue || '—'}</td>
                          <td>{KPI_DIRECTION_LABELS[k.improvementDirection] || '—'}</td>
                          <td><span className="indicator-badge status-badge">{KPI_STATUS_LABELS[k.status] || '—'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CollapsibleCard>
            )
          })
        )}
      </div>
    </>
  )
}
