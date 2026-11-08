(() => {
  'use strict';
  const original = document.getElementById('scope-button');
  const source = document.getElementById('project-select');
  if (!original || !source) return;
  const style = document.createElement('style');
  style.textContent = `#stage #right-panel{top:0;right:0;width:clamp(400px,38vw,720px);max-width:calc(100vw - var(--rail-width,64px));height:100dvh;max-height:100dvh;border-radius:0;z-index:90}
    #stage #right-panel .right-heading{position:sticky;top:0}
    #stage .right-panel-trigger{top:calc(var(--header-height,92px) + 1rem)}
    #rrcc-scope-select{max-width:min(320px,45vw);min-height:42px;cursor:pointer;color:#244768;background-color:#fff}
    @media(max-width:640px){#stage #right-panel{top:0;height:100dvh;max-height:100dvh;width:calc(100vw - var(--rail-width,64px))}}`;
  document.head.append(style);
  const select = document.createElement('select');
  select.id='rrcc-scope-select';select.className='filter-button';select.setAttribute('aria-label','選擇資料範圍');
  original.hidden = true; original.style.display='none'; original.after(select);
  function sync(){
    const options=[...source.options];
    if(select.options.length!==options.length || options.some((o,i)=>select.options[i]?.value!==o.value || select.options[i]?.textContent!==o.textContent)){
      select.replaceChildren(...options.map(o=>new Option(o.textContent,o.value)));
    }
    const label=original.textContent.trim();
    const match=options.find(o=>o.textContent.trim()===label);
    select.value=match?.value || source.value || 'all';
  }
  select.addEventListener('change',()=>{source.value=select.value;source.dispatchEvent(new Event('change',{bubbles:true}));});
  new MutationObserver(sync).observe(original,{childList:true,subtree:true,characterData:true});
  new MutationObserver(sync).observe(source,{childList:true,subtree:true});
  sync();
})();
