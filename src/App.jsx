import { useCallback, useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, PLAN_DOC_PATH } from './firebase'
import { defaultState, normalizeOperationalPlanState, uid } from './utils/calc'
import lazemLogo from './assets/lazem-logo-white.svg'
import Dashboard from './components/Dashboard'
import PlanTab from './components/PlanTab'
import VisionTab from './components/VisionTab'
import IndicatorsDashboardTab from './components/IndicatorsDashboardTab'
import SwotTab from './components/SwotTab'
import ObjectivesTab from './components/ObjectivesTab'
import PoliciesTab from './components/PoliciesTab'
import './App.css'

const TABS = [
  { id: 'strategy', label: 'الرؤية الاستراتيجية' },
  { id: 'plan', label: 'بيانات الخطة' },
  { id: 'vision', label: 'الرؤية والمؤشرات' },
  { id: 'swot', label: 'SWOT' },
  { id: 'objectives', label: 'الأهداف وخطط العمل' },
  { id: 'policies', label: 'السياسات' },
  { id: 'indicatorsDashboard', label: 'لوحة متابعة المؤشرات' },
  { id: 'dashboard', label: 'لوحة المتابعة' },
]

const docRef = doc(db, PLAN_DOC_PATH.collection, PLAN_DOC_PATH.doc)

export default function App() {
  const [state, setState] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [saving, setSaving] = useState(false)
  const [ready, setReady] = useState(false)
  const saveTimer = useRef(null)
  // معرّفات كتابات محلية لا تزال بانتظار "صداها" من Firestore. نستخدم مجموعة
  // (Set) بدل علامة واحدة (boolean) لأن أكثر من كتابة محلية قد تكون معلّقة
  // بنفس الوقت (مثلاً تعديل حقل ثم حذف بطاقة بسرعة) — علامة واحدة تفقد
  // تتبّع الكتابات الإضافية وتؤدي لتراجع تعديلات حديثة (كحذف لا "يثبت").
  const pendingWriteIds = useRef(new Set())
  const isRemoteUpdate = useRef(false)

  // الاشتراك اللحظي في وثيقة الخطة على Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        const incomingWriteId = snap.data()?.writeId
        if (incomingWriteId && pendingWriteIds.current.has(incomingWriteId)) {
          // هذا صدى كتابة محلية سبق أن أرسلناها لهذا الجهاز تحديداً — تجاهله
          pendingWriteIds.current.delete(incomingWriteId)
          setReady(true)
          return
        }
        if (snap.exists() && snap.data().data) {
          // نحوّل الهياكل القديمة لـ kpis/mainTasks (arrays of strings) إلى الهيكل الجديد
          // بدون فقدان بيانات الأقسام الأخرى. إن لم يحصل ترحيل فعلي، نتعامل مع
          // التحديث كتحديث قادم من السيرفر فقط (لا نعيد حفظه). إن حصل ترحيل، نترك
          // آلية الحفظ التلقائي تحفظه كأنه تعديل محلي حتى تُخزَّن البيانات المُرحَّلة.
          const { state: normalized, changed } = normalizeOperationalPlanState(snap.data().data)
          isRemoteUpdate.current = !changed
          setState(normalized)
        } else {
          isRemoteUpdate.current = true
          const seed = defaultState()
          setState(seed)
          const writeId = uid()
          pendingWriteIds.current.add(writeId)
          setDoc(docRef, { data: seed, writeId, updatedAt: serverTimestamp() })
        }
        setReady(true)
      },
      (err) => {
        console.error('Firestore sync error:', err)
        setState(defaultState())
        setReady(true)
      }
    )
    return () => unsub()
  }, [])

  // حفظ أي تعديل محلي إلى Firestore (بعد تأخير بسيط لتقليل عدد الكتابات)
  // يتجاهل التحديثات القادمة من Firestore نفسه (تحميل أولي أو تعديل من جهاز آخر) حتى لا يعيد حفظها من جديد
  useEffect(() => {
    if (!ready || state === null) return
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false
      return
    }
    setSaving(true)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      const writeId = uid()
      try {
        pendingWriteIds.current.add(writeId)
        await setDoc(docRef, { data: state, writeId, updatedAt: serverTimestamp() })
      } catch (e) {
        console.error('Save failed:', e)
        pendingWriteIds.current.delete(writeId)
      } finally {
        setSaving(false)
      }
    }, 400)
    return () => clearTimeout(saveTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  // نُنشئ دوال تحديث ثابتة المرجع (عبر useCallback + الشكل الوظيفي لـ setState) بدل
  // إعادة إنشاء دالة setXxx جديدة في كل render. بدون هذا، أي بطاقة (مؤشر/مهمة) تستخدم
  // React.memo تفقد فائدتها لأن الدالة التي تستقبلها كـ prop تتغيّر مرجعها باستمرار،
  // فتُعاد رسملة كل البطاقات مع كل ضغطة مفتاح — وهذا هو سبب بطء/تقطّع الكتابة.
  const updateField = useCallback((key, updater) => {
    setState((prev) => ({
      ...prev,
      [key]: typeof updater === 'function' ? updater(prev[key]) : updater,
    }))
  }, [])
  const setPlan = useCallback((v) => updateField('plan', v), [updateField])
  const setVision = useCallback((v) => updateField('vision', v), [updateField])
  const setKpis = useCallback((v) => updateField('kpis', v), [updateField])
  const setMainTasks = useCallback((v) => updateField('mainTasks', v), [updateField])
  const setStrategicLinks = useCallback((v) => updateField('strategicLinks', v), [updateField])
  const setSwot = useCallback((v) => updateField('swot', v), [updateField])
  const setObjectives = useCallback((v) => updateField('objectives', v), [updateField])
  const setPolicies = useCallback((v) => updateField('policies', v), [updateField])

  const updateStrategyField = useCallback((key, updater) => {
    setState((prev) => ({
      ...prev,
      strategy: {
        ...prev.strategy,
        [key]: typeof updater === 'function' ? updater(prev.strategy[key]) : updater,
      },
    }))
  }, [])
  const setStrategyVision = useCallback((v) => updateStrategyField('vision', v), [updateStrategyField])
  const setStrategyKpis = useCallback((v) => updateStrategyField('kpis', v), [updateStrategyField])
  const setStrategyMainTasks = useCallback((v) => updateStrategyField('mainTasks', v), [updateStrategyField])
  const setStrategyStrategicLinks = useCallback(
    (v) => updateStrategyField('strategicLinks', v),
    [updateStrategyField]
  )

  const openIndicatorsDashboard = useCallback(() => setActiveTab('indicatorsDashboard'), [])

  if (!state) {
    return <div className="loading-screen">جارِ تحميل الخطة...</div>
  }

  return (
    <>
      <header>
        <div className="brand">
          <img src={lazemLogo} alt="لازم" className="logo" />
          <div>
            <h1>نظام إدارة الخطة التشغيلية</h1>
            <div className="sub">التخطيط التشغيلي 2026</div>
          </div>
        </div>
        <div className="sync-status">
          <span className={`sync-dot ${saving ? 'saving' : ''}`} />
          {saving ? 'جارِ الحفظ...' : 'محفوظ في السحابة'}
        </div>
      </header>

      <nav>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={activeTab === t.id ? 'active' : ''}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main>
        {activeTab === 'dashboard' && <Dashboard objectives={state.objectives} />}

        {activeTab === 'plan' && (
          <PlanTab plan={state.plan} setPlan={setPlan} />
        )}

        {activeTab === 'vision' && (
          <VisionTab
            vision={state.vision}
            setVision={setVision}
            kpis={state.kpis}
            setKpis={setKpis}
            mainTasks={state.mainTasks}
            setMainTasks={setMainTasks}
            strategicLinks={state.strategicLinks}
            setStrategicLinks={setStrategicLinks}
            onOpenDashboard={openIndicatorsDashboard}
          />
        )}

        {activeTab === 'indicatorsDashboard' && (
          <IndicatorsDashboardTab kpis={state.kpis} />
        )}

        {activeTab === 'strategy' && (
          <VisionTab
            vision={state.strategy.vision}
            setVision={setStrategyVision}
            kpis={state.strategy.kpis}
            setKpis={setStrategyKpis}
            mainTasks={state.strategy.mainTasks}
            setMainTasks={setStrategyMainTasks}
            strategicLinks={state.strategy.strategicLinks}
            setStrategicLinks={setStrategyStrategicLinks}
            pageIntro="تُستخدم هذه الصفحة لتوثيق عناصر الاستراتيجية الخاصة بالمنظمة (رؤية، مؤشرات حسب المحاور، ومهام)، بنفس هيكل صفحة الرؤية والمؤشرات وبشكل مستقل عنها تماماً."
          />
        )}

        {activeTab === 'swot' && (
          <SwotTab swot={state.swot} setSwot={setSwot} />
        )}

        {activeTab === 'objectives' && (
          <ObjectivesTab
            objectives={state.objectives}
            setObjectives={setObjectives}
          />
        )}

        {activeTab === 'policies' && (
          <PoliciesTab
            policies={state.policies}
            setPolicies={setPolicies}
          />
        )}
      </main>
    </>
  )
}
