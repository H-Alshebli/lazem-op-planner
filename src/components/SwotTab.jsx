import EditableList from './EditableList'

const QUADRANTS = [
  { key: 'strengths', title: 'نقاط القوة', cls: 'swot-s' },
  { key: 'weaknesses', title: 'نقاط الضعف', cls: 'swot-w' },
  { key: 'opportunities', title: 'الفرص المتاحة', cls: 'swot-o' },
  { key: 'threats', title: 'التهديدات المحتملة', cls: 'swot-t' },
]

export default function SwotTab({ swot, setSwot }) {
  const updateKey = (key, items) => setSwot({ ...swot, [key]: items })

  return (
    <div className="card">
      <h2><span className="n">4</span> التحليل الموقفي SWOT</h2>
      <div className="swot-grid">
        {QUADRANTS.map((q) => (
          <div className={`swot-box ${q.cls}`} key={q.key}>
            <h3>{q.title}</h3>
            <EditableList
              items={swot[q.key]}
              placeholder="بند"
              onChange={(items) => updateKey(q.key, items)}
              addLabel="إضافة"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
