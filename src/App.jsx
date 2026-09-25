import { useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, PLAN_DOC_PATH } from './firebase'
import { defaultState, normalizeOperationalPlanState } from './utils/calc'
import lazemLogo from './assets/lazem-logo-white.svg'
import Dashboard from './components/Dashboard'
import PlanTab from './components/PlanTab'
import VisionTab from './components/VisionTab'
import SwotTab from './components/SwotTab'
import ObjectivesTab from './components/ObjectivesTab'
import PoliciesTab from './components/PoliciesTab'
import PlanningSummary from './components/PlanningSummary'
import PrintableReport from './components/PrintableReport'
import './App.css'

const TABS = [
  { id: 'plan', label: 'بيانات الخطة' },
  { id: 'vision', label: 'الرؤية والمؤشرات' },
  { id: 'swot', label: 'SWOT' },
  { id: 'objectives', label: 'الأهداف وخطط العمل' },
  { id: 'schedule', label: 'البرنامج الزمني والموازنة' },
  { id: 'policies', label: 'السياسات' },
  { id: 'dashboard', label: 'لوحة المتابعة' },
]

const docRef = doc(db, PLAN_DOC_PATH.collection, PLAN_DOC_PATH.doc)

export default function App() {
  const [state, setState] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [saving, setSaving] = useState(false)
  const [ready, setReady] = useState(false)
  const saveTimer = useRef(null)
  const skipNextSnapshot = useRef(false)
  const isRemoteUpdate = useRef(false)

  // الاشتراك اللحظي في وثيقة الخطة على Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (skipNextSnapshot.current) {
          skipNextSnapshot.current = false
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
          setDoc(docRef, { data: seed, updatedAt: serverTimestamp() })
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
      try {
        skipNextSnapshot.current = true
        await setDoc(docRef, { data: state, updatedAt: serverTimestamp() })
      } catch (e) {
        console.error('Save failed:', e)
      } finally {
        setSaving(false)
      }
    }, 400)
    return () => clearTimeout(saveTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

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
        <div className="header-actions">
          <div className="sync-status">
            <span className={`sync-dot ${saving ? 'saving' : ''}`} />
            {saving ? 'جارِ الحفظ...' : 'محفوظ في السحابة'}
          </div>
          <button className="export-button" type="button" onClick={() => window.print()} aria-label="حفظ الخطة بصيغة PDF">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 16v4h16v-4" /></svg>
            <span>تحميل الخطة PDF</span>
          </button>
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
          <PlanTab plan={state.plan} setPlan={(plan) => setState({ ...state, plan })} />
        )}

        {activeTab === 'vision' && (
          <VisionTab
            vision={state.vision}
            setVision={(vision) => setState({ ...state, vision })}
            kpis={state.kpis}
            setKpis={(kpis) => setState({ ...state, kpis })}
            mainTasks={state.mainTasks}
            setMainTasks={(mainTasks) => setState({ ...state, mainTasks })}
          />
        )}

        {activeTab === 'swot' && (
          <SwotTab swot={state.swot} setSwot={(swot) => setState({ ...state, swot })} />
        )}

        {activeTab === 'objectives' && (
          <ObjectivesTab
            objectives={state.objectives}
            setObjectives={(objectives) => setState({ ...state, objectives })}
          />
        )}

        {activeTab === 'schedule' && <PlanningSummary plan={state.plan} objectives={state.objectives} />}

        {activeTab === 'policies' && (
          <PoliciesTab
            policies={state.policies}
            setPolicies={(policies) => setState({ ...state, policies })}
          />
        )}
      </main>
      <PrintableReport state={state} />
    </>
  )
}
