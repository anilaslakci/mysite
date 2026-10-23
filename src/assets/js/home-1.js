
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

// Shared, bounded sparkle lifecycle. Session/intro bypass never disables decoration.
(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const layers=[document.querySelector('.intro-gold'),document.getElementById('hero-sparkles')].filter(Boolean);
  function place(star,index,protectBrand){
    // Side bands protect the brand, hero copy and bottom swipe cue.
    star.style.left=((index%2?78:4)+Math.random()*17)+'%';
    star.style.top=(protectBrand?(index%2?68+Math.random()*7:14+Math.random()*15):14+Math.random()*60)+'%';
    star.style.setProperty('--size',(index%3===0?3:8+Math.random()*6)+'px');
  }
  for(const layer of layers){
    layer.setAttribute('aria-hidden','true');layer.replaceChildren();
    const count=layer.classList.contains('intro-gold')?6:8;
    for(let i=0;i<count;i++){
      const star=document.createElement('i');star.className='gold-glint'+(i%3===0?' gold-glint--dot':'');
      if(i%3!==0)star.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l1.8 7.2L21 12l-7.2 1.8L12 22l-1.8-7.2L3 12l7.2-1.8z"/></svg>';
      place(star,i,layer.classList.contains('intro-gold'));star.style.animationDelay=(-6*i/count)+'s';
      // At each cycle boundary opacity is zero, so repositioning cannot jump visibly.
      star.addEventListener('animationiteration',()=>place(star,i,layer.classList.contains('intro-gold')));layer.appendChild(star);
    }
  }
  const update=()=>layers.forEach(layer=>{layer.dataset.goldPaused=String(document.hidden);layer.dataset.goldReduced=String(motion.matches);});
  document.addEventListener('visibilitychange',update);motion.addEventListener('change',update);update();
})();

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
