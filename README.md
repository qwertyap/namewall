# NameWall — a free, permanently hosted PWA name board

Two tabs:
1. **Enter** — type your name and submit.
2. **Names** — live list of every name entered by anyone, anywhere in the world.

Installable on Android/iPhone, works offline, updates in real time.
**100% free forever, no credit card**: GitHub Pages (hosting) + Firebase Firestore (data).

---

## Deploy permanently — 1 command

```powershell
cd C:\Users\ayushp\FakeDDrive\AYUSHCODETEST
.\deploy.ps1
```

It logs you in to GitHub (browser opens once), creates a **public** repo `namewall`,
pushes the code, switches on **GitHub Pages**, and prints your permanent link:

```
https://<your-github-username>.github.io/namewall/
```

That URL never expires, is HTTPS, works worldwide, and anyone can open or install it.
Publish future changes with `.\deploy.ps1 -Message "what changed"`.

---

## Make the names shared between all users (free, ~3 min, no card)

Without this the app still works but stores names only on each device (demo mode).

1. https://console.firebase.google.com → **Add project** (free Spark plan, no billing).
2. Build → **Firestore Database** → *Create database* → **Production mode** → pick a region.
3. **Rules** tab → paste everything from `firestore.rules` → **Publish**.
4. Project settings ⚙ → *Your apps* → **Web `</>`** → register app → copy the `firebaseConfig` block.
5. Run `.\set-firebase.ps1` and paste that block.
6. Run `.\deploy.ps1` to publish.

The header badge turns **live** and every visitor sees the same list instantly.

> The web API key is public by design — `firestore.rules` is what protects the data:
> everyone can read, everyone can add one validated name, nobody can edit or delete.

**Free-tier limits (Spark):** 50,000 reads + 20,000 writes/day, 1 GiB stored — far beyond a name board's needs.

---

## Install on your phone
Open the HTTPS link → Chrome ⋮ → **Install app**
(iPhone: Safari → Share → **Add to Home Screen**).

## Test locally first
```powershell
python -m http.server 5173
```
→ http://localhost:5173

## Files
| File | Purpose |
|---|---|
| `index.html` / `styles.css` | UI, tab bar, mobile dark theme |
| `app.js` | Tabs, form, live list, backend switch |
| `firebase-config.js` | Your Firebase keys (written by `set-firebase.ps1`) |
| `firestore.rules` | Security rules to paste into Firebase |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA: install + offline |
| `.github/workflows/deploy.yml` | Auto-deploy to Pages on every push |
| `deploy.ps1` / `set-firebase.ps1` | One-command deploy / config helpers |
