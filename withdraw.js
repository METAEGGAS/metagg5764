(function () {
  window.__DFP = window.__DFP || {};
  if (window.__DFP["withdraw"] && window.__DFP["withdraw"].ready) return;

  const STYLE_ID = "df-withdraw-style";
  const ROOT_ID = "wdp";
  const ROOT_HTML = '<section id="wdp"><div class="p" id="app"><div class="h"><a class="bk" href="javascript:void(0)" id="wdBack">\u2039</a><div class="tt">\u0633\u062d\u0628</div><div class="rt"><img id="recBtn" src="https://tsdvxl.dunfinz.org/static/my/dark/record.png"/><img id="walBtn" src="https://tsdvxl.dunfinz.org/static/my/dark/wallet.png"/></div></div><label class="lb"><span></span><span class="r">\u0627\u062e\u062a\u0631 \u0627\u0644\u0639\u0645\u0644\u0629</span></label><div class="bx" id="coinBtn"><div class="rw"><div class="rv" id="coin">USDT</div><div class="ar"><span>\u0627\u062e\u062a\u0631 \u0639\u0645\u0644\u0629 \u0623\u062e\u0631\u0649</span><i class="tri"></i></div></div></div><label class="lb"><span></span><span class="r">\u0642\u0646\u0648\u0627\u062a \u0627\u0644\u062f\u0641\u0639</span></label><div class="bx"><div class="rv">ERC20</div></div><label class="lb"><span></span><span class="r">\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0633\u062d\u0628</span></label><div class="bx"><input class="txt" id="addr"/><img class="cp" id="copy" src="https://i.ibb.co/67wzrs3f/92.png"/></div><label class="lb"><span></span><span class="r">\u0643\u0645\u064a\u0629 \u0627\u0644\u0633\u062d\u0628</span></label><div class="bx"><input class="txt amt" id="amount" inputmode="decimal" value="5"/><div class="all" id="all">\u0627\u0644\u0643\u0644</div></div><div class="bal">*\u0631\u0635\u064a\u062f: 0 USDT</div><label class="lb"><span></span><span class="r">\u0639\u0645\u0648\u0644\u0629</span></label><div class="bx"><input class="txt" id="fee" readonly="" value="0.05"/></div><div class="fee"><div class="r2"><span id="s1">5 :\u0645\u0628\u0644\u063a \u0627\u0644\u062a\u0633\u0648\u064a\u0629 USDT</span><span></span></div><div class="r2"><span id="s2">0.05 :\u0631\u0633\u0648\u0645 \u0627\u0644\u0633\u062d\u0628</span><span></span></div><div class="r2 gold"><span id="s3">4.95 :$ \u0627\u0644\u0645\u0628\u0644\u063a \u0627\u0644\u0645\u0633\u062a\u0644\u0645</span><span></span></div><div class="r2"><span>1: %\u0631\u0633\u0645</span><span></span></div><div class="r2"><span><img class="inf" src="https://tsdvxl.dunfinz.org/static/my/dark/sigh.png"/> 5 :\u062d\u062f \u0627\u0644\u0633\u062d\u0628 \u0627\u0644\u0623\u062f\u0646\u0649</span><span></span></div><div class="r2"><span><img class="inf" src="https://tsdvxl.dunfinz.org/static/my/dark/sigh.png"/> 10000 :\u0623\u0642\u0635\u0649 \u0645\u0628\u0644\u063a \u0644\u0644\u0627\u0646\u0633\u062d\u0627\u0628</span><span></span></div></div></div><div class="ov" id="ov"></div><div class="sh" id="sh"><button data-v="USDT">USDT</button><button data-v="USDC">USDC</button></div><div class="rg" id="rg"><div class="rh"><a class="bk" href="javascript:void(0)" id="wdRecBack">\u2039</a><div class="tt">\u0633\u062c\u0644 \u0627\u0644\u0633\u062d\u0628</div></div><div class="tb" id="tb"><div class="a" data-i="0">\u0627\u0644\u0643\u0644</div><div data-i="1">\u0646\u0627\u062c\u062d</div><div data-i="2">\u0641\u0634\u0644</div></div><div class="em"><img id="wdEmpty" src="https://tsdvxl.dunfinz.org/static/theme/light/icon/empty.png"/><p>\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0628\u0639\u062f</p></div></div></section>';
  const STYLE_CSS = `#wdp{z-index:110;background:var(--bg);color:var(--t);font-family:Noto Sans Arabic,Tahoma,Arial,sans-serif;transition:all .35s cubic-bezier(.22,.8,.27,1);position:fixed;inset:0;overflow:auto;transform:translate(100%)}#wdp.op{transform:none}#wdp *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}#wdp .p{background:var(--bg);min-height:100vh;padding:8px 14px 18px}#wdp .h{justify-content:center;align-items:center;height:34px;margin-bottom:6px;display:flex;position:relative}#wdp .bk{color:var(--t);font-size:28px;line-height:1;text-decoration:none;position:absolute;top:0;left:0}#wdp .tt{font-size:18px}#wdp .rt{flex-direction:column;gap:4px;display:flex;position:absolute;top:0;right:0}#wdp .rt img{cursor:pointer;width:24px;height:24px;display:block}#wdp .lb{direction:rtl;justify-content:space-between;margin:14px 2px 8px;font-size:18px;display:flex}#wdp .lb .r{color:var(--t)}#wdp .bx{background:var(--c);border:1px solid var(--bd);border-radius:10px;align-items:center;height:54px;padding:0 12px;display:flex;position:relative;box-shadow:inset 0 0 0 1px #ffffff04}#wdp .rw{direction:ltr;justify-content:space-between;align-items:center;width:100%;display:flex}#wdp .rv{color:var(--t);font-size:16px}#wdp .ar{color:var(--y);direction:rtl;align-items:center;gap:6px;font-size:15px;display:flex}#wdp .tri{border-left:5px solid #0000;border-right:5px solid #0000;border-top:7px solid var(--y);width:0;height:0}#wdp .txt{width:100%;height:100%;color:var(--t);text-align:left;direction:ltr;background:0 0;border:0;outline:0;padding:0;font:500 16px Noto Sans Arabic,Tahoma,Arial,sans-serif}#wdp .txt::placeholder{color:var(--m)}#wdp .cp{cursor:pointer;width:24px;height:24px;position:absolute;top:50%;right:12px;transform:translateY(-50%)}#wdp .amt{padding-right:58px}#wdp .all{color:var(--y);cursor:pointer;font-size:16px;position:absolute;top:50%;right:12px;transform:translateY(-50%)}#wdp .bal{color:var(--y);text-align:left;direction:ltr;margin:6px 4px 0;font-size:14px}#wdp .fee{background:#0000000a;border-radius:10px;margin-top:14px;padding:12px}html.dk #wdp .fee{background:#0c0c0e}#wdp .r2{direction:ltr;justify-content:space-between;gap:8px;font-size:15px;line-height:1.9;display:flex}#wdp .r2 span{text-align:left;display:block}#wdp .gold{color:var(--y)}#wdp .inf{vertical-align:-2px;width:14px;height:14px}#wdp .ov{opacity:0;pointer-events:none;background:#0000008f;transition:all .2s;position:fixed;inset:0}#wdp .sh{background:var(--c);padding:6px 0 calc(8px + env(safe-area-inset-bottom));border-radius:18px 18px 0 0;transition:all .22s;position:fixed;bottom:0;left:0;right:0;transform:translateY(100%);box-shadow:0 -6px 20px #00000059}#wdp .sh button{background:var(--c);width:100%;color:var(--t);border:0;padding:14px 16px;font:500 18px Noto Sans Arabic,Tahoma,Arial,sans-serif}#wdp .sh button+button{border-top:1px solid var(--bd);color:var(--m)}#wdp.show .ov{opacity:1;pointer-events:auto}#wdp.show .sh{transform:translateY(0)}#wdp .rg{background:var(--bg);z-index:1;flex-direction:column;display:none;position:fixed;inset:0}#wdp .rg.on{display:flex}#wdp .rh{justify-content:center;align-items:center;height:50px;padding:0 14px;display:flex;position:relative}#wdp .rh .bk{font-size:30px}#wdp .rh .tt{font-size:17px}#wdp .tb{border-bottom:1px solid var(--bd);display:flex}#wdp .tb div{text-align:center;color:var(--m);cursor:pointer;flex:1;padding:14px 0;font-size:17px;position:relative}#wdp .tb div.a{color:var(--y)}#wdp .tb div.a:after{content:"";background:var(--y);border-radius:2px;width:46px;height:2px;position:absolute;bottom:0;left:50%;transform:translate(-50%)}#wdp .em{flex-direction:column;flex:1;justify-content:flex-start;align-items:center;padding-top:90px;display:flex}#wdp .em img{opacity:.85;width:90px;height:90px}#wdp .em p{color:var(--m);margin-top:10px;font-size:14px}`;
  let booted = false;

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = STYLE_CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  function ensureRoot() {
    if (document.getElementById(ROOT_ID)) return;
    (document.body || document.documentElement).insertAdjacentHTML("beforeend", ROOT_HTML);
  }

  function boot() {
    if (booted || !document.body) return;
    booted = true;
    ensureStyle();
    ensureRoot();
    !(function () {
    let w = document.getElementById("wdp"),
      $ = (s) => w.querySelector(s),
      $$ = (s) => [...w.querySelectorAll(s)],
      coin = $("#coin"),
      ov = $("#ov"),
      sh = $("#sh"),
      amount = $("#amount"),
      fee = $("#fee"),
      s1 = $("#s1"),
      s2 = $("#s2"),
      s3 = $("#s3"),
      addr = $("#addr"),
      copy = $("#copy"),
      all = $("#all"),
      recBtn = $("#recBtn"),
      rg = $("#rg"),
      tb = $("#tb"),
      coinBtn = $("#coinBtn"),
      wdBack = $("#wdBack"),
      wdRecBack = $("#wdRecBack"),
      walBtn = $("#walBtn"),
      wdEmpty = $("#wdEmpty"),
      fmt = (n) => ((n = +n || 0), (+n.toFixed(2)).toString()),
      calc = () => {
        let a = Math.max(0, +amount.value || 0),
          f = 0.01 * a,
          r = a - f;
        ((fee.value = f.toFixed(2)),
          (s1.textContent = fmt(a) + " :مبلغ التسوية " + coin.textContent),
          (s2.textContent = f.toFixed(2) + " :رسوم السحب"),
          (s3.textContent = fmt(r) + " :$ المبلغ المستلم"));
      },
      ui = () => {
        let t = document.documentElement.classList.contains("dk")
          ? "dark"
          : "light";
        ((recBtn.src = `https://tsdvxl.dunfinz.org/static/my/${t}/record.png`),
          (walBtn.src = `https://tsdvxl.dunfinz.org/static/my/${t}/wallet.png`),
          $$(".inf").forEach(
            (i) =>
              (i.src = `https://tsdvxl.dunfinz.org/static/my/${t}/sigh.png`),
          ),
          (wdEmpty.src = `https://tsdvxl.dunfinz.org/static/theme/${t}/icon/empty.png`));
      };
    ((coinBtn.onclick = () => w.classList.add("show")),
      (ov.onclick = () => w.classList.remove("show")),
      sh.querySelectorAll("button").forEach(
        (b) =>
          (b.onclick = () => {
            ((coin.textContent = b.dataset.v),
              calc(),
              w.classList.remove("show"));
          }),
      ),
      (amount.oninput = calc),
      (all.onclick = () => {
        ((amount.value = 0), calc());
      }),
      (copy.onclick = () =>
        navigator.clipboard && navigator.clipboard.writeText(addr.value || "")),
      (recBtn.onclick = () => rg.classList.add("on")),
      (wdBack.onclick = () => w.classList.remove("op")),
      (wdRecBack.onclick = () => rg.classList.remove("on")),
      tb.querySelectorAll("div").forEach(
        (d) =>
          (d.onclick = () => {
            (tb.querySelectorAll("div").forEach((x) => x.classList.remove("a")),
              d.classList.add("a"));
          }),
      ),
      (window.openWithdraw = () => w.classList.add("op")),
      new MutationObserver(ui).observe(document.documentElement, {
        attributes: 1,
        attributeFilter: ["class"],
      }),
      ui(),
      calc());
  })();
    window.__DFP["withdraw"] = {
      ready: true,
      open: function () {
        return window["openWithdraw"] && window["openWithdraw"]();
      },
    };
  }

  if (document.body) boot();
  if (!booted) {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  }
})();
