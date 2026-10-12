/** Browser-local KPI settings regression: deterministic fake DOM, not visual/OS drag acceptance. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../preview/kpi-settings.js',import.meta.url),'utf8');

class Element {
  constructor(tag,doc){this.tagName=tag.toUpperCase();this.doc=doc;this.children=[];this.attributes={};this.dataset={};this.listeners={};this.parentNode=null;this.className='';this.open=false;this.value='';this.id='';this.disabled=false;}
  append(node){node.parentNode=this;this.children.push(node);}
  setAttribute(key,value){this.attributes[key]=String(value);if(key==='id')this.id=value;if(key==='class')this.className=value;if(key==='value')this.value=value;if(key==='disabled')this.disabled=true;if(key.startsWith('data-'))this.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(value);}
  hasAttribute(key){return Object.hasOwn(this.attributes,key);}
  getAttribute(key){return this.attributes[key]??null;}
  get classList(){return {add:(...names)=>{this.className=[...new Set([...this.className.split(/\s+/),...names])].join(' ').trim();},remove:(...names)=>{this.className=this.className.split(/\s+/).filter(x=>!names.includes(x)).join(' ');},contains:name=>this.className.split(/\s+/).includes(name)};}
  descendants(){return this.children.flatMap(child=>[child,...child.descendants()]);}
  matches(selector){
    if(selector==='button')return this.tagName==='BUTTON';
    if(selector.startsWith('.'))return this.classList.contains(selector.slice(1));
    const attr=selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    if(attr)return this.hasAttribute(attr[1])&&(attr[2]===undefined||this.getAttribute(attr[1])===attr[2]);
    throw Error(`Unsupported fake selector: ${selector}`);
  }
  closest(selector){for(let n=this;n;n=n.parentNode)if(n.matches(selector))return n;return null;}
  querySelectorAll(selector){const alternatives=selector.split(',');return this.descendants().filter(n=>alternatives.some(s=>n.matches(s)));}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
  contains(node){for(let n=node;n;n=n.parentNode)if(n===this)return true;return false;}
  addEventListener(type,listener){(this.listeners[type]??=[]).push(listener);}
  focus(options){this.doc.activeElement=this;this.focusOptions=options;}
  showModal(){this.open=true;}
  close(){this.open=false;this.emit('close',this);}
  emit(type,target,fields={}){const event={type,target,defaultPrevented:false,propagationStopped:false,preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.propagationStopped=true;},...fields};for(const listener of this.listeners[type]||[])listener(event);return event;}
  set innerHTML(html){
    this.html=html;this.children=[];const stack=[this],voids=['BR','INPUT','META','LINK','IMG'];
    for(const match of html.matchAll(/<\/?([a-zA-Z][\w-]*)([^>]*)>/g)){
      if(match[0].startsWith('</')){if(stack.length>1)stack.pop();continue;}
      const node=new Element(match[1],this.doc);
      for(const a of match[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g))node.setAttribute(a[1],a[2]??'');
      stack.at(-1).append(node);if(!voids.includes(node.tagName)&&!match[0].endsWith('/>'))stack.push(node);
    }
    for(const select of this.descendants().filter(n=>n.tagName==='SELECT'))select.value=select.children.find(n=>n.tagName==='OPTION')?.value||'';
  }
}
function fixture(initial='{}',blocked=false){
  const doc={activeElement:null,createElement:tag=>new Element(tag,doc)};doc.body=new Element('body',doc);doc.activeElement=new Element('button',doc);
  const storage=new Map([['rrcc-kpi-layout-v1',initial]]);const localStorage={getItem:key=>{if(blocked)throw Error('Storage denied');return storage.get(key)||null;},setItem:(key,value)=>{if(blocked)throw Error('Storage denied');storage.set(key,value);}};
  const window={};vm.runInNewContext(source,{window,document:doc,localStorage,CSS:{escape:v=>v}},{filename:'preview/kpi-settings.js'});
  const api=window.RRCC_KPI_SETTINGS,catalog=Array.from({length:8},(_,i)=>({metricId:`c-${i}`,label:`KPI ${i}`,value:i+1,unit:'項'})),applied=[];
  const open=(center='overview',mode='demo')=>{api.open(center,catalog,{mode,centerLabel:center,apply:(...args)=>applied.push(args)});return doc.body.children[0];};
  const dialog=()=>doc.body.children[0];
  const get=selector=>{const found=dialog().querySelector(selector);assert.ok(found,`missing ${selector}`);return found;};
  const click=(op,id)=>{const b=get(id?`[data-kpi-id="${id}"]`:`[data-kpi-${op}]`);const target=id?dialog().querySelectorAll(`[data-kpi-id="${id}"]`).find(n=>n.dataset.kpiOperation===op):b;assert.ok(target);return dialog().emit('click',target);};
  const ids=(zone='main')=>get(`[data-kpi-zone="${zone}"]`).querySelectorAll('[data-kpi-item]').map(n=>n.dataset.kpiItem);
  const drag=(id,zone,targetId)=>{const data={setData(type,value){this.type=type;this.value=value;}};dialog().emit('dragstart',get(`[data-kpi-item="${id}"]`),{dataTransfer:data});const target=targetId?get(`[data-kpi-item="${targetId}"]`):get(`[data-kpi-zone="${zone}"]`);const over=dialog().emit('dragover',target,{dataTransfer:data});const drop=dialog().emit('drop',target,{dataTransfer:data});return {data,over,drop};};
  const key=(id,key)=>dialog().emit('keydown',get(`[data-kpi-item="${id}"]`),{key});
  return {doc,storage,api,catalog,applied,open,dialog,get,click,ids,drag,key};
}
const results=[];
function test(name,run){try{run();results.push({name,status:'PASS'});}catch(error){results.push({name,status:'FAIL',error:error.stack});}}
const plain=v=>JSON.parse(JSON.stringify(v));
test('Default visible catalog contains exactly six stable IDs',()=>{const f=fixture();assert.deepEqual(plain(f.api.visible('overview',f.catalog)),[0,1,2,3,4,5]);f.open();assert.deepEqual(f.ids(),['c-0','c-1','c-2','c-3','c-4','c-5']);assert.deepEqual(f.ids('reserve'),['c-6','c-7']);});
test('Malformed preferences recover defaults and normalize removes unknown and duplicate IDs',()=>{const f=fixture('{bad');assert.deepEqual(plain(f.api.visible('overview',f.catalog)),[0,1,2,3,4,5]);assert.deepEqual(plain(f.api.normalize(['c-2','bad','c-2'],f.catalog.map(c=>c.metricId))),['c-2','c-0','c-1','c-3','c-4','c-5']);});
test('List removal reserves a card and disables apply until a sixth is restored',()=>{const f=fixture();f.open();f.click('remove','c-0');assert.equal(f.ids().length,5);assert.ok(f.ids('reserve').includes('c-0'));assert.equal(f.get('[data-kpi-save]').disabled,true);f.click('save');assert.equal(f.applied.length,0);f.click('add','c-6');assert.equal(f.ids().length,6);assert.equal(f.get('[data-kpi-save]').disabled,false);});
test('List add at capacity swaps the selected slot instead of creating a seventh card',()=>{const f=fixture();f.open();f.get('[data-slot-for="c-7"]').value='2';f.click('add','c-7');assert.deepEqual(f.ids(),['c-0','c-1','c-7','c-3','c-4','c-5']);assert.ok(f.ids('reserve').includes('c-2'));});
test('List up/down reorders without duplication or item loss',()=>{const f=fixture();f.open();f.click('up','c-3');assert.deepEqual(f.ids(),['c-0','c-1','c-3','c-2','c-4','c-5']);f.click('down','c-3');assert.deepEqual(f.ids(),['c-0','c-1','c-2','c-3','c-4','c-5']);});
test('HTML5 drag sends an ID, permits move drop and moves to reserve',()=>{const f=fixture();f.open();const r=f.drag('c-2','reserve');assert.equal(r.data.type,'text/plain');assert.equal(r.data.value,'c-2');assert.equal(r.data.effectAllowed,'move');assert.equal(r.over.defaultPrevented,true);assert.equal(r.drop.defaultPrevented,true);assert.ok(!f.ids().includes('c-2'));assert.ok(f.ids('reserve').includes('c-2'));});
test('HTML5 full-capacity drop swaps the destination slot and retains six',()=>{const f=fixture();f.open();f.drag('c-6','main','c-1');assert.deepEqual(f.ids(),['c-0','c-6','c-2','c-3','c-4','c-5']);assert.ok(f.ids('reserve').includes('c-1'));});
test('HTML5 reorder moves an existing card while retaining the whole selected set',()=>{const f=fixture();f.open();f.drag('c-4','main','c-1');assert.deepEqual(f.ids(),['c-0','c-4','c-1','c-2','c-3','c-5']);});
test('Dragend clears temporary drag and drop classes',()=>{const f=fixture();f.open();const card=f.get('[data-kpi-item="c-0"]'),zone=f.get('[data-kpi-zone="reserve"]');f.dialog().emit('dragstart',card);f.dialog().emit('dragover',zone);assert.equal(card.classList.contains('is-dragging'),true);f.dialog().emit('dragend',card);assert.equal(card.classList.contains('is-dragging'),false);assert.equal(zone.classList.contains('drag-over'),false);});
test('Cancel discards unsaved changes and returns focus to the opener',()=>{const f=fixture(),opener=f.doc.activeElement;f.open();f.click('remove','c-0');f.click('cancel');assert.equal(f.dialog().open,false);assert.equal(f.doc.activeElement,opener);f.open();assert.deepEqual(f.ids(),['c-0','c-1','c-2','c-3','c-4','c-5']);assert.equal(f.applied.length,0);});
test('Save persists ordering and a fresh runtime reads it back',()=>{const f=fixture();f.open();f.click('up','c-4');f.click('save');assert.equal(f.dialog().open,false);assert.equal(f.applied.length,1);assert.equal(f.applied[0][1],true);const other=fixture(f.storage.get('rrcc-kpi-layout-v1'));assert.deepEqual(plain(other.api.visible('overview',other.catalog)),[0,1,2,4,3,5]);});
test('Per-mode and per-Center preferences are isolated',()=>{const f=fixture();f.open('overview','demo');f.click('up','c-3');f.click('save');assert.deepEqual(plain(f.api.visible('overview',f.catalog,'source')),[0,1,2,3,4,5]);assert.deepEqual(plain(f.api.visible('management',f.catalog,'demo')),[0,1,2,3,4,5]);assert.deepEqual(plain(f.api.visible('overview',f.catalog,'demo')),[0,1,3,2,4,5]);});
test('Unavailable storage uses session memory and accurately reports not persisted',()=>{const f=fixture('{}',true);f.open();f.click('up','c-3');f.click('save');assert.equal(f.applied[0][1],false);assert.deepEqual(plain(f.api.visible('overview',f.catalog)),[0,1,3,2,4,5]);});
test('Null-shaped corrupt storage is repaired before save and reload retains the layout',()=>{const f=fixture('null');f.open();f.click('up','c-3');f.click('save');const expected=[0,1,3,2,4,5];assert.deepEqual(plain(f.api.visible('overview',f.catalog)),expected);assert.equal(f.applied[0][1],true);const fresh=fixture(f.storage.get('rrcc-kpi-layout-v1'));assert.deepEqual(plain(fresh.api.visible('overview',fresh.catalog)),expected);});
test('Array-shaped corrupt storage must never claim persistence unless reload reads the saved layout',()=>{const f=fixture('[]');f.open();f.click('up','c-3');f.click('save');const expected=[0,1,3,2,4,5];assert.deepEqual(plain(f.api.visible('overview',f.catalog)),expected);if(f.applied[0][1]){const fresh=fixture(f.storage.get('rrcc-kpi-layout-v1'));assert.deepEqual(plain(fresh.api.visible('overview',fresh.catalog)),expected,'Claimed persisted=true but reload lost preference');}});
test('Keyboard grab then arrows reserves and restores a card while retaining focus',()=>{const f=fixture();f.open();assert.equal(f.key('c-2',' ').defaultPrevented,true);f.key('c-2','ArrowRight');assert.ok(f.ids('reserve').includes('c-2'));assert.equal(f.doc.activeElement.dataset.kpiItem,'c-2');f.key('c-2','ArrowLeft');assert.ok(f.ids().includes('c-2'));assert.equal(f.ids().length,6);});
test('Keyboard up/down changes ordering; Escape cancels the grab without closing settings',()=>{const f=fixture();f.open();f.key('c-2',' ');f.key('c-2','ArrowUp');assert.deepEqual(f.ids(),['c-0','c-2','c-1','c-3','c-4','c-5']);const escape=f.key('c-2','Escape');assert.equal(escape.defaultPrevented,true);assert.equal(escape.propagationStopped,true);assert.equal(f.dialog().open,true);const before=f.ids();f.key('c-2','ArrowDown');assert.deepEqual(f.ids(),before);});
test('Reset prepares default six-card draft but does not save without apply',()=>{const f=fixture();f.open();f.drag('c-7','main','c-2');f.click('reset');assert.deepEqual(f.ids(),['c-0','c-1','c-2','c-3','c-4','c-5']);assert.equal(f.applied.length,0);});
const failed=results.filter(r=>r.status==='FAIL');console.log(JSON.stringify({suite:'RRCC v1.4 KPI settings model/list/drag/keyboard regression',evidenceTier:'NODE_VM_FAKE_DOM_NOT_BROWSER_OR_OS_DRAG_ACCEPTANCE',total:results.length,passed:results.length-failed.length,failed:failed.length,results},null,2));if(failed.length)process.exitCode=1;
