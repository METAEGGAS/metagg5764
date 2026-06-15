(function(){
  var k='lockMining';

  var I18N={
    en:{
      title:'Lock Mining',
      translate:'العربية',
      hero:'Mining & Profit',
      intro:'USDT lock mining generates mining income in the platform mining pool through hosted lock-up mining. The principal is pegged to USDT (1 USD = 1 USDT, approximately 1 US dollar).',
      advantages:'Product Advantages',
      lockPeriod:'Lock Period Distribution',
      random:'Random',
      settlement:'Daily Settlement',
      daily:'Every day',
      sameDay:'Withdrawal on the same day after successful closing',
      uninterrupted:'Non-stop holiday income',
      secure:'100% fund security guarantee',
      compensation:'About Compensation',
      compText:'If you choose to unlock the principal before maturity, liquidated damages will apply. Liquidated damages = default settlement rate × remaining days × lock amount. Example: if the default settlement rate is 5%, the remaining period is 3 days, and the lock amount is 10000 USDT, then the liquidated damages = 10000 × 3 × 5% = 1500 USDT, and the final actual principal received is 8500 USDT.',
      profit:'Profit Calculation',
      profitText:'The platform provides a variety of lock mining wealth products for you to choose from and calculates income as follows.',
      amount:'Lock Amount',
      cycle:'Cycle',
      dailyRate:'Daily Rate',
      expected:'Expected Profit',
      note:'The expected profit is for reference only. Actual income is subject to the platform settlement result.'
    },
    ar:{
      title:'تعدين القفل',
      translate:'English',
      hero:'التعدين والربح',
      intro:'تعدين القفل USDT هو توليد دخل تعدين في مجمع تعدين المنصة من خلال استضافة التعدين المقفل. يتم ربط أصل المبلغ بعملة USDT ‏(1 USD = 1 USDT، أي ما يقارب 1 دولار أمريكي).',
      advantages:'مزايا المنتج',
      lockPeriod:'فترة الحظر توزيع',
      random:'عشوائي',
      settlement:'التسوية اليومية',
      daily:'يوميًا',
      sameDay:'الإخراج في نفس اليوم بعد الإغلاق الناجح',
      uninterrupted:'دخل عطلة غير منقطع',
      secure:'ضمان أمان الأموال بنسبة 100%',
      compensation:'حول التعويض',
      compText:'إذا كنت ترغب في فك نقل المبلغ الرئيسي قبل الانتهاء، فستتحمل أضرارًا سائلة. الأضرار السائلة = نسبة التسوية الافتراضية × الأيام المتبقية × مبلغ القفل. مثال: إذا كانت نسبة التسوية الافتراضية 5%، وكانت المدة المتبقية 3 أيام، وكان مبلغ القفل 10000 USDT، فإن الأضرار السائلة = 10000 × 3 × 5% = 1500 USDT، والمبلغ الفعلي المسترد هو 8500 USDT.',
      profit:'حساب الأرباح',
      profitText:'تقدم المنصة مجموعة متنوعة من منتجات إدارة ثروة التعدين ذات القفل للاختيار من بينها، ويتم حساب الدخل كما يلي.',
      amount:'مبلغ القفل',
      cycle:'مدة الدورة',
      dailyRate:'العائد اليومي',
      expected:'الربح المتوقع',
      note:'الربح المتوقع للمرجعية فقط، والدخل الفعلي يخضع لنتيجة تسوية المنصة.'
    }
  };

  var C={
    title:I18N.en.title,
    html:'',
    init:function(root,page){
      var state={lang:'en'};
      var translateBtn=root.querySelector('[data-lang-toggle]');
      var amountInput=root.querySelector('[data-amount]');
      var cycleInput=root.querySelector('[data-cycle]');
      var rateInput=root.querySelector('[data-rate]');
      var profitValue=root.querySelector('[data-profit-value]');

      function fmt(n,lang){
        try{
          return new Intl.NumberFormat(lang==='ar'?'ar-EG':'en-US',{maximumFractionDigits:2}).format(n);
        }catch(e){
          return String(n);
        }
      }

      function calc(){
        var amount=parseFloat(amountInput.value||0);
        var cycle=parseFloat(cycleInput.value||0);
        var rate=parseFloat(rateInput.value||0);
        var profit=amount*cycle*(rate/100);
        profitValue.textContent=fmt(profit,state.lang)+' USDT';
      }

      function apply(lang){
        state.lang=lang;
        var t=I18N[lang];
        page.dir=lang==='ar'?'rtl':'ltr';
        page.classList.toggle('ar',lang==='ar');
        page.classList.toggle('en',lang==='en');

        page.querySelector('.tt').textContent=t.title;
        translateBtn.textContent=t.translate;
        root.querySelector('[data-i18n="hero"]').textContent=t.hero;
        root.querySelector('[data-i18n="intro"]').textContent=t.intro;
        root.querySelector('[data-i18n="advantages"]').textContent=t.advantages;
        root.querySelector('[data-i18n="lockPeriod"]').textContent=t.lockPeriod;
        root.querySelector('[data-i18n="random"]').textContent=t.random;
        root.querySelector('[data-i18n="settlement"]').textContent=t.settlement;
        root.querySelector('[data-i18n="daily"]').textContent=t.daily;
        root.querySelector('[data-i18n="sameDay"]').textContent=t.sameDay;
        root.querySelector('[data-i18n="uninterrupted"]').textContent=t.uninterrupted;
        root.querySelector('[data-i18n="secure"]').textContent=t.secure;
        root.querySelector('[data-i18n="compensation"]').textContent=t.compensation;
        root.querySelector('[data-i18n="compText"]').textContent=t.compText;
        root.querySelector('[data-i18n="profit"]').textContent=t.profit;
        root.querySelector('[data-i18n="profitText"]').textContent=t.profitText;
        root.querySelector('[data-i18n="amount"]').textContent=t.amount;
        root.querySelector('[data-i18n="cycle"]').textContent=t.cycle;
        root.querySelector('[data-i18n="dailyRate"]').textContent=t.dailyRate;
        root.querySelector('[data-i18n="expected"]').textContent=t.expected;
        root.querySelector('[data-i18n="note"]').textContent=t.note;
        calc();
      }

      amountInput.addEventListener('input',calc);
      cycleInput.addEventListener('input',calc);
      rateInput.addEventListener('input',calc);
      translateBtn.addEventListener('click',function(){
        apply(state.lang==='en'?'ar':'en');
      });

      apply('en');
      calc();
    }
  };

  C.html=''
  +'<div class="lm-wrap">'
  +  '<section class="lm-hero">'
  +    '<div class="lm-ribbon"><span class="lm-ribbon-line"></span><span class="lm-ribbon-text" data-i18n="hero">Mining & Profit</span><span class="lm-ribbon-line"></span></div>'
  +    '<p class="lm-intro" data-i18n="intro">USDT lock mining generates mining income in the platform mining pool through hosted lock-up mining. The principal is pegged to USDT (1 USD = 1 USDT, approximately 1 US dollar).</p>'
  +  '</section>'
  +  '<section class="lm-card">'
  +    '<h3 class="lm-card-title" data-i18n="advantages">Product Advantages</h3>'
  +    '<div class="lm-top-grid">'
  +      '<div class="lm-top-item"><div class="lm-top-label" data-i18n="settlement">Daily Settlement</div><div class="lm-top-value" data-i18n="daily">Every day</div></div>'
  +      '<div class="lm-top-item"><div class="lm-top-label" data-i18n="lockPeriod">Lock Period Distribution</div><div class="lm-top-value" data-i18n="random">Random</div></div>'
  +    '</div>'
  +    '<div class="lm-icons-row">'
  +      '<div class="lm-adv-item">'
  +        '<div class="lm-icon">'
  +          '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 8l18 7v13c0 13-7.9 22-18 28-10.1-6-18-15-18-28V15l18-7z" fill="none" stroke="currentColor" stroke-width="3.2"/><path d="M24 32l5.2 5.2L40.5 26" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  +        '</div>'
  +        '<div class="lm-adv-text" data-i18n="secure">100% fund security guarantee</div>'
  +      '</div>'
  +      '<div class="lm-adv-item">'
  +        '<div class="lm-icon">'
  +          '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M19 24c0-8.2 5.8-14 13-14s13 5.8 13 14v3.4c4.8 2.7 8 7.9 8 13.8C53 50.4 43.4 56 32 56S11 50.4 11 41.2c0-5.9 3.2-11.1 8-13.8V24z" fill="none" stroke="currentColor" stroke-width="3.2"/><path d="M35.9 24.6c-.9-1.1-2.3-1.9-4.1-1.9-3.4 0-5.8 2.1-5.8 5 0 2.8 1.9 4.1 5.7 5 3 0.7 3.9 1.4 3.9 2.9 0 1.7-1.5 2.9-3.8 2.9-2 0-3.7-.8-5-2.2" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M32 18v24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>'
  +        '</div>'
  +        '<div class="lm-adv-text" data-i18n="uninterrupted">Non-stop holiday income</div>'
  +      '</div>'
  +      '<div class="lm-adv-item">'
  +        '<div class="lm-icon">'
  +          '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="18" y="10" width="28" height="44" rx="4" fill="none" stroke="currentColor" stroke-width="3.2"/><path d="M25 21h14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M35.6 31.2c-.8-1-2-1.7-3.6-1.7-2.9 0-5 1.8-5 4.4 0 2.5 1.7 3.6 4.9 4.3 2.6.6 3.4 1.2 3.4 2.5 0 1.5-1.3 2.5-3.3 2.5-1.8 0-3.2-.6-4.4-1.9" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><path d="M32 26v20" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>'
  +        '</div>'
  +        '<div class="lm-adv-text" data-i18n="sameDay">Withdrawal on the same day after successful closing</div>'
  +      '</div>'
  +    '</div>'
  +  '</section>'
  +  '<section class="lm-card">'
  +    '<h3 class="lm-card-title" data-i18n="compensation">About Compensation</h3>'
  +    '<p class="lm-copy" data-i18n="compText">If you choose to unlock the principal before maturity, liquidated damages will apply. Liquidated damages = default settlement rate × remaining days × lock amount. Example: if the default settlement rate is 5%, the remaining period is 3 days, and the lock amount is 10000 USDT, then the liquidated damages = 10000 × 3 × 5% = 1500 USDT, and the final actual principal received is 8500 USDT.</p>'
  +  '</section>'
  +  '<section class="lm-card lm-profit">'
  +    '<h3 class="lm-card-title" data-i18n="profit">Profit Calculation</h3>'
  +    '<p class="lm-copy" data-i18n="profitText">The platform provides a variety of lock mining wealth products for you to choose from and calculates income as follows.</p>'
  +    '<div class="lm-form">'
  +      '<label class="lm-field"><span data-i18n="amount">Lock Amount</span><input data-amount type="number" value="10000" /></label>'
  +      '<label class="lm-field"><span data-i18n="cycle">Cycle</span><input data-cycle type="number" value="3" /></label>'
  +      '<label class="lm-field"><span data-i18n="dailyRate">Daily Rate</span><input data-rate type="number" step="0.1" value="5" /></label>'
  +    '</div>'
  +    '<div class="lm-result">'
  +      '<div class="lm-result-label" data-i18n="expected">Expected Profit</div>'
  +      '<div class="lm-result-value" data-profit-value>1500 USDT</div>'
  +    '</div>'
  +    '<div class="lm-note" data-i18n="note">The expected profit is for reference only. Actual income is subject to the platform settlement result.</div>'
  +    '<div class="lm-coin-visual" aria-hidden="true"><div class="lm-coin"></div></div>'
  +  '</section>'
  +'</div>';

  window.__DFS=window.__DFS||{};
  window.__DFS[k]=C;
  window.__DFP=window.__DFP||{};
  if(window.__DFP[k]&&window.__DFP[k].ready)return;

  var d=document,id='dfp-lock-mining';

  function ensure(){
    var v=d.getElementById(id);
    if(v)return v;

    var s=d.createElement('style');
    s.id=id+'-s';
    s.textContent=''
    +'#'+id+',#'+id+' *{box-sizing:border-box;-webkit-tap-highlight-color:transparent} '
    +'#'+id+'{position:fixed;inset:0;z-index:125;background:#f6f7fb;color:#111;transform:translateX(100%);transition:.35s cubic-bezier(.22,.8,.27,1);overflow:auto;font-family:"Noto Sans Arabic",Tahoma,Arial,sans-serif} '
    +'#'+id+'.op{transform:none} '
    +'#'+id+' .pg{min-height:100dvh;background:linear-gradient(180deg,#fcfcfd 0%,#f6f7fb 100%)} '
    +'#'+id+' .hd{height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;background:#ffffff;position:sticky;top:0;z-index:5;border-bottom:1px solid #eceef3} '
    +'#'+id+' .bk,#'+id+' .tr{min-width:42px;height:34px;border:0;background:transparent;color:#111;cursor:pointer;border-radius:10px;font-size:14px} '
    +'#'+id+' .bk{font-size:31px;line-height:1;font-weight:300} '
    +'#'+id+' .tt{font-size:18px;font-weight:700;color:#111;text-align:center;flex:1} '
    +'#'+id+' .left,#'+id+' .right{width:72px;display:flex;align-items:center} '
    +'#'+id+' .right{justify-content:flex-end} '
    +'#'+id+' .bd{padding:12px 14px 34px;max-width:780px;margin:0 auto} '
    +'#'+id+' .lm-wrap{display:flex;flex-direction:column;gap:14px} '
    +'#'+id+' .lm-hero{padding:2px 2px 0} '
    +'#'+id+' .lm-ribbon{display:flex;align-items:center;justify-content:center;gap:10px;margin:6px auto 12px} '
    +'#'+id+' .lm-ribbon-line{width:28px;height:4px;background:#0f0f10;position:relative;border-radius:2px} '
    +'#'+id+' .lm-ribbon-line:before,#'+id+' .lm-ribbon-line:after{content:"";position:absolute;top:0;width:10px;height:4px;background:#0f0f10;border-radius:2px} '
    +'#'+id+' .lm-ribbon-line:before{left:-8px} '
    +'#'+id+' .lm-ribbon-line:after{right:-8px} '
    +'#'+id+' .lm-ribbon-text{display:inline-flex;align-items:center;justify-content:center;background:#0d0d0e;color:#fff;padding:9px 20px;border-radius:2px;font-size:15px;font-weight:700;letter-spacing:.2px;min-height:38px} '
    +'#'+id+' .lm-intro{margin:0;color:#2d2f35;font-size:13px;line-height:1.8;text-align:start} '
    +'#'+id+' .lm-card{position:relative;background:#fff;border:1px solid #cfd2da;border-radius:10px;padding:16px 14px 18px;box-shadow:3px 4px 0 rgba(0,0,0,.18)} '
    +'#'+id+' .lm-card-title{margin:0 0 14px;text-align:center;font-size:17px;line-height:1.4;font-weight:800;color:#131417} '
    +'#'+id+' .lm-top-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px} '
    +'#'+id+' .lm-top-item{text-align:center;color:#7d818b;font-size:13px;line-height:1.6;min-height:54px} '
    +'#'+id+' .lm-top-value{display:block;margin-top:4px;color:#8b8f98} '
    +'#'+id+' .lm-icons-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;align-items:start} '
    +'#'+id+' .lm-adv-item{text-align:center} '
    +'#'+id+' .lm-icon{width:72px;height:72px;border-radius:50%;background:#fafbff;border:1px solid #eef1f8;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#3b6fe2;box-shadow:inset 0 0 0 8px #fbfcff} '
    +'#'+id+' .lm-icon svg{width:36px;height:36px;display:block} '
    +'#'+id+' .lm-adv-text{color:#777c85;font-size:12px;line-height:1.65;max-width:132px;margin:0 auto} '
    +'#'+id+' .lm-copy{margin:0;color:#555a63;font-size:13px;line-height:1.9;text-align:start} '
    +'#'+id+' .lm-profit{overflow:hidden;padding-bottom:84px} '
    +'#'+id+' .lm-form{display:grid;grid-template-columns:1fr;gap:10px;margin-top:12px} '
    +'#'+id+' .lm-field{display:flex;flex-direction:column;gap:6px;color:#5a5f69;font-size:13px;font-weight:600} '
    +'#'+id+' .lm-field input{width:100%;height:42px;border:1px solid #dde1ea;border-radius:10px;padding:0 12px;font-size:14px;color:#111;background:#fff;outline:none} '
    +'#'+id+' .lm-field input:focus{border-color:#7fa1ff;box-shadow:0 0 0 3px rgba(72,114,255,.12)} '
    +'#'+id+' .lm-result{margin-top:14px;border:1px solid #e4e7ef;border-radius:12px;background:#fafbff;padding:14px 12px;text-align:center} '
    +'#'+id+' .lm-result-label{font-size:13px;color:#6c7280;margin-bottom:6px} '
    +'#'+id+' .lm-result-value{font-size:24px;font-weight:800;color:#205ee3;letter-spacing:.2px} '
    +'#'+id+' .lm-note{margin-top:10px;font-size:12px;line-height:1.7;color:#808693;text-align:start} '
    +'#'+id+' .lm-coin-visual{position:absolute;left:50%;bottom:-70px;transform:translateX(-50%);width:260px;height:140px;pointer-events:none;opacity:.9} '
    +'#'+id+' .lm-coin{width:180px;height:180px;border-radius:50%;margin:0 auto;background:radial-gradient(circle at 35% 30%,#d9f0ff 0%,#78b9ff 32%,#3f93ff 52%,#2d74e9 72%,#0d57da 100%);box-shadow:inset 0 0 0 16px rgba(255,255,255,.35), inset 0 0 0 34px rgba(255,255,255,.16), 0 -10px 30px rgba(38,110,233,.2)} '
    +'#'+id+' .en{direction:ltr} '
    +'#'+id+' .ar{direction:rtl} '
    +'#'+id+' .en .bk{transform:scaleX(-1)} '
    +'#'+id+' .en .lm-intro,#'+id+' .en .lm-copy,#'+id+' .en .lm-note{text-align:left} '
    +'#'+id+' .ar .lm-intro,#'+id+' .ar .lm-copy,#'+id+' .ar .lm-note{text-align:right} '
    +'@media (min-width:640px){#'+id+' .bd{padding:18px 20px 42px} #'+id+' .lm-card{padding:18px 18px 22px} #'+id+' .lm-form{grid-template-columns:repeat(3,1fr)}}';

    d.head.appendChild(s);

    var host=d.getElementById('cph')||d.getElementById('wdp-host')||d.body;
    host.insertAdjacentHTML('beforeend',
      '<section id="'+id+'">'
      +  '<div class="pg en" dir="ltr">'
      +    '<div class="hd">'
      +      '<div class="left"><button class="bk" type="button" data-bk>‹</button></div>'
      +      '<div class="tt">Lock Mining</div>'
      +      '<div class="right"><button class="tr" type="button" data-lang-toggle>العربية</button></div>'
      +    '</div>'
      +    '<div class="bd"></div>'
      +  '</div>'
      +'</section>'
    );

    v=d.getElementById(id);
    v.querySelector('[data-bk]').onclick=close;
    return v;
  }

  function close(){
    var v=ensure();
    v.classList.remove('op');
    d.body.style.overflow='';
  }

  function open(){
    var v=ensure();
    var page=v.querySelector('.pg');
    var b=v.querySelector('.bd');
    v.querySelector('.tt').textContent=C.title||k;
    b.innerHTML=C.html||'';
    C.init&&C.init(b,page);
    v.classList.add('op');
    d.body.style.overflow='hidden';
    return v;
  }

  window.openLockMining=open;
  window.__DFP[k]={ready:true,open:open,close:close};
})();
