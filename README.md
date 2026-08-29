# NameWall — a free PWA name board

Two tabs:
1. **Enter** — type your name and submit.
2. **Names** — live list of every name entered by anyone, anywhere.

Installable on Android/iPhone (Add to Home Screen), works offline for the shell,
and updates in real time.

## Files
| File | Purpose |
|---|---|
| `index.html` | UI + tab bar |
| `styles.css` | Mobile-first dark theme |
| `app.js` | Tabs, form, live list, backend switch |
| `firebase-config.js` | **Put your Firebase keys here** |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA bits |
| `firestore.rules` | Security rules (paste in Firebase console) |

## 1. Try it locally (demo mode)
```powershell
cd C:\Users\ayushp\FakeDDrive\AYUSHCODETEST
python -m http.server 5173
```
Open http://localhost:5173 . Without Firebase keys it runs in **demo mode**
(names stay on your device only).

## 2. Make it shared for everyone (free)
1. Go to https://console.firebase.google.com → **Add project** (free Spark plan).
2. Build → **Firestore Database** → Create database → *Production mode* → pick a region.
3. Rules tab → paste the contents of `firestore.rules` → **Publish**.
4. Project settings ⚙ → *Your apps* → **Web (`</>`)** → register app → copy the
   `firebaseConfig` values into `firebase-config.js`.
5. Reload the app — the badge in the header turns **live** and names sync worldwide.

> The web API key is meant to be public; the security rules above are what protect the data
> (read-only for all, create-only with validation, no edits/deletes).

## 3. Publish it for free
Pick any one — all give free HTTPS (required for PWAs):

**Firebase Hosting**
```powershell
npm install -g firebase-tools
firebase login
firebase init hosting   # public dir: . (current folder), single-page app: No
firebase deploy
```

**GitHub Pages**
```powershell
git init; git add .; git commit -m "NameWall PWA"
git branch -M main
git remote add origin https://github.com/<you>/namewall.git
git push -u origin main
```
Then repo → Settings → Pages → Branch `main` / root → Save.

**Netlify / Vercel** — drag the folder onto https://app.netlify.com/drop, done.

## 4. Install on your phone
Open the HTTPS link → Chrome menu → *Install app* / *Add to Home screen*
(iPhone: Safari → Share → *Add to Home Screen*).

## Ideas to extend
- Delete/report abuse via a Cloud Function.
- Rate-limit with Firebase Anonymous Auth + a per-user doc.
- Search box and pagination beyond 500 names.

