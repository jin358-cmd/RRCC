/* v1.9 application integration source contracts; not browser/native pointer evidence. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../preview/preview.js',import.meta.url),'utf8');
const section=(begin,end)=>app.slice(app.indexOf(begin),app.indexOf(end,app.indexOf(begin)+begin.length));
const checks=[];
const test=(name,run)=>{try{run();checks.push({name,status:'PASS'});}catch(error){checks.push({name,status:'FAIL',error:error.message});}};
test('Library previews and rollback refresh the actual Dashboard while saved preferences remain central',()=>{
  const body=section('function openLibrary(){',"$('search-button').innerHTML");
  assert.match(body,/preview:\(\)=>render\(true\),finish:\(\)=>render\(true\)/);
  assert.match(body,/RRCC_KPI_LIBRARY\.open\(state\.center,current\(\)\.kpis,\{mode:layoutMode\(\)/);
  assert.match(app,/function layoutMode\(\).*isTsmc\(\)\?`\$\{window\.RRCC_TSMC\.mode\}-\$\{state\.period\}`:window\.RRCC_DATA_MODE/);
  assert.match(section('function render(resetPanel=false)', 'function switchCenter('),/RRCC_KPI_LIBRARY\?\.refreshDashboard\(\)/);
});
test('Center, mode and new modal workflows discard an unsaved editor before changing context',()=>{
  for(const [start,end]of[['function switchCenter(','function dialog('],['function dialog(','function sourceDialog('],['function setDataMode(','$(\'data-mode-toggle\')'],['function openSearch()','function openLibrary(){']]){
    assert.match(section(start,end),/RRCC_KPI_LIBRARY\?\.cancelEditing\(\)/);
  }
  assert.ok(section('function switchCenter(','function dialog(').indexOf('cancelEditing()')<section('function switchCenter(','function dialog(').indexOf('state.center=id'));
});
test('Filter values are captured before rollback rerenders their select nodes',()=>{
  for(const [id,key]of[['project-select','project'],['period-select','period']]){
    const line=app.split('\n').find(line=>line.includes(`$('${id}').addEventListener('change'`));
    assert.ok(line.indexOf(`const ${key}=e.target.value`)<line.indexOf('cancelEditing()'));
    assert.ok(line.includes(`state.${key}=${key}`));
  }
});
test('Editing card clicks do not open a competing KPI detail panel',()=>{
  const route=app.split('\n').find(line=>line.includes('if(b.dataset.metric!==undefined)'));
  assert.match(route,/if\(document\.body\.classList\.contains\('kpi-layout-editing'\)\)return;/);
  assert.ok(route.indexOf('kpi-layout-editing')<route.indexOf('panelMotion.request'));
});
console.log(JSON.stringify({suite:'v1.9 KPI editor integration',evidenceTier:'STATIC_SOURCE_CONTRACT_NOT_BROWSER',checks},null,2));
if(checks.some(check=>check.status!=='PASS'))process.exitCode=1;
