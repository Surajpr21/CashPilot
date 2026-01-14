import React, { useState } from "react";
import AddMoneyModal from "./AddMoneyModal";
import EditGoalModal from "./EditGoalModal";
import { deleteGoal } from "../../../../services/goals.service";

export default function GoalsSection({ goals, loading, setGoals }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const openAddMoney = (goal) => {
    setSelectedGoal(goal);
    setIsAddMoneyOpen(true);
  };

  const openEdit = (goal) => {
    setEditingGoal(goal);
    setIsEditOpen(true);
  };

  const handleAddMoneySuccess = (updatedGoals) => {
    setGoals(updatedGoals);
    setSelectedGoal(null);
  };

  const handleEditSuccess = async () => {
    // Refresh all goals after edit
    const { fetchGoals } = await import("../../../../services/goals.service");
    const updated = await fetchGoals();
    setGoals(updated);
    setEditingGoal(null);
  };

  const handleDeleteGoal = async (goal) => {
    if (window.confirm(`Are you sure you want to delete "${goal.name}"? This action cannot be undone.`)) {
      try {
        await deleteGoal(goal.id);
        const { fetchGoals } = await import("../../../../services/goals.service");
        const updated = await fetchGoals();
        setGoals(updated);
      } catch (err) {
        console.error("Error deleting goal:", err);
        alert("Failed to delete goal. Please try again.");
      }
    }
  };

  /**
   * STEP 12️⃣ Progress bar value
   * Frontend-only math (safe): Math.min(saved/target*100, 100)
   */
  const getProgressPercent = (goal) => {
    if (!goal.target_amount) return 0;
    return Math.min((goal.saved_amount / goal.target_amount) * 100, 100);
  };

  /**
   * STEP 13️⃣ Smart insights (Frontend only)
   * Calculate monthly required (no DB storage)
   */
  function getMonthlyRequired(goal) {
    if (!goal.target_date) return null;

    const today = new Date();
    const target = new Date(goal.target_date);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return null;

    const monthsLeft = Math.max(Math.ceil(diffDays / 30), 1);

    const remaining = goal.target_amount - goal.saved_amount;
    if (remaining <= 0) return null;

    return Math.ceil(remaining / monthsLeft);
  }



  const getStatusDisplay = (status) => {
    if (status === 'completed') return 'Completed';
    if (status === 'on_track') return 'On Track';
    if (status === 'behind') return 'Behind';
    return status;
  };

  if (loading) {
    return (
      <div className="goals-page-section">
        <p>Loading goals...</p>
      </div>
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <div className="goals-page-section">
        <p>No goals yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="goals-page-section">
        {goals.map((goal) => {
          const progressPercent = getProgressPercent(goal);
          const remaining = Math.max(0, goal.target_amount - (goal.saved_amount || 0));
          const monthlyReq = getMonthlyRequired(goal);

          return (
            <div key={goal.id} className="goals-page-goal-card">
              {/* TOP */}
              <div className="goals-page-goal-top">
                <div>
                  <h3 className="goals-page-goal-title">{goal.name}</h3>
                  <p className="goals-page-goal-sub">
                    ₹{goal.target_amount.toLocaleString()} target • ₹{(goal.saved_amount || 0).toLocaleString()} saved
                  </p>
                </div>

                <span className={`goals-page-status goals-${goal.status}`}>
                  {getStatusDisplay(goal.status)}
                </span>
              </div>

              {/* PROGRESS */}
              <div className="goals-page-progress-block">
                <div className="goals-page-progress-track">
                  <div
                    className={`goals-page-progress-fill goals-${goal.status}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="goals-page-progress-meta">
                  {remaining > 0 ? (
                    <>
                      ₹{remaining.toLocaleString()} left • Target: {new Date(goal.target_date).toLocaleDateString()}
                    </>
                  ) : (
                    <>Target: {new Date(goal.target_date).toLocaleDateString()} • Completed</>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="goals-page-actions">
                <button onClick={() => openAddMoney(goal)}>Add Money</button>
                <button onClick={() => openEdit(goal)}>Edit</button>
                <button className="danger" onClick={() => handleDeleteGoal(goal)}>Delete</button>
              </div>
            </div>
          );
        })}

        {/* SMART INSIGHTS */}
        {goals.length > 0 && (
          <div className="goals-page-insights">
            <strong>Smart Insights</strong>
            {goals
              .filter((g) => g.status !== 'completed' && getMonthlyRequired(g))
              .map((goal) => (
                <p key={goal.id}>
                  ⚠️ You need to save <b>₹{getMonthlyRequired(goal)}/month</b> to reach your {goal.name} goal
                </p>
              ))}
            {goals.every((g) => g.status === 'completed') && <p>🎉 All goals completed!</p>}
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        goal={selectedGoal}
        onSuccess={handleAddMoneySuccess}
      />

      {/* Edit Goal Modal */}
      <EditGoalModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        goal={editingGoal}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
