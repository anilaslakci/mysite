// Progressive enhancement: without JS every published article remains accessible.
const buttons=[...document.querySelectorAll('[data-filter]')];
const cards=[...document.querySelectorAll('.blog-list .blog-card')];
function filterBlog(key){
  if(!buttons.some(b=>b.dataset.filter===key))key='all';
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===key)));
  let count=0;cards.forEach(c=>{c.hidden=key!=='all'&&c.dataset.category!==key;if(!c.hidden)count++;});
  const counter=document.querySelector('#result-count');if(counter)counter.textContent=count+(document.documentElement.lang==='en'?(count===1?' article':' articles'):' yazı');
  const empty=document.querySelector('#filter-empty');if(empty)empty.hidden=count!==0;
}
buttons.forEach(b=>b.addEventListener('click',()=>filterBlog(b.dataset.filter)));
if(buttons.length)filterBlog(new URLSearchParams(location.search).get('kategori')||'all');
