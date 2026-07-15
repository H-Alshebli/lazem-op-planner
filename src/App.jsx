import { useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, PLAN_DOC_PATH } from './firebase'
import { defaultState } from './utils/calc'
import lazemLogo from './assets/lazem-logo-white.svg'
import Dashboard from './components/Dashboard'
import PlanTab from './components/PlanTab'
import VisionTab from './components/VisionTab'
import SwotTab from './components/SwotTab'
import ObjectivesTab from './components/ObjectivesTab'
import PoliciesTab from './components/PoliciesTab'
import './App.css'

const TABS = [
  { id: 'plan', label: 'بيانات الخطة' },
  { id: 'vision', label: 'الرؤية والمؤشرات' },
  { id: 'swot', label: 'SWOT' },
  { id: 'objectives', label: 'الأهداف وخطط العمل' },
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
          setState(snap.data().data)
        } else {
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
  useEffect(() => {
    if (!ready || state === null) return
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

        {activeTab === 'policies' && (
          <PoliciesTab
            policies={state.policies}
            setPolicies={(policies) => setState({ ...state, policies })}
          />
        )}
      </main>
    </>
  )
}
