import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import AddMoneyModal from "./AddMoneyModal";
import EditGoalModal from "./EditGoalModal";
import { deleteGoal } from "../../../../services/goals.service";
import {
  getGoalStatus,
  getGoalTargetDate,
  getRemainingAmount,
} from "../../../../lib/goalStatus";

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

  const formatTargetDate = (goal) => {
    const targetDate = getGoalTargetDate(goal);
    if (!targetDate) return "No target date";

    return targetDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /**
   * STEP 12️⃣ Progress bar value
   * Frontend-only math (safe): Math.min(saved/target*100, 100)
   */
  const getProgressPercent = (goal) => {
    const targetAmount = Number(goal?.target_amount || 0);
    const savedAmount = Number(goal?.saved_amount || 0);

    if (!targetAmount) return 0;

    return Math.min((savedAmount / targetAmount) * 100, 100);
  };

  /**
   * STEP 13️⃣ Smart insights (Frontend only)
   * Calculate monthly required (no DB storage)
   */
  function getMonthlyRequired(goal) {
    const targetDate = getGoalTargetDate(goal);
    if (!targetDate) return null;

    const targetAmount = Number(goal?.target_amount || 0);
    const savedAmount = Number(goal?.saved_amount || 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return null;

    const monthsLeft = Math.max(Math.ceil(diffDays / 30), 1);

    const remaining = getRemainingAmount({
      target_amount: targetAmount,
      saved_amount: savedAmount,
    });
    if (remaining <= 0) return null;

    return Math.ceil(remaining / monthsLeft);
  }

  const getStatusClass = (status) => {
    if (status === "completed") return "goals-completed";
    if (status === "overdue") return "goals-overdue";
    return "goals-active";
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

  const goalsWithStatus = goals.map((goal) => {
    const targetAmount = Number(goal?.target_amount || 0);
    const savedAmount = Number(goal?.saved_amount || 0);
    return {
      ...goal,
      target_amount: targetAmount,
      saved_amount: savedAmount,
      status: getGoalStatus({ ...goal, target_amount: targetAmount, saved_amount: savedAmount }),
      remaining: getRemainingAmount({ target_amount: targetAmount, saved_amount: savedAmount }),
    };
  });

  const goalsGridClass =
    goalsWithStatus.length === 1
      ? "goals-grid-1"
      : goalsWithStatus.length === 2
        ? "goals-grid-2"
        : "goals-grid-3";

  const renderOverdueIcon = () => (
    <span className="goals-page-overdue-icon" aria-hidden="true">
      <HugeiconsIcon icon={AlertCircleIcon} size={15} strokeWidth={2} color="currentColor" />
    </span>
  );

  return (
    <>
      <div className="goals-page-section">
        <div className={`goals-page-goals-grid ${goalsGridClass}`}>
          {goalsWithStatus.map((goal) => {
            const progressPercent = getProgressPercent(goal);
            const monthlyReq = getMonthlyRequired(goal);
            const statusClass = getStatusClass(goal.status);
            const formattedDate = formatTargetDate(goal);

            return (
              <div key={goal.id} className={`goals-page-goal-card ${statusClass}`}>
                {/* TOP */}
                <div className="goals-page-goal-top">
                  <div>
                    <h3 className="goals-page-goal-title">{goal.name}</h3>
                    <p className="goals-page-goal-sub">
                      <strong>₹{goal.target_amount.toLocaleString()} target • ₹{goal.saved_amount.toLocaleString()} saved</strong>
                    </p>
                  </div>
                </div>

                {/* PROGRESS */}
                <div className="goals-page-progress-block">
                  <div className="goals-page-progress-track">
                    <div
                      className={`goals-page-progress-fill ${statusClass}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="goals-page-progress-meta">
                    {goal.status === "active" ? (
                      <>
                        <strong>₹{goal.remaining.toLocaleString()} left</strong> · Target: {formattedDate}
                      </>
                    ) : goal.status === "overdue" ? (
                      <>
                        <span className="goals-page-overdue-line">
                          {renderOverdueIcon()}
                          Missed target date ({formattedDate})
                        </span>
                        <span className="goals-page-overdue-remaining">
                          <strong>₹{goal.remaining.toLocaleString()} still remaining</strong>
                        </span>
                      </>
                    ) : goal.status === "completed" ? (
                      <>Goal completed 🎉</>
                    ) : (
                      <>
                        <strong>₹{goal.remaining.toLocaleString()} left</strong> · Target: {formattedDate}
                      </>
                    )}
                    {goal.status === "active" && monthlyReq ? (
                      <span className="goals-page-progress-hint">
                        Need ₹{monthlyReq.toLocaleString()}/month to reach this goal
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="goals-page-actions">
                  <button onClick={() => openAddMoney(goal)}>Add Money</button>
                  {goal.status === "overdue" && (
                    <>
                      <button className="goals-action-overdue" onClick={() => openEdit(goal)}>
                        Extend Goal
                      </button>
                      {/* <button className="goals-action-overdue" onClick={() => handleRecalculatePlan(goal)}>
                        Recalculate Plan
                      </button> */}
                    </>
                  )}
                  {goal.status !== "overdue" && <button onClick={() => openEdit(goal)}>Edit</button>}
                  <button className="danger" onClick={() => handleDeleteGoal(goal)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* SMART INSIGHTS */}
        {/* {goalsWithStatus.length > 0 && (
          <div className="goals-page-insights">
            <strong>Smart Insights</strong>
            {insights.length > 0 ? (
              insights.map((insight) => (
                <p key={insight.id} className={getInsightTypeClass(insight.type)}>
                  {insight.type === "overdue" ? renderOverdueIcon() : "• "}
                  {insight.message}
                </p>
              ))
            ) : (
              <p>🎉 All goals completed!</p>
            )}
          </div>
        )} */}
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
