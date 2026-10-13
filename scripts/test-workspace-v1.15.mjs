/* Explicitly distinguishes recommendation metadata from source business values. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const read=file=>readFile(new URL('../'+file,import.meta.url),'utf8');
const [html,app,css,recommendations,footers]=await Promise.all(['preview/index.html','preview/preview.js','preview/workspace-v1.15.css','preview/recommendations-v1.15.js','preview/view-footers-v1.15.js'].map(read));
const results=[];
async function test(name,run){try{await run();results.push({name,status:'PASS'});}catch(error){results.push({name,status:'FAIL',error:error.message});}}
const window={};vm.runInNewContext(recommendations,{window});
const api=window.RRCC_RECOMMENDATIONS;
await test('Owner six management categories remain metadata, including unfilled lifecycle gap',()=>{
 assert.equal(api.groups.length,6);assert.equal(api.groups.at(-1).cardIds.length,0);
 assert.match(api.groups.at(-1).boundary,/不虛構新卡或數值/);
 assert.match(api.groups.find(group=>group.id==='logistics').scope,/依交易與運輸安排判定/);
 assert.match(api.groups.find(group=>group.id==='procurement').scope,/C2 待評估/);
});
await test('Only twelve confirmed canonical IDs are mapped, and pending slots stay unmapped',()=>{
 for(let i=1;i<=19;i++){const id=`RRCC-KPI-${String(i).padStart(3,'0')}`,mapping=api.forCard({cardId:id});if(i<=12){assert.equal(mapping.cardId,id);assert(mapping.groups.length);assert.match(mapping.basis,/非核准盤查邊界或已驗證/);}else assert.equal(mapping,null);}
 assert.equal(api.forCard({metricId:'materials'}),null);assert.equal(api.forCard({cardId:'TSMC-2025'}),null);
 assert.doesNotMatch(recommendations,/fetch\(|localStorage|RRCC_MERGED|\beval\(/);
});
await test('Leftmost toolbar order is scope, date, export, then latest activity',()=>{
 const toolbar=html.slice(html.indexOf('<section class="workspace-toolbar'),html.indexOf('<button id="right-panel-trigger"'));
 const positions=['id="scope-button"','id="period-select"','id="export-button"','class="toolbar-activity"'].map(token=>toolbar.indexOf(token));
 assert(positions.every(position=>position>=0));assert.deepEqual([...positions].sort((a,b)=>a-b),positions);
 assert.match(css,/\.hero-controls\s*\{[^}]*order:\s*0/);
});
await test('Yellow management suggestions preserve green selected cards and twelve fixed positions',()=>{
 assert.match(css,/\.kpi-card\.recommended:not\(\.selected\)/);
 assert.match(css,/\.kpi-library-master-card\.recommended/);
 assert.match(app,/RRCC_RECOMMENDATIONS\?\.forCard\(k\)/);
 assert.match(app,/黃色卡片：減碳管理建議對照（非已驗證減碳成果）/);
 assert.match(app,/--kpi-count',12/);
});
await test('General notices move to source footer, including nested public references',()=>{
 assert.match(footers,/root\.querySelectorAll\(notices\)/);
 assert.match(footers,/!child\.closest\('\[data-view-source-footer\]'\)/);
 assert.match(footers,/root\.lastElementChild!==footer/);
 assert.match(footers,/viewer\.insertBefore\(viewer\.nextElementSibling,tableFooter\)/);
 assert.match(footers,/normalize\(document\.querySelector\('#right-panel \.right-content'\)\)/);
 assert.doesNotMatch(footers,/innerHTML\s*=|fetch\(|localStorage/);
});
await test('Historical v1.14 complete artifact remains unchanged',async()=>{
 const bytes=await readFile(new URL('../preview/RRCC-Hantang-4-Center-Preview-v1.14.html',import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'afbcc5de7f72e7767373a022d2f4d36a6651fc6523b7d5d137f38bd3fbd58801');
});
console.log(JSON.stringify({suite:'workspace-v1.15',evidenceTier:'NODE_VM_AND_SOURCE_CONTRACTS_NOT_BROWSER',results},null,2));
if(results.some(item=>item.status==='FAIL'))process.exitCode=1;
