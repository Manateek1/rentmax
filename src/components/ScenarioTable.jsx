export default function ScenarioTable({ scenarios, onLoad, onDelete }) {
  if (!scenarios?.length) return null;
  return (
    <div className="card">
      <h3 className="title">Saved Scenarios</h3>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Mid Rent</th>
              <th>Vacancy %</th>
              <th>Mgmt %</th>
              <th>Monthly Cash Flow</th>
              <th>Annual Profit</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s, idx) => (
              <tr key={idx}>
                <td>{s.name || `Scenario ${idx + 1}`}</td>
                <td>${s.suggestedRentMid.toLocaleString()}</td>
                <td>{s.vacancyPct}%</td>
                <td>{s.mgmtPct}%</td>
                <td>${s.monthlyCashFlow.toLocaleString()}</td>
                <td>${s.annualProfit.toLocaleString()}</td>
                <td className="row">
                  <button className="btn ghost" onClick={() => onLoad(s)}>Load</button>
                  <button className="btn danger" onClick={() => onDelete(idx)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
