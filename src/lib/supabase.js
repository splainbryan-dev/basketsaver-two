// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Get or create a local user ID (anonymous until auth is added)
export function getUserId() {
  let uid = localStorage.getItem("bs_user_id");
  if (!uid) {
    uid = "user_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("bs_user_id", uid);
  }
  return uid;
}
