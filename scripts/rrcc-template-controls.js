(() => {
  'use strict';
  const panel = document.querySelector('#sidebar-menu-panel');
  const content = panel?.querySelector('.sidebar-menu-content');
  if (!content) return;
  const style = document.createElement('style');
  style.textContent = `#stage.sidebar-click-navigation .sidebar-menu-panel{left:0;z-index:65;width:min(360px,100vw)}
    #stage.sidebar-click-navigation .sidebar-menu-content :is(.business-nav,.common-nav,.sidebar-library-nav){display:contents}
    #stage.sidebar-click-navigation .sidebar-menu-content .sidebar-separator{display:none}
    .rrcc-template-entry{display:block;width:calc(100% - 24px);margin:18px 12px;padding:12px;border:1px solid #bbd5ec;border-radius:8px;background:#fff;color:#164f83;text-align:left;cursor:pointer}
    #rrcc-template-dialog{width:min(760px,92vw);max-height:85vh;overflow:auto;border:1px solid #bcd2e5;border-radius:14px;padding:22px;color:#1d405e} #rrcc-template-dialog::backdrop{background:#17314f77}
    .rrcc-module-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}.rrcc-module-card{background:#f1f7fd;border:1px solid #bed5ea;border-radius:9px;padding:12px;cursor:grab}.rrcc-module-card button{margin:6px 4px 0 0} .rrcc-template-actions{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.rrcc-module-editor label{display:block;margin:12px 0}.rrcc-module-editor input,.rrcc-module-editor textarea{display:block;width:100%;box-sizing:border-box;padding:8px}.rrcc-template-note{font-size:13px;color:#526c82}`;
  document.head.append(style);
  const key = 'rrcc.template.v1';
  const get = () => {try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
  const put = value => {try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
  const center = () => document.querySelector('#stage')?.dataset.center || 'overview';
  const idOf = b => b.hasAttribute('data-sidebar') ? 'business:'+center()+':'+b.dataset.sidebar : b.hasAttribute('data-common') ? 'common:'+b.dataset.common : 'library';
  const labelOf = b => b.querySelector('.nav-label')?.textContent.trim() || b.dataset.common || b.getAttribute('aria-label') || b.textContent.trim();
  const dialog = document.createElement('dialog'); dialog.id='rrcc-template-dialog';
  document.body.append(dialog);
  let draft=[], dragIndex=null;
  function menus(){return [...content.querySelectorAll('.business-nav button,.common-nav button,.sidebar-library-nav button')];}
  function adjustMenu(){
    const library=content.querySelector('.sidebar-library-nav'); const common=content.querySelector('.common-nav'); const task=common?.querySelector('[data-common="我的任務"]');
    if(library && common && task && task.nextElementSibling!==library) task.after(library);
    const config=get();
    const rank=new Map((config.order?.[center()]||[]).map((id,i)=>[id,i]));
    menus().forEach((button,i)=>{button.style.order=String(rank.has(idOf(button))?rank.get(idOf(button)):i+1000)});
    if(!panel.querySelector('.rrcc-template-entry')){const entry=document.createElement('button');entry.className='rrcc-template-entry';entry.textContent='⚙ 模板功能設定';entry.addEventListener('click',open);panel.append(entry);}
  }
  function open(){
    adjustMenu(); const cfg=get(); const order=cfg.order?.[center()]||[];
    draft=menus().map(b=>({id:idOf(b),name:labelOf(b),...cfg.modules?.[idOf(b)]}));
    draft.sort((a,b)=>(order.indexOf(a.id)<0?9999:order.indexOf(a.id))-(order.indexOf(b.id)<0?9999:order.indexOf(b.id)));
    draw(); dialog.showModal();
  }
  function draw(){
    dialog.replaceChildren(); const title=document.createElement('h2');title.textContent='模板功能設定';dialog.append(title);
    const note=document.createElement('p');note.className='rrcc-template-note';note.textContent='拖曳卡片調整排序，點選「編輯內容」進入模組。預覽資料只保存在這個瀏覽器，尚未連接資料庫。';dialog.append(note);
    const grid=document.createElement('div');grid.className='rrcc-module-grid';
    draft.forEach((item,i)=>{const card=document.createElement('div');card.className='rrcc-module-card';card.draggable=true;card.setAttribute('aria-label',item.name);
      const name=document.createElement('strong');name.textContent=item.name;card.append(name);card.onclick=()=>editModule(i);
      const edit=document.createElement('button');edit.type='button';edit.textContent='編輯內容';edit.onclick=e=>{e.stopPropagation();editModule(i)};card.append(edit);
      for(const [text,delta] of [['↑',-1],['↓',1]]){const btn=document.createElement('button');btn.type='button';btn.textContent=text;btn.setAttribute('aria-label',`${text==='↑'?'上移':'下移'} ${item.name}`);btn.onclick=e=>{e.stopPropagation();let target=i+delta;if(target<0||target>=draft.length)return;[draft[i],draft[target]]=[draft[target],draft[i]];draw()};card.append(btn)}
      card.ondragstart=e=>{dragIndex=i;e.dataTransfer.effectAllowed='move'};card.ondragover=e=>e.preventDefault();card.ondrop=e=>{e.preventDefault();if(dragIndex===null)return;const [m]=draft.splice(dragIndex,1);draft.splice(i,0,m);dragIndex=null;draw()};grid.append(card)});dialog.append(grid);
    const actions=document.createElement('div');actions.className='rrcc-template-actions';const save=document.createElement('button');save.textContent='儲存模板';save.onclick=()=>{const cfg=get();cfg.order??={};cfg.modules??={};cfg.order[center()]=draft.map(x=>x.id);draft.forEach(x=>cfg.modules[x.id]={name:x.name,description:x.description||'',data:x.data||''});if(put(cfg)){adjustMenu();dialog.close()}else alert('無法儲存，請檢查瀏覽器儲存空間。')};const cancel=document.createElement('button');cancel.textContent='取消';cancel.onclick=()=>dialog.close();actions.append(save,cancel);dialog.append(actions);
  }
  function editModule(i){const item=draft[i];dialog.replaceChildren();const form=document.createElement('div');form.className='rrcc-module-editor';const h=document.createElement('h2');h.textContent='編輯模組：'+item.name;form.append(h);
    function field(label,value,multi){const l=document.createElement('label');l.textContent=label;const input=document.createElement(multi?'textarea':'input');input.value=value||'';if(multi)input.rows=7;l.append(input);form.append(l);return input}
    const name=field('模組名稱',item.name,false);const desc=field('功能內容／說明',item.description,true);const data=field('資料內容（可貼上或匯入 JSON／CSV）',item.data,true);
    const upload=document.createElement('input');upload.type='file';upload.accept='.json,.csv,text/csv,application/json';upload.onchange=async()=>{const file=upload.files?.[0];if(!file)return;if(file.size>1000000){alert('預覽檔案上限為 1 MB');return}data.value=await file.text()};form.append(upload);
    const note=document.createElement('p');note.className='rrcc-template-note';note.textContent='僅儲存文字草稿，匯入資料不會寫入 Supabase 或變成正式碳排數據。';form.append(note);
    const back=document.createElement('button');back.textContent='返回模板';back.onclick=()=>{item.name=name.value.trim()||item.name;item.description=desc.value;item.data=data.value;draw()};form.append(back);dialog.append(form)}
  new MutationObserver(adjustMenu).observe(content,{childList:true,subtree:true}); adjustMenu();
})();
