import React, { useState, useEffect } from "react";
import "./GoalsPage.css";
import GoalsSection from "./GoalsPage/GoalsSection";
import CreateGoalModal from "./GoalsPage/CreateGoalModal";
import { fetchGoals } from "../../../services/goals.service";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch goals on mount
  useEffect(() => {
    async function loadGoals() {
      try {
        setLoading(true);
        const data = await fetchGoals();
        setGoals(data || []);
      } catch (error) {
        console.error("Error fetching goals:", error);
      } finally {
        setLoading(false);
      }
    }

    loadGoals();
  }, []);

  const handleGoalAdded = (newGoal) => {
    setGoals((prev) => [newGoal, ...prev]);
  };

  return (
    <div className="goals-page-wrapper">
      <div className="goals-page-header">
        <div>
          <h1 className="goals-page-title">Goals</h1>
          <p className="goals-page-subtitle">
            Track progress toward your financial targets
          </p>
        </div>

        <button 
          className="goals-page-create-btn"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Create Goal
        </button>
      </div>

      <GoalsSection 
        goals={goals} 
        loading={loading} 
        setGoals={setGoals}
      />

      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        goals={goals}
        onSuccess={handleGoalAdded}
      />
    </div>
  );
}
