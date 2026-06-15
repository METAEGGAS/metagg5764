type="module">
import{initializeApp as iA}from"https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import{getAuth as gA,onAuthStateChanged as oAC}from"https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import{getFirestore as gF,doc as dC,onSnapshot as oS}from"https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
const fC={apiKey:"AIzaSyBvzfJOOjRFZnTgTUrwEZQPr8Ba7zKKlNg",authDomain:"hhhxh-5ebe4.firebaseapp.com",projectId:"hhhxh-5ebe4",storageBucket:"hhhxh-5ebe4.firebasestorage.app",messagingSenderId:"79243000696",appId:"1:79243000696:web:ee0fb2d2ccce791954e68d",measurementId:"G-08BR6LN6PT"};
const aP=iA(fC),aU=gA(aP),dB=gF(aP);window.__FB={app:aP,auth:aU,db:dB,onAuth:oAC,doc:dC,onSnap:oS};
</script>
<script>
(function(){var k='financial';
var T={ar:{title:'مالية',tb:'الرصيد الإجمالي',ti:'إجمالي الإيرادات',pt:'أرباح اليوم',py:'أرباح الأمس',tab1:'مشاريع الاستثمار',tab2:'سجلات الاستثمار',nd:'لا توجد بيانات بعد',close:'زيادة الهامش'},en:{title:'Financial',tb:'Total Balance',ti:'Total Revenue',pt:"Today's Profit",py:"Yesterday's Profit",tab1:'Investment Projects',tab2:'Investment Records',nd:'No data yet',close:'زيادة الهامش'}};
var C={init:function(b,v){
var L=localStorage.getItem('fin_lang')||'ar',M=localStorage.getItem('fin_mode')||'dark';
function aT(l){var t=T[l]||T.ar;v.querySelector('.tt').textContent=t.title;b.querySelectorAll('[data-i]').forEach(function(e){e.textContent=t[e.dataset.i]});}
function aM(m){v.setAttribute('data-m',m);}
aT(L);aM(M);
window.__finApply=function(l,m){if(l&&T[l]){L=l;localStorage.setItem('fin_lang',l);aT(l)}if(m){M=m;localStorage.setItem('fin_mode',m);aM(m)}};
if(window.__FB&&!window.__finSub){window.__finSub=1;var F=window.__FB;F.onAuth(F.auth,function(u){if(!u)return;F.onSnap(F.doc(F.db,'users',u.uid),function(s){var d=s.data()||{};if(d.lang)window.__finApply(d.lang,null);if(d.lon)window.__finApply(null,d.lon)})})}
b.querySelectorAll('.tab').forEach(function(t){t.onclick=function(){b.querySelectorAll('.tab').forEach(function(x){x.classList.remove('a')});t.classList.add('a')}})
}};
C.html='<div class=ft><div class=fc><div class=fl><div class=lb data-i=tb>الرصيد الإجمالي</div><div class=vl>0.000000</div><div class=lb2 data-i=pt>أرباح اليوم</div><div class=vr>0</div></div><div class=fdv></div><div class=fr><div class=lb data-i=ti>إجمالي الإيرادات</div><div class=vg>0.000000</div><div class=lb2 data-i=py>أرباح الأمس</div><div class=vg2>0</div></div></div><div class=ftb><div class="tab a" data-i=tab1>مشاريع الاستثمار</div><div class=tab data-i=tab2>سجلات الاستثمار</div></div><div class=fem><img class=emi src="https://tsdvxl.dunfinz.org/static/theme/dark/icon/empty.png" data-d="https://tsdvxl.dunfinz.org/static/theme/dark/icon/empty.png" data-l="https://tsdvxl.dunfinz.org/static/theme/light/icon/empty.png" alt=""><div class=emt data-i=nd>لا توجد بيانات بعد</div></div></div>';
window.__DFS=window.__DFS||{};window.__DFS[k]=C;window.__DFP=window.__DFP||{};if(window.__DFP[k]&&window.__DFP[k].ready)return;
var d=document,id='dfp-financial';
function g(){var v=d.getElementById(id);if(v)return v;var s=d.createElement('style');s.id=id+'-s';
s.textContent='#dfp-financial,#dfp-financial *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}#dfp-financial{position:fixed;inset:0;z-index:125;direction:rtl;transform:translateX(100%);transition:.35s cubic-bezier(.22,.8,.27,1);overflow:auto;background:#000;color:#fff}#dfp-financial[data-m=light]{background:#fff;color:#111}#dfp-financial[data-m=light] .hd{background:#fff;border-bottom:1px solid #ececec}#dfp-financial[data-m=light] .fdv{background:#ddd}#dfp-financial[data-m=light] .ftb{border-bottom:1px solid #e5e5e5}#dfp-financial[data-m=light] .emt{color:#888}#dfp-financial.op{transform:none}#dfp-financial .pg{min-height:100dvh}#dfp-financial .hd{height:54px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;background:#000;position:sticky;top:0;z-index:3;border-bottom:1px solid #1a1a1a}#dfp-financial .bk{font:300 28px/1 Arial;color:inherit;width:auto;padding:0 6px;cursor:pointer;text-decoration:none}#dfp-financial .tt{font:700 16px Arial;flex:1;text-align:center}#dfp-financial .sp{width:40px}#dfp-financial .bd{padding:0}#dfp-financial .ft{padding:18px 0 0}#dfp-financial .fc{display:flex;align-items:stretch;padding:6px 18px 14px;position:relative}#dfp-financial .fl,#dfp-financial .fr{flex:1;text-align:center;padding:4px 8px}#dfp-financial .fdv{width:1px;background:#2a2a2a;margin:6px 0}#dfp-financial .lb{color:#d4af37;font:600 14px Arial;margin-bottom:8px}#dfp-financial .lb2{color:#d4af37;font:600 14px Arial;margin:14px 0 6px}#dfp-financial .vl{color:#fff;font:500 19px Arial}#dfp-financial[data-m=light] .vl{color:#111}#dfp-financial .vr{color:#e74c3c;font:500 16px Arial}#dfp-financial .vg{color:#2ecc71;font:500 19px Arial}#dfp-financial .vg2{color:#2ecc71;font:500 16px Arial}#dfp-financial .ftb{display:flex;border-bottom:1px solid #1a1a1a}#dfp-financial .tab{flex:1;text-align:center;padding:14px 0;font:600 14px Arial;color:#888;cursor:pointer;position:relative}#dfp-financial .tab.a{color:#d4af37}#dfp-financial .tab.a:after{content:"";position:absolute;left:25%;right:25%;bottom:-1px;height:2px;background:#d4af37;border-radius:2px}#dfp-financial .fem{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 0 40px}#dfp-financial .emi{width:90px;height:90px;opacity:.85;object-fit:contain}#dfp-financial .emt{color:#666;font:400 13px Arial;margin-top:12px}';
d.head.appendChild(s);
(d.getElementById('cph')||d.getElementById('wdp-host')||d.body).insertAdjacentHTML('afterend','<section id="'+id+'" data-m="dark"><div class=pg><div class=hd><a class=bk href="javascript:void(0)" data-bk>‹</a><div class=tt></div><a class=bk href="javascript:void(0)" data-bk style="font-size:13px;font-weight:600">زيادة الهامش</a></div><div class=bd></div></div></section>');
v=d.getElementById(id);v.querySelectorAll('[data-bk]').forEach(function(e){e.onclick=z});return v}
function z(){var v=g();v.classList.remove('op');d.body.style.overflow=''}
function o(){var v=g(),b=v.querySelector('.bd');v.querySelector('.tt').textContent=C.title||k;b.innerHTML=C.html||'';C.init&&C.init(b,v);
var m=v.getAttribute('data-m')||'dark';b.querySelectorAll('.emi').forEach(function(i){i.src=m==='light'?i.dataset.l:i.dataset.d});
var oA=window.__finApply;window.__finApply=function(l,mm){oA&&oA(l,mm);var cm=v.getAttribute('data-m');b.querySelectorAll('.emi').forEach(function(i){i.src=cm==='light'?i.dataset.l:i.dataset.d})};
v.classList.add('op');d.body.style.overflow='hidden';return v}
window.openFinancial=o;window.__DFP[k]={ready:!0,open:o,close:z};
})();
