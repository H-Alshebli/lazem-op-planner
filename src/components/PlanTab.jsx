export default function PlanTab({ plan, setPlan }) {
  const setField = (field, value) => setPlan({ ...plan, [field]: value })

  const setTeam = (team) => setPlan({ ...plan, team })
  const setApprovals = (approvals) => setPlan({ ...plan, approvals })

  const updateTeamRow = (i, field, value) => {
    const next = plan.team.map((m, idx) => (idx === i ? { ...m, [field]: value } : m))
    setTeam(next)
  }
  const updateApprovalRow = (i, field, value) => {
    const next = plan.approvals.map((a, idx) => (idx === i ? { ...a, [field]: value } : a))
    setApprovals(next)
  }

  return (
    <>
      <div className="card">
        <h2><span className="n">1</span> بيانات الخطة</h2>
        <div className="grid3">
          <div className="field">
            <label>القسم / الإدارة</label>
            <input type="text" value={plan.dept} onChange={(e) => setField('dept', e.target.value)} />
          </div>
          <div className="field">
            <label>تاريخ بدء الخطة</label>
            <input type="date" value={plan.start} onChange={(e) => setField('start', e.target.value)} />
          </div>
          <div className="field">
            <label>تاريخ انتهاء الخطة</label>
            <input type="date" value={plan.end} onChange={(e) => setField('end', e.target.value)} />
          </div>
        </div>
        <div className="field" style={{ maxWidth: 200 }}>
          <label>مدة الخطة (أشهر)</label>
          <input
            type="number"
            value={plan.duration}
            onChange={(e) => setField('duration', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="card">
        <h2>فريق التخطيط</h2>
        <div className="row-list">
          {plan.team.map((m, i) => (
            <div className="row-item" key={i}>
              <input
                type="text"
                placeholder="الدور"
                style={{ maxWidth: 220 }}
                value={m.role}
                onChange={(e) => updateTeamRow(i, 'role', e.target.value)}
              />
              <input
                type="text"
                placeholder="الاسم"
                value={m.name}
                onChange={(e) => updateTeamRow(i, 'name', e.target.value)}
              />
              <button className="icon-btn" onClick={() => setTeam(plan.team.filter((_, idx) => idx !== i))}>✕</button>
            </div>
          ))}
        </div>
        <button
          className="add-btn"
          style={{ marginTop: 10 }}
          onClick={() => setTeam([...plan.team, { role: 'عضو فريق التخطيط', name: '' }])}
        >
          + إضافة عضو
        </button>
      </div>

      <div className="card">
        <h2>الموافقة على الخطة من قبل الإدارة العليا</h2>
        <div className="row-list">
          {plan.approvals.map((a, i) => (
            <div className="row-item" key={i}>
              <input
                type="text"
                placeholder="الاسم"
                value={a.name}
                onChange={(e) => updateApprovalRow(i, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="التوقيع / ملاحظة"
                value={a.signature}
                onChange={(e) => updateApprovalRow(i, 'signature', e.target.value)}
              />
              <button className="icon-btn" onClick={() => setApprovals(plan.approvals.filter((_, idx) => idx !== i))}>✕</button>
            </div>
          ))}
        </div>
        <button
          className="add-btn"
          style={{ marginTop: 10 }}
          onClick={() => setApprovals([...plan.approvals, { name: '', signature: '' }])}
        >
          + إضافة موافقة
        </button>
      </div>
    </>
  )
}
