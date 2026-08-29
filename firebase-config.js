// ---------------------------------------------------------------------------
// STEP 1: Create a free Firebase project -> https://console.firebase.google.com
// STEP 2: Add a Web App, copy the firebaseConfig object it gives you
// STEP 3: Paste the values below and save this file.
// Until you do that, the app runs in "local demo mode" (names saved only on
// this device) so you can still try it out.
// ---------------------------------------------------------------------------

export const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

// Name of the Firestore collection that stores the names.
export const COLLECTION = "names";

export const isConfigured = !String(firebaseConfig.apiKey).startsWith("PASTE_");

