/* Optional first-visit overlay. No content is hidden unless this controller initializes. */
(() => {
  const intro=document.getElementById('intro'),site=document.getElementById('site'),cue=intro?.querySelector('.intro-swipe');
  if(!intro||!site||!cue)return;
  let state='idle',untouched=true,remaining=10000,started=0,autoTimer=null,endTimer=null,drag=null,wheel=0,lastWheel=0;
  const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,listeners=[];
  const on=(node,type,fn,options)=>{node.addEventListener(type,fn,options);listeners.push(()=>node.removeEventListener(type,fn,options));};
  const remember=()=>{try{sessionStorage.setItem('mysite-home-visited','1');}catch{/* Storage is optional. */}};
  function pause(){if(autoTimer!==null){clearTimeout(autoTimer);autoTimer=null;remaining=Math.max(0,remaining-(Date.now()-started));}}
  function interact(){untouched=false;pause();}
  const height=()=>Math.max(1,intro.getBoundingClientRect().height);
  const offset=value=>intro.style.setProperty('--intro-offset',value+'px');
  function release(){const active=drag;drag=null;if(active&&intro.hasPointerCapture?.(active.id))intro.releasePointerCapture(active.id);}
  function finish(focus=true){
    if(state==='closed')return;
    state='closed';release();pause();clearTimeout(endTimer);listeners.splice(0).forEach(remove=>remove());
    intro.dataset.state='closed';intro.hidden=true;root.classList.remove('intro-locked');document.body.classList.remove('intro-locked');
    site.inert=false;site.classList.add('visible');remember();
    if(focus)document.getElementById('hero')?.focus({preventScroll:true});
  }
  function close(){
    if(!['open','dragging','snapping'].includes(state))return;
    interact();release();clearTimeout(endTimer);state='closing';intro.dataset.state='closing';remember();
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
    // Slow initialization is not evidence of a completed visit.
    if(root.dataset.entry==='direct'||location.hash||reduced){finish(false);return;}
    let suppressClick=false,cuePressed=false;
    on(cue,'click',event=>{if(suppressClick){event.preventDefault();suppressClick=false;return;}close();});
    // Pointer capture can retarget a no-drag button click to the curtain itself.
    on(intro,'click',event=>{if(event.target!==intro||!cuePressed)return;cuePressed=false;if(suppressClick){suppressClick=false;return;}close();});
    function reset(){
      release();state='snapping';intro.dataset.state='snapping';offset(0);
      clearTimeout(endTimer);endTimer=setTimeout(()=>{if(state==='snapping'){state='open';intro.dataset.state='open';}},350);
    }
    on(intro,'pointerdown',event=>{
      if(state!=='open'||event.isPrimary===false||event.button!==0||event.target.closest?.('a,input,select,textarea'))return;
      interact();suppressClick=false;cuePressed=event.target===cue||!!cue.contains?.(event.target);
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,distance:0,axis:null};
      intro.setPointerCapture(event.pointerId);
    });
    on(intro,'pointermove',event=>{
      if(!drag||drag.id!==event.pointerId)return;
      const dx=event.clientX-drag.x,dy=drag.y-event.clientY;
      if(!drag.axis&&Math.max(Math.abs(dx),Math.abs(dy))>=8)drag.axis=dy>0&&dy>Math.abs(dx)*1.25?'vertical':'rejected';
      if(drag.axis!=='vertical')return;
      event.preventDefault();suppressClick=true;state='dragging';intro.dataset.state='dragging';
      drag.distance=Math.min(height(),Math.max(0,dy));offset(-drag.distance);
    },{passive:false});
    on(intro,'pointerup',event=>{
      if(!drag||drag.id!==event.pointerId)return;
      const complete=drag.axis==='vertical'&&drag.distance/height()>=.36;
      if(complete)close();else if(state==='dragging')reset();else release();
    });
    on(intro,'pointercancel',event=>{if(drag?.id===event.pointerId)reset();});
    on(intro,'lostpointercapture',event=>{if(drag?.id===event.pointerId)reset();});
    on(intro,'pointerdown',event=>{if(event.isPrimary===false&&drag)reset();});
    on(intro,'dragstart',event=>event.preventDefault());
    on(window,'wheel',event=>{
      if(state!=='open'||drag)return;if(event.ctrlKey)return;interact();
      if(event.cancelable)event.preventDefault();
      const now=Date.now();if(now-lastWheel>200)wheel=0;lastWheel=now;
      wheel=Math.max(0,wheel+event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1));
      if(wheel>=48)close();
    },{passive:false});
    on(window,'keydown',event=>{
      if(!['open','dragging','snapping'].includes(state))return;interact();if(event.ctrlKey||event.metaKey||event.altKey)return;
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
    on(document,'visibilitychange',()=>{intro.dataset.paused=String(document.hidden);if(document.hidden){pause();if(drag)reset();if(state==='closing')finish(false);}else arm();});
    on(window,'pagehide',()=>finish(false));
    on(window,'pageshow',event=>{if(event.persisted)finish(false);});
    state='open';intro.hidden=false;intro.dataset.state='open';intro.dataset.paused=String(document.hidden);site.inert=true;
    root.classList.add('intro-locked');document.body.classList.add('intro-locked');
    intro.focus({preventScroll:true});arm();
  } catch { finish(false); }
})();
