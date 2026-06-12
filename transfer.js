(()=>{if(window.DFTransferUI&&window.DFTransferUI.destroy)window.DFTransferUI.destroy();const CFG={available:"0.000001",currency:"USDT",fromAccount:"حساب تداول",toAccount:"تمويل الحساب",amount:"",mount:null,zIndex:999999,onConfirm:null,onClose:null},S=(o={})=>({...CFG,...o}),svgBack=`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.5 4.5L8 12l7.5 7.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`,svgDoc=`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7zm0 0v5h5M8.5 12h7M8.5 16h7M8.5 8h3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,svgChevron=`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;function inject(opt={}){const c=S(opt),old=document.getElementById("df-transfer-root");old&&old.remove();if(!document.getElementById("df-transfer-style")){const st=document.createElement("style");st.id="df-transfer-style";st.textContent=`
#df-transfer-root,*[data-df-transfer-root]{box-sizing:border-box}
#df-transfer-root{direction:rtl;font-family:"Noto Sans Arabic",Tahoma,Arial,sans-serif}
#df-transfer-root .dfx-wrap{background:#000;color:#fff;width:100%;height:100%;min-height:100vh;overflow:hidden}
#df-transfer-root.dfx-overlay{position:fixed;inset:0;z-index:999999}
#df-transfer-root .dfx-page{width:100%;max-width:100vw;min-height:100vh;background:#000;padding:0 0 calc(env(safe-area-inset-bottom,0px) + 22px);overflow-x:hidden}
#df-transfer-root .dfx-top{height:54px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;color:#fff;position:relative}
#df-transfer-root .dfx-top .dfx-title{position:absolute;left:50%;transform:translateX(-50%);font-size:18px;font-weight:500;line-height:1}
#df-transfer-root .dfx-icon-btn{width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;user-select:none}
#df-transfer-root .dfx-body{padding:0 22px 20px}
#df-transfer-root .dfx-label{font-size:16px;font-weight:500;line-height:1.5;margin:12px 0 10px;color:#fff}
#df-transfer-root .dfx-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
#df-transfer-root .dfx-available{font-size:15px;color:#bfbfbf;white-space:nowrap}
#df-transfer-root .dfx-card{position:relative;background:#141414;border:1px solid #242424;border-radius:10px;height:62px;display:flex;align-items:center;padding:0 16px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.02)}
#df-transfer-root .dfx-select,#df-transfer-root .dfx-input{width:100%;height:100%;border:0;outline:0;background:transparent;color:#fff;font-size:18px;font-weight:500;font-family:inherit}
#df-transfer-root .dfx-select{appearance:none;-webkit-appearance:none;-moz-appearance:none;padding-left:30px;cursor:pointer}
#df-transfer-root .dfx-select option{color:#000}
#df-transfer-root .dfx-arrow{position:absolute;left:14px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:#ffd43b;pointer-events:none;display:flex;align-items:center;justify-content:center}
#df-transfer-root .dfx-input{font-size:17px;font-weight:400;padding-left:72px}
#df-transfer-root .dfx-input::placeholder{color:#676767;font-size:15px}
#df-transfer-root .dfx-all{position:absolute;left:16px;top:50%;transform:translateY(-50%);border:0;background:none;color:#ffd43b;font-size:16px;font-weight:500;cursor:pointer;padding:0}
#df-transfer-root .dfx-spacer{height:148px}
#df-transfer-root .dfx-submit{display:block;width:100%;height:60px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:linear-gradient(135deg,#f8d129 0%,#ffe76a 48%,#f3c616 100%);color:#111;font-size:20px;font-weight:700;font-family:inherit;cursor:pointer;box-shadow:0 0 0 1px rgba(255,255,255,.08) inset,0 6px 18px rgba(255,212,59,.18)}
#df-transfer-root .dfx-submit:active{transform:translateY(1px)}
#df-transfer-root .dfx-footer{padding:0 14px}
#df-transfer-root .dfx-card:focus-within{border-color:#3a3a3a}
`;document.head.appendChild(st)}const host=document.createElement("div");host.id="df-transfer-root";host.setAttribute("data-df-transfer-root","1");const mount=typeof c.mount==="string"?document.querySelector(c.mount):c.mount,isBodyLike=!mount||mount===document.body||mount===document.documentElement;if(isBodyLike){host.className="dfx-overlay";document.body.appendChild(host);document.documentElement.style.overflow="hidden";document.body.style.overflow="hidden"}else{mount.innerHTML="";mount.appendChild(host)}host.innerHTML=`
<div class="dfx-wrap">
  <div class="dfx-page">
    <div class="dfx-top">
      <div class="dfx-icon-btn dfx-back" aria-label="back">${svgBack}</div>
      <div class="dfx-title">نقل</div>
      <div class="dfx-icon-btn dfx-doc" aria-label="doc">${svgDoc}</div>
    </div>
    <div class="dfx-body">
      <div class="dfx-label">نقل حساب خارجي</div>
      <div class="dfx-card">
        <select class="dfx-select" id="dfx-from">
          <option ${c.fromAccount==="حساب تداول"?"selected":""}>حساب تداول</option>
          <option ${c.fromAccount==="تمويل الحساب"?"selected":""}>تمويل الحساب</option>
        </select>
        <div class="dfx-arrow">${svgChevron}</div>
      </div>

      <div class="dfx-label" style="margin-top:20px">نقل إلى الحساب</div>
      <div class="dfx-card">
        <select class="dfx-select" id="dfx-to">
          <option ${c.toAccount==="تمويل الحساب"?"selected":""}>تمويل الحساب</option>
          <option ${c.toAccount==="حساب تداول"?"selected":""}>حساب تداول</option>
        </select>
        <div class="dfx-arrow">${svgChevron}</div>
      </div>

      <div class="dfx-row" style="margin-top:22px">
        <div class="dfx-label" style="margin:0">اختر العملة</div>
        <div class="dfx-available">متاح:${c.available}</div>
      </div>
      <div class="dfx-card" style="margin-top:10px">
        <select class="dfx-select" id="dfx-currency">
          <option ${c.currency==="USDT"?"selected":""}>USDT</option>
          <option ${c.currency==="USDC"?"selected":""}>USDC</option>
          <option ${c.currency==="BTC"?"selected":""}>BTC</option>
          <option ${c.currency==="ETH"?"selected":""}>ETH</option>
        </select>
        <div class="dfx-arrow">${svgChevron}</div>
      </div>

      <div class="dfx-label" style="margin-top:20px">اختر الكمية</div>
      <div class="dfx-card">
        <input class="dfx-input" id="dfx-amount" inputmode="decimal" autocomplete="off" placeholder="يرجى إدخال الكمية المراد تحويلها" value="${String(c.amount||"").replace(/"/g,"&quot;")}">
        <button class="dfx-all" type="button">الكل</button>
      </div>

      <div class="dfx-spacer"></div>

      <div class="dfx-footer">
        <button class="dfx-submit" type="button">تأكيد</button>
      </div>
    </div>
  </div>
</div>`;const $=s=>host.querySelector(s),from=$("#dfx-from"),to=$("#dfx-to"),currency=$("#dfx-currency"),amount=$("#dfx-amount"),allBtn=$(".dfx-all"),submit=$(".dfx-submit"),back=$(".dfx-back"),doc=$(".dfx-doc");allBtn.onclick=()=>amount.value=c.available;back.onclick=()=>destroy(c);doc.onclick=()=>{host.dispatchEvent(new CustomEvent("df-transfer-doc",{detail:getData()}));if(typeof c.onDoc==="function")c.onDoc(getData())};submit.onclick=()=>{const data=getData();host.dispatchEvent(new CustomEvent("df-transfer-confirm",{detail:data}));if(typeof c.onConfirm==="function")c.onConfirm(data)};function getData(){return{from:from.value,to:to.value,currency:currency.value,amount:amount.value.trim(),available:c.available}}window.DFTransferUI={root:host,getData,destroy:()=>destroy(c),mount:inject};return window.DFTransferUI}function destroy(c={}){const el=document.getElementById("df-transfer-root");el&&el.remove();document.documentElement.style.overflow="";document.body.style.overflow="";if(typeof c.onClose==="function")c.onClose()}window.DFTransferUI={mount:inject,destroy};window.DFTransferUI.mount({
  mount:"#dfb",
  available:"0.000001",
  currency:"USDT",
  fromAccount:"حساب تداول",
  toAccount:"تمويل الحساب",
  amount:"",
  onConfirm:(data)=>{console.log("DF Transfer Confirm:",data)}
});})();
