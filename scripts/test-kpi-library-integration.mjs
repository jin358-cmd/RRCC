// Runtime data adapter checks in Node VM. Separate from real Browser interaction evidence.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const load = async file => readFile(new URL(`../${file}`,import.meta.url),'utf8');
const merged=JSON.parse(await load('data/demo/rrcc-hantang-merged-v1-v2.json'));
const fixture=JSON.parse(await load('data/demo/rrcc-hantang-presentation-demo.json'));
const context=vm.createContext({window:{RRCC_MERGED:merged,location:{search:''}},URLSearchParams});
const w=context.window;
vm.runInContext(await load('preview/center-data.js'),context);
const template=JSON.parse(JSON.stringify(w.CENTER_DATA));
vm.runInContext(await load('preview/merged-center-data.js'),context);
w.RRCC_PRESENTATION=fixture;
w.RRCC_PRESENTATION_TEMPLATE=template;
for(const file of ['presentation-center-data.js','reference-data.js','kpi-catalog.js','kpi-library-data.js','kpi-library-binding.js'])vm.runInContext(await load(`preview/${file}`),context);
const before=JSON.stringify(merged),demoBefore=JSON.stringify(fixture),results=[];
const test=(name,fn)=>{try{fn();results.push({name,status:'PASS'});}catch(error){results.push({name,status:'FAIL',error:error.stack});}};
const ids=w.RRCC_KPI_LIBRARY_DATA.registry.cards.filter(c=>c.formalName).map(c=>c.cardId);
test('Registry has 19 unique definitions; only 12 have approved formal names',()=>{
 assert.equal(w.RRCC_KPI_LIBRARY_DATA.registry.cards.length,19);assert.equal(ids.length,12);
 assert.equal(new Set(w.RRCC_KPI_LIBRARY_DATA.registry.cards.map(c=>c.cardId)).size,19);
});
for(const mode of ['demo','source'])for(const period of ['2026-07','2026-08','2026-09',...(mode==='demo'?['2026-10']:[])]){
 test(`${mode}/${period}: all centers share identical canonical card objects without replacing existing 8`,()=>{
  w.RRCC_SET_DATA_MODE(mode);w.RRCC_BIND_DATA(period,'all');
  for(const [center,data]of Object.entries(w.CENTER_DATA)){
   assert.equal(data.kpis.length,20);assert.equal(data.kpis.slice(0,8).every(c=>c.metricId.startsWith(center+'-')),true);
   assert.deepEqual(Array.from(data.kpis.slice(8),c=>c.metricId),Array.from(ids));
   data.kpis.slice(8).forEach((card,i)=>assert.equal(card,w.CENTER_DATA.material.kpis[8+i],`shared ${card.metricId}`));
  }
  w.RRCC_BIND_DATA(period,'all');assert.equal(w.CENTER_DATA.material.kpis.length,20,'repeated bind cannot duplicate references');
 });
}
test('October canonical cards do not borrow September or synthetic business values',()=>{
 w.RRCC_SET_DATA_MODE('demo');w.RRCC_BIND_DATA('2026-10','all');
 for(const c of w.CENTER_DATA.material.kpis.slice(8))assert.equal(c.detail.libraryData.numericValue,null);
});
test('Out-of-source project D cannot borrow a source A/B/C value',()=>{
 w.RRCC_SET_DATA_MODE('demo');w.RRCC_BIND_DATA('2026-09','D');
 for(const c of w.CENTER_DATA.verification.kpis.slice(8))assert.equal(c.detail.libraryData.numericValue,null);
});
test('Original and synthetic datasets are unchanged by every canonical resolution',()=>{
 assert.equal(JSON.stringify(merged),before);assert.equal(JSON.stringify(fixture),demoBefore);
});
const failed=results.filter(r=>r.status==='FAIL');
console.log(JSON.stringify({suite:'RRCC v1.5 shared registry/binder integration',evidenceTier:'NODE_VM_RUNTIME_NOT_BROWSER',total:results.length,passed:results.length-failed.length,failed:failed.length,results},null,2));
if(failed.length)process.exitCode=1;
