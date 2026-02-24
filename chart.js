import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, where, serverTimestamp, doc, getDoc, setDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const firebaseConfig = {apiKey: "AIzaSyBOUqLixfphg3b8hajc4hkwV-VJmldGBVw",authDomain: "randers-c640b.firebaseapp.com",projectId: "randers-c640b",storageBucket: "randers-c640b.firebasestorage.app",messagingSenderId: "391496092929",appId: "1:391496092929:web:58208b4eb3e6f9a8571f00",measurementId: "G-DBDSVVF7PS"};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ============================================================
   💉 حقن CSS
   ============================================================ */
(function injectStyles() {
  if (document.getElementById('qtAllCSS')) return;
  const st = document.createElement('style');
  st.id = 'qtAllCSS';
  st.textContent = `
    /* ── أكاونت منيو ── */
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
    .qt-sw-btn{flex:1;padding:8px 4px;border-radius:8px;font-size:11px;font-weight:900;letter-spacing:.4px;transition:.2s;border:1.5px solid transparent;display:flex;align-items:center;justify-content:center;gap:5px;background:transparent;color:#fff;cursor:pointer;}
    .qt-sw-btn.qt-live{color:#00ff41}.qt-sw-btn.qt-demo{color:#ffd700}
    .qt-sw-btn.active{background:rgba(255,255,255,.10);border-color:currentColor;box-shadow:0 0 8px rgba(255,255,255,.08)}
    .qt-acc-item{background:rgba(255,255,255,.03);border:1.3px solid rgba(255,255,255,.10);border-radius:12px;padding:10px 12px;margin-bottom:9px;cursor:pointer;transition:.15s;display:flex;align-items:center;justify-content:space-between;gap:10px;}
    .qt-acc-item:hover{background:rgba(255,255,255,.06);transform:translateY(-1px)}
    .qt-acc-item.active{background:linear-gradient(135deg,rgba(66,153,225,.16) 0%,rgba(49,130,206,.10) 100%);border-color:#4299e1;box-shadow:0 0 14px rgba(66,153,225,.22);}
    .qt-acc-left{display:flex;align-items:center;gap:10px;min-width:0}
    .qt-acc-ico{width:26px;height:26px;object-fit:contain;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.4)}
    .qt-acc-info{display:flex;flex-direction:column;gap:2px}
    .qt-acc-label{font-size:10px;color:rgba(255,255,255,.45);font-weight:700;letter-spacing:.4px;text-transform:uppercase}
    .qt-acc-amt{font-size:16px;font-weight:1000;color:#fff;white-space:nowrap}
    .qt-acc-badge{font-size:9px;font-weight:900;letter-spacing:.6px;padding:3px 7px;border-radius:6px;white-space:nowrap;}
    .qt-acc-badge.live{background:rgba(0,255,65,.12);color:#00ff41;border:1px solid rgba(0,255,65,.3)}
    .qt-acc-badge.demo{background:rgba(255,215,0,.12);color:#ffd700;border:1px solid rgba(255,215,0,.3)}
    .qt-refill-btn{width:100%;background:linear-gradient(135deg,#4299e1 0%,#3182ce 100%);border-radius:10px;padding:10px;font-size:12px;font-weight:1000;color:#fff;letter-spacing:.5px;cursor:pointer;box-shadow:0 4px 14px rgba(66,153,225,.35);transition:.2s;border:none;}
    .qt-refill-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(66,153,225,.45)}
    .qt-refill-btn:active{transform:scale(.97)}
    #timeDisplay{caret-color:#fff !important;outline:none !important;}
    #timeDisplay:focus{border-color:rgba(255,255,255,.35) !important;}
    #_qtRoleBadge{display:none !important;opacity:0 !important;visibility:hidden !important;}

    /* ── مؤشر تحميل الشموع ── */
    #_qtLoadMoreIndicator{
      position:absolute;left:8px;top:50%;transform:translateY(-50%);
      background:rgba(66,153,225,.18);border:1px solid rgba(66,153,225,.5);
      color:#4299e1;font-size:11px;font-weight:700;padding:5px 12px;
      border-radius:20px;pointer-events:none;z-index:9999;
      display:none;letter-spacing:.4px;
      animation:qtPulse 1.2s ease-in-out infinite;
    }
    @keyframes qtPulse{0%,100%{opacity:.7}50%{opacity:1}}
    #_qtNoMoreCandles{
      position:absolute;left:8px;top:50%;transform:translateY(-50%);
      background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);
      color:rgba(255,255,255,.4);font-size:10px;font-weight:700;padding:4px 10px;
      border-radius:20px;pointer-events:none;z-index:9999;display:none;
      letter-spacing:.4px;
    }

    /* ── بانيل سجل الصفقات ── */
    #_qtHistoryPanel{
      position:fixed;right:0;top:0;height:100%;width:340px;max-width:95vw;
      background:linear-gradient(180deg,#0d1117 0%,#101a2f 100%);
      border-left:2px solid rgba(255,255,255,.08);
      z-index:99998;display:flex;flex-direction:column;
      transform:translateX(100%);transition:transform .28s cubic-bezier(.34,1.1,.64,1);
      box-shadow:-8px 0 40px rgba(0,0,0,.6);
    }
    #_qtHistoryPanel.open{transform:translateX(0)}
    #_qtHistoryPanel .hp-head{
      display:flex;align-items:center;justify-content:space-between;
      padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.07);
      background:rgba(255,255,255,.02);flex-shrink:0;
    }
    #_qtHistoryPanel .hp-title{font-size:14px;font-weight:900;color:#fff;letter-spacing:.5px;}
    #_qtHistoryPanel .hp-close{background:none;border:none;color:rgba(255,255,255,.5);font-size:20px;cursor:pointer;line-height:1;padding:4px 6px;border-radius:6px;transition:.15s;}
    #_qtHistoryPanel .hp-close:hover{background:rgba(255,255,255,.08);color:#fff}
    #_qtHistoryPanel .hp-tabs{display:flex;gap:6px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;}
    #_qtHistoryPanel .hp-tab{flex:1;padding:7px 4px;border-radius:8px;font-size:11px;font-weight:800;border:1.5px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.5);cursor:pointer;transition:.15s;letter-spacing:.3px;}
    #_qtHistoryPanel .hp-tab.active{background:rgba(66,153,225,.15);border-color:#4299e1;color:#4299e1;}
    #_qtHistoryPanel .hp-body{flex:1;overflow-y:auto;padding:10px 12px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.1) transparent;}
    #_qtHistoryPanel .hp-body::-webkit-scrollbar{width:4px}
    #_qtHistoryPanel .hp-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}
    #_qtHistoryPanel .hp-empty{text-align:center;color:rgba(255,255,255,.3);font-size:13px;padding:40px 20px;line-height:1.7;}
    #_qtHistoryPanel .hp-loading{text-align:center;color:#4299e1;font-size:12px;padding:20px;animation:qtPulse 1.2s ease-in-out infinite;}
    .ht-card{
      background:rgba(255,255,255,.03);border:1.2px solid rgba(255,255,255,.08);
      border-radius:12px;padding:11px 13px;margin-bottom:8px;transition:.15s;
    }
    .ht-card:hover{background:rgba(255,255,255,.06)}
    .ht-card.win{border-color:rgba(0,255,65,.22);background:rgba(0,255,65,.04)}
    .ht-card.loss{border-color:rgba(255,59,59,.22);background:rgba(255,59,59,.04)}
    .ht-row1{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;}
    .ht-pair{font-size:12px;font-weight:900;color:#fff;letter-spacing:.4px;}
    .ht-dir{font-size:10px;font-weight:800;padding:3px 8px;border-radius:6px;letter-spacing:.5px;}
    .ht-dir.up{background:rgba(0,255,65,.15);color:#00ff41;border:1px solid rgba(0,255,65,.3)}
    .ht-dir.down{background:rgba(255,59,59,.15);color:#ff5555;border:1px solid rgba(255,59,59,.3)}
    .ht-row2{display:flex;align-items:center;justify-content:space-between;}
    .ht-meta{font-size:10px;color:rgba(255,255,255,.4);line-height:1.6;}
    .ht-pl{font-size:15px;font-weight:900;}
    .ht-pl.win{color:#00ff41;text-shadow:0 0 8px rgba(0,255,65,.4)}
    .ht-pl.loss{color:#ff5555;text-shadow:0 0 8px rgba(255,59,59,.3)}
    .ht-acc-badge{display:inline-block;font-size:9px;font-weight:800;padding:2px 6px;border-radius:5px;margin-left:4px;vertical-align:middle;}
    .ht-acc-badge.live{background:rgba(0,255,65,.12);color:#00ff41;border:1px solid rgba(0,255,65,.25)}
    .ht-acc-badge.demo{background:rgba(255,215,0,.12);color:#ffd700;border:1px solid rgba(255,215,0,.25)}

    /* ── زر فتح السجل ── */
    #_qtHistoryToggleBtn{
      position:fixed;bottom:24px;right:18px;
      background:linear-gradient(135deg,#1e3a5f 0%,#162d4a 100%);
      border:1.5px solid rgba(66,153,225,.35);color:#4299e1;
      font-size:13px;font-weight:900;padding:10px 18px 10px 14px;
      border-radius:22px;cursor:pointer;z-index:9997;
      box-shadow:0 4px 18px rgba(0,0,0,.5);transition:.2s;
      display:flex;align-items:center;gap:7px;letter-spacing:.3px;
    }
    #_qtHistoryToggleBtn:hover{transform:translateY(-2px);box-shadow:0 6px 22px rgba(0,0,0,.6)}
    #_qtHistoryToggleBtn .htb-badge{
      background:#ef4444;color:#fff;font-size:10px;font-weight:900;
      min-width:18px;height:18px;border-radius:9px;
      display:none;align-items:center;justify-content:center;
      padding:0 4px;line-height:1;
    }
    #_qtHistoryToggleBtn .htb-badge.show{display:flex}
  `;
  document.head.appendChild(st);
})();

/* ============================================================
   🔐 AuthManager
   ============================================================ */
class AuthManager {
  constructor() {
    this.user         = null;
    this.unsubscribeBalance = null;
    this.balanceEl    = document.getElementById("userBalance");
    this.activeAccount = 'demo';
    this.realBalance   = 0;
    this.demoBalance   = 10000;
    this.menuVisible   = false;
    this.balancesReady = false;
    try {
      const ls = localStorage.getItem('qt_demo_balance');
      const v = ls !== null ? parseFloat(ls) : NaN;
      if (Number.isFinite(v)) this.demoBalance = Math.max(0, v);
    } catch(e) {}
    this.initMenuUI();
    this.init();
  }

  _fmtMoney(n) {
    try { return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n); }
    catch(e) { return '$' + (Math.round(n * 100) / 100).toFixed(2); }
  }

  async setBalance(type, amount, { persist = true } = {}) {
    const safeAmt = Math.max(0, Number(amount) || 0);
    if (type === 'real') this.realBalance = safeAmt;
    else this.demoBalance = safeAmt;
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
      const payload = (type === 'real') ? { realBalance: safeAmt, balance: safeAmt } : { demoBalance: safeAmt };
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
    menu.id = 'qtAccMenu';
    menu.className = 'qt-acc-menu';
    menu.innerHTML = `
      <div class="qt-acc-switch">
        <button class="qt-sw-btn qt-live"  data-acc="real">● LIVE</button>
        <button class="qt-sw-btn qt-demo active" data-acc="demo">◆ Demo</button>
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
      <button class="qt-refill-btn" id="qtRefillBtn">🔄 Refill Demo Account</button>
    `;
    wrap.appendChild(menu);
    this.setBalance('real', this.realBalance, { persist: false });
    this.setBalance('demo', this.demoBalance, { persist: false });
    this.switchAccount(this.activeAccount);
    wrap.addEventListener('click', (e) => { e.stopPropagation(); if (e.target.closest('#qtAccMenu')) return; this.toggleMenu(); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.qt-bal-wrap')) this.closeMenu(); });
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

  toggleMenu() { const menu = document.getElementById('qtAccMenu'); if (!menu) return; this.menuVisible = !this.menuVisible; menu.classList.toggle('show', this.menuVisible); }
  closeMenu() { const menu = document.getElementById('qtAccMenu'); if (!menu) return; this.menuVisible = false; menu.classList.remove('show'); }

  switchAccount(type) {
    this.activeAccount = type;
    if (!this.balanceEl) return;
    const showAmt = type === 'real' ? this.realBalance : this.demoBalance;
    this.balanceEl.textContent = this._fmtMoney(showAmt);
    const balAmount = document.getElementById('balAmount');
    if (balAmount) balAmount.textContent = this._fmtMoney(showAmt);
    try {
      if (window.chart && typeof window.chart._refreshTradeBadge === 'function') window.chart._refreshTradeBadge();
      // تحديث تبويب سجل التاريخ حسب الحساب
      if (window.chart && typeof window.chart._syncHistoryTabToAccount === 'function') window.chart._syncHistoryTabToAccount();
    } catch(e) {}
  }

  async init() {
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        this.user = u;
        await this.loadUserBalance();
        if (window.chart) {
          if (window.chart.dataLoaded) window.chart.loadOpenTrades();
          else window.chart._pendingTradeLoad = true;
        }
      } else {
        this.user = null;
        this.balancesReady = false;
        if (this.balanceEl) {
          const showAmt = (this.activeAccount === 'real') ? this.realBalance : this.demoBalance;
          this.balanceEl.textContent = this._fmtMoney(showAmt);
        }
      }
    });
  }

  async loadUserBalance() {
    const userRef  = doc(db, "users", this.user.email);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, { email: this.user.email, realBalance: 0, demoBalance: 10000, balance: 0, createdAt: serverTimestamp() }, { merge: true });
    } else {
      const d = userSnap.data() || {};
      const migrateReal = (d.realBalance === undefined && d.balance !== undefined);
      const migrateDemo = (d.demoBalance === undefined);
      if (migrateReal || migrateDemo) {
        await setDoc(userRef, { realBalance: d.realBalance !== undefined ? d.realBalance : (d.balance || 0), demoBalance: d.demoBalance !== undefined ? d.demoBalance : 10000, balance: d.balance !== undefined ? d.balance : (d.realBalance || 0) }, { merge: true });
      }
    }
    if (this.unsubscribeBalance) { try { this.unsubscribeBalance(); } catch(e) {} this.unsubscribeBalance = null; }
    this.unsubscribeBalance = onSnapshot(userRef, (d) => {
      const data = d.data();
      if (!data) return;
      this.realBalance = (data.realBalance !== undefined) ? data.realBalance : (data.balance || 0);
      this.demoBalance = (data.demoBalance !== undefined) ? data.demoBalance : 10000;
      this.balancesReady = true;
      const realEl = document.getElementById('qtRealAmt');
      const demoEl = document.getElementById('qtDemoAmt');
      if (realEl) realEl.textContent = this._fmtMoney(this.realBalance);
      if (demoEl) demoEl.textContent = this._fmtMoney(this.demoBalance);
      if (this.balanceEl) { const showAmt = (this.activeAccount === 'real') ? this.realBalance : this.demoBalance; this.balanceEl.textContent = this._fmtMoney(showAmt); }
      const balAmount = document.getElementById('balAmount');
      if (balAmount) { const showAmt = (this.activeAccount === 'real') ? this.realBalance : this.demoBalance; balAmount.textContent = this._fmtMoney(showAmt); }
      try { localStorage.setItem('qt_demo_balance', String(this.demoBalance)); } catch(e) {}
    });
  }

  async updateBalance(type, amount) {
    if (!this.user) return;
    const userRef  = doc(db, "users", this.user.email);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data() || {};
      const field = type === 'real' ? 'realBalance' : 'demoBalance';
      const currentBalance = (data[field] !== undefined) ? data[field] : (type === 'real' ? (data.balance || 0) : 10000);
      const next = currentBalance + amount;
      const payload = {};
      payload[field] = next;
      if (type === 'real') payload.balance = next;
      await updateDoc(userRef, payload);
    }
  }
}

/* ============================================================
   💾 LocalStorageManager
   ============================================================ */
class LocalStorageManager {
  constructor(){ this.CANDLES_KEY='qt_trading_candles'; this.LAST_SYNC_KEY='qt_last_sync'; }
  _ck(pair){ return pair ? 'qt_trading_candles_'+pair.replace('/','_') : this.CANDLES_KEY; }
  _sk(pair){ return pair ? 'qt_last_sync_'+pair.replace('/','_') : this.LAST_SYNC_KEY; }
  saveCandles(candles, pair){
    try { localStorage.setItem(this._ck(pair), JSON.stringify(candles)); localStorage.setItem(this._sk(pair), Date.now().toString()); }
    catch(e) { console.error('❌ Save error:', e); }
  }
  loadCandles(pair){
    try { const data = localStorage.getItem(this._ck(pair)); if (data) { return JSON.parse(data); } }
    catch(e) { console.error('❌ Load error:', e); }
    return null;
  }
  getLastSyncTime(){ const t = localStorage.getItem(this.LAST_SYNC_KEY); return t ? parseInt(t) : 0; }
  clear(){ localStorage.removeItem(this.CANDLES_KEY); localStorage.removeItem(this.LAST_SYNC_KEY); }
}

/* ============================================================
   🔥 FirebaseManager
   ============================================================ */
class FirebaseManager {
  constructor(){
    this.db = db;
    this.candlesCollection = 'candles';
    this.saveBatchSize = 50;
    this.saveInterval = 30000;
    this.lastSaveTime = 0;
    this.pendingCandles = [];
    this.isSaving = false;
    this.startAutoSave();
  }

  setPair(pairName){
    const key = 'candles_' + pairName.replace('/', '_');
    if (this.candlesCollection !== key) { this.candlesCollection = key; this.pendingCandles = []; console.log('🔄 Firebase collection:', key); }
  }

  async saveCandles(candles){
    if (this.isSaving) return false;
    try {
      this.isSaving = true;
      const batch = [];
      for (const candle of candles) {
        const candleData = { open: candle.open, high: candle.high, low: candle.low, close: candle.close, timestamp: candle.timestamp, savedAt: serverTimestamp() };
        batch.push(candleData);
        if (batch.length >= this.saveBatchSize) { await this.saveBatch(batch); batch.length = 0; await this.delay(100); }
      }
      if (batch.length > 0) await this.saveBatch(batch);
      this.lastSaveTime = Date.now();
      return true;
    } catch(e) { console.error('❌ Save error:', e); return false; }
    finally { this.isSaving = false; }
  }

  async saveBatch(batch){
    const promises = batch.map(candleData => addDoc(collection(this.db, this.candlesCollection), candleData));
    await Promise.all(promises);
  }

  /* ✅ تحميل آخر N شمعة (للتحميل الأولي) */
  async loadCandles(maxCandles = 200){
    try {
      console.log('📥 Loading from:', this.candlesCollection, '(limit:', maxCandles, ')');
      const q = query(collection(this.db, this.candlesCollection), orderBy('timestamp', 'desc'), limit(maxCandles));
      const querySnapshot = await getDocs(q);
      const candles = [];
      const seen = new Set();
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!seen.has(data.timestamp)) { seen.add(data.timestamp); candles.push({ open: data.open, high: data.high, low: data.low, close: data.close, timestamp: data.timestamp }); }
      });
      candles.reverse();
      console.log('✅ Loaded:', candles.length, 'candles (initial)');
      return candles;
    } catch(e) { console.error('❌ Load error:', e); return null; }
  }

  /* ✅ [جديد] تحميل شموع أقدم من timestamp معين (lazy loading) */
  async loadCandlesBefore(beforeTimestamp, maxCount = 200){
    try {
      console.log('📥 Loading older candles before:', new Date(beforeTimestamp).toISOString(), '(limit:', maxCount, ')');
      const q = query(
        collection(this.db, this.candlesCollection),
        orderBy('timestamp', 'desc'),
        where('timestamp', '<', beforeTimestamp),
        limit(maxCount)
      );
      const querySnapshot = await getDocs(q);
      const candles = [];
      const seen = new Set();
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!seen.has(data.timestamp)) {
          seen.add(data.timestamp);
          candles.push({ open: data.open, high: data.high, low: data.low, close: data.close, timestamp: data.timestamp });
        }
      });
      candles.reverse(); // ترتيب تصاعدي (قديم → جديد)
      console.log('✅ Loaded older:', candles.length, 'candles');
      return candles;
    } catch(e) { console.error('❌ loadCandlesBefore error:', e); return []; }
  }

  async clearOldCandles(daysToKeep = 7){
    try {
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      const q = query(collection(this.db, this.candlesCollection), where('timestamp', '<', cutoffTime));
      const querySnapshot = await getDocs(q);
      console.log(`🗑️ Found ${querySnapshot.size} old candles`);
    } catch(e) { console.error('❌ Clear error:', e); }
  }

  addPendingCandle(candle){ this.pendingCandles.push(candle); }

  startAutoSave(){
    setInterval(async () => {
      if (this.pendingCandles.length > 0 && !this.isSaving) {
        const candlesToSave = [...this.pendingCandles];
        this.pendingCandles = [];
        await this.saveCandles(candlesToSave);
      }
    }, this.saveInterval);
  }

  delay(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }
}

/* ============================================================
   ⏰ updateLiveTime
   ============================================================ */
function updateLiveTime(){const d=new Date();const u=d.getTime()+d.getTimezoneOffset()*60000;const t=new Date(u+(3*3600000));const h=String(t.getHours()).padStart(2,"0");const m=String(t.getMinutes()).padStart(2,"0");const s=String(t.getSeconds()).padStart(2,"0");document.getElementById("liveTime").textContent=`${h}:${m}:${s} UTC+3`;}updateLiveTime();setInterval(updateLiveTime,1000);

/* ============================================================
   📊 AdvancedTradingChart
   ============================================================ */
class AdvancedTradingChart {
  constructor(){
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
      'EUR/USD':{base:1.9500,digits:5,seed:11001,volScale:1},
      'AUD/CAD':{base:0.9100,digits:5,seed:22001,volScale:0.95},
      'AUD/CHF':{base:0.5700,digits:5,seed:33001,volScale:0.6},
      'BHD/CNY':{base:2.6500,digits:4,seed:44001,volScale:2.7},
      'EUR/RUB':{base:98.000,digits:3,seed:55001,volScale:100},
      'KES/USD':{base:0.0077,digits:6,seed:66001,volScale:0.008},
      'LBP/USD':{base:0.0111,digits:6,seed:77001,volScale:0.011},
      'QAR/CNY':{base:1.9800,digits:5,seed:88001,volScale:2},
      'USD/CHF':{base:0.8900,digits:5,seed:99001,volScale:0.9},
      'SYP/TRY':{base:0.2800,digits:5,seed:10501,volScale:0.3},
      'EGP/USD':{base:0.0205,digits:5,seed:11501,volScale:0.021},
      'USD/INR':{base:83.500,digits:3,seed:12501,volScale:85},
      'AED/CNY':{base:1.9800,digits:5,seed:13501,volScale:2}
    };

    this.currentPair = 'EUR/USD';
    this.isSwitching = false;
    this.volScale = 1;
    this.firebaseManager.setPair(this.currentPair);

    this.candles = [];
    this.currentCandle = null;
    this.maxCandles = 10000;

    /* ✅ [جديد] متغيرات Lazy Loading */
    this._initialLoadCount = 200;     // عدد الشموع في التحميل الأولي
    this._loadMoreBatchSize = 200;    // عدد الشموع في كل batch إضافي
    this._isLoadingMore = false;      // هل جاري التحميل؟
    this._allCandlesLoaded = false;   // هل تم تحميل كل الشموع المتاحة؟
    this._loadMoreThreshold = 60;     // عدد الشموع من اليسار قبل التحميل التلقائي
    this._checkLoadCooldown = 0;      // cooldown لمنع طلبات متكررة

    this.basePrice = 1.95;
    this.currentPrice = 1.9518;
    this.seed = 11001;
    this.digits = 5;
    this.priceRange = {min:1.9, max:2};
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
    this.timeframe = 60000;
    this.t0 = Math.floor(Date.now()/60000)*60000;
    this.smin = null;
    this.smax = null;
    this.sre = 0.088;
    this._fr = 0;
    this.markers = [];
    this.selectedTime = 5;
    this.dataLoaded = false;
    this.usingLocalStorage = false;

    this._tradeCounter = 0;
    this._pendingTradeLoad = false;

    /* ماستر/مشاهد */
    this.uid = 'uid_' + Date.now() + '_' + Math.random().toString(36).substr(2,9);
    this.isMaster = false;
    this._masterBroadcastInterval = null;
    this._watchdogInterval = null;
    this._liveUnsubscribe = null;
    this._lastBroadcastedClose = null;
    this.MASTER_TIMEOUT = 12000;
    this.BROADCAST_INTERVAL = 1000;

    window.addEventListener('beforeunload', () => {
      if (this.isMaster) {
        try { const stateRef = doc(db, 'trading_live', this._getPairKey()); updateDoc(stateRef, { masterUid: null, masterHeartbeat: 0 }).catch(()=>{}); } catch(e) {}
      }
    });

    this._injectLoadMoreUI();
    this._buildHistoryPanel();
    this.setup();
    this.initData();
  }

  /* ============================================================
     ✅ [جديد] حقن مؤشر التحميل الإضافي في الكانفاس
     ============================================================ */
  _injectLoadMoreUI() {
    const plot = this.plot || document.getElementById('plot');
    if (!plot) return;
    if (!document.getElementById('_qtLoadMoreIndicator')) {
      const el = document.createElement('div');
      el.id = '_qtLoadMoreIndicator';
      el.textContent = '⏳ تحميل شموع...';
      plot.style.position = 'relative';
      plot.appendChild(el);
    }
    if (!document.getElementById('_qtNoMoreCandles')) {
      const el2 = document.createElement('div');
      el2.id = '_qtNoMoreCandles';
      el2.textContent = '◀ بداية البيانات';
      plot.appendChild(el2);
    }
  }

  _showLoadMoreIndicator(show) {
    const el = document.getElementById('_qtLoadMoreIndicator');
    const el2 = document.getElementById('_qtNoMoreCandles');
    if (el) el.style.display = show ? 'block' : 'none';
    if (el2) el2.style.display = (!show && this._allCandlesLoaded) ? 'block' : 'none';
  }

  /* ============================================================
     ✅ [جديد] فحص الحاجة لتحميل شموع إضافية
     ============================================================ */
  _checkLoadMore() {
    if (this._isLoadingMore || this._allCandlesLoaded || this.isSwitching || !this.dataLoaded) return;
    const now = Date.now();
    if (now - this._checkLoadCooldown < 2000) return; // cooldown 2 ثانية

    // المؤشر الأيسر الظاهر على الشاشة
    const leftmostVisibleIdx = Math.floor(this.xToIndex(0));

    // لو المستخدم اقترب من بداية المصفوفة المحملة
    if (leftmostVisibleIdx <= this._loadMoreThreshold) {
      this._checkLoadCooldown = now;
      this._loadMoreCandles();
    }
  }

  /* ============================================================
     ✅ [جديد] تحميل شموع أقدم عند التمرير يساراً
     ============================================================ */
  async _loadMoreCandles() {
    if (this._isLoadingMore || this._allCandlesLoaded || this.isSwitching) return;
    if (!this.candles.length) return;

    this._isLoadingMore = true;
    this._showLoadMoreIndicator(true);

    const oldestTs = this.candles[0].timestamp;
    console.log('⬅️ Lazy loading older candles before:', new Date(oldestTs).toISOString());

    try {
      // أولاً: حاول من Firebase
      let olderCandles = await this.firebaseManager.loadCandlesBefore(oldestTs, this._loadMoreBatchSize);

      // إذا لم يجد في Firebase: ولّد شموع تاريخية
      if (!olderCandles || olderCandles.length === 0) {
        console.log('📊 No more Firebase data, generating historical candles...');
        olderCandles = this._generateHistoricalBefore(oldestTs, this._loadMoreBatchSize);
        if (!olderCandles || olderCandles.length === 0) {
          this._allCandlesLoaded = true;
          this._showLoadMoreIndicator(false);
          this._isLoadingMore = false;
          return;
        }
      }

      // ✅ تعويض الإزاحة لمنع القفز في العرض
      const shift = olderCandles.length * this.getSpacing();
      this.candles = [...olderCandles, ...this.candles];
      this.targetOffsetX -= shift;
      this.offsetX      -= shift;
      this.clampPan();

      // ✅ تحديث مؤشرات الماركرز
      this.markers.forEach(m => { m.candleIndex += olderCandles.length; });

      // ✅ تحديث localStorage
      this.localStorageManager.saveCandles(this.candles, this.currentPair);

      console.log(`✅ Lazy loaded ${olderCandles.length} candles. Total: ${this.candles.length}`);

      // إذا الـ batch أقل من المطلوب = وصلنا للنهاية
      if (olderCandles.length < this._loadMoreBatchSize) {
        this._allCandlesLoaded = true;
      }

    } catch(e) {
      console.error('❌ _loadMoreCandles error:', e);
    } finally {
      this._isLoadingMore = false;
      this._showLoadMoreIndicator(false);
    }
  }

  /* ============================================================
     ✅ [جديد] توليد شموع تاريخية قبل timestamp معين
     ============================================================ */
  _generateHistoricalBefore(beforeTimestamp, count) {
    const candles = [];
    const startTs = beforeTimestamp - count * this.timeframe;
    let p = this.candles.length > 0 ? this.candles[0].open : this.basePrice;
    let t = startTs;
    for (let i = 0; i < count; i++) {
      const c = this.genCandle(t, p);
      candles.push(c);
      p = c.close;
      t += this.timeframe;
    }
    return candles;
  }

  /* ============================================================
     Master/Viewer system
     ============================================================ */
  _getPairKey() { return this.currentPair.replace('/', '_'); }
  _getLiveStateRef() { return doc(db, 'trading_live', this._getPairKey()); }
  _setRoleBadge(role) { let badge = document.getElementById('_qtRoleBadge'); if (!badge) { badge = document.createElement('div'); badge.id = '_qtRoleBadge'; document.body.appendChild(badge); } badge.className = role; badge.textContent = role === 'master' ? '👑 MASTER' : '👁️ VIEWER'; }

  async _initMasterViewerSystem() {
    try {
      const claimed = await this._tryClaimMaster();
      if (claimed) {
        this.isMaster = true;
        this.candles = await this._fillAndSaveCandleGaps(this.candles);
        this._startMasterBroadcast();
        this._setRoleBadge('master');
      } else {
        this.isMaster = false;
        this._startViewerSubscription();
        this._startWatchdog();
        this._setRoleBadge('viewer');
      }
    } catch(e) {
      this.isMaster = true;
      this._startMasterBroadcast();
      this._setRoleBadge('master');
    }
  }

  async _tryClaimMaster() {
    try {
      const stateRef = this._getLiveStateRef();
      const snap = await getDoc(stateRef);
      if (!snap.exists()) {
        await setDoc(stateRef, { masterUid: this.uid, masterHeartbeat: Date.now(), liveCandle: null, liveT0: this.t0, pair: this.currentPair });
        return true;
      }
      const data = snap.data();
      const hb = data.masterHeartbeat || 0;
      const isAlive = (Date.now() - hb) < this.MASTER_TIMEOUT;
      if (!data.masterUid || !isAlive) {
        await updateDoc(stateRef, { masterUid: this.uid, masterHeartbeat: Date.now(), liveT0: this.t0 });
        return true;
      }
      if (data.masterUid === this.uid) return true;
      if (data.liveCandle) { this.currentCandle = { ...data.liveCandle }; this.currentPrice = data.liveCandle.close; window.__qt_price = this.currentPrice; }
      if (data.liveT0) this.t0 = data.liveT0;
      return false;
    } catch(e) { return true; }
  }

  async _becomeMaster() {
    if (this.isMaster) return;
    try {
      const stateRef = this._getLiveStateRef();
      await setDoc(stateRef, { masterUid: this.uid, masterHeartbeat: Date.now(), liveT0: this.t0 }, { merge: true });
      this.isMaster = true;
      if (this._liveUnsubscribe) { this._liveUnsubscribe(); this._liveUnsubscribe = null; }
      if (this._watchdogInterval) { clearInterval(this._watchdogInterval); this._watchdogInterval = null; }
      this.candles = await this._fillAndSaveCandleGaps(this.candles);
      this._startMasterBroadcast();
      this._setRoleBadge('master');
    } catch(e) {}
  }

  _startMasterBroadcast() {
    if (this._masterBroadcastInterval) clearInterval(this._masterBroadcastInterval);
    this._masterBroadcastInterval = setInterval(async () => {
      if (!this.isMaster || this.isSwitching || !this.currentCandle) return;
      if (this.currentCandle.close === this._lastBroadcastedClose) return;
      this._lastBroadcastedClose = this.currentCandle.close;
      try {
        const stateRef = this._getLiveStateRef();
        await setDoc(stateRef, { masterUid: this.uid, masterHeartbeat: Date.now(), liveCandle: { ...this.currentCandle }, liveT0: this.t0, liveUpdatedAt: Date.now(), pair: this.currentPair }, { merge: true });
      } catch(e) {}
    }, this.BROADCAST_INTERVAL);
  }

  _startViewerSubscription() {
    if (this._liveUnsubscribe) { this._liveUnsubscribe(); this._liveUnsubscribe = null; }
    const stateRef = this._getLiveStateRef();
    this._liveUnsubscribe = onSnapshot(stateRef, (snap) => {
      if (!snap.exists() || this.isMaster || this.isSwitching) return;
      const data = snap.data();
      if (data.liveT0 && data.liveT0 !== this.t0 && this.t0 > 0) {
        if (this.currentCandle && (!this.candles.length || this.currentCandle.timestamp !== this.candles[this.candles.length-1].timestamp)) {
          const completed = { ...this.currentCandle };
          this.candles.push(completed);
          if (this.candles.length > this.maxCandles) this.candles.shift();
          this.localStorageManager.saveCandles(this.candles, this.currentPair);
        }
      }
      if (data.liveT0) this.t0 = data.liveT0;
      if (data.liveCandle) { this.currentCandle = { ...data.liveCandle }; this.currentPrice = data.liveCandle.close; window.__qt_price = this.currentPrice; }
    }, (err) => { console.warn('⚠️ onSnapshot viewer error:', err); });
  }

  _startWatchdog() {
    if (this._watchdogInterval) clearInterval(this._watchdogInterval);
    this._watchdogInterval = setInterval(async () => {
      if (this.isMaster || this.isSwitching) return;
      try {
        const stateRef = this._getLiveStateRef();
        const snap = await getDoc(stateRef);
        if (!snap.exists()) { await this._becomeMaster(); return; }
        const data = snap.data();
        const hb = data.masterHeartbeat || 0;
        const isAlive = (Date.now() - hb) < this.MASTER_TIMEOUT;
        if (!data.masterUid || !isAlive) await this._becomeMaster();
      } catch(e) {}
    }, 5000);
  }

  async _cleanupMasterViewer() {
    if (this._masterBroadcastInterval) { clearInterval(this._masterBroadcastInterval); this._masterBroadcastInterval = null; }
    if (this._watchdogInterval) { clearInterval(this._watchdogInterval); this._watchdogInterval = null; }
    if (this._liveUnsubscribe) { this._liveUnsubscribe(); this._liveUnsubscribe = null; }
    if (this.isMaster) { try { const stateRef = this._getLiveStateRef(); await updateDoc(stateRef, { masterUid: null, masterHeartbeat: 0 }).catch(()=>{}); } catch(e) {} }
    this.isMaster = false;
    this._lastBroadcastedClose = null;
  }

  async _fillAndSaveCandleGaps(candles) {
    if (!candles || candles.length === 0) return candles || [];
    const lastCandle = candles[candles.length - 1];
    const lastTs = lastCandle.timestamp;
    const currentT0 = Math.floor(Date.now() / this.timeframe) * this.timeframe;
    if (currentT0 <= lastTs + this.timeframe) return candles;
    const gapCount = Math.floor((currentT0 - lastTs) / this.timeframe) - 1;
    if (gapCount <= 0) return candles;
    const maxFill = Math.min(gapCount, 1440);
    let p = lastCandle.close; let t = lastTs + this.timeframe;
    const gaps = [];
    for (let i = 0; i < maxFill; i++) { const c = this.genCandle(t, p); gaps.push(c); p = c.close; t += this.timeframe; }
    if (gaps.length > 0) {
      try { await this.firebaseManager.saveCandles(gaps); } catch(e) { gaps.forEach(c => this.firebaseManager.addPendingCandle(c)); }
      const result = [...candles, ...gaps];
      return result.length > this.maxCandles ? result.slice(result.length - this.maxCandles) : result;
    }
    return candles;
  }

  /* ============================================================
     initData — تحميل أولي 200 شمعة
     ============================================================ */
  async initData(){
    this.showLoading(true);
    try {
      console.log('📄 Loading initial 200 candles from Firebase...');

      // ✅ تحميل أول 200 شمعة فقط
      const firebaseCandles = await this.firebaseManager.loadCandles(this._initialLoadCount);

      if (firebaseCandles && firebaseCandles.length > 0) {
        this.candles = firebaseCandles;
        this.usingLocalStorage = false;
        this.localStorageManager.saveCandles(this.candles, this.currentPair);
      } else {
        const localCandles = this.localStorageManager.loadCandles(this.currentPair);
        if (localCandles && localCandles.length > 0) {
          // خذ فقط آخر 200 من localStorage
          this.candles = localCandles.slice(-this._initialLoadCount);
          this.usingLocalStorage = true;
        } else {
          // توليد 200 شمعة جديدة
          this._generateInitialCandles();
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
      this.dataLoaded = true;
      this._allCandlesLoaded = false; // ✅ يسمح بتحميل المزيد لاحقاً

      if (window.tradeHistory) window.tradeHistory.setTrades([]);
      this._refreshTradeBadge();

      await this._initMasterViewerSystem();

      if (this._pendingTradeLoad && this.authManager.user) {
        this._pendingTradeLoad = false;
        this.loadOpenTrades();
      }

      this.initEvents();
      this.startRealtime();
      this.loop();
    } catch(e) {
      console.error('❌ Init error:', e);
      this._generateInitialCandles();
      this.usingLocalStorage = true;
      this.dataLoaded = true;
      this._allCandlesLoaded = false;
      this.isMaster = true;
      this._startMasterBroadcast();
      this._setRoleBadge('master');
      this.initEvents();
      this.startRealtime();
      this.loop();
    } finally {
      this.showLoading(false);
    }
  }

  /* توليد 200 شمعة أولية */
  _generateInitialCandles() {
    this.candles = [];
    let p = this.basePrice;
    let t = Date.now() - this._initialLoadCount * this.timeframe;
    for (let i = 0; i < this._initialLoadCount; i++) {
      const c = this.genCandle(t, p);
      this.candles.push(c);
      p = c.close;
      t += this.timeframe;
    }
    this.currentPrice = this.candles[this.candles.length - 1].close;
    this.localStorageManager.saveCandles(this.candles, this.currentPair);
  }

  showLoading(show){ if(this.loadingOverlay){ if(show) this.loadingOverlay.classList.add('show'); else this.loadingOverlay.classList.remove('show'); } }
  setup(){ const dpr=window.devicePixelRatio||1; const r=this.plot.getBoundingClientRect(); this.w=r.width; this.h=r.height-24; this.canvas.width=this.w*dpr; this.canvas.height=this.h*dpr; this.canvas.style.width=this.w+"px"; this.canvas.style.height=this.h+"px"; this.ctx.scale(dpr,dpr); if(this.dataLoaded){ this.updatePriceLabel(); this.updatePriceScale(); this.updateTimeLabels(); } }
  rnd(s){ const x=Math.sin(s)*10000; return x-Math.floor(x); }
  rndG(s){ const u1=this.rnd(s); const u2=this.rnd(s+100000); return Math.sqrt(-2*Math.log(u1+0.00001))*Math.cos(2*Math.PI*u2); }

  genCandle(t, o){
    const s=this.seed+Math.floor(t/this.timeframe);
    const vb=0.0008*(this.volScale||1); const tb=0.00005*(this.volScale||1);
    const r1=this.rndG(s); const r2=this.rndG(s+1); const r3=this.rndG(s+2);
    const r4=this.rnd(s+3); const r5=this.rnd(s+4); const r6=this.rnd(s+5);
    const v=vb*(0.7+Math.abs(r1)*0.8); const tr=tb*r2*0.6; const dir=r3>0?1:-1;
    const tc=o+(dir*v+tr); const rg=v*(0.2+r4*0.6); const hm=rg*(0.3+r5*0.7); const lm=rg*(0.3+(1-r5)*0.7);
    const c=+(tc+(r6-0.5)*v*0.1).toFixed(this.digits); const op=+o.toFixed(this.digits);
    return{open:op,close:c,high:+Math.max(op,c,op+hm,c+hm).toFixed(this.digits),low:+Math.min(op,c,op-lm,c-lm).toFixed(this.digits),timestamp:t};
  }

  initHistoricalData(){ let p=this.basePrice; let t=Date.now()-this.maxCandles*this.timeframe; for(let i=0;i<this.maxCandles;i++){ const c=this.genCandle(t,p); this.candles.push(c); p=c.close; t+=this.timeframe; } this.currentPrice=this.candles[this.candles.length-1].close; this.localStorageManager.saveCandles(this.candles,this.currentPair); }

  getSpacing(){ return this.baseSpacing*this.zoom; }
  getCandleWidth(){ return this.getSpacing()*0.8; }
  getMinOffset(){ return this.w/2-this.candles.length*this.getSpacing(); }
  getMaxOffset(){ return this.w/2; }
  clampPan(){ const mn=this.getMinOffset(); const mx=this.getMaxOffset(); this.targetOffsetX=Math.max(mn,Math.min(mx,this.targetOffsetX)); this.offsetX=Math.max(mn,Math.min(mx,this.offsetX)); }
  snapToLive(){ this.targetOffsetX=this.getMinOffset(); this.offsetX=this.targetOffsetX; this.velocity=0; this.clampPan(); }
  updatePan(){ const diff=this.targetOffsetX-this.offsetX; if(Math.abs(diff)>0.003) this.offsetX+=diff*this.panEase; else this.offsetX=this.targetOffsetX; if(Math.abs(this.velocity)>0.01){ this.targetOffsetX+=this.velocity; this.velocity*=0.972; this.clampPan(); }else{ this.velocity=0; } }
  tickZoom(){ const d=this.targetZoom-this.zoom; if(Math.abs(d)>0.0001) this.zoom+=d*this.zoomEase; else this.zoom=this.targetZoom; }
  tickSR(){ const r=this.priceRange; if(this.smin===null){ this.smin=r.min; this.smax=r.max; return; } this.smin+=(r.min-this.smin)*this.sre; this.smax+=(r.max-this.smax)*this.sre; }
  applyZoomAround(mx,my,sc){ const oz=this.targetZoom; const nz=Math.max(this.minZoom,Math.min(this.maxZoom,oz*sc)); if(Math.abs(nz-oz)<0.000001)return; const idx=this.xToIndex(mx); this.targetZoom=nz; this.zoom=nz; const nx=mx-idx*this.getSpacing(); this.targetOffsetX=nx; this.offsetX=nx; this.clampPan(); this.updateTimeLabels(); }
  indexToX(i){ return this.offsetX+i*this.getSpacing(); }
  xToIndex(x){ return (x-this.offsetX)/this.getSpacing(); }
  getPriceRange(){ const mn=this.smin!==null?this.smin:this.priceRange.min; const mx=this.smax!==null?this.smax:this.priceRange.max; return{min:mn,max:mx}; }
  niceNum(v,rnd){ const e=Math.floor(Math.log10(v)); const p=Math.pow(10,e); const f=v/p; let nf; if(rnd){ if(f<1.5)nf=1; else if(f<3)nf=2; else if(f<7)nf=5; else nf=10; }else{ if(f<=1)nf=1; else if(f<=2)nf=2; else if(f<=5)nf=5; else nf=10; } return nf*p; }
  calcNiceGrid(){ const r=this.getPriceRange(); const rng=r.max-r.min; const d=this.niceNum(rng/7,false); const g0=Math.floor(r.min/d)*d; const g1=Math.ceil(r.max/d)*d; return{min:g0,max:g1,step:d,count:Math.round((g1-g0)/d)}; }
  drawGrid(){ const{min,max,step,count}=this.calcNiceGrid(); for(let i=0;i<=count;i++){ const p=min+i*step; const y=this.priceToY(p); if(y<-5||y>this.h+5)continue; const mj=i%5===0; this.ctx.strokeStyle=mj?"rgba(255,215,0,.12)":"rgba(255,255,255,.05)"; this.ctx.lineWidth=mj?1:0.8; this.ctx.beginPath(); this.ctx.moveTo(0,y+0.5); this.ctx.lineTo(this.w,y+0.5); this.ctx.stroke(); } const visC=this.w/this.getSpacing(); const targetL=9; const stepC=Math.max(1,Math.round(visC/targetL)); const s=Math.floor(this.xToIndex(0)); const e=Math.ceil(this.xToIndex(this.w)); for(let i=s;i<=e;i++){ if(i%stepC!==0)continue; const x=this.indexToX(i); if(x<-5||x>this.w+5)continue; const mj=i%Math.round(stepC*5)===0; this.ctx.strokeStyle=mj?"rgba(255,215,0,.12)":"rgba(255,255,255,.05)"; this.ctx.lineWidth=mj?1:0.8; this.ctx.beginPath(); this.ctx.moveTo(x+0.5,0); this.ctx.lineTo(x+0.5,this.h); this.ctx.stroke(); } }
  updateTimeLabels(){ const tl=this.timeLabels; tl.innerHTML=""; const visC=this.w/this.getSpacing(); const targetL=9; const stepC=Math.max(1,Math.round(visC/targetL)); const s=Math.floor(this.xToIndex(0)); const e=Math.ceil(this.xToIndex(this.w)); const tS=this.candles.length?this.candles[0].timestamp:this.t0; for(let i=s;i<=e;i++){ if(i%stepC!==0)continue; const x=this.indexToX(i); if(x<5||x>this.w-5)continue; const t=tS+i*this.timeframe; const d=new Date(t); const hh=String(d.getHours()).padStart(2,"0"); const mm=String(d.getMinutes()).padStart(2,"0"); const lb=document.createElement("div"); lb.className="timeLabel"; if(i%Math.round(stepC*5)===0) lb.classList.add("major"); lb.style.left=x+"px"; lb.textContent=`${hh}:${mm}`; tl.appendChild(lb); } }
  updatePriceScale(){ const{min,step,count}=this.calcNiceGrid(); let h=""; for(let i=0;i<=count;i++){ const p=min+i*step; const y=this.priceToY(p); if(y<-8||y>this.h+8)continue; const mj=i%5===0; h+=`<div class="pLabel${mj?" major":""}" style="top:${y}px">${p.toFixed(this.digits)}</div>`; } this.priceScaleLabels.innerHTML=h; }
  updatePriceLabel(){ const py=this.priceToY(this.currentPrice); this.priceLine.style.top=py+"px"; this.currentPriceEl.style.top=py+"px"; this.currentPriceEl.textContent=this.currentPrice.toFixed(this.digits); }
  updateCandleTimer(){ if(!this.currentCandle)return; const n=Date.now(); const e=n-this.t0; const r=this.timeframe-e; const s=Math.floor(r/1000); this.candleTimer.textContent=s>=0?s:0; const cx=this.indexToX(this.candles.length); this.candleTimer.style.left=cx+15+"px"; this.candleTimer.style.top="10px"; this.candleTimer.style.display='block'; }
  priceToY(p){ const r=this.getPriceRange(); const n=(p-r.min)/(r.max-r.min); return this.h*(1-n); }

  drawCandle(c, x, glow){
    const oy=this.priceToY(c.open); const cy=this.priceToY(c.close); const hy=this.priceToY(c.high); const ly=this.priceToY(c.low);
    const b=c.close>=c.open; const w=this.getCandleWidth();
    this.ctx.strokeStyle=b?"#0f0":"#f00"; this.ctx.lineWidth=Math.max(1,0.18*w);
    this.ctx.beginPath(); this.ctx.moveTo(x,hy); this.ctx.lineTo(x,ly); this.ctx.stroke();
    const bh=Math.max(1,Math.abs(cy-oy)); const bt=Math.min(oy,cy);
    const g=this.ctx.createLinearGradient(x,bt,x,bt+bh);
    if(b){ g.addColorStop(0,"#0f0"); g.addColorStop(0.5,"#0f0"); g.addColorStop(1,"#0c0"); }
    else { g.addColorStop(0,"#f00"); g.addColorStop(0.5,"#f00"); g.addColorStop(1,"#c00"); }
    this.ctx.fillStyle=g;
    if(glow){ this.ctx.shadowColor=b?"rgba(0,255,0,.8)":"rgba(255,0,0,.8)"; this.ctx.shadowBlur=12; }
    this.ctx.fillRect(x-w/2,bt,w,bh);
    if(glow) this.ctx.shadowBlur=0;
  }

  addMarker(t, tradeId, account){
    const op=this.currentPrice; const c=this.currentCandle; if(!c)return;
    const bt=Math.max(c.open,c.close); const bb=Math.min(c.open,c.close);
    let fp=op; if(op>bt) fp=bt; else if(op<bb) fp=bb;
    const fi=this.candles.length;
    this.markers.push({ type:t, ts:Date.now(), price:fp, candleIndex:fi, candleTimestamp:c.timestamp, tradeId:tradeId||null, account:account||this._getActiveAcc(), closed:false, profitLoss:null });
  }

  drawMarker(m){
    let actualIdx=m.candleIndex;
    for(let i=0;i<this.candles.length;i++){ if(this.candles[i].timestamp===m.candleTimestamp){ actualIdx=i; break; } }
    const x=this.indexToX(actualIdx); if(x<-200||x>this.w+50)return;
    const y=this.priceToY(m.price); const w=this.getCandleWidth(); const ib=m.type==="buy"; const cl=ib?"#16a34a":"#ff3b3b"; const r=5.5;
    this.ctx.save(); const lsx=x;
    this.ctx.shadowColor=cl; this.ctx.shadowBlur=9; this.ctx.fillStyle=cl; this.ctx.beginPath(); this.ctx.arc(x,y,r,0,2*Math.PI); this.ctx.fill(); this.ctx.shadowBlur=0;
    this.ctx.fillStyle="#fff"; this.ctx.save(); this.ctx.translate(x,y); if(!ib)this.ctx.rotate(Math.PI); this.ctx.beginPath(); this.ctx.moveTo(0,-2.8); this.ctx.lineTo(-2,0.8); this.ctx.lineTo(-0.65,0.8); this.ctx.lineTo(-0.65,2.8); this.ctx.lineTo(0.65,2.8); this.ctx.lineTo(0.65,0.8); this.ctx.lineTo(2,0.8); this.ctx.closePath(); this.ctx.fill(); this.ctx.restore();
    const lx=lsx+w/2+3; const lw=Math.min(95,this.w-lx-22);
    this.ctx.strokeStyle=ib?"rgba(22,163,74,.7)":"rgba(255,59,59,.7)"; this.ctx.lineWidth=1.2; this.ctx.beginPath(); this.ctx.moveTo(lsx+w/2,y); this.ctx.lineTo(lx,y); this.ctx.stroke(); this.ctx.beginPath(); this.ctx.moveTo(lx,y); this.ctx.lineTo(lx+lw,y); this.ctx.stroke();
    const ex=lx+lw; const er=5; this.ctx.strokeStyle=cl; this.ctx.lineWidth=2; this.ctx.fillStyle="#fff"; this.ctx.beginPath(); this.ctx.arc(ex,y,er,0,2*Math.PI); this.ctx.fill(); this.ctx.stroke();
    this.ctx.strokeStyle=ib?"rgba(22,163,74,.5)":"rgba(255,59,59,.5)"; this.ctx.lineWidth=1.2; this.ctx.beginPath(); this.ctx.moveTo(ex+er,y); this.ctx.lineTo(ex+65,y); this.ctx.stroke();
    if(m.closed&&m.profitLoss!==null){
      const pl=m.profitLoss; const isWin=pl>=0; const plText=isWin?`+$${this._fmtBal(pl)}`:`-$${this._fmtBal(Math.abs(pl))}`; const plColor=isWin?'#00ff41':'#ff3b3b'; const bgColor=isWin?'rgba(0,255,65,0.18)':'rgba(255,59,59,0.18)'; const textX=ex+er+4; const textY=y;
      this.ctx.font='bold 11.5px Arial'; const tw=this.ctx.measureText(plText).width;
      this.ctx.fillStyle=bgColor; this.ctx.fillRect(textX-3,textY-10,tw+10,17);
      this.ctx.strokeStyle=plColor; this.ctx.lineWidth=0.8; this.ctx.strokeRect(textX-3,textY-10,tw+10,17);
      this.ctx.fillStyle=plColor; this.ctx.shadowColor=plColor; this.ctx.shadowBlur=4; this.ctx.fillText(plText,textX+2,textY+3); this.ctx.shadowBlur=0;
    }
    this.ctx.restore();
  }

  draw(){
    this.tickZoom();
    this.updatePan();
    this.updatePriceRange();
    this.tickSR();
    this.ctx.clearRect(0,0,this.w,this.h);
    this.drawGrid();
    for(let i=0;i<this.candles.length;i++){ const x=this.indexToX(i); if(x<-60||x>this.w+60)continue; this.drawCandle(this.candles[i],x,false); }
    if(this.currentCandle&&(!this.candles.length||this.currentCandle.timestamp!==this.candles[this.candles.length-1].timestamp)){
      const lx=this.indexToX(this.candles.length); if(lx>=-60&&lx<=this.w+60) this.drawCandle(this.currentCandle,lx,true);
    }
    const activeAcc=this._getActiveAcc();
    for(let mk of this.markers){ if((mk.account||'demo')!==activeAcc)continue; this.drawMarker(mk); }
    if(++this._fr%2===0){ this.updatePriceScale(); this.updateTimeLabels(); }
    this.updatePriceLabel();
    this.updateCandleTimer();

    /* ✅ [جديد] فحص تحميل المزيد كل 30 فريم */
    if (this._fr % 30 === 0) this._checkLoadMore();
  }

  stepTowards(c,t,m){ const d=t-c; return Math.abs(d)<=m?t:c+Math.sign(d)*m; }

  updateCurrentCandle(){
    if(!this.currentCandle){ const lp=this.candles.length?this.candles[this.candles.length-1].close:this.currentPrice; this.currentCandle=this.genCandle(this.t0,lp); this.currentCandle.close=lp; this.currentCandle.high=Math.max(this.currentCandle.open,this.currentCandle.close); this.currentCandle.low=Math.min(this.currentCandle.open,this.currentCandle.close); return; }
    const n=Date.now(); const r=this.rnd(this.seed+n); const dir=(r-0.5)*0.0004; const t=this.currentCandle.close+dir; const ms=0.0008*0.18*(this.volScale||1);
    const nc=+this.stepTowards(this.currentCandle.close,t,ms).toFixed(this.digits); this.currentCandle.close=nc; this.currentCandle.high=+Math.max(this.currentCandle.high,nc).toFixed(this.digits); this.currentCandle.low=+Math.min(this.currentCandle.low,nc).toFixed(this.digits); this.currentPrice=nc; window.__qt_price=this.currentPrice;
  }

  startRealtime(){
    setInterval(()=>{
      if(this.isSwitching) return;
      if(!this.isMaster) return;
      const n=Date.now(); const e=n-this.t0;
      if(e>=this.timeframe){
        if(this.currentCandle&&(!this.candles.length||this.currentCandle.timestamp!==this.candles[this.candles.length-1].timestamp)){
          const completedCandle={...this.currentCandle};
          this.candles.push(completedCandle);
          this.saveCompletedCandle(completedCandle);
          if(this.candles.length>this.maxCandles) this.candles.shift();
        }
        this.t0=Math.floor(n/this.timeframe)*this.timeframe;
        const lp=this.currentCandle?this.currentCandle.close:this.currentPrice;
        this.currentCandle=this.genCandle(this.t0,lp);
        this.currentCandle.open=lp; this.currentCandle.close=lp; this.currentCandle.high=lp; this.currentCandle.low=lp; this.currentPrice=lp;
        this._lastBroadcastedClose=null;
      } else {
        this.updateCurrentCandle();
      }
    }, 200);
    setInterval(()=>{ if(!this.isSwitching&&this.isMaster) this.localStorageManager.saveCandles(this.candles,this.currentPair); }, 10000);
  }

  async saveCompletedCandle(candle){ try { this.firebaseManager.addPendingCandle(candle); } catch(e) {} }

  updatePriceRange(){ let v=[...this.candles]; if(this.currentCandle&&(!v.length||this.currentCandle.timestamp!==v[v.length-1].timestamp)) v.push(this.currentCandle); if(!v.length){ this.priceRange={min:0.95*this.basePrice,max:1.05*this.basePrice}; return; } const si=Math.floor(this.xToIndex(0)); const ei=Math.ceil(this.xToIndex(this.w)); const sl=v.slice(Math.max(0,si-5),Math.min(v.length,ei+5)); if(!sl.length){ this.priceRange={min:0.95*this.basePrice,max:1.05*this.basePrice}; return; } const lo=sl.map(c=>c.low); const hi=sl.map(c=>c.high); const mn=Math.min(...lo); const mx=Math.max(...hi); const pd=0.15*(mx-mn)||0.000000001; this.priceRange={min:mn-pd,max:mx+pd}; }

  initEvents(){
    addEventListener("resize",()=>this.setup());
    this.canvas.addEventListener("wheel",e=>{e.preventDefault();const r=this.canvas.getBoundingClientRect();const x=e.clientX-r.left;const y=e.clientY-r.top;const sc=e.deltaY>0?1/1.1:1.1;this.applyZoomAround(x,y,sc);},{passive:false});
    const md=(x,t)=>{this.drag=1;this.dragStartX=x;this.dragStartOffset=this.targetOffsetX;this.velocity=0;this.lastDragX=x;this.lastDragTime=t;};
    const mm=(x,t)=>{ if(this.drag){ const d=x-this.dragStartX; this.targetOffsetX=this.dragStartOffset+d; this.clampPan(); const dt=t-this.lastDragTime; if(dt>0&&dt<80) this.velocity=(x-this.lastDragX)/dt*26; this.lastDragX=x; this.lastDragTime=t; } };
    const mu=()=>{ this.drag=0; this.updateTimeLabels(); };
    this.canvas.addEventListener("mousedown",e=>{ const r=this.canvas.getBoundingClientRect(); md(e.clientX-r.left,Date.now()); });
    addEventListener("mousemove",e=>{ const r=this.canvas.getBoundingClientRect(); mm(e.clientX-r.left,Date.now()); });
    addEventListener("mouseup",mu);
    const db=(a,b)=>Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);
    this.canvas.addEventListener("touchstart",e=>{const r=this.canvas.getBoundingClientRect();if(e.touches.length===1){md(e.touches[0].clientX-r.left,Date.now());}else if(e.touches.length===2){this.drag=0;this.pinch=1;this.p0=db(e.touches[0],e.touches[1]);this.pMidX=(e.touches[0].clientX+e.touches[1].clientX)/2-r.left;this.pMidY=(e.touches[0].clientY+e.touches[1].clientY)/2-r.top;}},{passive:false});
    this.canvas.addEventListener("touchmove",e=>{e.preventDefault();const r=this.canvas.getBoundingClientRect();if(this.pinch&&e.touches.length===2){const d=db(e.touches[0],e.touches[1]);if(this.p0>0){const sc=Math.max(0.2,Math.min(5,d/(this.p0||d)));this.applyZoomAround(this.pMidX,this.pMidY,sc);}this.p0=d;}else if(!this.pinch&&e.touches.length===1){mm(e.touches[0].clientX-r.left,Date.now());}},{passive:false});
    this.canvas.addEventListener("touchend",e=>{if(e.touches.length<2){this.pinch=0;this.p0=0;}if(e.touches.length===0)mu();},{passive:false});
    this.canvas.addEventListener("touchcancel",()=>{this.pinch=0;this.p0=0;mu();},{passive:false});
  }

  loop(){ this.draw(); requestAnimationFrame(()=>this.loop()); }

  /* ============================================================
     switchPair — يعيد تعيين حالة Lazy Loading
     ============================================================ */
  async switchPair(pairName){
    if(this.currentPair===pairName||this.isSwitching) return;
    this.isSwitching=true;
    this.showLoading(true);
    try {
      await this._cleanupMasterViewer();
      this.currentPair=pairName;
      const cfg=this.PAIR_CONFIG[pairName]||{base:1.0,digits:5,seed:Math.abs(pairName.split('').reduce((h,c)=>((h<<5)-h)+c.charCodeAt(0)|0,0))%90000+10000,volScale:1};
      this.basePrice=cfg.base; this.currentPrice=cfg.base; this.digits=cfg.digits; this.seed=cfg.seed; this.volScale=cfg.volScale;
      this.firebaseManager.setPair(pairName);
      this.candles=[]; this.currentCandle=null; this.markers=[];
      this.t0=Math.floor(Date.now()/this.timeframe)*this.timeframe;
      this.smin=null; this.smax=null; this.velocity=0; this._fr=0;

      /* ✅ [جديد] إعادة تعيين حالة Lazy Loading لكل زوج */
      this._isLoadingMore = false;
      this._allCandlesLoaded = false;
      this._checkLoadCooldown = 0;

      // ✅ تحميل أول 200 شمعة للزوج الجديد
      const firebaseCandles = await this.firebaseManager.loadCandles(this._initialLoadCount);
      if(firebaseCandles&&firebaseCandles.length>0){
        this.candles=firebaseCandles;
        this.usingLocalStorage=false;
        this.localStorageManager.saveCandles(this.candles,pairName);
      } else {
        const localCandles=this.localStorageManager.loadCandles(pairName);
        if(localCandles&&localCandles.length>0){
          this.candles=localCandles.slice(-this._initialLoadCount);
          this.usingLocalStorage=true;
        } else {
          this._generateInitialCandles();
          this.usingLocalStorage=true;
        }
      }

      if(this.candles.length>0) this.currentPrice=this.candles[this.candles.length-1].close;
      this.snapToLive();
      this.updateTimeLabels();
      this.updatePriceRange();
      this.smin=this.priceRange.min; this.smax=this.priceRange.max;
      this.updatePriceScale();
      this.updatePriceLabel();

      await this._initMasterViewerSystem();
      if(this.authManager.user) this.loadOpenTrades();

    } catch(e) {
      console.error('❌ switchPair error:', e);
      try { this._generateInitialCandles(); } catch(_) {}
    } finally {
      this.isSwitching=false;
      this.showLoading(false);
    }
  }

  /* ============================================================
     إدارة الرصيد
     ============================================================ */
  _getActiveAcc(){ return this.authManager.activeAccount || 'demo'; }
  _fmtBal(n){ try{ return new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n); }catch(e){ return (Math.round(n*100)/100).toFixed(2); } }
  _getBalanceFor(acc){ const a=acc||this._getActiveAcc(); return a==='real'?(this.authManager.realBalance||0):(this.authManager.demoBalance||0); }
  _setBalanceFor(acc,amount){ const a=acc||this._getActiveAcc(); const safeAmt=Math.max(0,Number(amount)||0); this.authManager.setBalance(a,safeAmt,{persist:true}); }

  /* ============================================================
     فتح الصفقة
     ============================================================ */
  openTrade(direction){
    const acc=this._getActiveAcc();
    if(acc==='real'&&!this.authManager.user){ this._showMsg('سجّل الدخول لاستخدام الحساب الحقيقي ❌','#dc2626'); return; }
    if(this.authManager.user&&!this.authManager.balancesReady){ this._showMsg('استنى تحميل الرصيد لحظة... ⏳','#f59e0b'); return; }
    const amountEl=document.getElementById('amountDisplay');
    const raw=amountEl?String(amountEl.value||''):'';
    const rawVal=raw.replace(/[^0-9.]/g,'');
    if(!rawVal||rawVal.trim()===''){this._showMsg('اكتب مبلغ الصفقة الأول ❌','#dc2626');return;}
    const amount=parseFloat(rawVal);
    if(!Number.isFinite(amount)||amount<=0){this._showMsg('مبلغ غير صحيح ❌','#dc2626');return;}
    const balance=this._getBalanceFor(acc);
    if(!Number.isFinite(balance)||balance<=0){this._showMsg('الحساب فارغ ❌','#dc2626');return;}
    if(balance<amount){this._showMsg('رصيد غير كافٍ ❌','#dc2626');return;}
    this._setBalanceFor(acc,balance-amount);
    const parts=this.currentPair.split('/');
    const flagMap={'AED':'ae','CNY':'cn','AUD':'au','CAD':'ca','CHF':'ch','BHD':'bh','EUR':'eu','RUB':'ru','USD':'us','KES':'ke','LBP':'lb','QAR':'qa','TRY':'tr','SYP':'sy','EGP':'eg','INR':'in','IRR':'ir'};
    const f1=(flagMap[parts[0]]||parts[0]).toLowerCase();
    const f2=(flagMap[parts[1]]||parts[1]).toLowerCase();
    const payouts={'EUR/USD':0.92,'AUD/CAD':0.88,'AUD/CHF':0.92,'BHD/CNY':0.86,'EUR/RUB':0.77,'KES/USD':0.84,'LBP/USD':0.79,'QAR/CNY':0.83,'USD/CHF':0.89,'SYP/TRY':0.87,'EGP/USD':0.78,'USD/INR':0.90,'AED/CNY':0.83};
    const payout=payouts[this.currentPair]||0.85;
    const tradeId='qt_'+Date.now()+'_'+(++this._tradeCounter);
    const duration=this.selectedTime||5;
    const openTime=Date.now();
    const closeTime=openTime+duration*1000;
    const trade={id:tradeId,dir:direction==='buy'?'up':'down',pair:this.currentPair+' (OTC)',flags:[f1,f2],amountTxt:this._fmtBal(amount),stake:amount,entry:this.currentPrice,payout,remain:duration,duration,openTime,closeTime,open:true,status:'open',account:acc,markerCandleTimestamp:this.currentCandle?this.currentCandle.timestamp:null,markerPrice:this.currentPrice,markerCandleIndex:this.candles.length};
    if(window.tradeHistory){ const current=window.tradeHistory.getTrades()||[]; current.push(trade); window.tradeHistory.setTrades(current); }
    this.addMarker(direction,tradeId,acc);
    if(this.authManager.user) this._saveTradeToFirebase(trade).catch(e=>console.warn('❌ Trade save error:',e));
    this._refreshTradeBadge();
    setTimeout(()=>this._closeTrade(tradeId,trade),duration*1000);
  }

  /* ============================================================
     إغلاق الصفقة + ✅ [جديد] حفظ في سجل التاريخ
     ============================================================ */
  _closeTrade(tradeId, trade){
    const currentP=this.currentPrice;
    const win=(trade.dir==='up'&&currentP>=trade.entry)||(trade.dir==='down'&&currentP<=trade.entry);
    const profit=win?trade.stake*trade.payout:0;
    const pl=win?profit:-trade.stake;
    if(window.tradeHistory){ const remaining=(window.tradeHistory.getTrades()||[]).filter(t=>t.id!==tradeId); window.tradeHistory.setTrades(remaining); }
    const acc=trade.account||'demo';
    if(win){ const b=this._getBalanceFor(acc); this._setBalanceFor(acc,b+trade.stake+profit); }
    const mIdx=this.markers.findIndex(mk=>mk.tradeId===tradeId);
    if(mIdx>=0){ this.markers[mIdx].closed=true; this.markers[mIdx].profitLoss=pl; }

    // ✅ [جديد] حفظ الصفقة المغلقة في Firebase (سجل التاريخ)
    if(this.authManager.user){
      this._saveClosedTradeHistory(trade, win?'win':'loss', pl, currentP)
        .catch(e=>console.warn('❌ History save error:',e));
      this._updateTradeInFirebase(tradeId,{status:'closed',result:win?'win':'loss',profit:pl,closedAt:Date.now(),closePrice:currentP})
        .catch(e=>console.warn('❌ Trade close update error:',e));
    }

    this._refreshTradeBadge();

    // ✅ إشعار نتيجة الصفقة
    const resultColor = win ? '#16a34a' : '#dc2626';
    const resultText  = win
      ? `✅ ربحت +$${this._fmtBal(profit)}`
      : `❌ خسرت -$${this._fmtBal(trade.stake)}`;
    this._showMsg(resultText, resultColor);
  }

  /* ============================================================
     ✅ [جديد] حفظ الصفقة المغلقة في tradeHistory collection
     ============================================================ */
  async _saveClosedTradeHistory(trade, result, profit, closePrice){
    if(!this.authManager.user) return;
    try {
      const email = this.authManager.user.email;
      const histRef = doc(db, 'users', email, 'tradeHistory', trade.id);
      const payload = {
        id:           trade.id,
        pair:         trade.pair,
        dir:          trade.dir,
        account:      trade.account || 'demo',
        stake:        trade.stake,
        amountTxt:    trade.amountTxt || this._fmtBal(trade.stake),
        payout:       trade.payout,
        entry:        trade.entry,
        closePrice:   closePrice,
        duration:     trade.duration,
        openTime:     trade.openTime,
        closedAt:     Date.now(),
        status:       'closed',
        result:       result,
        profit:       profit,
        savedAt:      serverTimestamp()
      };
      await setDoc(histRef, payload);
      console.log('✅ Trade history saved:', trade.id, result);
    } catch(e) { console.error('❌ _saveClosedTradeHistory error:', e); throw e; }
  }

  /* ============================================================
     ✅ [جديد] تحميل سجل الصفقات المغلقة من Firebase
     ============================================================ */
  async loadTradeHistory(limitCount = 50, accountFilter = null){
    if(!this.authManager.user) return [];
    try {
      const email = this.authManager.user.email;
      const histRef = collection(db, 'users', email, 'tradeHistory');
      let q = query(histRef, orderBy('closedAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      const history = [];
      snapshot.forEach(docSnap => {
        const data = { ...docSnap.data(), id: docSnap.id };
        if (!accountFilter || data.account === accountFilter) history.push(data);
      });
      return history;
    } catch(e) { console.error('❌ loadTradeHistory error:', e); return []; }
  }

  /* ============================================================
     Firebase للصفقات المفتوحة
     ============================================================ */
  async _saveTradeToFirebase(trade){
    if(!this.authManager.user) return;
    try {
      const email=this.authManager.user.email;
      const tradeRef=doc(db,'users',email,'trades',trade.id);
      const payload={...trade}; delete payload.open; payload.savedAt=serverTimestamp();
      await setDoc(tradeRef,payload);
    } catch(e) { throw e; }
  }

  async _updateTradeInFirebase(tradeId,updates){
    if(!this.authManager.user) return;
    try { const email=this.authManager.user.email; const tradeRef=doc(db,'users',email,'trades',tradeId); await updateDoc(tradeRef,updates); }
    catch(e) { throw e; }
  }

  async loadOpenTrades(){
    if(!this.authManager.user) return;
    try {
      const email=this.authManager.user.email;
      const tradesRef=collection(db,'users',email,'trades');
      const q=query(tradesRef,where('status','==','open'));
      const snapshot=await getDocs(q);
      if(snapshot.empty){ this._refreshTradeBadge(); return; }
      if(window.tradeHistory) window.tradeHistory.setTrades([]);
      this.markers=[];
      const now=Date.now();
      for(const docSnap of snapshot.docs){
        const trade={...docSnap.data(),id:docSnap.id};
        if(!trade.closeTime) continue;
        if(trade.closeTime<=now) await this._closeExpiredTrade(trade);
        else {
          const remaining=trade.closeTime-now;
          trade.remain=Math.ceil(remaining/1000); trade.open=true;
          if(window.tradeHistory){ const current=window.tradeHistory.getTrades()||[]; if(!current.find(t=>t.id===trade.id)){ current.push(trade); window.tradeHistory.setTrades(current); } }
          this._restoreTradeMarker(trade);
          setTimeout(()=>this._closeTrade(trade.id,trade),remaining);
        }
      }
      this._refreshTradeBadge();
    } catch(e) { console.error('❌ loadOpenTrades error:',e); }
  }

  _restoreTradeMarker(trade){
    let candleIdx=trade.markerCandleIndex||0;
    if(trade.markerCandleTimestamp){ for(let i=0;i<this.candles.length;i++){ if(this.candles[i].timestamp===trade.markerCandleTimestamp){ candleIdx=i; break; } } }
    this.markers.push({type:trade.dir==='up'?'buy':'sell',ts:trade.openTime||Date.now(),price:trade.markerPrice||trade.entry,candleIndex:candleIdx,candleTimestamp:trade.markerCandleTimestamp,tradeId:trade.id,account:trade.account||'demo',closed:false,profitLoss:null});
  }

  async _closeExpiredTrade(trade){
    const currentP=this.currentPrice;
    const win=(trade.dir==='up'&&currentP>=trade.entry)||(trade.dir==='down'&&currentP<=trade.entry);
    const profit=win?trade.stake*trade.payout:0; const pl=win?profit:-trade.stake;
    const acc=trade.account||'demo';
    if(win){ const b=this._getBalanceFor(acc); this._setBalanceFor(acc,b+trade.stake+profit); }
    let candleIdx=trade.markerCandleIndex||0;
    if(trade.markerCandleTimestamp){ for(let i=0;i<this.candles.length;i++){ if(this.candles[i].timestamp===trade.markerCandleTimestamp){ candleIdx=i; break; } } }
    this.markers.push({type:trade.dir==='up'?'buy':'sell',ts:trade.openTime||Date.now(),price:trade.markerPrice||trade.entry,candleIndex:candleIdx,candleTimestamp:trade.markerCandleTimestamp,tradeId:trade.id,account:acc,closed:true,profitLoss:pl});
    try {
      await this._updateTradeInFirebase(trade.id,{status:'closed',result:win?'win':'loss',profit:pl,closedAt:Date.now(),closePrice:currentP});
      // ✅ حفظ في tradeHistory أيضاً
      await this._saveClosedTradeHistory(trade, win?'win':'loss', pl, currentP);
    } catch(e) {}
  }

  /* ============================================================
     ✅ [جديد] بناء بانيل سجل الصفقات المغلقة
     ============================================================ */
  _buildHistoryPanel(){
    if(document.getElementById('_qtHistoryPanel')) return;

    // ── بناء الـ Panel ──
    const panel = document.createElement('div');
    panel.id = '_qtHistoryPanel';
    panel.innerHTML = `
      <div class="hp-head">
        <div class="hp-title">📋 سجل الصفقات</div>
        <button class="hp-close" id="_qtHistClose">✕</button>
      </div>
      <div class="hp-tabs">
        <button class="hp-tab active" data-acc="demo">◆ Demo</button>
        <button class="hp-tab" data-acc="real">● Real</button>
        <button class="hp-tab" data-acc="all">🌐 الكل</button>
      </div>
      <div class="hp-body" id="_qtHistBody">
        <div class="hp-empty">سجّل الدخول لعرض صفقاتك</div>
      </div>
    `;
    document.body.appendChild(panel);

    // ── زر الفتح/الإغلاق ──
    const toggleBtn = document.createElement('button');
    toggleBtn.id = '_qtHistoryToggleBtn';
    toggleBtn.innerHTML = `<span>📋 السجل</span><span class="htb-badge" id="_qtHistBadge"></span>`;
    document.body.appendChild(toggleBtn);

    // ── أحداث ──
    toggleBtn.addEventListener('click', () => this._toggleHistoryPanel());
    document.getElementById('_qtHistClose').addEventListener('click', () => this._closeHistoryPanel());

    // تبويبات
    panel.querySelectorAll('.hp-tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        panel.querySelectorAll('.hp-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        await this._renderHistoryBody(tab.dataset.acc);
      });
    });

    // إغلاق عند النقر خارج البانيل
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#_qtHistoryPanel') && !e.target.closest('#_qtHistoryToggleBtn')) {
        this._closeHistoryPanel();
      }
    });
  }

  _toggleHistoryPanel(){
    const panel = document.getElementById('_qtHistoryPanel');
    if(!panel) return;
    const isOpen = panel.classList.contains('open');
    if(isOpen) { this._closeHistoryPanel(); }
    else { this._openHistoryPanel(); }
  }

  _openHistoryPanel(){
    const panel = document.getElementById('_qtHistoryPanel');
    if(!panel) return;
    panel.classList.add('open');
    // تحميل بيانات الحساب النشط
    const activeAcc = this._getActiveAcc();
    // تفعيل التبويب المناسب
    panel.querySelectorAll('.hp-tab').forEach(t => t.classList.toggle('active', t.dataset.acc === activeAcc));
    this._renderHistoryBody(activeAcc);
  }

  _closeHistoryPanel(){
    const panel = document.getElementById('_qtHistoryPanel');
    if(panel) panel.classList.remove('open');
  }

  /* ✅ مزامنة تبويب التاريخ مع الحساب النشط */
  _syncHistoryTabToAccount(){
    const panel = document.getElementById('_qtHistoryPanel');
    if(!panel||!panel.classList.contains('open')) return;
    const activeAcc = this._getActiveAcc();
    panel.querySelectorAll('.hp-tab').forEach(t => t.classList.toggle('active', t.dataset.acc === activeAcc));
    this._renderHistoryBody(activeAcc);
  }

  /* ✅ رسم محتوى السجل */
  async _renderHistoryBody(accFilter = 'demo'){
    const body = document.getElementById('_qtHistBody');
    if(!body) return;

    if(!this.authManager.user){
      body.innerHTML = `<div class="hp-empty">🔐 سجّل الدخول لعرض صفقاتك</div>`;
      return;
    }

    body.innerHTML = `<div class="hp-loading">⏳ جاري التحميل...</div>`;

    try {
      const filterArg = accFilter === 'all' ? null : accFilter;
      const history = await this.loadTradeHistory(100, filterArg);

      if(!history.length){
        body.innerHTML = `<div class="hp-empty">📭 لا توجد صفقات مغلقة بعد</div>`;
        return;
      }

      let html = '';
      for(const t of history){
        const isWin = t.result === 'win';
        const dirClass = t.dir === 'up' ? 'up' : 'down';
        const dirLabel = t.dir === 'up' ? '▲ BUY' : '▼ SELL';
        const plAbs = Math.abs(t.profit || 0);
        const plText = isWin ? `+$${this._fmtBal(plAbs)}` : `-$${this._fmtBal(plAbs)}`;
        const dateStr = t.closedAt ? new Date(t.closedAt).toLocaleString('ar-EG',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'}) : '--';
        const accLabel = (t.account||'demo') === 'real' ? '<span class="ht-acc-badge live">LIVE</span>' : '<span class="ht-acc-badge demo">DEMO</span>';
        html += `
          <div class="ht-card ${isWin?'win':'loss'}">
            <div class="ht-row1">
              <span class="ht-pair">${t.pair||'--'}${accLabel}</span>
              <span class="ht-dir ${dirClass}">${dirLabel}</span>
            </div>
            <div class="ht-row2">
              <div class="ht-meta">
                💰 مبلغ: $${this._fmtBal(t.stake||0)}<br>
                🕐 ${dateStr}
              </div>
              <div class="ht-pl ${isWin?'win':'loss'}">${plText}</div>
            </div>
          </div>
        `;
      }

      body.innerHTML = html;

      // ✅ تحديث الـ badge بعدد الصفقات
      this._updateHistoryBadge(history.length);

    } catch(e) {
      console.error('❌ _renderHistoryBody error:', e);
      body.innerHTML = `<div class="hp-empty">⚠️ خطأ في التحميل</div>`;
    }
  }

  _updateHistoryBadge(count){
    const badge = document.getElementById('_qtHistBadge');
    if(!badge) return;
    if(count > 0){ badge.textContent = count > 99 ? '99+' : String(count); badge.classList.add('show'); }
    else badge.classList.remove('show');
  }

  /* ============================================================
     Trade Badge
     ============================================================ */
  _refreshTradeBadge(){
    try {
      const acc=this._getActiveAcc();
      const trades=(window.tradeHistory?(window.tradeHistory.getTrades()||[]):[]);
      const count=trades.filter(t=>(t.account||'demo')===acc).length;
      this._updateTradeBadge(count);
    } catch(e) {}
  }

  _updateTradeBadge(count){
    let badge=document.getElementById('_qtTradeBadge');
    if(!badge){
      let histBtn=document.querySelector('#historyBtn')||document.querySelector('.historyBtn')||document.querySelector('[data-panel="history"]')||document.querySelector('#tradeHistoryBtn')||document.querySelector('.tradeHistBtn')||document.querySelector('[id*="hist" i]')||document.querySelector('[class*="hist" i]');
      if(!histBtn) document.querySelectorAll('button').forEach(btn=>{ if(!histBtn&&((btn.id&&btn.id.toLowerCase().includes('hist'))||(btn.className&&btn.className.toLowerCase().includes('hist'))))histBtn=btn; });
      if(!histBtn) return;
      badge=document.createElement('span');
      badge.id='_qtTradeBadge';
      badge.style.cssText='position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;font-size:10px;font-weight:900;min-width:18px;height:18px;border-radius:9px;display:none;align-items:center;justify-content:center;padding:0 4px;z-index:10000;pointer-events:none;box-shadow:0 2px 6px rgba(0,0,0,.5);line-height:1';
      histBtn.style.position='relative';
      histBtn.appendChild(badge);
    }
    if(count>0){ badge.textContent=count>99?'99+':String(count); badge.style.display='flex'; }
    else badge.style.display='none';
  }

  _showMsg(text, color){
    if(!document.getElementById('_qtToastCSS')){
      const s=document.createElement('style'); s.id='_qtToastCSS';
      s.textContent=`@keyframes _qtFade{0%{opacity:0;transform:translateX(-50%) translateY(-14px)}12%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-8px)}}`;
      document.head.appendChild(s);
    }
    const t=document.createElement('div');
    t.style.cssText=`position:fixed;top:68px;left:50%;transform:translateX(-50%);background:${color};color:#fff;padding:10px 22px;border-radius:12px;font-size:14px;font-weight:900;z-index:999999;box-shadow:0 4px 20px rgba(0,0,0,.5);white-space:nowrap;animation:_qtFade 2.4s forwards;pointer-events:none;letter-spacing:.3px;`;
    t.textContent=text; document.body.appendChild(t); setTimeout(()=>t.remove(),2400);
  }
}

/* ============================================================
   🚀 تهيئة التطبيق
   ============================================================ */
window.chart = new AdvancedTradingChart();
const timeSelector   = document.getElementById("timeSelector");
const timeDropdown   = document.getElementById("timeDropdown");
const timeDisplay    = document.getElementById("timeDisplay");
const tabCompensation= document.getElementById("tabCompensation");
const tabCustom      = document.getElementById("tabCustom");
const compensationList=document.getElementById("compensationList");
const amountDisplay  = document.getElementById("amountDisplay");
const amountContainer= document.getElementById("amountContainer");
let isEditingTime = false;
let savedTimeValue = "00:05";

timeSelector.addEventListener("click", e=>{
  e.stopPropagation();
  if(!isEditingTime) timeDropdown.classList.toggle("show");
});
document.addEventListener("click", ()=>{
  timeDropdown.classList.remove("show");
  if(isEditingTime){ timeDisplay.textContent=savedTimeValue; isEditingTime=false; }
});
timeDropdown.addEventListener("click", e=>e.stopPropagation());

tabCompensation.addEventListener("click", ()=>{
  tabCompensation.classList.add("active"); tabCustom.classList.remove("active");
  compensationList.style.display="grid";
  if(isEditingTime){ timeDisplay.textContent=savedTimeValue; isEditingTime=false; }
});

tabCustom.addEventListener("click", ()=>{
  tabCustom.classList.add("active"); tabCompensation.classList.remove("active");
  compensationList.style.display="none";
  isEditingTime=true;
  const editVal=savedTimeValue.replace(':','');
  timeDisplay.textContent=editVal;
  setTimeout(()=>{
    timeDisplay.focus();
    try { const range=document.createRange(); range.selectNodeContents(timeDisplay); const sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(range); } catch(e) {}
  }, 30);
});

compensationList.addEventListener("click", e=>{
  if(e.target.classList.contains("dropdown-item")){
    savedTimeValue=e.target.textContent;
    timeDisplay.textContent=savedTimeValue;
    chart.selectedTime=parseInt(e.target.getAttribute("data-sec"));
    timeDropdown.classList.remove("show");
  }
});

timeDisplay.addEventListener("input", e=>{
  if(isEditingTime){
    let v=e.target.textContent.replace(/[^0-9]/g,"");
    if(v.length>4) v=v.slice(0,4);
    const sel=window.getSelection(); const pos=sel.focusOffset;
    e.target.textContent=v;
    try{ if(e.target.firstChild){ const r=document.createRange(); r.setStart(e.target.firstChild,Math.min(pos,v.length)); r.collapse(true); sel.removeAllRanges(); sel.addRange(r); } }catch(_){}
  }
});

timeDisplay.addEventListener("blur", ()=>{
  if(isEditingTime){
    let v=timeDisplay.textContent.replace(/[^0-9]/g,"");
    if(v.length===0) v="0005";
    v=v.padStart(4,"0");
    const h=v.slice(0,2); const m=v.slice(2,4);
    savedTimeValue=`${h}:${m}`;
    timeDisplay.textContent=savedTimeValue;
    const totalSec=parseInt(h)*60+parseInt(m);
    chart.selectedTime=totalSec>0?totalSec:5;
    isEditingTime=false;
  }
});

timeDisplay.addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); this.blur(); } });

amountContainer.addEventListener("click", ()=>amountDisplay.focus());
amountDisplay.addEventListener("focus", function(){ let v=this.value.replace("$",""); this.value=v; setTimeout(()=>this.setSelectionRange(0,this.value.length),10); });
amountDisplay.addEventListener("input", function(){ this.value=this.value.replace(/[^0-9]/g,""); });
amountDisplay.addEventListener("blur", function(){ let val=parseFloat(this.value)||50; this.value=val+"$"; });
amountDisplay.addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); this.blur(); } });

document.getElementById("buyBtn").addEventListener("click",  ()=>chart.openTrade("buy"));
document.getElementById("sellBtn").addEventListener("click", ()=>chart.openTrade("sell"));

console.log('🚀 QT Trading Chart v4 — Lazy Loading (200 + scroll) + Trade History Firebase ✅');
