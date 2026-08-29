import { firebaseConfig, COLLECTION, isConfigured } from "./firebase-config.js";

/* ------------------------------- UI helpers ------------------------------ */
const $ = (id) => document.getElementById(id);
const form = $("name-form");
const input = $("name-input");
const submitBtn = $("submit-btn");
const formMsg = $("form-msg");
const listEl = $("names");
const emptyEl = $("empty");
const countEl = $("count");
const statusEl = $("status");
const refreshBtn = $("refresh-btn");

document.querySelectorAll(".tabbar .tab").forEach((btn) => {
  btn.addEventListener("click", () => showTab(btn.dataset.tab));
});

function showTab(id) {
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === id));
  document.querySelectorAll(".tabbar .tab").forEach((b) => {
    const on = b.dataset.tab === id;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", String(on));
  });
  location.hash = id === "tab-list" ? "#names" : "#enter";
}
if (location.hash === "#names") showTab("tab-list");

function setStatus(text, cls) {
  statusEl.textContent = text;
  statusEl.className = "status" + (cls ? " " + cls : "");
}

function say(text, cls) {
  formMsg.textContent = text;
  formMsg.className = "form-msg" + (cls ? " " + cls : "");
}

function timeAgo(ms) {
  if (!ms) return "just now";
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return s + "s ago";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return new Date(ms).toLocaleDateString();
}

function render(items) {
  countEl.textContent = items.length;
  emptyEl.style.display = items.length ? "none" : "block";
  listEl.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (const it of items) {
    const li = document.createElement("li");

    const av = document.createElement("div");
    av.className = "avatar";
    av.textContent = (it.name.trim()[0] || "?").toUpperCase();

    const who = document.createElement("div");
    who.className = "who";
    const strong = document.createElement("strong");
    strong.textContent = it.name;
    const small = document.createElement("small");
    small.textContent = timeAgo(it.createdAt);
    who.append(strong, small);

    li.append(av, who);
    frag.append(li);
  }
  listEl.append(frag);
}

/* ------------------------------ Data layer ------------------------------- */
// Two interchangeable backends: Firebase Firestore (shared with the world)
// or localStorage (offline demo, this device only).

const LOCAL_KEY = "namewall.local";
let store;

const localStore = {
  mode: "local",
  subscribe(cb) {
    const read = () => JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    cb(read());
    window.addEventListener("storage", () => cb(read()));
    this._read = read;
  },
  async add(name) {
    const items = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    items.unshift({ name, createdAt: Date.now() });
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("storage"));
  }
};

async function makeFirebaseStore() {
  const [{ initializeApp }, fs] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
  ]);
  const app = initializeApp(firebaseConfig);
  const db = fs.initializeFirestore(app, { ignoreUndefinedProperties: true });
  const col = fs.collection(db, COLLECTION);

  return {
    mode: "cloud",
    subscribe(cb) {
      const q = fs.query(col, fs.orderBy("createdAt", "desc"), fs.limit(500));
      fs.onSnapshot(
        q,
        (snap) => {
          const items = snap.docs.map((d) => {
            const v = d.data();
            return { name: v.name, createdAt: v.createdAt?.toMillis?.() ?? Date.now() };
          });
          setStatus(snap.metadata.fromCache ? "offline" : "live", snap.metadata.fromCache ? "offline" : "online");
          cb(items);
        },
        (err) => {
          console.error(err);
          setStatus("error", "offline");
          say("Could not load names: " + err.message, "err");
        }
      );
    },
    async add(name) {
      await fs.addDoc(col, { name, createdAt: fs.serverTimestamp() });
    }
  };
}

/* --------------------------------- Boot ---------------------------------- */
(async function boot() {
  if (isConfigured) {
    setStatus("connecting…");
    try {
      store = await makeFirebaseStore();
    } catch (e) {
      console.error(e);
      store = localStore;
      setStatus("local only", "offline");
    }
  } else {
    store = localStore;
    setStatus("demo (local)", "offline");
    say("Demo mode: names are saved only on this device. Add your Firebase keys in firebase-config.js to share them with everyone.");
  }
  store.subscribe(render);
})();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = input.value.trim().replace(/\s+/g, " ");
  if (name.length < 2) return say("Please enter at least 2 characters.", "err");
  if (name.length > 40) return say("Name is too long (max 40).", "err");

  submitBtn.disabled = true;
  say("Saving…");
  try {
    await store.add(name);
    input.value = "";
    say(`Added "${name}" 🎉 Check the Names tab.`, "ok");
  } catch (err) {
    console.error(err);
    say("Failed to save: " + err.message, "err");
  } finally {
    submitBtn.disabled = false;
  }
});

refreshBtn.addEventListener("click", () => location.reload());

window.addEventListener("online", () => setStatus("live", "online"));
window.addEventListener("offline", () => setStatus("offline", "offline"));

/* ------------------------------ PWA install ------------------------------ */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(console.error);
  });
}

