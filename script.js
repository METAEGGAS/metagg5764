import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

/* ============================================================
   Firebase init
   ============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyBOUqLixfphg3b8hajc4hkwV-VJmldGBVw",
  authDomain: "randers-c640b.firebaseapp.com",
  projectId: "randers-c640b",
  storageBucket: "randers-c640b.firebasestorage.app",
  messagingSenderId: "391496092929",
  appId: "1:391496092929:web:58208b4eb3e6f9a8571f00",
  measurementId: "G-DBDSVVF7PS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ============================================================
   💉 Styles (Account switch + small helpers)
   ============================================================ */
(function injectAccMenuStyles() {
  if (document.getElementById("qtAccMenuCSS")) return;
  const st = document.createElement("style");
  st.id = "qtAccMenuCSS";
  st.textContent = `
    .qt-bal-wrap{position:relative;display:inline-flex;align-items:center;cursor:pointer;z-index:2601}
    .qt-acc-menu{
      position:absolute;top:calc(100% + 10px);left:0;width:248px;
      background:linear-gradient(145deg,#101a2f 0%,#0d1117 100%);
      border:2px solid rgba(255,255,255,.10);border-radius:16px;
      box-shadow:0 12px 40px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.04) inset;
      padding:10px;z-index:99999;display:none;
      animation:qtMenuIn .18s cubic-bezier(.34,1.3,.64,1) both;
    }
    .qt-acc-menu.show{display:block}
    @keyframes qtMenuIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
    .qt-acc-switch{display:flex;gap:7px;background:#0d1117;border-radius:10px;padding:4px;margin-bottom:11px;}
    .qt-sw-btn{
      flex:1;padding:8px 4px;border-radius:8px;font-size:11px;font-weight:900;letter-spacing:.4px;
      transition:.2s;border:1.5px solid transparent;display:flex;align-items:center;justify-content:center;gap:5px;
      background:transparent;color:#fff;cursor:pointer;
    }
    .qt-sw-btn.qt-live{color:#00ff41}
    .qt-sw-btn.qt-demo{color:#ffd700}
    .qt-sw-btn.active{background:rgba(255,255,255,.10);border-color:currentColor;box-shadow:0 0 8px rgba(255,255,255,.08)}
    .qt-acc-item{
      background:rgba(255,255,255,.03);border:1.3px solid rgba(255,255,255,.10);
      border-radius:12px;padding:10px 12px;margin-bottom:9px;cursor:pointer;transition:.15s;
      display:flex;align-items:center;justify-content:space-between;gap:10px;
    }
    .qt-acc-item:hover{background:rgba(255,255,255,.06);transform:translateY(-1px)}
    .qt-acc-item.active{
      background:linear-gradient(135deg,rgba(66,153,225,.16) 0%,rgba(49,130,206,.10) 100%);
      border-color:#4299e1;box-shadow:0 0 14px rgba(66,153,225,.22);
    }
    .qt-acc-left{display:flex;align-items:center;gap:10px;min-width:0}
    .qt-acc-ico{width:26px;height:26px;object-fit:contain;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.4)}
    .qt-acc-info{display:flex;flex-direction:column;gap:2px}
    .qt-acc-label{font-size:10px;color:rgba(255,255,255,.45);font-weight:700;letter-spacing:.4px;text-transform:uppercase}
    .qt-acc-amt{font-size:16px;font-weight:1000;color:#fff;white-space:nowrap}
    .qt-acc-badge{font-size:9px;font-weight:900;letter-spacing:.6px;padding:3px 7px;border-radius:6px;white-space:nowrap;}
    .qt-acc-badge.live{background:rgba(0,255,65,.12);color:#00ff41;border:1px solid rgba(0,255,65,.3)}
    .qt-acc-badge.demo{background:rgba(255,215,0,.12);color:#ffd700;border:1px solid rgba(255,215,0,.3)}
    .qt-refill-btn{
      width:100%;background:linear-gradient(135deg,#4299e1 0%,#3182ce 100%);
      border-radius:10px;padding:10px;font-size:12px;font-weight:1000;color:#fff;letter-spacing:.5px;
      cursor:pointer;box-shadow:0 4px 14px rgba(66,153,225,.35);transition:.2s;border:none;
    }
    .qt-refill-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(66,153,225,.45)}
    .qt-refill-btn:active{transform:scale(.97)}

    #timeDisplay { caret-color: #fff !important; outline: none !important; }
    #timeDisplay:focus { border-color: rgba(255,255,255,.35) !important; }

    #_qtRoleBadge{display:none !important;opacity:0 !important;visibility:hidden !important;}
  `;
  document.head.appendChild(st);
})();

/* ============================================================
   🔐 AuthManager
   - يدعم IDs: userBalance + balAmount + balLabel + topAccIcon
   ============================================================ */
class AuthManager {
  constructor() {
    this.user = null;
    this.unsubscribeBalance = null;

    this.balanceEl = document.getElementById("userBalance") || document.getElementById("balAmount");

    this.activeAccount = "demo";
    this.realBalance = 0;
    this.demoBalance = 10000;

    this.menuVisible = false;
    this.balancesReady = false;

    try {
      const ls = localStorage.getItem("qt_demo_balance");
      const v = ls !== null ? parseFloat(ls) : NaN;
      if (Number.isFinite(v)) this.demoBalance = Math.max(0, v);
    } catch (e) {}

    this.initMenuUI();
    this.init();
  }

  _fmtMoney(n) {
    try {
      return (
        "$" +
        new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(Number(n) || 0)
      );
    } catch (e) {
      return "$" + (Math.round((Number(n) || 0) * 100) / 100).toFixed(2);
    }
  }

  async setBalance(type, amount, { persist = true } = {}) {
    const safeAmt = Math.max(0, Number(amount) || 0);

    if (type === "real") this.realBalance = safeAmt;
    else this.demoBalance = safeAmt;

    const realEl = document.getElementById("qtRealAmt");
    const demoEl = document.getElementById("qtDemoAmt");
    if (realEl) realEl.textContent = this._fmtMoney(this.realBalance);
    if (demoEl) demoEl.textContent = this._fmtMoney(this.demoBalance);

    const showAmt = this.activeAccount === "real" ? this.realBalance : this.demoBalance;

    const userBalance = document.getElementById("userBalance");
    if (userBalance) userBalance.textContent = this._fmtMoney(showAmt);

    const balAmount = document.getElementById("balAmount");
    if (balAmount) balAmount.textContent = this._fmtMoney(showAmt);

    const balLabel = document.getElementById("balLabel");
    if (balLabel) balLabel.textContent = this.activeAccount === "real" ? "QT Real USD" : "QT Demo USD";

    const topAccIcon = document.getElementById("topAccIcon");
    if (topAccIcon)
      topAccIcon.src =
        this.activeAccount === "real"
          ? "https://flagcdn.com/w40/us.png"
          : "https://cdn-icons-png.flaticon.com/128/1344/1344761.png";

    if (type === "demo" && !this.user) {
      try {
        localStorage.setItem("qt_demo_balance", String(safeAmt));
      } catch (e) {}
    }

    if (persist && this.user) {
      const userRef = doc(db, "users", this.user.email);
      const payload =
        type === "real"
          ? { realBalance: safeAmt, balance: safeAmt }
          : { demoBalance: safeAmt };

      updateDoc(userRef, payload).catch((e) => console.warn("⚠️ Firebase balance sync:", e));
    }
  }

  initMenuUI() {
    if (!this.balanceEl) return;

    const wrap = this.balanceEl.parentElement;
    if (!wrap) return;

    wrap.classList.add("qt-bal-wrap");

    // prevent duplicate
    if (document.getElementById("qtAccMenu")) return;

    const menu = document.createElement("div");
    menu.id = "qtAccMenu";
    menu.className = "qt-acc-menu";
    menu.innerHTML = `
      <div class="qt-acc-switch">
        <button class="qt-sw-btn qt-live"  data-acc="real" type="button">● LIVE</button>
        <button class="qt-sw-btn qt-demo active" data-acc="demo" type="button">◆ Demo</button>
      </div>
      <div class="qt-acc-item" data-type="real">
        <div class="qt-acc-left">
          <img class="qt-acc-ico" src="https://flagcdn.com/w40/us.png" alt="USD">
          <div class="qt-acc-info">
            <div class="qt-acc-label">Real Account</div>
            <div class="qt-acc-amt" id="qtRealAmt">$0.00</div>
          </div>
        </div>
        <div class="qt-acc-badge live">LIVE</div>
      </div>
      <div class="qt-acc-item active" data-type="demo">
        <div class="qt-acc-left">
          <img class="qt-acc-ico" src="https://cdn-icons-png.flaticon.com/128/1344/1344761.png" alt="Demo">
          <div class="qt-acc-info">
            <div class="qt-acc-label">Demo Account</div>
            <div class="qt-acc-amt" id="qtDemoAmt">$10,000.00</div>
          </div>
        </div>
        <div class="qt-acc-badge demo">DEMO</div>
      </div>
      <button class="qt-refill-btn" id="qtRefillBtn" type="button">🔄 Refill Demo Account</button>
    `;

    wrap.appendChild(menu);

    this.setBalance("real", this.realBalance, { persist: false });
    this.setBalance("demo", this.demoBalance, { persist: false });
    this.switchAccount(this.activeAccount);

    // open/close menu
    wrap.addEventListener("click", (e) => {
      e.stopPropagation();
      if (e.target.closest("#qtAccMenu")) return;
      this.toggleMenu();
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".qt-bal-wrap")) this.closeMenu();
    });

    // switch buttons
    menu.querySelectorAll(".qt-sw-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const type = btn.dataset.acc;
        this.switchAccount(type);
        menu.querySelectorAll(".qt-sw-btn").forEach((b) => b.classList.toggle("active", b === btn));
        menu
          .querySelectorAll(".qt-acc-item")
          .forEach((it) => it.classList.toggle("active", it.dataset.type === type));
      });
    });

    // click account item
    menu.querySelectorAll(".qt-acc-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const type = item.dataset.type;
        this.switchAccount(type);
        menu
          .querySelectorAll(".qt-acc-item")
          .forEach((i) => i.classList.toggle("active", i === item));
        menu
          .querySelectorAll(".qt-sw-btn")
          .forEach((b) => b.classList.toggle("active", b.dataset.acc === type));
        this.closeMenu();
      });
    });

    // refill demo
    const refillBtn = document.getElementById("qtRefillBtn");
    if (refillBtn) {
      refillBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.setBalance("demo", 10000, { persist: true });
        refillBtn.textContent = "✅ Refilled!";
        setTimeout(() => (refillBtn.textContent = "🔄 Refill Demo Account"), 1200);
      });
    }
  }

  toggleMenu() {
    const menu = document.getElementById("qtAccMenu");
    if (!menu) return;
    this.menuVisible = !this.menuVisible;
    menu.classList.toggle("show", this.menuVisible);
  }

  closeMenu() {
    const menu = document.getElementById("qtAccMenu");
    if (!menu) return;
    this.menuVisible = false;
    menu.classList.remove("show");
  }

  switchAccount(type) {
    this.activeAccount = type;

    const showAmt = type === "real" ? this.realBalance : this.demoBalance;

    const userBalance = document.getElementById("userBalance");
    if (userBalance) userBalance.textContent = this._fmtMoney(showAmt);

    const balAmount = document.getElementById("balAmount");
    if (balAmount) balAmount.textContent = this._fmtMoney(showAmt);

    const balLabel = document.getElementById("balLabel");
    if (balLabel) balLabel.textContent = type === "real" ? "QT Real USD" : "QT Demo USD";

    const topAccIcon = document.getElementById("topAccIcon");
    if (topAccIcon)
      topAccIcon.src =
        type === "real"
          ? "https://flagcdn.com/w40/us.png"
          : "https://cdn-icons-png.flaticon.com/128/1344/1344761.png";

    try {
      if (window.chart && typeof window.chart._refreshTradeBadge === "function") {
        window.chart._refreshTradeBadge();
      }
    } catch (e) {}
  }

  async init() {
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        this.user = u;
        await this.loadUserBalance();

        if (window.chart) {
          if (window.chart.dataLoaded) {
            window.chart.loadOpenTrades();
            window.chart.loadTradeHistory();
          } else {
            window.chart._pendingTradeLoad = true;
          }
        }
      } else {
        this.user = null;
        this.balancesReady = false;

        const showAmt = this.activeAccount === "real" ? this.realBalance : this.demoBalance;
        const userBalance = document.getElementById("userBalance");
        if (userBalance) userBalance.textContent = this._fmtMoney(showAmt);
        const balAmount = document.getElementById("balAmount");
        if (balAmount) balAmount.textContent = this._fmtMoney(showAmt);

        window.dispatchEvent(new CustomEvent("qt_history_loaded", { detail: [] }));
      }
    });
  }

  async loadUserBalance() {
    const userRef = doc(db, "users", this.user.email);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(
        userRef,
        {
          email: this.user.email,
          realBalance: 0,
          demoBalance: 10000,
          balance: 0,
          createdAt: serverTimestamp()
        },
        { merge: true }
      );
    } else {
      const d = userSnap.data() || {};
      const migrateReal = d.realBalance === undefined && d.balance !== undefined;
      const migrateDemo = d.demoBalance === undefined;
      if (migrateReal || migrateDemo) {
        await setDoc(
          userRef,
          {
            realBalance: d.realBalance !== undefined ? d.realBalance : d.balance || 0,
            demoBalance: d.demoBalance !== undefined ? d.demoBalance : 10000,
            balance: d.balance !== undefined ? d.balance : d.realBalance || 0
          },
          { merge: true }
        );
      }
    }

    if (this.unsubscribeBalance) {
      try {
        this.unsubscribeBalance();
      } catch (e) {}
      this.unsubscribeBalance = null;
    }

    this.unsubscribeBalance = onSnapshot(userRef, (snap) => {
      const data = snap.data();
      if (!data) return;

      this.realBalance = data.realBalance !== undefined ? data.realBalance : data.balance || 0;
      this.demoBalance = data.demoBalance !== undefined ? data.demoBalance : 10000;
      this.balancesReady = true;

      const realEl = document.getElementById("qtRealAmt");
      const demoEl = document.getElementById("qtDemoAmt");
      if (realEl) realEl.textContent = this._fmtMoney(this.realBalance);
      if (demoEl) demoEl.textContent = this._fmtMoney(this.demoBalance);

      const showAmt = this.activeAccount === "real" ? this.realBalance : this.demoBalance;
      const userBalance = document.getElementById("userBalance");
      if (userBalance) userBalance.textContent = this._fmtMoney(showAmt);
      const balAmount = document.getElementById("balAmount");
      if (balAmount) balAmount.textContent = this._fmtMoney(showAmt);

      try {
        localStorage.setItem("qt_demo_balance", String(this.demoBalance));
      } catch (e) {}
    });
  }

  async updateBalance(type, delta) {
    if (!this.user) return;

    const userRef = doc(db, "users", this.user.email);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const data = snap.data() || {};
    const field = type === "real" ? "realBalance" : "demoBalance";
    const current =
      data[field] !== undefined
        ? data[field]
        : type === "real"
          ? data.balance || 0
          : 10000;

    const next = Math.max(0, Number(current) + (Number(delta) || 0));
    const payload = {};
    payload[field] = next;
    if (type === "real") payload.balance = next;

    await updateDoc(userRef, payload);
  }
}

/* ============================================================
   💾 LocalStorageManager (ذكي + سقف)
   ============================================================ */
class LocalStorageManager {
  constructor() {
    this.CANDLES_KEY = "qt_trading_candles";
    this.LAST_SYNC_KEY = "qt_last_sync";
    this.MAX_LOCAL_CANDLES = 2500;
  }
  _ck(pair) {
    return pair ? "qt_trading_candles_" + pair.replace("/", "_") : this.CANDLES_KEY;
  }
  _sk(pair) {
    return pair ? "qt_last_sync_" + pair.replace("/", "_") : this.LAST_SYNC_KEY;
  }

  saveCandles(candles, pair) {
    try {
      const safe = Array.isArray(candles) ? candles : [];
      const trimmed =
        safe.length > this.MAX_LOCAL_CANDLES
          ? safe.slice(safe.length - this.MAX_LOCAL_CANDLES)
          : safe;
      localStorage.setItem(this._ck(pair), JSON.stringify(trimmed));
      localStorage.setItem(this._sk(pair), Date.now().toString());
    } catch (e) {
      console.error("Save error:", e);
    }
  }

  loadCandles(pair) {
    try {
      const data = localStorage.getItem(this._ck(pair));
      if (!data) return null;
      const candles = JSON.parse(data);
      if (!Array.isArray(candles)) return null;
      candles.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      return candles;
    } catch (e) {
      console.error("Load error:", e);
      return null;
    }
  }

  getLastSyncTime(pair) {
    const t = localStorage.getItem(this._sk(pair));
    return t ? parseInt(t, 10) : 0;
  }
}

/* ============================================================
   🔥 FirebaseManager (docId=timestamp لمنع التكرار)
   ============================================================ */
class FirebaseManager {
  constructor() {
    this.db = db;
    this.candlesCollection = "candles";
    this.saveBatchSize = 50;
    this.saveInterval = 30000;
    this.pendingCandles = [];
    this.isSaving = false;
    this._autoTimer = null;
    this.startAutoSave();
  }

  setPair(pairName) {
    const key = "candles_" + pairName.replace("/", "_");
    if (this.candlesCollection !== key) {
      this.candlesCollection = key;
      this.pendingCandles = [];
      console.log("Firebase collection:", key);
    }
  }

  addPendingCandle(candle) {
    this.pendingCandles.push(candle);
  }

  startAutoSave() {
    if (this._autoTimer) return;
    this._autoTimer = setInterval(async () => {
      if (this.pendingCandles.length > 0 && !this.isSaving) {
        const candlesToSave = [...this.pendingCandles];
        this.pendingCandles = [];
        await this.saveCandles(candlesToSave);
      }
    }, this.saveInterval);
  }

  async saveCandles(candles) {
    if (this.isSaving) return false;
    try {
      this.isSaving = true;
      const batch = [];

      for (const candle of candles) {
        if (!candle || candle.timestamp == null) continue;
        const candleData = {
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          timestamp: candle.timestamp,
          savedAt: serverTimestamp()
        };

        batch.push(candleData);

        if (batch.length >= this.saveBatchSize) {
          await this.saveBatch(batch);
          batch.length = 0;
          await this.delay(80);
        }
      }

      if (batch.length > 0) await this.saveBatch(batch);
      return true;
    } catch (e) {
      console.error("Save error:", e);
      return false;
    } finally {
      this.isSaving = false;
    }
  }

  async saveBatch(batch) {
    const promises = batch.map((candleData) => {
      const ref = doc(this.db, this.candlesCollection, String(candleData.timestamp));
      return setDoc(ref, candleData, { merge: true });
    });
    await Promise.all(promises);
  }

  async loadCandles(limitCount = 200, beforeTs = null) {
    try {
      const colRef = collection(this.db, this.candlesCollection);
      let q;
      if (beforeTs !== null && beforeTs !== undefined) {
        q = query(colRef, where("timestamp", "<", beforeTs), orderBy("timestamp", "desc"), limit(limitCount));
      } else {
        q = query(colRef, orderBy("timestamp", "desc"), limit(limitCount));
      }

      const snap = await getDocs(q);

      const map = new Map();
      snap.forEach((docSnap) => {
        const d = docSnap.data() || {};
        if (d.timestamp == null) return;
        map.set(d.timestamp, {
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
          timestamp: d.timestamp
        });
      });

      return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
    } catch (e) {
      console.error("Load error:", e);
      return null;
    }
  }

  delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}

/* ============================================================
   ⏰ Live time (UTC+3)
   ============================================================ */
function updateLiveTime() {
  const d = new Date();
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
  const t = new Date(utcMs + 3 * 3600000);
  const h = String(t.getHours()).padStart(2, "0");
  const m = String(t.getMinutes()).padStart(2, "0");
  const s = String(t.getSeconds()).padStart(2, "0");
  const el = document.getElementById("liveTime");
  if (el) el.textContent = `${h}:${m}:${s} UTC+3`;
}
updateLiveTime();
setInterval(updateLiveTime, 1000);

/* ============================================================
   📊 AdvancedTradingChart
   ============================================================ */
class AdvancedTradingChart {
  constructor() {
    this.plot = document.getElementById("plot");
    this.canvas = document.getElementById("chartCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.timeLabels = document.getElementById("timeLabels");
    this.candleTimer = document.getElementById("candleTimer");
    this.priceLine = document.getElementById("priceLine");
    this.priceScaleLabels = document.getElementById("priceScaleLabels");
    this.currentPriceEl = document.getElementById("currentPrice");
    this.loadingOverlay = document.getElementById("loadingOverlay");

    this.authManager = new AuthManager();
    this.localStorageManager = new LocalStorageManager();
    this.firebaseManager = new FirebaseManager();

    this.PAIR_CONFIG = {
      "EUR/USD": { base: 1.95, digits: 5, seed: 11001, volScale: 1 },
      "AUD/CAD": { base: 0.91, digits: 5, seed: 22001, volScale: 0.95 },
      "AUD/CHF": { base: 0.57, digits: 5, seed: 33001, volScale: 0.6 },
      "BHD/CNY": { base: 2.65, digits: 4, seed: 44001, volScale: 2.7 },
      "EUR/RUB": { base: 98.0, digits: 3, seed: 55001, volScale: 100 },
      "KES/USD": { base: 0.0077, digits: 6, seed: 66001, volScale: 0.008 },
      "LBP/USD": { base: 0.0111, digits: 6, seed: 77001, volScale: 0.011 },
      "QAR/CNY": { base: 1.98, digits: 5, seed: 88001, volScale: 2 },
      "USD/CHF": { base: 0.89, digits: 5, seed: 99001, volScale: 0.9 },
      "SYP/TRY": { base: 0.28, digits: 5, seed: 10501, volScale: 0.3 },
      "EGP/USD": { base: 0.0205, digits: 5, seed: 11501, volScale: 0.021 },
      "USD/INR": { base: 83.5, digits: 3, seed: 12501, volScale: 85 },
      "AED/CNY": { base: 1.98, digits: 5, seed: 13501, volScale: 2 }
    };

    // pair
    this.currentPair = "EUR/USD";
    this.isSwitching = false;

    // candles
    this.candles = [];
    this.currentCandle = null;
    this.maxCandles = 10000;

    // lazy loading
    this.INITIAL_LOAD = 200;
    this.HISTORY_CHUNK = 300;
    this.PREFETCH_THRESHOLD = 60;

    this._historyLoading = false;
    this._historyNoMore = false;
    this._historyLastTryAt = 0;
    this._historyThrottleMs = 650;

    this._localBuffer = [];
    this._localCursor = 0;

    this._pairCache = new Map();

    // chart params
    const cfg = this.PAIR_CONFIG[this.currentPair];
    this.basePrice = cfg.base;
    this.currentPrice = cfg.base;
    this.seed = cfg.seed;
    this.digits = cfg.digits;
    this.volScale = cfg.volScale;

    this.priceRange = { min: 0.95 * this.basePrice, max: 1.05 * this.basePrice };

    // pan/zoom
    this.baseSpacing = 12;
    this.zoom = 1;
    this.targetZoom = 1;
    this.minZoom = 0.425;
    this.maxZoom = 2.25;
    this.zoomEase = 0.28;

    this.targetOffsetX = 0;
    this.offsetX = 0;
    this.panEase = 0.38;
    this.velocity = 0;

    this.drag = 0;
    this.dragStartX = 0;
    this.dragStartOffset = 0;
    this.lastDragX = 0;
    this.lastDragTime = 0;

    this.pinch = 0;
    this.p0 = 0;
    this.pMidX = 0;
    this.pMidY = 0;

    // timeframe
    this.timeframe = 60000;
    this.t0 = Math.floor(Date.now() / this.timeframe) * this.timeframe;

    // smooth range
    this.smin = null;
    this.smax = null;
    this.sre = 0.088;

    this._fr = 0;

    // trades
    this.PAYOUT = 0.8;
    this._openTrades = [];
    this._closedTrades = [];
    this._pendingTradeLoad = false;

    // markers
    this.markers = [];

    // master/viewer
    this.uid = "uid_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
    this.isMaster = false;
    this._masterBroadcastInterval = null;
    this._watchdogInterval = null;
    this._liveUnsubscribe = null;
    this._lastBroadcastedClose = null;
    this.MASTER_TIMEOUT = 12000;
    this.BROADCAST_INTERVAL = 1000;

    window.addEventListener("beforeunload", () => {
      if (this.isMaster) {
        try {
          const stateRef = doc(db, "trading_live", this._getPairKey());
          updateDoc(stateRef, { masterUid: null, masterHeartbeat: 0 }).catch(() => {});
        } catch (e) {}
      }
    });

    this.firebaseManager.setPair(this.currentPair);

    // loading overlay timer
    this._loadingTimer = null;

    // init
    this.setup();
    this.initData();
  }

  /* =============== UI helpers =============== */
  showLoading(show) {
    if (!this.loadingOverlay) return;
    if (show) {
      if (this._loadingTimer) return;
      this._loadingTimer = setTimeout(() => {
        this.loadingOverlay.classList.add("show");
      }, 220);
    } else {
      if (this._loadingTimer) {
        clearTimeout(this._loadingTimer);
        this._loadingTimer = null;
      }
      this.loadingOverlay.classList.remove("show");
    }
  }

  _showMsg(text, color = "#111827") {
    if (!document.getElementById("_qtToastCSS")) {
      const s = document.createElement("style");
      s.id = "_qtToastCSS";
      s.textContent = `@keyframes _qtFade{0%{opacity:0;transform:translateX(-50%) translateY(-14px)}12%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-8px)}}`;
      document.head.appendChild(s);
    }
    const t = document.createElement("div");
    t.style.cssText = `position:fixed;top:68px;left:50%;transform:translateX(-50%);background:${color};color:#fff;padding:10px 22px;border-radius:12px;font-size:14px;font-weight:900;z-index:999999;box-shadow:0 4px 20px rgba(0,0,0,.5);white-space:nowrap;animation:_qtFade 2.4s forwards;pointer-events:none;letter-spacing:.3px;`;
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }

  /* =============== Local / Firebase history init =============== */
  initHistoricalData() {
    this.candles = [];
    let p = this.basePrice;
    let t =
      Math.floor((Date.now() - this.INITIAL_LOAD * this.timeframe) / this.timeframe) *
      this.timeframe;

    for (let i = 0; i < this.INITIAL_LOAD; i++) {
      const c = this.genCandle(t, p);
      this.candles.push(c);
      p = c.close;
      t += this.timeframe;
    }

    this.currentPrice = this.candles[this.candles.length - 1].close;

    this._localBuffer = [...this.candles];
    this._localCursor = 0;
    this.localStorageManager.saveCandles(this._localBuffer, this.currentPair);

    setTimeout(() => this._backgroundBuildLocalBuffer(), 50);
  }

  _backgroundBuildLocalBuffer() {
    const target = this.localStorageManager.MAX_LOCAL_CANDLES || 2500;
    let p = this.basePrice;
    let t =
      Math.floor((Date.now() - target * this.timeframe) / this.timeframe) *
      this.timeframe;

    const all = [];
    for (let i = 0; i < target; i++) {
      const c = this.genCandle(t, p);
      all.push(c);
      p = c.close;
      t += this.timeframe;
    }

    this._localBuffer = all;
    this._localCursor = Math.max(0, all.length - this.candles.length);
    this.localStorageManager.saveCandles(this._localBuffer, this.currentPair);

    // اختياري: دفع جزء لفايربيز بالتدريج
    try {
      all.slice(0, 800).forEach((c) => this.firebaseManager.addPendingCandle(c));
    } catch (e) {}
  }

  async initData() {
    this.showLoading(true);
    try {
      const cachedLocalAll = this.localStorageManager.loadCandles(this.currentPair) || [];
      this._localBuffer = cachedLocalAll;
      this._localCursor = Math.max(0, cachedLocalAll.length - this.INITIAL_LOAD);

      const firebaseCandles = await this.firebaseManager.loadCandles(this.INITIAL_LOAD, null);

      if (firebaseCandles && firebaseCandles.length > 0) {
        this.candles = firebaseCandles.slice(Math.max(0, firebaseCandles.length - this.INITIAL_LOAD));

        const merged = [...cachedLocalAll, ...firebaseCandles].sort(
          (a, b) => a.timestamp - b.timestamp
        );
        const uniq = new Map();
        merged.forEach((c) => {
          if (c && c.timestamp != null) uniq.set(c.timestamp, c);
        });
        const arr = Array.from(uniq.values()).sort((a, b) => a.timestamp - b.timestamp);
        this._localBuffer = arr.slice(Math.max(0, arr.length - 2500));
        this._localCursor = Math.max(0, this._localBuffer.length - this.candles.length);
        this.localStorageManager.saveCandles(this._localBuffer, this.currentPair);
      } else if (cachedLocalAll.length > 0) {
        this.candles = cachedLocalAll.slice(Math.max(0, cachedLocalAll.length - this.INITIAL_LOAD));
      } else {
        this.initHistoricalData();
      }

      if (this.candles.length > 0) this.currentPrice = this.candles[this.candles.length - 1].close;

      this._historyNoMore = false;

      this.snapToLive();
      this.updateTimeLabels();
      this.updatePriceRange();
      this.smin = this.priceRange.min;
      this.smax = this.priceRange.max;
      this.updatePriceScale();
      this.updatePriceLabel();

      this.dataLoaded = true;

      if (window.tradeHistory && typeof window.tradeHistory.setTrades === "function") {
        window.tradeHistory.setTrades([]);
      }
      this._refreshTradeBadge();

      await this._initMasterViewerSystem();

      if (this._pendingTradeLoad && this.authManager.user) {
        this._pendingTradeLoad = false;
        this.loadOpenTrades();
        this.loadTradeHistory();
      }

      this.initEvents();
      this.startRealtime();
      this.loop();
    } catch (e) {
      console.error("Init error:", e);
      this.initHistoricalData();
      this.dataLoaded = true;
      this.isMaster = true;
      this._startMasterBroadcast();
      this.initEvents();
      this.startRealtime();
      this.loop();
    } finally {
      this.showLoading(false);
    }
  }

  /* =============== Lazy history =============== */
  async loadMoreHistoryIfNeeded() {
    if (this.isSwitching || this._historyLoading || this._historyNoMore) return;

    const now = Date.now();
    if (now - this._historyLastTryAt < this._historyThrottleMs) return;

    const startIndex = Math.floor(this.xToIndex(0));
    if (startIndex > this.PREFETCH_THRESHOLD) return;

    this._historyLastTryAt = now;
    this._historyLoading = true;

    try {
      // Local أولاً
      if (this._localBuffer && this._localCursor > 0) {
        const end = this._localCursor;
        const start = Math.max(0, end - this.HISTORY_CHUNK);
        const chunk = this._localBuffer.slice(start, end);
        this._localCursor = start;
        this._prependCandles(chunk);
        return;
      }

      // Firebase أقدم
      const oldestTs = this.candles.length ? this.candles[0].timestamp : null;
      if (!oldestTs) {
        this._historyNoMore = true;
        return;
      }

      const older = await this.firebaseManager.loadCandles(this.HISTORY_CHUNK, oldestTs);
      if (!older || older.length === 0) {
        this._historyNoMore = true;
        return;
      }

      this._prependCandles(older);

      // update local buffer
      const mergedForLocal = [...(this._localBuffer || []), ...older].sort(
        (a, b) => a.timestamp - b.timestamp
      );
      const uniq = new Map();
      mergedForLocal.forEach((c) => {
        if (c && c.timestamp != null) uniq.set(c.timestamp, c);
      });
      this._localBuffer = Array.from(uniq.values())
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-2500);

      this._localCursor = Math.max(0, this._localBuffer.length - this.candles.length);
      this.localStorageManager.saveCandles(this._localBuffer, this.currentPair);
    } catch (e) {
      console.warn("loadMoreHistoryIfNeeded error:", e);
    } finally {
      this._historyLoading = false;
    }
  }

  _prependCandles(list) {
    if (!Array.isArray(list) || list.length === 0) return;

    const existing = new Set(this.candles.map((c) => c.timestamp));
    const toAdd = list.filter((c) => c && c.timestamp != null && !existing.has(c.timestamp));
    if (toAdd.length === 0) return;

    const shiftPx = toAdd.length * this.getSpacing();
    this.candles = [...toAdd, ...this.candles];

    this.offsetX += shiftPx;
    this.targetOffsetX += shiftPx;
    this.dragStartOffset += shiftPx;

    if (this.candles.length > this.maxCandles) {
      const extra = this.candles.length - this.maxCandles;
      this.candles = this.candles.slice(extra);
      const backShift = extra * this.getSpacing();
      this.offsetX -= backShift;
      this.targetOffsetX -= backShift;
      this.dragStartOffset -= backShift;
    }

    this.clampPan();
    this.updateTimeLabels();
  }

  /* =============== Geometry / math helpers =============== */
  setup() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.plot.getBoundingClientRect();
    this.w = r.width;
    this.h = r.height - 24;

    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.canvas.style.width = this.w + "px";
    this.canvas.style.height = this.h + "px";

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    if (this.dataLoaded) {
      this.updatePriceLabel();
      this.updatePriceScale();
      this.updateTimeLabels();
    }
  }

  _getPairKey() {
    return this.currentPair.replace("/", "_");
  }
  _getLiveStateRef() {
    return doc(db, "trading_live", this._getPairKey());
  }

  rnd(s) {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  }
  rndG(s) {
    const u1 = this.rnd(s);
    const u2 = this.rnd(s + 100000);
    return Math.sqrt(-2 * Math.log(u1 + 0.00001)) * Math.cos(2 * Math.PI * u2);
  }

  genCandle(t, o) {
    const s = this.seed + Math.floor(t / this.timeframe);
    const vb = 0.0008 * (this.volScale || 1);
    const tb = 0.00005 * (this.volScale || 1);

    const r1 = this.rndG(s);
    const r2 = this.rndG(s + 1);
    const r3 = this.rndG(s + 2);
    const r4 = this.rnd(s + 3);
    const r5 = this.rnd(s + 4);
    const r6 = this.rnd(s + 5);

    const v = vb * (0.7 + Math.abs(r1) * 0.8);
    const tr = tb * r2 * 0.6;
    const dir = r3 > 0 ? 1 : -1;

    const tc = o + (dir * v + tr);
    const rg = v * (0.2 + r4 * 0.6);
    const hm = rg * (0.3 + r5 * 0.7);
    const lm = rg * (0.3 + (1 - r5) * 0.7);

    const c = +(tc + (r6 - 0.5) * v * 0.1).toFixed(this.digits);
    const op = +o.toFixed(this.digits);

    return {
      open: op,
      close: c,
      high: +Math.max(op, c, op + hm, c + hm).toFixed(this.digits),
      low: +Math.min(op, c, op - lm, c - lm).toFixed(this.digits),
      timestamp: t
    };
  }

  getSpacing() {
    return this.baseSpacing * this.zoom;
  }
  getCandleWidth() {
    return this.getSpacing() * 0.8;
  }
  getMinOffset() {
    return this.w / 2 - this.candles.length * this.getSpacing();
  }
  getMaxOffset() {
    return this.w / 2;
  }

  clampPan() {
    const mn = this.getMinOffset();
    const mx = this.getMaxOffset();
    this.targetOffsetX = Math.max(mn, Math.min(mx, this.targetOffsetX));
    this.offsetX = Math.max(mn, Math.min(mx, this.offsetX));
  }

  snapToLive() {
    this.targetOffsetX = this.getMinOffset();
    this.offsetX = this.targetOffsetX;
    this.velocity = 0;
    this.clampPan();
  }

  updatePan() {
    const diff = this.targetOffsetX - this.offsetX;
    if (Math.abs(diff) > 0.003) this.offsetX += diff * this.panEase;
    else this.offsetX = this.targetOffsetX;

    if (Math.abs(this.velocity) > 0.01) {
      this.targetOffsetX += this.velocity;
      this.velocity *= 0.972;
      this.clampPan();
    } else {
      this.velocity = 0;
    }
  }

  tickZoom() {
    const d = this.targetZoom - this.zoom;
    if (Math.abs(d) > 0.0001) this.zoom += d * this.zoomEase;
    else this.zoom = this.targetZoom;
  }

  applyZoomAround(mx, my, sc) {
    const oz = this.targetZoom;
    const nz = Math.max(this.minZoom, Math.min(this.maxZoom, oz * sc));
    if (Math.abs(nz - oz) < 0.000001) return;

    const idx = this.xToIndex(mx);

    this.targetZoom = nz;
    this.zoom = nz;

    const nx = mx - idx * this.getSpacing();
    this.targetOffsetX = nx;
    this.offsetX = nx;

    this.clampPan();
    this.updateTimeLabels();
  }

  indexToX(i) {
    return this.offsetX + i * this.getSpacing();
  }
  xToIndex(x) {
    return (x - this.offsetX) / this.getSpacing();
  }

  niceNum(v, rnd) {
    const e = Math.floor(Math.log10(v));
    const p = Math.pow(10, e);
    const f = v / p;
    let nf;
    if (rnd) {
      if (f < 1.5) nf = 1;
      else if (f < 3) nf = 2;
      else if (f < 7) nf = 5;
      else nf = 10;
    } else {
      if (f <= 1) nf = 1;
      else if (f <= 2) nf = 2;
      else if (f <= 5) nf = 5;
      else nf = 10;
    }
    return nf * p;
  }

  getPriceRange() {
    const mn = this.smin !== null ? this.smin : this.priceRange.min;
    const mx = this.smax !== null ? this.smax : this.priceRange.max;
    return { min: mn, max: mx };
  }

  calcNiceGrid() {
    const r = this.getPriceRange();
    const rng = r.max - r.min;
    const d = this.niceNum(rng / 7, false);
    const g0 = Math.floor(r.min / d) * d;
    const g1 = Math.ceil(r.max / d) * d;
    return { min: g0, max: g1, step: d, count: Math.round((g1 - g0) / d) };
  }

  priceToY(p) {
    const r = this.getPriceRange();
    const n = (p - r.min) / (r.max - r.min);
    return this.h * (1 - n);
  }

  tickSR() {
    const r = this.priceRange;
    if (this.smin === null) {
      this.smin = r.min;
      this.smax = r.max;
      return;
    }
    this.smin += (r.min - this.smin) * this.sre;
    this.smax += (r.max - this.smax) * this.sre;
  }

  updatePriceRange() {
    let v = [...this.candles];
    if (this.currentCandle && (!v.length || this.currentCandle.timestamp !== v[v.length - 1].timestamp)) v.push(this.currentCandle);

    if (!v.length) {
      this.priceRange = { min: 0.95 * this.basePrice, max: 1.05 * this.basePrice };
      return;
    }

    const si = Math.floor(this.xToIndex(0));
    const ei = Math.ceil(this.xToIndex(this.w));
    const sl = v.slice(Math.max(0, si - 5), Math.min(v.length, ei + 5));

    if (!sl.length) {
      this.priceRange = { min: 0.95 * this.basePrice, max: 1.05 * this.basePrice };
      return;
    }

    const lo = sl.map((c) => c.low);
    const hi = sl.map((c) => c.high);
    const mn = Math.min(...lo);
    const mx = Math.max(...hi);
    const pd = 0.15 * (mx - mn) || 0.000000001;

    this.priceRange = { min: mn - pd, max: mx + pd };
  }

  /* =============== Grid / labels =============== */
  drawGrid() {
    const { min, step, count } = this.calcNiceGrid();

    for (let i = 0; i <= count; i++) {
      const p = min + i * step;
      const y = this.priceToY(p);
      if (y < -5 || y > this.h + 5) continue;
      const mj = i % 5 === 0;

      this.ctx.strokeStyle = mj ? "rgba(255,215,0,.12)" : "rgba(255,255,255,.05)";
      this.ctx.lineWidth = mj ? 1 : 0.8;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y + 0.5);
      this.ctx.lineTo(this.w, y + 0.5);
      this.ctx.stroke();
    }

    const visC = this.w / this.getSpacing();
    const targetL = 9;
    const stepC = Math.max(1, Math.round(visC / targetL));
    const s = Math.floor(this.xToIndex(0));
    const e = Math.ceil(this.xToIndex(this.w));

    for (let i = s; i <= e; i++) {
      if (i % stepC !== 0) continue;
      const x = this.indexToX(i);
      if (x < -5 || x > this.w + 5) continue;
      const mj = i % Math.round(stepC * 5) === 0;

      this.ctx.strokeStyle = mj ? "rgba(255,215,0,.12)" : "rgba(255,255,255,.05)";
      this.ctx.lineWidth = mj ? 1 : 0.8;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 0.5, 0);
      this.ctx.lineTo(x + 0.5, this.h);
      this.ctx.stroke();
    }
  }

  updateTimeLabels() {
    const tl = this.timeLabels;
    if (!tl) return;

    tl.innerHTML = "";

    const visC = this.w / this.getSpacing();
    const targetL = 9;
    const stepC = Math.max(1, Math.round(visC / targetL));
    const s = Math.floor(this.xToIndex(0));
    const e = Math.ceil(this.xToIndex(this.w));
    const tS = this.candles.length ? this.candles[0].timestamp : this.t0;

    for (let i = s; i <= e; i++) {
      if (i % stepC !== 0) continue;

      const x = this.indexToX(i);
      if (x < 5 || x > this.w - 5) continue;

      const t = tS + i * this.timeframe;
      const d = new Date(t);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");

      const lb = document.createElement("div");
      lb.className = "timeLabel";
      if (i % Math.round(stepC * 5) === 0) lb.classList.add("major");
      lb.style.left = x + "px";
      lb.textContent = `${hh}:${mm}`;
      tl.appendChild(lb);
    }
  }

  updatePriceScale() {
    const { min, step, count } = this.calcNiceGrid();
    let h = "";

    for (let i = 0; i <= count; i++) {
      const p = min + i * step;
      const y = this.priceToY(p);
      if (y < -8 || y > this.h + 8) continue;
      const mj = i % 5 === 0;
      h += `<div class="pLabel${mj ? " major" : ""}" style="top:${y}px">${p.toFixed(this.digits)}</div>`;
    }

    if (this.priceScaleLabels) this.priceScaleLabels.innerHTML = h;
  }

  updatePriceLabel() {
    const py = this.priceToY(this.currentPrice);
    if (this.priceLine) this.priceLine.style.top = py + "px";
    if (this.currentPriceEl) {
      this.currentPriceEl.style.top = py + "px";
      this.currentPriceEl.textContent = this.currentPrice.toFixed(this.digits);
    }
  }

  updateCandleTimer() {
    if (!this.currentCandle || !this.candleTimer) return;
    const n = Date.now();
    const e = n - this.t0;
    const r = this.timeframe - e;
    const s = Math.floor(r / 1000);
    this.candleTimer.textContent = s >= 0 ? s : 0;

    const cx = this.indexToX(this.candles.length);
    this.candleTimer.style.left = cx + 15 + "px";
    this.candleTimer.style.top = "10px";
    this.candleTimer.style.display = "block";
  }

  /* =============== Candle draw =============== */
  drawCandle(c, x, glow) {
    const oy = this.priceToY(c.open);
    const cy = this.priceToY(c.close);
    const hy = this.priceToY(c.high);
    const ly = this.priceToY(c.low);

    const bull = c.close >= c.open;
    const w = this.getCandleWidth();

    this.ctx.strokeStyle = bull ? "#0f0" : "#f00";
    this.ctx.lineWidth = Math.max(1, 0.18 * w);
    this.ctx.beginPath();
    this.ctx.moveTo(x, hy);
    this.ctx.lineTo(x, ly);
    this.ctx.stroke();

    const bh = Math.max(1, Math.abs(cy - oy));
    const bt = Math.min(oy, cy);

    const g = this.ctx.createLinearGradient(x, bt, x, bt + bh);
    if (bull) {
      g.addColorStop(0, "#0f0");
      g.addColorStop(1, "#0c0");
    } else {
      g.addColorStop(0, "#f00");
      g.addColorStop(1, "#c00");
    }

    this.ctx.fillStyle = g;
    if (glow) {
      this.ctx.shadowColor = bull ? "rgba(0,255,0,.8)" : "rgba(255,0,0,.8)";
      this.ctx.shadowBlur = 12;
    }

    this.ctx.fillRect(x - w / 2, bt, w, bh);

    if (glow) this.ctx.shadowBlur = 0;
  }

  /* =============== Markers =============== */
  addMarker(type, tradeId, account) {
    // place marker on current price, nearest candle body
    const c = this.currentCandle;
    if (!c) return;

    const op = this.currentPrice;
    const bt = Math.max(c.open, c.close);
    const bb = Math.min(c.open, c.close);
    let fp = op;
    if (op > bt) fp = bt;
    else if (op < bb) fp = bb;

    this.markers.push({
      type,
      tradeId,
      account,
      price: fp,
      candleIndex: this.candles.length,
      candleTimestamp: this.t0,
      createdAt: Date.now(),
      closed: false,
      profitLoss: null
    });
  }

  _drawMarker(m) {
    const x = this.indexToX(m.candleIndex);
    if (x < -60 || x > this.w + 60) return;

    const y = this.priceToY(m.price);
    const w = this.getCandleWidth();

    const isBuy = m.type === "buy";
    const cl = isBuy ? "#16a34a" : "#ff3b3b";

    this.ctx.save();

    // dot
    this.ctx.shadowColor = cl;
    this.ctx.shadowBlur = 9;
    this.ctx.fillStyle = cl;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 5.5, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // arrow
    this.ctx.fillStyle = "#fff";
    this.ctx.save();
    this.ctx.translate(x, y);
    if (!isBuy) this.ctx.rotate(Math.PI);
    this.ctx.beginPath();
    this.ctx.moveTo(0, -2.8);
    this.ctx.lineTo(-2, 0.8);
    this.ctx.lineTo(-0.65, 0.8);
    this.ctx.lineTo(-0.65, 2.8);
    this.ctx.lineTo(0.65, 2.8);
    this.ctx.lineTo(0.65, 0.8);
    this.ctx.lineTo(2, 0.8);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();

    // line + end circle
    const lx = x + w / 2 + 3;
    const lw = Math.min(95, this.w - lx - 22);

    this.ctx.strokeStyle = isBuy ? "rgba(22,163,74,.7)" : "rgba(255,59,59,.7)";
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.moveTo(x + w / 2, y);
    this.ctx.lineTo(lx, y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(lx, y);
    this.ctx.lineTo(lx + lw, y);
    this.ctx.stroke();

    const ex = lx + lw;
    this.ctx.strokeStyle = cl;
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = "#fff";
    this.ctx.beginPath();
    this.ctx.arc(ex, y, 5, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();

    // profit box
    if (m.closed && m.profitLoss !== null) {
      const pl = Number(m.profitLoss) || 0;
      const isWin = pl >= 0;
      const plText = isWin ? `+$${this._fmtBal(pl)}` : `-$${this._fmtBal(Math.abs(pl))}`;
      const plColor = isWin ? "#00ff41" : "#ff3b3b";
      const bgColor = isWin ? "rgba(0,255,65,0.18)" : "rgba(255,59,59,0.18)";

      const textX = ex + 10;
      const textY = y;

      this.ctx.font = "bold 11.5px Arial";
      const tw = this.ctx.measureText(plText).width;

      this.ctx.fillStyle = bgColor;
      this.ctx.fillRect(textX - 3, textY - 10, tw + 10, 17);

      this.ctx.strokeStyle = plColor;
      this.ctx.lineWidth = 0.8;
      this.ctx.strokeRect(textX - 3, textY - 10, tw + 10, 17);

      this.ctx.fillStyle = plColor;
      this.ctx.shadowColor = plColor;
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(plText, textX + 2, textY + 3);
      this.ctx.shadowBlur = 0;
    }

    this.ctx.restore();
  }

  _fmtBal(n) {
    try {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(n) || 0);
    } catch (e) {
      return (Math.round((Number(n) || 0) * 100) / 100).toFixed(2);
    }
  }

  /* =============== Draw loop =============== */
  draw() {
    this.tickZoom();
    this.updatePan();

    this.loadMoreHistoryIfNeeded();

    this.updatePriceRange();
    this.tickSR();

    this.ctx.clearRect(0, 0, this.w, this.h);
    this.drawGrid();

    for (let i = 0; i < this.candles.length; i++) {
      const x = this.indexToX(i);
      if (x < -60 || x > this.w + 60) continue;
      this.drawCandle(this.candles[i], x, false);
    }

    if (
      this.currentCandle &&
      (!this.candles.length || this.currentCandle.timestamp !== this.candles[this.candles.length - 1].timestamp)
    ) {
      const lx = this.indexToX(this.candles.length);
      if (lx >= -60 && lx <= this.w + 60) this.drawCandle(this.currentCandle, lx, true);
    }

    // markers
    for (const m of this.markers) this._drawMarker(m);

    if (++this._fr % 2 === 0) {
      this.updatePriceScale();
      this.updateTimeLabels();
    }

    this.updatePriceLabel();
    this.updateCandleTimer();
  }

  loop() {
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  /* =============== Input events =============== */
  initEvents() {
    addEventListener("resize", () => this.setup());

    this.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const r = this.canvas.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const sc = e.deltaY > 0 ? 1 / 1.1 : 1.1;
        this.applyZoomAround(x, y, sc);
      },
      { passive: false }
    );

    const md = (x, t) => {
      this.drag = 1;
      this.dragStartX = x;
      this.dragStartOffset = this.targetOffsetX;
      this.velocity = 0;
      this.lastDragX = x;
      this.lastDragTime = t;
    };

    const mm = (x, t) => {
      if (!this.drag) return;
      const d = x - this.dragStartX;
      this.targetOffsetX = this.dragStartOffset + d;
      this.clampPan();

      const dt = t - this.lastDragTime;
      if (dt > 0 && dt < 80) this.velocity = ((x - this.lastDragX) / dt) * 26;

      this.lastDragX = x;
      this.lastDragTime = t;
    };

    const mu = () => {
      this.drag = 0;
      this.updateTimeLabels();
    };

    this.canvas.addEventListener("mousedown", (e) => {
      const r = this.canvas.getBoundingClientRect();
      md(e.clientX - r.left, Date.now());
    });

    addEventListener("mousemove", (e) => {
      const r = this.canvas.getBoundingClientRect();
      mm(e.clientX - r.left, Date.now());
    });

    addEventListener("mouseup", mu);

    const dist = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        const r = this.canvas.getBoundingClientRect();
        if (e.touches.length === 1) {
          md(e.touches[0].clientX - r.left, Date.now());
        } else if (e.touches.length === 2) {
          this.drag = 0;
          this.pinch = 1;
          this.p0 = dist(e.touches[0], e.touches[1]);
          this.pMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
          this.pMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
        }
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        const r = this.canvas.getBoundingClientRect();
        if (this.pinch && e.touches.length === 2) {
          const d = dist(e.touches[0], e.touches[1]);
          if (this.p0 > 0) {
            const sc = Math.max(0.2, Math.min(5, d / (this.p0 || d)));
            this.applyZoomAround(this.pMidX, this.pMidY, sc);
          }
          this.p0 = d;
        } else if (!this.pinch && e.touches.length === 1) {
          mm(e.touches[0].clientX - r.left, Date.now());
        }
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      "touchend",
      (e) => {
        if (e.touches.length < 2) {
          this.pinch = 0;
          this.p0 = 0;
        }
        if (e.touches.length === 0) mu();
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      "touchcancel",
      () => {
        this.pinch = 0;
        this.p0 = 0;
        mu();
      },
      { passive: false }
    );
  }

  /* =============== Master / Viewer live candle sync =============== */
  async _initMasterViewerSystem() {
    try {
      const claimed = await this._tryClaimMaster();
      if (claimed) {
        this.isMaster = true;
        this.candles = await this._fillAndSaveCandleGaps(this.candles);
        this._startMasterBroadcast();
      } else {
        this.isMaster = false;
        this._startViewerSubscription();
        this._startWatchdog();
      }
    } catch (e) {
      console.error("_initMasterViewerSystem error:", e);
      this.isMaster = true;
      this._startMasterBroadcast();
    }
  }

  async _tryClaimMaster() {
    try {
      const stateRef = this._getLiveStateRef();
      const snap = await getDoc(stateRef);

      if (!snap.exists()) {
        await setDoc(stateRef, {
          masterUid: this.uid,
          masterHeartbeat: Date.now(),
          liveCandle: null,
          liveT0: this.t0,
          pair: this.currentPair
        });
        return true;
      }

      const data = snap.data() || {};
      const hb = data.masterHeartbeat || 0;
      const isAlive = Date.now() - hb < this.MASTER_TIMEOUT;

      if (!data.masterUid || !isAlive) {
        await updateDoc(stateRef, { masterUid: this.uid, masterHeartbeat: Date.now(), liveT0: this.t0 });
        return true;
      }

      if (data.masterUid === this.uid) return true;

      // viewer bootstrap
      if (data.liveCandle) {
        this.currentCandle = { ...data.liveCandle };
        this.currentPrice = data.liveCandle.close;
        window.__qt_price = this.currentPrice;
      }
      if (data.liveT0) this.t0 = data.liveT0;

      return false;
    } catch (e) {
      console.error(e);
      return true;
    }
  }

  _startMasterBroadcast() {
    if (this._masterBroadcastInterval) clearInterval(this._masterBroadcastInterval);

    this._masterBroadcastInterval = setInterval(async () => {
      if (!this.isMaster || this.isSwitching || !this.currentCandle) return;
      if (this.currentCandle.close === this._lastBroadcastedClose) return;
      this._lastBroadcastedClose = this.currentCandle.close;

      try {
        const stateRef = this._getLiveStateRef();
        await setDoc(
          stateRef,
          {
            masterUid: this.uid,
            masterHeartbeat: Date.now(),
            liveCandle: { ...this.currentCandle },
            liveT0: this.t0,
            liveUpdatedAt: Date.now(),
            pair: this.currentPair
          },
          { merge: true }
        );
      } catch (e) {}
    }, this.BROADCAST_INTERVAL);
  }

  _startViewerSubscription() {
    if (this._liveUnsubscribe) {
      try {
        this._liveUnsubscribe();
      } catch (e) {}
      this._liveUnsubscribe = null;
    }

    const stateRef = this._getLiveStateRef();
    this._liveUnsubscribe = onSnapshot(stateRef, (snap) => {
      if (!snap.exists() || this.isMaster || this.isSwitching) return;
      const data = snap.data() || {};

      if (data.liveT0) this.t0 = data.liveT0;

      if (data.liveCandle) {
        this.currentCandle = { ...data.liveCandle };
        this.currentPrice = data.liveCandle.close;
        window.__qt_price = this.currentPrice;
      }
    });
  }

  _startWatchdog() {
    if (this._watchdogInterval) clearInterval(this._watchdogInterval);

    this._watchdogInterval = setInterval(async () => {
      if (this.isMaster || this.isSwitching) return;

      try {
        const stateRef = this._getLiveStateRef();
        const snap = await getDoc(stateRef);
        if (!snap.exists()) return;

        const data = snap.data() || {};
        const hb = data.masterHeartbeat || 0;
        const isAlive = Date.now() - hb < this.MASTER_TIMEOUT;

        if (!data.masterUid || !isAlive) {
          await updateDoc(stateRef, { masterUid: this.uid, masterHeartbeat: Date.now(), liveT0: this.t0 }, { merge: true });
          this.isMaster = true;
          this._startMasterBroadcast();
        }
      } catch (e) {}
    }, 5000);
  }

  async _cleanupMasterViewer() {
    if (this._masterBroadcastInterval) {
      clearInterval(this._masterBroadcastInterval);
      this._masterBroadcastInterval = null;
    }
    if (this._watchdogInterval) {
      clearInterval(this._watchdogInterval);
      this._watchdogInterval = null;
    }
    if (this._liveUnsubscribe) {
      try {
        this._liveUnsubscribe();
      } catch (e) {}
      this._liveUnsubscribe = null;
    }

    this.isMaster = false;
    this._lastBroadcastedClose = null;
  }

  async _fillAndSaveCandleGaps(candles) {
    if (!candles || candles.length === 0) return candles || [];

    const last = candles[candles.length - 1];
    const lastTs = last.timestamp;
    const currentT0 = Math.floor(Date.now() / this.timeframe) * this.timeframe;

    if (currentT0 <= lastTs + this.timeframe) return candles;

    const gapCount = Math.floor((currentT0 - lastTs) / this.timeframe) - 1;
    if (gapCount <= 0) return candles;

    const maxFill = Math.min(gapCount, 240);
    let p = last.close;
    let t = lastTs + this.timeframe;

    const gaps = [];
    for (let i = 0; i < maxFill; i++) {
      const c = this.genCandle(t, p);
      gaps.push(c);
      p = c.close;
      t += this.timeframe;
    }

    if (gaps.length) {
      try {
        await this.firebaseManager.saveCandles(gaps);
      } catch (e) {
        gaps.forEach((c) => this.firebaseManager.addPendingCandle(c));
      }

      const result = [...candles, ...gaps];
      return result.length > this.maxCandles ? result.slice(result.length - this.maxCandles) : result;
    }

    return candles;
  }

  /* =============== Realtime (Master only) =============== */
  stepTowards(c, t, m) {
    const d = t - c;
    return Math.abs(d) <= m ? t : c + Math.sign(d) * m;
  }

  updateCurrentCandle() {
    if (!this.currentCandle) {
      const lp = this.candles.length ? this.candles[this.candles.length - 1].close : this.currentPrice;
      this.currentCandle = this.genCandle(this.t0, lp);
      this.currentCandle.close = lp;
      this.currentCandle.high = Math.max(this.currentCandle.open, this.currentCandle.close);
      this.currentCandle.low = Math.min(this.currentCandle.open, this.currentCandle.close);
      return;
    }

    const n = Date.now();
    const r = this.rnd(this.seed + n);
    const dir = (r - 0.5) * 0.0004;
    const t = this.currentCandle.close + dir;
    const ms = 0.0008 * 0.18 * (this.volScale || 1);

    const nc = +this.stepTowards(this.currentCandle.close, t, ms).toFixed(this.digits);
    this.currentCandle.close = nc;
    this.currentCandle.high = +Math.max(this.currentCandle.high, nc).toFixed(this.digits);
    this.currentCandle.low = +Math.min(this.currentCandle.low, nc).toFixed(this.digits);

    this.currentPrice = nc;
    window.__qt_price = this.currentPrice;
  }

  startRealtime() {
    // tick candle
    setInterval(() => {
      if (this.isSwitching || !this.isMaster) return;

      const n = Date.now();
      const e = n - this.t0;

      if (e >= this.timeframe) {
        if (
          this.currentCandle &&
          (!this.candles.length || this.currentCandle.timestamp !== this.candles[this.candles.length - 1].timestamp)
        ) {
          const completed = { ...this.currentCandle };
          this.candles.push(completed);
          this.firebaseManager.addPendingCandle(completed);
          if (this.candles.length > this.maxCandles) this.candles.shift();
        }

        this.t0 = Math.floor(n / this.timeframe) * this.timeframe;
        const lp = this.currentCandle ? this.currentCandle.close : this.currentPrice;

        this.currentCandle = this.genCandle(this.t0, lp);
        this.currentCandle.open = lp;
        this.currentCandle.close = lp;
        this.currentCandle.high = lp;
        this.currentCandle.low = lp;

        this.currentPrice = lp;
        this._lastBroadcastedClose = null;
      } else {
        this.updateCurrentCandle();
      }
    }, 200);

    // save visible buffer to local
    setInterval(() => {
      if (this.isSwitching || !this.isMaster) return;
      try {
        const merged = [...this._localBuffer, ...this.candles].sort((a, b) => a.timestamp - b.timestamp);
        const uniq = new Map();
        merged.forEach((c) => {
          if (c && c.timestamp != null) uniq.set(c.timestamp, c);
        });
        this._localBuffer = Array.from(uniq.values())
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(-2500);
        this._localCursor = Math.max(0, this._localBuffer.length - this.candles.length);
        this.localStorageManager.saveCandles(this._localBuffer, this.currentPair);
      } catch (e) {}
    }, 10000);
  }

  /* =============== Pair switching =============== */
  async switchPair(pairName) {
    if (this.currentPair === pairName || this.isSwitching) return;

    this.isSwitching = true;
    this.showLoading(true);

    try {
      await this._cleanupMasterViewer();

      // cache
      const cached = this._pairCache.get(pairName);

      this.currentPair = pairName;
      this.firebaseManager.setPair(pairName);

      const cfg =
        this.PAIR_CONFIG[pairName] ||
        {
          base: 1.0,
          digits: 5,
          seed:
            (Math.abs(
              pairName.split("").reduce((h, c) => (((h << 5) - h) + c.charCodeAt(0)) | 0, 0)
            ) %
              90000) +
            10000,
          volScale: 1
        };

      this.basePrice = cfg.base;
      this.currentPrice = cfg.base;
      this.digits = cfg.digits;
      this.seed = cfg.seed;
      this.volScale = cfg.volScale;

      if (cached && cached.candles && cached.candles.length) {
        this.candles = [...cached.candles];
        this._localBuffer = [...cached.localBuffer];
        this._localCursor = cached.localCursor || Math.max(0, this._localBuffer.length - this.candles.length);
      } else {
        this.candles = [];
        this.currentCandle = null;
        this.markers = [];

        this.t0 = Math.floor(Date.now() / this.timeframe) * this.timeframe;
        this.smin = null;
        this.smax = null;
        this.velocity = 0;
        this._fr = 0;

        const localAll = this.localStorageManager.loadCandles(pairName) || [];
        this._localBuffer = localAll;
        this._localCursor = Math.max(0, localAll.length - this.INITIAL_LOAD);

        const firebaseCandles = await this.firebaseManager.loadCandles(this.INITIAL_LOAD, null);

        if (firebaseCandles && firebaseCandles.length > 0) {
          this.candles = firebaseCandles.slice(-this.INITIAL_LOAD);
        } else if (localAll.length > 0) {
          this.candles = localAll.slice(-this.INITIAL_LOAD);
        } else {
          this.initHistoricalData();
        }
      }

      if (this.candles.length > 0) this.currentPrice = this.candles[this.candles.length - 1].close;
      this._historyNoMore = false;

      this.snapToLive();
      this.updateTimeLabels();
      this.updatePriceRange();
      this.smin = this.priceRange.min;
      this.smax = this.priceRange.max;
      this.updatePriceScale();
      this.updatePriceLabel();

      // store cache
      this._pairCache.set(pairName, {
        candles: [...this.candles],
        localBuffer: [...this._localBuffer],
        localCursor: this._localCursor,
        ts: Date.now()
      });

      await this._initMasterViewerSystem();

      if (this.authManager.user) {
        this.loadOpenTrades();
        this.loadTradeHistory();
      }
    } catch (e) {
      console.error("switchPair error:", e);
      try {
        this.initHistoricalData();
      } catch (_) {}
    } finally {
      this.isSwitching = false;
      this.showLoading(false);
    }
  }

  /* ============================================================
     Trading + History
     - تخزين Firestore: users/{email}/trades/{tradeId}
     ============================================================ */

  _getActiveAcc() {
    return this.authManager.activeAccount || "demo";
  }

  _getBalanceFor(acc) {
    const a = acc || this._getActiveAcc();
    return a === "real" ? this.authManager.realBalance || 0 : this.authManager.demoBalance || 0;
  }

  _setBalanceFor(acc, amount) {
    const a = acc || this._getActiveAcc();
    const safeAmt = Math.max(0, Number(amount) || 0);
    this.authManager.setBalance(a, safeAmt, { persist: true });
  }

  openTrade(direction) {
    const acc = this._getActiveAcc();

    if (acc === "real" && !this.authManager.user) {
      this._showMsg("لازم تسجّل دخول عشان تستخدم الحساب الحقيقي ❌", "#dc2626");
      return;
    }

    if (this.authManager.user && !this.authManager.balancesReady) {
      this._showMsg("استنى تحميل الرصيد لحظة... ⏳", "#f59e0b");
      return;
    }

    const amountEl = document.getElementById("amountDisplay");
    const raw = amountEl ? String(amountEl.value || "") : "";
    const rawVal = raw.replace(/[^0-9]/g, "");

    if (!rawVal) {
      this._showMsg("اكتب مبلغ الصفقة الأول ❌", "#dc2626");
      return;
    }

    const stake = parseFloat(rawVal);
    if (!Number.isFinite(stake) || stake <= 0) {
      this._showMsg("المبلغ غير صحيح ❌", "#dc2626");
      return;
    }

    const bal = this._getBalanceFor(acc);
    if (bal < stake) {
      this._showMsg("الرصيد مش كفاية ❌", "#dc2626");
      return;
    }

    // خصم الستيك أولاً
    this._setBalanceFor(acc, bal - stake);

    const dir = direction === "buy" ? "up" : "down";
    const duration = Math.max(1, Number(this.selectedTime) || 5);
    const tradeId = `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const trade = {
      id: tradeId,
      status: "open",
      open: true,
      account: acc,
      pair: this.currentPair,
      type: direction,
      dir,
      stake,
      payout: this.PAYOUT,
      entry: this.currentPrice,
      openTime: Date.now(),
      closeTime: Date.now() + duration * 1000,
      duration
    };

    this._openTrades.push(trade);

    // marker
    this.addMarker(direction, tradeId, acc);

    // push to UI if exists
    try {
      if (window.tradeHistory && typeof window.tradeHistory.setTrades === "function") {
        const cur = (window.tradeHistory.trades || []).filter((t) => t && t.status === "open");
        cur.push(trade);
        window.tradeHistory.setTrades(cur);
      }
    } catch (e) {}

    // save to Firebase
    if (this.authManager.user) {
      this._saveTradeToFirebase(trade).catch((e) => console.warn("Trade save error:", e));
    }

    this._refreshTradeBadge();

    setTimeout(() => this._closeTrade(tradeId, trade), duration * 1000);
  }

  _closeTrade(tradeId, trade) {
    const currentP = this.currentPrice;
    const win =
      (trade.dir === "up" && currentP >= trade.entry) ||
      (trade.dir === "down" && currentP <= trade.entry);

    const profitOnly = win ? trade.stake * (trade.payout || this.PAYOUT) : 0;
    const pl = win ? profitOnly : -trade.stake;

    // remove open trade
    this._openTrades = this._openTrades.filter((t) => t.id !== tradeId);

    // update UI open trades list if exists
    try {
      if (window.tradeHistory && typeof window.tradeHistory.setTrades === "function") {
        const remaining = (window.tradeHistory.trades || []).filter((t) => t && t.id !== tradeId);
        window.tradeHistory.setTrades(remaining);
      }
    } catch (e) {}

    // balance settle
    const acc = trade.account || "demo";
    if (win) {
      const b = this._getBalanceFor(acc);
      this._setBalanceFor(acc, b + trade.stake + profitOnly);
    }

    // marker update
    const mIdx = this.markers.findIndex((m) => m.tradeId === tradeId);
    if (mIdx >= 0) {
      this.markers[mIdx].closed = true;
      this.markers[mIdx].profitLoss = pl;
    }

    // closed trade
    const closedTrade = {
      ...trade,
      status: "closed",
      open: false,
      result: win ? "win" : "loss",
      profit: pl,
      profitLoss: pl,
      closedAt: Date.now(),
      closePrice: currentP
    };

    this._addClosedTradeToHistory(closedTrade);

    if (this.authManager.user) {
      this._updateTradeInFirebase(tradeId, {
        status: "closed",
        open: false,
        result: win ? "win" : "loss",
        profit: pl,
        profitLoss: pl,
        closedAt: Date.now(),
        closePrice: currentP
      }).catch((e) => console.warn("Trade close update error:", e));
    }

    this._refreshTradeBadge();
  }

  _addClosedTradeToHistory(closedTrade) {
    this._closedTrades.unshift(closedTrade);

    // direct API if exists
    if (window.tradeHistory) {
      if (typeof window.tradeHistory.addHistory === "function") window.tradeHistory.addHistory(closedTrade);
      if (typeof window.tradeHistory.addClosedTrade === "function") window.tradeHistory.addClosedTrade(closedTrade);
      if (typeof window.tradeHistory.setHistory === "function") window.tradeHistory.setHistory([...this._closedTrades]);
      if (typeof window.tradeHistory.loadHistory === "function") window.tradeHistory.loadHistory([...this._closedTrades]);
    }

    // event
    window.dispatchEvent(
      new CustomEvent("qt_trade_closed", {
        detail: { trade: closedTrade, allClosed: [...this._closedTrades] }
      })
    );
  }

  async loadTradeHistory() {
    if (!this.authManager.user) return;
    try {
      const email = this.authManager.user.email;
      const tradesRef = collection(db, "users", email, "trades");

      const q = query(
        tradesRef,
        where("status", "==", "closed"),
        orderBy("closedAt", "desc"),
        limit(100)
      );

      const snapshot = await getDocs(q);
      this._closedTrades = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() || {};
        this._closedTrades.push({
          ...data,
          id: docSnap.id,
          status: "closed",
          result: data.result || ((data.profitLoss || data.profit || 0) >= 0 ? "win" : "loss"),
          profit: data.profit !== undefined ? data.profit : data.profitLoss || 0,
          profitLoss: data.profitLoss !== undefined ? data.profitLoss : data.profit || 0,
          closedAt: data.closedAt || 0,
          open: false
        });
      });

      if (window.tradeHistory) {
        if (typeof window.tradeHistory.setHistory === "function") window.tradeHistory.setHistory([...this._closedTrades]);
        if (typeof window.tradeHistory.loadHistory === "function") window.tradeHistory.loadHistory([...this._closedTrades]);
      }

      window.dispatchEvent(new CustomEvent("qt_history_loaded", { detail: [...this._closedTrades] }));
    } catch (e) {
      console.error("loadTradeHistory error:", e);
      window.dispatchEvent(new CustomEvent("qt_history_loaded", { detail: [] }));
    }
  }

  async loadOpenTrades() {
    if (!this.authManager.user) return;
    try {
      const email = this.authManager.user.email;
      const tradesRef = collection(db, "users", email, "trades");
      const q = query(tradesRef, where("status", "==", "open"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        this._refreshTradeBadge();
        await this.loadTradeHistory();
        return;
      }

      // clear UI
      if (window.tradeHistory && typeof window.tradeHistory.setTrades === "function") window.tradeHistory.setTrades([]);

      const now = Date.now();

      for (const docSnap of snapshot.docs) {
        const trade = { ...docSnap.data(), id: docSnap.id };
        if (!trade.closeTime) continue;

        if (trade.closeTime <= now) {
          // expired -> close now
          this._closeTrade(trade.id, trade);
          continue;
        }

        // restore open
        this._openTrades.push(trade);
        const remaining = trade.closeTime - now;

        // restore marker
        if (trade.markerType && trade.markerCandleIndex != null && trade.markerPrice != null) {
          this.markers.push({
            type: trade.markerType,
            tradeId: trade.id,
            account: trade.account || "demo",
            price: trade.markerPrice,
            candleIndex: trade.markerCandleIndex,
            candleTimestamp: trade.markerCandleTimestamp || 0,
            createdAt: trade.openTime || now,
            closed: false,
            profitLoss: null
          });
        } else {
          // fallback marker at current candle
          this.addMarker(trade.type || "buy", trade.id, trade.account || "demo");
        }

        // restore to UI
        try {
          if (window.tradeHistory && typeof window.tradeHistory.setTrades === "function") {
            const current = window.tradeHistory.trades || [];
            current.push(trade);
            window.tradeHistory.setTrades(current);
          }
        } catch (e) {}

        setTimeout(() => this._closeTrade(trade.id, trade), remaining);
      }

      this._refreshTradeBadge();
      await this.loadTradeHistory();
    } catch (e) {
      console.error("loadOpenTrades error:", e);
    }
  }

  async _saveTradeToFirebase(trade) {
    if (!this.authManager.user) return;
    const email = this.authManager.user.email;

    // include marker info for restore
    const marker = this.markers.find((m) => m.tradeId === trade.id);

    const tradeRef = doc(db, "users", email, "trades", trade.id);
    const payload = {
      ...trade,
      open: undefined,
      savedAt: serverTimestamp(),
      markerType: marker ? marker.type : trade.type,
      markerPrice: marker ? marker.price : trade.entry,
      markerCandleIndex: marker ? marker.candleIndex : this.candles.length,
      markerCandleTimestamp: marker ? marker.candleTimestamp : this.t0
    };

    // remove undefined
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    await setDoc(tradeRef, payload, { merge: true });
  }

  async _updateTradeInFirebase(tradeId, updates) {
    if (!this.authManager.user) return;
    const email = this.authManager.user.email;
    const tradeRef = doc(db, "users", email, "trades", tradeId);
    await updateDoc(tradeRef, updates);
  }

  _refreshTradeBadge() {
    try {
      const acc = this._getActiveAcc();
      const count = this._openTrades.filter((t) => (t.account || "demo") === acc).length;
      this._updateTradeBadge(count);
    } catch (e) {}
  }

  _updateTradeBadge(count) {
    let badge = document.getElementById("_qtTradeBadge");
    if (!badge) {
      let histBtn =
        document.querySelector("#historyBtn") ||
        document.querySelector(".historyBtn") ||
        document.querySelector('[data-panel="history"]') ||
        document.querySelector("#tradeHistoryBtn") ||
        document.querySelector(".tradeHistBtn");

      if (!histBtn) {
        document.querySelectorAll("button").forEach((btn) => {
          if (!histBtn && ((btn.id && btn.id.toLowerCase().includes("hist")) || (btn.className && String(btn.className).toLowerCase().includes("hist")))) {
            histBtn = btn;
          }
        });
      }

      if (!histBtn) return;

      badge = document.createElement("span");
      badge.id = "_qtTradeBadge";
      badge.style.cssText =
        "position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;font-size:10px;font-weight:900;min-width:18px;height:18px;border-radius:9px;display:none;align-items:center;justify-content:center;padding:0 4px;z-index:10000;pointer-events:none;box-shadow:0 2px 6px rgba(0,0,0,.5);line-height:1";
      histBtn.style.position = "relative";
      histBtn.appendChild(badge);
    }

    if (count > 0) {
      badge.textContent = count > 99 ? "99+" : String(count);
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }
}

/* ============================================================
   🚀 Boot + UI handlers
   ============================================================ */
window.chart = new AdvancedTradingChart();

// time selector (compensation + custom)
const timeSelector = document.getElementById("timeSelector");
const timeDropdown = document.getElementById("timeDropdown");
const timeDisplay = document.getElementById("timeDisplay");
const tabCompensation = document.getElementById("tabCompensation");
const tabCustom = document.getElementById("tabCustom");
const compensationList = document.getElementById("compensationList");

const amountDisplay = document.getElementById("amountDisplay");
const amountContainer = document.getElementById("amountContainer");

let isEditingTime = false;
let savedTimeValue = "00:05";

if (timeSelector && timeDropdown && timeDisplay && tabCompensation && tabCustom && compensationList) {
  timeSelector.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!isEditingTime) timeDropdown.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    timeDropdown.classList.remove("show");
    if (isEditingTime) {
      timeDisplay.textContent = savedTimeValue;
      isEditingTime = false;
    }
  });

  timeDropdown.addEventListener("click", (e) => e.stopPropagation());

  tabCompensation.addEventListener("click", () => {
    tabCompensation.classList.add("active");
    tabCustom.classList.remove("active");
    compensationList.style.display = "grid";
    if (isEditingTime) {
      timeDisplay.textContent = savedTimeValue;
      isEditingTime = false;
    }
  });

  tabCustom.addEventListener("click", () => {
    tabCustom.classList.add("active");
    tabCompensation.classList.remove("active");
    compensationList.style.display = "none";
    isEditingTime = true;

    const editVal = savedTimeValue.replace(":", "");
    timeDisplay.textContent = editVal;

    setTimeout(() => {
      timeDisplay.focus();
      try {
        const range = document.createRange();
        range.selectNodeContents(timeDisplay);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) {}
    }, 30);
  });

  compensationList.addEventListener("click", (e) => {
    if (e.target.classList.contains("dropdown-item")) {
      savedTimeValue = e.target.textContent;
      timeDisplay.textContent = savedTimeValue;
      chart.selectedTime = parseInt(e.target.getAttribute("data-sec"), 10);
      timeDropdown.classList.remove("show");
    }
  });

  timeDisplay.addEventListener("input", (e) => {
    if (isEditingTime) {
      let v = e.target.textContent.replace(/[^0-9]/g, "");
      if (v.length > 4) v = v.slice(0, 4);

      const sel = window.getSelection();
      const pos = sel.focusOffset;
      e.target.textContent = v;

      try {
        if (e.target.firstChild) {
          const r = document.createRange();
          r.setStart(e.target.firstChild, Math.min(pos, v.length));
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);
        }
      } catch (_) {}
    }
  });

  timeDisplay.addEventListener("blur", () => {
    if (isEditingTime) {
      let v = timeDisplay.textContent.replace(/[^0-9]/g, "");
      if (v.length === 0) v = "0005";
      v = v.padStart(4, "0");

      const h = v.slice(0, 2);
      const m = v.slice(2, 4);
      savedTimeValue = `${h}:${m}`;
      timeDisplay.textContent = savedTimeValue;

      const totalSec = parseInt(h, 10) * 60 + parseInt(m, 10);
      chart.selectedTime = totalSec > 0 ? totalSec : 5;
      isEditingTime = false;
    }
  });

  timeDisplay.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.blur();
    }
  });
}

// amount input
if (amountDisplay && amountContainer) {
  amountContainer.addEventListener("click", () => amountDisplay.focus());

  amountDisplay.addEventListener("focus", function () {
    const v = String(this.value || "").replace("$", "");
    this.value = v;
    setTimeout(() => {
      try {
        this.setSelectionRange(0, this.value.length);
      } catch (_) {}
    }, 10);
  });

  amountDisplay.addEventListener("input", function () {
    this.value = String(this.value || "").replace(/[^0-9]/g, "");
  });

  amountDisplay.addEventListener("blur", function () {
    const val = parseFloat(this.value) || 50;
    this.value = val + "$";
  });

  amountDisplay.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.blur();
    }
  });
}

// buy / sell
const buyBtn = document.getElementById("buyBtn");
const sellBtn = document.getElementById("sellBtn");
if (buyBtn) buyBtn.addEventListener("click", () => chart.openTrade("buy"));
if (sellBtn) sellBtn.addEventListener("click", () => chart.openTrade("sell"));

console.log("🚀 QT Trading Chart — script_fixed.js loaded ✅");
