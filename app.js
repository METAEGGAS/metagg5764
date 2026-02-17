const navItems=document.querySelectorAll('.nav-item');
const mainContent=document.getElementById('mainContent');
const pageTitle=document.getElementById('pageTitle');
let currentScript=null;

function setActive(page){
  navItems.forEach(item=>{
    item.classList.remove('active');
    if(item.dataset.page===page)item.classList.add('active')
  })
}

function loadPage(page){
  if(currentScript){
    currentScript.remove();
    currentScript=null;
  }
  
  if(page==='home'){
    mainContent.innerHTML='<div class="home-content"><div class="welcome-card"><h2>مرحباً بك! 👋</h2><p>اضغط على أيقونة "البروفايل" في الأسفل لعرض صفحة البروفايل</p></div></div>';
    pageTitle.textContent='🌟 التطبيق الاحترافي';
  }
  else if(page==='profile'){
    pageTitle.textContent='profile.html';
    fetch('profile.html')
      .then(res=>res.text())
      .then(html=>{
        const parser=new DOMParser();
        const doc=parser.parseFromString(html,'text/html');
        const bodyContent=doc.body.innerHTML;
        mainContent.innerHTML=bodyContent;
        currentScript=document.createElement('script');
        currentScript.src='profile.js';
        document.body.appendChild(currentScript);
      })
      .catch(()=>mainContent.innerHTML='<div style="text-align:center;padding:50px;color:red"><h2>❌ خطأ في تحميل البروفايل</h2><p>تأكد من وجود ملف profile.html</p></div>');
  }
  else if(page==='search'){
    mainContent.innerHTML='<div class="home-content"><div class="welcome-card"><h2>🔍 صفحة البحث</h2><p>قريباً...</p></div></div>';
    pageTitle.textContent='🔍 البحث';
  }
  else if(page==='notifications'){
    mainContent.innerHTML='<div class="home-content"><div class="welcome-card"><h2>🔔 الإشعارات</h2><p>لا توجد إشعارات جديدة</p></div></div>';
    pageTitle.textContent='🔔 الإشعارات';
  }
  
  setActive(page);
}

navItems.forEach(item=>{
  item.addEventListener('click',()=>{
    loadPage(item.dataset.page);
  })
});
