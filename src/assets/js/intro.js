/* Optional first-visit overlay. No content is hidden unless this controller initializes. */
(() => {
  const intro=document.getElementById('intro'),site=document.getElementById('site'),cue=intro?.querySelector('.intro-swipe');
  if(!intro||!site||!cue)return;
  let state='idle',untouched=true,remaining=10000,started=0,autoTimer=null,endTimer=null,touch=null,wheel=0,lastWheel=0;
  const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,listeners=[];
  const on=(node,type,fn,options)=>{node.addEventListener(type,fn,options);listeners.push(()=>node.removeEventListener(type,fn,options));};
  const remember=()=>{try{sessionStorage.setItem('mysite-home-visited','1');}catch{/* Storage is optional. */}};
  function pause(){if(autoTimer!==null){clearTimeout(autoTimer);autoTimer=null;remaining=Math.max(0,remaining-(Date.now()-started));}}
  function interact(){untouched=false;pause();}
  function finish(focus=true){
    if(state==='closed')return;
    state='closed';pause();clearTimeout(endTimer);listeners.splice(0).forEach(remove=>remove());
    intro.dataset.state='closed';intro.hidden=true;root.classList.remove('intro-locked');document.body.classList.remove('intro-locked');
    site.inert=false;site.classList.add('visible');remember();
    if(focus)document.getElementById('hero')?.focus({preventScroll:true});
  }
  function close(){
    if(state!=='open')return;
    interact();state='closing';intro.dataset.state='closing';remember();
    if(reduced||document.hidden){finish();return;}
    // A timeout also releases focus/scroll if transitionend never arrives.
    endTimer=setTimeout(()=>finish(),650);
  }
  function arm(){
    if(state!=='open'||!untouched||document.hidden)return;
    if(remaining<=0){close();return;}
    started=Date.now();autoTimer=setTimeout(()=>{autoTimer=null;remaining=0;if(!document.hidden&&untouched)close();},remaining);
  }
  try {
    const alreadyPainted=typeof performance!=='undefined'&&performance.now()>1500&&performance.getEntriesByType('paint').some(e=>e.name==='first-contentful-paint');
    if(root.dataset.entry==='direct'||location.hash||reduced||alreadyPainted){finish(false);return;}
    on(cue,'click',close);
    on(window,'pointerdown',()=>{if(state==='open')interact();},{passive:true});
    on(window,'touchstart',event=>{if(state!=='open')return;interact();touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});
    on(window,'touchmove',event=>{
      if(state!=='open')return;
      if(!touch||event.touches.length!==1)return;
      if(event.cancelable)event.preventDefault();
      const dx=event.touches[0].clientX-touch.x,dy=touch.y-event.touches[0].clientY;
      if(dy>=60&&dy>Math.abs(dx)*1.25)close();
    },{passive:false});
    on(window,'touchend',()=>{touch=null;},{passive:true});
    on(window,'touchcancel',()=>{touch=null;},{passive:true});
    on(window,'wheel',event=>{
      if(state!=='open')return;interact();if(event.ctrlKey)return;
      if(event.cancelable)event.preventDefault();
      const now=Date.now();if(now-lastWheel>200)wheel=0;lastWheel=now;
      wheel=Math.max(0,wheel+event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1));
      if(wheel>=48)close();
    },{passive:false});
    on(window,'keydown',event=>{
      if(state!=='open')return;interact();if(event.ctrlKey||event.metaKey||event.altKey)return;
      if(event.key==='Tab'){
        const items=[...intro.querySelectorAll('a[href],button')],first=items[0],last=items.at(-1);
        if(document.activeElement===intro){event.preventDefault();(event.shiftKey?last:first).focus();return;}
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
        return;
      }
      if(event.target.closest?.('a,input,select,textarea'))return;
      if(['ArrowUp','ArrowDown','PageDown',' ','Enter','Escape'].includes(event.key)){event.preventDefault();close();}
    });
    on(intro,'transitionend',event=>{if(state==='closing'&&event.target===intro&&event.propertyName==='transform')finish();});
    on(document,'visibilitychange',()=>{intro.dataset.paused=String(document.hidden);if(document.hidden){pause();if(state==='closing')finish(false);}else arm();});
    on(window,'pagehide',()=>finish(false));
    on(window,'pageshow',event=>{if(event.persisted)finish(false);});
    state='open';intro.hidden=false;intro.dataset.state='open';intro.dataset.paused=String(document.hidden);site.inert=true;
    root.classList.add('intro-locked');document.body.classList.add('intro-locked');
    intro.focus({preventScroll:true});arm();
  } catch { finish(false); }
})();
