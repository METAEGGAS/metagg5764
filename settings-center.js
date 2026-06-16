!function(){
    var R = window.__DFS = window.__DFS || {};
    R.settingsCenter = {
        title: `إعدادات`,
        html: `
<style>
.dfs-settings-wrap * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Tahoma,Arial,sans-serif; }
.dfs-settings-wrap { background:#fdfdfd; min-height:100vh; direction:rtl; color:#2c2c2c; }
.dfs-header { display:flex; align-items:center; justify-content:center; position:relative; height:56px; padding:0 16px; background:#fff; border-bottom:1px solid #f0f0f0; }
.dfs-back { position:absolute; left:16px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; padding:8px; font-size:20px; color:#333; font-weight:300; }
.dfs-title { font-size:17px; font-weight:500; color:#2c2c2c; }
.dfs-list { background:#fff; margin-top:8px; }
.dfs-row { display:flex; align-items:center; justify-content:space-between; padding:20px; background:#fff; border-bottom:1px solid #f5f5f5; cursor:pointer; }
.dfs-row:active { background:#fafafa; }
.dfs-row:last-child { border-bottom:none; }
.dfs-label { font-size:15px; color:#2c2c2c; font-weight:400; }
.dfs-right { display:flex; align-items:center; gap:10px; flex:1; justify-content:flex-end; }
.dfs-value { font-size:14px; color:#555; direction:ltr; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.dfs-arrow { color:#bbb; font-size:16px; font-weight:300; transform:scaleX(-1); }
.dfs-version .dfs-arrow { display:none; }
.dfs-version { cursor:default; }
.dfs-injected { padding:0 16px; }
.df-hero { background:linear-gradient(135deg,#fff5f5 0%,#fef0f0 100%); border-radius:12px; padding:16px; margin:12px 0; border:1px solid #fde8e8; }
.df-hero b { display:block; font-size:15px; color:#2c2c2c; margin-bottom:6px; }
.df-muted { font-size:12px; color:#888; }
.df-card { background:#fff; border-radius:12px; padding:14px; margin-bottom:12px; box-shadow:0 1px 3px rgba(0,0,0,0.04); border:1px solid #f0f0f0; }
.df-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.df-pill { display:inline-block; background:#fef0f0; color:#d4736a; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:500; }
.df-list { display:flex; flex-direction:column; gap:10px; }
.df-row { display:flex; align-items:center; justify-content:space-between; padding:10px; background:#fafafa; border-radius:8px; }
.df-row > div:first-child { display:flex; flex-direction:column; gap:2px; }
.df-row b { font-size:14px; color:#2c2c2c; }
.df-row span { font-size:12px; color:#888; }
.df-btn { padding:6px 14px; border:none; border-radius:6px; background:#d4736a; color:#fff; font-size:12px; cursor:pointer; font-family:inherit; }
.df-btn.alt { background:#f5f5f5; color:#555; border:1px solid #e8e8e8; }
.df-btn:active { opacity:0.7; }
</style>

<div class="dfs-settings-wrap">
    <div class="dfs-header">
        <button class="dfs-back" onclick="history.back()">&#10094;</button>
        <div class="dfs-title">إعدادات</div>
    </div>

    <div class="dfs-list">
        <div class="dfs-row">
            <div class="dfs-label">البريد الإلكتروني</div>
            <div class="dfs-right">
                <div class="dfs-value">053183522455756cc@gmail.com</div>
                <span class="dfs-arrow">&#10095;</span>
            </div>
        </div>
        <div class="dfs-row">
            <div class="dfs-label">اسم مستعار</div>
            <div class="dfs-right">
                <div class="dfs-value">05313669921</div>
                <span class="dfs-arrow">&#10095;</span>
            </div>
        </div>
        <div class="dfs-row">
            <div class="dfs-label">اسم المستخدم كلمة المرور</div>
            <div class="dfs-right"><span class="dfs-arrow">&#10095;</span></div>
        </div>
        <div class="dfs-row">
            <div class="dfs-label">كلمة مرور الدفع</div>
            <div class="dfs-right"><span class="dfs-arrow">&#10095;</span></div>
        </div>
        <div class="dfs-row">
            <div class="dfs-label">اتصل بنا</div>
            <div class="dfs-right"><span class="dfs-arrow">&#10095;</span></div>
        </div>
        <div class="dfs-row dfs-version">
            <div class="dfs-label">نسخة</div>
            <div class="dfs-right"><div class="dfs-value">V1.1.1</div></div>
        </div>
    </div>

    <div class="dfs-injected">
        <section class="df-hero">
            <b>إعدادات الحساب</b>
            <div class="df-muted">تجربة حقن لقسم الإعدادات مع أزرار وهمية للفحص فقط.</div>
        </section>
        <section class="df-card">
            <div class="df-grid">
                <div>
                    <span class="df-pill">اختبار تحميل</span>
                    <div style="margin-top:8px;font-weight:700">نجح استدعاء الملف</div>
                </div>
                <div>
                    <span class="df-pill">اسم الملف</span>
                    <div style="margin-top:8px;font-weight:700">settings-center.js</div>
                </div>
            </div>
        </section>
        <section class="df-card">
            <div style="font:700 17px Tahoma,Arial;margin-bottom:10px">اعدادات</div>
            <div class="df-list">
                <div class="df-row">
                    <div><b>الإشعارات</b><span>مفعلة</span></div>
                    <button class="df-btn alt" type="button" data-ping>فحص</button>
                </div>
                <div class="df-row">
                    <div><b>الخصوصية</b><span>افتراضي</span></div>
                    <button class="df-btn alt" type="button" data-ping>فحص</button>
                </div>
                <div class="df-row">
                    <div><b>الأمان</b><span>جيد</span></div>
                    <button class="df-btn alt" type="button" data-ping>فحص</button>
                </div>
            </div>
        </section>
    </div>
</div>
`,
        init: function(root){
            root.querySelectorAll('[data-ping]').forEach(function(b){
                b.onclick = function(){
                    b.textContent = 'تم';
                    setTimeout(function(){ b.textContent = 'فحص'; }, 900);
                };
            });
        }
    };
}();
