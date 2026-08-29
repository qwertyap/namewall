// ---------------------------------------------------------------------------
// NameWall backend configuration
//
// Pick ONE backend. Whichever is filled in wins (Supabase is checked first).
//   - Supabase  : sign up with your GitHub account, no Google org needed  <-- easiest
//   - Firebase  : needs a Google project
//   - Neither   : app runs in local demo mode (names stay on your device)
//
// Helper scripts write this file for you:
//   .\set-supabase.ps1     or     .\set-firebase.ps1
// ---------------------------------------------------------------------------

/* ------------------------------- Supabase -------------------------------- */
export const supabaseConfig = {
  url: "https://tbxleshvcanvrsnpyrum.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRieGxlc2h2Y2FudnJzbnB5cnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjA5NDUsImV4cCI6MjEwMzU5Njk0NX0.1YdsgDp4vLc4UxWhiNULlexsJlTvUBp49wDb7eGPnZI"
};
export const TABLE = "names";

/* ------------------------------- Firebase -------------------------------- */
export const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};
export const COLLECTION = "names";

/* ------------------------------- Detection ------------------------------- */
const unset = (v) => !v || String(v).startsWith("PASTE_");

export const supabaseReady = !unset(supabaseConfig.url) && !unset(supabaseConfig.anonKey);
export const firebaseReady = !unset(firebaseConfig.apiKey) && !unset(firebaseConfig.projectId);

export const BACKEND = supabaseReady ? "supabase" : firebaseReady ? "firebase" : "local";



