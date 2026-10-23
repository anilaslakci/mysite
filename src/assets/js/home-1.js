
// CURSOR
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const directEntry=document.documentElement.dataset.entry==='direct';
const lowMotion=directEntry||reducedMotion||matchMedia('(pointer: coarse)').matches;

const menuToggle=document.querySelector('.menu-toggle'),menuLinks=document.getElementById('navigation-links');
menuToggle?.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';menuToggle.setAttribute('aria-expanded',String(open));menuLinks.dataset.open=String(open);});
menuLinks?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menuLinks.dataset.open='false';menuToggle.setAttribute('aria-expanded','false');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuToggle?.getAttribute('aria-expanded')==='true'){menuLinks.dataset.open='false';menuToggle.setAttribute('aria-expanded','false');menuToggle.focus();}});
const cur=document.getElementById('cur'),ring=document.getElementById('cur-ring');
// Pointer tracking is independent of the intro/decorative-animation preference.
let mx=0,my=0,rx=0,ry=0,cursorFrame=null,cursorSeen=false;
const cursorEnabled=()=>!reducedMotion&&matchMedia('(hover: hover) and (pointer: fine)').matches;
function followCursor(){
  cursorFrame=null;if(!cursorSeen||document.hidden||!cursorEnabled())return;
  rx+=(mx-rx)*.12;ry+=(my-ry)*.12;
  ring.style.left=rx+'px';ring.style.top=ry+'px';
  if(Math.abs(mx-rx)+Math.abs(my-ry)>.1)cursorFrame=requestAnimationFrame(followCursor);
}
cur.style.visibility=ring.style.visibility='hidden';
document.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||!cursorEnabled())return;
  mx=e.clientX;my=e.clientY;
  if(!cursorSeen){rx=mx;ry=my;cursorSeen=true;}
  cur.style.left=mx+'px';cur.style.top=my+'px';
  cur.style.visibility=ring.style.visibility='visible';
  if(cursorFrame===null)followCursor();
},{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){if(cursorFrame!==null)cancelAnimationFrame(cursorFrame);cursorFrame=null;}
  else if(cursorSeen)followCursor();
});

// SPARKLES
function mkSparkles(id,n){
  if(lowMotion)return;
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

mkSparkles('hero-sparkles',10);

// HERO PARTICLES
const hpc=document.getElementById('hpc');
for(let i=0;i<(lowMotion?0:20);i++){const p=document.createElement('div');p.className='h-p';p.style.cssText=`left:${Math.random()*100}%;bottom:0;width:${1+Math.random()*2}px;height:${1+Math.random()*2}px;animation-duration:${6+Math.random()*10}s;animation-delay:${Math.random()*8}s;`;hpc.appendChild(p);}

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
  if(directEntry||reducedMotion){el.textContent=t.toLocaleString(document.documentElement.lang==='en'?'en-US':'tr-TR')+sx;return;}
  let c=0;const st=t/40;
  const tm=setInterval(()=>{c=Math.min(c+st,t);el.textContent=Math.floor(c).toLocaleString(document.documentElement.lang==='en'?'en-US':'tr-TR')+(c>=t?sx:'');if(c>=t)clearInterval(tm);},40);
}
const so=new IntersectionObserver(e=>{e.forEach(x=>{if(x.isIntersecting){countUp(x.target);so.unobserve(x.target);}});});
document.querySelectorAll('[data-count]').forEach(el=>so.observe(el));
document.getElementById('year').textContent=new Date().getFullYear();

document.documentElement.classList.add('home-ready');
