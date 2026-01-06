const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function ExpensesTable({ expenses = [] }) {
  console.log("RECEIVED EXPENSES IN TABLE =>", expenses);
  return (
    <div className="expenses-page-table-wrapper">
      <table className="expenses-page-table">
        <thead className="expenses-page-thead">
          <tr className="expenses-page-tr">
            <th className="expenses-page-th">DATE</th>
            <th className="expenses-page-th">TITLE / NOTE</th>
            <th className="expenses-page-th">CATEGORY</th>
            {/* <th className="expenses-page-th">SUB-CATEGORY</th> */}
            <th className="expenses-page-th">AMOUNT</th>
            <th className="expenses-page-th">MODE</th>
            <th className="expenses-page-th"></th>
          </tr>
        </thead>
        <tbody className="expenses-page-tbody">
          {expenses.length === 0 && (
            <tr className="expenses-page-tr">
              <td className="expenses-page-td" colSpan={7}>
                No expenses found.
              </td>
            </tr>
          )}

          {expenses.map((e, i) => (
            <tr key={e.id || i} className="expenses-page-tr">
              <td className="expenses-page-td">{formatDate(e.spent_at)}</td>
              <td className="expenses-page-td">{e.title || "-"}</td>
              <td className="expenses-page-td">{e.category || "-"}</td>
              {/* <td className="expenses-page-td">{e.sub_category || "-"}</td> */}
              <td className="expenses-page-td expenses-page-amount">{formatAmount(e.amount)}</td>
              <td className="expenses-page-td">{e.payment_mode || "-"}</td>
              <td className="expenses-page-td expenses-page-actions">•••</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
