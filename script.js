import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, query,
  orderBy, limit, where, serverTimestamp, doc, getDoc,
  setDoc, updateDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

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
   ⏰ updateLiveTime
   ============================================================ */
function updateLiveTime() {
  const d = new Date();
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
  const t = new Date(utcMs + 3 * 3600000);
  const h = String(t.getHours()).padStart(2,"0");
  const m = String(t.getMinutes()).padStart(2,"0");
  const s = String(t.getSeconds()).padStart(2,"0");
  const el = document.getElementById("liveTime");
  if (el) el.textContent = `${h}:${m}:${s} UTC+3`;
}
updateLiveTime();
setInterval(updateLiveTime, 1000);

/* ============================================================
   🔐 AuthManager — يستخدم عناصر HTML الموجودة مباشرة
   ============================================================ */
class AuthManager {
  constructor() {
    this.user              = null;
    this.unsubscribeBalance = null;
    this.activeAccount     = 'real';
    this.realBalance       = 0;
    this.demoBalance       = 10000;
    this.balancesReady     = false;

    try {
      const ls = localStorage.getItem('qt_demo_balance');
      const v  = ls !== null ? parseFloat(ls) : NaN;
      if (Number.isFinite(v)) this.demoBalance = Math.max(0, v);
    } catch(e) {}

    this._bindUI();
    this.init();
  }

  _fmt(n) {
    try {
      return '$' + new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
    } catch(e) {
      return '$' + (Math.round(n * 100) / 100).toFixed(2);
    }
  }

  /* ── تحديث جميع عناصر العرض ── */
  _updateDisplays() {
    const realEl    = document.getElementById('realAmt');
    const demoEl    = document.getElementById('demoAmt');
    const balAmount = document.getElementById('balAmount');
    const balLabel  = document.getElementById('balLabel');
    const topIcon   = document.getElementById('topAccIcon');
    const avatarImg = document.getElementById('userAvatarImg');

    if (realEl)    realEl.textContent    = this._fmt(this.realBalance);
    if (demoEl)    demoEl.textContent    = this._fmt(this.demoBalance);

    const showAmt = this.activeAccount === 'real' ? this.realBalance : this.demoBalance;
    if (balAmount) balAmount.textContent = this._fmt(showAmt);
    if (balLabel)  balLabel.textContent  = this.activeAccount === 'real' ? 'QT Real USD' : 'QT Demo USD';
    if (topIcon)   topIcon.src           = this.activeAccount === 'real'
      ? 'https://flagcdn.com/w40/us.png'
      : 'https://cdn-icons-png.flaticon.com/128/1344/1344761.png';

    document.querySelectorAll('.accSwitchBtn').forEach(btn =>
      btn.classList.toggle('active', (btn.dataset.acc || 'demo') === this.activeAccount)
    );
    document.querySelectorAll('.accItem').forEach(it =>
      it.classList.toggle('active', (it.dataset.type || 'demo') === this.activeAccount)
    );
  }

  /* ── ربط أحداث القائمة الموجودة في HTML ── */
  _bindUI() {
    const balanceBox = document.getElementById('balanceBox');
    const accMenu    = document.getElementById('accMenu');
    const refillBtn  = document.getElementById('refillBtn');

    this._updateDisplays();

    /* فتح/إغلاق القائمة */
    if (balanceBox) {
      balanceBox.addEventListener('click', (e) => {
        if (e.target.closest('#accMenu')) return;
        e.stopPropagation();
        const isOpen = accMenu && accMenu.classList.contains('show');
        if (accMenu) accMenu.classList.toggle('show', !isOpen);
        balanceBox.classList.toggle('open', !isOpen);
      });
    }
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#balanceBox')) {
        if (accMenu) accMenu.classList.remove('show');
        if (balanceBox) balanceBox.classList.remove('open');
      }
    });
    if (accMenu) accMenu.addEventListener('click', e => e.stopPropagation());

    /* أزرار LIVE / Demo */
    document.querySelectorAll('.accSwitchBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.switchAccount(btn.dataset.acc || 'demo');
      });
    });

    /* بنود الحساب */
    document.querySelectorAll('.accItem').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.switchAccount(item.dataset.type || 'demo');
        if (accMenu)    accMenu.classList.remove('show');
        if (balanceBox) balanceBox.classList.remove('open');
      });
    });

    /* زر Refill */
    if (refillBtn) {
      refillBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.setBalance('demo', 10000, { persist: true });
        refillBtn.textContent = '✅ Refilled!';
        setTimeout(() => { refillBtn.textContent = '🔄 Refill Demo Account'; }, 1500);
      });
    }
  }

  async setBalance(type, amount, { persist = true } = {}) {
    const safeAmt = Math.max(0, Number(amount) || 0);
    if (type === 'real') this.realBalance = safeAmt;
    else                 this.demoBalance = safeAmt;

    this._updateDisplays();

    if (type === 'demo' && !this.user) {
      try { localStorage.setItem('qt_demo_balance', String(safeAmt)); } catch(e) {}
    }

    if (persist && this.user) {
      const uRef    = doc(db, 'users', this.user.uid);
      const payload = type === 'real' ? { balance: safeAmt } : { demobalance: safeAmt };
      updateDoc(uRef, payload).catch(e => console.warn('⚠️ Firebase balance sync:', e));
    }
  }

  switchAccount(type) {
    this.activeAccount = type;
    this._updateDisplays();
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
        /* تحديث صورة الأفاتار */
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) {
            const av = (snap.data().avatar || '').trim();
            const img = document.getElementById('userAvatarImg');
            if (img && av) img.src = av;
          }
        } catch(e) {}
        if (window.chart) {
          if (window.chart.dataLoaded) {
            window.chart.loadOpenTrades();
            window.chart.loadTradeHistory();
          } else {
            window.chart._pendingTradeLoad = true;
          }
        }
      } else {
        this.user         = null;
        this.balancesReady = false;
        this._updateDisplays();
        window.dispatchEvent(new CustomEvent('qt_history_loaded', { detail: [] }));
      }
    });
  }

  async loadUserBalance() {
    const uRef    = doc(db, 'users', this.user.uid);
    const uSnap   = await getDoc(uRef);

    if (!uSnap.exists()) {
      await setDoc(uRef, {
        email: this.user.email || '',
        balance: 0,
        demobalance: 10000,
        avatar: ''
      }, { merge: true });
    } else {
      const d = uSnap.data() || {};
      const patch = {};
      if (d.balance    == null) patch.balance    = 0;
      if (d.demobalance == null) patch.demobalance = 10000;
      if (d.avatar     == null) patch.avatar     = '';
      if (Object.keys(patch).length) await setDoc(uRef, patch, { merge: true });
    }

    if (this.unsubscribeBalance) {
      try { this.unsubscribeBalance(); } catch(e) {}
      this.unsubscribeBalance = null;
    }

    this.unsubscribeBalance = onSnapshot(uRef, (snap) => {
      const data = snap.data();
      if (!data) return;
      this.realBalance   = typeof data.balance     === 'number' ? data.balance     : 0;
      this.demoBalance   = typeof data.demobalance === 'number' ? data.demobalance : 10000;
      this.balancesReady = true;
      this._updateDisplays();
      try { localStorage.setItem('qt_demo_balance', String(this.demoBalance)); } catch(e) {}
    });
  }

  async updateBalance(type, amount) {
    if (!this.user) return;
    const uRef   = doc(db, 'users', this.user.uid);
    const field  = type === 'real' ? 'balance' : 'demobalance';
    const current = type === 'real' ? this.realBalance : this.demoBalance;
    const next    = current + amount;
    const payload = {};
    payload[field] = next;
    await updateDoc(uRef, payload);
  }
}

/* ============================================================
   💾 LocalStorageManager
   ============================================================ */
class LocalStorageManager {
  constructor() {
    this.BASE_KEY      = 'qt_trading_candles';
    this.BASE_SYNC_KEY = 'qt_last_sync';
  }
  _ck(pair) { return pair ? 'qt_trading_candles_' + pair.replace('/','_') : this.BASE_KEY; }
  _sk(pair) { return pair ? 'qt_last_sync_'       + pair.replace('/','_') : this.BASE_SYNC_KEY; }
  saveCandles(candles, pair) {
    try {
      localStorage.setItem(this._ck(pair), JSON.stringify(candles));
      localStorage.setItem(this._sk(pair), Date.now().toString());
    } catch(e) { console.error('❌ LS save error:', e); }
  }
  loadCandles(pair) {
    try {
      const data = localStorage.getItem(this._ck(pair));
      if (data) return JSON.parse(data);
    } catch(e) { console.error('❌ LS load error:', e); }
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
   ============================================================ */
class FirebaseManager {
  constructor() {
    this.db               = db;
    this.candlesCollection = 'candles';
    this.saveBatchSize    = 50;
    this.saveInterval     = 30000;
    this.lastSaveTime     = 0;
    this.pendingCandles   = [];
    this.isSaving         = false;
    this.startAutoSave();
  }

  setPair(pairName) {
    const key = 'candles_' + pairName.replace('/','_');
    if (this.candlesCollection !== key) {
      this.candlesCollection = key;
      this.pendingCandles    = [];
    }
  }

  addPendingCandle(candle) {
    this.pendingCandles.push(candle);
  }

  async saveCandles(candles) {
    if (this.isSaving) return false;
    try {
      this.isSaving = true;
      const batch   = [];
      for (const candle of candles) {
        const cd = { open:candle.open, high:candle.high, low:candle.low, close:candle.close, timestamp:candle.timestamp, savedAt:serverTimestamp() };
        batch.push(cd);
        if (batch.length >= this.saveBatchSize) {
          await this.saveBatch([...batch]);
          batch.length = 0;
          await this.delay(100);
        }
      }
      if (batch.length > 0) await this.saveBatch(batch);
      this.lastSaveTime = Date.now();
      return true;
    } catch(e) { console.error('❌ FB save error:', e); return false; }
    finally    { this.isSaving = false; }
  }

  async saveBatch(batch) {
    const promises = batch.map(cd => addDoc(collection(this.db, this.candlesCollection), cd));
    await Promise.all(promises);
  }

  async loadCandles(maxCandles = 10000) {
    try {
      const q = query(
        collection(this.db, this.candlesCollection),
        orderBy('timestamp','desc'),
        limit(maxCandles)
      );
      const snap   = await getDocs(q);
      const candles = [];
      const seen   = new Set();
      snap.forEach(ds => {
        const d = ds.data();
        if (!seen.has(d.timestamp)) {
          seen.add(d.timestamp);
          candles.push({ open:d.open, high:d.high, low:d.low, close:d.close, timestamp:d.timestamp });
        }
      });
      candles.reverse();
      return candles;
    } catch(e) { console.error('❌ FB load error:', e); return null; }
  }

  async clearOldCandles(daysToKeep = 7) {
    try {
      const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      const q = query(
        collection(this.db, this.candlesCollection),
        where('timestamp', '<', cutoff),
        limit(500)
      );
      const snap = await getDocs(q);
      const dels = snap.docs.map(d => d.ref.delete ? d.ref.delete() : Promise.resolve());
      await Promise.all(dels);
    } catch(e) { console.warn('⚠️ clearOldCandles error:', e); }
  }

  startAutoSave() {
    setInterval(async () => {
      if (this.pendingCandles.length > 0 && !this.isSaving) {
        const toSave        = [...this.pendingCandles];
        this.pendingCandles = [];
        await this.saveCandles(toSave);
      }
    }, this.saveInterval);
  }

  delay(ms) { return new Promise(r => setTimeout(r, ms)); }
}

/* ============================================================
   📊 AdvancedTradingChart
   ============================================================ */
class AdvancedTradingChart {
  constructor() {
    this.plot               = document.getElementById("plot");
    this.canvas             = document.getElementById("chartCanvas");
    this.ctx                = this.canvas.getContext("2d");
    this.timeLabels         = document.getElementById("timeLabels");
    this.candleTimer        = document.getElementById("candleTimer");
    this.priceLine          = document.getElementById("priceLine");
    this.priceScaleLabels   = document.getElementById("priceScaleLabels");
    this.currentPriceEl     = document.getElementById("currentPrice");
    this.loadingOverlay     = document.getElementById("loadingOverlay");

    this.authManager        = new AuthManager();
    this.localStorageManager = new LocalStorageManager();
    this.firebaseManager    = new FirebaseManager();

    this.PAIR_CONFIG = {
      'EUR/USD': { base:1.9500, digits:5, seed:11001, volScale:1 },
      'AUD/CAD': { base:0.9100, digits:5, seed:22001, volScale:0.95 },
      'AUD/CHF': { base:0.5700, digits:5, seed:33001, volScale:0.6 },
      'BHD/CNY': { base:2.6500, digits:4, seed:44001, volScale:2.7 },
      'EUR/RUB': { base:98.000, digits:3, seed:55001, volScale:100 },
      'KES/USD': { base:0.0077, digits:6, seed:66001, volScale:0.008 },
      'LBP/USD': { base:0.0111, digits:6, seed:77001, volScale:0.011 },
      'QAR/CNY': { base:1.9800, digits:5, seed:88001, volScale:2 },
      'USD/CHF': { base:0.8900, digits:5, seed:99001, volScale:0.9 },
      'SYP/TRY': { base:0.2800, digits:5, seed:10501, volScale:0.3 },
      'EGP/USD': { base:0.0205, digits:5, seed:11501, volScale:0.021 },
      'USD/INR': { base:83.500, digits:3, seed:12501, volScale:85 },
      'AED/CNY': { base:1.9800, digits:5, seed:13501, volScale:2 }
    };

    this.currentPair   = 'EUR/USD';
    this.isSwitching   = false;
    this.volScale      = 1;

    this.firebaseManager.setPair(this.currentPair);

    /* ── شموع: نظام التحميل التدريجي ── */
    this.INITIAL_CANDLES   = 200;    // شموع تُعرض عند الفتح
    this.LOAD_MORE_CANDLES = 100;    // شموع تُحمَّل عند التمرير
    this.allCandles        = [];     // كل الشموع المحمَّلة
    this.candles           = [];     // الشموع المعروضة حالياً
    this.isLoadingMore     = false;

    this.currentCandle     = null;
    this.maxCandles        = 10000;
    this.basePrice         = 1.95;
    this.currentPrice      = 1.9518;
    this.seed              = 11001;
    this.digits            = 5;
    this.priceRange        = { min:1.9, max:2 };
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
    this.usingLocalStorage  = false;
    this._tradeCounter     = 0;
    this._pendingTradeLoad  = false;
    this._closedTrades     = [];

    this.uid                    = 'uid_' + Date.now() + '_' + Math.random().toString(36).substr(2,9);
    this.isMaster               = false;
    this._masterBroadcastInterval = null;
    this._watchdogInterval      = null;
    this._liveUnsubscribe       = null;
    this._lastBroadcastedClose  = null;
    this.MASTER_TIMEOUT         = 12000;
    this.BROADCAST_INTERVAL     = 1000;

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

  /* ── مساعدات ── */
  _getPairKey()    { return this.currentPair.replace('/', '_'); }
  _getLiveStateRef() { return doc(db, 'trading_live', this._getPairKey()); }

  _setRoleBadge(role) {
    let badge = document.getElementById('_qtRoleBadge');
    if (!badge) {
      badge    = document.createElement('div');
      badge.id = '_qtRoleBadge';
      document.body.appendChild(badge);
    }
    badge.className  = role;
    badge.textContent = role === 'master' ? '👑 MASTER' : '👁️ VIEWER';
  }

  /* ============================================================
     Master / Viewer system
     ============================================================ */
  async _initMasterViewerSystem() {
    try {
      const claimed = await this._tryClaimMaster();
      if (claimed) {
        this.isMaster = true;
        this.allCandles = await this._fillAndSaveCandleGaps(this.allCandles);
        this.candles    = this.allCandles.slice(-this.INITIAL_CANDLES);
        this._startMasterBroadcast();
        this._setRoleBadge('master');
      } else {
        this.isMaster = false;
        this._startViewerSubscription();
        this._startWatchdog();
        this._setRoleBadge('viewer');
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
          masterUid: this.uid, masterHeartbeat: Date.now(),
          liveCandle: null, liveT0: this.t0, pair: this.currentPair
        });
        return true;
      }

      const data    = snap.data();
      const hb      = data.masterHeartbeat || 0;
      const isAlive = (Date.now() - hb) < this.MASTER_TIMEOUT;

      if (!isAlive || !data.masterUid) {
        await setDoc(stateRef, {
          masterUid: this.uid, masterHeartbeat: Date.now(),
          liveT0: this.t0, pair: this.currentPair
        }, { merge: true });
        return true;
      }
      return data.masterUid === this.uid;
    } catch(e) {
      console.warn('⚠️ _tryClaimMaster error:', e);
      return true;
    }
  }

  async _becomeMaster() {
    if (this._liveUnsubscribe) { try { this._liveUnsubscribe(); } catch(e) {} this._liveUnsubscribe = null; }
    try {
      const stateRef = this._getLiveStateRef();
      await setDoc(stateRef, {
        masterUid: this.uid, masterHeartbeat: Date.now(),
        liveT0: this.t0, pair: this.currentPair
      }, { merge: true });
    } catch(e) { console.warn('⚠️ _becomeMaster error:', e); }
    this.isMaster              = true;
    this._lastBroadcastedClose = null;
    this._startMasterBroadcast();
    this._setRoleBadge('master');
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

  _stopMasterBroadcast() {
    if (this._masterBroadcastInterval) {
      clearInterval(this._masterBroadcastInterval);
      this._masterBroadcastInterval = null;
    }
  }

  _startViewerSubscription() {
    if (this._liveUnsubscribe) { this._liveUnsubscribe(); this._liveUnsubscribe = null; }
    this._liveUnsubscribe = onSnapshot(this._getLiveStateRef(), (snap) => {
      if (!snap.exists() || this.isMaster || this.isSwitching) return;
      const data = snap.data();
      if (data.liveT0 && data.liveT0 !== this.t0 && this.t0 > 0) {
        if (this.currentCandle &&
            (!this.allCandles.length || this.currentCandle.timestamp !== this.allCandles[this.allCandles.length-1].timestamp)) {
          const completed = { ...this.currentCandle };
          this.allCandles.push(completed);
          if (this.allCandles.length > this.maxCandles) this.allCandles.shift();
          /* إضافة للشموع المعروضة أيضاً */
          if (!this.candles.length || completed.timestamp !== this.candles[this.candles.length-1].timestamp) {
            this.candles.push(completed);
            if (this.candles.length > this.maxCandles) this.candles.shift();
          }
          this.localStorageManager.saveCandles(this.allCandles, this.currentPair);
        }
      }
      if (data.liveT0)     this.t0            = data.liveT0;
      if (data.liveCandle) {
        this.currentCandle  = { ...data.liveCandle };
        this.currentPrice   = data.liveCandle.close;
        window.__qt_price   = this.currentPrice;
      }
    }, err => console.warn('⚠️ Viewer snapshot error:', err));
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
    }, 8000);
  }

  async _cleanupMasterViewer() {
    this._stopMasterBroadcast();
    if (this._watchdogInterval) { clearInterval(this._watchdogInterval); this._watchdogInterval = null; }
    if (this._liveUnsubscribe)  { try { this._liveUnsubscribe(); } catch(e) {} this._liveUnsubscribe = null; }
    if (this.isMaster) {
      try {
        await updateDoc(this._getLiveStateRef(), { masterUid: null, masterHeartbeat: 0 }).catch(() => {});
      } catch(e) {}
    }
    this.isMaster              = false;
    this._lastBroadcastedClose = null;
  }

  async _fillAndSaveCandleGaps(candles) {
    if (!candles || candles.length === 0) return candles || [];
    const lastTs    = candles[candles.length - 1].timestamp;
    const currentT0 = Math.floor(Date.now() / this.timeframe) * this.timeframe;

    if (currentT0 <= lastTs) return candles;

    const gaps = [];
    let prev   = candles[candles.length - 1];
    let t      = lastTs + this.timeframe;
    while (t < currentT0) {
      const g = this.genCandle(t, prev.close);
      gaps.push(g);
      prev = g;
      t   += this.timeframe;
    }

    if (gaps.length > 0) {
      try {
        await this.firebaseManager.saveCandles(gaps);
      } catch(e) {
        gaps.forEach(c => this.firebaseManager.addPendingCandle(c));
      }
      const result = [...candles, ...gaps];
      return result.length > this.maxCandles ? result.slice(result.length - this.maxCandles) : result;
    }
    return candles;
  }

  /* ============================================================
     تهيئة البيانات
     ============================================================ */
  async initData() {
    this.showLoading(true);
    try {
      const fbCandles = await this.firebaseManager.loadCandles(this.maxCandles);
      if (fbCandles && fbCandles.length > 0) {
        this.allCandles       = fbCandles;
        this.usingLocalStorage = false;
        this.localStorageManager.saveCandles(this.allCandles, this.currentPair);
      } else {
        const local = this.localStorageManager.loadCandles(this.currentPair);
        if (local && local.length > 0) {
          this.allCandles       = local;
          this.usingLocalStorage = true;
        } else {
          this.initHistoricalData();
          this.usingLocalStorage = true;
        }
      }

      /* عرض أول 200 شمعة فقط */
      this.candles = this.allCandles.slice(-this.INITIAL_CANDLES);

      if (this.allCandles.length > 0) this.currentPrice = this.allCandles[this.allCandles.length-1].close;
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
    } catch(e) {
      console.error('❌ initData error:', e);
      this.initHistoricalData();
      this.candles = this.allCandles.slice(-this.INITIAL_CANDLES);
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

  /* ── التحميل التدريجي عند التمرير ── */
  _checkLoadMore() {
    if (this.isLoadingMore) return;
    const firstVisible = Math.floor(this.xToIndex(0));
    if (firstVisible < 20 && this.candles.length < this.allCandles.length) {
      this._loadMoreCandles();
    }
  }

  _loadMoreCandles() {
    this.isLoadingMore = true;
    const currentStart  = this.allCandles.length - this.candles.length;
    const loadStart     = Math.max(0, currentStart - this.LOAD_MORE_CANDLES);
    const more          = this.allCandles.slice(loadStart, currentStart);
    if (more.length > 0) {
      const spacing           = this.getSpacing();
      this.candles            = [...more, ...this.candles];
      this.offsetX           -= more.length * spacing;
      this.targetOffsetX     -= more.length * spacing;
    }
    setTimeout(() => { this.isLoadingMore = false; }, 50);
  }

  showLoading(show) {
    if (this.loadingOverlay) this.loadingOverlay.classList.toggle('show', show);
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
    if (this.dataLoaded) {
      this.updatePriceLabel();
      this.updatePriceScale();
      this.updateTimeLabels();
    }
  }

  rnd(s)  { const x = Math.sin(s) * 10000; return x - Math.floor(x); }
  rndG(s) {
    const u1 = this.rnd(s), u2 = this.rnd(s + 100000);
    return Math.sqrt(-2 * Math.log(u1 + 0.00001)) * Math.cos(2 * Math.PI * u2);
  }

  genCandle(t, o) {
    const s  = this.seed + Math.floor(t / this.timeframe);
    const vb = 0.0008 * (this.volScale || 1);
    const tb = 0.00005 * (this.volScale || 1);
    const r1 = this.rndG(s), r2 = this.rndG(s+1), r3 = this.rndG(s+2);
    const r4 = this.rnd(s+3), r5 = this.rnd(s+4), r6 = this.rnd(s+5);
    const v   = vb * (0.7 + Math.abs(r1) * 0.8);
    const tr  = tb * r2 * 0.6;
    const dir = r3 > 0 ? 1 : -1;
    const tc  = o + (dir * v + tr);
    const rg  = v * (0.2 + r4 * 0.6);
    const hm  = rg * (0.3 + r5 * 0.7);
    const lm  = rg * (0.3 + (1-r5) * 0.7);
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

  initHistoricalData() {
    let p = this.basePrice;
    let t = Date.now() - this.maxCandles * this.timeframe;
    this.allCandles = [];
    for (let i = 0; i < this.maxCandles; i++) {
      const c = this.genCandle(t, p);
      this.allCandles.push(c);
      p = c.close;
      t += this.timeframe;
    }
    this.candles = this.allCandles.slice(-this.INITIAL_CANDLES);
  }

  /* ── حساب المحاور ── */
  getSpacing()    { return this.baseSpacing * this.zoom; }
  getCandleWidth(){ return Math.max(1, this.getSpacing() * 0.65); }
  snapToLive()    { this.targetOffsetX = 0; this.offsetX = 0; }
  clampPan() {
    const maxLeft = -(this.candles.length * this.getSpacing() - this.w * 0.35);
    this.targetOffsetX = Math.min(this.w * 0.1, Math.max(maxLeft, this.targetOffsetX));
  }
  indexToX(i) { return this.w - (this.candles.length - i) * this.getSpacing() + this.offsetX; }
  xToIndex(x) { return (x - this.w + this.candles.length * this.getSpacing() - this.offsetX) / this.getSpacing(); }

  getPriceRange() {
    return { min: this.smin !== null ? this.smin : this.priceRange.min,
             max: this.smax !== null ? this.smax : this.priceRange.max };
  }

  calcNiceGrid() {
    const r     = this.getPriceRange();
    const range = r.max - r.min || 0.0001;
    const step  = this._niceStep(range / 8);
    const min   = Math.floor(r.min / step) * step;
    const count = Math.ceil((r.max - min) / step) + 2;
    return { min, step, count };
  }

  _niceStep(s) {
    const p = Math.pow(10, Math.floor(Math.log10(s)));
    const f = s / p;
    if      (f < 1.5) return p;
    else if (f < 3.5) return 2 * p;
    else if (f < 7.5) return 5 * p;
    return 10 * p;
  }

  updatePan() {
    const diff = this.targetOffsetX - this.offsetX;
    if (Math.abs(diff) > 0.003) {
      this.offsetX += diff * this.panEase;
    } else {
      this.offsetX = this.targetOffsetX;
    }
    if (Math.abs(this.velocity) > 0.01) {
      this.targetOffsetX += this.velocity;
      this.velocity      *= 0.972;
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

  tickSR() {
    const r = this.priceRange;
    if (this.smin === null) { this.smin = r.min; this.smax = r.max; return; }
    this.smin += (r.min - this.smin) * this.sre;
    this.smax += (r.max - this.smax) * this.sre;
  }

  applyZoomAround(mx, my, sc) {
    const oz = this.targetZoom;
    const nz = Math.max(this.minZoom, Math.min(this.maxZoom, oz * sc));
    if (Math.abs(nz - oz) < 0.0001) return;
    const idxAtMouse = this.xToIndex(mx);
    this.targetZoom  = nz;
    this.targetOffsetX = mx - (this.candles.length - idxAtMouse) * this.getSpacing() * (nz / oz);
    this.clampPan();
  }

  drawGrid() {
    const { min, step, count } = this.calcNiceGrid();
    for (let i = 0; i < count; i++) {
      const p = min + i * step;
      const y = this.priceToY(p);
      if (y < -5 || y > this.h + 5) continue;
      const mj = (i % 5 === 0);
      this.ctx.strokeStyle = mj ? "rgba(255,215,0,.12)" : "rgba(255,255,255,.05)";
      this.ctx.lineWidth   = mj ? 1 : 0.8;
      this.ctx.beginPath(); this.ctx.moveTo(0, y+0.5); this.ctx.lineTo(this.w, y+0.5); this.ctx.stroke();
    }
    const visC  = this.w / this.getSpacing();
    const stepC = Math.max(1, Math.round(visC / 9));
    const s = Math.floor(this.xToIndex(0));
    const e = Math.ceil(this.xToIndex(this.w));
    for (let i = s; i <= e; i++) {
      const x = this.indexToX(i);
      if (x < -5 || x > this.w + 5) continue;
      const mj = (i % Math.round(stepC * 5) === 0);
      this.ctx.strokeStyle = mj ? "rgba(255,215,0,.12)" : "rgba(255,255,255,.05)";
      this.ctx.lineWidth   = mj ? 1 : 0.8;
      this.ctx.beginPath(); this.ctx.moveTo(x+0.5, 0); this.ctx.lineTo(x+0.5, this.h); this.ctx.stroke();
    }
  }

  updateTimeLabels() {
    const tl    = this.timeLabels;
    tl.innerHTML = "";
    const visC  = this.w / this.getSpacing();
    const stepC = Math.max(1, Math.round(visC / 9));
    const s     = Math.floor(this.xToIndex(0));
    const e     = Math.ceil(this.xToIndex(this.w));
    const tS    = this.candles.length ? this.candles[0].timestamp : this.t0;
    for (let i = s; i <= e; i++) {
      if (i % stepC !== 0) continue;
      const x = this.indexToX(i);
      if (x < 5 || x > this.w - 5) continue;
      const t   = tS + i * this.timeframe;
      const d   = new Date(t);
      const hh  = String(d.getHours()).padStart(2,"0");
      const mm  = String(d.getMinutes()).padStart(2,"0");
      const lb  = document.createElement("div");
      lb.className = "timeLabel";
      if (i % Math.round(stepC * 5) === 0) lb.classList.add("major");
      lb.style.left    = x + "px";
      lb.textContent   = `${hh}:${mm}`;
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
      const mj = (i % 5 === 0);
      h += `<div class="pLabel${mj?' major':''}" style="top:${y}px">${p.toFixed(this.digits)}</div>`;
    }
    this.priceScaleLabels.innerHTML = h;
  }

  updatePriceLabel() {
    const py = this.priceToY(this.currentPrice);
    this.priceLine.style.top       = py + "px";
    this.currentPriceEl.style.top  = py + "px";
    this.currentPriceEl.textContent = this.currentPrice.toFixed(this.digits);
  }

  updateCandleTimer() {
    if (!this.currentCandle) return;
    const e  = Date.now() - this.t0;
    const r  = this.timeframe - e;
    const s  = Math.floor(r / 1000);
    this.candleTimer.textContent    = s >= 0 ? s : 0;
    const cx = this.indexToX(this.candles.length);
    this.candleTimer.style.left    = (cx + 15) + "px";
    this.candleTimer.style.top     = "10px";
    this.candleTimer.style.display = 'block';
  }

  priceToY(p) {
    const r = this.getPriceRange();
    const n = (p - r.min) / (r.max - r.min);
    return this.h * (1 - n);
  }

  drawCandle(c, x, glow) {
    const oy = this.priceToY(c.open),  cy = this.priceToY(c.close);
    const hy = this.priceToY(c.high),  ly = this.priceToY(c.low);
    const b  = c.close >= c.open;
    const w  = this.getCandleWidth();
    this.ctx.strokeStyle = b ? "#0f0" : "#f00";
    this.ctx.lineWidth   = Math.max(1, 0.18 * w);
    this.ctx.beginPath(); this.ctx.moveTo(x, hy); this.ctx.lineTo(x, ly); this.ctx.stroke();
    const bh = Math.max(1, Math.abs(cy - oy));
    const bt = Math.min(oy, cy);
    const g  = this.ctx.createLinearGradient(x, bt, x, bt + bh);
    if (b) { g.addColorStop(0,"#0f0"); g.addColorStop(0.5,"#0f0"); g.addColorStop(1,"#0c0"); }
    else   { g.addColorStop(0,"#f00"); g.addColorStop(0.5,"#f00"); g.addColorStop(1,"#c00"); }
    this.ctx.fillStyle = g;
    if (glow) { this.ctx.shadowColor = b ? "rgba(0,255,0,.8)" : "rgba(255,0,0,.8)"; this.ctx.shadowBlur = 12; }
    this.ctx.fillRect(x - w/2, bt, w, bh);
    if (glow) this.ctx.shadowBlur = 0;
  }

  addMarker(t, tradeId, account) {
    const op = this.currentPrice;
    const c  = this.currentCandle;
    if (!c) return;
    const bt = Math.max(c.open, c.close);
    const bb = Math.min(c.open, c.close);
    let fp   = op;
    if      (op > bt) fp = bt;
    else if (op < bb) fp = bb;
    this.markers.push({
      type:       t,
      price:      fp,
      candleIndex: this.candles.length,
      candleTimestamp: this.t0,
      tradeId,
      account:    account || 'demo',
      closed:     false,
      profitLoss: null
    });
  }

  drawMarker(m) {
    const candleOffset = this.candles.length - (m.candleIndex || 0);
    const x = this.indexToX(this.candles.length - candleOffset);
    if (x < -50 || x > this.w + 50) return;
    const y  = this.priceToY(m.price);
    const w  = this.getCandleWidth();
    const ib = m.type === "buy";
    const cl = ib ? "#16a34a" : "#ff3b3b";
    const r  = 5.5;

    this.ctx.save();
    this.ctx.shadowColor = cl; this.ctx.shadowBlur = 9;
    this.ctx.fillStyle   = cl;
    this.ctx.beginPath(); this.ctx.arc(x, y, r, 0, 2*Math.PI); this.ctx.fill();
    this.ctx.shadowBlur  = 0;

    this.ctx.fillStyle = "#fff";
    this.ctx.save(); this.ctx.translate(x, y);
    if (!ib) this.ctx.rotate(Math.PI);
    this.ctx.beginPath();
    this.ctx.moveTo(0,-2.8); this.ctx.lineTo(-2,0.8); this.ctx.lineTo(-0.65,0.8);
    this.ctx.lineTo(-0.65,2.8); this.ctx.lineTo(0.65,2.8); this.ctx.lineTo(0.65,0.8);
    this.ctx.lineTo(2,0.8); this.ctx.closePath(); this.ctx.fill();
    this.ctx.restore();

    const lx = x + w/2 + 3;
    const lw = Math.min(95, this.w - lx - 22);
    this.ctx.strokeStyle = ib ? "rgba(22,163,74,.7)" : "rgba(255,59,59,.7)";
    this.ctx.lineWidth   = 1.2;
    this.ctx.beginPath(); this.ctx.moveTo(x + w/2, y); this.ctx.lineTo(lx, y); this.ctx.stroke();
    this.ctx.beginPath(); this.ctx.moveTo(lx, y); this.ctx.lineTo(lx + lw, y); this.ctx.stroke();

    const ex = lx + lw, er = 5;
    this.ctx.strokeStyle = cl; this.ctx.lineWidth = 2;
    this.ctx.fillStyle   = "#fff";
    this.ctx.beginPath(); this.ctx.arc(ex, y, er, 0, 2*Math.PI); this.ctx.fill(); this.ctx.stroke();

    if (m.closed && m.profitLoss !== null) {
      const pl     = m.profitLoss;
      const isWin  = pl >= 0;
      const plText = isWin ? `+$${this._fmtBal(pl)}` : `-$${this._fmtBal(Math.abs(pl))}`;
      const plColor = isWin ? '#00ff41' : '#ff3b3b';
      const bgColor = isWin ? 'rgba(0,255,65,0.18)' : 'rgba(255,59,59,0.18)';
      const textX = ex + er + 4;
      this.ctx.font      = 'bold 11.5px Arial';
      const tw = this.ctx.measureText(plText).width;
      this.ctx.fillStyle = bgColor;
      this.ctx.fillRect(textX - 3, y - 10, tw + 10, 17);
      this.ctx.strokeStyle = plColor; this.ctx.lineWidth = 0.8;
      this.ctx.strokeRect(textX - 3, y - 10, tw + 10, 17);
      this.ctx.fillStyle  = plColor;
      this.ctx.shadowColor = plColor; this.ctx.shadowBlur = 4;
      this.ctx.fillText(plText, textX + 2, y + 3);
      this.ctx.shadowBlur = 0;
    }
    this.ctx.restore();
  }

  /* ── رسم الإطار ── */
  draw() {
    this.tickZoom();
    this.updatePan();
    this.updatePriceRange();
    this.tickSR();
    this._checkLoadMore();   /* ← تحميل تدريجي */
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.drawGrid();

    for (let i = 0; i < this.candles.length; i++) {
      const x = this.indexToX(i);
      if (x < -60 || x > this.w + 60) continue;
      this.drawCandle(this.candles[i], x, false);
    }

    if (this.currentCandle &&
        (!this.candles.length || this.currentCandle.timestamp !== this.candles[this.candles.length-1].timestamp)) {
      const lx = this.indexToX(this.candles.length);
      if (lx >= -60 && lx <= this.w + 60) this.drawCandle(this.currentCandle, lx, true);
    }

    this.markers.forEach(m => this.drawMarker(m));
    this.updatePriceLabel();
    this.updatePriceScale();
    this.updateCandleTimer();
  }

  /* ── Real-time ── */
  updateCurrentCandle() {
    if (!this.currentCandle) return;
    const s  = this.seed + Math.floor(this.t0 / this.timeframe);
    const frac = (Date.now() - this.t0) / this.timeframe;
    const r1 = this.rndG(s), r2 = this.rndG(s+1), r3 = this.rndG(s+2);
    const r4 = this.rnd(s+3);
    const vb  = 0.0008 * (this.volScale || 1);
    const v   = vb * (0.7 + Math.abs(r1) * 0.8) * frac;
    const dir = r3 > 0 ? 1 : -1;
    const mp  = this.currentCandle.open + dir * v + this.rndG(s + Math.floor(Date.now()/500)) * vb * 0.3;
    this.currentCandle.close = +mp.toFixed(this.digits);
    this.currentCandle.high  = +Math.max(this.currentCandle.open, mp, this.currentCandle.high + r4*vb*0.1).toFixed(this.digits);
    this.currentCandle.low   = +Math.min(this.currentCandle.open, mp, this.currentCandle.low  - r4*vb*0.1).toFixed(this.digits);
    this.currentPrice        = this.currentCandle.close;
    window.__qt_price        = this.currentPrice;
  }

  startRealtime() {
    setInterval(() => {
      if (this.isSwitching || !this.isMaster) return;
      const n = Date.now(), e = n - this.t0;
      if (e >= this.timeframe) {
        if (this.currentCandle &&
            (!this.allCandles.length || this.currentCandle.timestamp !== this.allCandles[this.allCandles.length-1].timestamp)) {
          const done = { ...this.currentCandle };
          this.allCandles.push(done);
          this.saveCompletedCandle(done);
          if (this.allCandles.length > this.maxCandles) this.allCandles.shift();
          /* إضافة للشموع المعروضة */
          if (!this.candles.length || done.timestamp !== this.candles[this.candles.length-1].timestamp) {
            this.candles.push(done);
            if (this.candles.length > this.maxCandles) this.candles.shift();
          }
        }
        this.t0 = Math.floor(n / this.timeframe) * this.timeframe;
        const lp = this.currentCandle ? this.currentCandle.close : this.currentPrice;
        this.currentCandle = { open:lp, close:lp, high:lp, low:lp, timestamp:this.t0 };
        this.currentPrice  = lp;
        this._lastBroadcastedClose = null;
      } else {
        this.updateCurrentCandle();
      }
    }, 200);

    setInterval(() => {
      if (!this.isSwitching && this.isMaster)
        this.localStorageManager.saveCandles(this.allCandles, this.currentPair);
    }, 10000);
  }

  async saveCompletedCandle(candle) {
    try { this.firebaseManager.addPendingCandle(candle); }
    catch(e) { console.error('❌ Queue error:', e); }
  }

  updatePriceRange() {
    const v  = [...this.candles];
    if (this.currentCandle && (!v.length || this.currentCandle.timestamp !== v[v.length-1].timestamp))
      v.push(this.currentCandle);
    if (!v.length) { this.priceRange = { min: 0.95 * this.basePrice, max: 1.05 * this.basePrice }; return; }

    const si = Math.floor(this.xToIndex(0));
    const ei = Math.ceil(this.xToIndex(this.w));
    const sl = v.slice(Math.max(0, si-5), Math.min(v.length, ei+5));
    if (!sl.length) { this.priceRange = { min: 0.95 * this.basePrice, max: 1.05 * this.basePrice }; return; }

    const lo = sl.map(c => c.low),  hi = sl.map(c => c.high);
    const mn = Math.min(...lo),      mx = Math.max(...hi);
    const pd = 0.15 * (mx - mn) || 0.000000001;
    this.priceRange = { min: mn - pd, max: mx + pd };
  }

  /* ── أحداث الإدخال ── */
  initEvents() {
    addEventListener("resize", () => this.setup());

    this.canvas.addEventListener("wheel", e => {
      e.preventDefault();
      const r  = this.canvas.getBoundingClientRect();
      const sc = e.deltaY > 0 ? 1/1.1 : 1.1;
      this.applyZoomAround(e.clientX - r.left, e.clientY - r.top, sc);
    }, { passive: false });

    const md = (x, t) => {
      this.drag = 1; this.dragStartX = x;
      this.dragStartOffset = this.targetOffsetX;
      this.velocity = 0; this.lastDragX = x; this.lastDragTime = t;
    };
    const mm = (x, t) => {
      if (!this.drag) return;
      const d = x - this.dragStartX;
      this.targetOffsetX = this.dragStartOffset + d;
      this.clampPan();
      const dt = t - this.lastDragTime;
      if (dt > 0 && dt < 50) this.velocity = (x - this.lastDragX) * 0.5;
      this.lastDragX = x; this.lastDragTime = t;
    };
    const mu = () => { this.drag = 0; this.updateTimeLabels(); };

    this.canvas.addEventListener("mousedown", e => {
      const r = this.canvas.getBoundingClientRect();
      md(e.clientX - r.left, Date.now());
    });
    addEventListener("mousemove", e => {
      const r = this.canvas.getBoundingClientRect();
      mm(e.clientX - r.left, Date.now());
    });
    addEventListener("mouseup", mu);

    const db2 = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    this.canvas.addEventListener("touchstart", e => {
      const r = this.canvas.getBoundingClientRect();
      if (e.touches.length === 1) {
        md(e.touches[0].clientX - r.left, Date.now());
      } else if (e.touches.length === 2) {
        this.drag = 0; this.pinch = 1;
        this.p0   = db2(e.touches[0], e.touches[1]);
        this.pMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        this.pMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
      }
    }, { passive: false });

    this.canvas.addEventListener("touchmove", e => {
      e.preventDefault();
      const r = this.canvas.getBoundingClientRect();
      if (this.pinch && e.touches.length === 2) {
        const d  = db2(e.touches[0], e.touches[1]);
        const sc = Math.max(0.2, Math.min(5, d / (this.p0 || d)));
        this.applyZoomAround(this.pMidX, this.pMidY, sc);
        this.p0 = d;
      } else if (!this.pinch && e.touches.length === 1) {
        mm(e.touches[0].clientX - r.left, Date.now());
      }
    }, { passive: false });

    this.canvas.addEventListener("touchend", e => {
      if (e.touches.length < 2) { this.pinch = 0; this.p0 = 0; mu(); }
    }, { passive: false });
  }

  loop() { this.draw(); requestAnimationFrame(() => this.loop()); }

  /* ============================================================
     تبديل الزوج
     ============================================================ */
  async switchPair(pairName) {
    if (this.currentPair === pairName || this.isSwitching) return;
    this.isSwitching = true;
    this.showLoading(true);
    try {
      await this._cleanupMasterViewer();
      this.currentPair = pairName;

      const cfg = this.PAIR_CONFIG[pairName] || {
        base:   1.0,
        digits: 5,
        seed:   Math.abs(pairName.split('').reduce((h,c) => (((h << 5) - h) + c.charCodeAt(0)) | 0, 0)) % 90000 + 10000,
        volScale: 1
      };
      this.basePrice = cfg.base;
      this.digits    = cfg.digits;
      this.seed      = cfg.seed;
      this.volScale  = cfg.volScale;
      this.currentPrice = cfg.base;
      this.t0 = Math.floor(Date.now() / this.timeframe) * this.timeframe;
      this.firebaseManager.setPair(pairName);

      const fbCandles = await this.firebaseManager.loadCandles(this.maxCandles);
      if (fbCandles && fbCandles.length > 0) {
        this.allCandles       = fbCandles;
        this.usingLocalStorage = false;
        this.localStorageManager.saveCandles(this.allCandles, pairName);
      } else {
        const local = this.localStorageManager.loadCandles(pairName);
        if (local && local.length > 0) {
          this.allCandles       = local;
          this.usingLocalStorage = true;
        } else {
          this.initHistoricalData();
          this.usingLocalStorage = true;
        }
      }

      this.candles = this.allCandles.slice(-this.INITIAL_CANDLES);
      if (this.allCandles.length > 0) this.currentPrice = this.allCandles[this.allCandles.length-1].close;
      this.markers = [];
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
  _getActiveAcc()  { return this.authManager.activeAccount || 'demo'; }
  _fmtBal(n) {
    try { return new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n); }
    catch(e) { return (Math.round(n*100)/100).toFixed(2); }
  }
  _getBalanceFor(acc) {
    return (acc || this._getActiveAcc()) === 'real'
      ? (this.authManager.realBalance || 0)
      : (this.authManager.demoBalance || 0);
  }
  _setBalanceFor(acc, amount) {
    this.authManager.setBalance(acc || this._getActiveAcc(), Math.max(0, Number(amount) || 0), { persist: true });
  }

  /* ============================================================
     فتح صفقة
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
      this._showMsg('مبلغ غير صالح ❌', '#dc2626');
      return;
    }

    const bal = this._getBalanceFor(acc);
    if (amount > bal) {
      this._showMsg('الرصيد غير كافٍ ❌', '#dc2626');
      return;
    }

    const pairEl = document.getElementById('pairHudTxt');
    const pair   = pairEl ? pairEl.textContent : this.currentPair;

    /* خصم الرصيد */
    this._setBalanceFor(acc, bal - amount);

    const payout   = 0.85;
    const duration = this.selectedTime || 5;
    const dir      = direction === 'buy' ? 'up' : 'down';
    const tradeId  = `t_${Date.now()}_${++this._tradeCounter}`;

    /* الأعلام */
    const pairCfg  = [pair.split('/')[0], pair.split('/')[1]];
    const fM       = {AED:"ae",CNY:"cn",AUD:"au",CAD:"ca",CHF:"ch",BHD:"bh",EUR:"eu",RUB:"ru",USD:"us",KES:"ke",LBP:"lb",QAR:"qa",TRY:"tr",SYP:"sy",EGP:"eg",INR:"in",IRR:"ir"};
    const toCC     = c => (fM[c.toUpperCase()] || c.toLowerCase()).toLowerCase();

    const trade = {
      id:         tradeId,
      dir,
      entry:      this.currentPrice,
      stake:      amount,
      amountTxt:  this._fmtBal(amount),
      payout,
      pair,
      flags:      [toCC(pairCfg[0]), toCC(pairCfg[1])],
      account:    acc,
      openTime:   Date.now(),
      closeTime:  Date.now() + duration * 1000,
      remain:     duration,
      status:     'open',
      open:       true,
      markerCandleIndex:     this.candles.length,
      markerCandleTimestamp: this.t0
    };

    /* أضف للشارت */
    this.addMarker(dir === 'up' ? 'buy' : 'sell', tradeId, acc);

    /* أضف للسجل */
    if (window.tradeHistory) {
      const current = window.tradeHistory.getTrades ? window.tradeHistory.getTrades() : [];
      if (!current.find(t => t.id === tradeId)) {
        current.push(trade);
        window.tradeHistory.setTrades(current);
      }
    }

    /* احفظ في Firebase */
    if (this.authManager.user) {
      this._saveTradeToFirebase(trade).catch(e => console.warn('❌ Trade save error:', e));
    }

    this._refreshTradeBadge();
    setTimeout(() => this._closeTrade(tradeId, trade), duration * 1000);
  }

  /* ============================================================
     إغلاق الصفقة
     ============================================================ */
  _closeTrade(tradeId, trade) {
    const currentP = this.currentPrice;
    const win      = (trade.dir === 'up'   && currentP >= trade.entry) ||
                     (trade.dir === 'down' && currentP <= trade.entry);
    const profit   = win ? trade.stake * trade.payout : 0;
    const pl       = win ? profit : -trade.stake;

    /* حذف من السجل المفتوح */
    if (window.tradeHistory) {
      const remaining = (window.tradeHistory.getTrades ? window.tradeHistory.getTrades() : [])
                          .filter(t => t.id !== tradeId);
      window.tradeHistory.setTrades(remaining);
    }

    /* تسوية الرصيد */
    const acc = trade.account || 'demo';
    if (win) {
      const b = this._getBalanceFor(acc);
      this._setBalanceFor(acc, b + trade.stake + profit);
    }

    /* تحديث الماركر */
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
     إضافة صفقة منتهية للسجل
     ============================================================ */
  _addClosedTradeToHistory(closedTrade) {
    this._closedTrades.unshift(closedTrade);

    if (window.tradeHistory) {
      if (typeof window.tradeHistory.addHistory     === 'function') window.tradeHistory.addHistory(closedTrade);
      if (typeof window.tradeHistory.addClosedTrade === 'function') window.tradeHistory.addClosedTrade(closedTrade);
      if (typeof window.tradeHistory.setHistory     === 'function') window.tradeHistory.setHistory([...this._closedTrades]);
    }

    window.dispatchEvent(new CustomEvent('qt_trade_closed', {
      detail: { trade: closedTrade, allClosed: [...this._closedTrades] }
    }));
  }

  /* ============================================================
     تحميل سجل الصفقات المنتهية
     ============================================================ */
  async loadTradeHistory() {
    if (!this.authManager.user) return;
    try {
      const email     = this.authManager.user.email;
      const tradesRef = collection(db, 'users', email, 'trades');
      const q = query(tradesRef, where('status','==','closed'), orderBy('closedAt','desc'), limit(100));
      const snap = await getDocs(q);
      this._closedTrades = [];
      snap.forEach(ds => {
        const d = ds.data();
        this._closedTrades.push({
          ...d, id: ds.id,
          status:     'closed',
          result:     d.result || (d.profit >= 0 ? 'win' : 'loss'),
          profit:     d.profit     || d.profitLoss || 0,
          profitLoss: d.profitLoss || d.profit     || 0,
          closedAt:   d.closedAt   || 0,
          open: false
        });
      });

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

  /* ============================================================
     تحميل الصفقات المفتوحة
     ============================================================ */
  async loadOpenTrades() {
    if (!this.authManager.user) return;
    try {
      const email     = this.authManager.user.email;
      const tradesRef = collection(db, 'users', email, 'trades');
      const q         = query(tradesRef, where('status','==','open'));
      const snap      = await getDocs(q);

      if (snap.empty) {
        this._refreshTradeBadge();
        await this.loadTradeHistory();
        return;
      }

      if (window.tradeHistory) window.tradeHistory.setTrades([]);
      this.markers = [];
      const now    = Date.now();

      for (const ds of snap.docs) {
        const trade = { ...ds.data(), id: ds.id };
        if (!trade.closeTime) continue;

        if (trade.closeTime <= now) {
          /* الصفقة انتهت وقتها أثناء غيابنا */
          await this._updateTradeInFirebase(trade.id, { status:'closed', open:false });
          continue;
        }

        const remaining = trade.closeTime - now;
        trade.remain    = Math.floor(remaining / 1000);

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

      this._refreshTradeBadge();
      await this.loadTradeHistory();
    } catch(e) { console.error('❌ loadOpenTrades error:', e); }
  }

  _restoreTradeMarker(trade) {
    let candleIdx = trade.markerCandleIndex || 0;
    if (trade.markerCandleTimestamp) {
      for (let i = 0; i < this.candles.length; i++) {
        if (this.candles[i].timestamp === trade.markerCandleTimestamp) {
          candleIdx = i; break;
        }
      }
    }
    this.markers.push({
      type:       trade.dir === 'up' ? 'buy' : 'sell',
      price:      trade.entry || this.currentPrice,
      candleIndex: candleIdx,
      candleTimestamp: trade.markerCandleTimestamp || this.t0,
      tradeId:    trade.id,
      account:    trade.account || 'demo',
      closed:     false,
      profitLoss: null
    });
  }

  _refreshTradeBadge() {
    try {
      const acc   = this._getActiveAcc();
      const open  = window.tradeHistory && window.tradeHistory.getTrades
        ? window.tradeHistory.getTrades()
        : [];
      const count = open.filter(t => (t.account || 'demo') === acc).length;
      this._updateTradeBadge(count);
    } catch(e) {}
  }

  _updateTradeBadge(count) {
    let badge = document.getElementById('_qtTradeBadge');
    if (!badge) {
      const histBtn = document.getElementById('openHistory') ||
                      document.getElementById('navHistory')  ||
                      document.querySelector('[id="openHistory"]');
      if (!histBtn) return;
      badge           = document.createElement('span');
      badge.id        = '_qtTradeBadge';
      badge.style.cssText = 'position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;font-size:10px;font-weight:900;min-width:18px;height:18px;border-radius:9px;display:none;align-items:center;justify-content:center;padding:0 4px;z-index:10000;pointer-events:none;box-shadow:0 2px 6px rgba(0,0,0,.5);line-height:1';
      histBtn.style.position = 'relative';
      histBtn.appendChild(badge);
    }
    if (count > 0) { badge.textContent = count > 99 ? '99+' : String(count); badge.style.display = 'flex'; }
    else           { badge.style.display = 'none'; }
  }

  _showMsg(text, color) {
    if (!document.getElementById('_qtToastCSS')) {
      const s = document.createElement('style');
      s.id    = '_qtToastCSS';
      s.textContent = `@keyframes _qtFade{0%{opacity:0;transform:translateX(-50%) translateY(-14px)}12%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-8px)}}`;
      document.head.appendChild(s);
    }
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;top:68px;left:50%;transform:translateX(-50%);background:${color};color:#fff;padding:10px 22px;border-radius:12px;font-size:14px;font-weight:900;z-index:999999;box-shadow:0 4px 20px rgba(0,0,0,.5);white-space:nowrap;animation:_qtFade 2.4s forwards;pointer-events:none;letter-spacing:.3px`;
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
  const editVal = savedTimeValue.replace(':','');
  timeDisplay.textContent = editVal;
  setTimeout(() => {
    timeDisplay.focus();
    try {
      const range = document.createRange();
      range.selectNodeContents(timeDisplay);
      const sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(range);
    } catch(e) {}
  }, 30);
});

compensationList.addEventListener("click", e => {
  if (e.target.classList.contains("dropdown-item")) {
    savedTimeValue = e.target.textContent;
    timeDisplay.textContent = savedTimeValue;
    window.chart.selectedTime = parseInt(e.target.getAttribute("data-sec"));
    timeDropdown.classList.remove("show");
  }
});

timeDisplay.addEventListener("input", e => {
  if (isEditingTime) {
    let v = e.target.textContent.replace(/[^0-9]/g,"");
    if (v.length > 4) v = v.slice(0,4);
    const sel = window.getSelection(), pos = sel.focusOffset;
    e.target.textContent = v;
    try {
      if (e.target.firstChild) {
        const r = document.createRange();
        r.setStart(e.target.firstChild, Math.min(pos, v.length));
        r.collapse(true); sel.removeAllRanges(); sel.addRange(r);
      }
    } catch(_) {}
  }
});

timeDisplay.addEventListener("blur", () => {
  if (isEditingTime) {
    let v = timeDisplay.textContent.replace(/[^0-9]/g,"");
    if (v.length === 0) v = "0005";
    v = v.padStart(4,"0");
    const h = v.slice(0,2), m = v.slice(2,4);
    savedTimeValue = `${h}:${m}`;
    timeDisplay.textContent = savedTimeValue;
    const totalSec = parseInt(h)*60 + parseInt(m);
    window.chart.selectedTime = totalSec > 0 ? totalSec : 5;
    isEditingTime = false;
  }
});

timeDisplay.addEventListener("keydown", function(e) { if (e.key === "Enter") { e.preventDefault(); this.blur(); } });

amountContainer.addEventListener("click", () => amountDisplay.focus());
amountDisplay.addEventListener("focus",   function() {
  let v = this.value.replace("$",""); this.value = v;
  setTimeout(() => this.setSelectionRange(0, this.value.length), 10);
});
amountDisplay.addEventListener("input",   function() { this.value = this.value.replace(/[^0-9.]/g,""); });
amountDisplay.addEventListener("blur",    function() { let val = parseFloat(this.value) || 50; this.value = val + "$"; });
amountDisplay.addEventListener("keydown", function(e) { if (e.key === "Enter") { e.preventDefault(); this.blur(); } });

document.getElementById("buyBtn").addEventListener("click",  () => window.chart.openTrade("buy"));
document.getElementById("sellBtn").addEventListener("click", () => window.chart.openTrade("sell"));

console.log('🚀 QT Trading Chart v4 — Optimized & Conflict-Free ✅');
