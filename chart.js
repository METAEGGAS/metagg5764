// ============================================
// Firebase Configuration & Initialization
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBOUqLixfphg3b8hajc4hkwV-VJmldGBVw",
    authDomain: "randers-c640b.firebaseapp.com",
    projectId: "randers-c640b",
    storageBucket: "randers-c640b.firebasestorage.app",
    messagingSenderId: "391496092929",
    appId: "1:391496092929:web:58208b4eb3e6f9a8571f00",
    measurementId: "G-DBDSVVF7PS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// Local Storage Manager
// ============================================

class LocalStorageManager {
    constructor() {
        this.CANDLES_KEY = 'qt_trading_candles';
        this.LAST_SYNC_KEY = 'qt_last_sync';
    }

    saveCandles(candles) {
        try {
            localStorage.setItem(this.CANDLES_KEY, JSON.stringify(candles));
            localStorage.setItem(this.LAST_SYNC_KEY, Date.now().toString());
            console.log('âœ… Candles saved to local storage:', candles.length);
        } catch (error) {
            console.error('â‌Œ Error saving to local storage:', error);
        }
    }

    loadCandles() {
        try {
            const data = localStorage.getItem(this.CANDLES_KEY);
            if (data) {
                const candles = JSON.parse(data);
                console.log('âœ… Candles loaded from local storage:', candles.length);
                return candles;
            }
        } catch (error) {
            console.error('â‌Œ Error loading from local storage:', error);
        }
        return null;
    }

    getLastSyncTime() {
        const time = localStorage.getItem(this.LAST_SYNC_KEY);
        return time ? parseInt(time) : 0;
    }

    clear() {
        localStorage.removeItem(this.CANDLES_KEY);
        localStorage.removeItem(this.LAST_SYNC_KEY);
        console.log('ًں—‘ï¸ڈ Local storage cleared');
    }
}

// ============================================
// Firebase Manager
// ============================================

class FirebaseManager {
    constructor() {
        this.db = db;
        this.candlesCollection = 'candles';
        this.saveBatchSize = 50; // ط¹ط¯ط¯ ط§ظ„ط´ظ…ظˆط¹ ظپظٹ ظƒظ„ ط¯ظپط¹ط© ط­ظپط¸
        this.saveInterval = 30000; // 30 ط«ط§ظ†ظٹط©
        this.lastSaveTime = 0;
        this.pendingCandles = [];
        this.isSaving = false;
        
        // ط¨ط¯ط، ط§ظ„ط­ظپط¸ ط§ظ„طھظ„ظ‚ط§ط¦ظٹ
        this.startAutoSave();
    }

    async saveCandles(candles) {
        if (this.isSaving) {
            console.log('âڈ³ Save operation already in progress...');
            return false;
        }

        try {
            this.isSaving = true;
            console.log('ًں’¾ Starting to save candles to Firebase:', candles.length);

            const batch = [];
            for (const candle of candles) {
                const candleData = {
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                    timestamp: candle.timestamp,
                    savedAt: serverTimestamp()
                };
                batch.push(candleData);

                // ط­ظپط¸ ط§ظ„ط¯ظپط¹ط§طھ
                if (batch.length >= this.saveBatchSize) {
                    await this.saveBatch(batch);
                    batch.length = 0;
                    await this.delay(100); // طھط£ط®ظٹط± طµط؛ظٹط± ط¨ظٹظ† ط§ظ„ط¯ظپط¹ط§طھ
                }
            }

            // ط­ظپط¸ ط§ظ„ط´ظ…ظˆط¹ ط§ظ„ظ…طھط¨ظ‚ظٹط©
            if (batch.length > 0) {
                await this.saveBatch(batch);
            }

            this.lastSaveTime = Date.now();
            console.log('âœ… All candles saved to Firebase successfully');
            return true;

        } catch (error) {
            console.error('â‌Œ Error saving candles to Firebase:', error);
            return false;
        } finally {
            this.isSaving = false;
        }
    }

    async saveBatch(batch) {
        const promises = batch.map(candleData => 
            addDoc(collection(this.db, this.candlesCollection), candleData)
        );
        await Promise.all(promises);
        console.log(`âœ… Saved batch of ${batch.length} candles`);
    }

    async loadCandles(maxCandles = 200) {
        try {
            console.log('ًں“¥ Loading candles from Firebase...');
            
            const q = query(
                collection(this.db, this.candlesCollection),
                orderBy('timestamp', 'desc'),
                limit(maxCandles)
            );

            const querySnapshot = await getDocs(q);
            const candles = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                candles.push({
                    open: data.open,
                    high: data.high,
                    low: data.low,
                    close: data.close,
                    timestamp: data.timestamp
                });
            });

            // طھط±طھظٹط¨ ط§ظ„ط´ظ…ظˆط¹ ظ…ظ† ط§ظ„ط£ظ‚ط¯ظ… ظ„ظ„ط£ط­ط¯ط«
            candles.reverse();

            console.log('âœ… Loaded candles from Firebase:', candles.length);
            return candles;

        } catch (error) {
            console.error('â‌Œ Error loading candles from Firebase:', error);
            return null;
        }
    }

    async clearOldCandles(daysToKeep = 7) {
        try {
            const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
            const q = query(
                collection(this.db, this.candlesCollection),
                where('timestamp', '<', cutoffTime)
            );

            const querySnapshot = await getDocs(q);
            console.log(`ًں—‘ï¸ڈ Found ${querySnapshot.size} old candles to delete`);

            // ظٹظ…ظƒظ† ط¥ط¶ط§ظپط© ظƒظˆط¯ ط§ظ„ط­ط°ظپ ظ‡ظ†ط§ ط¥ط°ط§ ظ„ط²ظ… ط§ظ„ط£ظ…ط±
            
        } catch (error) {
            console.error('â‌Œ Error clearing old candles:', error);
        }
    }

    addPendingCandle(candle) {
        this.pendingCandles.push(candle);
    }

    startAutoSave() {
        setInterval(async () => {
            if (this.pendingCandles.length > 0 && !this.isSaving) {
                const candlesToSave = [...this.pendingCandles];
                this.pendingCandles = [];
                await this.saveCandles(candlesToSave);
            }
        }, this.saveInterval);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================
// Live Time Display
// ============================================

function updateLiveTime() {
    const d = new Date();
    const u = d.getTime() + d.getTimezoneOffset() * 60000;
    const t = new Date(u + (3 * 3600000)); // UTC+3
    const h = String(t.getHours()).padStart(2, "0");
    const m = String(t.getMinutes()).padStart(2, "0");
    const s = String(t.getSeconds()).padStart(2, "0");
    document.getElementById("liveTime").textContent = `${h}:${m}:${s} UTC+3`;
}

updateLiveTime();
setInterval(updateLiveTime, 1000);

// ============================================
// Advanced Trading Chart Class
// ============================================

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

        // Initialize managers
        this.localStorageManager = new LocalStorageManager();
        this.firebaseManager = new FirebaseManager();

        this.candles = [];
        this.currentCandle = null;
        this.maxCandles = 200;
        this.basePrice = 1.95;
        this.currentPrice = 1.9518;
        this.seed = 11001;
        this.digits = 5;
        this.priceRange = { min: 1.9, max: 2 };
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
        this.timeframe = 60000; // 1 minute
        this.t0 = Math.floor(Date.now() / 60000) * 60000;
        this.smin = null;
        this.smax = null;
        this.sre = 0.088;
        this._fr = 0;
        this.markers = [];
        this.selectedTime = 5;

        this.dataLoaded = false;
        this.usingLocalStorage = false;

        this.setup();
        this.initData();
    }

    async initData() {
        this.showLoading(true);

        try {
            // ظ…ط­ط§ظˆظ„ط© طھط­ظ…ظٹظ„ ظ…ظ† Firebase ط£ظˆظ„ط§ظ‹
            console.log('ًں”„ Attempting to load from Firebase...');
            const firebaseCandles = await this.firebaseManager.loadCandles(this.maxCandles);

            if (firebaseCandles && firebaseCandles.length > 0) {
                console.log('âœ… Using Firebase data');
                this.candles = firebaseCandles;
                this.usingLocalStorage = false;
                
                // ط­ظپط¸ ظ†ط³ط®ط© ظ…ط­ظ„ظٹط©
                this.localStorageManager.saveCandles(this.candles);
            } else {
                // ط¥ط°ط§ ظ„ظ… طھطھظˆظپط± ط¨ظٹط§ظ†ط§طھ FirebaseطŒ ط§ط³طھط®ط¯ظ… ط§ظ„طھط®ط²ظٹظ† ط§ظ„ظ…ط­ظ„ظٹ
                console.log('âڑ ï¸ڈ No Firebase data, trying local storage...');
                const localCandles = this.localStorageManager.loadCandles();

                if (localCandles && localCandles.length > 0) {
                    console.log('âœ… Using local storage data');
                    this.candles = localCandles;
                    this.usingLocalStorage = true;
                } else {
                    // طھظˆظ„ظٹط¯ ط¨ظٹط§ظ†ط§طھ طھط§ط±ظٹط®ظٹط© ط¬ط¯ظٹط¯ط©
                    console.log('ًں“ٹ Generating new historical data...');
                    this.initHistoricalData();
                    this.usingLocalStorage = true;
                }
            }

            // طھظ‡ظٹط¦ط© ط§ظ„ط³ط¹ط± ط§ظ„ط­ط§ظ„ظٹ
            if (this.candles.length > 0) {
                this.currentPrice = this.candles[this.candles.length - 1].close;
            }

            this.snapToLive();
            this.updateTimeLabels();
            this.updatePriceRange();
            this.smin = this.priceRange.min;
            this.smax = this.priceRange.max;
            this.updatePriceScale();
            this.updatePriceLabel();

            this.dataLoaded = true;
            this.initEvents();
            this.startRealtime();
            this.loop();

        } catch (error) {
            console.error('â‌Œ Error initializing data:', error);
            // ظپظٹ ط­ط§ظ„ط© ط§ظ„ط®ط·ط£طŒ ط§ط³طھط®ط¯ظ… ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ط­ظ„ظٹط© ط£ظˆ ط§ظ„طھظˆظ„ظٹط¯
            this.initHistoricalData();
            this.usingLocalStorage = true;
            this.dataLoaded = true;
            this.initEvents();
            this.startRealtime();
            this.loop();
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        if (this.loadingOverlay) {
            if (show) {
                this.loadingOverlay.classList.add('show');
            } else {
                this.loadingOverlay.classList.remove('show');
            }
        }
    }

    setup() {
        const dpr = window.devicePixelRatio || 1;
        const r = this.plot.getBoundingClientRect();
        this.w = r.width;
        this.h = r.height - 24;
        this.canvas.width = this.w * dpr;
        this.canvas.height = this.h * dpr;
        this.canvas.style.width = this.w + "px";
        this.canvas.style.height = this.h + "px";
        this.ctx.scale(dpr, dpr);
        
        if (this.dataLoaded) {
            this.updatePriceLabel();
            this.updatePriceScale();
            this.updateTimeLabels();
        }
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
        const vb = 0.0008;
        const tb = 0.00005;
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

    initHistoricalData() {
        let p = this.basePrice;
        let t = Date.now() - this.maxCandles * this.timeframe;
        
        for (let i = 0; i < this.maxCandles; i++) {
            const c = this.genCandle(t, p);
            this.candles.push(c);
            p = c.close;
            t += this.timeframe;
        }

        this.currentPrice = this.candles[this.candles.length - 1].close;
        
        // ط­ظپط¸ ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ظˆظ„ط¯ط©
        this.localStorageManager.saveCandles(this.candles);
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
        if (Math.abs(diff) > 0.003) {
            this.offsetX += diff * this.panEase;
        } else {
            this.offsetX = this.targetOffsetX;
        }

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
        if (Math.abs(d) > 0.0001) {
            this.zoom += d * this.zoomEase;
        } else {
            this.zoom = this.targetZoom;
        }
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

    getPriceRange() {
        const mn = this.smin !== null ? this.smin : this.priceRange.min;
        const mx = this.smax !== null ? this.smax : this.priceRange.max;
        return { min: mn, max: mx };
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

    calcNiceGrid() {
        const r = this.getPriceRange();
        const rng = r.max - r.min;
        const d = this.niceNum(rng / 7, false);
        const g0 = Math.floor(r.min / d) * d;
        const g1 = Math.ceil(r.max / d) * d;

        return {
            min: g0,
            max: g1,
            step: d,
            count: Math.round((g1 - g0) / d)
        };
    }

    drawGrid() {
        const { min, max, step, count } = this.calcNiceGrid();

        // ط±ط³ظ… ط®ط·ظˆط· ط§ظ„ط³ط¹ط± ط§ظ„ط£ظپظ‚ظٹط©
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

        // ط±ط³ظ… ط®ط·ظˆط· ط§ظ„ظˆظ‚طھ ط§ظ„ط¹ظ…ظˆط¯ظٹط©
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
            if (i % Math.round(stepC * 5) === 0) {
                lb.classList.add("major");
            }
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

        this.priceScaleLabels.innerHTML = h;
    }

    updatePriceLabel() {
        const py = this.priceToY(this.currentPrice);
        this.priceLine.style.top = py + "px";
        this.currentPriceEl.style.top = py + "px";
        this.currentPriceEl.textContent = this.currentPrice.toFixed(this.digits);
    }

    updateCandleTimer() {
        if (!this.currentCandle) return;

        const n = Date.now();
        const e = n - this.t0;
        const r = this.timeframe - e;
        const s = Math.floor(r / 1000);

        this.candleTimer.textContent = s >= 0 ? s : 0;

        const cx = this.indexToX(this.candles.length);
        this.candleTimer.style.left = cx + 15 + "px";
        this.candleTimer.style.top = "10px";
        this.candleTimer.style.display = 'block';
    }

    priceToY(p) {
        const r = this.getPriceRange();
        const n = (p - r.min) / (r.max - r.min);
        return this.h * (1 - n);
    }

    drawCandle(c, x, glow) {
        const oy = this.priceToY(c.open);
        const cy = this.priceToY(c.close);
        const hy = this.priceToY(c.high);
        const ly = this.priceToY(c.low);
        const b = c.close >= c.open;
        const w = this.getCandleWidth();

        // ط±ط³ظ… ط§ظ„ط¸ظ„ (shadow/wick)
        this.ctx.strokeStyle = b ? "#0f0" : "#f00";
        this.ctx.lineWidth = Math.max(1, 0.18 * w);
        this.ctx.beginPath();
        this.ctx.moveTo(x, hy);
        this.ctx.lineTo(x, ly);
        this.ctx.stroke();

        // ط±ط³ظ… ط¬ط³ظ… ط§ظ„ط´ظ…ط¹ط©
        const bh = Math.max(1, Math.abs(cy - oy));
        const bt = Math.min(oy, cy);

        const g = this.ctx.createLinearGradient(x, bt, x, bt + bh);
        if (b) {
            g.addColorStop(0, "#0f0");
            g.addColorStop(0.5, "#0f0");
            g.addColorStop(1, "#0c0");
        } else {
            g.addColorStop(0, "#f00");
            g.addColorStop(0.5, "#f00");
            g.addColorStop(1, "#c00");
        }

        this.ctx.fillStyle = g;

        if (glow) {
            this.ctx.shadowColor = b ? "rgba(0,255,0,.8)" : "rgba(255,0,0,.8)";
            this.ctx.shadowBlur = 12;
        }

        this.ctx.fillRect(x - w / 2, bt, w, bh);

        if (glow) {
            this.ctx.shadowBlur = 0;
        }
    }

    addMarker(t) {
        const op = this.currentPrice;
        const c = this.currentCandle;
        if (!c) return;

        const bt = Math.max(c.open, c.close);
        const bb = Math.min(c.open, c.close);
        let fp = op;

        if (op > bt) {
            fp = bt;
        } else if (op < bb) {
            fp = bb;
        }

        const fi = this.candles.length;

        this.markers.push({
            type: t,
            ts: Date.now(),
            price: fp,
            candleIndex: fi,
            candleTimestamp: c.timestamp
        });
    }

    drawMarker(m) {
        let actualIdx = m.candleIndex;

        // ط§ظ„ط¹ط«ظˆط± ط¹ظ„ظ‰ ط§ظ„ظپظ‡ط±ط³ ط§ظ„ظپط¹ظ„ظٹ ط¨ظ†ط§ط،ظ‹ ط¹ظ„ظ‰ ط§ظ„ط·ط§ط¨ط¹ ط§ظ„ط²ظ…ظ†ظٹ
        for (let i = 0; i < this.candles.length; i++) {
            if (this.candles[i].timestamp === m.candleTimestamp) {
                actualIdx = i;
                break;
            }
        }

        const x = this.indexToX(actualIdx);
        if (x < -200 || x > this.w + 50) return;

        const y = this.priceToY(m.price);
        const w = this.getCandleWidth();
        const ib = m.type === "buy";
        const cl = ib ? "#16a34a" : "#ff3b3b";
        const r = 5.5;

        this.ctx.save();

        // ط±ط³ظ… ط§ظ„ظ†ظ‚ط·ط© ط§ظ„ط±ط¦ظٹط³ظٹط©
        const lsx = x;
        this.ctx.shadowColor = cl;
        this.ctx.shadowBlur = 9;
        this.ctx.fillStyle = cl;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // ط±ط³ظ… ط§ظ„ط³ظ‡ظ…
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

        // ط±ط³ظ… ط§ظ„ط®ط· ظˆط§ظ„ط¯ط§ط¦ط±ط© ط§ظ„ظ†ظ‡ط§ط¦ظٹط©
        const lx = lsx + w / 2 + 3;
        const lw = Math.min(95, this.w - lx - 22);

        this.ctx.strokeStyle = ib ? "rgba(22,163,74,.7)" : "rgba(255,59,59,.7)";
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.moveTo(lsx + w / 2, y);
        this.ctx.lineTo(lx, y);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(lx, y);
        this.ctx.lineTo(lx + lw, y);
        this.ctx.stroke();

        const ex = lx + lw;
        const er = 5;

        this.ctx.strokeStyle = cl;
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = "#fff";
        this.ctx.beginPath();
        this.ctx.arc(ex, y, er, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.strokeStyle = ib ? "rgba(22,163,74,.5)" : "rgba(255,59,59,.5)";
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.moveTo(ex + er, y);
        this.ctx.lineTo(ex + 65, y);
        this.ctx.stroke();

        this.ctx.restore();
    }

    draw() {
        this.tickZoom();
        this.updatePan();
        this.updatePriceRange();
        this.tickSR();

        this.ctx.clearRect(0, 0, this.w, this.h);

        this.drawGrid();

        // ط±ط³ظ… ط§ظ„ط´ظ…ظˆط¹
        for (let i = 0; i < this.candles.length; i++) {
            const x = this.indexToX(i);
            if (x < -60 || x > this.w + 60) continue;
            this.drawCandle(this.candles[i], x, false);
        }

        // ط±ط³ظ… ط§ظ„ط´ظ…ط¹ط© ط§ظ„ط­ط§ظ„ظٹط©
        if (this.currentCandle && (!this.candles.length || this.currentCandle.timestamp !== this.candles[this.candles.length - 1].timestamp)) {
            const lx = this.indexToX(this.candles.length);
            if (lx >= -60 && lx <= this.w + 60) {
                this.drawCandle(this.currentCandle, lx, true);
            }
        }

        // ط±ط³ظ… ط§ظ„ط¹ظ„ط§ظ…ط§طھ
        for (let mk of this.markers) {
            this.drawMarker(mk);
        }

        // طھط­ط¯ظٹط« ظˆط§ط¬ظ‡ط© ط§ظ„ظ…ط³طھط®ط¯ظ…
        if (++this._fr % 2 === 0) {
            this.updatePriceScale();
            this.updateTimeLabels();
        }

        this.updatePriceLabel();
        this.updateCandleTimer();
    }

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
        const ms = 0.0008 * 0.18;
        const nc = +this.stepTowards(this.currentCandle.close, t, ms).toFixed(this.digits);

        this.currentCandle.close = nc;
        this.currentCandle.high = +Math.max(this.currentCandle.high, nc).toFixed(this.digits);
        this.currentCandle.low = +Math.min(this.currentCandle.low, nc).toFixed(this.digits);
        this.currentPrice = nc;
    }

    startRealtime() {
        setInterval(() => {
            const n = Date.now();
            const e = n - this.t0;

            if (e >= this.timeframe) {
                // ط¥ظ†ظ‡ط§ط، ط§ظ„ط´ظ…ط¹ط© ط§ظ„ط­ط§ظ„ظٹط©
                if (this.currentCandle && (!this.candles.length || this.candles[this.candles.length - 1].timestamp !== this.currentCandle.timestamp)) {
                    const completedCandle = { ...this.currentCandle };
                    this.candles.push(completedCandle);
                    
                    // ط­ظپط¸ ط§ظ„ط´ظ…ط¹ط© ط§ظ„ظ…ظƒطھظ…ظ„ط©
                    this.saveCompletedCandle(completedCandle);

                    // ط§ظ„ط­ظپط§ط¸ ط¹ظ„ظ‰ ط§ظ„ط­ط¯ ط§ظ„ط£ظ‚طµظ‰ ظ„ظ„ط´ظ…ظˆط¹
                    if (this.candles.length > this.maxCandles) {
                        this.candles.shift();
                    }
                }

                // ط¨ط¯ط، ط´ظ…ط¹ط© ط¬ط¯ظٹط¯ط©
                this.t0 = Math.floor(n / this.timeframe) * this.timeframe;
                const lp = this.currentCandle ? this.currentCandle.close : this.currentPrice;
                this.currentCandle = this.genCandle(this.t0, lp);
                this.currentCandle.open = lp;
                this.currentCandle.close = lp;
                this.currentCandle.high = lp;
                this.currentCandle.low = lp;
                this.currentPrice = lp;
            } else {
                this.updateCurrentCandle();
            }
        }, 200);

        // ط­ظپط¸ ط¯ظˆط±ظٹ ظ„ظ„طھط®ط²ظٹظ† ط§ظ„ظ…ط­ظ„ظٹ
        setInterval(() => {
            this.localStorageManager.saveCandles(this.candles);
        }, 10000); // ظƒظ„ 10 ط«ظˆط§ظ†ظٹ
    }

    async saveCompletedCandle(candle) {
        try {
            // ط­ظپط¸ ظپظٹ Firebase
            this.firebaseManager.addPendingCandle(candle);
            console.log('ًں“ٹ Candle queued for Firebase save');
        } catch (error) {
            console.error('â‌Œ Error queuing candle:', error);
        }
    }

    updatePriceRange() {
        let v = [...this.candles];
        if (this.currentCandle && (!v.length || this.currentCandle.timestamp !== v[v.length - 1].timestamp)) {
            v.push(this.currentCandle);
        }

        if (!v.length) {
            this.priceRange = {
                min: 0.95 * this.basePrice,
                max: 1.05 * this.basePrice
            };
            return;
        }

        const si = Math.floor(this.xToIndex(0));
        const ei = Math.ceil(this.xToIndex(this.w));
        const sl = v.slice(Math.max(0, si - 5), Math.min(v.length, ei + 5));

        if (!sl.length) {
            this.priceRange = {
                min: 0.95 * this.basePrice,
                max: 1.05 * this.basePrice
            };
            return;
        }

        const lo = sl.map(c => c.low);
        const hi = sl.map(c => c.high);
        const mn = Math.min(...lo);
        const mx = Math.max(...hi);
        const pd = 0.15 * (mx - mn) || 0.000000001;

        this.priceRange = {
            min: mn - pd,
            max: mx + pd
        };
    }

    initEvents() {
        addEventListener("resize", () => this.setup());

        // Mouse wheel zoom
        this.canvas.addEventListener("wheel", e => {
            e.preventDefault();
            const r = this.canvas.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            const sc = e.deltaY > 0 ? 1 / 1.1 : 1.1;
            this.applyZoomAround(x, y, sc);
        }, { passive: false });

        // Mouse drag
        const md = (x, t) => {
            this.drag = 1;
            this.dragStartX = x;
            this.dragStartOffset = this.targetOffsetX;
            this.velocity = 0;
            this.lastDragX = x;
            this.lastDragTime = t;
        };

        const mm = (x, t) => {
            if (this.drag) {
                const d = x - this.dragStartX;
                this.targetOffsetX = this.dragStartOffset + d;
                this.clampPan();

                const dt = t - this.lastDragTime;
                if (dt > 0 && dt < 80) {
                    this.velocity = (x - this.lastDragX) / dt * 26;
                }

                this.lastDragX = x;
                this.lastDragTime = t;
            }
        };

        const mu = () => {
            this.drag = 0;
            this.updateTimeLabels();
        };

        this.canvas.addEventListener("mousedown", e => {
            const r = this.canvas.getBoundingClientRect();
            md(e.clientX - r.left, Date.now());
        });

        addEventListener("mousemove", e => {
            const r = this.canvas.getBoundingClientRect();
            mm(e.clientX - r.left, Date.now());
        });

        addEventListener("mouseup", mu);

        // Touch events
        const db = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

        this.canvas.addEventListener("touchstart", e => {
            const r = this.canvas.getBoundingClientRect();
            if (e.touches.length === 1) {
                md(e.touches[0].clientX - r.left, Date.now());
            } else if (e.touches.length === 2) {
                this.drag = 0;
                this.pinch = 1;
                this.p0 = db(e.touches[0], e.touches[1]);
                this.pMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
                this.pMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
            }
        }, { passive: false });

        this.canvas.addEventListener("touchmove", e => {
            e.preventDefault();
            const r = this.canvas.getBoundingClientRect();

            if (this.pinch && e.touches.length === 2) {
                const d = db(e.touches[0], e.touches[1]);
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
            if (e.touches.length < 2) {
                this.pinch = 0;
                this.p0 = 0;
            }
            if (e.touches.length === 0) {
                mu();
            }
        }, { passive: false });

        this.canvas.addEventListener("touchcancel", () => {
            this.pinch = 0;
            this.p0 = 0;
            mu();
        }, { passive: false });
    }

    loop() {
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

// ============================================
// Initialize Chart & Controls
// ============================================

window.chart = new AdvancedTradingChart();

// Time selector controls
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

timeSelector.addEventListener("click", e => {
    e.stopPropagation();
    if (!isEditingTime) {
        timeDropdown.classList.toggle("show");
    }
});

document.addEventListener("click", () => {
    timeDropdown.classList.remove("show");
    if (isEditingTime) {
        timeDisplay.textContent = savedTimeValue;
        isEditingTime = false;
    }
});

timeDropdown.addEventListener("click", e => e.stopPropagation());

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
    timeDisplay.textContent = "";
    isEditingTime = true;
    setTimeout(() => timeDisplay.focus(), 50);
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
        e.target.textContent = v;
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
        isEditingTime = false;
    }
});

// Amount input controls
amountContainer.addEventListener("click", () => {
    amountDisplay.focus();
});

amountDisplay.addEventListener("focus", function () {
    let v = this.value.replace("$", "");
    this.value = v;
    setTimeout(() => {
        this.setSelectionRange(0, this.value.length);
    }, 10);
});

amountDisplay.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
});

amountDisplay.addEventListener("blur", function () {
    let val = parseFloat(this.value) || 50;
    this.value = val + "$";
});

amountDisplay.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        this.blur();
    }
});

// Trade buttons
document.getElementById("buyBtn").addEventListener("click", () => chart.addMarker("buy"));
document.getElementById("sellBtn").addEventListener("click", () => chart.addMarker("sell"));

console.log('ًںڑ€ QT Trading Chart initialized with Firebase integration');
