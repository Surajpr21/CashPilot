const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (value, isIncome) => {
  const amount = Number(value || 0);
  const formatted = amount.toLocaleString("en-IN");
  return isIncome ? `+${formatted}` : formatted;
};

const resolveDateValue = (row) => row?.spent_at || row?.occurred_on || row?.date || row?.created_at || null;

const resolveModeValue = (row, isIncome) => {
  if (isIncome) {
    return row?.payment_mode || row?.mode || row?.source || "-";
  }
  return row?.payment_mode || row?.mode || "-";
};

const capitalizeFirst = (value) => {
  if (!value || typeof value !== "string") return value || "-";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function ExpensesTable({ expenses = [], view = "expense", onEdit, onDelete }) {
  const isIncome = view === "income";
  const emptyLabel = isIncome ? "No income found." : "No expenses found.";
  const colSpan = isIncome ? 4 : 6;

  return (
    <div className="expenses-page-table-wrapper">
      <table className="expenses-page-table">
        <thead className="expenses-page-thead">
          <tr className="expenses-page-tr">
            <th className="expenses-page-th">DATE</th>
            {!isIncome && <th className="expenses-page-th">TITLE / NOTE</th>}
            <th className="expenses-page-th">CATEGORY</th>
            {/* <th className="expenses-page-th">SUB-CATEGORY</th> */}
            <th className="expenses-page-th">AMOUNT</th>
            {!isIncome && <th className="expenses-page-th">MODE</th>}
            <th className="expenses-page-th"></th>
          </tr>
        </thead>
        <tbody className="expenses-page-tbody">
          {expenses.length === 0 && (
            <tr className="expenses-page-tr">
              <td className="expenses-page-td" colSpan={colSpan}>
                {emptyLabel}
              </td>
            </tr>
          )}

          {expenses.map((row, index) => {
            const dateValue = resolveDateValue(row);
            const rawTitle = row?.title || row?.note || "-";
            const titleValue = capitalizeFirst(rawTitle);
            const categoryValue = row?.category || "-";
            const modeValue = resolveModeValue(row, isIncome);
            const amountValue = formatAmount(row?.amount, isIncome);

            return (
              <tr key={row?.id || index} className="expenses-page-tr">
                <td className="expenses-page-td">{formatDate(dateValue)}</td>
                {!isIncome && <td className="expenses-page-td expenses-title-cell">{titleValue}</td>}
                <td className="expenses-page-td">{categoryValue}</td>
                {/* <td className="expenses-page-td">{row?.sub_category || "-"}</td> */}
                <td className="expenses-page-td expenses-page-amount">{amountValue}</td>
                {!isIncome && <td className="expenses-page-td">{modeValue}</td>}
                <td className="expenses-page-td expenses-page-actions">
                  {onEdit && (
                    <button type="button" onClick={() => onEdit(row)}>
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button type="button" onClick={() => onDelete(row)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
