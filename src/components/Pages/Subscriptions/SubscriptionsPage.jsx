import "./SubscriptionsPage.css";
import SubscriptionsFilters from "./SubsCards/SubscriptionsFilters";
import SubscriptionsTable from "./SubsCards/SubscriptionsTable";
import UpcomingSubscriptions from "./SubsCards/UpcomingSubscriptions";

export default function SubscriptionsPage() {
  return (
    <div className="subscriptions-page-container">
      {/* Header */}
      <div className="subscriptions-page-header">
        <div>
          <h1 className="subscriptions-page-title">Subscriptions</h1>
          <p className="subscriptions-page-subtitle">
            Manage your recurring payments and renewals
          </p>
        </div>

      
      </div>

      {/* Filters */}
      <SubscriptionsFilters />

      {/* Content */}
      <div className="subscriptions-page-content">
        <SubscriptionsTable />
        <UpcomingSubscriptions />
      </div>
    </div>
  );
}
