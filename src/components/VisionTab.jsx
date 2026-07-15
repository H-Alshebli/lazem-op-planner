import EditableList from './EditableList'

export default function VisionTab({ vision, setVision, kpis, setKpis, mainTasks, setMainTasks }) {
  return (
    <>
      <div className="card">
        <h2><span className="n">2</span> رؤية المنظمة</h2>
        <textarea
          placeholder="اكتب رؤية المنظمة هنا..."
          value={vision}
          onChange={(e) => setVision(e.target.value)}
        />
      </div>
      <div className="card">
        <h2>مؤشرات الأداء الرئيسية المكلّف بها من الإدارة العليا</h2>
        <EditableList items={kpis} placeholder="مؤشر" onChange={setKpis} addLabel="إضافة مؤشر" />
      </div>
      <div className="card">
        <h2><span className="n">3</span> المهام الرئيسية / الروتينية</h2>
        <EditableList items={mainTasks} placeholder="مهمة" onChange={setMainTasks} addLabel="إضافة مهمة" />
      </div>
    </>
  )
}
