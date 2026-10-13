/** v1.15 provenance remains complete at the bottom of the full-data viewer. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../preview/full-data-view.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../preview/full-data-view.css',import.meta.url),'utf8');
const results=[];
async function test(name,run) {
  try {await run();results.push({name,status:'PASS'});}
  catch (error) {results.push({name,status:'FAIL',error:error.stack});}
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const fixture=(count=205)=>({
  title:'進行中工程案',
  columns:['案場 ID','案場名稱'],
  rows:Array.from({length:count},(_,index)=>[`PROJECT-${index}`,`工程案 ${index}`]),
  provenance:{dataset:'presentation-demo',synthetic:true,collection:'/data/projects'},
  rowProvenance:Array.from({length:count},(_,index)=>({canonicalPointers:[`/data/projects/${index}`,'/data/organizations/0']})),
  sourceTitle:'進行中工程案 · /data/projects + /data/organizations'
});

function environment() {
  const handlers=new Map(),window={};
  vm.runInNewContext(source,{window,document:{addEventListener:(name,handler)=>handlers.set(name,handler)},console,Promise});
  const makeRoot=html=>{
    const slots=new Map();
    const root={
      dataset:{fullTable:html.match(/data-full-table="([^"]+)"/)[1]},
      footer:html.match(/<footer class="full-table-source" data-provenance-footer[\s\S]*?<\/footer>/)?.[0],
      footerWrites:0,
      querySelector(selector) {
        if (selector.includes('provenance') || selector.includes('full-table-source')) {
          throw Error('An update must not remove, move, or rewrite the source footer');
        }
        assert(slots.has(selector),`Unknown selector: ${selector}`);
        return slots.get(selector);
      }
    };
    const node=selectors=>({
      dataset:{},value:'',disabled:false,innerHTML:'',textContent:'',
      matches:selector=>selectors.includes(selector),
      closest(selector) {return selector==='[data-full-table]'?root:selectors.includes(selector)?this:null;}
    });
    for (const selector of ['[data-full-table-body]','[data-full-table-summary]','[data-full-table-range]','[data-full-table-page]','[data-full-table-feedback]']) slots.set(selector,node([]));
    slots.get('[data-full-table-body]').innerHTML=html.match(/<tbody data-full-table-body>([\s\S]*?)<\/tbody>/)[1];
    for (const action of ['previous','next','export']) {
      const button=node(['[data-full-table-action]']);
      button.dataset.fullTableAction=action;
      button.disabled=html.match(new RegExp(`<button[^>]*data-full-table-action="${action}"[^>]*>`))[0].includes(' disabled');
      slots.set(`[data-full-table-action="${action}"]`,button);
    }
    root.search=node(['[data-full-table-search]']);
    root.size=node(['[data-full-table-size]']);
    return root;
  };
  return {
    render(table,options={}) {const html=window.RRCC_FULL_TABLE.render(table,'external',options);return {html,root:makeRoot(html)};},
    search(root,value) {root.search.value=value;handlers.get('input')({target:root.search});},
    size(root,value) {root.size.value=value;handlers.get('change')({target:root.size});},
    click(root,action) {handlers.get('click')({target:root.querySelector(`[data-full-table-action="${action}"]`)});}
  };
}
const indices=root=>[...root.querySelector('[data-full-table-body]').innerHTML.matchAll(/data-row-index="(\d+)"/g)].map(match=>Number(match[1]));

await test('Owner example source band is intact, semantic, and the last section child',()=>{
  const {html,root}=environment().render(fixture(8),{scope:'全部案場'});
  assert.match(root.footer,/aria-label="資料來源與追溯資訊"/);
  assert.match(root.footer,/合成 Demo · 非 RRCC／漢唐實際營運資料/);
  assert.match(root.footer,/進行中工程案 · \/data\/projects \+ \/data\/organizations/);
  assert.match(root.footer,/8 列具來源追溯資訊 · 點選資料列查看所有欄位/);
  assert.equal((html.match(/data-provenance-footer/g)||[]).length,1);
  assert(html.indexOf(root.footer)>html.indexOf('data-full-table-page'));
  assert(html.indexOf(root.footer)>html.indexOf('data-full-table-feedback'));
  assert(html.endsWith(`${root.footer}</section>`));
  assert(html.indexOf('目前範圍：全部案場')<html.indexOf('full-table-toolbar'));
});

await test('Canonical, synthetic, public-reference and unspecified source identities are preserved at footer',()=>{
  for (const [provenance,label] of [
    [{dataset:'canonical-v1-v2'},'V1／V2 原始離線 Demo · 去重來源，非實際營運資料'],
    [{dataset:'presentation-demo'},'合成 Demo · 非 RRCC／漢唐實際營運資料'],
    [{dataset:'public-reference'},'公開產業參考 · 非 RRCC／漢唐營運實績'],
    [{collection:'/data/cases'},'原始／整合資料 · 依現有來源顯示，未補造數值'],
    [undefined,'來源未標示 · 本視窗僅展示傳入資料']
  ]) {
    const table={columns:['ID'],rows:[['A']],provenance,rowProvenance:[null]};
    const {html,root}=environment().render(table);
    assert(root.footer.includes(label));
    assert.match(root.footer,/0 列具來源追溯資訊/);
    assert(html.endsWith(`${root.footer}</section>`));
  }
});

await test('Pagination, full-table search and page-size changes leave footer identity/count unchanged',()=>{
  const env=environment(),table=fixture(),before=JSON.stringify(table),{root}=env.render(table),footer=root.footer;
  env.click(root,'next');assert.equal(indices(root)[0],50);
  env.search(root,'PROJECT-204');assert.deepEqual(indices(root),[204]);
  env.size(root,'all');assert.deepEqual(indices(root),[204]);
  env.search(root,'');assert.equal(indices(root).length,205);
  assert.equal(root.footer,footer);
  assert.match(root.footer,/205 列具來源追溯資訊/);
  assert.equal(JSON.stringify(table),before);
});

await test('Export still receives every original source record with the metadata footer untouched',async()=>{
  const env=environment(),table=fixture(),calls=[],{root}=env.render(table,{onExport:value=>calls.push(value)}),footer=root.footer;
  env.search(root,'PROJECT-204');env.click(root,'export');await flush();
  assert.equal(calls.length,1);assert.equal(calls[0],table);assert.equal(calls[0].rows.length,205);
  assert.match(root.querySelector('[data-full-table-feedback]').textContent,/共 205 列/);
  assert.equal(root.footer,footer);
  assert.equal(root.querySelector('[data-full-table-action="export"]').disabled,false);
});

await test('Missing data remains empty and unsafe source labels are escaped in the footer',()=>{
  const table={columns:['ID'],rows:[],sourceTitle:'<script>alert(1)</script>',rowProvenance:[]};
  const {html,root}=environment().render(table);
  assert.match(html,/原始資料未提供紀錄；未使用參考數據補造案件/);
  assert.match(root.footer,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(root.footer,/<script>/);
  assert.match(root.footer,/0 列具來源追溯資訊/);
});

await test('Footer stays in normal document flow rather than covering or preceding table controls',()=>{
  assert.match(css,/\.full-table-source\s*\{[^}]*margin-top:\s*1rem/);
  assert.match(css,/\.full-data-view > \[data-provenance-footer\]\s*\{[^}]*position:\s*static/);
  assert.doesNotMatch(source,/\bfetch\s*\(|XMLHttpRequest|WebSocket/);
  assert(!css.match(/\.full-table-source\s*\{[^}]*(?:position:\s*(?:absolute|fixed|sticky)|order:\s*-)/));
});

const failed=results.filter(result=>result.status==='FAIL');
console.log(JSON.stringify({suite:'RRCC v1.15 complete-table provenance footer',evidenceTier:'NODE_VM_FAKE_DOM_AND_STATIC_CSS_NOT_BROWSER_ACCEPTANCE',total:results.length,passed:results.length-failed.length,failed:failed.length,results},null,2));
if(failed.length)process.exitCode=1;
