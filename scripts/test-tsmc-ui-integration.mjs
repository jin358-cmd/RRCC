/* Authored source + isolated annual-label contracts, not browser acceptance. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=read('preview/preview.js'), html=read('preview/index.html');
const section=(start,end)=>app.slice(app.indexOf(start),app.indexOf(end,app.indexOf(start)+start.length));
const checks=[];
const test=(name,check)=>{try{check();checks.push({name,status:'PASS'});}catch(error){checks.push({name,status:'FAIL',error:error.message});}};
test('Scope precedes date in DOM and annual/monthly select options are explicit',()=>{
 const toolbar=html.slice(html.indexOf('<section class="workspace-toolbar'),html.indexOf('<section id="sustainability-context'));
 assert.ok(toolbar.indexOf('id="scope-button"')<toolbar.indexOf('id="period-select"'));
 assert.match(app,/periods=annual\?window\.RRCC_TSMC\.years:window\.RRCC_DATA_MONTHS/);
 assert.match(app,/annual\?'選擇公開報告年度':'選擇月份'/);
 assert.match(html,/id="sustainability-context"/);
 assert.match(app,/同頁併列、來源分離/);
});
test('One preference namespace is used consistently by main, Library and panel requests',()=>{
 assert.match(app,/function layoutMode\(\).*isTsmc\(\)\?`\$\{window\.RRCC_TSMC\.mode\}-\$\{state\.period\}`:window\.RRCC_DATA_MODE/);
 assert.equal((app.match(/visible\(state\.center,[^\n]+?layoutMode\(\)/g)||[]).length,3);
 assert.match(app,/RRCC_KPI_LIBRARY\.open\(state\.center,current\(\)\.kpis,\{mode:layoutMode\(\)/);
});
test('Public source routing precedes active Demo lookup and CSV is labeled PUBLIC_REFERENCE',()=>{
 const source=section('function sourceDialog(', 'function openDetail(');
 assert.ok(source.indexOf("prov?.dataset==='public-reference'")<source.indexOf('const dataset=isPresentation()'));
 assert.match(section('function exportCSV(', 'function openActivity('),/dataset==='public-reference'\?'PUBLIC_REFERENCE'/);
 assert.match(app,/sourceTag==='PUBLIC_REFERENCE'\?'':'_DEMO'/);
 assert.match(app,/if\(isTsmc\(\)\|\|isPresentation\(\)\)\{/);
});
test('Annual chart uses full years and single observations cannot produce invalid spark paths',()=>{
 const context=vm.createContext({state:{center:'overview',period:'2025'},escape:String});
 vm.runInContext(section('function renderTrend(', 'function renderMaterialFlow(')+';this.chart=renderTrend;',context);
 const svg=context.chart({annual:true,title:'年度',months:['2024','2025'],bars:[284.6,318.94],line:[null,null],previous:[null,null],ticks:[0,200,400],max:400,unit:'百萬 m³',legend:['公開原值']});
 assert.match(svg,/>2024<\/text>/);assert.match(svg,/>2025<\/text>/);assert.doesNotMatch(svg,/24月|25月|2026/);
 assert.match(section('function spark(', 'function selectedRight('),/if\(values\.length<2/);
});
console.log(JSON.stringify({suite:'v1.10 public reference UI integration',evidenceTier:'STATIC_SOURCE_AND_NODE_VM_NOT_BROWSER',checks},null,2));
if(checks.some(check=>check.status==='FAIL'))process.exitCode=1;
