import CollapsibleCard from './CollapsibleCard'
import DynamicPointsList from './DynamicPointsList'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'مسودة' },
  { value: 'review', label: 'تحت المراجعة' },
  { value: 'approved', label: 'معتمدة' },
]

export default function MainTaskCard({ task, onChange, onDelete, defaultOpen }) {
  const isMain = task.taskType === 'main'
  const set = (patch) => onChange({ ...task, ...patch })
  const statusLabel = STATUS_OPTIONS.find((s) => s.value === task.status)?.label

  return (
    <CollapsibleCard
      defaultOpen={defaultOpen}
      onDelete={onDelete}
      deleteLabel="حذف المهمة"
      title={task.title || 'مهمة جديدة'}
      badges={
        <>
          <span className={`indicator-badge ${isMain ? 'badge-main' : 'badge-routine'}`}>
            {isMain ? 'رئيسية' : 'روتينية'}
          </span>
          {statusLabel && <span className="indicator-badge status-badge">{statusLabel}</span>}
        </>
      }
    >
      <div className="indicator-grid grid2">
        <div className="field">
          <label>اسم المهمة</label>
          <input type="text" value={task.title} onChange={(e) => set({ title: e.target.value })} />
        </div>

        <div className="field">
          <label>نوع المهمة</label>
          <select value={task.taskType} onChange={(e) => set({ taskType: e.target.value })}>
            <option value="main">مهمة رئيسية</option>
            <option value="routine">مهمة روتينية</option>
          </select>
        </div>

        <div className="field">
          <label>الإدارة أو الجهة المسؤولة</label>
          <input type="text" value={task.responsibleDepartment} onChange={(e) => set({ responsibleDepartment: e.target.value })} />
        </div>

        <div className="field">
          <label>المستفيدون من المهمة</label>
          <input type="text" value={task.beneficiaries} onChange={(e) => set({ beneficiaries: e.target.value })} />
        </div>

        <div className="field">
          <label>حالة المراجعة</label>
          <select value={task.status} onChange={(e) => set({ status: e.target.value })}>
            <option value="">اختر الحالة</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label>وصف مختصر للمهمة</label>
        <textarea value={task.description} onChange={(e) => set({ description: e.target.value })} />
      </div>

      <DynamicPointsList
        label="نقاط العصف الذهني"
        points={task.brainstormPoints}
        onChange={(brainstormPoints) => set({ brainstormPoints })}
        placeholder="نقطة عصف ذهني..."
        addLabel="إضافة نقطة"
      />
      <DynamicPointsList
        label="المشكلات أو التحديات الحالية"
        points={task.challenges}
        onChange={(challenges) => set({ challenges })}
        placeholder="تحدٍ أو مشكلة حالية..."
        addLabel="إضافة تحدٍ"
      />
      <DynamicPointsList
        label="فرص التحسين"
        points={task.improvementOpportunities}
        onChange={(improvementOpportunities) => set({ improvementOpportunities })}
        placeholder="فرصة تحسين..."
        addLabel="إضافة فرصة تحسين"
      />
      <DynamicPointsList
        label="أفكار أولية لأهداف محتملة"
        points={task.potentialObjectives}
        onChange={(potentialObjectives) => set({ potentialObjectives })}
        placeholder="فكرة هدف محتمل..."
        addLabel="إضافة فكرة"
      />

      <div className="field">
        <label>ملاحظات إضافية</label>
        <textarea value={task.notes} onChange={(e) => set({ notes: e.target.value })} />
      </div>
    </CollapsibleCard>
  )
}
