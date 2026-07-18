export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// المحاور الخمسة التي تُصنَّف عليها مؤشرات الأداء في صفحة الرؤية والمؤشرات
export const KPI_AXES = [
  { key: 'products', label: 'محور المنتجات والخدمات' },
  { key: 'hr', label: 'محور الموارد البشرية والهيكل' },
  { key: 'financial', label: 'محور المالي' },
  { key: 'tech', label: 'محور التقنية' },
  { key: 'customers', label: 'محور العملاء والأسواق' },
]

export function axisLabel(key) {
  return KPI_AXES.find((a) => a.key === key)?.label || key
}

// إنشاء مؤشر أداء جديد ضمن أحد المحاور الخمسة، بالحقول الكاملة لصفحة الرؤية والمؤشرات
export function newKpi(axis = 'products') {
  return {
    id: uid(),
    axis, // 'products' | 'hr' | 'financial' | 'tech' | 'customers'

    title: '',
    strategicObjective: '',
    description: '',

    measurementMethod: '',
    measurementUnit: '',
    baselineValue: '',
    targetValue: '',
    targetPeriod: '',
    improvementDirection: '',

    dataSource: '',
    measurementFrequency: '',
    owner: '',

    indicatorSource: '',
    selectionRationale: '',
    status: 'draft',

    brainstormItems: [],
    committeeNotes: '',

    // خاصة بمحور المالي فقط
    financialReference: '',
    financialLineItem: '',

    // خاصة بالمحاور الأربعة الأخرى فقط (ربطها بمؤشر من محور المالي)
    linkedFinancialKpiId: '',
    relationshipType: '',
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

const KPI_AXIS_KEYS = ['products', 'hr', 'financial', 'tech', 'customers']

// خريطة تحويل تصنيف المؤشر القديم (وحقل type القديم) إلى المحور الجديد الأقرب له
const CATEGORY_TO_AXIS = {
  'العملاء والسوق': 'customers',
  'العملاء والمستفيدون': 'customers',
  'العمليات الداخلية': 'products',
  'الجودة والامتثال': 'products',
  'الموظفون والتعلم': 'hr',
  'التعلم وتطوير الموظفين': 'hr',
  'التقنية والتحول الرقمي': 'tech',
  'المخاطر واستمرارية الأعمال': 'products',
  'أخرى': 'products',
}

// يشتق المحور المناسب من بيانات مؤشر قديم: يفضّل axis الجديد إن وجد، وإلا يشتقه
// من type القديم (مالي/غير مالي) وcategory القديمة، وإلا يستخدم "المنتجات والخدمات" كافتراضي آمن
function deriveAxis(item) {
  if (item.axis && KPI_AXIS_KEYS.includes(item.axis)) return item.axis
  if (item.type === 'financial') return 'financial'
  if (item.category && CATEGORY_TO_AXIS[item.category]) return CATEGORY_TO_AXIS[item.category]
  return 'products'
}

// يحوّل نقاط العصف الذهني القديمة (string[] أو objects ناقصة) إلى الهيكل الجديد {id, type, text}
function migrateBrainstormItems(item) {
  const raw = Array.isArray(item.brainstormItems)
    ? item.brainstormItems
    : Array.isArray(item.brainstormPoints)
      ? item.brainstormPoints
      : []
  return raw.map((p) => {
    if (typeof p === 'string') return { id: uid(), type: 'idea', text: p }
    return { id: p.id || uid(), type: p.type || 'idea', text: p.text || '' }
  })
}

// تحويل مهمة قديمة (نص فقط) إلى الهيكل الجديد، بحقول جديدة فارغة كما هو مطلوب في الترحيل
function migrateLegacyMainTask(title) {
  return { ...newMainTask('main'), title, status: '' }
}

function normalizeKpiItem(item) {
  if (typeof item === 'string') {
    return { changed: true, value: migrateLegacyKpi(item) }
  }
  const axis = deriveAxis(item)
  const base = newKpi(axis)
  const value = { ...base, ...item, id: item.id || uid(), axis }

  // ترحيل الحقول من الأسماء القديمة (أجيال سابقة من هذه الصفحة) إلى الأسماء الجديدة،
  // بدون الكتابة فوق قيمة جديدة موجودة أصلاً
  if (!value.strategicObjective && item.strategicLink) value.strategicObjective = item.strategicLink
  if (!value.committeeNotes && item.notes) value.committeeNotes = item.notes
  if (!value.measurementFrequency && item.frequency) value.measurementFrequency = item.frequency
  if (!value.selectionRationale && item.reason) value.selectionRationale = item.reason
  if (!value.indicatorSource && item.source) value.indicatorSource = item.source

  value.brainstormItems = migrateBrainstormItems(item)
  delete value.brainstormPoints
  delete value.strategicLink
  delete value.notes
  delete value.frequency
  delete value.reason
  delete value.source
  delete value.type
  delete value.category

  const oldKeys = ['type', 'category', 'strategicLink', 'notes', 'frequency', 'reason', 'source', 'brainstormPoints']
  const newKeys = [
    'axis', 'strategicObjective', 'committeeNotes', 'measurementFrequency', 'selectionRationale',
    'indicatorSource', 'brainstormItems', 'baselineValue', 'targetValue', 'targetPeriod',
    'improvementDirection', 'owner', 'financialReference', 'financialLineItem',
  ]
  const changed =
    !item.id ||
    oldKeys.some((k) => k in item) ||
    newKeys.some((k) => !(k in item))
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

  // قائمة الأهداف/التوجهات الاستراتيجية المشتركة تُبنى من أي قيم strategicObjective
  // سبق إدخالها يدوياً في المؤشرات، بالإضافة لأي قائمة محفوظة مسبقاً
  const existingLinks = Array.isArray(rawState.strategicLinks) ? rawState.strategicLinks : []
  if (!Array.isArray(rawState.strategicLinks)) changed = true
  const derivedLinks = kpis.map((k) => k.strategicObjective).filter(Boolean)
  const strategicLinks = Array.from(new Set([...existingLinks, ...derivedLinks]))
  if (strategicLinks.length !== existingLinks.length) changed = true

  return { state: { ...rawState, kpis, mainTasks, strategicLinks }, changed }
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
    strategicLinks: [],
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
