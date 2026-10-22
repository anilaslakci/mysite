
// CURSOR
const cur=document.getElementById('cur'),ring=document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
(function a(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(a);})();

// SPARKLES
function mkSparkles(id,n){
  const c=document.getElementById(id);
  for(let i=0;i<n;i++){
    const s=document.createElement('div');
    s.className='star-el';
    const sz=8+Math.random()*12;
    s.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${2+Math.random()*4}s;--dl:${Math.random()*6}s;`;
    s.innerHTML=`<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="rgba(201,168,76,0.85)"><path d="M12 2l1.8 7.2L21 12l-7.2 1.8L12 22l-1.8-7.2L3 12l7.2-1.8z"/></svg>`;
    c.appendChild(s);
  }
}
mkSparkles('intro-sparkles',16);
mkSparkles('hero-sparkles',10);

// INTRO PARTICLES
const ipc=document.getElementById('ipc');
for(let i=0;i<45;i++){const p=document.createElement('div');p.className='i-p';p.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;width:${1+Math.random()*3}px;height:${1+Math.random()*3}px;animation-duration:${4+Math.random()*8}s;animation-delay:${Math.random()*6}s;`;ipc.appendChild(p);}

// GLOW
const ig=document.getElementById('iglow');
document.addEventListener('mousemove',e=>{ig.style.left=e.clientX+'px';ig.style.top=e.clientY+'px';});

// HERO PARTICLES
const hpc=document.getElementById('hpc');
for(let i=0;i<20;i++){const p=document.createElement('div');p.className='h-p';p.style.cssText=`left:${Math.random()*100}%;bottom:0;width:${1+Math.random()*2}px;height:${1+Math.random()*2}px;animation-duration:${6+Math.random()*10}s;animation-delay:${Math.random()*8}s;`;hpc.appendChild(p);}

// CLOSE INTRO — curtain wipe effect
function closeIntro(){
  const intro=document.getElementById('intro');
  const curtain=document.getElementById('curtain');
  const site=document.getElementById('site');

  if(intro.dataset.closing==='1') return;
  intro.dataset.closing='1';

  // Kullanıcı intro açıkken kaydırmaya çalışmış olsa bile site her zaman en baştan açılır.
  window.scrollTo(0,0);
  document.documentElement.scrollTop=0;
  document.body.scrollTop=0;

  intro.style.transition='opacity 0.5s ease';
  intro.style.opacity='0';
  intro.style.pointerEvents='none';

  setTimeout(()=>{
    intro.style.display='none';
    site.classList.add('visible');

    document.documentElement.classList.remove('intro-locked');
    document.body.classList.remove('intro-locked');
    document.body.style.position='';
    document.body.style.inset='';
    document.body.style.width='';
    document.body.style.touchAction='';
    window.scrollTo(0,0);

    setTimeout(()=>{
      curtain.style.transition='transform 1.1s cubic-bezier(0.77,0,0.175,1)';
      curtain.style.transform='translateX(100%)';
    },80);
  },500);
}

// Portfolyodaki “Ana Siteye Dön” bağlantısı ?skipIntro=1 parametresi gönderir.
// Bu durumda açılış ekranı gösterilmeden ana sayfa doğrudan açılır.
const skipIntro = new URLSearchParams(window.location.search).get('skipIntro') === '1';

if(skipIntro){
  document.getElementById('intro').style.display='none';
  document.getElementById('curtain').style.display='none';
  document.getElementById('site').classList.add('visible');
  document.documentElement.classList.remove('intro-locked');
  document.body.classList.remove('intro-locked');
  document.body.style.position='';
  document.body.style.inset='';
  document.body.style.width='';
  document.body.style.touchAction='';
  window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
  window.scrollTo(0,0);
}else{
  // Intro açıkken kaydırma, dokunmatik sürükleme ve klavye ile sayfa hareketini engelle.
  document.documentElement.classList.add('intro-locked');
  const blockIntroScroll=e=>{
    if(!document.body.classList.contains('intro-locked')) return;
    e.preventDefault();
  };
  window.addEventListener('wheel',blockIntroScroll,{passive:false});
  window.addEventListener('touchmove',blockIntroScroll,{passive:false});
  window.addEventListener('keydown',e=>{
    if(document.body.classList.contains('intro-locked') && ['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key)){
      e.preventDefault();
    }
  });

  // Kullanıcı Keşfet butonuna basmazsa açılış 15 saniye görünür ve ardından site otomatik açılır.
  window.setTimeout(()=>{
    if(document.body.classList.contains('intro-locked')) closeIntro();
  }, 15000);
}

// NAV
window.addEventListener('scroll',()=>document.getElementById('nav').classList.toggle('sc',scrollY>60));

// REVEAL
const obs=new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('visible'),i*80);obs.unobserve(e.target);}});
},{threshold:.1});
document.querySelectorAll('.reveal').forEach(r=>obs.observe(r));

// TABS
function showTab(btn, id){
  document.querySelectorAll('.a-tab').forEach(t=>t.classList.remove('act'));
  document.querySelectorAll('.a-panel').forEach(p=>p.classList.remove('act'));
  document.getElementById('tab-'+id).classList.add('act');
  btn.classList.add('act');
}

// COUNT UP
function countUp(el){
  const t=parseInt(el.dataset.count),sx=el.dataset.suffix||'';
  let c=0;const st=t/40;
  const tm=setInterval(()=>{c=Math.min(c+st,t);el.textContent=Math.floor(c).toLocaleString('tr-TR')+(c>=t?sx:'');if(c>=t)clearInterval(tm);},40);
}
const so=new IntersectionObserver(e=>{e.forEach(x=>{if(x.isIntersecting){countUp(x.target);so.unobserve(x.target);}});});
document.querySelectorAll('[data-count]').forEach(el=>so.observe(el));
document.getElementById('year').textContent=new Date().getFullYear();
