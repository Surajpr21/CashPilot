export default function ExpensesSummary() {
  return (
    <div className="expenses-page-summary">
      <div className="expenses-page-summary-item">
        <span className="expenses-page-summary-label">Total spent:</span>
        <span className="expenses-page-summary-value">24,093</span>
      </div>
      <div className="expenses-page-summary-item">
        <span className="expenses-page-summary-label">Average per day:</span>
        <span className="expenses-page-summary-value">803</span>
      </div>
      <div className="expenses-page-summary-item">
        <span className="expenses-page-summary-label">Transactions:</span>
        <span className="expenses-page-summary-value">32</span>
      </div>
      <div className="expenses-page-import">Import CSV</div>
    </div>
  );
}
