/* RRCC panel lifecycle. Content commits only after the previous return completes. */
(() => {
  'use strict';
  // Owner setting: keep Genie return-to-source animation enabled.
  // Set false only when explicitly disabling the effect; preserve the implementation.
  window.RRCC_GENIE_ENABLED = true;
  class RightPanelMotion {
    constructor({panel,stage,layout,trigger,commit}) {
      Object.assign(this,{panel,stage,layout,trigger,commit});
      this.phase='closed';this.metric=0;this.source=null;this.desired=null;this.serial=0;
      this.returnHandle=null;this.slide=null;
      this.sync();
      window.addEventListener('resize',()=>this.settle());
    }
    sourceElement(source=this.source) {return document.getElementById(source?.id)||this.trigger;}
    sync() {
      const closed=this.phase==='closed';
      this.layout.classList.toggle('right-closed',closed);
      this.panel.hidden=closed;this.panel.inert=closed||this.phase==='closing';
      this.panel.setAttribute('aria-hidden',String(closed));
      Object.assign(this.panel.dataset,{motion:this.phase,metric:String(this.metric),source:this.source?.id||'',pending:this.desired?String(this.desired.metric):''});
      this.trigger.setAttribute('aria-expanded',String(!closed));
      this.trigger.setAttribute('aria-hidden',String(!closed));this.trigger.tabIndex=closed?0:-1;
      this.trigger.classList.toggle('available',closed);
      document.querySelectorAll('#kpis [data-metric]').forEach(b=>{
        const selected=!closed&&Number(b.dataset.metric)===this.metric;
        b.classList.toggle('selected',selected);b.setAttribute('aria-expanded',String(selected));
        b.setAttribute('aria-controls','right-panel');
      });
    }
    cancel() {
      ++this.serial;this.returnHandle?.cancel();this.returnHandle=null;
      this.slide?.cancel();this.slide=null;
      this.panel.style.opacity='';this.panel.style.transform='';this.panel.style.pointerEvents='';
    }
    reset(metric,source) {
      this.cancel();this.metric=metric;this.source=source;this.desired=null;
      this.phase='closed';this.sync();
    }
    request(metric,source) {
      if(metric===this.metric&&this.phase!=='closed') {
        // Clicking A during A→B invalidates the queued B as well as the return.
        this.desired=null;
        if(this.phase==='closing'){this.cancel();this.phase='open';this.sync();this.prepare();}
        return;
      }
      this.desired={metric,source};
      if(this.phase==='closed')this.open(this.desired);
      else if(this.phase!=='closing')this.closeCurrent();
      else this.sync();
    }
    close() {
      this.desired=null;
      if(this.phase==='closed')return;
      if(this.phase==='closing'){this.sync();return;}
      this.closeCurrent();
    }
    prepare() {if (window.RRCC_GENIE_ENABLED) window.RRCC_GENIE?.prepare(this.panel);}
    open(intent) {
      this.cancel();this.desired=null;this.metric=intent.metric;this.source=intent.source;
      this.phase='opening';this.sync();this.commit(this.metric);
      const token=this.serial;
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.slide=this.panel.animate([{transform:'translateX(72px)',clipPath:'inset(0 0 0 60%)'},{transform:'translateX(0)',clipPath:'inset(0)'}],{duration:reduced?0:300,easing:'cubic-bezier(.2,.8,.25,1)'});
      this.slide.finished.then(()=>{
        if(token!==this.serial)return;
        this.slide=null;this.phase='open';this.sync();this.prepare();
      },()=>{});
    }
    closeCurrent() {
      this.cancel();const token=this.serial;
      const anchor=this.sourceElement(),r=anchor.getBoundingClientRect();
      Object.assign(this.panel.dataset,{lastSource:this.source?.id||anchor.id,returnX:String(r.x+r.width/2),returnY:String(r.y+r.height/2)});
      this.phase='closing';this.sync();
      const complete=()=>{
        if(token!==this.serial)return;
        const stats=window.RRCC_GENIE?.stats();
        if(stats){this.panel.dataset.lastFlight=JSON.stringify(stats);this.panel.dataset.renderer=stats.renderer;}
        this.returnHandle=null;this.phase='closed';this.sync();
        const intent=this.desired;if(intent)this.open(intent);
      };
      try {
        if(window.RRCC_GENIE_ENABLED && window.RRCC_GENIE)this.returnHandle=window.RRCC_GENIE.animate(this.panel,anchor,complete);
        else {this.panel.dataset.renderer=window.RRCC_GENIE_ENABLED?'module-unavailable':'genie-disabled';complete();}
      }catch(error){this.panel.dataset.motionError=String(error);complete();}
    }
    settle() {
      if(!['opening','closing'].includes(this.phase))return;
      const intent=this.desired,closing=this.phase==='closing';this.cancel();this.desired=null;
      if(intent){this.metric=intent.metric;this.source=intent.source;this.commit(this.metric);this.phase='open';}
      else this.phase=closing?'closed':'open';
      this.sync();if(this.phase==='open')this.prepare();
    }
  }
  window.RightPanelMotion=RightPanelMotion;
})();
