import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDSkeB77jmxyu7CGIoNbCuTLRKJwTr5waU",
  authDomain: "qt-real-trading.firebaseapp.com",
  databaseURL: "https://qt-real-trading-default-rtdb.firebaseio.com/",
  projectId: "qt-real-trading",
  storageBucket: "qt-real-trading.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let currentUser = null;
let candles = [];
let chartWidth, chartHeight, candleWidth = 8, spacing = 2, offsetX = 0, isDragging = false, lastX = 0, minPrice = 1.08, maxPrice = 1.12, lastPrice = 1.10, timeframe = 60, candleTimer = timeframe, lastCandleTime = Date.now();

const canvas = document.getElementById('chartCanvas');
const ctx = canvas.getContext('2d');
const priceLine = document.getElementById('priceLine');
const candleTimerEl = document.getElementById('candleTimer');
const currentPriceEl = document.getElementById('currentPrice');
const priceScaleLabels = document.getElementById('priceScaleLabels');
const timeLabelsEl = document.getElementById('timeLabels');
const liveTimeEl = document.getElementById('liveTime');
const balanceAmount = document.querySelector('.balance-amount');
const walletBtn = document.querySelector('.wallet-btn');
const loadingOverlay = document.getElementById('loadingOverlay');

let candleGenModal = null;
let isDataLoaded = false;

function showLoading() {
  loadingOverlay.classList.add('show');
}

function hideLoading() {
  loadingOverlay.classList.remove('show');
}

function resizeCanvas() {
  const container = canvas.parentElement;
  chartWidth = container.clientWidth;
  chartHeight = container.clientHeight;
  canvas.width = chartWidth;
  canvas.height = chartHeight;
  drawChart();
}

function priceToY(price) {
  return chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * (chartHeight - 30);
}

function yToPrice(y) {
  return minPrice + ((chartHeight - 30 - y) / (chartHeight - 30)) * (maxPrice - minPrice);
}

function drawChart() {
  ctx.clearRect(0, 0, chartWidth, chartHeight);
  const visibleCandles = Math.floor((chartWidth - 60) / (candleWidth + spacing));
  const startIdx = Math.max(0, candles.length - visibleCandles + Math.floor(offsetX / (candleWidth + spacing)));
  
  for (let i = startIdx; i < Math.min(candles.length, startIdx + visibleCandles + 5); i++) {
    const c = candles[i];
    const x = (i - startIdx) * (candleWidth + spacing) - (offsetX % (candleWidth + spacing)) + 10;
    if (x < -candleWidth || x > chartWidth) continue;
    
    const yOpen = priceToY(c.open);
    const yClose = priceToY(c.close);
    const yHigh = priceToY(c.high);
    const yLow = priceToY(c.low);
    const color = c.close >= c.open ? '#00ff00' : '#ff0000';
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + candleWidth / 2, yHigh);
    ctx.lineTo(x + candleWidth / 2, yLow);
    ctx.stroke();
    
    ctx.fillStyle = color;
    const bodyTop = Math.min(yOpen, yClose);
    const bodyHeight = Math.abs(yClose - yOpen) || 1;
    ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
  }
  
  updatePriceScale();
  updateTimeLabels();
}

function updatePriceScale() {
  const priceStep = (maxPrice - minPrice) / 10;
  priceScaleLabels.innerHTML = '';
  
  for (let i = 0; i <= 10; i++) {
    const price = minPrice + priceStep * i;
    const y = priceToY(price);
    const label = document.createElement('div');
    label.className = 'pLabel' + (i % 2 === 0 ? ' major' : '');
    label.textContent = price.toFixed(5);
    label.style.top = y + 'px';
    priceScaleLabels.appendChild(label);
  }
  
  if (candles.length > 0) {
    const current = candles[candles.length - 1].close;
    currentPriceEl.textContent = current.toFixed(5);
    currentPriceEl.style.top = priceToY(current) + 'px';
    priceLine.style.top = priceToY(current) + 'px';
  }
}

function updateTimeLabels() {
  timeLabelsEl.innerHTML = '';
  const visibleCandles = Math.floor((chartWidth - 60) / (candleWidth + spacing));
  const startIdx = Math.max(0, candles.length - visibleCandles + Math.floor(offsetX / (candleWidth + spacing)));
  
  for (let i = startIdx; i < Math.min(candles.length, startIdx + visibleCandles + 5); i += 5) {
    const c = candles[i];
    const x = (i - startIdx) * (candleWidth + spacing) - (offsetX % (candleWidth + spacing)) + 10;
    const label = document.createElement('div');
    label.className = 'timeLabel' + (i % 10 === 0 ? ' major' : '');
    const date = new Date(c.time);
    label.textContent = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    label.style.left = x + 'px';
    timeLabelsEl.appendChild(label);
  }
}

function generateRealisticCandle() {
  const volatility = 0.0002;
  const trendStrength = 0.0001;
  const wickRatio = Math.random() * 0.3 + 0.1;
  
  const trend = (Math.random() - 0.5) * trendStrength;
  const change = (Math.random() - 0.5) * volatility + trend;
  
  const open = lastPrice;
  const close = open + change;
  const range = Math.abs(change);
  const wickSize = range * wickRatio / (1 - wickRatio);
  
  let high, low;
  if (close >= open) {
    high = close + wickSize * Math.random();
    low = open - wickSize * Math.random();
  } else {
    high = open + wickSize * Math.random();
    low = close - wickSize * Math.random();
  }
  
  high = Math.min(high, maxPrice - 0.0001);
  low = Math.max(low, minPrice + 0.0001);
  
  lastPrice = close;
  return { open, high, low, close, time: Date.now() };
}

async function initializeUserData(uid) {
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);
  
  if (!snapshot.exists()) {
    await set(userRef, {
      balance: 11000,
      createdAt: Date.now(),
      lastActive: Date.now()
    });
  } else {
    await update(userRef, { lastActive: Date.now() });
  }
}

function loadUserBalance(uid) {
  const balanceRef = ref(db, `users/${uid}/balance`);
  onValue(balanceRef, (snapshot) => {
    const balance = snapshot.exists() ? snapshot.val() : 11000;
    balanceAmount.textContent = '$' + balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });
}

async function loadCandlesFromFirebase() {
  if (isDataLoaded) return;
  
  showLoading();
  const candlesRef = ref(db, 'candles');
  
  try {
    const snapshot = await get(candlesRef);
    if (snapshot.exists()) {
      candles = snapshot.val() || [];
      if (candles.length > 0) {
        lastPrice = candles[candles.length - 1].close;
        minPrice = Math.min(...candles.map(c => c.low)) - 0.001;
        maxPrice = Math.max(...candles.map(c => c.high)) + 0.001;
      }
    } else {
      generateInitialCandles(100);
      await saveCandlesToFirebase();
    }
    
    isDataLoaded = true;
    drawChart();
    hideLoading();
  } catch (error) {
    console.error("Error loading candles:", error);
    generateInitialCandles(100);
    isDataLoaded = true;
    drawChart();
    hideLoading();
  }
}

async function saveCandlesToFirebase() {
  if (!currentUser) return;
  const candlesRef = ref(db, 'candles');
  try {
    await set(candlesRef, candles);
  } catch (error) {
    console.error("Error saving candles:", error);
  }
}

function generateInitialCandles(count) {
  candles = [];
  for (let i = 0; i < count; i++) {
    candles.push(generateRealisticCandle());
  }
}

function updateCandle() {
  if (!isDataLoaded) return;
  
  const now = Date.now();
  const elapsed = Math.floor((now - lastCandleTime) / 1000);
  candleTimer = Math.max(0, timeframe - elapsed);
  candleTimerEl.textContent = candleTimer;
  
  if (candleTimer === 0) {
    candles.push(generateRealisticCandle());
    if (candles.length > 500) candles.shift();
    lastCandleTime = now;
    candleTimer = timeframe;
    saveCandlesToFirebase();
    drawChart();
  }
}

function updateLiveTime() {
  const now = new Date();
  const utc3 = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  liveTimeEl.textContent = utc3.toLocaleTimeString('en-US', { hour12: false }) + ' UTC+3';
}

function showCandleGeneratorModal() {
  if (candleGenModal) return;
  
  candleGenModal = document.createElement('div');
  candleGenModal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(10,22,40,0.95);display:flex;align-items:center;justify-content:center;z-index:10000;';
  
  const modal = document.createElement('div');
  modal.style.cssText = 'background:#0f1d35;border-radius:15px;padding:25px;width:90%;max-width:400px;border:2px solid rgba(59,130,246,0.3);';
  
  modal.innerHTML = `
    <h2 style="color:#3b82f6;text-align:center;margin-bottom:20px;font-size:20px;">🕯️ توليد الشموع</h2>
    <div style="margin-bottom:20px;">
      <label style="display:block;color:#8b9cb5;margin-bottom:8px;font-size:13px;">عدد الشموع:</label>
      <input type="number" id="candleCount" value="50" min="10" max="500" style="width:100%;background:#0a1628;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:12px;color:#fff;font-size:16px;text-align:center;">
    </div>
    <div style="margin-bottom:20px;">
      <label style="display:block;color:#8b9cb5;margin-bottom:8px;font-size:13px;">الاتجاه:</label>
      <select id="trendType" style="width:100%;background:#0a1628;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:12px;color:#fff;font-size:14px;">
        <option value="neutral">محايد</option>
        <option value="bullish">صاعد 📈</option>
        <option value="bearish">هابط 📉</option>
        <option value="volatile">متذبذب ⚡</option>
      </select>
    </div>
    <div style="display:flex;gap:10px;">
      <button id="generateBtn" style="flex:1;background:linear-gradient(135deg,#00ff00,#00cc00);color:#fff;border:0;border-radius:10px;padding:14px;font-size:15px;font-weight:800;cursor:pointer;">توليد</button>
      <button id="cancelBtn" style="flex:1;background:#ff0000;color:#fff;border:0;border-radius:10px;padding:14px;font-size:15px;font-weight:800;cursor:pointer;">إلغاء</button>
    </div>
  `;
  
  candleGenModal.appendChild(modal);
  document.body.appendChild(candleGenModal);
  
  document.getElementById('generateBtn').onclick = () => {
    const count = parseInt(document.getElementById('candleCount').value);
    const trend = document.getElementById('trendType').value;
    generateCustomCandles(count, trend);
    closeCandleModal();
  };
  
  document.getElementById('cancelBtn').onclick = closeCandleModal;
  candleGenModal.onclick = (e) => { if (e.target === candleGenModal) closeCandleModal(); };
}

function closeCandleModal() {
  if (candleGenModal) {
    candleGenModal.remove();
    candleGenModal = null;
  }
}

async function generateCustomCandles(count, trend) {
  showLoading();
  
  setTimeout(async () => {
    const newCandles = [];
    let currentPrice = lastPrice;
    
    for (let i = 0; i < count; i++) {
      const volatility = trend === 'volatile' ? 0.0004 : 0.0002;
      let trendStrength = 0;
      
      if (trend === 'bullish') trendStrength = 0.00015;
      else if (trend === 'bearish') trendStrength = -0.00015;
      else if (trend === 'volatile') trendStrength = (Math.random() - 0.5) * 0.0003;
      
      const change = (Math.random() - 0.5) * volatility + trendStrength;
      const open = currentPrice;
      const close = open + change;
      
      const wickRatio = Math.random() * 0.3 + 0.1;
      const range = Math.abs(change);
      const wickSize = range * wickRatio / (1 - wickRatio);
      
      let high, low;
      if (close >= open) {
        high = close + wickSize * Math.random();
        low = open - wickSize * Math.random();
      } else {
        high = open + wickSize * Math.random();
        low = close - wickSize * Math.random();
      }
      
      high = Math.min(high, maxPrice - 0.0001);
      low = Math.max(low, minPrice + 0.0001);
      
      currentPrice = close;
      newCandles.push({
        open: parseFloat(open.toFixed(5)),
        high: parseFloat(high.toFixed(5)),
        low: parseFloat(low.toFixed(5)),
        close: parseFloat(close.toFixed(5)),
        time: Date.now() + (i * timeframe * 1000)
      });
    }
    
    candles.push(...newCandles);
    lastPrice = currentPrice;
    
    if (candles.length > 1000) {
      candles = candles.slice(-1000);
    }
    
    minPrice = Math.min(...candles.map(c => c.low)) - 0.001;
    maxPrice = Math.max(...candles.map(c => c.high)) + 0.001;
    
    await saveCandlesToFirebase();
    drawChart();
    hideLoading();
  }, 100);
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    console.log('User logged in:', user.uid);
    await initializeUserData(user.uid);
    loadUserBalance(user.uid);
    await loadCandlesFromFirebase();
  } else {
    showLoading();
    try {
      const userCredential = await signInAnonymously(auth);
      currentUser = userCredential.user;
      console.log('Anonymous user created:', currentUser.uid);
    } catch (error) {
      console.error('Error signing in:', error);
      hideLoading();
    }
  }
});

canvas.addEventListener('mousedown', (e) => { isDragging = true; lastX = e.clientX; });
canvas.addEventListener('mousemove', (e) => { if (isDragging) { offsetX += lastX - e.clientX; offsetX = Math.max(0, offsetX); lastX = e.clientX; drawChart(); } });
canvas.addEventListener('mouseup', () => { isDragging = false; });
canvas.addEventListener('mouseleave', () => { isDragging = false; });
canvas.addEventListener('touchstart', (e) => { isDragging = true; lastX = e.touches[0].clientX; });
canvas.addEventListener('touchmove', (e) => { if (isDragging) { offsetX += lastX - e.touches[0].clientX; offsetX = Math.max(0, offsetX); lastX = e.touches[0].clientX; drawChart(); } });
canvas.addEventListener('touchend', () => { isDragging = false; });

walletBtn.addEventListener('click', showCandleGeneratorModal);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
setInterval(updateCandle, 1000);
setInterval(updateLiveTime, 1000);
updateLiveTime();

document.getElementById('timeSelector').addEventListener('click', () => {
  document.getElementById('timeDropdown').classList.toggle('show');
});

document.querySelectorAll('.dropdown-item').forEach(item => {
  item.addEventListener('click', function() {
    const sec = parseInt(this.dataset.sec);
    timeframe = sec;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    document.getElementById('timeDisplay').textContent = (h > 0 ? h.toString().padStart(2, '0') + ':' : '') + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
    document.getElementById('timeDropdown').classList.remove('show');
  });
});
