export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function defaultState() {
  return {
    plan: {
      dept: 'إدارة تقنية المعلومات والتحول الرقمي',
      start: '2026-06-17',
      end: '2026-12-31',
      duration: 6,
      team: [
        { role: 'المسؤول عن الخطة', name: 'حمدان الشبلي' },
        { role: 'عضو فريق التخطيط', name: 'سلمان الدرويش' },
      ],
      approvals: [{ name: 'د. معاذ', signature: '' }],
    },
    vision:
      'أن نكون المجموعة السعودية الرائدة في قطاع السلامة والصحة المهنية عبر تقديم حلول شمولية مبتكرة قابلة للتطبيق في مختلف القطاعات وتناسب جميع الفئات.',
    kpis: ['زيادة المبيعات'],
    mainTasks: [
      'تشغيل الشبكات الداخلية والحفاظ على استمراريتها',
      'الاشتراك في الأنظمة الرقمية والحفاظ على استمراريتها',
      'شراء الأجهزة التقنية والحفاظ على استمراريتها',
      'بناء تطبيقات تقنية والحفاظ على استمراريتها',
    ],
    swot: {
      strengths: ['عندنا أفكار عظيمة', 'إيمان الإدارة العليا بإدارتنا'],
      weaknesses: [
        'ميزانية منخفضة',
        'فريق محدود',
        'قلة خبرة بالموظفين الحاليين',
        'عدم وجود خطة للإدارة',
      ],
      opportunities: [
        'إمكانية توظيف موظف جديد',
        'إمكانية تحويل الأنظمة إلى منتجات بيع',
        'إمكانية إدراج الذكاء الاصطناعي في تسهيل العمل',
      ],
      threats: ['احتمال توقف الأنظمة أو خسارة البيانات'],
    },
    objectives: [
      { id: uid(), title: 'أتمتة العمليات', tasks: [] },
      { id: uid(), title: 'بناء أنظمة رقمية', tasks: [] },
      { id: uid(), title: 'زيادة الموظفين', tasks: [] },
      { id: uid(), title: 'تحويل الأنظمة إلى منتجات بيع', tasks: [] },
      { id: uid(), title: 'الحفاظ على آلية النظام وعمل باك أب لقواعد البيانات', tasks: [] },
      { id: uid(), title: 'وضع خطة للإدارة', tasks: [] },
    ],
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
