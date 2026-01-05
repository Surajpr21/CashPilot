export default function SubscriptionsFilters() {
  return (
    <div className="subscriptions-page-filters-wrapper">
      <div className="subscriptions-page-filters-row">
        <select className="subscriptions-page-filter">
          <option>All status</option>
        </select>

        <select className="subscriptions-page-filter">
          <option>All cycles</option>
        </select>

        <select className="subscriptions-page-filter">
          <option>All category</option>
        </select>

        <button className="subscriptions-page-clear-btn">
          Clear filters
        </button>

        <div className="subscriptions-page-search">
          <input placeholder="Search" />
        </div>

        <button className="subscriptions-page-import-btn">
          Import
        </button>

          <button className="subscriptions-page-add-btn">
          + Add Subscription
        </button>
      </div>

      {/* Total Spend */}
      <div className="subscriptions-page-total-spend">
        You spend <strong>₹1,450</strong> every month on subscriptions.
      </div>
    </div>
  );
}
