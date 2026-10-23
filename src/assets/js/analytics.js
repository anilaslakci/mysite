/* Basic Consent Mode v2: no Google resource exists until analytics is accepted. */
(() => {
  'use strict';
  if (window.siteConsent) return;
  const id = 'G-NFEHG270L2', key = 'mysite-consent-v1', lifetime = 180 * 86400000;
  let allowed = false, loaded = false, configured = false, dialog, notice, checkbox, opener;
  const denied = {analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'};
  window.dataLayer = window.dataLayer || [];
  const queue = function () { window.dataLayer.push(arguments); };
  window['ga-disable-' + id] = true;
  // An external caller cannot send config/events before consent or after withdrawal.
  window.gtag = function () { if (allowed) queue.apply(null, arguments); };
  queue('consent', 'default', {...denied});
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      if (value && value.version === 1 && typeof value.analytics === 'boolean' && Number.isFinite(value.at) && value.at <= Date.now() && Date.now() - value.at < lifetime) return value;
    } catch { /* Storage denied/malformed: fail closed. */ }
    return null;
  }
  function clearCookies() {
    const domains = ['', location.hostname];
    const parts = location.hostname.split('.');
    for (let i=0;i<parts.length-1;i++) domains.push('.'+parts.slice(i).join('.'));
    const paths = new Set(['/']);
    const segments = location.pathname.split('/').filter(Boolean);
    for (let i=1;i<=segments.length;i++) { paths.add('/'+segments.slice(0,i).join('/')); paths.add('/'+segments.slice(0,i).join('/')+'/'); }
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^(_ga(?:_|$)|_gid$|_gat(?:_|$))/.test(name)) continue;
      for (const domain of domains) for (const path of paths) document.cookie = name + '=;Max-Age=0;path=' + path + (domain ? ';domain='+domain : '') + ';SameSite=Lax';
    }
  }
  function enable() {
    allowed = true;
    window['ga-disable-' + id] = false;
    if (loaded) return;
    loaded = true;
    queue('consent','update',{...denied, analytics_storage:'granted'});
    queue('js',new Date());
    const script = document.createElement('script');
    script.id = 'site-ga4'; script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    script.onload = () => {
      // User may withdraw while the network request is still in flight.
      if (!allowed || configured) return;
      configured = true;
      queue('config',id,{allow_google_signals:false,allow_ad_personalization_signals:false});
    };
    document.head.append(script);
  }
  function disable() {
    allowed = false;
    window['ga-disable-' + id] = true;
    clearCookies();
    // A loaded tag can issue consent-only pings. Do not deliver it a denied update:
    // discard its runtime by reloading; the next document establishes denied defaults.
    if (loaded) { document.getElementById('site-ga4')?.remove(); location.reload(); }
  }
  function save(value) {
    try { localStorage.setItem(key,JSON.stringify({version:1,analytics:value,at:Date.now()})); } catch { /* Current page still honors the choice; no persistence without storage. */ }
    if (notice) notice.hidden = true;
    if (dialog?.open) dialog.close();
    if (value) enable(); else disable();
  }
  const en = document.documentElement.lang === 'en';
  const copy = en ? {
    title:'Your cookie preferences', text:'Optional Google Analytics helps measure visits. It stays off until you accept. Rejecting does not affect the site.', accept:'Accept all',reject:'Reject',manage:'Manage preferences',save:'Save preferences',close:'Close',essential:'Necessary preference storage (always active)',analytics:'Allow Analytics',policy:'Only your choice is stored on this device for up to 180 days. If allowed, Google Analytics uses first-party cookies to measure visits and page views. No advertising tags are enabled. You can withdraw consent using Cookie preferences in the footer. Withdrawal reloads this page and removes accessible Analytics cookies.'
  } : {
    title:'Çerez tercihleriniz',text:'İsteğe bağlı Google Analytics ziyaretleri ölçmeye yardımcı olur. Siz kabul edene kadar kapalıdır. Reddetmeniz sitenin çalışmasını etkilemez.',accept:'Tümünü Kabul Et',reject:'Reddet',manage:'Tercihleri Yönet',save:'Tercihleri Kaydet',close:'Kapat',essential:'Zorunlu tercih kaydı (her zaman etkin)',analytics:'Analytics ölçümüne izin ver',policy:'Yalnızca tercihiniz bu cihazda en fazla 180 gün saklanır. İzin verirseniz Google Analytics ziyaretleri ve sayfa görüntülemelerini ölçmek için birinci taraf çerezler kullanır. Reklam etiketi etkin değildir. Footer’daki Çerez Tercihleri ile onayınızı geri çekebilirsiniz. Geri çekme sayfayı yeniler ve erişilebilen Analytics çerezlerini temizler.'
  };
  function showPreferences(event) {
    opener = event?.currentTarget || document.activeElement;
    checkbox.checked = allowed;
    dialog.showModal();
  }
  function ui() {
    notice = document.createElement('section');
    notice.className='consent-notice'; notice.dataset.consentUi='';
    notice.setAttribute('aria-labelledby','consent-notice-title');
    notice.innerHTML=`<h2 id="consent-notice-title">${copy.title}</h2><p>${copy.text}</p><div class="consent-actions"><button type="button" data-consent-accept>${copy.accept}</button><button type="button" data-consent-reject>${copy.reject}</button><button type="button" data-consent-manage>${copy.manage}</button></div>`;
    notice.hidden=!!read();
    document.body.prepend(notice);
    dialog=document.createElement('dialog');dialog.className='consent-dialog';dialog.dataset.consentUi='';
    dialog.setAttribute('aria-labelledby','consent-dialog-title');dialog.setAttribute('aria-describedby','consent-policy');
    dialog.innerHTML=`<h2 id="consent-dialog-title">${copy.title}</h2><p id="consent-policy">${copy.policy}</p><p>${copy.essential}</p><label><input type="checkbox" id="consent-analytics">${copy.analytics}</label><div class="consent-actions"><button type="button" data-consent-save>${copy.save}</button><button type="button" data-consent-reject>${copy.reject}</button><button type="button" data-consent-close>${copy.close}</button></div>`;
    document.body.append(dialog); checkbox=dialog.querySelector('input');
    notice.querySelector('[data-consent-accept]').addEventListener('click',()=>save(true));
    notice.querySelector('[data-consent-manage]').addEventListener('click',showPreferences);
    document.querySelectorAll('[data-cookie-preferences]').forEach(button=>button.addEventListener('click',showPreferences));
    document.querySelectorAll('[data-consent-reject]').forEach(button=>button.addEventListener('click',()=>save(false)));
    dialog.querySelector('[data-consent-save]').addEventListener('click',()=>save(checkbox.checked));
    dialog.querySelector('[data-consent-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('keydown',event=>{
      if(event.key!=='Tab')return;
      const controls=[...dialog.querySelectorAll('input,button')];
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    });
    dialog.addEventListener('close',()=>opener?.focus());
  }
  window.siteConsent = Object.freeze({open:showPreferences});
  const initial=read();
  if(initial?.analytics) enable(); else clearCookies();
  window.addEventListener('storage',event=>{if(event.key===key){const value=read();if(value?.analytics)enable();else disable();if(notice)notice.hidden=!!value;}});
  // History/bfcache may resume a document after another tab withdrew consent.
  window.addEventListener('pageshow',()=>{if(allowed&&!read()?.analytics)disable();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ui,{once:true});else ui();
})();
