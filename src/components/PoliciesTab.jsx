export default function PoliciesTab({ policies, setPolicies }) {
  return (
    <div className="card">
      <h2>السياسات المتفق عليها حتى انتهاء تاريخ هذه الخطة</h2>
      <textarea
        style={{ minHeight: 140 }}
        value={policies}
        onChange={(e) => setPolicies(e.target.value)}
      />
    </div>
  )
}
