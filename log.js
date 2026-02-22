
// ====================================
// 📄 ملف JavaScript للملف الشخصي
// ====================================

(function() {
    'use strict';

    // التحقق من وجود الأيقونة/اللوجو في الصفحة
    const logoElement = document.querySelector('img[src*="10167706.png"]');
    
    if (!logoElement) {
        console.warn('لم يتم العثور على الأيقونة في الصفحة');
        return;
    }

    // إضافة مؤشر اليد للأيقونة
    logoElement.style.cursor = 'pointer';
    logoElement.style.transition = 'transform 0.2s';
    
    // تأثير hover
    logoElement.addEventListener('mouseenter', () => {
        logoElement.style.transform = 'scale(1.1)';
    });
    
    logoElement.addEventListener('mouseleave', () => {
        logoElement.style.transform = 'scale(1)';
    });

    // عند الضغط على الأيقونة
    logoElement.addEventListener('click', function() {
        initProfilePage();
    });

    // ====================================
    // دالة تفعيل صفحة الملف الشخصي
    // ====================================
    function initProfilePage() {
        
        // إخفاء المحتوى الأصلي
        const originalContent = document.body.innerHTML;
        
        // HTML الكامل للصفحة
        const profileHTML = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#000000">
    <title>الملف الشخصي</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        html,body{height:100%}
        body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#000;color:#fff;direction:rtl;overflow-x:hidden}
        a{color:inherit}
        .app{width:100%;min-height:100vh;background:#000}
        .topbar{background:#000;border-bottom:1px solid #1a1a1a;padding:10px 12px 6px;position:sticky;top:0;z-index:50}
        .toprow{display:flex;align-items:center;justify-content:space-between;gap:10px}
        .iconbtn{width:40px;height:40px;border-radius:12px;background:transparent;border:0;color:#cbd5e1;font-size:22px;display:flex;align-items:center;justify-content:center;cursor:pointer}
        .rightpack{display:flex;align-items:center;gap:8px}
        .wallet{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#22c55e,#16a34a);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(34,197,94,.3);cursor:pointer;transition:.2s}
        .wallet:hover{transform:scale(1.05)}
        .wallet img{width:24px;height:24px;filter:brightness(0)invert(1)}
        .balpill{display:flex;align-items:center;gap:4px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:9px 8px 9px 10px}
        .balpill b{font-size:14px}
        .usd{width:22px;height:22px}
        .tabs{display:flex;gap:0;align-items:center;justify-content:space-around;margin-top:10px;padding:0 2px 6px}
        .tab{color:#a3b0c2;font-size:15px;white-space:nowrap;cursor:pointer;position:relative;padding:10px 8px;flex:1;text-align:center}
        .tab.active{color:#fff}
        .tab.active:after{content:"";position:absolute;left:0;right:0;bottom:-2px;height:3px;border-radius:3px;background:#2d5bff}
        .container{padding:14px 12px 22px}
        .card{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:14px;padding:14px;margin-bottom:14px;box-shadow:0 8px 20px rgba(0,0,0,.25)}
        .row{display:flex;align-items:center;justify-content:space-between;gap:10px}
        .muted{color:#94a3b8;font-size:12px}
        .btn{background:#1a1a1a;border:1px solid #2a2a2a;color:#e5e7eb;border-radius:10px;padding:10px 14px;font-size:13px;cursor:pointer}
        .btn.blue{background:#2b5bff;border-color:#2b5bff}
        .btn.green{background:#22c55e;border-color:#22c55e;color:#000;font-weight:700}
        .btn.red{background:#ef4444;border-color:#ef4444;color:#fff;font-weight:700}
        .btn.yellow{background:#f59e0b;border-color:#f59e0b;color:#000;font-weight:800}
        .btn:active{transform:scale(.99)}
        .field{margin-top:12px}
        .field label{display:block;color:#94a3b8;font-size:12px;margin:0 0 8px}
        .field input,.field select{width:100%;background:#000;border:1px solid #2a2a2a;color:#dbe3ee;border-radius:10px;padding:12px;outline:none}
        .profile-pic{display:flex;align-items:center;justify-content:space-between;gap:12px}
        .avatarbox{display:flex;align-items:center;gap:12px}
        .avatar{width:48px;height:48px;border-radius:12px;background:#1a1a1a;border:1px solid #2a2a2a;display:flex;align-items:center;justify-content:center;color:#6b7c93;font-size:22px;overflow:hidden}
        .avatar img{width:100%;height:100%;object-fit:cover;display:block}
        .readonly{opacity:.95}
        .vgrid{display:grid;grid-template-columns:1fr;gap:10px}
        .vitem{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px;border-radius:12px;background:#0a0a0a;border:1px solid #1a1a1a}
        .vitem h4{font-size:13px;font-weight:600}
        .vitem small{display:block;font-size:11px;margin-top:3px}
        .check{color:#22c55e;font-weight:900}
        .note{text-align:center;color:#94a3b8;font-size:12px;line-height:1.8;margin:10px 0}
        .chk{display:flex;align-items:center;gap:10px;margin:14px 0 6px;color:#6ea8ff}
        .chk input{width:16px;height:16px}
        .warn{display:flex;gap:10px;align-items:flex-start;margin-top:14px}
        .warn i{width:18px;height:18px;border-radius:50%;border:1px solid #f59e0b;color:#f59e0b;display:inline-flex;align-items:center;justify-content:center;font-style:normal;font-size:12px;flex:0 0 18px;margin-top:2px}
        .links{margin-top:10px;display:flex;flex-direction:column;gap:10px;align-items:center}
        .links a{color:#6ea8ff;text-decoration:none;font-size:13px}
        .links a:before{content:"↗ ";opacity:.9}
        .modal{position:fixed;inset:0;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.55);z-index:9999}
        .sheet{width:100%;max-width:720px;background:#000;border:1px solid #2a2a2a;border-radius:16px 16px 0 0;padding:14px 14px 18px;box-shadow:0 -10px 30px rgba(0,0,0,.35)}
        .mh{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
        .x{width:34px;height:34px;border-radius:10px;background:#0a0a0a;border:1px solid #2a2a2a;color:#d1d5db;display:flex;align-items:center;justify-content:center;cursor:pointer}
        .pm{display:flex;flex-direction:column;gap:10px}
        .opt{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border-radius:12px;background:#0a0a0a;border:1px solid #2a2a2a;cursor:pointer;transition:.2s}
        .opt:hover{border-color:#2d5bff}
        .lx{display:flex;align-items:center;gap:10px;min-width:0}
        .ico{display:flex;align-items:center;gap:6px;flex:0 0 auto}
        .ico img{width:22px;height:22px;display:block}
        .txt{display:flex;flex-direction:column;gap:2px;min-width:0}
        .txt span{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .txt small{font-size:11px;color:#94a3b8}
        .ck{color:#60a5fa;font-size:14px;opacity:0}
        .opt.active .ck{opacity:1}
        .lv-head{display:flex;align-items:flex-start;justify-content:space-between;margin:8px 0 12px}
        .lv-head h2{font-size:20px;font-weight:800}
        .lv-right{display:flex;flex-direction:column;gap:6px;align-items:flex-end}
        .pill{background:#0a0a0a;border:1px solid #2a2a2a;color:#fff;border-radius:10px;padding:6px 10px;font-size:12px}
        .lv-stats{display:flex;justify-content:space-between;gap:10px;margin:10px 0 14px;color:#94a3b8}
        .stat{flex:1;display:flex;flex-direction:column;gap:4px;align-items:flex-end}
        .stat b{color:#fff;font-size:14px}
        .how{color:#6ea8ff;text-decoration:none;font-size:13px}
        .how:before{content:"↗ ";opacity:.9}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .lcard{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:16px;padding:18px;min-height:140px;position:relative}
        .lcard h3{font-size:22px;font-weight:900}
        .lmeta{position:absolute;left:16px;top:16px;color:#94a3b8;font-size:12px}
        .lmid{margin-top:28px;color:#cbd5e1;font-size:13px;line-height:1.9}
        .lbtn{margin-top:12px;width:100%;background:#2747d8;border:0;color:#fff;padding:12px 14px;border-radius:12px;font-size:14px;cursor:pointer}
        .smallcard{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:16px;padding:18px;min-height:150px;display:flex;flex-direction:column;justify-content:space-between}
        .smallcard h4{font-size:22px;font-weight:900;text-align:center}
        .smrow{display:flex;justify-content:space-between;align-items:center;color:#cbd5e1}
        .smrow b{font-size:18px;color:#fff}
        .smrow span{font-size:12px;color:#94a3b8}
        .smrow2{display:flex;justify-content:space-between;align-items:center;margin-top:10px}
        .smrow2 b{color:#fff}
        .smrow2 span{color:#94a3b8;font-size:12px}
        .glow{border:2px solid rgba(255,255,255,.75);box-shadow:0 0 0 1px rgba(255,255,255,.18),0 0 30px rgba(255,255,255,.12)}
        .pwmodal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.7);z-index:9999;padding:20px}
        .pwbox{width:100%;max-width:500px;background:#000;border:1px solid #2a2a2a;border-radius:16px;padding:20px;box-shadow:0 10px 40px rgba(0,0,0,.5)}
        .pwbox h3{font-size:18px;margin-bottom:16px;color:#fff}
        .pwbox .closebtn{float:left;width:32px;height:32px;border-radius:8px;background:#1a1a1a;border:1px solid #2a2a2a;color:#cbd5e1;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px}
        .progbar{width:100%;height:6px;background:#0a0a0a;border-radius:10px;overflow:hidden;margin-top:10px}
        .progfill{height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);border-radius:10px;transition:width .3s}
        .rank-hero{background:linear-gradient(135deg,#1e3a8a 0%,#1e40af 50%,#2563eb 100%);border:2px solid #3b82f6;border-radius:20px;padding:24px 20px;margin-bottom:20px;text-align:center;box-shadow:0 10px 40px rgba(59,130,246,.25);position:relative;overflow:hidden}
        .rank-hero:before{content:"";position:absolute;top:-50%;right:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(255,255,255,.1) 0%,transparent 70%);animation:pulse 3s ease-in-out infinite}
        .rank-hero h3{font-size:16px;font-weight:600;color:#93c5fd;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px}
        .rank-num{font-size:64px;font-weight:900;background:linear-gradient(135deg,#fbbf24 0%,#f59e0b 50%,#ea580c 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;margin-bottom:8px;text-shadow:0 4px 12px rgba(251,191,36,.3)}
        .rank-total{font-size:14px;color:#bfdbfe;font-weight:500}
        .rank-badge{display:inline-block;background:rgba(34,197,94,.2);border:1px solid #22c55e;color:#22c55e;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;margin-top:12px}
        @keyframes pulse{0%,100%{opacity:.5}50%{opacity:.8}}
        @media(max-width:520px){.grid{grid-template-columns:1fr}.lv-stats{flex-wrap:wrap}.stat{flex:0 0 48%}}
        .sb{position:fixed;top:0;bottom:0;right:0;z-index:20000;display:flex;pointer-events:none}
        .sb .panel{width:320px;max-width:82vw;background:#000;border-left:1px solid #1a1a1a;box-shadow:-12px 0 28px rgba(0,0,0,.45);transform:translateX(102%);transition:.22s ease;pointer-events:auto;padding:14px 14px 16px}
        .sb.on{pointer-events:auto}
        .sb.on .panel{transform:translateX(0)}
        .brand{display:flex;align-items:center;gap:10px;margin:4px 0 14px}
        .brand .mark{width:30px;height:30px;border-radius:9px;background:#0a0a0a;border:1px solid #1a1a1a;display:flex;align-items:center;justify-content:center;color:#6ea8ff;font-weight:900}
        .brand .name{font-weight:800;letter-spacing:.2px;font-size:18px}
        .brand .name .b{color:#2d5bff}
        .uCard{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:14px;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px}
        .uCard .t{min-width:0}
        .uCard .t b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .uCard .t small{display:flex;align-items:center;gap:6px;color:#94a3b8;font-size:12px;margin-top:4px}
        .uCard .av{width:42px;height:42px;border-radius:12px;background:#0a0a0a;border:1px solid #1a1a1a;display:flex;align-items:center;justify-content:center;color:#94a3b8;overflow:hidden}
        .uCard .av img{width:100%;height:100%;object-fit:cover;display:block}
        .m{margin-top:12px;display:flex;flex-direction:column;gap:10px}
        .mi{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 12px;border-radius:12px;background:transparent;border:1px solid transparent;color:#dbe3ee;text-decoration:none}
        .mi .r{display:flex;align-items:center;gap:10px;min-width:0}
        .mi .tx{font-weight:700;font-size:14px}
        .mi .ic{width:24px;height:24px;display:flex;align-items:center;justify-content:center;opacity:.9}
        .mi .ic img{width:100%;height:100%;object-fit:contain;filter:brightness(0)invert(1)}
        .mi.active{background:#2b5bff;border-color:#2b5bff}
        .dot{width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block;margin-inline-start:6px;box-shadow:0 0 0 2px rgba(0,0,0,.25)}
        .sbOv{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:19999;opacity:0;pointer-events:none;transition:.22s}
        .sb.on~.sbOv{opacity:1;pointer-events:auto}
        .chat-container{display:flex;flex-direction:column;height:calc(100vh - 180px);padding-bottom:20px}
        .chat-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px}
        .msg{display:flex;gap:10px;align-items:flex-start;max-width:85%}
        .msg.sent{align-self:flex-start;flex-direction:row}
        .msg.received{align-self:flex-end;flex-direction:row-reverse}
        .msg-avatar{width:36px;height:36px;border-radius:10px;background:#1a1a1a;border:1px solid #2a2a2a;display:flex;align-items:center;justify-content:center;color:#6b7c93;font-size:18px;flex-shrink:0}
        .msg-content{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:10px 12px;max-width:100%;word-wrap:break-word}
        .msg.received .msg-content{background:#2b5bff;border-color:#2b5bff}
        .msg-content p{margin:0;font-size:14px;line-height:1.5}
        .msg-time{font-size:10px;color:#94a3b8;margin-top:4px}
        .chat-input{background:#0a0a0a;border-top:1px solid #2a2a2a;padding:12px;display:flex;gap:8px;align-items:center;position:fixed;bottom:0;left:0;right:0;max-width:720px;margin:0 auto}
        .chat-input input{flex:1;background:#000;border:1px solid #2a2a2a;color:#dbe3ee;border-radius:10px;padding:12px;outline:none}
        .send-btn{width:44px;height:44px;border-radius:10px;background:#2b5bff;border:0;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:20px}
        .send-btn:active{transform:scale(.95)}
        .sok{color:#22c55e;font-weight:800}
        .sbad{color:#ef4444;font-weight:800}
        .swarn{color:#f59e0b;font-weight:900}
        .deposit-page{display:none;position:fixed;inset:0;background:#000;z-index:10000;overflow-y:auto}
        .deposit-page.active{display:block}
        :root{--bg:#000;--p:#0a0a0a;--p2:#0f0f0f;--b:#1a1a1a;--m:#9fb2d6;--t:#eaf0ff;--a:#5ea1ff;--g:#19d28f;--r:#ff4d5a}
        #depApp{max-width:560px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column}
        .deptop{height:52px;display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#000;border-bottom:1px solid var(--b)}
        .deptop .balpill{display:flex;align-items:center;gap:4px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:9px 8px 9px 10px}
        .deptop .balpill b{font-size:14px}
        .deptop .usd{width:22px;height:22px}
        .deptop .ic{width:38px;height:38px;background:transparent;border:1px solid var(--b);border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--m);font-size:18px;transition:.2s}
        .deptop .ic:hover{background:#1a1a1a;color:#fff;border-color:#2a2a2a}
        .deptop .wallet{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#22c55e,#16a34a);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(34,197,94,.3);cursor:pointer;border:0}
        .deptop .wallet img{width:20px;height:20px;filter:brightness(0)invert(1)}
        .scr{display:none;flex:1}
        .scr.on{display:flex;flex-direction:column}
        .list{padding:6px 0}
        .drow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;background:#0a0a0a;border-top:1px solid #1a1a1a;border-bottom:1px solid #0f0f0f;cursor:pointer}
        .drow:hover{background:#0f0f0f}
        .drow .nm{font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .coin{width:28px;height:28px}
        .p{padding:14px 16px}
        .dgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .amt{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:14px;color:#fff;text-align:center;font-weight:1000;cursor:pointer;position:relative}
        .amt.on{background:rgba(25,210,143,.14);border-color:rgba(25,210,143,.55)}
        .amt.on:after{content:"✓";position:absolute;left:10px;top:8px;font-size:12px;color:#c8ffe9;opacity:.95}
        .bar{margin-top:12px;display:flex;gap:10px;align-items:center}
        .sel,.in{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:12px 14px;color:#fff;font-weight:900;outline:none;transition:.2s}
        .sel{width:138px}
        .in{flex:1;text-align:right}
        .sel:focus,.in:focus{border-color:rgba(94,161,255,.65);background:#0f0f0f;box-shadow:0 0 0 4px rgba(94,161,255,.12)}
        .hint{margin:14px 0 0;color:var(--m);font-size:12px;display:flex;align-items:center;gap:8px;font-weight:900}
        .hint .q{width:16px;height:16px;border-radius:999px;border:1px solid rgba(255,255,255,.25);display:grid;place-items:center;font-size:11px;color:var(--m)}
        .foot{margin-top:auto;padding:18px 16px 22px}
        .ref{text-align:center;margin:18px 0 10px;font-size:13px;font-weight:900}
        .dcard{margin:12px 12px 0;background:#0a0a0a;border-radius:14px;padding:14px;box-shadow:0 10px 22px rgba(0,0,0,.35);border:1px solid #1a1a1a}
        .ttl{font-weight:1000;text-align:center;margin:2px 0 10px;letter-spacing:.35px}
        .big{font-size:44px;font-weight:1000;text-align:center;margin:0 0 12px;direction:ltr}
        .kv{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:8px 0;border-top:1px solid #1a1a1a}
        .kv:first-of-type{border-top:0}
        .kv .k{color:var(--m);font-size:12px;font-weight:900}
        .kv .v{font-weight:1000;font-size:12px;white-space:nowrap;direction:ltr}
        .dnote{color:var(--m);font-size:12px;line-height:1.6;margin-top:10px;text-align:center;font-weight:900}
        .dd{margin:14px 16px 0;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:14px;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer}
        .dd .l{display:flex;align-items:center;gap:10px;min-width:0}
        .dpill{height:34px;min-width:34px;padding:0 10px;border-radius:10px;background:#0a0a0a;border:1px solid #1a1a1a;display:flex;align-items:center;justify-content:center;color:var(--m);font-size:12px;font-weight:1000}
        .dd .c{font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .qrbox{margin:16px 16px 0;display:flex;flex-direction:column;align-items:center;gap:12px}
        .qr{width:220px;height:220px;background:#fff;border-radius:10px;display:grid;place-items:center;padding:10px;border:1px solid #1a1a1a}
        .addr{width:calc(100% - 32px);margin:0 16px;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:14px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px}
        .addr code{color:#fff;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:ltr}
        .cpy{border:0;background:transparent;color:var(--m);cursor:pointer;font-weight:1000}
        .sm{color:var(--m);font-size:12px;line-height:1.65;margin:10px 16px 0;font-weight:900}
        #msg{margin:10px 16px 0;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,77,90,.35);background:rgba(255,77,90,.10);color:#ffb4ba;font-weight:1000;display:none}
        #bonusBox{display:none;margin:10px 16px 0;padding:12px;border-radius:14px;border:1px solid #1a1a1a;background:#0a0a0a}
        #bonusBox .h{font-weight:1000;margin-bottom:10px;color:#fff;letter-spacing:.2px}
        #bonusBox .r{display:flex;gap:10px;align-items:center}
        #bonusBox input{flex:1}
        .badgeOk{display:inline-flex;align-items:center;gap:8px;margin-top:10px;color:var(--g);font-weight:1000;font-size:12px}
        .badgeBad{display:inline-flex;align-items:center;gap:8px;margin-top:10px;color:var(--r);font-weight:1000;font-size:12px}
        .btn-g{background:var(--g)!important;color:#000!important;border:0!important;font-weight:900;width:100%;padding:14px}
        .btn-b{background:var(--a)!important;color:#fff!important;border:0!important;font-weight:900;width:100%;padding:14px}
        .dep-topbar{display:none}
        .deposit-page.active .dep-topbar{display:block}
    </style>
</head>
<body>
    <div class="app" id="mainApp">
        <div class="topbar">
            <div class="toprow">
                <div class="rightpack">
                    <div class="balpill">
                        <img class="usd" alt="$" src="https://binolla.com/static/common/images/currencies/usd.svg">
                        <b id="balanceDisplay">0.00$</b>
                    </div>
                    <div class="wallet" id="walletBtn">
                        <img src="https://cdn-icons-png.flaticon.com/128/11937/11937688.png" alt="wallet">
                    </div>
                </div>
                <button class="iconbtn" id="menuBtn">☰</button>
            </div>
            <div class="tabs">
                <span class="tab active" id="t-profile">الملف الشخصي</span>
                <span class="tab" id="t-rewards">المكافآت</span>
                <span class="tab" id="t-withdraw">عمليات السحب</span>
                <span class="tab" id="t-levels">درجات</span>
            </div>
        </div>

        <div class="container">
            <!-- صفحة الملف الشخصي -->
            <div id="page-profile">
                <div class="card profile-pic">
                    <div class="avatarbox">
                        <div class="avatar" id="avatarBox">👤</div>
                        <div><div class="muted">صورة الملف الشخصي</div></div>
                    </div>
                    <button class="btn blue" id="avatarUploadBtn">تحميل</button>
                    <input id="avatarFile" type="file" accept="image/*" style="display:none">
                </div>

                <div class="card">
                    <div class="row">
                        <div class="muted">اسم العرض</div>
                        <div class="muted">ⓘ</div>
                    </div>
                    <div class="field">
                        <input class="readonly" id="userDisplayName" value="User529391" readonly>
                    </div>
                </div>

                <div class="card">
                    <div class="row">
                        <b>تقدم التحقق</b>
                        <span class="muted">المنجز <span id="vDone">0</span> من 2</span>
                    </div>
                    <div class="progbar">
                        <div class="progfill" id="vMainBar" style="width:0%"></div>
                    </div>
                    <div style="height:10px"></div>
                    <div class="vgrid">
                        <div class="vitem">
                            <div style="flex:1">
                                <h4>تأكيد البريد الإلكتروني</h4>
                                <small id="emailStatus" class="sbad">غير مكتمل</small>
                                <div class="progbar" style="margin-top:6px">
                                    <div class="progfill" id="emailBar" style="width:0%;background:#ef4444"></div>
                                </div>
                            </div>
                            <button class="btn red" id="emailRetryBtn">غير مكتمل</button>
                        </div>
                        <div class="vitem">
                            <div style="flex:1">
                                <h4 id="idTitle">
                                    <span id="idCheck" class="check" style="display:none">✓</span>
                                    التحقق من الهوية
                                </h4>
                                <small id="idStatus" class="sbad">غير مكتمل</small>
                                <div class="progbar" style="margin-top:6px">
                                    <div class="progfill" id="idBar" style="width:0%;background:#ef4444"></div>
                                </div>
                            </div>
                            <button class="btn red" id="idRetryBtn">غير مكتمل</button>
                        </div>
                    </div>

                    <div id="idForm" class="card" style="display:none;margin-top:-6px">
                        <div class="muted" style="line-height:1.7">ارفع صورة الهوية (أمام/خلف) ثم اضغط تقديم</div>
                        <div class="field">
                            <label>صورة الهوية (الوجه الأمامي)</label>
                            <input id="idFront" type="file" accept="image/*">
                        </div>
                        <div class="field">
                            <label>صورة الهوية (الوجه الخلفي)</label>
                            <input id="idBack" type="file" accept="image/*">
                        </div>
                        <button class="btn blue" id="idSubmitBtn" style="width:100%;margin-top:10px">تقديم</button>
                        <div class="note" style="margin:10px 0 0">بعد التقديم: سيتم تحويل الحالة إلى جاري التحقق لحين اعتماد الإدارة.</div>
                    </div>
                </div>

                <div class="card">
                    <div class="row">
                        <b>المصادقة الثنائية باستخدام مصادق جوجل</b>
                        <span class="muted">🔒</span>
                    </div>
                    <div class="muted" style="margin-top:8px;line-height:1.7">
                        أمان متعدد - وأكثر إضافي يعفى عند تسجيل الدخول وإجراء المعاملات المالية
                    </div>
                    <div style="height:10px"></div>
                    <button class="btn">ربط</button>
                </div>

                <div class="card">
                    <div class="row">
                        <b>تغيير كلمة المرور</b>
                        <span class="muted">🔑</span>
                    </div>
                    <div class="muted" style="margin-top:8px">يوصى بتغيير كلمة مرورك كل 30 يوماً</div>
                    <div style="height:10px"></div>
                    <button class="btn" id="changePwBtn">تغيير</button>
                </div>
            </div>

            <!-- صفحة المكافآت -->
            <div id="page-rewards" style="display:none">
                <div class="card" id="rewardAlert" style="background:#ff4757;border-color:#ff4757;color:#fff;text-align:center;font-weight:700">
                    إكمال التحقق من الملف الشخصي لتلقي المكافآت
                </div>

                <div class="card">
                    <div style="display:flex;gap:8px;background:#0a0a0a;border:1px solid #2a2a2a;border-radius:12px;padding:6px">
                        <button id="btn-center" class="btn" style="flex:1;background:#000">مركز</button>
                        <button id="btn-history" class="btn" style="flex:1;background:transparent">التاريخ</button>
                    </div>
                </div>

                <div id="center-view">
                    <div class="card">مركز المكافآت</div>
                </div>

                <div id="history-view" style="display:none">
                    <div class="card" style="text-align:center;color:#94a3b8;padding:70px 14px">
                        <div style="font-size:50px;opacity:.6">📋</div>
                        <div style="margin-top:10px">ليس لديك سجل مكافأة</div>
                    </div>
                </div>
            </div>

            <!-- صفحة عمليات السحب -->
            <div id="page-withdraw" style="display:none">
                <div class="row" style="padding:6px 2px 12px">
                    <b style="font-size:18px">سحب الأموال</b>
                    <span class="muted">✓</span>
                </div>

                <div class="card">
                    <div class="row">
                        <span class="muted">متاح للسحب</span>
                        <b style="font-size:22px" id="withdrawBalance">0$</b>
                    </div>
                </div>

                <div class="card">
                    <div class="field">
                        <label>طريقة السحب</label>
                        <button id="pmBtn" class="btn" style="width:100%;text-align:right">Volet.com</button>
                    </div>
                    <div class="field">
                        <label>المبلغ $</label>
                        <input id="wdAmount" value="10" inputmode="decimal">
                    </div>
                    <div class="field">
                        <label>معرّف المحفظة</label>
                        <input id="wdWallet">
                    </div>
                    <div class="chk">
                        <input id="t" type="checkbox">
                        <label for="t">أقبل الأحكام والشروط</label>
                    </div>
                    <div class="note">قد يتم إرسال الدفعة على أجزاء خلال 48 ساعة</div>
                    <button class="btn blue" id="withdrawBtn" style="width:100%">متابعة السحب</button>
                </div>

                <div class="warn">
                    <i>!</i>
                    <div>
                        <b style="color:#f59e0b">تنبيه:</b> سيتم إلغاء المكافأة وصندوق الغموض غير المفتوح<br>
                        <span class="muted">رصيدك يحتوي على مكافأة وصندوق غموض غير مفتوح</span>
                    </div>
                </div>

                <div class="links">
                    <a href="#">More about bonuses</a>
                    <a href="#">More about Mystery boxes</a>
                </div>
            </div>

            <!-- صفحة درجات -->
            <div id="page-levels" style="display:none">
                <div class="rank-hero">
                    <h3>🏆 ترتيبك العالمي</h3>
                    <div class="rank-num">#1,247</div>
                    <div class="rank-total">من أصل 50,000 متداول نشط</div>
                    <div class="rank-badge">⭐ Top 3%</div>
                </div>

                <div class="lv-head">
                    <h2>مستويات</h2>
                    <div class="lv-right">
                        <div class="muted">مستواك</div>
                        <span class="pill">Starter</span>
                        <div class="muted">رصيد XP</div>
                        <b>0</b>
                    </div>
                </div>

                <div style="display:flex;justify-content:flex-start;margin:6px 0 8px">
                    <a class="how" href="#">How it works?</a>
                </div>

                <div class="lv-stats">
                    <div class="stat"><span>إيداع</span><b>0</b></div>
                    <div class="stat"><span>حجم التداول</span><b>0</b></div>
                    <div class="stat"><span>صفقات</span><b>0</b></div>
                </div>

                <div class="grid">
                    <div class="smallcard">
                        <h4>Bronze</h4>
                        <div>
                            <div class="smrow"><span>واحدة بدون مخاطر</span><b>2.5$</b></div>
                            <div class="smrow2"><span>مضاعف XP</span><b>+10%</b></div>
                        </div>
                    </div>

                    <div class="lcard glow">
                        <div class="lmeta">المستوى الحالي</div>
                        <h3>Starter</h3>
                        <div class="lmid">
                            اكسب 100 XP لكل 100$ تداول.<br>
                            تداول لفتح مستوى البرونز!
                        </div>
                        <button class="lbtn">ابدأ التداول</button>
                    </div>

                    <div class="smallcard">
                        <h4>Gold</h4>
                        <div>
                            <div class="smrow"><span>واحدة بدون مخاطر</span><b>10$</b></div>
                            <div class="smrow2"><span>مضاعف XP</span><b>+30%</b></div>
                        </div>
                    </div>

                    <div class="smallcard">
                        <h4>Silver</h4>
                        <div>
                            <div class="smrow"><span>واحدة بدون مخاطر</span><b>5$</b></div>
                            <div class="smrow2"><span>مضاعف XP</span><b>+20%</b></div>
                        </div>
                    </div>

                    <div class="smallcard" style="grid-column:1/-1">
                        <h4>Platinum</h4>
                        <div>
                            <div class="smrow"><span>واحدة بدون مخاطر</span><b>25$</b></div>
                            <div class="smrow2"><span>مضاعف XP</span><b>+40%</b></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- صفحة الشات -->
            <div id="page-chat" style="display:none">
                <div class="chat-container">
                    <div class="chat-messages" id="chatMessages">
                        <div style="text-align:center;color:#94a3b8;padding:50px 14px">
                            <div style="font-size:40px;opacity:.6">💬</div>
                            <div style="margin-top:10px">لا توجد رسائل بعد</div>
                        </div>
                    </div>
                    <div class="chat-input">
                        <input type="text" id="chatInput" placeholder="اكتب رسالتك هنا...">
                        <button class="send-btn" id="sendMsgBtn">➤</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal طريقة الدفع -->
        <div id="pmModal" class="modal">
            <div class="sheet">
                <div class="mh">
                    <b>اختيار طريقة السحب</b>
                    <div class="x" id="closePmBtn">✕</div>
                </div>
                <div class="pm">
                    <div class="opt" data-method="Tether (USDT/ERC20)">
                        <div class="lx">
                            <div class="ico">
                                <img src="https://binolla.com/static/common/images/payment/method/usdt.svg">
                                <img src="https://binolla.com/static/common/images/payment/crypto/ethereum.svg">
                            </div>
                            <div class="txt">
                                <span>Tether (USDT/ERC20)</span>
                                <small>USDT + ERC20</small>
                            </div>
                        </div>
                        <div class="ck">✓</div>
                    </div>
                    <div class="opt" data-method="Tether (USDT/TRC20)">
                        <div class="lx">
                            <div class="ico">
                                <img src="https://binolla.com/static/common/images/payment/method/usdt.svg">
                                <img src="https://binolla.com/static/common/images/payment/crypto/tron.svg">
                            </div>
                            <div class="txt">
                                <span>Tether (USDT/TRC20)</span>
                                <small>USDT + TRC20</small>
                            </div>
                        </div>
                        <div class="ck">✓</div>
                    </div>
                    <div class="opt" data-method="Tether (USDT/BEP20)">
                        <div class="lx">
                            <div class="ico">
                                <img src="https://binolla.com/static/common/images/payment/method/usdt.svg">
                                <img src="https://binolla.com/static/common/images/payment/crypto/binancecoin.svg">
                            </div>
                            <div class="txt">
                                <span>Tether (USDT/BEP20)</span>
                                <small>USDT + BEP20</small>
                            </div>
                        </div>
                        <div class="ck">✓</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal تغيير كلمة المرور -->
        <div id="pwModal" class="pwmodal">
            <div class="pwbox">
                <div style="overflow:hidden;margin-bottom:20px">
                    <h3 style="float:right">تغيير كلمة المرور</h3>
                    <button class="closebtn" id="closePwBtn2">✕</button>
                </div>
                <div class="field">
                    <label>كلمة المرور القديمة</label>
                    <input type="password">
                </div>
                <div class="field">
                    <label>كلمة المرور الجديدة</label>
                    <input type="password">
                </div>
                <div class="field">
                    <label>تأكيد كلمة المرور الجديدة</label>
                    <input type="password">
                </div>
                <div style="margin-top:16px;text-align:center;color:#6ea8ff;font-size:12px;margin-bottom:16px">
                    تم إرسال بريد إلكتروني إلى <span style="text-decoration:underline">email</span> مع معلومات حول كيفية إعادة تعيين كلمة المرور الخاصة بك.
                </div>
                <div style="display:flex;gap:10px">
                    <button class="btn" style="flex:1" id="cancelPwBtn">إلغاء</button>
                    <button class="btn blue" style="flex:1">حفظ</button>
                </div>
            </div>
        </div>

        <!-- صفحة الإيداع -->
        <div class="deposit-page" id="depositPage">
            <div class="dep-topbar topbar">
                <div class="toprow">
                    <div class="rightpack">
                        <div class="balpill">
                            <img class="usd" alt="$" src="https://binolla.com/static/common/images/currencies/usd.svg">
                            <b id="depBalDisplay">0.00$</b>
                        </div>
                        <div class="wallet" id="depWallet">
                            <img src="https://cdn-icons-png.flaticon.com/128/3135/3135768.png" alt="deposit">
                        </div>
                    </div>
                    <button class="iconbtn" id="depMenuBtn">☰</button>
                </div>
            </div>

            <div id="depApp">
                <section class="scr on" id="s1">
                    <div class="list" id="coinList"></div>
                    <div id="msg"></div>
                </section>

                <section class="scr" id="s2">
                    <div class="p">
                        <div class="dgrid" id="amtGrid"></div>
                        <div class="bar">
                            <select class="sel" id="cur">
                                <option value="TRY">₺ TRY</option>
                                <option value="USD">$ USD</option>
                            </select>
                            <input class="in" id="amtIn" inputmode="numeric" value="4300">
                        </div>
                        <div class="hint">
                            <span class="q">?</span>
                            <span>تعكس الألوان نوع الحساب. <span style="opacity:.9">شاهد المزيد</span></span>
                        </div>
                    </div>

                    <div id="bonusBox">
                        <div class="h">رمز البونص</div>
                        <div class="r">
                            <input class="in" id="bonusIn" placeholder="اكتب رمز البونص" style="text-align:right">
                            <button class="btn blue" id="bonusApply" style="height:44px;width:140px">تطبيق</button>
                        </div>
                        <div id="bonusState"></div>
                    </div>

                    <div class="foot">
                        <div class="ref">
                            <a href="javascript:void(0)" id="bonusToggle">هل لديك رمز ترويجي؟</a>
                        </div>
                        <label class="chk">
                            <input type="checkbox" id="agree" checked>
                            أوافق على الشروط والأحكام وسياسة استرداد الأموال وسياسة معاملات الدفع
                        </label>
                        <button class="btn btn-g" id="payBtn"></button>
                        <div style="height:10px"></div>
                        <div style="text-align:center;font-size:11px;opacity:.75;color:var(--m);font-weight:900">
                            PCI DSS • Mastercard ID Check • VISA
                        </div>
                    </div>
                </section>

                <section class="scr" id="s3">
                    <div class="dcard">
                        <div class="ttl">تأكيد الدفع</div>
                        <div style="text-align:center;font-size:13px;margin-top:2px;color:var(--m);font-weight:900">الرصيد</div>
                        <div class="big" id="confBal"></div>
                        <div class="kv">
                            <div class="k">طريقة الدفع</div>
                            <div class="v" id="confMethod">USDT, TON, Bitcoin, Ethereum</div>
                        </div>
                        <div class="kv">
                            <div class="k">عملة</div>
                            <div class="v" id="confCur"></div>
                        </div>
                        <div class="dnote">يرجى مراجعة المعلومات بعناية والتأكد من صحتها قبل الإرسال.</div>
                    </div>
                    <div class="foot">
                        <button class="btn btn-b" id="payNow">الدفع الآن</button>
                    </div>
                </section>

                <section class="scr" id="s4">
                    <div class="dd" id="ddCoin">
                        <div class="l">
                            <span class="dpill">▾</span>
                            <div class="c" id="s4coinLabel"></div>
                        </div>
                        <img class="coin" id="s4coinIcon" alt="">
                    </div>

                    <div class="dcard" style="margin:12px 12px 0">
                        <div class="kv">
                            <div class="k">المبلغ الأساسي</div>
                            <div class="v" id="baseLine"></div>
                        </div>
                        <div class="kv">
                            <div class="k">البونص</div>
                            <div class="v" id="bonusLine"></div>
                        </div>
                        <div class="kv">
                            <div class="k">الإجمالي</div>
                            <div class="v" id="totalLine"></div>
                        </div>
                    </div>

                    <div class="qrbox">
                        <div style="font-size:12px;text-align:center;color:var(--m);font-weight:900">
                            أنت بصدد إيداع <b id="s4amtText"></b> (<span id="s4net"></span>)
                        </div>
                        <div class="qr">
                            <img id="qrimg" alt="QR" style="width:100%;height:100%" src="">
                        </div>
                    </div>

                    <div style="margin:6px 16px 0;font-size:12px;text-align:center;color:var(--m);font-weight:900">
                        أرسل <b id="s4send"></b> بالضبط إلى
                    </div>

                    <div class="addr">
                        <button class="cpy" id="cpy">⎘</button>
                        <code id="addrTxt"></code>
                    </div>

                    <div class="sm">
                        سيتم إكمال دفعتك بمجرد تأكيدها من قبل الشبكة. قد يستغرق ذلك بعض الوقت، ويعتمد على الرسوم المدفوعة.<br>
                        يتم تنفيذ جميع معاملات العملات المشفرة من جانب موفري العملات المشفرة التابعين لجهات خارجية.
                    </div>
                </section>
            </div>
        </div>
    </div>

    <!-- Sidebar -->
    <div class="sb" id="sb">
        <div class="panel">
            <div class="brand">
                <div class="mark">B</div>
                <div class="name">Bin<span class="b">exia</span></div>
            </div>

            <div class="uCard">
                <div class="t">
                    <b id="sidebarUserName">User530872</b>
                    <small>🙈 <span>ID:</span> <span id="sidebarUserId">530872</span></small>
                </div>
                <div class="av" id="sbAvatar">👤</div>
            </div>

            <nav class="m">
                <a class="mi active" href="javascript:void(0)" data-nav="profile">
                    <div class="r">
                        <span class="tx">المنطقة الشخصية</span>
                        <span class="dot"></span>
                    </div>
                    <span class="ic">
                        <img src="https://cdn-icons-png.flaticon.com/128/3024/3024605.png">
                    </span>
                </a>
                <a class="mi" href="javascript:void(0)" data-nav="rewards">
                    <div class="r">
                        <span class="tx">متجر المكافآت</span>
                    </div>
                    <span class="ic">
                        <img src="https://cdn-icons-png.flaticon.com/128/3179/3179608.png">
                    </span>
                </a>
                <a class="mi" href="javascript:void(0)" data-nav="chat">
                    <div class="r">
                        <span class="tx">مركز المساعدة</span>
                    </div>
                    <span class="ic">
                        <img src="https://cdn-icons-png.flaticon.com/128/11830/11830694.png">
                    </span>
                </a>
            </nav>
        </div>
    </div>

    <div class="sbOv" id="sbOv"></div>

    <script>
        // ====================================
        // JavaScript للصفحة
        // ====================================

        // تهيئة البيانات المزيفة
        let userData = {
            balance: 0,
            displayName: 'User529391',
            userId: '529391',
            avatar: '',
            verified: {
                email: true,
                id: false,
                idStatus: 'not_submitted'
            }
        };

        // ====================================
        // وظائف التنقل بين الصفحات
        // ====================================
        const pages = ['profile', 'rewards', 'withdraw', 'levels', 'chat'];
        const tabs = {
            profile: 't-profile',
            rewards: 't-rewards',
            withdraw: 't-withdraw',
            levels: 't-levels'
        };

        function showPage(pageName) {
            pages.forEach(p => {
                const el = document.getElementById('page-' + p);
                if (el) el.style.display = p === pageName ? 'block' : 'none';
            });

            Object.values(tabs).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.remove('active');
            });

            if (tabs[pageName]) {
                const el = document.getElementById(tabs[pageName]);
                if (el) el.classList.add('active');
            }
        }

        // ====================================
        // Sidebar Navigation
        // ====================================
        function navTo(pageName) {
            showPage(pageName);
            document.getElementById('sb').classList.remove('on');
            
            document.querySelectorAll('.mi').forEach(m => m.classList.remove('active'));
            const clickedLink = document.querySelector('.mi[data-nav="' + pageName + '"]');
            if (clickedLink) clickedLink.classList.add('active');
        }

        // ====================================
        // التحقق UI
        // ====================================
        function setVerUI(verified) {
            const emailOk = !!verified?.email;
            const idOk = !!verified?.id;
            const st = verified?.idStatus || 'not_submitted';
            const done = (emailOk ? 1 : 0) + (idOk ? 1 : 0);

            document.getElementById('vDone').textContent = done;
            document.getElementById('vMainBar').style.width = (done / 2 * 100) + '%';

            // البريد الإلكتروني
            document.getElementById('emailStatus').textContent = 'مكتمل';
            document.getElementById('emailStatus').className = 'sok';
            document.getElementById('emailBar').style.width = '100%';
            document.getElementById('emailBar').style.background = 'linear-gradient(90deg,#22c55e,#16a34a)';

            const emailBtn = document.getElementById('emailRetryBtn');
            emailBtn.textContent = 'مكتمل';
            emailBtn.className = 'btn green';
            emailBtn.disabled = true;

            // الهوية
            const idBtn = document.getElementById('idRetryBtn');
            const idCheck = document.getElementById('idCheck');
            const idForm = document.getElementById('idForm');

            if (idOk) {
                document.getElementById('idStatus').textContent = 'مكتمل';
                document.getElementById('idStatus').className = 'sok';
                document.getElementById('idBar').style.width = '100%';
                document.getElementById('idBar').style.background = 'linear-gradient(90deg,#22c55e,#16a34a)';
                idBtn.textContent = 'مكتمل';
                idBtn.className = 'btn green';
                idCheck.style.display = 'inline';
                if (idForm) idForm.style.display = 'none';
            } else if (st === 'pending') {
                document.getElementById('idStatus').textContent = 'جاري التحقق';
                document.getElementById('idStatus').className = 'swarn';
                document.getElementById('idBar').style.width = '70%';
                document.getElementById('idBar').style.background = '#f59e0b';
                idBtn.textContent = 'جاري التحقق';
                idBtn.className = 'btn yellow';
                idCheck.style.display = 'none';
                if (idForm) idForm.style.display = 'none';
            } else {
                document.getElementById('idStatus').textContent = 'غير مكتمل';
                document.getElementById('idStatus').className = 'sbad';
                document.getElementById('idBar').style.width = '0%';
                document.getElementById('idBar').style.background = '#ef4444';
                idBtn.textContent = 'غير مكتمل';
                idBtn.className = 'btn red';
                idCheck.style.display = 'none';
            }

            // Alert المكافآت
            const alert = document.getElementById('rewardAlert');
            if (alert) {
                if (emailOk && idOk) {
                    alert.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
                    alert.textContent = 'تم التحقق من ملفك الشخصي بنجاح يمكنك الحصول على الجائزة';
                } else {
                    alert.style.background = '#ff4757';
                    alert.textContent = 'إكمال التحقق من الملف الشخصي لتلقي المكافآت';
                }
            }
        }

        // ====================================
        // تحديث الرصيد
        // ====================================
        function updateBalance() {
            const bal = userData.balance.toFixed(2) + '$';
            document.getElementById('balanceDisplay').textContent = bal;
            document.getElementById('withdrawBalance').textContent = bal;
            document.getElementById('depBalDisplay').textContent = bal;
        }

        // ====================================
        // الصورة الشخصية
        // ====================================
        function setAvatarUI(url) {
            const avatarHTML = url && url.startsWith('data:image') 
                ? '<img alt="avatar" src="' + url + '">' 
                : '👤';

            const abox = document.getElementById('avatarBox');
            const sbav = document.getElementById('sbAvatar');
            
            if (abox) abox.innerHTML = avatarHTML;
            if (sbav) sbav.innerHTML = avatarHTML;
        }

        function fileToDataUrl(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ''));
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        // ====================================
        // Event Listeners
        // ====================================
        
        // التبويبات
        document.getElementById('t-profile').addEventListener('click', () => showPage('profile'));
        document.getElementById('t-rewards').addEventListener('click', () => showPage('rewards'));
        document.getElementById('t-withdraw').addEventListener('click', () => showPage('withdraw'));
        document.getElementById('t-levels').addEventListener('click', () => showPage('levels'));

        // القائمة الجانبية
        document.getElementById('menuBtn').addEventListener('click', () => {
            document.getElementById('sb').classList.toggle('on');
        });

        document.getElementById('sbOv').addEventListener('click', () => {
            document.getElementById('sb').classList.remove('on');
        });

        document.querySelectorAll('.mi').forEach(item => {
            item.addEventListener('click', function() {
                const page = this.getAttribute('data-nav');
                if (page) navTo(page);
            });
        });

        // رفع الصورة
        document.getElementById('avatarUploadBtn').addEventListener('click', () => {
            document.getElementById('avatarFile').click();
        });

        document.getElementById('avatarFile').addEventListener('change', async function() {
            const file = this.files && this.files[0];
            if (!file) return;

            try {
                const url = await fileToDataUrl(file);
                userData.avatar = url;
                setAvatarUI(url);
                this.value = '';
                alert('تم رفع الصورة بنجاح!');
            } catch (e) {
                console.error(e);
                alert('تعذر رفع الصورة');
            }
        });

        // التحقق من الهوية
        document.getElementById('idRetryBtn').addEventListener('click', () => {
            const form = document.getElementById('idForm');
            if (!form) return;
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('idSubmitBtn').addEventListener('click', () => {
            const front = document.getElementById('idFront')?.files?.[0];
            const back = document.getElementById('idBack')?.files?.[0];
            
            if (!front || !back) {
                alert('لازم ترفع صورة أمام وصورة خلف');
                return;
            }

            userData.verified.idStatus = 'pending';
            setVerUI(userData.verified);
            
            document.getElementById('idFront').value = '';
            document.getElementById('idBack').value = '';
            document.getElementById('idForm').style.display = 'none';
            
            alert('تم التقديم بنجاح - جاري التحقق');
        });

        // المكافآت
        document.getElementById('btn-center').addEventListener('click', () => {
            document.getElementById('center-view').style.display = 'block';
            document.getElementById('history-view').style.display = 'none';
            document.getElementById('btn-center').style.background = '#000';
            document.getElementById('btn-history').style.background = 'transparent';
        });

        document.getElementById('btn-history').addEventListener('click', () => {
            document.getElementById('center-view').style.display = 'none';
            document.getElementById('history-view').style.display = 'block';
            document.getElementById('btn-center').style.background = 'transparent';
            document.getElementById('btn-history').style.background = '#000';
        });

        // طريقة الدفع
        document.getElementById('pmBtn').addEventListener('click', () => {
            document.getElementById('pmModal').style.display = 'flex';
        });

        document.getElementById('closePmBtn').addEventListener('click', () => {
            document.getElementById('pmModal').style.display = 'none';
        });

        document.getElementById('pmModal').addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });

        document.querySelectorAll('.opt').forEach(opt => {
            opt.addEventListener('click', function() {
                document.querySelectorAll('.opt').forEach(o => o.classList.remove('active'));
                this.classList.add('active');
                
                const method = this.getAttribute('data-method');
                document.getElementById('pmBtn').textContent = method;
                document.getElementById('pmModal').style.display = 'none';
            });
        });

        // تغيير كلمة المرور
        document.getElementById('changePwBtn').addEventListener('click', () => {
            document.getElementById('pwModal').style.display = 'flex';
        });

        document.getElementById('closePwBtn2').addEventListener('click', () => {
            document.getElementById('pwModal').style.display = 'none';
        });

        document.getElementById('cancelPwBtn').addEventListener('click', () => {
            document.getElementById('pwModal').style.display = 'none';
        });

        document.getElementById('pwModal').addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });

        // السحب
        document.getElementById('withdrawBtn').addEventListener('click', () => {
            const amt = parseFloat(document.getElementById('wdAmount').value || '0');
            const wallet = document.getElementById('wdWallet').value.trim();
            const ok = document.getElementById('t').checked;

            if (!ok) {
                alert('لازم توافق على الأحكام والشروط');
                return;
            }

            if (!amt || amt <= 0) {
                alert('اكتب مبلغ صحيح');
                return;
            }

            if (!wallet) {
                alert('اكتب معرّف المحفظة');
                return;
            }

            if (amt > userData.balance) {
                alert('الرصيد غير كافي');
                return;
            }

            userData.balance -= amt;
            updateBalance();
            alert('تم تقديم طلب السحب بنجاح');
        });

        // الشات
        document.getElementById('sendMsgBtn').addEventListener('click', () => {
            const input = document.getElementById('chatInput');
            const text = input.value.trim();
            if (!text) return;

            const container = document.getElementById('chatMessages');
            
            // إزالة رسالة "لا توجد رسائل"
            if (container.querySelector('div[style*="text-align:center"]')) {
                container.innerHTML = '';
            }

            // رسالة المستخدم
            const time = new Date().toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'});
            const msgHTML = `
                <div class="msg sent">
                    <div class="msg-avatar">👤</div>
                    <div>
                        <div class="msg-content"><p>${text}</p></div>
                        <div class="msg-time">${time}</div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', msgHTML);
            input.value = '';
            container.scrollTop = container.scrollHeight;

            // رد تلقائي
            setTimeout(() => {
                const replyHTML = `
                    <div class="msg received">
                        <div class="msg-avatar">🤖</div>
                        <div>
                            <div class="msg-content"><p>شكراً لتواصلك معنا. سيتم الرد عليك قريباً.</p></div>
                            <div class="msg-time">${new Date().toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}</div>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', replyHTML);
                container.scrollTop = container.scrollHeight;
            }, 1500);
        });

        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('sendMsgBtn').click();
            }
        });

        // المحفظة - فتح صفحة الإيداع
        document.getElementById('walletBtn').addEventListener('click', () => {
            document.getElementById('depositPage').classList.add('active');
            setTimeout(() => depInit(), 100);
        });

        document.getElementById('depWallet').addEventListener('click', () => {
            document.getElementById('depositPage').classList.add('active');
            setTimeout(() => depInit(), 100);
        });

        document.getElementById('depMenuBtn').addEventListener('click', () => {
            document.getElementById('sb').classList.toggle('on');
        });

        // ====================================
        // نظام الإيداع
        // ====================================
        const S = [s1, s2, s3, s4];
        const BONUS_CODE = '70ZARCH';
        const BONUS_RATE = 0.70;

        const ADDR = {
            'USDT_TRC20': 'TJuW6QiLBZBgNgPZ4W2sUkqHa3i7gfvVch',
            'USDT_ERC20': '0x4a9b0f70aa5c0a2cf828c8fb34c17d3f92d73b4f',
            'TON': 'UQAwcFVrkfj17ty-Xwdgn7bokHysyDrIRjTJJtJODysQLJNT'
        };

        const ALLOWED = new Set(['USDT_TRC20', 'USDT_ERC20', 'TON']);

        const state = {
            coin: 'USDT(TRON) TRC20',
            icon: 'https://static.expertoption.finance/crypto-icons/color/usdt_trc20.svg',
            net: 'USDT_TRC20',
            amt: 4300,
            cur: 'TRY',
            bonusOn: false,
            bonusCode: '',
            addr: ADDR.USDT_TRC20
        };

        const coins = [
            {t: 'USDT(TRON) TRC20', i: 'https://static.expertoption.finance/crypto-icons/color/usdt_trc20.svg', n: 'USDT_TRC20'},
            {t: 'USDT(Ethereum) ERC20', i: 'https://static.expertoption.finance/crypto-icons/color/usdt.svg', n: 'USDT_ERC20'},
            {t: 'USDT(TON)', i: 'https://static.expertoption.finance/crypto-icons/color/usdt_ton.svg', n: 'USDT_TON'},
            {t: 'USDC(Ethereum) ERC20', i: 'https://static.expertoption.finance/crypto-icons/color/usdc.svg', n: 'USDC_ERC20'},
            {t: 'BTC (Bitcoin)', i: 'https://static.expertoption.finance/crypto-icons/color/btc.svg', n: 'BTC'},
            {t: 'ETH (Ethereum)', i: 'https://static.expertoption.finance/crypto-icons/color/eth.svg', n: 'ETH'},
            {t: 'TON', i: 'https://static.expertoption.finance/crypto-icons/color/ton.svg', n: 'TON'}
        ];

        const amts = [42350, 105800, 4300, 10550, 1300, 2200, 450, 900];

        const sym = c => c === 'USD' ? '$' : '₺';
        const fmt = n => String(Math.max(0, Math.floor(n || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        const baseAmt = () => Math.max(0, Math.floor(state.amt || 0));
        const bonusAmt = () => state.bonusOn ? Math.floor(baseAmt() * BONUS_RATE) : 0;
        const totalAmt = () => baseAmt() + bonusAmt();
        const mny = n => sym(state.cur) + fmt(n);

        function show(k) {
            S.forEach((x, i) => x.classList.toggle('on', i === k));
            sync();
        }

        function sync() {
            cur.value = state.cur;
            amtIn.value = baseAmt();
            payBtn.textContent = 'ادفع ' + fmt(baseAmt()) + ' ' + sym(state.cur);
            confBal.textContent = mny(baseAmt());
            confCur.textContent = state.cur;
            state.addr = ADDR[state.net] || state.addr;

            s4coinLabel.textContent = state.coin;
            s4coinIcon.src = state.icon;
            s4net.textContent = state.net;
            addrTxt.textContent = state.addr;
            baseLine.textContent = mny(baseAmt());

            bonusLine.textContent = state.bonusOn 
                ? ('+' + mny(bonusAmt()) + ' (' + Math.round(BONUS_RATE * 100) + '%)')
                : '—';
            
            totalLine.textContent = mny(totalAmt());
            s4amtText.textContent = mny(totalAmt());

            const payload = {
                network: state.net,
                address: state.addr,
                currency: state.cur,
                base: baseAmt(),
                bonus: bonusAmt(),
                total: totalAmt(),
                bonusCode: state.bonusOn ? state.bonusCode : ''
            };

            qrimg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' 
                + encodeURIComponent(JSON.stringify(payload));
            
            s4send.textContent = state.net + ' | ' + state.addr;
        }

        function buildCoins() {
            coinList.innerHTML = coins.map((c, idx) => 
                `<div class="drow" data-i="${idx}">
                    <div style="min-width:0"><div class="nm">${c.t}</div></div>
                    <img class="coin" alt="" src="${c.i}">
                </div>`
            ).join('');

            coinList.onclick = e => {
                const r = e.target.closest('.drow');
                if (!r) return;
                
                const c = coins[+r.dataset.i];
                if (!ALLOWED.has(c.n)) {
                    msg.style.display = 'block';
                    msg.textContent = 'غير متوفر حاليًا في بلدك أو قم بتغيير البلد للمتابعة';
                    setTimeout(() => msg.style.display = 'none', 2400);
                    return;
                }

                state.coin = c.t;
                state.icon = c.i;
                state.net = c.n;
                state.addr = ADDR[c.n] || state.addr;
                show(1);
            };
        }

        function buildAmts() {
            amtGrid.innerHTML = amts.map(v => 
                `<div class="amt ${v === state.amt ? 'on' : ''}" data-v="${v}">
                    ${sym(state.cur)}${fmt(v)}
                </div>`
            ).join('');

            amtGrid.onclick = e => {
                const b = e.target.closest('.amt');
                if (!b) return;
                
                state.amt = +b.dataset.v;
                [...amtGrid.children].forEach(x => 
                    x.classList.toggle('on', +x.dataset.v === state.amt)
                );
                sync();
            };
        }

        function repaintAmts() {
            [...amtGrid.children].forEach(x => {
                const v = +x.dataset.v;
                x.textContent = sym(state.cur) + fmt(v);
            });
        }

        payBtn.onclick = () => {
            if (!agree.checked) {
                alert('يرجى الموافقة على الشروط أولاً');
                return;
            }
            show(2);
        };

        payNow.onclick = () => show(3);
        ddCoin.onclick = () => show(0);

        cur.onchange = () => {
            state.cur = cur.value;
            repaintAmts();
            sync();
        };

        amtIn.oninput = () => {
            const v = +amtIn.value.replace(/[^\d]/g, '');
            state.amt = v || 0;
            [...amtGrid.children].forEach(x => x.classList.remove('on'));
            sync();
        };

        cpy.onclick = async () => {
            try {
                await navigator.clipboard.writeText(state.addr);
                cpy.textContent = 'تم';
                setTimeout(() => cpy.textContent = '⎘', 900);
            } catch (e) {
                prompt('انسخ العنوان:', state.addr);
            }
        };

        bonusToggle.onclick = () => {
            bonusBox.style.display = bonusBox.style.display === 'block' ? 'none' : 'block';
        };

        bonusApply.onclick = () => {
            const code = (bonusIn.value || '').trim();
            
            if (!code) {
                bonusState.innerHTML = '<div class="badgeBad">✖ اكتب رمز البونص</div>';
                state.bonusOn = false;
                state.bonusCode = '';
                sync();
                return;
            }

            if (code === BONUS_CODE) {
                state.bonusOn = true;
                state.bonusCode = code;
                bonusState.innerHTML = '<div class="badgeOk">✔ تم تفعيل بونص ' 
                    + Math.round(BONUS_RATE * 100) + '%</div>';
            } else {
                state.bonusOn = false;
                state.bonusCode = '';
                bonusState.innerHTML = '<div class="badgeBad">✖ رمز غير صحيح</div>';
            }

            sync();
        };

        function depInit() {
            buildCoins();
            buildAmts();
            sync();
        }

        // ====================================
        // تهيئة الصفحة
        // ====================================
        showPage('profile');
        setVerUI(userData.verified);
        updateBalance();
        setAvatarUI(userData.avatar);

        console.log('✅ تم تحميل صفحة الملف الشخصي بنجاح');
    </script>
</body>
</html>
        `;

        // استبدال محتوى الصفحة
        document.body.innerHTML = profileHTML;

        // إعادة تشغيل السكريبت
        const scripts = document.body.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => 
                newScript.setAttribute(attr.name, attr.value)
            );
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });

        console.log('✅ تم تفعيل صفحة الملف الشخصي');
    }

})();
