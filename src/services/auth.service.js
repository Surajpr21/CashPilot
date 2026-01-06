import { supabase } from "../lib/supabaseClient";

export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  return { data, error };
}

// Sign in using email + password. Returns { data, error } where data includes session on success.
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

// Returns the active session if present, otherwise null.
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data?.session || null;
}

// Sign out the current user and clear the session.
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
} 
