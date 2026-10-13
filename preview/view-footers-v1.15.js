/* Keep explanatory provenance after the readable data, without deleting it. */
(() => {
  'use strict';
  const notices='.audit-banner,.dialog-notice,.public-reference-note,.kpi-library-scope-notice,.kpi-library-isolation-notice';
  function normalize(root) {
    if(!root)return;
    // Details appended by the workflow belong before the full viewer's own footer.
    const viewer=[...root.children].find(child=>child.matches('.full-data-view'));
    const tableFooter=viewer?.querySelector('[data-provenance-footer]');
    if(tableFooter) {
      while(viewer.nextElementSibling&&!viewer.nextElementSibling.matches('[data-view-source-footer]'))viewer.insertBefore(viewer.nextElementSibling,tableFooter);
    }
    const candidates=[...root.querySelectorAll(notices)].filter(child=>!child.closest('[data-view-source-footer]'));
    let footer=[...root.children].find(child=>child.hasAttribute('data-view-source-footer'));
    if(candidates.length&&!footer){footer=document.createElement('footer');footer.className='view-source-footer';footer.setAttribute('data-view-source-footer','');footer.setAttribute('aria-label','資料來源與展示限制');root.append(footer);}
    for(const node of candidates)footer.append(node);
    if(footer&&root.lastElementChild!==footer)root.append(footer);
  }
  function refresh(){
    normalize(document.getElementById('dialog-content'));
    normalize(document.querySelector('#right-panel .right-content'));
    normalize(document.getElementById('kpi-library-dialog'));
  }
  let queued=false;
  const observer=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;refresh();});});
  observer.observe(document.body,{childList:true,subtree:true});
  refresh();
  window.RRCC_VIEW_FOOTERS=Object.freeze({refresh,normalize,destroy:()=>observer.disconnect()});
})();
