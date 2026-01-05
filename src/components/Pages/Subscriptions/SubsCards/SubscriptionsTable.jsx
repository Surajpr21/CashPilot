const subscriptions = [
  {
    name: "Netflix",
    amount: "₹499",
    meta: "Monthly in 3 days",
    category: "Entertainment",
    status: "active",
  },
  {
    name: "Spotify",
    amount: "₹119",
    meta: "Monthly in 9 days",
    category: "Music",
    status: "active",
  },
  {
    name: "iCloud",
    amount: "₹75",
    meta: "Monthly in 14 days",
    category: "Cloud",
    status: "paused",
  },
];

export default function SubscriptionsTable() {
  return (
    <div className="subscriptions-page-table">
      {subscriptions.map((sub, i) => (
        <div key={i} className="subscriptions-page-card">
          <div className="subscriptions-page-card-left">
            <div className="subscriptions-page-card-title">
              {sub.name}
            </div>

            <div className="subscriptions-page-card-meta">
              {sub.amount} · {sub.meta}
            </div>

            <div className="subscriptions-page-card-category">
              {sub.category}
            </div>
          </div>

          <div className="subscriptions-page-card-right">
            <span
              className={`subscriptions-page-status subscriptions-page-status-${sub.status}`}
            >
              {sub.status}
            </span>

            <div className="subscriptions-page-actions">
              <button>Edit</button>
              <button className="danger">Cancel</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
