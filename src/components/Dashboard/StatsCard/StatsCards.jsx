// src/components/StatsCards/StatsCards.jsx
import React from 'react';
import './StatsCards.css';

const statsData = [
  {
    title: 'Total Balance',
    value: '₹8,98,450',
    label: 'Total Balance',
    change: '20.76%',
    positive: true,
    icon: '/icons/in-transit.png',
  },
  {
    title: 'Monthly Expense',
    value: '₹24,093',
    label: 'Total Spent',
    change: '9.23%',
    positive: false,
    icon: '/icons/shipped.png',
  },
  {
    title: 'Monthly Savings',
    value: '₹12,000',
    label: 'Total Saved',
    change: '18.76%',
    positive: true,
    icon: '/icons/pending.png',
  },
  {
    title: 'Subscription Spends',
    value: '₹2,499',
    label: 'Recurring Costs',
    change: '3.52%',
    positive: false,
    icon: '/icons/subscription.png',
  },
  {
    title: 'Goal',
    value: 'iPhone 17 Pro',
    label: '₹75,000 of ₹1,45,000',
    change: '51.70%',
    positive: true,
    icon: '/icons/goal.png',
  },
];

const StatsCards = () => {
  return (
    <div className="stats-card-dashboard-container">
      {statsData.map((item, index) => (
        <div key={index} className="stats-card-dashboard-card">
          <div className="stats-card-dashboard-header">
            <div className="stats-card-dashboard-title">
              <img src={item.icon} alt="icon" className="stats-card-dashboard-icon" />
              <span>{item.title}</span>
            </div>
            <button className="stats-card-dashboard-menu">⋮</button>
          </div>

          <div className="stats-card-dashboard-value">{item.value}</div>
          <div className="stats-card-dashboard-label">{item.label}</div>

          <div className={`stats-card-dashboard-change ${item.positive ? 'positive' : 'negative'}`}>
            <span>{item.change}</span>
            <span>{item.positive ? '▲' : '▼'}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
