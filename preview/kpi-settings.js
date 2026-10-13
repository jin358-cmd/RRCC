/* Browser-local KPI layout preferences; no business data or account writes. */
(() => {
  'use strict';
  const limit=12, storageKey='rrcc-kpi-layout-v1.14', legacyStorageKey='rrcc-kpi-layout-v1', memory={};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const idOf=(card,index)=>card.metricId||String(index);
  function normalize(ids,available,fill=true){
    const valid=[...new Set((Array.isArray(ids)?ids:[]).filter(id=>available.includes(id)))].slice(0,limit);
    if(fill)for(const id of available)if(valid.length<limit&&!valid.includes(id))valid.push(id);
    return valid;
  }
  function move(ids,id,target,index=ids.length){
    const next=ids.filter(x=>x!==id),wasVisible=ids.includes(id);
    if(target==='reserve')return next;
    const position=Math.max(0,Math.min(Number(index)||0,next.length));
    if(!wasVisible&&next.length>=limit){next.splice(Math.min(position,limit-1),1,id);return next;}
    next.splice(position,0,id);return next.slice(0,limit);
  }
  function storageObject(key=storageKey){let parsed;try{parsed=JSON.parse(localStorage.getItem(key)||'{}');}catch{return {};}return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};}
  function read(key){if(Object.hasOwn(memory,key))return memory[key];try{const all=storageObject();return Object.hasOwn(all,key)&&Array.isArray(all[key])?all[key]:undefined;}catch{return undefined;}}
  function write(key,ids){memory[key]=[...ids];try{const all=storageObject();all[key]=ids;localStorage.setItem(storageKey,JSON.stringify(all));return true;}catch{return false;}}
  function visible(center,catalog,mode='demo'){
    const all=catalog.map(idOf),available=all.filter((id,index)=>catalog[index].status!=='PENDING DATA MAPPING'&&!(Object.hasOwn(catalog[index],'formalName')&&!catalog[index].formalName));
    const key=`${mode}/${center}`,saved=read(key);
    let ids;
    if(saved!==undefined)ids=normalize(saved,available,false);
    else{
      const legacy=storageObject(legacyStorageKey)[key];
      ids=normalize(legacy,available,true);
      // Write only the new key: the original six-card preference remains recoverable.
      if(Array.isArray(legacy))write(key,ids);
    }
    return ids.map(id=>all.indexOf(id));
  }
  function slots(center,catalog,mode='demo'){const indices=visible(center,catalog,mode);return Array.from({length:limit},(_,index)=>indices[index]??null);}
  let dialog,context,draft=[],dragged=null,opener;
  function create(){
    if(dialog)return;
    dialog=document.createElement('dialog');dialog.id='kpi-settings-dialog';dialog.className='kpi-settings-page';
    dialog.setAttribute('aria-labelledby','kpi-settings-title');
    document.body.append(dialog);
    dialog.addEventListener('cancel',()=>{dragged=null;});
    dialog.addEventListener('close',()=>{dragged=null;opener?.focus({preventScroll:true});});
    dialog.addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b)return;
      if(b.hasAttribute('data-kpi-cancel')){dialog.close();return;}
      if(b.hasAttribute('data-kpi-reset')){draft=context.available.slice(0,limit);draw('已恢復預設十二張卡片。');return;}
      if(b.hasAttribute('data-kpi-save')){
        const persisted=write(context.key,draft);dialog.close();context.apply(visible(context.center,context.catalog,context.mode),persisted);return;
      }
      const id=b.dataset.kpiId;if(!id)return;
      if(b.dataset.kpiOperation==='remove')draft=move(draft,id,'reserve');
      else if(b.dataset.kpiOperation==='add'){
        const select=dialog.querySelector(`[data-slot-for="${CSS.escape(id)}"]`);
        draft=move(draft,id,'main',draft.length<limit?draft.length:Number(select?.value||0));
      }else if(b.dataset.kpiOperation==='up')draft=move(draft,id,'main',draft.indexOf(id)-1);
      else if(b.dataset.kpiOperation==='down')draft=move(draft,id,'main',draft.indexOf(id)+1);
      draw('已調整配置；請套用設定。');
    });
    dialog.addEventListener('dragstart',event=>{
      const card=event.target.closest('[data-kpi-item]');if(!card)return;
      dragged=card.dataset.kpiItem;event.dataTransfer?.setData('text/plain',dragged);
      if(event.dataTransfer)event.dataTransfer.effectAllowed='move';
      card.classList.add('is-dragging');
    });
    dialog.addEventListener('dragover',event=>{
      const zone=event.target.closest('[data-kpi-zone]');if(!zone||!dragged)return;
      event.preventDefault();zone.classList.add('drag-over');if(event.dataTransfer)event.dataTransfer.dropEffect='move';
    });
    dialog.addEventListener('dragleave',event=>{const zone=event.target.closest('[data-kpi-zone]');if(zone&&!zone.contains(event.relatedTarget))zone.classList.remove('drag-over');});
    dialog.addEventListener('drop',event=>{
      const zone=event.target.closest('[data-kpi-zone]'),id=dragged;if(!zone||!context.available.includes(id))return;
      event.preventDefault();
      const target=event.target.closest('[data-kpi-item]'),index=target?draft.indexOf(target.dataset.kpiItem):draft.length;
      draft=move(draft,id,zone.dataset.kpiZone,index<0?draft.length:index);dragged=null;
      draw('拖曳配置已更新；請套用設定。');
    });
    dialog.addEventListener('dragend',()=>{dragged=null;dialog.querySelectorAll('.is-dragging,.drag-over').forEach(n=>n.classList.remove('is-dragging','drag-over'));});
    dialog.addEventListener('keydown',event=>{
      const card=event.target.closest('[data-kpi-item]');if(!card||event.target!==card)return;
      const id=card.dataset.kpiItem;
      if(event.key===' '){event.preventDefault();dragged=dragged===id?null:id;draw(dragged?'已選取卡片；左右鍵切換區域，上下鍵排序，Escape 取消。':'已放下卡片。',id);}
      else if(dragged===id&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
        event.preventDefault();
        if(event.key==='ArrowRight')draft=move(draft,id,'reserve');
        else if(event.key==='ArrowLeft')draft=move(draft,id,'main',draft.includes(id)?draft.indexOf(id):draft.length);
        else if(draft.includes(id))draft=move(draft,id,'main',draft.indexOf(id)+(event.key==='ArrowUp'?-1:1));
        draw('鍵盤移動完成；請套用設定。',id);
      }else if(event.key==='Escape'&&dragged){event.preventDefault();event.stopPropagation();dragged=null;draw('已取消抓取；尚未套用的配置仍保留。',id);}
    });
  }
  function item(id,reserve=false){
    const index=context.catalog.findIndex((card,index)=>idOf(card,index)===id),card=context.catalog[index],position=draft.indexOf(id);
return `<li class="kpi-config-card ${dragged===id?'is-dragging':''}" data-kpi-item="${esc(id)}" draggable="true" tabindex="0" aria-label="${esc(card.label)}，按空白鍵抓取，或使用下方列表按鍵"><div class="kpi-config-top"><span class="drag-grip" aria-hidden="true">⠿</span><span>${reserve?'備用卡片':`位置 ${position+1}`}</span><span class="kpi-config-type">${card.publicReference?'公開參考':'展示指標'}</span></div><h3>${esc(card.label)}</h3><strong>${esc(card.value)} <small>${esc(card.unit)}</small></strong><div class="kpi-config-actions">${reserve?`${draft.length>=limit?`<label>替換位置<select data-slot-for="${esc(id)}" aria-label="${esc(card.label)}替換位置">${draft.map((x,i)=>`<option value="${i}">${i+1} · ${esc(context.catalog.find((card,index)=>idOf(card,index)===x)?.label)}</option>`).join('')}</select></label>`:''}<button type="button" data-kpi-operation="add" data-kpi-id="${esc(id)}">${draft.length>=limit?'替換至主介面':'加入主介面'}</button>`:`<button type="button" data-kpi-operation="up" data-kpi-id="${esc(id)}" ${position===0?'disabled':''} aria-label="上移${esc(card.label)}">↑</button><button type="button" data-kpi-operation="down" data-kpi-id="${esc(id)}" ${position===draft.length-1?'disabled':''} aria-label="下移${esc(card.label)}">↓</button><button type="button" data-kpi-operation="remove" data-kpi-id="${esc(id)}">移至回歸區</button>`}</div></li>`;
  }
  function draw(message='',focusId){
    const reserve=context.available.filter(id=>!draft.includes(id));
    dialog.innerHTML=`<header class="kpi-settings-heading"><div><p>${esc(context.centerLabel)} · 個人化檢視</p><h2 id="kpi-settings-title">KPI 卡片設定</h2></div><button type="button" data-kpi-cancel aria-label="返回 Dashboard">返回 Dashboard ×</button></header><p class="kpi-settings-help">主介面固定上方 6 格、下方 6 格，最多顯示 12 張卡片。拖曳調整順序或移至回歸區；也可使用列表按鍵。移除後保留空位，不自動補入其他卡片。加入時若已滿十二張，請選擇替換位置。數據與其他區塊不會被刪除。</p><div class="kpi-settings-columns"><section class="kpi-drop-zone" data-kpi-zone="main" aria-label="主介面區"><h3>主介面區 <span>${draft.length} / ${limit}</span></h3><ol class="kpi-config-list">${draft.map(id=>item(id)).join('')}</ol>${draft.length<limit?'<div class="kpi-empty-slot">拖曳備用卡片到這裡，或使用「加入主介面」</div>':''}</section><section class="kpi-drop-zone reserve-zone" data-kpi-zone="reserve" aria-label="回歸區"><h3>回歸區 <span>${reserve.length} 張備用</span></h3><ul class="kpi-config-list">${reserve.map(id=>item(id,true)).join('')}</ul><p>將主介面卡片移回此區暫存；不會刪除指標。</p></section></div><footer class="kpi-settings-foot"><div role="status" aria-live="polite" id="kpi-settings-status">${esc(message||'設定只儲存在目前瀏覽器，不影響其他使用者。')}</div><button type="button" data-kpi-reset>恢復預設</button><button type="button" data-kpi-cancel>取消</button><button type="button" data-kpi-save class="primary-button">套用 ${draft.length} 張卡片</button></footer>`;
    if(focusId)dialog.querySelector(`[data-kpi-item="${CSS.escape(focusId)}"]`)?.focus({preventScroll:true});
  }
  window.RRCC_KPI_SETTINGS=Object.freeze({version:'v1.14',limit,maxVisible:limit,storageKey,legacyStorageKey,normalize,move,visible,slots,open(center,catalog,{mode='demo',centerLabel=center,apply}={}){create();opener=document.activeElement;const all=catalog.map(idOf),available=all.filter((id,index)=>catalog[index].status!=='PENDING DATA MAPPING'&&!(Object.hasOwn(catalog[index],'formalName')&&!catalog[index].formalName));context={center,catalog,available,mode,centerLabel,key:`${mode}/${center}`,apply:apply||(()=>{})};draft=visible(center,catalog,mode).map(i=>all[i]);dragged=null;draw();dialog.showModal();}});
})();
