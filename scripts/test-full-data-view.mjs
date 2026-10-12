/** Deterministic complete-table contract/event tests. Browser geometry is a separate gate. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../preview/full-data-view.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../preview/full-data-view.css', import.meta.url), 'utf8');
const results = [];
async function test(name, run) {
  try { await run(); results.push({name, status:'PASS'}); }
  catch (error) { results.push({name, status:'FAIL', error:error.stack}); }
}
const flush = () => new Promise(resolve => setImmediate(resolve));

function environment() {
  const events = new Map();
  const document = {addEventListener(type, handler) {events.set(type, handler);}};
  const window = {};
  vm.runInNewContext(source, {window, document, console, Promise}, {filename:'preview/full-data-view.js'});
  class Node {
    constructor(root, attributes = []) {
      this.root = root;
      this.attributes = new Set(attributes);
      this.dataset = {};
      this.innerHTML = '';
      this.textContent = '';
      this.value = '';
      this.disabled = false;
    }
    matches(selector) {return this.attributes.has(selector);}
    closest(selector) {return selector === '[data-full-table]' ? this.root : this.attributes.has(selector) ? this : null;}
  }
  function root(html) {
    const result = new Node(null);
    result.root = result;
    result.dataset.fullTable = html.match(/data-full-table="([^"]+)"/)[1];
    result.slots = new Map();
    for (const selector of ['[data-full-table-body]','[data-full-table-summary]','[data-full-table-range]','[data-full-table-page]','[data-full-table-feedback]']) {
      result.slots.set(selector, new Node(result));
    }
    result.slots.get('[data-full-table-body]').innerHTML = html.match(/<tbody data-full-table-body>([\s\S]*?)<\/tbody>/)[1];
    for (const action of ['previous','next','export']) {
      const button = new Node(result, ['[data-full-table-action]']);
      button.dataset.fullTableAction = action;
      const tag = html.match(new RegExp(`<button[^>]*data-full-table-action="${action}"[^>]*>`))[0];
      button.disabled = tag.includes(' disabled');
      result.slots.set(`[data-full-table-action="${action}"]`, button);
    }
    result.querySelector = selector => {
      assert(result.slots.has(selector), `Unexpected test DOM selector ${selector}`);
      return result.slots.get(selector);
    };
    result.search = new Node(result, ['[data-full-table-search]']);
    result.size = new Node(result, ['[data-full-table-size]']);
    result.size.value = '50';
    return result;
  }
  const dispatch = (type, target) => events.get(type)({type,target});
  return {
    api:window.RRCC_FULL_TABLE,
    render(table, kind = 'external', options = {}) {const html = window.RRCC_FULL_TABLE.render(table,kind,options); return {html, root:root(html)};},
    search(root, value) {root.search.value=value; dispatch('input', root.search);},
    size(root, value) {root.size.value=value; dispatch('change', root.size);},
    click(root, action) {dispatch('click', root.querySelector(`[data-full-table-action="${action}"]`));}
  };
}

function table(count = 205) {
  return {
    title:'材料完整清單',
    columns:['材料 ID','名稱','數量','狀態','原始備註'],
    rows:Array.from({length:count}, (_, index) => [`MAT-${String(index).padStart(4,'0')}`,`材料 ${index}`,index,{type:'badge',text:index % 2 ? '待申報':'完成',tone:'blue'},`完整長字串-${index}-${'精密半導體廠務材料'.repeat(6)}`]),
    provenance:{dataset:'presentation-demo',synthetic:true,collection:'/data/materials',canonicalPointers:['/data/materials']},
    rowProvenance:Array.from({length:count}, (_, index) => ({canonicalPointers:[`/data/materials/${index}`]})),
    sourceTitle:'材料完整清單｜合成 Demo /data/materials'
  };
}
const rowIndices = root => [...root.querySelector('[data-full-table-body]').innerHTML.matchAll(/data-row-index="(\d+)"/g)].map(match => Number(match[1]));
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {Object.values(value).forEach(freeze);Object.freeze(value);}
  return value;
}

await test('API is frozen and defaults to 50 rows while retaining full count/schema metadata', () => {
  const e=environment(), fixture=table(), {html,root}=e.render(fixture);
  assert(Object.isFrozen(e.api));
  assert.equal(typeof e.api.render,'function');
  assert.match(html,/data-total-rows="205" data-original-columns="5"/);
  assert.match(html,/完整資料 205 列 · 5 個原始欄位/);
  assert.equal(rowIndices(root).length,50);
  assert.deepEqual(rowIndices(root),Array.from({length:50},(_,index)=>index));
});
await test('Next/previous preserve original row indices and clamp at the last page', () => {
  const e=environment(), {root}=e.render(table());
  e.click(root,'next'); assert.equal(rowIndices(root)[0],50);
  e.click(root,'next');e.click(root,'next');e.click(root,'next');
  assert.deepEqual(rowIndices(root),[200,201,202,203,204]);
  assert.equal(root.querySelector('[data-full-table-action="next"]').disabled,true);
  e.click(root,'next'); assert.deepEqual(rowIndices(root),[200,201,202,203,204]);
  e.click(root,'previous');assert.equal(rowIndices(root)[0],150);
  assert.equal(root.querySelector('[data-full-table-page]').textContent,'第 4 / 5 頁');
});
await test('100 and all page sizes expose every record rather than dashboard preview rows', () => {
  const e=environment(), fixture=table(), {root}=e.render(fixture);
  e.size(root,'100');assert.equal(rowIndices(root).length,100);
  e.click(root,'next');assert.equal(rowIndices(root)[0],100);
  e.size(root,'all');assert.equal(rowIndices(root).length,205);
  assert.equal(rowIndices(root).at(-1),204);
  assert.equal(root.querySelector('[data-full-table-action="next"]').disabled,true);
});
await test('Search spans all records and filtered row click indices never shift', () => {
  const e=environment(), {root}=e.render(table());
  e.search(root,'MAT-0204');assert.deepEqual(rowIndices(root),[204]);
  assert.match(root.querySelector('[data-full-table-summary]').textContent,/符合搜尋 1 列/);
  assert.match(root.querySelector('[data-full-table-body]').innerHTML,/data-source-row-index="204" data-source-linked="true"/);
  assert.match(root.querySelector('[data-full-table-body]').innerHTML,/data-row="external"/);
});
await test('Search supports NFKC/case normalization and nested badge/person values', () => {
  const e=environment(), fixture=table(3);
  fixture.rows[2]=['ABC-ID','材料',{type:'person',name:'工程師陳宏',role:'驗證'},{type:'badge',text:'合規完成'},null];
  const {root}=e.render(fixture);
  e.search(root,'ａｂｃ－ｉｄ');assert.deepEqual(rowIndices(root),[2]);
  e.search(root,'工程師陳宏');assert.deepEqual(rowIndices(root),[2]);
  e.search(root,'合規完成');assert.deepEqual(rowIndices(root),[2]);
});
await test('Empty search result is not confused with absent source records', () => {
  const e=environment(), {root}=e.render(table(2));
  e.search(root,'不存在的案件');
  assert.equal(rowIndices(root).length,0);
  assert.match(root.querySelector('[data-full-table-body]').innerHTML,/沒有符合搜尋條件/);
  assert.equal(root.querySelector('[data-full-table-range]').textContent,'顯示 0 列');
  e.search(root,'');assert.deepEqual(rowIndices(root),[0,1]);
});
await test('Genuine missing records stay empty, with no fabricated values', () => {
  const e=environment(), {html,root}=e.render({title:'無資料案件',columns:['案件'],rows:[],provenance:{collection:'/data/cases'}});
  assert.equal(rowIndices(root).length,0);
  assert.match(html,/原始資料未提供紀錄；未使用參考數據補造案件/);
  assert.match(html,/完整資料 0 列 · 1 個原始欄位/);
  assert.match(html,/原始／整合資料/);
});
await test('Duplicate references preserve separate original indices, not Array.indexOf aliases', () => {
  const e=environment(), repeated=['同一物件','同一內容'];
  const {root}=e.render({columns:['ID','描述'],rows:[repeated,repeated]});
  assert.deepEqual(rowIndices(root),[0,1]);
});
await test('Frozen input records/schema/provenance remain unchanged through all interactions', async () => {
  const e=environment(), fixture=freeze(table()), before=JSON.stringify(fixture);
  let exported;
  const {root}=e.render(fixture,'table',{onExport:value=>{exported=value;}});
  e.click(root,'next');e.search(root,'MAT-0204');e.size(root,'all');e.click(root,'export');await flush();
  assert.equal(exported,fixture);
  assert.equal(JSON.stringify(fixture),before);
  assert.equal(fixture.rows[204][0],'MAT-0204');
});
await test('Custom cell renderer receives original object references and renders exact values', () => {
  const e=environment(), object={type:'badge',text:'原始狀態'}, seen=[];
  const {html}=e.render({columns:['狀態'],rows:[[object]]},'table',{cell:value=>{seen.push(value);return `<span>${value.text}</span>`;}});
  assert.equal(seen[0],object);assert.match(html,/>原始狀態<\/span>/);
});
await test('Missing values preserve null/undefined/empty distinctions instead of inventing zero', () => {
  const e=environment(), {html}=e.render({columns:['null','missing','empty','zero'],rows:[[null,undefined,'',0]]});
  assert.match(html,/未提供（null）/);assert.match(html,/原始資料沒有此欄位；不是 0/);
  assert.match(html,/原始值為空字串/);assert.match(html,/<td><span>0<\/span><\/td>/);
});
await test('Unknown objects or failing cell renderers retain full readable source values', () => {
  const e=environment(), object={formalId:'LONG-ID-123',value:161.0,unit:'公升／12 吋晶圓當量光罩層'};
  const {html}=e.render({columns:['完整來源'],rows:[[object]]},'table',{cell:()=>{throw Error('unsupported');}});
  assert.match(html,/LONG-ID-123/);assert.match(html,/公升／12 吋晶圓當量光罩層/);
  assert.match(html,/full-table-object/);
});
await test('Extra fields and incomplete schemas are fully surfaced without source rewrite', () => {
  const e=environment(), fixture=freeze({title:'來源結構',columns:['ID'],rows:[['A',123,'未命名附加原值'],['B']]});
  const before=JSON.stringify(fixture), {html}=e.render(fixture);
  assert.match(html,/原始表格結構含缺欄或未命名欄位/);
  assert.match(html,/未命名原始欄位 3/);assert.match(html,/未命名附加原值/);
  assert.equal(JSON.stringify(fixture),before);
});
await test('Markup escapes source headings/context/IDs while preserving complete text', () => {
  const e=environment(), fixture={title:'<材料>',columns:['<ID>'],rows:[['<script>完整 ID</script>']]};
  const {html}=e.render(fixture,'external" onclick="x',{scope:'<目前案場>'});
  assert.match(html,/&lt;材料&gt;/);assert.match(html,/&lt;script&gt;完整 ID&lt;\/script&gt;/);
  assert.match(html,/目前範圍：&lt;目前案場&gt;/);
  assert.doesNotMatch(html,/<script>| onclick="x/);
});
await test('Source bands distinguish synthetic, public, original, and unlabelled records', () => {
  for (const [provenance,label] of [
    [{dataset:'presentation-demo'},'合成 Demo'],
    [{dataset:'public-reference'},'公開產業參考'],
    [{collection:'/data/rows'},'原始／整合資料'],
    [undefined,'來源未標示']
  ]) {
    const {html}=environment().render({columns:['ID'],rows:[['A']],provenance});assert(html.includes(label));
  }
});
await test('Export always receives the complete original table, not only search/page results', async () => {
  const e=environment(), fixture=table(), calls=[];
  const {root}=e.render(fixture,'external',{onExport:value=>calls.push(value)});
  e.search(root,'MAT-0204');e.click(root,'export');assert.equal(root.querySelector('[data-full-table-action="export"]').disabled,true);await flush();
  assert.equal(calls.length,1);assert.equal(calls[0],fixture);assert.equal(calls[0].rows.length,205);
  assert.match(root.querySelector('[data-full-table-feedback]').textContent,/共 205 列/);
  assert.equal(root.querySelector('[data-full-table-action="export"]').disabled,false);
});
await test('Export failure leaves readable records and can be retried', async () => {
  const e=environment(), {root}=e.render(table(2),'table',{onExport:()=>Promise.reject(Error('download unavailable'))});
  e.click(root,'export');await flush();
  assert.match(root.querySelector('[data-full-table-feedback]').textContent,/匯出未完成/);
  assert.equal(root.querySelector('[data-full-table-action="export"]').disabled,false);
  assert.deepEqual(rowIndices(root),[0,1]);
});
await test('No export callback means an honestly disabled control rather than a fake success', () => {
  const e=environment(), {root}=e.render(table(1));
  assert.equal(root.querySelector('[data-full-table-action="export"]').disabled,true);
  e.click(root,'export');assert.equal(root.querySelector('[data-full-table-feedback]').textContent,'');
});
await test('New dialog render invalidates stale view events and delayed export feedback', async () => {
  const e=environment();let finish, calls=0;
  const older=e.render(table(),'table',{onExport:()=>{calls++;return new Promise(resolve=>{finish=resolve;});}});
  e.click(older.root,'export');await flush();
  const newer=e.render(table(1));
  e.search(older.root,'MAT-0204');e.click(older.root,'next');
  assert.equal(rowIndices(older.root).length,50);assert.equal(rowIndices(newer.root).length,1);
  finish();await flush();
  assert.equal(calls,1);assert.equal(newer.root.querySelector('[data-full-table-feedback]').textContent,'');
});
await test('Invalid page-size values do not corrupt display state', () => {
  const e=environment(), {root}=e.render(table());
  for (const value of ['0','-1','1000000','NaN']) e.size(root,value);
  assert.equal(rowIndices(root).length,50);
  e.click(root,'next');assert.equal(rowIndices(root)[0],50);
});
await test('CSS gives wide constrained dialogs, local scrolling, wrapping, and 16–18px data text', () => {
  assert.match(css,/#detail-dialog\s*\{[^}]*width:\s*min\(1600px, 96vw\)/);
  assert.match(css,/max-height:\s*93dvh/);
  assert.match(css,/#detail-dialog\[open\]\s*\{\s*display:\s*flex/);
  assert.match(css,/\.full-table-scroll\s*\{[^}]*overflow:\s*auto/);
  assert.match(css,/font-size:\s*clamp\(16px, \.9rem, 18px\)/);
  assert.match(css,/white-space:\s*normal/);assert.match(css,/overflow-wrap:\s*anywhere/);
  assert.match(css,/\.person small\s*\{\s*display:\s*block/);
  assert.doesNotMatch(css,/text-overflow:\s*ellipsis/);
  assert.doesNotMatch(source,/\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage/);
});

const failed=results.filter(result=>result.status==='FAIL');
console.log(JSON.stringify({suite:'RRCC v1.5 complete-data table viewer',evidenceTier:'NODE_VM_FAKE_DOM_AND_STATIC_CSS_NOT_BROWSER_ACCEPTANCE',total:results.length,passed:results.length-failed.length,failed:failed.length,results},null,2));
if (failed.length) process.exitCode=1;
