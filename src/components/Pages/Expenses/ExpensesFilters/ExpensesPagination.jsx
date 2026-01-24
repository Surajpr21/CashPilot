export default function ExpensesPagination() {
  return (
    <div className="expenses-page-footer">
      <div className="expenses-page-rows-per-page">Rows per page: 10</div>
      <div className="expenses-page-pagination">
        <button className="expenses-page-page-btn">ΓÇ╣</button>
        <button className="expenses-page-page-btn expenses-page-page-active">1</button>
        <button className="expenses-page-page-btn">2</button>
        <button className="expenses-page-page-btn">ΓÇ║</button>
      </div>
      <div className="expenses-page-count">1ΓÇô10 of 32</div>
    </div>
  );
}
