export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// إنشاء مؤشر أداء جديد (مالي أو غير مالي) بالحقول الكاملة لصفحة الرؤية والمؤشرات
export function newKpi(type = 'financial') {
  return {
    id: uid(),
    title: '',
    type, // 'financial' | 'nonFinancial'
    strategicLink: '',
    description: '',
    category: '',
    linkedFinancialKpiId: '',
    relationshipType: '',
    measurementMethod: '',
    measurementUnit: '',
    dataSource: '',
    frequency: '',
    reason: '',
    source: '',
    status: type === 'nonFinancial' ? 'proposed' : 'draft',
    brainstormPoints: [],
    notes: '',
  }
}

// إنشاء مهمة رئيسية/روتينية جديدة بالحقول الكاملة لصفحة الرؤية والمؤشرات
export function newMainTask(taskType = 'main') {
  return {
    id: uid(),
    title: '',
    taskType, // 'main' | 'routine'
    description: '',
    responsibleDepartment: '',
    beneficiaries: '',
    brainstormPoints: [],
    challenges: [],
    improvementOpportunities: [],
    potentialObjectives: [],
    notes: '',
    status: 'draft',
  }
}

// تحويل مؤشر قديم (نص فقط) إلى الهيكل الجديد، بحقول جديدة فارغة كما هو مطلوب في الترحيل
function migrateLegacyKpi(title) {
  return { ...newKpi('financial'), title, status: '' }
}

// تحويل مهمة قديمة (نص فقط) إلى الهيكل الجديد، بحقول جديدة فارغة كما هو مطلوب في الترحيل
function migrateLegacyMainTask(title) {
  return { ...newMainTask('main'), title, status: '' }
}

function normalizeKpiItem(item) {
  if (typeof item === 'string') {
    return { changed: true, value: migrateLegacyKpi(item) }
  }
  const type = item.type === 'nonFinancial' ? 'nonFinancial' : 'financial'
  const base = newKpi(type)
  const value = { ...base, ...item, id: item.id || uid() }
  value.brainstormPoints = Array.isArray(item.brainstormPoints) ? item.brainstormPoints : []
  const changed = !item.id || !item.type
  return { changed, value }
}

function normalizeMainTaskItem(item) {
  if (typeof item === 'string') {
    return { changed: true, value: migrateLegacyMainTask(item) }
  }
  const taskType = item.taskType === 'routine' ? 'routine' : 'main'
  const base = newMainTask(taskType)
  const value = { ...base, ...item, id: item.id || uid() }
  value.brainstormPoints = Array.isArray(item.brainstormPoints) ? item.brainstormPoints : []
  value.challenges = Array.isArray(item.challenges) ? item.challenges : []
  value.improvementOpportunities = Array.isArray(item.improvementOpportunities) ? item.improvementOpportunities : []
  value.potentialObjectives = Array.isArray(item.potentialObjectives) ? item.potentialObjectives : []
  const changed = !item.id || !item.taskType
  return { changed, value }
}

// يحوّل kpis وmainTasks القديمة (arrays of strings) إلى الهيكل الجديد (arrays of objects)
// دون المساس بأي قسم آخر من بيانات الخطة. changed=true يعني أن ترحيلاً فعلياً حصل
// ويجب حفظ النتيجة، وchanged=false يعني أن البيانات كانت أصلاً بالهيكل الجديد.
export function normalizeOperationalPlanState(rawState) {
  if (!rawState) return { state: rawState, changed: false }
  let changed = false

  const rawKpis = Array.isArray(rawState.kpis) ? rawState.kpis : []
  if (!Array.isArray(rawState.kpis)) changed = true
  const kpis = rawKpis.map((item) => {
    const r = normalizeKpiItem(item)
    if (r.changed) changed = true
    return r.value
  })

  const rawMainTasks = Array.isArray(rawState.mainTasks) ? rawState.mainTasks : []
  if (!Array.isArray(rawState.mainTasks)) changed = true
  const mainTasks = rawMainTasks.map((item) => {
    const r = normalizeMainTaskItem(item)
    if (r.changed) changed = true
    return r.value
  })

  return { state: { ...rawState, kpis, mainTasks }, changed }
}

export function defaultState() {
  return {
    plan: {
      dept: '',
      start: '',
      end: '',
      duration: 0,
      team: [],
      approvals: [],
    },
    vision: '',
    kpis: [],
    mainTasks: [],
    swot: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    },
    objectives: [],
    policies: '',
  }
}

export function computeObjective(obj) {
  const totalWeight = obj.tasks.reduce((s, t) => s + (Number(t.weight) || 0), 0)
  const doneWeight = obj.tasks.reduce(
    (s, t) => s + (t.done ? Number(t.weight) || 0 : 0),
    0
  )
  const pct = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0
  let status = 'empty'
  if (obj.tasks.length === 0) status = 'empty'
  else if (pct === 0) status = 'notstarted'
  else if (pct === 100) status = 'done'
  else status = 'progress'
  return { totalWeight, doneWeight, pct, status }
}

export function statusLabel(s) {
  return { empty: 'لا توجد إجراءات', notstarted: 'لم يبدأ', progress: 'قيد التنفيذ', done: 'مكتمل' }[s]
}

export function isOverdue(task) {
  return !!(task.due && !task.done && new Date(task.due) < new Date(new Date().toDateString()))
}
