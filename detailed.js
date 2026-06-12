(()=>{
let W=window,D=document,R=W.__DFS=W.__DFS||{};

const CSS=`
.tfr-wrap{position:fixed;inset:0;background:#000;color:#fff;z-index:200;font-family:"Noto Sans Arabic",Tahoma,Arial,sans-serif;direction:rtl;overflow-y:auto;display:none}
.tfr-wrap.on{display:block}
.tfr-tb{position:sticky;top:0;background:#000;display:flex;align-items:center;justify-content:space-between;padding:14px 14px;border-bottom:1px solid #1a1a1a;z-index:5}
.tfr-tb .tfr-back{font-size:26px;cursor:pointer;color:#fff;background:none;border:0;padding:4px 8px;line-height:1}
.tfr-tb .tfr-tt{font:700 18px Arial;color:#fff}
.tfr-tb .tfr-rt{width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer}
.tfr-tb .tfr-rt svg{width:22px;height:22px;fill:none;stroke:#fff;stroke-width:1.8}
.tfr-body{padding:18px 18px 40px}
.tfr-lb{color:#fff;font:700 16px Arial;margin:14px 0 10px;display:block}
.tfr-sel{background:#1a1a1a;border:0;border-radius:8px;height:54px;width:100%;color:#fff;font:500 16px Arial;padding:0 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;position:relative}
.tfr-sel .tfr-val{color:#fff}
.tfr-sel .tfr-ar{color:#ffd21f;font-size:14px}
.tfr-row{display:flex;justify-content:space-between;align-items:center;margin:14px 0 10px}
.tfr-row .tfr-lb{margin:0}
.tfr-row .tfr-av{color:#aaa;font:500 14px Arial}
.tfr-input{background:#1a1a1a;border:0;border-radius:8px;height:54px;width:100%;color:#fff;font:500 16px Arial;padding:0 16px;display:flex;align-items:center;justify-content:space-between}
.tfr-input input{background:transparent;border:0;outline:0;color:#fff;font:500 15px Arial;flex:1;text-align:right;direction:rtl}
.tfr-input input::placeholder{color:#666}
.tfr-input .tfr-all{color:#ffd21f;font:700 16px Arial;cursor:pointer;padding-right:10px;border-right:1px solid #2a2a2a;margin-right:10px;height:24px;display:flex;align-items:center}
.tfr-btn{background:#ffd21f;color:#111;border:0;border-radius:30px;height:56px;width:100%;font:700 19px Tahoma;cursor:pointer;margin-top:60px;box-shadow:0 4px 14px #ffd21f33}
.tfr-btn:active{opacity:.85}
.tfr-dd{position:fixed;inset:0;background:#00000099;z-index:210;display:none;align-items:flex-end;justify-content:center}
.tfr-dd.on{display:flex}
.tfr-dd-pn{background:#1a1a1a;width:100%;max-width:520px;border-radius:14px 14px 0 0;padding:14px 0;max-height:60vh;overflow:auto}
.tfr-dd-it{padding:16px 20px;color:#fff;font:500 16px Arial;cursor:pointer;border-bottom:1px solid #222;text-align:right}
.tfr-dd-it:last-child{border:0}
.tfr-dd-it.act{color:#ffd21f}
`;

function inj(){
if(D.getElementById('tfr-css'))return;
let s=D.createElement('style');s.id='tfr-css';s.textContent=CSS;D.head.appendChild(s);
}

const ACC=['حساب تداول','تمويل الحساب','حساب عقود','حساب محاكي'];
const COINS=['USDT','BTC','ETH','USDC','BNB'];

let state={from:'حساب تداول',to:'تمويل الحساب',coin:'USDT',amount:'',avail:0.000001};

function getBal(){
try{
let m=W.DF_MODE?W.DF_MODE():'real';
let c=JSON.parse(localStorage.getItem('dfCache_'+m)||'null');
if(c){
if(state.from==='حساب تداول')return +c.accounttrade||0;
if(state.from==='تمويل الحساب')return +c.balance||0;
}
}catch(e){}
return 0.000001;
}

function build(){
inj();
let old=D.getElementById('tfr-wrap');if(old)old.remove();
let w=D.createElement('div');
w.id='tfr-wrap';w.className='tfr-wrap';
w.innerHTML=`
<div class="tfr-tb">
<button class="tfr-back" id="tfr-back">‹</button>
<div class="tfr-tt">نقل</div>
<div class="tfr-rt"><svg viewBox="0 0 24 24"><path d="M5 4h11l3 3v13H5z"/><path d="M9 9h7M9 13h7M9 17h5"/></svg></div>
</div>
<div class="tfr-body">
<label class="tfr-lb">نقل حساب خارجي</label>
<div class="tfr-sel" data-k="from"><span class="tfr-val" id="tfr-from">${state.from}</span><span class="tfr-ar">▼</span></div>

<label class="tfr-lb">نقل إلى الحساب</label>
<div class="tfr-sel" data-k="to"><span class="tfr-val" id="tfr-to">${state.to}</span><span class="tfr-ar">▼</span></div>

<div class="tfr-row">
<label class="tfr-lb">اختر العملة</label>
<span class="tfr-av" id="tfr-av">متاح:${(+state.avail).toFixed(6)}</span>
</div>
<div class="tfr-sel" data-k="coin"><span class="tfr-val" id="tfr-coin">${state.coin}</span><span class="tfr-ar">▼</span></div>

<label class="tfr-lb" style="margin-top:18px">اختر الكمية</label>
<div class="tfr-input">
<span class="tfr-all" id="tfr-all">الكل</span>
<input type="text" id="tfr-amt" placeholder="يرجى إدخال الكمية المراد تحويلها" inputmode="decimal">
</div>

<button class="tfr-btn" id="tfr-ok">تأكيد</button>
</div>
<div class="tfr-dd" id="tfr-dd"><div class="tfr-dd-pn" id="tfr-dd-pn"></div></div>
`;
D.body.appendChild(w);
bind(w);
return w;
}

function bind(w){
w.querySelector('#tfr-back').onclick=close;
w.querySelectorAll('.tfr-sel').forEach(el=>{
el.onclick=()=>openDd(el.dataset.k);
});
w.querySelector('#tfr-all').onclick=()=>{
let b=getBal();
w.querySelector('#tfr-amt').value=b;
};
w.querySelector('#tfr-ok').onclick=()=>{
let v=parseFloat(w.querySelector('#tfr-amt').value);
if(!v||v<=0){alert('يرجى إدخال الكمية');return;}
let b=getBal();
if(v>b){alert('الرصيد غير كافي');return;}
alert('تم تأكيد طلب النقل');
};
w.querySelector('#tfr-dd').onclick=e=>{
if(e.target.id==='tfr-dd')w.querySelector('#tfr-dd').classList.remove('on');
};
refreshAvail();
}

function refreshAvail(){
let w=D.getElementById('tfr-wrap');if(!w)return;
state.avail=getBal();
w.querySelector('#tfr-av').textContent='متاح:'+(+state.avail).toFixed(6);
}

function openDd(k){
let w=D.getElementById('tfr-wrap');
let pn=w.querySelector('#tfr-dd-pn');
let list=k==='coin'?COINS:ACC;
let cur=state[k];
pn.innerHTML=list.map(x=>`<div class="tfr-dd-it ${x===cur?'act':''}" data-v="${x}">${x}</div>`).join('');
pn.querySelectorAll('.tfr-dd-it').forEach(it=>{
it.onclick=()=>{
state[k]=it.dataset.v;
w.querySelector('#tfr-'+k).textContent=it.dataset.v;
w.querySelector('#tfr-dd').classList.remove('on');
if(k==='from')refreshAvail();
};
});
w.querySelector('#tfr-dd').classList.add('on');
}

function open(){
let w=D.getElementById('tfr-wrap')||build();
refreshAvail();
w.classList.add('on');
D.body.style.overflow='hidden';
}
function close(){
let w=D.getElementById('tfr-wrap');if(!w)return;
w.classList.remove('on');
D.body.style.overflow='';
}

R.detailed={title:'نقل',html:'',init:(b,v)=>{v.classList.remove('on');open();},open:open,close:close};
W.__DFP=W.__DFP||{};
W.__DFP.detailed={ready:true,open:open,close:close};

})();
