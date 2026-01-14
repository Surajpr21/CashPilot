import { supabase } from '../lib/supabaseClient';

/**
 * STEP 5️⃣ Fetch goals (READ)
 * Returns goals owned by current user, with status calculated by DB
 */
export async function fetchGoals() {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;

  const { data, error } = await supabase
    .from('goals')
    .select(`
      id,
      name,
      target_amount,
      saved_amount,
      target_date,
      status,
      created_at,
      updated_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * STEP 6️⃣ Create goal (WRITE)
 * RLS requires user_id to match auth.uid()
 */
export async function createGoal({ name, targetAmount, targetDate }) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      name,
      target_amount: targetAmount,
      target_date: targetDate
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * STEP 7️⃣ Add Money (MOST IMPORTANT)
 * This is the ONLY way to add money to goals.
 * Triggers will update saved_amount, status, updated_at
 * NEVER update goals.saved_amount directly
 */
export async function addMoneyToGoal({ goalId, amount, note = '' }) {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('goal_transactions')
    .insert({
      goal_id: goalId,
      user_id: user.id,
      amount,
      note
    });

  if (error) throw error;
}

/**
 * STEP 9️⃣ Edit goal (Allowed fields ONLY)
 * You can edit: name, target_amount, target_date
 * Do NOT edit: saved_amount, status
 */
export async function updateGoal(goalId, updates) {
  const { error } = await supabase
    .from('goals')
    .update({
      name: updates.name,
      target_amount: updates.targetAmount,
      target_date: updates.targetDate
    })
    .eq('id', goalId);

  if (error) throw error;
}

/**
 * STEP 🔟 Delete goal
 * Auto-deletes related transactions via DB cascade
 */
export async function deleteGoal(goalId) {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId);

  if (error) throw error;
}
