// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseUrl, supabaseKey);

// // Creates a new user in Supabase and stores the user's full name in user_metadata.full_name
// // Stored fields after signup:
// // - user.id
// // - user.email
// // - user.user_metadata => { full_name }
// // Note: This aligns with the app's expectation that user-specific records (expenses, budgets)
// // reference auth.users.id — no changes to RLS or DB logic are required.
// export async function signUp(email, password, full_name) {
//   // supabase-js (v2) supports passing user metadata inside the `options.data` object.
//   // If you run a different client version, adjust accordingly.
//   const { data, error } = await supabase.auth.signUp({
//     email,
//     password,
//     options: {
//       data: { full_name },
//     },
//   });

//   return { data, error };
// }

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

