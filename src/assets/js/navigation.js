/* Same-tab navigation hints are short lived, consumed once, and never alter SEO URLs. */
(() => {
  const transitionKey='mysite-language-transition',visitedKey='mysite-home-visited';
  const home=location.pathname==='/'||location.pathname==='/en/';
  let transition=false,visited=false;
  try {
    const raw=sessionStorage.getItem(transitionKey);
    sessionStorage.removeItem(transitionKey);
    visited=sessionStorage.getItem(visitedKey)==='1';
    if(raw){const hint=JSON.parse(raw);transition=hint.path===location.pathname&&Number.isFinite(hint.at)&&Date.now()>=hint.at&&Date.now()-hint.at<15000;}
  } catch { /* Invalid/blocked storage cannot break navigation. */ }
  if(home&&(transition||visited||new URLSearchParams(location.search).get('skipIntro')==='1'))document.documentElement.dataset.entry='direct';
  window.addEventListener('pageshow',event=>{
    if(!home||!event.persisted)return;
    try{if(sessionStorage.getItem(visitedKey)!=='1')return;}catch{return;}
    document.documentElement.dataset.entry='direct';
    document.documentElement.classList.remove('intro-locked');document.body.classList.remove('intro-locked');
    for(const key of ['position','inset','width','touchAction'])document.body.style[key]='';
    const site=document.getElementById('site');if(site){site.inert=false;site.classList.add('visible');}
  });
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('.site-language a');
    if(!link||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||link.target==='_blank'||link.hasAttribute('aria-current'))return;
    const target=new URL(link.href,location.href);if(target.origin!==location.origin)return;
    try{sessionStorage.setItem(transitionKey,JSON.stringify({path:target.pathname,at:Date.now()}));}
    catch{if(target.pathname==='/'||target.pathname==='/en/'){event.preventDefault();target.searchParams.set('skipIntro','1');location.assign(target.href);}}
  });
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('[data-site-menu]').forEach(button=>{
      const links=document.getElementById(button.getAttribute('aria-controls'));
      const close=()=>{button.setAttribute('aria-expanded','false');links.dataset.open='false';};
      button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));links.dataset.open=String(open);});
      links.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
      document.addEventListener('keydown',event=>{if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){close();button.focus();}});
    });
  },{once:true});
})();
