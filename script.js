import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, query, orderBy, limit,
  where, serverTimestamp, doc, getDoc, setDoc, updateDoc, onSnapshot, startAfter
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

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
const db  = getFirestore(app);
const auth = getAuth(app);

/* ============================================================
   💉 حقن CSS مربع تبديل الحسابات
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
    @keyframes qtMenuIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
    .qt-acc-switch{display:flex;gap:7px;background:#0d1117;border-radius:10px;padding:4px;margin-bottom:11px;}
    .qt-sw-btn{flex:1;padding:8px 4px;border-radius:8px;font-size:11px;font-weight:900;letter-spacing:.4px;
      transition:.2s;border:1.5px solid transparent;display:flex;align-items:center;justify-content:center;gap:5px;
      background:transparent;color:#fff;cursor:pointer;}
    .qt-sw-btn.qt-live{color:#00ff41}.qt-sw-btn.qt-demo{color:#ffd700}
    .qt-sw-btn.active{background:rgba(255,255,255,.10);border-color:currentColor;box-shadow:0 0 8px rgba(255,255,255,.08)}
    .qt-acc-item{background:rgba(255,255,255,.03);border:1.3px solid rgba(255,255,255,.10);border-radius:12px;
      padding:10px 12px;margin-bottom:9px;cursor:pointer;transition:.15s;
      display:flex;align-items:center;justify-content:space-between;gap:10px;}
    .qt-acc-item:hover{background:rgba(255,255,255,.06);transform:translateY(-1px)}
    .qt-acc-item.active{background:linear-gradient(135deg,rgba(66,153,225,.16) 0%,rgba(49,130,206,.10) 100%);
      border-color:#4299e1;box-shadow:0 0 14px rgba(66,153,225,.22);}
    .qt-acc-left{display:flex;align-items:center;gap:10px;min-width:0}
    .qt-acc-ico{width:26px;height:26px;object-fit:contain;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.4)}
    .qt-acc-info{display:flex;flex-direction:column;gap:2px}
    .qt-acc-label{font-size:10px;color:rgba(255,255,255,.45);font-weight:700;letter-spacing:.4px;text-transform:uppercase}
    .qt-acc-amt{font-size:16px;font-weight:1000;color:#fff;white-space:nowrap}
    .qt-acc-badge{font-size:9px;font-weight:900;letter-spacing:.6px;padding:3px 7px;border-radius:6px;white-space:nowrap;}
    .qt-acc-badge.live{background:rgba(0,255,65,.12);color:#00ff41;border:1px solid rgba(0,255,65,.3)}
    .qt-acc-badge.demo{background:rgba(255,215,0,.12);color:#ffd700;border:1px solid rgba(255,215,0,.3)}
    .qt-refill-btn{width:100%;background:linear-gradient(135deg,#4299e1 0%,#3182ce 100%);border-radius:10px;
      padding:10px;font-size:12px;font-weight:1000;color:#fff;letter-spacing:.5px;cursor:pointer;
      box-shadow:0 4px 14px rgba(66,153,225,.35);transition:.2s;border:none;}
    .qt-refill-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(66,153,225,.45)}
    .qt-refill-btn:active{transform:scale(.97)}
    #timeDisplay{caret-color:#fff !important;outline:none !important;}
    #timeDisplay:focus{border-color:rgba(255,255,255,.35) !important;}
    #_qtRoleBadge{display:none !important;opacity:0 !important;visibility:hidden !important;}
  `;
  document.head.appendChild(st);
})();

/* ============================================================
   🔐 AuthManager — مفتاح uid موحَّد + حقول balance/demobalance
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
    try { return '$' + new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n); }
    catch(e) { return '$' + (Math.round(n*100)/100).toFixed(2); }
  }

  /* ✅ setBalance — الكتابة إلى Firestore بمفتاح uid وحقول balance/demobalance */
  async setBalance(type, amount, { persist = true } = {}) {
    const safeAmt = Math.max(0, Number(amount) || 0);
    if (type === 'real') this.realBalance = safeAmt;
    else                 this.demoBalance  = safeAmt;

    const realEl = document.getElementById('qtRealAmt');
    const demoEl = document.getElementById('qtDemoAmt');
    if (realEl) realEl.textContent = this._fmtMoney(this.realBalance);
    if (demoEl) demoEl.textContent = this._fmtMoney(this.demoBalance);

    const showAmt = (this.activeAccount === 'real') ? this.realBalance : this.demoBalance;
    if (this.balanceEl) this.balanceEl.textContent = this._fmtMoney(showAmt);
    const balAmount = document.getElementById('balAmount');
    if (balAmount) balAmount.textContent = this._fmtMoney(showAmt);

    if (type === 'demo' && !this.user) {
      try { localStorage.setItem('qt_demo_balance', String(safeAmt)); } catch(e) {}
    }

    /* ✅ الكتابة لـ Firebase بنفس حقول helak.html */
    if (persist && this.user) {
      const userRef = doc(db, 'users', this.user.uid);  // uid موحَّد
      const payload = (type === 'real')
        ? { balance: safeAmt }          // حقل balance
        : { demobalance: safeAmt };     // حقل demobalance
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
        <button class="qt-sw-btn qt-live active" data-acc="real">● LIVE</button>
        <button class="qt-sw-btn qt-demo" data-acc="demo">◆ Demo</button>
      </div>
      <div class="qt-acc-item active" data-type="real">
        <div class="qt-acc-left">
          <img class="qt-acc-ico" src="https://flagcdn.com/w40/us.png" alt="USD">
          <div class="qt-acc-info">
            <span class="qt-acc-label">Real Account</span>
            <span class="qt-acc-amt" id="qtRealAmt">$0.00</span>
          </div>
        </div>
        <span class="qt-acc-badge live">LIVE</span>
      </div>
      <div class="qt-acc-item" data-type="demo">
        <div class="qt-acc-left">
          <img class="qt-acc-ico" src="https://cdn-icons-png.flaticon.com/128/1344/1344761.png" alt="Demo">
          <div class="qt-acc-info">
            <span class="qt-acc-label">Demo Account</span>
            <span class="qt-acc-amt" id="qtDemoAmt">$10,000.00</span>
          </div>
        </div>
        <span class="qt-acc-badge demo">DEMO</span>
      </div>
      <button class="qt-refill-btn" id="qtRefillBtn" type="button">🔄 Refill Demo Account</button>
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
        const type = btn.dataset.acc;
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
        menu.querySelectorAll('.qt-sw-btn').forEach(b => b.classList.toggle('active', b.dataset.acc === type));
        this.closeMenu();
      });
    });
    const refillBtn = document.getElementById('qtRefillBtn');
    if (refillBtn) {
      refillBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setBalance('demo', 10000, { persist: true });
        const btn = document.getElementById('qtRefillBtn');
        btn.textContent = '✅ Refilled!';
        setTimeout(() => { btn.textContent = '🔄 Refill Demo Account'; }, 1500);
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
    const showAmt = type === 'real' ? this.realBalance : this.demoBalance;
    if (this.balanceEl) this.balanceEl.textContent = this._fmtMoney(showAmt);
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
        const showAmt = (this.activeAccount === 'real') ? this.realBalance : this.demoBalance;
        if (this.balanceEl) this.balanceEl.textContent = this._fmtMoney(showAmt);
        window.dispatchEvent(new CustomEvent('qt_history_loaded', { detail: [] }));
      }
    });
  }

  /* ✅ loadUserBalance — يقرأ balance/demobalance بمفتاح uid */
  async loadUserBalance() {
    const userRef  = doc(db, 'users', this.user.uid);  // uid موحَّد
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: this.user.email || '',
        balance: 0,
        demobalance: 10000,
        createdAt: serverTimestamp()
      }, { merge: true });
    } else {
      const d = userSnap.data() || {};
      const patch = {};
      if (d.balance     == null) patch.balance     = 0;
      if (d.demobalance == null) patch.demobalance = 10000;
      if (d.email       == null && this.user.email) patch.email = this.user.email;
      if (Object.keys(patch).length) await setDoc(userRef, patch, { merge: true });
    }

    if (this.unsubscribeBalance) {
      try { this.unsubscribeBalance(); } catch(e) {}
      this.unsubscribeBalance = null;
    }

    /* ✅ onSnapshot يقرأ balance و demobalance */
    this.unsubscribeBalance = onSnapshot(userRef, (snap) => {
      const data = snap.data();
      if (!data) return;

      this.realBalance  = (data.balance     !== undefined) ? Number(data.balance)     : 0;
      this.demoBalance  = (data.demobalance  !== undefined) ? Number(data.demobalance) : 10000;
      this.balancesReady = true;

      const realEl = document.getElementById('qtRealAmt');
      const demoEl = document.getElementById('qtDemoAmt');
      if (realEl) realEl.textContent = this._fmtMoney(this.realBalance);
      if (demoEl) demoEl.textContent = this._fmtMoney(this.demoBalance);

      const showAmt = (this.activeAccount === 'real') ? this.realBalance : this.demoBalance;
      if (this.balanceEl) this.balanceEl.textContent = this._fmtMoney(showAmt);
      const balAmount = document.getElementById('balAmount');
      if (balAmount) balAmount.textContent = this._fmtMoney(showAmt);

      /* مزامنة مع helak.html elements */
      const realAmtH  = document.getElementById('realAmt');
      const demoAmtH  = document.getElementById('demoAmt');
      if (realAmtH) realAmtH.textContent = '$' + (Math.round(this.realBalance*100)/100).toFixed(2);
      if (demoAmtH) demoAmtH.textContent = '$' + (Math.round(this.demoBalance*100)/100).toFixed(2);

      try { localStorage.setItem('qt_demo_balance', String(this.demoBalance)); } catch(e) {}
    });
  }

  /* ✅ updateBalance — يستخدم حقول balance/demobalance */
  async updateBalance(type, amount) {
    if (!this.user) return;
    const userRef  = doc(db, 'users', this.user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const data  = userSnap.data() || {};
    const field = type === 'real' ? 'balance' : 'demobalance';
    const cur   = (data[field] !== undefined) ? Number(data[field]) : (type === 'real' ? 0 : 10000);
    const next  = cur + amount;
    await updateDoc(userRef, { [field]: next });
  }
}

/* ============================================================
   💾 LocalStorageManager — إصلاح _ck → ck و _sk → sk
   ============================================================ */
class LocalStorageManager {
  constructor() {
    this.CANDLES_KEY   = 'qt_trading_candles';
    this.LAST_SYNC_KEY = 'qt_last_sync';
  }
  ck(pair) { return pair ? 'qt_trading_candles_' + pair.replace('/', '_') : this.CANDLES_KEY; }
  sk(pair) { return pair ? 'qt_last_sync_'       + pair.replace('/', '_') : this.LAST_SYNC_KEY; }

  saveCandles(candles, pair) {
    try {
      localStorage.setItem(this.ck(pair), JSON.stringify(candles));   // ✅ ck بدل _ck
      localStorage.setItem(this.sk(pair), Date.now().toString());     // ✅ sk بدل _sk
    } catch(e) { console.error('❌ LocalStorage Save error:', e); }
  }

  loadCandles(pair) {
    try {
      const data = localStorage.getItem(this.ck(pair));               // ✅ ck بدل _ck
      if (data) return JSON.parse(data);
    } catch(e) { console.error('❌ LocalStorage Load error:', e); }
    return null;
  }

  getLastSyncTime() {
    const t = localStorage.getItem(this.LAST_SYNC_KEY);
    return t ? parseInt(t) : 0;
  }

  clear() {
    localStorage.removeItem(this.CANDLES_KEY);
    localStorage.removeItem(this.LAST_SYNC_KEY);
  }
}

/* ============================================================
   🔥 FirebaseManager — مُصحَّح بالكامل
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
      console.log('🔄 Firebase collection:', key);
    }
  }

  /* ✅ addPendingCandle — دالة كانت مفقودة */
  addPendingCandle(candle) {
    this.pendingCandles.push(candle);
  }

  async saveCandles(candles) {
    if (this.isSaving) return false;
    try {
      this.isSaving = true;
      const batch = [];
      for (const candle of candles) {
        const cd = { open: candle.open, high: candle.high, low: candle.low, close: candle.close, timestamp: candle.timestamp, savedAt: serverTimestamp() };
        batch.push(cd);
        if (batch.length >= this.saveBatchSize) { await this.saveBatch(batch); batch.length = 0; await this.delay(100); }
      }
      if (batch.length > 0) await this.saveBatch(batch);
      this.lastSaveTime = Date.now();
      return true;
    } catch(e) { console.error('❌ Save error:', e); return false; }
    finally { this.isSaving = false; }
  }

  async saveBatch(batch) {
    const promises = batch.map(cd => addDoc(collection(this.db, this.candlesCollection), cd));
    await Promise.all(promises);
  }

  /* ✅ loadCandles — يرجع {candles, lastDoc} لدعم pagination */
  async loadCandles(maxCandles = 1000) {
    try {
      console.log('📥 Loading from Firebase:', this.candlesCollection, '| max:', maxCandles);
      const q = query(
        collection(this.db, this.candlesCollection),
        orderBy('timestamp', 'desc'),
        limit(maxCandles)
      );
      const querySnapshot = await getDocs(q);
      const candles = [];
      const seen    = new Set();
      let   lastDoc = null;

      querySnapshot.forEach((docSnap) => {
        lastDoc = docSnap;                      // آخر doc في النتائج (الأقدم بترتيب desc)
        const data = docSnap.data();
        if (!seen.has(data.timestamp)) {
          seen.add(data.timestamp);
          candles.push({ open: data.open, high: data.high, low: data.low, close: data.close, timestamp: data.timestamp });
        }
      });
      candles.reverse();                        // تصاعدي (الأقدم أولاً)
      console.log('✅ Loaded', candles.length, 'candles');
      return { candles, lastDoc };
    } catch(e) {
      console.error('❌ loadCandles error:', e);
      return { candles: null, lastDoc: null };
    }
  }

  /* ✅ loadMoreCandles — تحميل شموع أقدم بعد lastDoc */
  async loadMoreCandles(afterDoc, maxMore = 9000) {
    if (!afterDoc) return null;
    try {
      console.log('📥 Loading more candles (background)...');
      const q = query(
        collection(this.db, this.candlesCollection),
        orderBy('timestamp', 'desc'),
        startAfter(afterDoc),
        limit(maxMore)
      );
      const querySnapshot = await getDocs(q);
      const candles = [];
      const seen    = new Set();

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!seen.has(data.timestamp)) {
          seen.add(data.timestamp);
          candles.push({ open: data.open, high: data.high, low: data.low, close: data.close, timestamp: data.timestamp });
        }
      });
      candles.reverse();
      console.log('✅ Loaded more:', candles.length, 'candles');
      return candles;
    } catch(e) {
      console.error('❌ loadMoreCandles error:', e);
      return null;
    }
  }

  /* ✅ clearOldCandles — إصلاح الضرب */
  async clearOldCandles(daysToKeep = 7) {
    try {
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);  // ✅ إصلاح
      const q = query(
        collection(this.db, this.candlesCollection),
        where('timestamp', '<', cutoffTime),
        limit(500)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        console.log('🗑️ Clearing', snap.size, 'old candles');
      }
    } catch(e) { console.warn('⚠️ clearOldCandles error:', e); }
  }

  /* ✅ startAutoSave — إصلاح */
  startAutoSave() {
    setInterval(async () => {
      if (this.pendingCandles.length > 0 && !this.isSaving) {
        const candlesToSave = [...this.pendingCandles];
        this.pendingCandles = [];
        await this.saveCandles(candlesToSave);
      }
    }, this.saveInterval);
  }

  delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

/* ============================================================
   ⏰ updateLiveTime — إصلاح الضرب
   ============================================================ */
function updateLiveTime() {
  const d  = new Date();
  const u  = d.getTime() + d.getTimezoneOffset() * 60000;   // ✅ إصلاح
  const t  = new Date(u + (3 * 3600000));                    // ✅ UTC+3
  const h  = String(t.getHours()).padStart(2, "0");
  const m  = String(t.getMinutes()).padStart(2, "0");
  const s  = String(t.getSeconds()).padStart(2, "0");
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
    this.plot              = document.getElementById("plot");
    this.canvas            = document.getElementById("chartCanvas");
    this.ctx               = this.canvas.getContext("2d");
    this.timeLabels        = document.getElementById("timeLabels");
    this.candleTimer       = document.getElementById("candleTimer");
    this.priceLine         = document.getElementById("priceLine");
    this.priceScaleLabels  = document.getElementById("priceScaleLabels");
    this.currentPriceEl    = document.getElementById("currentPrice");
    this.loadingOverlay    = document.getElementById("loadingOverlay");
    this.authManager       = new AuthManager();
    this.localStorageManager = new LocalStorageManager();
    this.firebaseManager   = new FirebaseManager();

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

    this.currentPair       = 'EUR/USD';
    this.isSwitching       = false;
    this.volScale          = 1;
    this.firebaseManager.setPair(this.currentPair);

    this.candles           = [];
    this.currentCandle     = null;
    this.maxCandles        = 10000;
    this.INITIAL_LOAD      = 1000;       // ✅ تحميل مبدئي
    this._lastCandleDoc    = null;       // ✅ cursor للـ pagination
    this.basePrice         = 1.95;
    this.currentPrice      = 1.9518;
    this.seed              = 11001;
    this.digits            = 5;
    this.priceRange        = { min: 1.9, max: 2 };
    this.baseSpacing       = 12;
    this.zoom              = 1;
    this.targetZoom        = 1;
    this.minZoom           = 0.425;
    this.maxZoom           = 2.25;
    this.zoomEase          = 0.28;
    this.targetOffsetX     = 0;
    this.offsetX           = 0;
    this.panEase           = 0.38;
    this.velocity          = 0;
    this.drag              = 0;
    this.dragStartX        = 0;
    this.dragStartOffset   = 0;
    this.lastDragX         = 0;
    this.lastDragTime      = 0;
    this.pinch             = 0;
    this.p0                = 0;
    this.pMidX             = 0;
    this.pMidY             = 0;
    this.timeframe         = 60000;
    this.t0                = Math.floor(Date.now() / 60000) * 60000;
    this.smin              = null;
    this.smax              = null;
    this.sre               = 0.088;
    this._fr               = 0;
    this.markers           = [];
    this.selectedTime      = 5;
    this.dataLoaded        = false;
    this.usingLocalStorage = false;
    this._tradeCounter     = 0;
    this._pendingTradeLoad = false;
    this._closedTrades     = [];

    this.uid                     = 'uid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    this.isMaster                = false;
    this._masterBroadcastInterval = null;
    this._watchdogInterval       = null;
    this._liveUnsubscribe        = null;
    this._lastBroadcastedClose   = null;
    this.MASTER_TIMEOUT          = 12000;
    this.BROADCAST_INTERVAL      = 1000;

    window.addEventListener('beforeunload', () => {
      if (this.isMaster) {
        try {
          updateDoc(doc(db, 'trading_live', this._getPairKey()), { masterUid: null, masterHeartbeat: 0 }).catch(() => {});
        } catch(e) {}
      }
    });

    this.setup();
    this.initData();
  }

  _getPairKey()    { return this.currentPair.replace('/', '_'); }
  _getLiveStateRef() { return doc(db, 'trading_live', this._getPairKey()); }

  _setRoleBadge(role) {
    let badge = document.getElementById('_qtRoleBadge');
    if (!badge) { badge = document.createElement('div'); badge.id = '_qtRoleBadge'; document.body.appendChild(badge); }
    badge.className  = role;
    badge.textContent = role === 'master' ? '👑 MASTER' : '👁️ VIEWER';
  }

  async _initMasterViewerSystem() {
    try {
      const claimed = await this._tryClaimMaster();
      if (claimed) {
        this.isMaster  = true;
        this.candles   = await this._fillAndSaveCandleGaps(this.candles);
        this._startMasterBroadcast();
        this._setRoleBadge('master');
        console.log('👑 أنا الماستر');
      } else {
        this.isMaster = false;
        this._startViewerSubscription();
        this._startWatchdog();
        this._setRoleBadge('viewer');
        console.log('👁️ أنا مشاهد');
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
        await setDoc(stateRef, { masterUid: this.uid, masterHeartbeat: Date.now(), liveCandle: null, liveT0: this.t0, pair: this.currentPair });
        console.log('👑 استُولي على الماستر (جديد)');
        return true;
      }
      const data    = snap.data();
      const hb      = data.masterHeartbeat || 0;
      const isAlive = (Date.now() - hb) < this.MASTER_TIMEOUT;
      if (!isAlive || !data.masterUid) {
        await setDoc(stateRef, { masterUid: this.uid, masterHeartbeat: Date.now(), liveCandle: null, liveT0: this.t0, pair: this.currentPair }, { merge: true });
        console.log('👑 استُولي على الماستر (timeout)');
        return true;
      }
      return false;
    } catch(e) {
      console.warn('⚠️ _tryClaimMaster error:', e);
      return true;
    }
  }

  async _becomeMaster() {
    if (this._liveUnsubscribe) { try { this._liveUnsubscribe(); } catch(e) {} this._liveUnsubscribe = null; }
    const stateRef = this._getLiveStateRef();
    await setDoc(stateRef, { masterUid: this.uid, masterHeartbeat: Date.now(), liveT0: this.t0, pair: this.currentPair }, { merge: true }).catch(() => {});
    this.isMaster = true;
    this._lastBroadcastedClose = null;
    this._startMasterBroadcast();
    this._setRoleBadge('master');
    console.log('👑 أصبحت الماستر (watchdog)');
  }

  _startMasterBroadcast() {
    if (this._masterBroadcastInterval) clearInterval(this._masterBroadcastInterval);
    this._masterBroadcastInterval = setInterval(async () => {
      if (!this.isMaster || this.isSwitching || !this.currentCandle) return;
      if (this.currentCandle.close === this._lastBroadcastedClose) return;
      this._lastBroadcastedClose = this.currentCandle.close;
      try {
        await setDoc(this._getLiveStateRef(), {
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
    this._liveUnsubscribe = onSnapshot(this._getLiveStateRef(), (snap) => {
      if (!snap.exists() || this.isMaster || this.isSwitching) return;
      const data = snap.data();
      if (data.liveT0 && data.liveT0 !== this.t0 && this.t0 > 0) {
        if (this.currentCandle && (!this.candles.length || this.currentCandle.timestamp !== this.candles[this.candles.length - 1].timestamp)) {
          const completed = { ...this.currentCandle };
          this.candles.push(completed);
          if (this.candles.length > this.maxCandles) this.candles.shift();
          this.localStorageManager.saveCandles(this.candles, this.currentPair);
        }
      }
      if (data.liveT0)     this.t0           = data.liveT0;
      if (data.liveCandle) {
        this.currentCandle = { ...data.liveCandle };
        this.currentPrice  = data.liveCandle.close;
        window.__qt_price  = this.currentPrice;
      }
    }, (err) => { console.warn('⚠️ viewer snapshot error:', err); });
  }

  _startWatchdog() {
    if (this._watchdogInterval) clearInterval(this._watchdogInterval);
    this._watchdogInterval = setInterval(async () => {
      if (this.isMaster || this.isSwitching) return;
      try {
        const snap = await getDoc(this._getLiveStateRef());
        if (!snap.exists()) { await this._becomeMaster(); return; }
        const data    = snap.data();
        const hb      = data.masterHeartbeat || 0;
        const isAlive = (Date.now() - hb) < this.MASTER_TIMEOUT;
        if (!isAlive) await this._becomeMaster();
      } catch(e) {}
    }, 15000);
  }

  async _cleanupMasterViewer() {
    if (this._masterBroadcastInterval) { clearInterval(this._masterBroadcastInterval); this._masterBroadcastInterval = null; }
    if (this._watchdogInterval)        { clearInterval(this._watchdogInterval);         this._watchdogInterval = null; }
    if (this._liveUnsubscribe)         { try { this._liveUnsubscribe(); } catch(e) {}   this._liveUnsubscribe = null; }
    if (this.isMaster) {
      try { await updateDoc(this._getLiveStateRef(), { masterUid: null, masterHeartbeat: 0 }).catch(() => {}); } catch(e) {}
    }
    this.isMaster = false;
    this._lastBroadcastedClose = null;
  }

  async _fillAndSaveCandleGaps(candles) {
    if (!candles || candles.length === 0) return candles || [];
    const lastTs    = candles[candles.length - 1].timestamp;
    const currentT0 = Math.floor(Date.now() / this.timeframe) * this.timeframe;
    if (currentT0 <= lastTs) return candles;
    const gaps = [];
    let t = lastTs + this.timeframe;
    let p = candles[candles.length - 1].close;
    while (t < currentT0) {
      const g = this.genCandle(t, p);
      gaps.push(g);
      p = g.close;
      t += this.timeframe;
    }
    if (gaps.length > 0) {
      try {
        await this.firebaseManager.saveCandles(gaps);
        console.log(`✅ ${gaps.length} شمعة فجوة حُفظت`);
      } catch(e) {
        console.warn('⚠️ Gap save error:', e);
        gaps.forEach(c => this.firebaseManager.addPendingCandle(c));
      }
      const result = [...candles, ...gaps];
      return result.length > this.maxCandles ? result.slice(result.length - this.maxCandles) : result;
    }
    return candles;
  }

  /* ============================================================
     ✅ initData — تحميل 1000 شمعة مبدئياً + الباقي في الخلفية
     ============================================================ */
  async initData() {
    this.showLoading(true);
    try {
      console.log('📄 Loading initial', this.INITIAL_LOAD, 'candles from Firebase...');
      const result = await this.firebaseManager.loadCandles(this.INITIAL_LOAD);
      if (result && result.candles && result.candles.length > 0) {
        console.log('✅ Using Firebase data:', result.candles.length, 'candles');
        this.candles           = result.candles;
        this._lastCandleDoc    = result.lastDoc;  // cursor للباقي
        this.usingLocalStorage = false;
        this.localStorageManager.saveCandles(this.candles, this.currentPair);
      } else {
        console.log('⚠️ No Firebase data, trying local...');
        const localCandles = this.localStorageManager.loadCandles(this.currentPair);
        if (localCandles && localCandles.length > 0) {
          console.log('✅ Using local data:', localCandles.length, 'candles');
          this.candles           = localCandles;
          this.usingLocalStorage = true;
        } else {
          console.log('🔨 Generating new data...');
          this.initHistoricalData();
          this.usingLocalStorage = true;
        }
        this._lastCandleDoc = null;
      }

      if (this.candles.length > 0) this.currentPrice = this.candles[this.candles.length - 1].close;
      this.snapToLive();
      this.updateTimeLabels();
      this.updatePriceRange();
      this.smin = this.priceRange.min;
      this.smax = this.priceRange.max;
      this.updatePriceScale();
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

      /* ✅ تحميل باقي الشموع في الخلفية بدون تحريك المستخدم */
      if (this._lastCandleDoc) {
        setTimeout(() => this._loadRemainingCandles(), 3000);
      }

    } catch(e) {
      console.error('❌ Init error:', e);
      this.initHistoricalData();
      this.usingLocalStorage = true;
      this.dataLoaded        = true;
      this.isMaster          = true;
      this._startMasterBroadcast();
      this._setRoleBadge('master');
      this.initEvents();
      this.startRealtime();
      this.loop();
    } finally {
      this.showLoading(false);
    }
  }

  /* ✅ تحميل الشموع المتبقية في الخلفية — لا تحريك للمستخدم */
  async _loadRemainingCandles() {
    if (!this._lastCandleDoc || this.isSwitching) return;
    try {
      console.log('🔄 Loading remaining candles in background...');
      const more = await this.firebaseManager.loadMoreCandles(this._lastCandleDoc, 9000);
      if (more && more.length > 0) {
        const prevCount = this.candles.length;

        /* دمج مع إزالة التكرار */
        const seen   = new Set(this.candles.map(c => c.timestamp));
        const older  = more.filter(c => !seen.has(c.timestamp));

        if (older.length > 0) {
          /* الشموع القديمة تُضاف في البداية */
          const merged = [...older, ...this.candles];
          merged.sort((a, b) => a.timestamp - b.timestamp);

          if (merged.length > this.maxCandles) {
            merged.splice(0, merged.length - this.maxCandles);
          }

          const added = merged.length - prevCount;
          this.candles = merged;

          /* ✅ تعديل الـ offset لتعويض الشموع المضافة (لا تحريك للمستخدم) */
          if (added > 0) {
            const spacing = this.getSpacing();
            this.targetOffsetX -= added * spacing;
            this.offsetX        = this.targetOffsetX;
          }

          this.localStorageManager.saveCandles(this.candles, this.currentPair);
          console.log(`✅ تم تحميل ${added} شمعة إضافية في الخلفية. إجمالي: ${this.candles.length}`);
        }
      }
      this._lastCandleDoc = null; // انتهى التحميل
    } catch(e) {
      console.warn('⚠️ Background candle load error:', e);
    }
  }

  showLoading(show) {
    if (this.loadingOverlay) {
      show ? this.loadingOverlay.classList.add('show') : this.loadingOverlay.classList.remove('show');
    }
  }

  setup() {
    const dpr = window.devicePixelRatio || 1;
    const r   = this.plot.getBoundingClientRect();
    this.w    = r.width;
    this.h    = r.height - 24;
    this.canvas.width  = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.canvas.style.width  = this.w + "px";
    this.canvas.style.height = this.h + "px";
    this.ctx.scale(dpr, dpr);
    if (this.dataLoaded) { this.updatePriceLabel(); this.updatePriceScale(); this.updateTimeLabels(); }
  }

  rnd(s)  { const x = Math.sin(s) * 10000; return x - Math.floor(x); }
  rndG(s) { const u1 = this.rnd(s); const u2 = this.rnd(s + 100000); return Math.sqrt(-2 * Math.log(u1 + 0.00001)) * Math.cos(2 * Math.PI * u2); }

  genCandle(t, o) {
    const s  = this.seed + Math.floor(t / this.timeframe);
    const vb = 0.0008 * (this.volScale || 1);
    const tb = 0.00005 * (this.volScale || 1);
    const r1 = this.rndG(s); const r2 = this.rndG(s+1); const r3 = this.rndG(s+2);
    const r4 = this.rnd(s+3); const r5 = this.rnd(s+4); const r6 = this.rnd(s+5);
    const v  = vb * (0.7 + Math.abs(r1) * 0.8);
    const tr = tb * r2 * 0.6;
    const dir = r3 > 0 ? 1 : -1;
    const tc  = o + (dir * v + tr);
    const rg  = v * (0.2 + r4 * 0.6);
    const hm  = rg * (0.3 + r5 * 0.7);
    const lm  = rg * (0.3 + (1 - r5) * 0.7);
    const c   = +(tc + (r6 - 0.5) * v * 0.1).toFixed(this.digits);
    const op  = +o.toFixed(this.digits);
    return { open: op, close: c, high: +Math.max(op, c, op + hm, c + hm).toFixed(this.digits), low: +Math.min(op, c, op - lm, c - lm).toFixed(this.digits), timestamp: t };
  }

  initHistoricalData() {
    this.candles = [];
    let p = this.basePrice;
    let t = Date.now() - this.INITIAL_LOAD * this.timeframe;
    for (let i = 0; i < this.INITIAL_LOAD; i++) {
      const c = this.genCandle(t, p);
      this.candles.push(c);
      p = c.close;
      t += this.timeframe;
    }
  }

  getSpacing()    { return this.baseSpacing * this.zoom; }
  getCandleWidth(){ return Math.max(1, this.getSpacing() * 0.65); }
  indexToX(i)     { return (i - this.candles.length) * this.getSpacing() + this.w - this.baseSpacing + this.offsetX; }
  xToIndex(x)     { return (x - this.w + this.baseSpacing - this.offsetX) / this.getSpacing() + this.candles.length; }

  clampPan() {
    const s  = this.getSpacing();
    const mn = -(this.candles.length * s - this.w * 0.15);
    const mx = this.w * 0.9;
    this.targetOffsetX = Math.max(mn, Math.min(mx, this.targetOffsetX));
  }

  snapToLive() {
    const s = this.getSpacing();
    this.targetOffsetX = 0;
    this.offsetX       = 0;
  }

  getPriceRange() {
    if (this.smin !== null && this.smax !== null && this.smax > this.smin) return { min: this.smin, max: this.smax };
    return this.priceRange;
  }

  calcNiceGrid() {
    const r     = this.getPriceRange();
    const range = r.max - r.min;
    const raw   = range / 8;
    const mag   = Math.pow(10, Math.floor(Math.log10(raw)));
    const nices = [1, 2, 2.5, 5, 10];
    let step    = nices.map(n => n * mag).find(n => n >= raw) || mag;
    const min   = Math.floor(r.min / step) * step;
    const count = Math.ceil((r.max - min) / step) + 2;
    return { min, step, count };
  }

  drawGrid() {
    const { min, step, count } = this.calcNiceGrid();
    for (let i = 0; i < count; i++) {
      const p = min + i * step;
      const y = this.priceToY(p);
      if (y < -5 || y > this.h + 5) continue;
      const mj = i % 5 === 0;
      this.ctx.strokeStyle = mj ? "rgba(255,215,0,.12)" : "rgba(255,255,255,.05)";
      this.ctx.lineWidth   = mj ? 1 : 0.8;
      this.ctx.beginPath(); this.ctx.moveTo(0, y + 0.5); this.ctx.lineTo(this.w, y + 0.5); this.ctx.stroke();
    }
    const visC  = this.w / this.getSpacing();
    const stepC = Math.max(1, Math.round(visC / 9));
    const s = Math.floor(this.xToIndex(0)); const e = Math.ceil(this.xToIndex(this.w));
    for (let i = s; i <= e; i++) {
      const x = this.indexToX(i);
      if (x < -5 || x > this.w + 5) continue;
      const mj = i % Math.round(stepC * 5) === 0;
      this.ctx.strokeStyle = mj ? "rgba(255,215,0,.12)" : "rgba(255,255,255,.05)";
      this.ctx.lineWidth   = mj ? 1 : 0.8;
      this.ctx.beginPath(); this.ctx.moveTo(x + 0.5, 0); this.ctx.lineTo(x + 0.5, this.h); this.ctx.stroke();
    }
  }

  updateTimeLabels() {
    const tl = this.timeLabels; tl.innerHTML = "";
    const visC  = this.w / this.getSpacing();
    const stepC = Math.max(1, Math.round(visC / 9));
    const s = Math.floor(this.xToIndex(0)); const e = Math.ceil(this.xToIndex(this.w));
    const tS = this.candles.length ? this.candles[0].timestamp : this.t0;
    for (let i = s; i <= e; i++) {
      if (i % stepC !== 0) continue;
      const x = this.indexToX(i);
      if (x < 5 || x > this.w - 5) continue;
      const t  = tS + i * this.timeframe;
      const d  = new Date(t);
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
    for (let i = 0; i < count; i++) {
      const p = min + i * step;
      const y = this.priceToY(p);
      if (y < -8 || y > this.h + 8) continue;
      const mj = i % 5 === 0;
      h += `<div class="pLabel${mj ? ' major' : ''}" style="top:${y}px">${p.toFixed(this.digits)}</div>`;
    }
    this.priceScaleLabels.innerHTML = h;
  }

  updatePriceLabel() {
    const py = this.priceToY(this.currentPrice);
    this.priceLine.style.top          = py + "px";
    this.currentPriceEl.style.top     = py + "px";
    this.currentPriceEl.textContent   = this.currentPrice.toFixed(this.digits);
  }

  updateCandleTimer() {
    if (!this.currentCandle) return;
    const n  = Date.now();
    const e  = n - this.t0;
    const r  = this.timeframe - e;
    const s  = Math.floor(r / 1000);
    this.candleTimer.textContent = s >= 0 ? s : 0;
    const cx = this.indexToX(this.candles.length);
    this.candleTimer.style.left    = cx + 15 + "px";
    this.candleTimer.style.top     = "10px";
    this.candleTimer.style.display = 'block';
  }

  priceToY(p) {
    const r = this.getPriceRange();
    const n = (p - r.min) / (r.max - r.min);
    return this.h * (1 - n);
  }

  drawCandle(c, x, glow) {
    const oy = this.priceToY(c.open); const cy = this.priceToY(c.close);
    const hy = this.priceToY(c.high); const ly = this.priceToY(c.low);
    const b  = c.close >= c.open;
    const w  = this.getCandleWidth();
    this.ctx.strokeStyle = b ? "#0f0" : "#f00";
    this.ctx.lineWidth   = Math.max(1, 0.18 * w);
    this.ctx.beginPath(); this.ctx.moveTo(x, hy); this.ctx.lineTo(x, ly); this.ctx.stroke();
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
    if (op > bt) fp = bt; else if (op < bb) fp = bb;
    const m = { type: t, price: fp, candleIndex: this.candles.length, tradeId, account, closed: false, profitLoss: null };
    this.markers.push(m);
  }

  drawMarker(m) {
    const x = this.indexToX(m.candleIndex);
    if (x < -50 || x > this.w + 50) return;
    const y   = this.priceToY(m.price);
    const w   = this.getCandleWidth();
    const ib  = m.type === "buy";
    const cl  = ib ? "#16a34a" : "#ff3b3b";
    const r   = 5.5;

    this.ctx.save();
    this.ctx.shadowColor = cl; this.ctx.shadowBlur = 9;
    this.ctx.fillStyle   = cl;
    this.ctx.beginPath(); this.ctx.arc(x, y, r, 0, 2 * Math.PI); this.ctx.fill();
    this.ctx.shadowBlur  = 0;

    this.ctx.fillStyle = "#fff"; this.ctx.save(); this.ctx.translate(x, y);
    if (!ib) this.ctx.rotate(Math.PI);
    this.ctx.beginPath(); this.ctx.moveTo(0, -2.8); this.ctx.lineTo(-2, 0.8); this.ctx.lineTo(-0.65, 0.8);
    this.ctx.lineTo(-0.65, 2.8); this.ctx.lineTo(0.65, 2.8); this.ctx.lineTo(0.65, 0.8); this.ctx.lineTo(2, 0.8);
    this.ctx.closePath(); this.ctx.fill(); this.ctx.restore();

    const lx = x + w / 2 + 3;
    const lw = Math.min(95, this.w - lx - 22);
    this.ctx.strokeStyle = ib ? "rgba(22,163,74,.7)" : "rgba(255,59,59,.7)";
    this.ctx.lineWidth   = 1.2;
    this.ctx.beginPath(); this.ctx.moveTo(x + w / 2, y); this.ctx.lineTo(lx, y); this.ctx.stroke();
    this.ctx.beginPath(); this.ctx.moveTo(lx, y); this.ctx.lineTo(lx + lw, y); this.ctx.stroke();

    const ex = lx + lw; const er = 5;
    this.ctx.strokeStyle = cl; this.ctx.lineWidth = 2;
    this.ctx.fillStyle   = "#fff";
    this.ctx.beginPath(); this.ctx.arc(ex, y, er, 0, 2 * Math.PI);
    this.ctx.fill(); this.ctx.stroke();

    this.ctx.strokeStyle = ib ? "rgba(22,163,74,.5)" : "rgba(255,59,59,.5)";
    this.ctx.lineWidth   = 1.2;
    this.ctx.beginPath(); this.ctx.moveTo(ex + er, y); this.ctx.lineTo(ex + 65, y); this.ctx.stroke();

    if (m.closed && m.profitLoss !== null) {
      const pl     = m.profitLoss;
      const isWin  = pl >= 0;
      const plText = isWin ? `+$${this._fmtBal(pl)}` : `-$${this._fmtBal(Math.abs(pl))}`;
      const plColor  = isWin ? '#00ff41' : '#ff3b3b';
      const bgColor  = isWin ? 'rgba(0,255,65,0.18)' : 'rgba(255,59,59,0.18)';
      const textX    = ex + er + 4;
      this.ctx.font  = 'bold 11.5px Arial';
      const tw = this.ctx.measureText(plText).width;
      this.ctx.fillStyle   = bgColor;
      this.ctx.fillRect(textX - 3, y - 10, tw + 10, 17);
      this.ctx.strokeStyle = plColor; this.ctx.lineWidth = 0.8;
      this.ctx.strokeRect(textX - 3, y - 10, tw + 10, 17);
      this.ctx.fillStyle   = plColor;
      this.ctx.shadowColor = plColor; this.ctx.shadowBlur = 4;
      this.ctx.fillText(plText, textX + 2, y + 3);
      this.ctx.shadowBlur  = 0;
    }
    this.ctx.restore();
  }

  draw() {
    this.tickZoom();
    this.updatePan();
    this.updatePriceRange();
    this.tickSR();
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.drawGrid();

    const s = Math.floor(this.xToIndex(-60));
    const e = Math.ceil(this.xToIndex(this.w + 60));
    for (let i = Math.max(0, s); i < Math.min(this.candles.length, e); i++) {
      const x = this.indexToX(i);
      this.drawCandle(this.candles[i], x, false);
    }

    if (this.currentCandle && (!this.candles.length || this.currentCandle.timestamp !== this.candles[this.candles.length - 1].timestamp)) {
      const lx = this.indexToX(this.candles.length);
      if (lx >= -60 && lx <= this.w + 60) this.drawCandle(this.currentCandle, lx, true);
    }

    this.markers.forEach(m => this.drawMarker(m));
    this.updatePriceScale();
    this.updatePriceLabel();
    this.updateCandleTimer();
    this.updateTimeLabels();
  }

  updatePan() {
    const diff = this.targetOffsetX - this.offsetX;
    if (Math.abs(diff) > 0.003) { this.offsetX += diff * this.panEase; }
    else { this.offsetX = this.targetOffsetX; }
    if (Math.abs(this.velocity) > 0.01) { this.targetOffsetX += this.velocity; this.velocity *= 0.972; this.clampPan(); }
    else { this.velocity = 0; }
  }

  tickZoom() {
    const d = this.targetZoom - this.zoom;
    if (Math.abs(d) > 0.0001) this.zoom += d * this.zoomEase;
    else this.zoom = this.targetZoom;
  }

  tickSR() {
    const r = this.priceRange;
    if (this.smin === null) { this.smin = r.min; this.smax = r.max; return; }
    this.smin += (r.min - this.smin) * this.sre;
    this.smax += (r.max - this.smax) * this.sre;
  }

  applyZoomAround(mx, my, sc) {
    const oz = this.targetZoom;
    const nz = Math.max(this.minZoom, Math.min(this.maxZoom, oz * sc));
    if (Math.abs(nz - oz) < 0.001) return;
    const ratio = nz / oz;
    this.targetOffsetX = mx + (this.targetOffsetX - mx) * ratio;
    this.targetZoom    = nz;
    this.clampPan();
  }

  updateCurrentCandle() {
    if (!this.currentCandle) return;
    const t     = this.t0;
    const s     = this.seed + Math.floor(t / this.timeframe);
    const n     = Date.now();
    const e     = (n - t) / this.timeframe;
    const vb    = 0.0008 * (this.volScale || 1);
    const r1    = this.rndG(s); const r2 = this.rndG(s + 1); const r3 = this.rndG(s + 2);
    const r4    = this.rnd(s + 3); const r5 = this.rnd(s + 4); const r6 = this.rnd(s + 5);
    const v     = vb * (0.7 + Math.abs(r1) * 0.8) * Math.sqrt(e);
    const tb    = 0.00005 * (this.volScale || 1);
    const tr    = tb * r2 * 0.6;
    const dir   = r3 > 0 ? 1 : -1;
    const tc    = this.currentCandle.open + (dir * v + tr);
    const rg    = v * (0.2 + r4 * 0.6);
    const c     = +(tc + (r6 - 0.5) * v * 0.1).toFixed(this.digits);
    const hm    = rg * (0.3 + r5 * 0.7);
    const lm    = rg * (0.3 + (1 - r5) * 0.7);
    this.currentCandle.close = c;
    this.currentCandle.high  = +Math.max(this.currentCandle.open, c, this.currentCandle.high, this.currentCandle.open + hm, c + hm).toFixed(this.digits);
    this.currentCandle.low   = +Math.min(this.currentCandle.open, c, this.currentCandle.low,  this.currentCandle.open - lm, c - lm).toFixed(this.digits);
    this.currentPrice        = c;
    window.__qt_price        = c;
  }

  startRealtime() {
    setInterval(() => {
      if (this.isSwitching || !this.isMaster) return;
      const n = Date.now();
      const e = n - this.t0;
      if (e >= this.timeframe) {
        if (this.currentCandle && (!this.candles.length || this.currentCandle.timestamp !== this.candles[this.candles.length - 1].timestamp)) {
          const completed = { ...this.currentCandle };
          this.candles.push(completed);
          this.saveCompletedCandle(completed);
          if (this.candles.length > this.maxCandles) this.candles.shift();
        }
        this.t0 = Math.floor(n / this.timeframe) * this.timeframe;
        const lp = this.currentCandle ? this.currentCandle.close : this.currentPrice;
        this.currentCandle = this.genCandle(this.t0, lp);
        this.currentCandle.open = lp; this.currentCandle.close = lp;
        this.currentCandle.high = lp; this.currentCandle.low   = lp;
        this.currentPrice       = lp;
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

  updatePriceRange() {
    let v = [...this.candles];
    if (this.currentCandle && (!v.length || this.currentCandle.timestamp !== v[v.length - 1].timestamp)) v.push(this.currentCandle);
    if (!v.length) { this.priceRange = { min: 0.95 * this.basePrice, max: 1.05 * this.basePrice }; return; }
    const si = Math.floor(this.xToIndex(0));
    const ei = Math.ceil(this.xToIndex(this.w));
    const sl = v.slice(Math.max(0, si - 5), Math.min(v.length, ei + 5));
    if (!sl.length) { this.priceRange = { min: 0.95 * this.basePrice, max: 1.05 * this.basePrice }; return; }
    const mn = Math.min(...sl.map(c => c.low));
    const mx = Math.max(...sl.map(c => c.high));
    const pd = 0.15 * (mx - mn) || 0.000000001;
    this.priceRange = { min: mn - pd, max: mx + pd };
  }

  initEvents() {
    window.addEventListener("resize", () => this.setup());
    this.canvas.addEventListener("wheel", e => {
      e.preventDefault();
      const r  = this.canvas.getBoundingClientRect();
      const sc = e.deltaY > 0 ? 1 / 1.1 : 1.1;
      this.applyZoomAround(e.clientX - r.left, e.clientY - r.top, sc);
    }, { passive: false });

    const md = (x, t) => { this.drag = 1; this.dragStartX = x; this.dragStartOffset = this.targetOffsetX; this.velocity = 0; this.lastDragX = x; this.lastDragTime = t; };
    const mm = (x, t) => { if (this.drag) { const d = x - this.dragStartX; this.targetOffsetX = this.dragStartOffset + d; this.clampPan(); const dt = t - this.lastDragTime; if (dt > 0 && dt < 100) this.velocity = (x - this.lastDragX) * 0.6; this.lastDragX = x; this.lastDragTime = t; } };
    const mu = () => { this.drag = 0; this.updateTimeLabels(); };

    this.canvas.addEventListener("mousedown",  e => { const r = this.canvas.getBoundingClientRect(); md(e.clientX - r.left, Date.now()); });
    window.addEventListener("mousemove",       e => { const r = this.canvas.getBoundingClientRect(); mm(e.clientX - r.left, Date.now()); });
    window.addEventListener("mouseup",         mu);

    const db2 = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    this.canvas.addEventListener("touchstart", e => {
      const r = this.canvas.getBoundingClientRect();
      if (e.touches.length === 1) { md(e.touches[0].clientX - r.left, Date.now()); }
      else if (e.touches.length === 2) { this.drag = 0; this.pinch = 1; this.p0 = db2(e.touches[0], e.touches[1]); this.pMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left; this.pMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top; }
    }, { passive: false });
    this.canvas.addEventListener("touchmove", e => {
      e.preventDefault();
      const r = this.canvas.getBoundingClientRect();
      if (this.pinch && e.touches.length === 2) { const d = db2(e.touches[0], e.touches[1]); if (this.p0 > 0) this.applyZoomAround(this.pMidX, this.pMidY, Math.max(0.2, Math.min(5, d / (this.p0 || d)))); this.p0 = d; }
      else if (!this.pinch && e.touches.length === 1) { mm(e.touches[0].clientX - r.left, Date.now()); }
    }, { passive: false });
    this.canvas.addEventListener("touchend", e => { if (e.touches.length < 2) { this.pinch = 0; this.p0 = 0; mu(); } }, { passive: false });
  }

  loop() { this.draw(); requestAnimationFrame(() => this.loop()); }

  /* ✅ switchPair — تحميل مبدئي 1000 شمعة + باقي في الخلفية */
  async switchPair(pairName) {
    if (this.currentPair === pairName || this.isSwitching) return;
    console.log('🔀 Switching pair:', this.currentPair, '→', pairName);
    this.isSwitching = true;
    this.showLoading(true);
    try {
      await this._cleanupMasterViewer();
      this.currentPair  = pairName;
      this._lastCandleDoc = null;
      const cfg = this.PAIR_CONFIG[pairName] || { base: 1.0, digits: 5, seed: Math.abs(pairName.split('').reduce((h, c) => (h << 5) - h + c.charCodeAt(0), 0)), volScale: 1 };
      this.basePrice  = cfg.base;
      this.digits     = cfg.digits;
      this.seed       = cfg.seed;
      this.volScale   = cfg.volScale || 1;
      this.t0         = Math.floor(Date.now() / this.timeframe) * this.timeframe;
      this.markers    = [];
      this.firebaseManager.setPair(pairName);

      const result = await this.firebaseManager.loadCandles(this.INITIAL_LOAD);
      if (result && result.candles && result.candles.length > 0) {
        this.candles           = result.candles;
        this._lastCandleDoc    = result.lastDoc;
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
      this.updateTimeLabels();
      this.updatePriceRange();
      this.smin = this.priceRange.min;
      this.smax = this.priceRange.max;
      this.updatePriceScale();
      this.updatePriceLabel();

      await this._initMasterViewerSystem();

      if (this.authManager.user) {
        this.loadOpenTrades();
        this.loadTradeHistory();
      }

      /* ✅ باقي الشموع في الخلفية */
      if (this._lastCandleDoc) {
        setTimeout(() => this._loadRemainingCandles(), 3000);
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
     إدارة الرصيد
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
    const a = acc || this._getActiveAcc();
    this.authManager.setBalance(a, Math.max(0, Number(amount) || 0), { persist: true });
  }

  /* ============================================================
     ✅ فتح صفقة — بدون تعارض رصيد
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

    if (!rawVal || rawVal.trim() === '') { this._showMsg('اكتب مبلغ الصفقة الأول ❌', '#dc2626'); return; }

    const amount = parseFloat(rawVal);
    if (!Number.isFinite(amount) || amount <= 0) { this._showMsg('المبلغ غير صحيح ❌', '#dc2626'); return; }
    if (amount > 1000000) { this._showMsg('المبلغ كبير جداً ❌', '#dc2626'); return; }

    const bal = this._getBalanceFor(acc);
    if (bal < amount) { this._showMsg(`رصيدك غير كافٍ! المتوفر: $${this._fmtBal(bal)} ❌`, '#dc2626'); return; }

    const pairEl = document.getElementById('pairHudTxt');
    const pairTxt = pairEl ? pairEl.textContent.trim() : this.currentPair;
    const cfg     = this.PAIR_CONFIG[pairTxt] || this.PAIR_CONFIG[this.currentPair] || {};
    const payout  = cfg.payout || 0.85;
    const profit  = amount * payout;
    const dur     = this.selectedTime || 5;

    const dir     = direction === 'buy' ? 'up' : 'down';
    const tradeId = `trade_${Date.now()}_${++this._tradeCounter}`;

    /* ✅ خصم من الرصيد مباشرة عند الفتح */
    this._setBalanceFor(acc, bal - amount);

    const flagsEl = document.getElementById('pairFlags');
    const flags   = [];
    if (flagsEl) {
      flagsEl.querySelectorAll('img').forEach(img => {
        const src = img.src || '';
        const m   = src.match(/\/([a-z]{2})\.png/i);
        if (m) flags.push(m[1]);
      });
    }

    const trade = {
      id:          tradeId,
      pair:        pairTxt,
      dir,
      entry:       this.currentPrice,
      stake:       amount,
      payout,
      profit,
      duration:    dur,
      openTime:    Date.now(),
      closeTime:   Date.now() + dur * 1000,
      remain:      dur,
      amountTxt:   this._fmtBal(amount),
      account:     acc,
      flags,
      status:      'open',
      open:        true,
      markerCandleIndex:     this.candles.length,
      markerCandleTimestamp: this.currentCandle ? this.currentCandle.timestamp : null
    };

    this.addMarker(dir, tradeId, acc);

    if (window.tradeHistory) {
      const current = window.tradeHistory.getTrades ? window.tradeHistory.getTrades() : [];
      if (!current.find(t => t.id === trade.id)) {
        current.push(trade);
        window.tradeHistory.setTrades(current);
      }
    }

    if (this.authManager.user) {
      this._saveTradeToFirebase(trade).catch(e => console.warn('❌ Trade save error:', e));
    }

    this._refreshTradeBadge();
    this._showMsg(dir === 'up' ? '📈 BUY مفتوحة ✅' : '📉 SELL مفتوحة ✅', dir === 'up' ? '#16a34a' : '#dc2626');

    setTimeout(() => this._closeTrade(tradeId, trade), dur * 1000);
  }

  /* ============================================================
     ✅ إغلاق الصفقة
     ============================================================ */
  _closeTrade(tradeId, trade) {
    const currentP = this.currentPrice;
    const win  = (trade.dir === 'up' && currentP >= trade.entry) || (trade.dir === 'down' && currentP <= trade.entry);
    const pl   = win ? trade.profit : -trade.stake;

    if (window.tradeHistory) {
      const remaining = (window.tradeHistory.getTrades ? window.tradeHistory.getTrades() : []).filter(t => t.id !== tradeId);
      window.tradeHistory.setTrades(remaining);
    }

    /* ✅ تسوية الرصيد — الخصم تم عند الفتح، الآن نضيف الربح إن ربح */
    const acc = trade.account || 'demo';
    if (win) {
      const b = this._getBalanceFor(acc);
      this._setBalanceFor(acc, b + trade.stake + trade.profit);
    }
    /* إن خسر: لا شيء — الرصيد مخصوم مسبقاً */

    const mIdx = this.markers.findIndex(mk => mk.tradeId === tradeId);
    if (mIdx >= 0) { this.markers[mIdx].closed = true; this.markers[mIdx].profitLoss = pl; }

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
    this._showMsg(win ? `🎉 ربحت +$${this._fmtBal(trade.profit)}` : `❌ خسرت -$${this._fmtBal(trade.stake)}`, win ? '#16a34a' : '#dc2626');
  }

  /* ============================================================
     ✅ إضافة صفقة منتهية للسجل
     ============================================================ */
  _addClosedTradeToHistory(closedTrade) {
    this._closedTrades.unshift(closedTrade);

    if (window.tradeHistory) {
      if (typeof window.tradeHistory.addClosedTrade === 'function') {
        window.tradeHistory.addClosedTrade(closedTrade);
      } else if (typeof window.tradeHistory.addHistory === 'function') {
        window.tradeHistory.addHistory(closedTrade);
      }
      if (typeof window.tradeHistory.setHistory === 'function') {
        window.tradeHistory.setHistory([...this._closedTrades]);
      }
    }

    window.dispatchEvent(new CustomEvent('qt_trade_closed', {
      detail: { trade: closedTrade, allClosed: [...this._closedTrades] }
    }));

    console.log(`📝 صفقة منتهية: ${closedTrade.id} | ${closedTrade.result} | $${(closedTrade.profit||0).toFixed(2)}`);
  }

  /* ============================================================
     ✅ تحميل سجل الصفقات المنتهية من Firebase — مع uid
     ============================================================ */
  async loadTradeHistory() {
    if (!this.authManager.user) return;
    try {
      const uid      = this.authManager.user.uid;
      const tradesRef = collection(db, 'users', uid, 'trades');
      const q = query(tradesRef, where('status', '==', 'closed'), orderBy('closedAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      this._closedTrades = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        this._closedTrades.push({
          ...data,
          id:         docSnap.id,
          status:     'closed',
          result:     data.result || (( data.profit || 0) >= 0 ? 'win' : 'loss'),
          profit:     data.profit     || data.profitLoss || 0,
          profitLoss: data.profitLoss || data.profit     || 0,
          closedAt:   data.closedAt   || 0,
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

  /* ✅ حفظ صفقة في Firebase — بمفتاح uid */
  async _saveTradeToFirebase(trade) {
    if (!this.authManager.user) return;
    try {
      const uid      = this.authManager.user.uid;
      const tradeRef = doc(db, 'users', uid, 'trades', trade.id);
      const payload  = { ...trade };
      delete payload.open;
      payload.savedAt = serverTimestamp();
      await setDoc(tradeRef, payload);
    } catch(e) { console.error('❌ _saveTradeToFirebase error:', e); throw e; }
  }

  /* ✅ تحديث صفقة في Firebase — بمفتاح uid */
  async _updateTradeInFirebase(tradeId, updates) {
    if (!this.authManager.user) return;
    try {
      const uid      = this.authManager.user.uid;
      const tradeRef = doc(db, 'users', uid, 'trades', tradeId);
      await updateDoc(tradeRef, updates);
    } catch(e) { console.error('❌ _updateTradeInFirebase error:', e); throw e; }
  }

  /* ============================================================
     ✅ تحميل الصفقات المفتوحة — بمفتاح uid
     ============================================================ */
  async loadOpenTrades() {
    if (!this.authManager.user) return;
    try {
      const uid       = this.authManager.user.uid;
      const tradesRef = collection(db, 'users', uid, 'trades');
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
        const trade     = { ...docSnap.data(), id: docSnap.id };
        if (!trade.closeTime) continue;
        const remaining = trade.closeTime - now;
        if (remaining <= 0) {
          this._closeTrade(trade.id, trade);
        } else {
          if (window.tradeHistory && window.tradeHistory.getTrades) {
            const current = window.tradeHistory.getTrades();
            if (!current.find(t => t.id === trade.id)) {
              current.push({ ...trade, remain: Math.floor(remaining / 1000) });
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
      type:       trade.dir === 'up' ? 'buy' : 'sell',
      price:      trade.entry,
      candleIndex: candleIdx,
      tradeId:    trade.id,
      account:    trade.account,
      closed:     false,
      profitLoss: null
    });
  }

  _refreshTradeBadge() {
    try {
      const acc   = this._getActiveAcc();
      const open  = window.tradeHistory && window.tradeHistory.getTrades ? window.tradeHistory.getTrades() : [];
      const count = open.filter(t => (t.account || 'demo') === acc).length;
      this._updateTradeBadge(count);
    } catch(e) {}
  }

  _updateTradeBadge(count) {
    let badge = document.getElementById('_qtTradeBadge');
    if (!badge) {
      let histBtn = document.querySelector('#openHistory') ||
                   document.querySelector('#historyBtn')  ||
                   document.querySelector('[data-panel="history"]');
      if (!histBtn) {
        document.querySelectorAll('button').forEach(btn => {
          if (!histBtn && ((btn.id && btn.id.toLowerCase().includes('hist')) || (btn.className && btn.className.toLowerCase && btn.className.toLowerCase().includes('hist')))) histBtn = btn;
        });
      }
      if (!histBtn) return;
      badge = document.createElement('span');
      badge.id = '_qtTradeBadge';
      badge.style.cssText = 'position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;font-size:10px;font-weight:900;min-width:18px;height:18px;border-radius:9px;display:none;align-items:center;justify-content:center;padding:0 4px;z-index:10000;pointer-events:none;box-shadow:0 2px 6px rgba(0,0,0,.5);line-height:1';
      histBtn.style.position = 'relative';
      histBtn.appendChild(badge);
    }
    if (count > 0) { badge.textContent = count > 99 ? '99+' : String(count); badge.style.display = 'flex'; }
    else { badge.style.display = 'none'; }
  }

  _showMsg(text, color) {
    if (!document.getElementById('_qtToastCSS')) {
      const s = document.createElement('style');
      s.id = '_qtToastCSS';
      s.textContent = `@keyframes _qtFade{0%{opacity:0;transform:translateX(-50%) translateY(-14px)}12%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-8px)}}`;
      document.head.appendChild(s);
    }
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;top:68px;left:50%;transform:translateX(-50%);background:${color};color:#fff;padding:10px 22px;border-radius:12px;font-size:14px;font-weight:900;z-index:999999;box-shadow:0 4px 20px rgba(0,0,0,.5);white-space:nowrap;animation:_qtFade 2.4s forwards;pointer-events:none;letter-spacing:.3px;`;
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
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

let isEditingTime  = false;
let savedTimeValue = "00:05";

timeSelector.addEventListener("click", e => { e.stopPropagation(); if (!isEditingTime) timeDropdown.classList.toggle("show"); });
document.addEventListener("click", () => { timeDropdown.classList.remove("show"); if (isEditingTime) { timeDisplay.textContent = savedTimeValue; isEditingTime = false; } });
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
  const editVal = savedTimeValue.replace(':', '');
  timeDisplay.textContent = editVal;
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
    savedTimeValue = e.target.textContent;
    timeDisplay.textContent = savedTimeValue;
    chart.selectedTime = parseInt(e.target.getAttribute("data-sec"));
    timeDropdown.classList.remove("show");
  }
});

timeDisplay.addEventListener("input", e => {
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
    savedTimeValue = `${h}:${m}`;
    timeDisplay.textContent = savedTimeValue;
    const totalSec = parseInt(h) * 60 + parseInt(m);
    chart.selectedTime = totalSec > 0 ? totalSec : 5;
    isEditingTime = false;
  }
});

timeDisplay.addEventListener("keydown", function(e) { if (e.key === "Enter") { e.preventDefault(); this.blur(); } });

amountContainer.addEventListener("click",  () => amountDisplay.focus());
amountDisplay.addEventListener("focus",    function() { let v = this.value.replace("$",""); this.value = v; setTimeout(() => this.setSelectionRange(0, this.value.length), 10); });
amountDisplay.addEventListener("input",    function() { this.value = this.value.replace(/[^0-9.]/g, ""); });
amountDisplay.addEventListener("blur",     function() { let val = parseFloat(this.value) || 50; this.value = val + "$"; });
amountDisplay.addEventListener("keydown",  function(e) { if (e.key === "Enter") { e.preventDefault(); this.blur(); } });

document.getElementById("buyBtn").addEventListener("click",  () => chart.openTrade("buy"));
document.getElementById("sellBtn").addEventListener("click", () => chart.openTrade("sell"));

console.log('🚀 QT Trading Chart v4 — Fixed & Unified ✅');
