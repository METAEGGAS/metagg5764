
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, where, serverTimestamp, doc, getDoc, setDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

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
   💉 حقن CSS مربع تبديل الحسابات + وقت مخصص
   ============================================================ */
(function injectAccMenuStyles() {
  if (document.getElementById('qtAccMenuCSS')) return;
  const st = document.createElement('style');
  st.id = 'qtAccMenuCSS';
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
    @keyframes qtMenuIn{
      from{opacity:0;transform:translateY(-8px) scale(.97)}
      to{opacity:1;transform:translateY(0) scale(1)}
    }
    .qt-acc-switch{display:flex;gap:7px;background:#0d1117;border-radius:10px;padding:4px;margin-bottom:11px;}
    .qt-sw-btn{
      flex:1;padding:8px 4px;border-radius:8px;font-size:11px;font-weight:900;letter-spacing:.4px;
      transition:.2s;border:1.5px solid transparent;
      display:flex;align-items:center;justify-content:center;gap:5px;
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
      border-radius:10px;padding:10px;font-size:12px;font-weight:1000;color:#fff;
      letter-spacing:.5px;cursor:pointer;box-shadow:0 4px 14px rgba(66,153,225,.35);
      transition:.2s;border:none;
    }
    .qt-refill-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(66,153,225,.45)}
    .qt-refill-btn:active{transform:scale(.97)}
    #timeDisplay{caret-color:#fff !important;outline:none !important;}
    #timeDisplay:focus{border-color:rgba(255,255,255,.35) !important;}
    #_qtRoleBadge{display:none !important;opacity:0 !important;visibility:hidden !important;}
  `;
  document.head.appendChild(st);
})();

/* ============================================================
   🔐 AuthManager
   ============================================================ */
class AuthManager {
  constructor() {
    this.user              = null;
    this.unsubscribeBalance = null;
    this.balanceEl         = document.getElementById("userBalance");
    this.activeAccount     = 'demo';
    this.realBalance       = 0;
    this.demoBalance       = 10000;
    this.menuVisible       = false;
    this.balancesReady     = false;

    try {
      const ls = localStorage.getItem('qt_demo_balance');
      const v  = ls !== null ? parseFloat(ls) : NaN;
      if (Number.isFinite(v)) this.demoBalance = Math.max(0, v);
    } catch(e) {}

    this.initMenuUI();
    this.init();
  }

  _fmtMoney(n) {
    try {
      return '$' + new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
      }).format(n);
    } catch(e) {
      return '$' + (Math.round(n * 100) / 100).toFixed(2);
    }
  }

  async setBalance(type, amount, { persist = true } = {}) {
    const safeAmt = Math.max(0, Number(amount) || 0);
    if (type === 'real') this.realBalance = safeAmt;
    else                 this.demoBalance = safeAmt;

    const realEl = document.getElementById('qtRealAmt');
    const demoEl = document.getElementById('qtDemoAmt');
    if (realEl) realEl.textContent = this._fmtMoney(this.realBalance);
    if (demoEl) demoEl.textContent = this._fmtMoney(this.demoBalance);

    if (this.balanceEl) {
      const showAmt = (this.activeAccount === 'real') ? this.realBalance : this.demoBalance;
      this.balanceEl.textContent = this._fmtMoney(showAmt);
    }
    const balAmount = document.getElementById('balAmount');
    if (balAmount) {
      const showAmt = (this.activeAccount === 'real') ? this.realBalance : this.demoBalance;
      balAmount.textContent = this._fmtMoney(showAmt);
    }

    if (type === 'demo' && !this.user) {
      try { localStorage.setItem('qt_demo_balance', String(safeAmt)); } catch(e) {}
    }

    if (persist && this.user) {
      const userRef = doc(db, 'users', this.user.email);
      const payload = (type === 'real')
        ? { realBalance: safeAmt, balance: safeAmt }
        : { demoBalance: safeAmt };
      updateDoc(userRef, payload).catch(e => console.warn('⚠️ Firebase balance sync:', e));
    }
  }

  initMenuUI() {
    const balEl = this.balanceEl;
    if (!balEl) return;
    const wrap = balEl.parentElement;
    if (!wrap) return;
    wrap.classList.add('qt-bal-wrap');

    const menu = document.createElement('div');
    menu.id        = 'qtAccMenu';
    menu.className = 'qt-acc-menu';
    menu.innerHTML = `
      <div class="qt-acc-switch">
        <button class="qt-sw-btn qt-live active" data-acc="live">● LIVE</button>
        <button class="qt-sw-btn qt-demo" data-acc="demo">◆ Demo</button>
      </div>
      <div class="qt-acc-item active" data-type="real">
        <div class="qt-acc-left">
          <img class="qt-acc-ico" src="https://flagcdn.com/us.svg" onerror="this.style.display='none'">
          <div class="qt-acc-info">
            <span class="qt-acc-label">Real Account</span>
            <span class="qt-acc-amt" id="qtRealAmt">$0.00</span>
          </div>
        </div>
        <span class="qt-acc-badge live">LIVE</span>
      </div>
      <div class="qt-acc-item" data-type="demo">
        <div class="qt-acc-left">
          <img class="qt-acc-ico" src="https://flagcdn.com/us.svg" onerror="this.style.display='none'">
          <div class="qt-acc-info">
            <span class="qt-acc-label">Demo Account</span>
            <span class="qt-acc-amt" id="qtDemoAmt">$10,000.00</span>
          </div>
        </div>
        <span class="qt-acc-badge demo">DEMO</span>
      </div>
      <button class="qt-refill-btn" id="qtRefillBtn">🔄 Refill Demo Account</button>
    `;
    wrap.appendChild(menu);

    this.setBalance('real', this.realBalance, { persist: false });
    this.setBalance('demo', this.demoBalance, { persist: false });
    this.switchAccount(this.activeAccount);

    wrap.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target.closest('#qtAccMenu')) return;
      this.toggleMenu();
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.qt-bal-wrap')) this.closeMenu();
    });

    menu.querySelectorAll('.qt-sw-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.dataset.acc === 'live' ? 'real' : 'demo';
        this.switchAccount(type);
        menu.querySelectorAll('.qt-sw-btn').forEach(b => b.classList.toggle('active', b === btn));
        menu.querySelectorAll('.qt-acc-item').forEach(it => it.classList.toggle('active', it.dataset.type === type));
      });
    });

    menu.querySelectorAll('.qt-acc-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = item.dataset.type;
        this.switchAccount(type);
        menu.querySelectorAll('.qt-acc-item').forEach(i => i.classList.toggle('active', i === item));
        menu.querySelectorAll('.qt-sw-btn').forEach(b => {
          b.classList.toggle('active', (b.dataset.acc === 'live' && type === 'real') || (b.dataset.acc === 'demo' && type === 'demo'));
        });
        this.closeMenu();
      });
    });

    const refillBtn = document.getElementById('qtRefillBtn');
    if (refillBtn) {
      refillBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setBalance('demo', 10000, { persist: true });
        refillBtn.textContent = '✅ Refilled!';
        setTimeout(() => { refillBtn.textContent = '🔄 Refill Demo Account'; }, 1500);
      });
    }
  }

  toggleMenu() {
    const menu = document.getElementById('qtAccMenu');
    if (!menu) return;
    this.menuVisible = !this.menuVisible;
    menu.classList.toggle('show', this.menuVisible);
  }

  closeMenu() {
    const menu = document.getElementById('qtAccMenu');
    if (!menu) return;
    this.menuVisible = false;
    menu.classList.remove('show');
  }

  switchAccount(type) {
    this.activeAccount = type;
    if (!this.balanceEl) return;
    const showAmt = type === 'real' ? this.realBalance : this.demoBalance;
    this.balanceEl.textContent = this._fmtMoney(showAmt);
    const balAmount = document.getElementById('balAmount');
    if (balAmount) balAmount.textContent = this._fmtMoney(showAmt);
    try {
      if (window.chart && typeof window.chart._refreshTradeBadge === 'function') {
        window.chart._refreshTradeBadge();
      }
    } catch(e) {}
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
        if (this.balanceEl) {
          const showAmt = (this.activeAccount === 'real') ? this.realBalance : this.demoBalance;
          this.balanceEl.textContent = this._fmtMoney(showAmt);
        }
        window.dispatchEvent(new CustomEvent('qt_history_loaded', { detail: [] }));
      }
    });
  }

  async loadUserBalance() {
    const userRef  = doc(db, "users", this.user.email);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: this.user.email,
        realBalance: 0,
        demoBalance: 10000,
        balance: 0,
        createdAt: serverTimestamp()
      }, { merge: true });
    } else {
      const d = userSnap.data() || {};
      const migrateReal = (d.realBalance === undefined && d.balance !== undefined);
      const migrateDemo = (d.demoBalance === undefined);
      if (migrateReal || migrateDemo) {
        await setDoc(userRef, {
          realBalance: d.realBalance !== undefined ? d.realBalance : (d.balance || 0),
          demoBalance: d.demoBalance !== undefined ? d.demoBalance : 10000,
          balance: d.balance !== undefined ? d.balance : (d.realBalance || 0)
        }, { merge: true });
      }
    }

    if (this.unsubscribeBalance) {
      try { this.unsubscribeBalance(); } catch(e) {}
      this.unsubscribeBalance = null;
    }

    this.unsubscribeBalance = onSnapshot(userRef, (d) => {
      const data = d.data();
      if (!data) return;
      this.realBalance   = (data.realBalance !== undefined) ? data.realBalance : (data.balance || 0);
      this.demoBalance   = (data.demoBalance !== undefined) ? data.demoBalance : 10000;
      this.balancesReady = true;

      const realEl = document.getElementById('qtRealAmt');
      const demoEl = document.getElementById('qtDemoAmt');
      if (realEl) realEl.textContent = this._fmtMoney(this.realBalance);
      if (demoEl) demoEl.textContent = this._fmtMoney(this.demoBalance);
      if (this.balanceEl) {
        const showAmt = (this.activeAccount === 'real') ? this.realBalance : this.demoBalance;
        this.balanceEl.textContent = this._fmtMoney(showAmt);
      }
      const balAmount = document.getElementById('balAmount');
      if (balAmount) {
        const showAmt = (this.activeAccount === 'real') ? this.realBalance : this.demoBalance;
        balAmount.textContent = this._fmtMoney(showAmt);
      }
      try { localStorage.setItem('qt_demo_balance', String(this.demoBalance)); } catch(e) {}
    });
  }

  async updateBalance(type, amount) {
    if (!this.user) return;
    const userRef  = doc(db, "users", this.user.email);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data  = userSnap.data() || {};
      const field = type === 'real' ? 'realBalance' : 'demoBalance';
      const currentBalance = (data[field] !== undefined)
        ? data[field]
        : (type === 'real' ? (data.balance || 0) : 10000);
      const next    = currentBalance + amount;
      const payload = {};
      payload[field] = next;
      if (type === 'real') payload.balance = next;
      await updateDoc(userRef, payload);
    }
  }
}

/* ============================================================
   💾 LocalStorageManager
   ✅ BUG FIX: renamed ck→_ck and sk→_sk to match call sites
   ============================================================ */
class LocalStorageManager {
  constructor() {
    this.CANDLES_KEY   = 'qt_trading_candles';
    this.LAST_SYNC_KEY = 'qt_last_sync';
  }

  // ✅ FIX: were named ck/sk but called as _ck/_sk → now consistent
  _ck(pair) {
    return pair ? 'qt_trading_candles_' + pair.replace('/', '_') : this.CANDLES_KEY;
  }
  _sk(pair) {
    return pair ? 'qt_last_sync_' + pair.replace('/', '_') : this.LAST_SYNC_KEY;
  }

  saveCandles(candles, pair) {
    try {
      localStorage.setItem(this._ck(pair), JSON.stringify(candles));
      localStorage.setItem(this._sk(pair), Date.now().toString());
    } catch(e) { console.error('❌ Save error:', e); }
  }

  loadCandles(pair) {
    try {
      const data = localStorage.getItem(this._ck(pair));
      if (data) {
        const candles = JSON.parse(data);
        if (Array.isArray(candles) && candles.length > 0) return candles;
      }
    } catch(e) { console.error('❌ Load error:', e); }
    return null;
  }

  getLastSyncTime(pair) {
    const t = localStorage.getItem(this._sk(pair));
    return t ? parseInt(t) : 0;
  }

  clear(pair) {
    localStorage.removeItem(this._ck(pair));
    localStorage.removeItem(this._sk(pair));
  }
}

/* ============================================================
   🔥 FirebaseManager
   ✅ BUG FIX: added addPendingCandle() method
   ============================================================ */
class FirebaseManager {
  constructor() {
    this.db                = db;
    this.candlesCollection = 'candles';
    this.saveBatchSize     = 50;
    this.saveInterval      = 30000;
    this.lastSaveTime      = 0;
    this.pendingCandles    = [];
    this.isSaving          = false;
    this.startAutoSave();
  }

  setPair(pairName) {
    const key = 'candles_' + pairName.replace('/', '_');
    if (this.candlesCollection !== key) {
      this.candlesCollection = key;
      this.pendingCandles    = [];
      console.log('🔄 Firebase collection switched to:', key);
    }
  }

  // ✅ FIX: method was called but never defined
  addPendingCandle(candle) {
    if (!candle || typeof candle.timestamp !== 'number') return;
    this.pendingCandles.push({ ...candle });
  }

  async saveCandles(candles) {
    if (this.isSaving) { console.log('⏳ Save in progress...'); return false; }
    if (!candles || candles.length === 0) return false;
    try {
      this.isSaving  = true;
      const batch    = [];
      for (const candle of candles) {
        const candleData = {
          open: candle.open, high: candle.high,
          low: candle.low,   close: candle.close,
          timestamp: candle.timestamp, savedAt: serverTimestamp()
        };
        batch.push(candleData);
        if (batch.length >= this.saveBatchSize) {
          await this.saveBatch([...batch]);
          batch.length = 0;
          await this.delay(100);
        }
      }
      if (batch.length > 0) await this.saveBatch(batch);
      this.lastSaveTime = Date.now();
      return true;
    } catch(e) {
      console.error('❌ Save error:', e);
      return false;
    } finally {
      this.isSaving = false;
    }
  }

  async saveBatch(batch) {
    const promises = batch.map(cd => addDoc(collection(this.db, this.candlesCollection), cd));
    await Promise.all(promises);
  }

  async loadCandles(maxCandles = 10000) {
    try {
      console.log('📥 Loading from Firebase collection:', this.candlesCollection);
      const q             = query(
        collection(this.db, this.candlesCollection),
        orderBy('timestamp', 'desc'),
        limit(maxCandles)
      );
      const querySnapshot = await getDocs(q);
      const candles       = [];
      const seen          = new Set();
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!seen.has(data.timestamp)) {
          seen.add(data.timestamp);
          candles.push({
            open: data.open, high: data.high,
            low: data.low,   close: data.close,
            timestamp: data.timestamp
          });
        }
      });
      candles.reverse();
      console.log('✅ Loaded from Firebase:', candles.length, '(deduplicated)');
      return candles;
    } catch(e) {
      console.error('❌ Load error:', e);
      return null;
    }
  }

  async clearOldCandles(daysToKeep = 7) {
    try {
      // ✅ FIX: was `daysToKeep2460601000` (missing * operators)
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      const q = query(
        collection(this.db, this.candlesCollection),
        where('timestamp', '<', cutoffTime)
      );
      const snap = await getDocs(q);
      const dels = [];
      snap.forEach(d => dels.push(d.ref.delete ? d.ref.delete() : Promise.resolve()));
      await Promise.all(dels);
      console.log(`🗑️ Cleared ${dels.length} old candles`);
    } catch(e) { console.error('❌ clearOldCandles error:', e); }
  }

  startAutoSave() {
    setInterval(async () => {
      if (this.pendingCandles.length > 0 && !this.isSaving) {
        const candlesToSave  = [...this.pendingCandles];
        this.pendingCandles  = [];
        await this.saveCandles(candlesToSave);
      }
    }, this.saveInterval);
  }

  delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

/* ============================================================
   ⏰ updateLiveTime
   ✅ BUG FIX: restored missing * operators in time calculation
   ============================================================ */
function updateLiveTime() {
  const d = new Date();
  // ✅ FIX: was `d.getTimezoneOffset()60000` and `(33600000)` → fixed * operators
  const u = d.getTime() + d.getTimezoneOffset() * 60000;
  const t = new Date(u + (3 * 3600000));   // UTC+3
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
   ✅ FIXES:
     1. setup()          – restored this.w*dpr / this.h*dpr
     2. rndG()           – restored * operators in Box-Muller formula
     3. genCandle()      – restored all * operators → no more NaN prices
     4. tickSR()         – restored * operators for smooth range easing
     5. drawGrid()       – restored comparison operators
     6. getPriceRange()  – NEW method (was called but never defined)
     7. calcNiceGrid()   – NEW method (was called but never defined)
     8. getSpacing/getCandleWidth/indexToX/xToIndex/clampPan/snapToLive
     9. updateCurrentCandle() – proper implementation
    10. _fillAndSaveCandleGaps() – fixed garbled comparison
    11. switchPair()     – fixed bit-shift hash
   ============================================================ */
class AdvancedTradingChart {
  constructor() {
    this.plot             = document.getElementById("plot");
    this.canvas           = document.getElementById("chartCanvas");
    this.ctx              = this.canvas.getContext("2d");
    this.timeLabels       = document.getElementById("timeLabels");
    this.candleTimer      = document.getElementById("candleTimer");
    this.priceLine        = document.getElementById("priceLine");
    this.priceScaleLabels = document.getElementById("priceScaleLabels");
    this.currentPriceEl   = document.getElementById("currentPrice");
    this.loadingOverlay   = document.getElementById("loadingOverlay");
    this.authManager      = new AuthManager();
    this.localStorageManager = new LocalStorageManager();
    this.firebaseManager     = new FirebaseManager();

    this.PAIR_CONFIG = {
      'EUR/USD': { base: 1.9500, digits: 5, seed: 11001, volScale: 1 },
      'AUD/CAD': { base: 0.9100, digits: 5, seed: 22001, volScale: 0.95 },
      'AUD/CHF': { base: 0.5700, digits: 5, seed: 33001, volScale: 0.6 },
      'BHD/CNY': { base: 2.6500, digits: 4, seed: 44001, volScale: 2.7 },
      'EUR/RUB': { base: 98.000, digits: 3, seed: 55001, volScale: 100 },
      'KES/USD': { base: 0.0077, digits: 6, seed: 66001, volScale: 0.008 },
      'LBP/USD': { base: 0.0111, digits: 6, seed: 77001, volScale: 0.011 },
      'QAR/CNY': { base: 1.9800, digits: 5, seed: 88001, volScale: 2 },
      'USD/CHF': { base: 0.8900, digits: 5, seed: 99001, volScale: 0.9 },
      'SYP/TRY': { base: 0.2800, digits: 5, seed: 10501, volScale: 0.3 },
      'EGP/USD': { base: 0.0205, digits: 5, seed: 11501, volScale: 0.021 },
      'USD/INR': { base: 83.500, digits: 3, seed: 12501, volScale: 85 },
      'AED/CNY': { base: 1.9800, digits: 5, seed: 13501, volScale: 2 }
    };

    this.currentPair  = 'EUR/USD';
    this.isSwitching  = false;
    this.volScale     = 1;

    this.firebaseManager.setPair(this.currentPair);

    this.candles        = [];
    this.currentCandle  = null;
    this.maxCandles     = 10000;
    this.basePrice      = 1.95;
    this.currentPrice   = 1.9518;
    this.seed           = 11001;
    this.digits         = 5;
    this.priceRange     = { min: 1.9, max: 2 };

    // Zoom & pan
    this.baseSpacing   = 12;
    this.zoom          = 1;
    this.targetZoom    = 1;
    this.minZoom       = 0.425;
    this.maxZoom       = 2.25;
    this.zoomEase      = 0.28;
    this.targetOffsetX = 0;
    this.offsetX       = 0;
    this.panEase       = 0.38;
    this.velocity      = 0;
    this.drag          = 0;
    this.dragStartX    = 0;
    this.dragStartOffset = 0;
    this.lastDragX     = 0;
    this.lastDragTime  = 0;
    this.pinch         = 0;
    this.p0            = 0;
    this.pMidX         = 0;
    this.pMidY         = 0;

    // Smooth price range
    this.timeframe  = 60000;
    this.t0         = Math.floor(Date.now() / 60000) * 60000;
    this.smin       = null;
    this.smax       = null;
    this.sre        = 0.088;     // smoothing coefficient
    this._fr        = 0;

    this.markers      = [];
    this.selectedTime = 5;
    this.dataLoaded   = false;
    this.usingLocalStorage = false;

    this._tradeCounter    = 0;
    this._pendingTradeLoad = false;
    this._closedTrades    = [];

    // Master/Viewer sync
    this.uid              = 'uid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    this.isMaster         = false;
    this._masterBroadcastInterval = null;
    this._watchdogInterval        = null;
    this._liveUnsubscribe         = null;
    this._lastBroadcastedClose    = null;
    this.MASTER_TIMEOUT    = 12000;
    this.BROADCAST_INTERVAL = 1000;

    window.addEventListener('beforeunload', () => {
      if (this.isMaster) {
        try {
          const stateRef = doc(db, 'trading_live', this._getPairKey());
          updateDoc(stateRef, { masterUid: null, masterHeartbeat: 0 }).catch(() => {});
        } catch(e) {}
      }
    });

    this.setup();
    this.initData();
  }

  /* ---- Helpers ---- */
  _getPairKey() { return this.currentPair.replace('/', '_'); }
  _getLiveStateRef() { return doc(db, 'trading_live', this._getPairKey()); }

  _setRoleBadge(role) {
    let badge = document.getElementById('_qtRoleBadge');
    if (!badge) {
      badge     = document.createElement('div');
      badge.id  = '_qtRoleBadge';
      document.body.appendChild(badge);
    }
    badge.className  = role;
    badge.textContent = role === 'master' ? '👑 MASTER' : '👁️ VIEWER';
  }

  /* ============================================================
     Setup / Canvas resize
     ✅ FIX: this.w*dpr and this.h*dpr (was `this.wdpr` / `this.hdpr`)
     ============================================================ */
  setup() {
    const dpr = window.devicePixelRatio || 1;
    const r   = this.plot.getBoundingClientRect();
    this.w    = r.width;
    this.h    = r.height - 24;
    // ✅ FIX: restored multiplication
    this.canvas.width         = this.w * dpr;
    this.canvas.height        = this.h * dpr;
    this.canvas.style.width   = this.w + "px";
    this.canvas.style.height  = this.h + "px";
    this.ctx.scale(dpr, dpr);
    if (this.dataLoaded) {
      this.updatePriceLabel();
      this.updatePriceScale();
      this.updateTimeLabels();
    }
  }

  /* ============================================================
     Random helpers
     ✅ FIX: rndG – restored * operators in Box-Muller transform
     ============================================================ */
  rnd(s) {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  }

  rndG(s) {
    const u1 = this.rnd(s);
    const u2 = this.rnd(s + 100000);
    // ✅ FIX: was `Math.sqrt(-2Math.log(...))Math.cos(2Math.PIu2)`
    return Math.sqrt(-2 * Math.log(u1 + 0.00001)) * Math.cos(2 * Math.PI * u2);
  }

  /* ============================================================
     Candle generation
     ✅ FIX: restored ALL * operators → was producing NaN prices
     ============================================================ */
  genCandle(t, o) {
    const s  = this.seed + Math.floor(t / this.timeframe);
    // ✅ FIX: was `0.0008(this.volScale||1)` → restored *
    const vb = 0.0008 * (this.volScale || 1);
    const tb = 0.00005 * (this.volScale || 1);

    const r1 = this.rndG(s);
    const r2 = this.rndG(s + 1);
    const r3 = this.rndG(s + 2);
    const r4 = this.rnd(s + 3);
    const r5 = this.rnd(s + 4);
    const r6 = this.rnd(s + 5);

    // ✅ FIX: all * operators restored below
    const v  = vb * (0.7 + Math.abs(r1) * 0.8);
    const tr = tb * r2 * 0.6;
    const dir = r3 > 0 ? 1 : -1;
    const tc  = o + (dir * v + tr);
    const rg  = v * (0.2 + r4 * 0.6);
    const hm  = rg * (0.3 + r5 * 0.7);
    const lm  = rg * (0.3 + (1 - r5) * 0.7);
    const c   = +(tc + (r6 - 0.5) * v * 0.1).toFixed(this.digits);
    const op  = +o.toFixed(this.digits);

    return {
      open:  op,
      close: c,
      high:  +Math.max(op, c, op + hm, c + hm).toFixed(this.digits),
      low:   +Math.min(op, c, op - lm, c - lm).toFixed(this.digits),
      timestamp: t
    };
  }

  /* ---- Generate historical data ---- */
  initHistoricalData() {
    this.candles = [];
    let p = this.basePrice;
    let t = Date.now() - this.maxCandles * this.timeframe;
    for (let i = 0; i < this.maxCandles; i++) {
      const candle = this.genCandle(t, p);
      this.candles.push(candle);
      p = candle.close;
      t += this.timeframe;
    }
  }

  /* ---- Price range helpers ---- */

  // ✅ NEW: getPriceRange() was called everywhere but never defined
  getPriceRange() {
    if (this.smin !== null && this.smax !== null && this.smax > this.smin) {
      return { min: this.smin, max: this.smax };
    }
    return { ...this.priceRange };
  }

  updatePriceRange() {
    let v = [...this.candles];
    if (this.currentCandle &&
        (!v.length || this.currentCandle.timestamp !== v[v.length - 1].timestamp)) {
      v.push(this.currentCandle);
    }
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
    const lo = sl.map(c => c.low);
    const hi = sl.map(c => c.high);
    const mn = Math.min(...lo);
    const mx = Math.max(...hi);
    const pd = 0.15 * (mx - mn) || 0.000001;
    this.priceRange = { min: mn - pd, max: mx + pd };
  }

  /* ---- Smooth range tick ---- */
  // ✅ FIX: was `(r.min-this.smin)this.sre` → restored *
  tickSR() {
    const r = this.priceRange;
    if (this.smin === null) { this.smin = r.min; this.smax = r.max; return; }
    this.smin += (r.min - this.smin) * this.sre;
    this.smax += (r.max - this.smax) * this.sre;
  }

  /* ---- Nice grid calculation ---- */
  // ✅ NEW: calcNiceGrid() was called but never defined
  calcNiceGrid() {
    const pr    = this.getPriceRange();
    const range = pr.max - pr.min;
    if (range <= 0) return { min: pr.min, step: 0.0001, count: 10 };
    const roughStep = range / 8;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const niceSteps = [1, 2, 2.5, 5, 10];
    let step = magnitude;
    for (const ns of niceSteps) {
      const candidate = ns * magnitude;
      if (range / candidate <= 12) { step = candidate; break; }
    }
    const min   = Math.floor(pr.min / step) * step;
    const max   = Math.ceil(pr.max / step) * step;
    const count = Math.round((max - min) / step);
    return { min, step, count: Math.max(count, 1) };
  }

  /* ---- Coordinate helpers ---- */
  getSpacing()    { return this.baseSpacing * this.zoom; }
  getCandleWidth(){ return Math.max(1, this.getSpacing() * 0.7); }
  indexToX(i)    { return i * this.getSpacing() + this.offsetX; }
  xToIndex(x)    { return (x - this.offsetX) / this.getSpacing(); }

  priceToY(p) {
    const r = this.getPriceRange();
    const n = (p - r.min) / (r.max - r.min);
    return this.h * (1 - n);
  }

  clampPan() {
    const sp     = this.getSpacing();
    const maxOff = sp * 5;
    const minOff = -(this.candles.length + 2) * sp + this.w * 0.15;
    this.targetOffsetX = Math.max(minOff, Math.min(maxOff, this.targetOffsetX));
  }

  snapToLive() {
    const sp           = this.getSpacing();
    this.targetOffsetX = this.w - (this.candles.length + 3) * sp;
    this.offsetX       = this.targetOffsetX;
  }

  /* ---- Zoom ---- */
  applyZoomAround(mx, my, sc) {
    const oz = this.targetZoom;
    const nz = Math.max(this.minZoom, Math.min(this.maxZoom, oz * sc));
    if (Math.abs(nz - oz) < 0.0001) return;
    const idxAtMx = this.xToIndex(mx);
    this.targetZoom    = nz;
    this.targetOffsetX = mx - idxAtMx * this.getSpacing();
    this.clampPan();
  }

  tickZoom() {
    const d = this.targetZoom - this.zoom;
    if (Math.abs(d) > 0.0001) this.zoom += d * this.zoomEase;
    else                       this.zoom  = this.targetZoom;
  }

  /* ---- Pan ---- */
  updatePan() {
    const diff = this.targetOffsetX - this.offsetX;
    if (Math.abs(diff) > 0.3) this.offsetX += diff * this.panEase;
    else                      this.offsetX  = this.targetOffsetX;
    if (Math.abs(this.velocity) > 0.01) {
      this.targetOffsetX += this.velocity;
      this.velocity      *= 0.97;
      this.clampPan();
    } else {
      this.velocity = 0;
    }
  }

  /* ============================================================
     Master / Viewer system
     ============================================================ */
  async _initMasterViewerSystem() {
    try {
      const claimed = await this._tryClaimMaster();
      if (claimed) {
        this.isMaster = true;
        this.candles  = await this._fillAndSaveCandleGaps(this.candles);
        this._startMasterBroadcast();
        this._setRoleBadge('master');
        console.log('👑 أنا الماستر - أبث الشمعة الحية');
      } else {
        this.isMaster = false;
        this._startViewerSubscription();
        this._startWatchdog();
        this._setRoleBadge('viewer');
        console.log('👁️ أنا مشاهد - أستقبل من الماستر');
      }
    } catch(e) {
      console.error('❌ _initMasterViewerSystem error:', e);
      this.isMaster = true;
      this._startMasterBroadcast();
      this._setRoleBadge('master');
    }
  }

  async _tryClaimMaster() {
    try {
      const stateRef = this._getLiveStateRef();
      const snap     = await getDoc(stateRef);
      if (!snap.exists()) {
        await setDoc(stateRef, {
          masterUid:      this.uid,
          masterHeartbeat: Date.now(),
          liveCandle:     null,
          liveT0:         this.t0,
          pair:           this.currentPair
        });
        console.log('👑 استُولي على الماستر (مستند جديد)');
        return true;
      }
      const data    = snap.data();
      const hb      = data.masterHeartbeat || 0;
      const isAlive = (Date.now() - hb) < this.MASTER_TIMEOUT;
      if (isAlive && data.masterUid && data.masterUid !== this.uid) {
        console.log('👁️ ماستر حي موجود:', data.masterUid);
        return false;
      }
      await setDoc(stateRef, {
        masterUid:      this.uid,
        masterHeartbeat: Date.now(),
        liveT0:         this.t0,
        pair:           this.currentPair
      }, { merge: true });
      console.log('👑 استُولي على الماستر (انتهت صلاحية القديم)');
      return true;
    } catch(e) {
      console.error('❌ _tryClaimMaster error:', e);
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
        await setDoc(stateRef, {
          masterUid:       this.uid,
          masterHeartbeat: Date.now(),
          liveCandle:      { ...this.currentCandle },
          liveT0:          this.t0,
          liveUpdatedAt:   Date.now(),
          pair:            this.currentPair
        }, { merge: true });
      } catch(e) { console.warn('⚠️ Broadcast error:', e); }
    }, this.BROADCAST_INTERVAL);
  }

  _startViewerSubscription() {
    if (this._liveUnsubscribe) { this._liveUnsubscribe(); this._liveUnsubscribe = null; }
    const stateRef = this._getLiveStateRef();
    this._liveUnsubscribe = onSnapshot(stateRef, (snap) => {
      if (!snap.exists() || this.isMaster || this.isSwitching) return;
      const data = snap.data();
      if (data.liveT0 && data.liveT0 !== this.t0 && this.t0 > 0) {
        if (this.currentCandle &&
            (!this.candles.length || this.currentCandle.timestamp !== this.candles[this.candles.length - 1].timestamp)) {
          const completed = { ...this.currentCandle };
          this.candles.push(completed);
          if (this.candles.length > this.maxCandles) this.candles.shift();
          this.localStorageManager.saveCandles(this.candles, this.currentPair);
        }
      }
      if (data.liveT0)    this.t0           = data.liveT0;
      if (data.liveCandle) {
        this.currentCandle = { ...data.liveCandle };
        this.currentPrice  = data.liveCandle.close;
        window.__qt_price  = this.currentPrice;
      }
    }, (err) => { console.warn('⚠️ onSnapshot viewer error:', err); });
  }

  _startWatchdog() {
    if (this._watchdogInterval) clearInterval(this._watchdogInterval);
    this._watchdogInterval = setInterval(async () => {
      if (this.isMaster || this.isSwitching) return;
      try {
        const stateRef = this._getLiveStateRef();
        const snap     = await getDoc(stateRef);
        if (!snap.exists()) { await this._becomeMaster(); return; }
        const data    = snap.data();
        const hb      = data.masterHeartbeat || 0;
        const isAlive = (Date.now() - hb) < this.MASTER_TIMEOUT;
        if (!isAlive) {
          console.log('🔄 الماستر مات، أتولى القيادة');
          await this._becomeMaster();
        }
      } catch(e) { console.warn('⚠️ Watchdog error:', e); }
    }, this.MASTER_TIMEOUT / 2);
  }

  async _becomeMaster() {
    if (this._liveUnsubscribe) { this._liveUnsubscribe(); this._liveUnsubscribe = null; }
    if (this._watchdogInterval) { clearInterval(this._watchdogInterval); this._watchdogInterval = null; }
    this.isMaster = true;
    this._lastBroadcastedClose = null;
    this._startMasterBroadcast();
    this._setRoleBadge('master');
    console.log('👑 أصبحت الماستر الجديد');
  }

  async _cleanupMasterViewer() {
    if (this._masterBroadcastInterval) { clearInterval(this._masterBroadcastInterval); this._masterBroadcastInterval = null; }
    if (this._watchdogInterval)        { clearInterval(this._watchdogInterval);         this._watchdogInterval = null; }
    if (this._liveUnsubscribe)         { this._liveUnsubscribe();                        this._liveUnsubscribe = null; }
    if (this.isMaster) {
      try {
        const stateRef = this._getLiveStateRef();
        await updateDoc(stateRef, { masterUid: null, masterHeartbeat: 0 }).catch(() => {});
      } catch(e) {}
    }
    this.isMaster              = false;
    this._lastBroadcastedClose = null;
  }

  /* ============================================================
     Fill gaps in candle history
     ✅ FIX: garbled comparison operators restored
     ============================================================ */
  async _fillAndSaveCandleGaps(candles) {
    if (!candles || candles.length === 0) return candles || [];
    const lastCandle  = candles[candles.length - 1];
    const lastTs      = lastCandle.timestamp;
    const currentT0   = Math.floor(Date.now() / this.timeframe) * this.timeframe;

    // ✅ FIX: `if(currentT0 < lastTs)` was garbled
    if (currentT0 <= lastTs) return candles;

    const gaps = [];
    let prevClose = lastCandle.close;
    for (let ts = lastTs + this.timeframe; ts < currentT0; ts += this.timeframe) {
      const gap = this.genCandle(ts, prevClose);
      gaps.push(gap);
      prevClose = gap.close;
      if (gaps.length > 5000) break;   // safety limit
    }

    if (gaps.length > 0) {
      console.log(`🔧 Filling ${gaps.length} gap candles`);
      try {
        await this.firebaseManager.saveCandles(gaps);
        console.log(`✅ ${gaps.length} شمعة فجوة تم حفظها في Firebase`);
      } catch(e) {
        console.warn('⚠️ Gap candle save error:', e);
        gaps.forEach(c => this.firebaseManager.addPendingCandle(c));
      }
      const result = [...candles, ...gaps];
      if (result.length > this.maxCandles) return result.slice(result.length - this.maxCandles);
      return result;
    }
    return candles;
  }

  /* ============================================================
     Init data
     ============================================================ */
  async initData() {
    this.showLoading(true);
    try {
      console.log('📄 Loading from Firebase collection:', this.firebaseManager.candlesCollection);
      const firebaseCandles = await this.firebaseManager.loadCandles(this.maxCandles);

      if (firebaseCandles && firebaseCandles.length > 0) {
        console.log('✅ Using Firebase data');
        this.candles          = firebaseCandles;
        this.usingLocalStorage = false;
        this.localStorageManager.saveCandles(this.candles, this.currentPair);
      } else {
        console.log('⚠️ No Firebase data, trying local...');
        const localCandles = this.localStorageManager.loadCandles(this.currentPair);
        if (localCandles && localCandles.length > 0) {
          console.log('✅ Using local data');
          this.candles           = localCandles;
          this.usingLocalStorage = true;
        } else {
          console.log('🔨 Generating new data...');
          this.initHistoricalData();
          this.usingLocalStorage = true;
        }
      }

      if (this.candles.length > 0) this.currentPrice = this.candles[this.candles.length - 1].close;

      this.snapToLive();
      this.updatePriceRange();
      this.smin = this.priceRange.min;
      this.smax = this.priceRange.max;
      this.updatePriceScale();
      this.updateTimeLabels();
      this.updatePriceLabel();
      this.dataLoaded = true;

      if (window.tradeHistory) window.tradeHistory.setTrades([]);
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
    } catch(e) {
      console.error('❌ Init error:', e);
      this.initHistoricalData();
      this.usingLocalStorage = true;
      this.dataLoaded        = true;
      this.isMaster          = true;
      this._startMasterBroadcast();
      this._setRoleBadge('master');
      if (this.candles.length > 0) this.currentPrice = this.candles[this.candles.length - 1].close;
      this.snapToLive();
      this.updatePriceRange();
      this.smin = this.priceRange.min;
      this.smax = this.priceRange.max;
      this.initEvents();
      this.startRealtime();
      this.loop();
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(show) {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.toggle('show', show);
    }
  }

  /* ============================================================
     Drawing
     ============================================================ */
  drawGrid() {
    const { min, step, count } = this.calcNiceGrid();
    // Horizontal lines
    for (let i = 0; i <= count; i++) {
      const p = min + i * step;
      const y = this.priceToY(p);
      // ✅ FIX: comparison was garbled
      if (y < -5 || y > this.h + 5) continue;
      const mj = i % 5 === 0;
      this.ctx.strokeStyle = mj ? "rgba(255,215,0,.12)" : "rgba(255,255,255,.05)";
      this.ctx.lineWidth   = mj ? 1 : 0.8;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y + 0.5);
      this.ctx.lineTo(this.w, y + 0.5);
      this.ctx.stroke();
    }
    // Vertical lines
    const visC   = this.w / this.getSpacing();
    const targetL = 9;
    const stepC   = Math.max(1, Math.round(visC / targetL));
    const s       = Math.floor(this.xToIndex(0));
    const e       = Math.ceil(this.xToIndex(this.w));
    for (let i = s; i <= e; i++) {
      if (i % stepC !== 0) continue;
      const x = this.indexToX(i);
      if (x < -5 || x > this.w + 5) continue;
      const mj = i % Math.round(stepC * 5) === 0;
      this.ctx.strokeStyle = mj ? "rgba(255,215,0,.12)" : "rgba(255,255,255,.05)";
      this.ctx.lineWidth   = mj ? 1 : 0.8;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 0.5, 0);
      this.ctx.lineTo(x + 0.5, this.h);
      this.ctx.stroke();
    }
  }

  updateTimeLabels() {
    const tl    = this.timeLabels;
    if (!tl) return;
    tl.innerHTML = "";
    const visC   = this.w / this.getSpacing();
    const targetL = 9;
    const stepC   = Math.max(1, Math.round(visC / targetL));
    const s       = Math.floor(this.xToIndex(0));
    const e       = Math.ceil(this.xToIndex(this.w));
    const tS      = this.candles.length ? this.candles[0].timestamp : this.t0;

    for (let i = s; i <= e; i++) {
      if (i % stepC !== 0) continue;
      const x = this.indexToX(i);
      if (x < -5 || x > this.w - 5) continue;
      const t  = tS + i * this.timeframe;
      const d  = new Date(t);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const lb = document.createElement("div");
      lb.className = "timeLabel";
      if (i % Math.round(stepC * 5) === 0) lb.classList.add("major");
      lb.style.left   = x + "px";
      lb.textContent  = `${hh}:${mm}`;
      tl.appendChild(lb);
    }
  }

  updatePriceScale() {
    if (!this.priceScaleLabels) return;
    const { min, step, count } = this.calcNiceGrid();
    let h = "";
    for (let i = 0; i <= count; i++) {
      const p = min + i * step;
      const y = this.priceToY(p);
      if (y < -8 || y > this.h + 8) continue;
      const mj = i % 5 === 0;
      h += `<span class="priceLabel${mj ? ' major' : ''}" style="top:${y}px">${p.toFixed(this.digits)}</span>`;
    }
    this.priceScaleLabels.innerHTML = h;
  }

  updatePriceLabel() {
    if (!this.priceLine || !this.currentPriceEl) return;
    const py = this.priceToY(this.currentPrice);
    this.priceLine.style.top        = py + "px";
    this.currentPriceEl.style.top   = py + "px";
    this.currentPriceEl.textContent = this.currentPrice.toFixed(this.digits);
  }

  updateCandleTimer() {
    if (!this.currentCandle || !this.candleTimer) return;
    const n = Date.now();
    const e = n - this.t0;
    const r = this.timeframe - e;
    const s = Math.max(0, Math.floor(r / 1000));
    this.candleTimer.textContent  = s;
    const cx = this.indexToX(this.candles.length);
    this.candleTimer.style.left   = (cx + 15) + "px";
    this.candleTimer.style.top    = "10px";
    this.candleTimer.style.display = 'block';
  }

  drawCandle(c, x, glow) {
    if (!c || isNaN(c.open) || isNaN(c.close)) return;  // ✅ Guard against NaN
    const oy = this.priceToY(c.open);
    const cy = this.priceToY(c.close);
    const hy = this.priceToY(c.high);
    const ly = this.priceToY(c.low);
    const b  = c.close >= c.open;
    const w  = this.getCandleWidth();

    // Wick
    this.ctx.strokeStyle = b ? "#0f0" : "#f00";
    this.ctx.lineWidth   = Math.max(1, 0.18 * w);
    this.ctx.beginPath();
    this.ctx.moveTo(x, hy);
    this.ctx.lineTo(x, ly);
    this.ctx.stroke();

    // Body
    const bh = Math.max(1, Math.abs(cy - oy));
    const bt = Math.min(oy, cy);
    const g  = this.ctx.createLinearGradient(x, bt, x, bt + bh);
    if (b) { g.addColorStop(0, "#0f0"); g.addColorStop(0.5, "#0f0"); g.addColorStop(1, "#0c0"); }
    else   { g.addColorStop(0, "#f00"); g.addColorStop(0.5, "#f00"); g.addColorStop(1, "#c00"); }
    this.ctx.fillStyle = g;
    if (glow) { this.ctx.shadowColor = b ? "rgba(0,255,0,.8)" : "rgba(255,0,0,.8)"; this.ctx.shadowBlur = 12; }
    this.ctx.fillRect(x - w / 2, bt, w, bh);
    if (glow) this.ctx.shadowBlur = 0;
  }

  addMarker(t, tradeId, account) {
    const op = this.currentPrice;
    const c  = this.currentCandle;
    if (!c) return;
    const bt = Math.max(c.open, c.close);
    const bb = Math.min(c.open, c.close);
    let fp   = op;
    if (op > bt) fp = bt;
    else if (op < bb) fp = bb;

    const m = {
      tradeId,
      type:    t,
      price:   fp,
      entry:   op,
      candleIndex: this.candles.length,
      candleTimestamp: this.t0,
      account: account || 'demo',
      closed:  false,
      profitLoss: null
    };
    this.markers.push(m);
  }

  drawMarker(m) {
    const x = this.indexToX(m.candleIndex);
    if (x < -100 || x > this.w + 50) return;
    const y  = this.priceToY(m.price);
    const w  = this.getCandleWidth();
    const ib = m.type === "buy";
    const cl = ib ? "#16a34a" : "#ff3b3b";
    const r  = 5.5;

    this.ctx.save();
    this.ctx.shadowColor = cl;
    this.ctx.shadowBlur  = 9;
    this.ctx.fillStyle   = cl;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Arrow icon
    this.ctx.fillStyle = "#fff";
    this.ctx.save();
    this.ctx.translate(x, y);
    if (!ib) this.ctx.rotate(Math.PI);
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

    // Horizontal line
    const lx  = x + w / 2 + 3;
    const lw  = Math.min(95, this.w - lx - 22);
    this.ctx.strokeStyle = ib ? "rgba(22,163,74,.7)" : "rgba(255,59,59,.7)";
    this.ctx.lineWidth   = 1.2;
    this.ctx.beginPath();
    this.ctx.moveTo(x + w / 2, y);
    this.ctx.lineTo(lx, y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(lx, y);
    this.ctx.lineTo(lx + lw, y);
    this.ctx.stroke();

    // End circle
    const ex = lx + lw;
    const er = 5;
    this.ctx.strokeStyle = cl;
    this.ctx.lineWidth   = 2;
    this.ctx.fillStyle   = "#fff";
    this.ctx.beginPath();
    this.ctx.arc(ex, y, er, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();

    // P/L label
    if (m.closed && m.profitLoss !== null) {
      const pl     = m.profitLoss;
      const isWin  = pl >= 0;
      const plText = isWin ? `+$${this._fmtBal(pl)}` : `-$${this._fmtBal(Math.abs(pl))}`;
      const plColor = isWin ? '#00ff41' : '#ff3b3b';
      const bgColor = isWin ? 'rgba(0,255,65,0.18)' : 'rgba(255,59,59,0.18)';
      const textX   = ex + er + 4;

      this.ctx.font      = 'bold 11.5px Arial';
      const tw           = this.ctx.measureText(plText).width;
      this.ctx.fillStyle = bgColor;
      this.ctx.fillRect(textX - 3, y - 10, tw + 10, 17);
      this.ctx.strokeStyle = plColor;
      this.ctx.lineWidth   = 0.8;
      this.ctx.strokeRect(textX - 3, y - 10, tw + 10, 17);
      this.ctx.fillStyle   = plColor;
      this.ctx.shadowColor = plColor;
      this.ctx.shadowBlur  = 4;
      this.ctx.fillText(plText, textX + 2, y + 3);
      this.ctx.shadowBlur  = 0;
    }
    this.ctx.restore();
  }

  /* ---- Main draw loop ---- */
  draw() {
    this.tickZoom();
    this.updatePan();
    this.updatePriceRange();
    this.tickSR();
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.drawGrid();

    // Historical candles
    for (let i = 0; i < this.candles.length; i++) {
      const x = this.indexToX(i);
      if (x < -60 || x > this.w + 60) continue;
      this.drawCandle(this.candles[i], x, false);
    }

    // Live candle
    if (this.currentCandle &&
        (!this.candles.length || this.currentCandle.timestamp !== this.candles[this.candles.length - 1].timestamp)) {
      const lx = this.indexToX(this.candles.length);
      if (lx >= -60 && lx <= this.w + 60) {
        this.drawCandle(this.currentCandle, lx, true);
      }
    }

    // Markers
    for (const m of this.markers) this.drawMarker(m);

    this.updatePriceLabel();
    this.updatePriceScale();
    this.updateTimeLabels();
    this.updateCandleTimer();
  }

  /* ---- Realtime candle update ---- */
  // ✅ NEW: proper updateCurrentCandle() implementation
  updateCurrentCandle() {
    if (!this.currentCandle) return;
    const n        = Date.now();
    const elapsed  = (n - this.t0) / this.timeframe;
    const lp       = this.currentCandle.open;
    const progress = Math.min(Math.max(elapsed, 0), 1);
    const target   = this.genCandle(this.t0, lp);

    this.currentCandle.close = +(lp + (target.close - lp) * progress).toFixed(this.digits);
    this.currentCandle.high  = +Math.max(
      this.currentCandle.open,
      this.currentCandle.close,
      lp + (target.high - lp) * progress
    ).toFixed(this.digits);
    this.currentCandle.low   = +Math.min(
      this.currentCandle.open,
      this.currentCandle.close,
      lp + (target.low - lp) * progress
    ).toFixed(this.digits);

    this.currentPrice    = this.currentCandle.close;
    window.__qt_price    = this.currentPrice;
  }

  startRealtime() {
    setInterval(() => {
      if (this.isSwitching) return;
      if (!this.isMaster) return;

      const n = Date.now();
      const e = n - this.t0;

      if (e >= this.timeframe) {
        if (this.currentCandle &&
            (!this.candles.length || this.currentCandle.timestamp !== this.candles[this.candles.length - 1].timestamp)) {
          const completedCandle = { ...this.currentCandle };
          this.candles.push(completedCandle);
          this.saveCompletedCandle(completedCandle);
          if (this.candles.length > this.maxCandles) this.candles.shift();
        }
        this.t0 = Math.floor(n / this.timeframe) * this.timeframe;
        const lp = this.currentCandle ? this.currentCandle.close : this.currentPrice;
        this.currentCandle       = this.genCandle(this.t0, lp);
        this.currentCandle.open  = lp;
        this.currentCandle.close = lp;
        this.currentCandle.high  = lp;
        this.currentCandle.low   = lp;
        this.currentPrice        = lp;
        this._lastBroadcastedClose = null;
      } else {
        this.updateCurrentCandle();
      }
    }, 200);

    setInterval(() => {
      if (!this.isSwitching && this.isMaster) {
        this.localStorageManager.saveCandles(this.candles, this.currentPair);
      }
    }, 10000);
  }

  async saveCompletedCandle(candle) {
    try { this.firebaseManager.addPendingCandle(candle); }
    catch(e) { console.error('❌ Queue error:', e); }
  }

  loop() {
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  /* ============================================================
     Switch pair
     ✅ FIX: restored bit-shift operator (h<<5) in hash function
     ============================================================ */
  async switchPair(pairName) {
    if (this.currentPair === pairName || this.isSwitching) return;
    console.log('🔀 Switching pair:', this.currentPair, '→', pairName);
    this.isSwitching = true;
    this.showLoading(true);
    try {
      await this._cleanupMasterViewer();
      this.currentPair = pairName;

      // ✅ FIX: was `((h0)` → restored `((h<<5)-h)+c.charCodeAt(0)`
      const cfg = this.PAIR_CONFIG[pairName] || {
        base: 1.0, digits: 5,
        seed: Math.abs(pairName.split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0)) % 99991 + 10001,
        volScale: 1
      };

      this.basePrice  = cfg.base;
      this.digits     = cfg.digits;
      this.seed       = cfg.seed;
      this.volScale   = cfg.volScale || 1;
      this.candles    = [];
      this.markers    = [];
      this.currentCandle = null;
      this.smin = null;
      this.smax = null;
      this.t0   = Math.floor(Date.now() / this.timeframe) * this.timeframe;
      this._lastBroadcastedClose = null;

      this.firebaseManager.setPair(pairName);

      const firebaseCandles = await this.firebaseManager.loadCandles(this.maxCandles);
      if (firebaseCandles && firebaseCandles.length > 0) {
        this.candles           = firebaseCandles;
        this.usingLocalStorage = false;
        this.localStorageManager.saveCandles(this.candles, pairName);
      } else {
        const localCandles = this.localStorageManager.loadCandles(pairName);
        if (localCandles && localCandles.length > 0) {
          this.candles           = localCandles;
          this.usingLocalStorage = true;
        } else {
          this.initHistoricalData();
          this.usingLocalStorage = true;
        }
      }

      if (this.candles.length > 0) this.currentPrice = this.candles[this.candles.length - 1].close;

      this.snapToLive();
      this.updatePriceRange();
      this.smin = this.priceRange.min;
      this.smax = this.priceRange.max;
      this.updatePriceScale();
      this.updateTimeLabels();
      this.updatePriceLabel();

      await this._initMasterViewerSystem();

      if (this.authManager.user) {
        this.loadOpenTrades();
        this.loadTradeHistory();
      }
    } catch(e) {
      console.error('❌ switchPair error:', e);
      try { this.initHistoricalData(); } catch(_) {}
    } finally {
      this.isSwitching = false;
      this.showLoading(false);
    }
  }

  /* ============================================================
     Balance helpers
     ============================================================ */
  _getActiveAcc() { return this.authManager.activeAccount || 'demo'; }

  _fmtBal(n) {
    try { return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n); }
    catch(e) { return (Math.round(n * 100) / 100).toFixed(2); }
  }

  _getBalanceFor(acc) {
    const a = acc || this._getActiveAcc();
    return a === 'real' ? (this.authManager.realBalance || 0) : (this.authManager.demoBalance || 0);
  }

  _setBalanceFor(acc, amount) {
    const a      = acc || this._getActiveAcc();
    const safeAmt = Math.max(0, Number(amount) || 0);
    this.authManager.setBalance(a, safeAmt, { persist: true });
  }

  /* ============================================================
     Open trade
     ============================================================ */
  openTrade(direction) {
    const acc = this._getActiveAcc();

    if (acc === 'real' && !this.authManager.user) {
      this._showMsg('سجّل الدخول لاستخدام الحساب الحقيقي ❌', '#dc2626');
      return;
    }
    if (this.authManager.user && !this.authManager.balancesReady) {
      this._showMsg('استنى تحميل الرصيد لحظة... ⏳', '#f59e0b');
      return;
    }

    const amountEl = document.getElementById('amountDisplay');
    const raw      = amountEl ? String(amountEl.value || '') : '';
    const rawVal   = raw.replace(/[^0-9.]/g, '');

    if (!rawVal || rawVal.trim() === '') {
      this._showMsg('اكتب مبلغ الصفقة الأول ❌', '#dc2626');
      return;
    }

    const amount = parseFloat(rawVal);
    if (!Number.isFinite(amount) || amount <= 0) {
      this._showMsg('مبلغ غير صحيح ❌', '#dc2626');
      return;
    }

    const balance = this._getBalanceFor(acc);
    if (amount > balance) {
      this._showMsg('الرصيد غير كافٍ ❌', '#dc2626');
      return;
    }

    const duration = this.selectedTime || 5;
    const tradeId  = `trade_${Date.now()}_${++this._tradeCounter}`;

    // Deduct from balance
    this._setBalanceFor(acc, balance - amount);

    const trade = {
      id:        tradeId,
      dir:       direction === 'buy' ? 'up' : 'down',
      entry:     this.currentPrice,
      stake:     amount,
      duration,
      account:   acc,
      pair:      this.currentPair,
      openedAt:  Date.now(),
      closeTime: Date.now() + duration * 1000,
      status:    'open',
      open:      true,
      markerCandleIndex:     this.candles.length,
      markerCandleTimestamp: this.t0
    };

    // Add to trade list UI
    if (window.tradeHistory) {
      const current = window.tradeHistory.getTrades ? window.tradeHistory.getTrades() : [];
      current.push(trade);
      window.tradeHistory.setTrades(current);
    }

    // Add marker on chart
    this.addMarker(trade.dir === 'up' ? 'buy' : 'sell', tradeId, acc);

    // Show notification
    const dirLabel = trade.dir === 'up' ? '🟢 BUY' : '🔴 SELL';
    this._showMsg(`${dirLabel} $${this._fmtBal(amount)} — ${duration}s`, trade.dir === 'up' ? '#16a34a' : '#dc2626');

    // Save to Firebase
    if (this.authManager.user) {
      this._saveTradeToFirebase(trade).catch(e => console.warn('❌ Trade save error:', e));
    }

    this._refreshTradeBadge();
    setTimeout(() => this._closeTrade(tradeId, trade), duration * 1000);
  }

  /* ============================================================
     Close trade
     ============================================================ */
  _closeTrade(tradeId, trade) {
    const currentP = this.currentPrice;
    const win      = (trade.dir === 'up' && currentP >= trade.entry) ||
                     (trade.dir === 'down' && currentP <= trade.entry);
    const profit   = win ? trade.stake * 0.85 : 0;
    const pl       = win ? profit : -trade.stake;

    // Remove from open trades UI
    if (window.tradeHistory) {
      const remaining = (window.tradeHistory.getTrades ? window.tradeHistory.getTrades() : [])
        .filter(t => t.id !== tradeId);
      window.tradeHistory.setTrades(remaining);
    }

    // Settle balance
    const acc = trade.account || 'demo';
    if (win) {
      const b = this._getBalanceFor(acc);
      this._setBalanceFor(acc, b + trade.stake + profit);
    }

    // Update marker
    const mIdx = this.markers.findIndex(mk => mk.tradeId === tradeId);
    if (mIdx >= 0) {
      this.markers[mIdx].closed     = true;
      this.markers[mIdx].profitLoss = pl;
    }

    const closedTrade = {
      ...trade,
      status:     'closed',
      result:     win ? 'win' : 'loss',
      profit:     pl,
      profitLoss: pl,
      closedAt:   Date.now(),
      closePrice: currentP,
      open:       false
    };

    this._addClosedTradeToHistory(closedTrade);

    if (this.authManager.user) {
      this._updateTradeInFirebase(tradeId, {
        status:     'closed',
        result:     win ? 'win' : 'loss',
        profit:     pl,
        profitLoss: pl,
        closedAt:   Date.now(),
        closePrice: currentP,
        open:       false
      }).catch(e => console.warn('❌ Trade close update error:', e));
    }

    this._refreshTradeBadge();
  }

  /* ============================================================
     History helpers
     ============================================================ */
  _addClosedTradeToHistory(closedTrade) {
    this._closedTrades.unshift(closedTrade);

    if (window.tradeHistory) {
      if (typeof window.tradeHistory.addHistory    === 'function') window.tradeHistory.addHistory(closedTrade);
      if (typeof window.tradeHistory.addClosedTrade === 'function') window.tradeHistory.addClosedTrade(closedTrade);
      if (typeof window.tradeHistory.setHistory    === 'function') window.tradeHistory.setHistory([...this._closedTrades]);
    }

    window.dispatchEvent(new CustomEvent('qt_trade_closed', {
      detail: { trade: closedTrade, allClosed: [...this._closedTrades] }
    }));

    console.log(`📝 صفقة أُضيفت للسجل: ${closedTrade.id} | ${closedTrade.result} | $${closedTrade.profit?.toFixed(2)}`);
  }

  async loadTradeHistory() {
    if (!this.authManager.user) return;
    try {
      const email     = this.authManager.user.email;
      const tradesRef = collection(db, 'users', email, 'trades');
      const q         = query(tradesRef, where('status', '==', 'closed'), orderBy('closedAt', 'desc'), limit(100));
      const snapshot  = await getDocs(q);

      this._closedTrades = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        this._closedTrades.push({
          ...data, id: docSnap.id,
          status:     'closed',
          result:     data.result || (data.profit >= 0 ? 'win' : 'loss'),
          profit:     data.profit || data.profitLoss || 0,
          profitLoss: data.profitLoss || data.profit || 0,
          closedAt:   data.closedAt || 0,
          open:       false
        });
      });

      console.log(`📜 تم تحميل ${this._closedTrades.length} صفقة منتهية من Firebase`);

      if (window.tradeHistory) {
        if (typeof window.tradeHistory.setHistory  === 'function') window.tradeHistory.setHistory([...this._closedTrades]);
        if (typeof window.tradeHistory.loadHistory === 'function') window.tradeHistory.loadHistory([...this._closedTrades]);
      }

      window.dispatchEvent(new CustomEvent('qt_history_loaded', { detail: [...this._closedTrades] }));
    } catch(e) {
      console.error('❌ loadTradeHistory error:', e);
      window.dispatchEvent(new CustomEvent('qt_history_loaded', { detail: [] }));
    }
  }

  async _saveTradeToFirebase(trade) {
    if (!this.authManager.user) return;
    try {
      const email    = this.authManager.user.email;
      const tradeRef = doc(db, 'users', email, 'trades', trade.id);
      const payload  = { ...trade };
      delete payload.open;
      payload.savedAt = serverTimestamp();
      await setDoc(tradeRef, payload);
    } catch(e) { console.error('❌ _saveTradeToFirebase error:', e); throw e; }
  }

  async _updateTradeInFirebase(tradeId, updates) {
    if (!this.authManager.user) return;
    try {
      const email    = this.authManager.user.email;
      const tradeRef = doc(db, 'users', email, 'trades', tradeId);
      await updateDoc(tradeRef, updates);
    } catch(e) { console.error('❌ _updateTradeInFirebase error:', e); throw e; }
  }

  async loadOpenTrades() {
    if (!this.authManager.user) return;
    try {
      const email     = this.authManager.user.email;
      const tradesRef = collection(db, 'users', email, 'trades');
      const q         = query(tradesRef, where('status', '==', 'open'));
      const snapshot  = await getDocs(q);

      if (snapshot.empty) {
        this._refreshTradeBadge();
        await this.loadTradeHistory();
        return;
      }

      if (window.tradeHistory) window.tradeHistory.setTrades([]);
      this.markers = [];

      const now = Date.now();
      for (const docSnap of snapshot.docs) {
        const trade = { ...docSnap.data(), id: docSnap.id };
        if (!trade.closeTime) continue;

        if (trade.closeTime <= now) {
          // Already expired
          await this._updateTradeInFirebase(trade.id, {
            status: 'expired', result: 'expired', closedAt: now, open: false
          }).catch(() => {});
        } else {
          const remaining = trade.closeTime - now;
          if (window.tradeHistory) {
            const current = window.tradeHistory.getTrades ? window.tradeHistory.getTrades() : [];
            if (!current.find(t => t.id === trade.id)) {
              current.push(trade);
              window.tradeHistory.setTrades(current);
            }
          }
          this._restoreTradeMarker(trade);
          setTimeout(() => this._closeTrade(trade.id, trade), remaining);
        }
      }

      this._refreshTradeBadge();
      await this.loadTradeHistory();
    } catch(e) { console.error('❌ loadOpenTrades error:', e); }
  }

  _restoreTradeMarker(trade) {
    let candleIdx = trade.markerCandleIndex || 0;
    if (trade.markerCandleTimestamp) {
      for (let i = 0; i < this.candles.length; i++) {
        if (this.candles[i].timestamp === trade.markerCandleTimestamp) { candleIdx = i; break; }
      }
    }
    this.markers.push({
      tradeId:        trade.id,
      type:           trade.dir === 'up' ? 'buy' : 'sell',
      price:          trade.entry,
      entry:          trade.entry,
      candleIndex:    candleIdx,
      candleTimestamp: trade.markerCandleTimestamp || 0,
      account:        trade.account || 'demo',
      closed:         false,
      profitLoss:     null
    });
  }

  /* ============================================================
     Badge & toast helpers
     ============================================================ */
  _refreshTradeBadge() {
    try {
      const acc   = this._getActiveAcc();
      const trades = window.tradeHistory && window.tradeHistory.getTrades
        ? window.tradeHistory.getTrades()
        : [];
      const count = trades.filter(t => t.open !== false && (t.account || 'demo') === acc).length;
      this._updateTradeBadge(count);
    } catch(e) {}
  }

  _updateTradeBadge(count) {
    let badge = document.getElementById('_qtTradeBadge');
    if (!badge) {
      let histBtn = document.querySelector('#historyBtn') ||
                    document.querySelector('.historyBtn') ||
                    document.querySelector('[data-panel="history"]') ||
                    document.querySelector('#tradeHistoryBtn');
      if (!histBtn) {
        document.querySelectorAll('button').forEach(btn => {
          if (!histBtn && btn.id && btn.id.toLowerCase().includes('hist')) histBtn = btn;
        });
      }
      if (!histBtn) return;
      badge           = document.createElement('span');
      badge.id        = '_qtTradeBadge';
      badge.style.cssText = 'position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;font-size:10px;font-weight:900;min-width:18px;height:18px;border-radius:9px;display:none;align-items:center;justify-content:center;padding:0 4px;z-index:10000;pointer-events:none;box-shadow:0 2px 6px rgba(0,0,0,.5);line-height:1';
      histBtn.style.position = 'relative';
      histBtn.appendChild(badge);
    }
    if (count > 0) {
      badge.textContent  = count > 99 ? '99+' : String(count);
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  _showMsg(text, color) {
    if (!document.getElementById('_qtToastCSS')) {
      const s = document.createElement('style');
      s.id    = '_qtToastCSS';
      s.textContent = `@keyframes _qtFade{
        0%{opacity:0;transform:translateX(-50%) translateY(-14px)}
        12%{opacity:1;transform:translateX(-50%) translateY(0)}
        80%{opacity:1}
        100%{opacity:0;transform:translateX(-50%) translateY(-8px)}
      }`;
      document.head.appendChild(s);
    }
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;top:68px;left:50%;transform:translateX(-50%);background:${color};color:#fff;padding:10px 22px;border-radius:12px;font-size:14px;font-weight:900;z-index:999999;box-shadow:0 4px 20px rgba(0,0,0,.5);white-space:nowrap;animation:_qtFade 2.4s forwards;pointer-events:none;letter-spacing:.3px;`;
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }

  /* ============================================================
     Events
     ============================================================ */
  initEvents() {
    window.addEventListener("resize", () => this.setup());

    // Mouse wheel zoom
    this.canvas.addEventListener("wheel", e => {
      e.preventDefault();
      const r  = this.canvas.getBoundingClientRect();
      const x  = e.clientX - r.left;
      const y  = e.clientY - r.top;
      const sc = e.deltaY > 0 ? 1 / 1.1 : 1.1;
      this.applyZoomAround(x, y, sc);
    }, { passive: false });

    // Mouse drag
    const md = (x, t) => {
      this.drag           = 1;
      this.dragStartX     = x;
      this.dragStartOffset = this.targetOffsetX;
      this.velocity       = 0;
      this.lastDragX      = x;
      this.lastDragTime   = t;
    };
    const mm = (x, t) => {
      if (this.drag) {
        const d = x - this.dragStartX;
        this.targetOffsetX = this.dragStartOffset + d;
        this.clampPan();
        const dt = t - this.lastDragTime;
        if (dt > 0 && dt < 100) this.velocity = (x - this.lastDragX) * 0.6;
        this.lastDragX   = x;
        this.lastDragTime = t;
      }
    };
    const mu = () => { this.drag = 0; this.updateTimeLabels(); };

    this.canvas.addEventListener("mousedown", e => {
      const r = this.canvas.getBoundingClientRect();
      md(e.clientX - r.left, Date.now());
    });
    window.addEventListener("mousemove", e => {
      const r = this.canvas.getBoundingClientRect();
      mm(e.clientX - r.left, Date.now());
    });
    window.addEventListener("mouseup", mu);

    // Touch
    const db = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    this.canvas.addEventListener("touchstart", e => {
      const r = this.canvas.getBoundingClientRect();
      if (e.touches.length === 1) {
        md(e.touches[0].clientX - r.left, Date.now());
      } else if (e.touches.length === 2) {
        this.drag  = 0;
        this.pinch = 1;
        this.p0    = db(e.touches[0], e.touches[1]);
        this.pMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        this.pMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
      }
    }, { passive: false });

    this.canvas.addEventListener("touchmove", e => {
      e.preventDefault();
      const r = this.canvas.getBoundingClientRect();
      if (this.pinch && e.touches.length === 2) {
        const d  = db(e.touches[0], e.touches[1]);
        if (this.p0 > 0) {
          const sc = Math.max(0.2, Math.min(5, d / (this.p0 || d)));
          this.applyZoomAround(this.pMidX, this.pMidY, sc);
        }
        this.p0 = d;
      } else if (!this.pinch && e.touches.length === 1) {
        mm(e.touches[0].clientX - r.left, Date.now());
      }
    }, { passive: false });

    this.canvas.addEventListener("touchend", e => {
      if (e.touches.length < 2) { this.pinch = 0; this.p0 = 0; mu(); }
    }, { passive: false });
  }
}

/* ============================================================
   🚀 تهيئة التطبيق
   ============================================================ */
window.chart = new AdvancedTradingChart();

const timeSelector    = document.getElementById("timeSelector");
const timeDropdown    = document.getElementById("timeDropdown");
const timeDisplay     = document.getElementById("timeDisplay");
const tabCompensation = document.getElementById("tabCompensation");
const tabCustom       = document.getElementById("tabCustom");
const compensationList = document.getElementById("compensationList");
const amountDisplay   = document.getElementById("amountDisplay");
const amountContainer = document.getElementById("amountContainer");

let isEditingTime = false;
let savedTimeValue = "00:05";

timeSelector.addEventListener("click", e => {
  e.stopPropagation();
  if (!isEditingTime) timeDropdown.classList.toggle("show");
});

document.addEventListener("click", () => {
  timeDropdown.classList.remove("show");
  if (isEditingTime) { timeDisplay.textContent = savedTimeValue; isEditingTime = false; }
});

timeDropdown.addEventListener("click", e => e.stopPropagation());

tabCompensation.addEventListener("click", () => {
  tabCompensation.classList.add("active");
  tabCustom.classList.remove("active");
  compensationList.style.display = "grid";
  if (isEditingTime) { timeDisplay.textContent = savedTimeValue; isEditingTime = false; }
});

tabCustom.addEventListener("click", () => {
  tabCustom.classList.add("active");
  tabCompensation.classList.remove("active");
  compensationList.style.display = "none";
  isEditingTime = true;
  timeDisplay.textContent = savedTimeValue.replace(':', '');
  setTimeout(() => {
    timeDisplay.focus();
    try {
      const range = document.createRange();
      range.selectNodeContents(timeDisplay);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch(e) {}
  }, 30);
});

compensationList.addEventListener("click", e => {
  if (e.target.classList.contains("dropdown-item")) {
    savedTimeValue        = e.target.textContent;
    timeDisplay.textContent = savedTimeValue;
    window.chart.selectedTime = parseInt(e.target.getAttribute("data-sec"));
    timeDropdown.classList.remove("show");
  }
});

timeDisplay.addEventListener("input", e => {
  if (isEditingTime) {
    let v   = e.target.textContent.replace(/[^0-9]/g, "");
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
    } catch(_) {}
  }
});

timeDisplay.addEventListener("blur", () => {
  if (isEditingTime) {
    let v = timeDisplay.textContent.replace(/[^0-9]/g, "");
    if (v.length === 0) v = "0005";
    v = v.padStart(4, "0");
    const h = v.slice(0, 2);
    const m = v.slice(2, 4);
    savedTimeValue            = `${h}:${m}`;
    timeDisplay.textContent   = savedTimeValue;
    const totalSec            = parseInt(h) * 60 + parseInt(m);
    window.chart.selectedTime = totalSec > 0 ? totalSec : 5;
    isEditingTime             = false;
  }
});

timeDisplay.addEventListener("keydown", function(e) {
  if (e.key === "Enter") { e.preventDefault(); this.blur(); }
});

if (amountContainer) {
  amountContainer.addEventListener("click", () => { if (amountDisplay) amountDisplay.focus(); });
}

if (amountDisplay) {
  amountDisplay.addEventListener("focus", function() {
    let v = this.value.replace("$", "");
    this.value = v;
    setTimeout(() => { this.setSelectionRange(0, this.value.length); }, 10);
  });
  amountDisplay.addEventListener("input", function() {
    this.value = this.value.replace(/[^0-9.]/g, "");
  });
  amountDisplay.addEventListener("blur", function() {
    let val = parseFloat(this.value) || 50;
    this.value = val + "$";
  });
  amountDisplay.addEventListener("keydown", function(e) {
    if (e.key === "Enter") { e.preventDefault(); this.blur(); }
  });
}

document.getElementById("buyBtn")?.addEventListener("click",  () => window.chart.openTrade("buy"));
document.getElementById("sellBtn")?.addEventListener("click", () => window.chart.openTrade("sell"));

console.log('🚀 QT Trading Chart v3 — FIXED (NaN prices + missing operators) ✅');
