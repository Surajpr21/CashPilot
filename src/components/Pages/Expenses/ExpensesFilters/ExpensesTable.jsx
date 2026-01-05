export default function ExpensesTable({ expenses }) {
  return (
    <div className="expenses-page-table-wrapper">
      <table className="expenses-page-table">
        <thead className="expenses-page-thead">
          <tr className="expenses-page-tr">
            <th className="expenses-page-th">DATE</th>
            <th className="expenses-page-th">TITLE / NOTE</th>
            <th className="expenses-page-th">CATEGORY</th>
            <th className="expenses-page-th">SUB-CATEGORY</th>
            <th className="expenses-page-th">AMOUNT</th>
            <th className="expenses-page-th">MODE</th>
            <th className="expenses-page-th"></th>
          </tr>
        </thead>
        <tbody className="expenses-page-tbody">
          {expenses.map((e, i) => (
            <tr key={i} className="expenses-page-tr">
              <td className="expenses-page-td">{e.date}</td>
              <td className="expenses-page-td">{e.title}</td>
              <td className="expenses-page-td">{e.category}</td>
              <td className="expenses-page-td">{e.sub}</td>
              <td className="expenses-page-td expenses-page-amount">{e.amount}</td>
              <td className="expenses-page-td">{e.mode}</td>
              <td className="expenses-page-td expenses-page-actions">•••</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
