/**
 * RRCC v1.8 material-flow integration contracts.
 * Static source checks and one isolated function executed with a minimal fake DOM.
 * No browser, screenshot, native input, animation timing or visual acceptance claim.
 */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const read = file => readFile(new URL(`../preview/${file}`, import.meta.url), 'utf8');
const [app, html, packager, motion, flow, flowCSS] = await Promise.all([
  'preview.js', 'index.html', 'package-preview.mjs', 'chart-motion.js', 'material-flow.js', 'material-flow.css'
].map(read));
const results = [];
function test(name, check) {
  try { check(); results.push({name, status: 'PASS'}); }
  catch (error) { results.push({name, status: 'FAIL', error: error.message}); }
}
function section(text, begin, end) {
  const start = text.indexOf(begin), finish = text.indexOf(end, start + begin.length);
  assert.ok(start >= 0 && finish > start, `missing source section: ${begin} -> ${end}`);
  return text.slice(start, finish);
}
const renderFlow = section(app, 'function renderMaterialFlow()', 'function openMaterialFlowDetails(');
const openFlow = section(app, 'function openMaterialFlowDetails(', 'function renderDonut(');
const renderApp = section(app, 'function render(resetPanel=false)', 'function switchCenter(');
const details = section(app, 'function openDetail(', 'function openSidebar(');
const sourceDialog = section(app, 'function sourceDialog(', 'function openDetail(');
const exportCSV = section(app, 'function exportCSV(', 'function openActivity(');

test('Only RRCC Material Center replaces the trend; public annual scope retains its own renderer', () => {
  assert.match(renderApp, /if\(state\.center==='material'&&!isTsmc\(\)&&window\.RRCC_MATERIAL_FLOW\)renderMaterialFlow\(\);\s*else\s*\{/);
  assert.match(renderApp, /\$\('trend-chart'\)\.innerHTML=renderTrend\(data\.trend\)/);
  assert.match(renderFlow, /if\(state\.center!=='material'\|\|isTsmc\(\)\|\|!flow\)return/);
  assert.match(renderFlow, /工程物料流向圖/);
});

test('Main and detail flow share period/project/mode but use distinct accessible SVG IDs', () => {
  for (const idPrefix of ['material-main', 'material-detail']) {
    assert.ok(app.includes(`flow.render({period:state.period,project:state.project,mode:state.materialFlowMode,idPrefix:'${idPrefix}'})`));
  }
  assert.match(details, /kind==='trend'&&state\.center==='material'&&!isTsmc\(\)&&window\.RRCC_MATERIAL_FLOW/);
  assert.match(details, /data-material-flow-detail data-chart-motion/);
  assert.match(flow, /aria-labelledby="\$\{prefix\}-title \$\{prefix\}-description"/);
});

test('Unrelated KPI rendering preserves identical flow nodes; a changed mode/scope refreshes both hosts', () => {
  const state = {center: 'material', period: '2026-07', project: 'A', materialFlowMode: 'amount'};
  const calls = [], refreshed = [];
  class Host {
    constructor() { this.node = null; this.writes = 0; }
    querySelector(selector) { assert.equal(selector, '[data-material-flow]'); return this.node; }
    set innerHTML(value) {
      const data = JSON.parse(value);
      this.node = {dataset: {flowPeriod: data.period, flowProject: data.project, flowMode: data.mode}};
      this.writes++;
    }
  }
  const main = new Host(), detail = new Host();
  const elements = {
    'trend-chart': main, 'trend-title': {}, 'trend-legend': {},
    'dialog-content': {querySelector: selector => { assert.equal(selector, '[data-material-flow-detail]'); return detail; }}
  };
  const context = vm.createContext({
    state, isTsmc: () => state.project === 'tsmc-public', $: id => elements[id], window: {
      RRCC_MATERIAL_FLOW: {render: options => { calls.push({...options}); return JSON.stringify(options); }},
      RRCC_CHART_MOTION: {refresh: host => refreshed.push(host)}
    }
  });
  vm.runInContext(`${renderFlow}\nthis.renderMaterialFlow=renderMaterialFlow;`, context);
  context.renderMaterialFlow();
  assert.equal(calls.length, 2);
  assert.deepEqual(calls.map(call => call.idPrefix), ['material-main', 'material-detail']);
  const firstMain = main.node, firstDetail = detail.node;
  context.renderMaterialFlow();
  state.metric = 5;
  context.renderMaterialFlow();
  assert.equal(calls.length, 2);
  assert.equal(main.node, firstMain);
  assert.equal(detail.node, firstDetail);
  state.materialFlowMode = 'percent';
  context.renderMaterialFlow();
  assert.equal(calls.length, 4);
  assert.equal(main.node.dataset.flowMode, 'percent');
  assert.equal(detail.node.dataset.flowMode, 'percent');
  state.period = '2026-09';
  state.project = 'all';
  context.renderMaterialFlow();
  assert.equal(calls.length, 6);
  assert.equal(main.node.dataset.flowPeriod, '2026-09');
  assert.equal(detail.node.dataset.flowProject, 'all');
  const count = refreshed.length;
  state.center = 'verification';
  context.renderMaterialFlow();
  assert.equal(calls.length, 6);
  assert.equal(refreshed.length, count, 'other Centers do not touch the material-flow hosts');
  state.center = 'material'; state.project = 'tsmc-public'; state.period = '2025';
  context.renderMaterialFlow();
  assert.equal(calls.length, 6, 'public annual data never receives an RRCC kg material flow');
  assert.equal(refreshed.length, count);
});

test('Full flow detail uses complete-table rows, summary and a source-specific provenance view', () => {
  assert.match(openFlow, /\.details\(\{period:state\.period,project:state\.project,lane\}\)/);
  assert.match(openFlow, /externalTable=\{\.\.\.table,provenance:\{\.\.\.table\.provenance,view:'material-flow-v2'\}/);
  assert.match(openFlow, /rowProvenance:table\.rowProvenance\?\.map\(prov=>\(\{\.\.\.prov,view:'material-flow-v2'\}\)\)/);
  assert.match(openFlow, /openDetail\('external'\)/);
  assert.match(openFlow, /insertAdjacentHTML\('afterbegin',flow\.summary\)/);
  assert.match(details, /RRCC_FULL_TABLE\.render\(t,kind,\{cell,scope:[\s\S]+onExport:exportCSV\}/);
  assert.doesNotMatch(openFlow, /slice\(|previewLimit|RRCC_ACTIVE_DATASET/);
});

test('V2 source detail resolves canonical pointers before generic/demo source routing', () => {
  const v2Branch = sourceDialog.indexOf("if(prov?.view==='material-flow-v2')");
  const genericBranch = sourceDialog.indexOf("const dataset=isPresentation()?window.RRCC_ACTIVE_DATASET:window.RRCC_MERGED");
  assert.ok(v2Branch >= 0 && genericBranch > v2Branch);
  const branch = sourceDialog.slice(v2Branch, sourceDialog.indexOf("if(prov?.dataset==='canonical-v1-v2'"));
  assert.match(branch, /const canonical=window\.RRCC_MERGED/);
  assert.match(branch, /canonicalPointers\|\|\[\]/);
  assert.match(branch, /JSON\.stringify\(\{sources:canonical\.sources,provenance:prov,records\},null,2\)/);
  assert.doesNotMatch(branch, /slice\(0|RRCC_ACTIVE_DATASET/);
  assert.match(details, /detailProvenance\?\.view==='material-flow-v2'/);
  assert.match(details, /JSON\.stringify\(detailProvenance,null,2\)/);
});

test('Amount/percentage, full-detail and explicit source-month controls have dedicated routes', () => {
  assert.match(app, /b\.hasAttribute\('data-material-flow-mode'\)\)\{state\.materialFlowMode=b\.dataset\.materialFlowMode==='percent'\?'percent':'amount';renderMaterialFlow\(\);return;/);
  assert.match(app, /b\.hasAttribute\('data-material-flow-details'\)\)\{openMaterialFlowDetails\(\);return;/);
  assert.match(app, /b\.hasAttribute\('data-material-flow-source'\)\)\{setDataMode\('source'\);return;/);
  assert.match(flow, /data-material-flow-source="latest"/);
  assert.match(flow, /未使用合成數據補值/);
});

test('Lane click and Enter/Space invoke the same detail route without blank-close interception', () => {
  assert.match(app, /const lane=event\.target\.closest\('\[data-material-lane\]'\);\s*if\(lane\)\{openMaterialFlowDetails\(lane\.dataset\.materialLane\);return;/);
  assert.match(app, /\['Enter',' '\]\.includes\(e\.key\)&&e\.target\.matches\('\[data-material-lane\]'\)\)\{e\.preventDefault\(\);openMaterialFlowDetails\(e\.target\.dataset\.materialLane\);return;/);
  assert.match(flow, /role="button" tabindex="0" data-material-lane=/);
  assert.match(app, /closest\('#right-panel,dialog,button,a,input,select,textarea,label,summary,\[role="button"\],\[tabindex\],tr\[data-row\]'\)/);
});

test('V2 full-table export is identified as SOURCE even from the presentation Dashboard', () => {
  assert.ok(exportCSV.includes("table.provenance?.view==='material-flow-v2'"));
  assert.match(exportCSV, /table\.provenance\?\.view==='material-flow-v2'\?'SOURCE_V2':isPresentation\(\)\?'SYNTHETIC':'SOURCE'/);
  assert.match(exportCSV, /selectedTable\?\.columns\?selectedTable:data\.table/);
  assert.doesNotMatch(exportCSV, /\.slice\(/);
});

test('Isolated CSV route exports the complete selected source table rather than the active demo table', () => {
  const downloads = [], blobs = [], messages = [];
  const state = {center: 'material', project: 'A', period: '2026-07'};
  const selected = {title: 'V2 完整批次', columns: ['ID', '數值'], rows: [['one', 123.125], ['two', null]], provenance: {view: 'material-flow-v2'}};
  const demo = {title: 'Demo 主表', columns: ['ID', '數值'], rows: [['DEMO_SENTINEL', 999]]};
  const context = vm.createContext({
    state, window: {RRCC_BIND_DATA: () => {}}, current: () => ({table: demo}),
    isPresentation: () => true, toast: message => messages.push(message),
    setTimeout: () => 0,
    Blob: class { constructor(parts, options) { this.parts = parts; this.options = options; blobs.push(this); } },
    URL: {createObjectURL: () => 'blob:isolated-test', revokeObjectURL: () => {}},
    document: {createElement: tag => { assert.equal(tag, 'a'); const anchor = {click() {downloads.push(this.download);}}; return anchor; }}
  });
  const filter = section(app, 'function filteredRows(', 'function tableMarkup(');
  vm.runInContext(`${filter}\n${exportCSV}\nthis.exportCSV=exportCSV;`, context);
  context.exportCSV(selected);
  assert.equal(downloads[0], 'RRCC_material_A_2026-07_SOURCE_V2_DEMO.csv');
  const csv = blobs[0].parts.join('');
  assert.match(csv, /"one","123\.125"/);
  assert.match(csv, /"two","null"/);
  assert.doesNotMatch(csv, /DEMO_SENTINEL/);
  assert.equal(messages.length, 1);
  context.exportCSV();
  assert.equal(downloads[1], 'RRCC_material_A_2026-07_SYNTHETIC_DEMO.csv', 'existing non-flow export label remains unchanged');
});

test('Dedicated flow animation bypasses generic bar transforms and receives its complete reading interval', () => {
  assert.match(motion, /else if \(!root\.querySelector\('\[data-material-flow\]'\)\)\s*\{/);
  assert.match(motion, /root\.querySelector\('\[data-material-flow\]'\) \? 1100 : 720/);
  assert.match(flowCSS, /@keyframes rrcc-flow-read/);
  assert.match(flowCSS, /clip-path:inset\(0 100% 0 0\)/);
  assert.match(flowCSS, /prefers-reduced-motion:reduce/);
  assert.match(flowCSS, /\.material-flow-svg rect\{transform:none!important\}/);
});

test('Authored and self-contained artifacts load identical ordered flow dependencies once', () => {
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"\s+defer><\/script>/g)].map(match => match[1]);
  const styles = [...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)">/g)].map(match => match[1]);
  const declared = name => {
    const match = packager.match(new RegExp(`const\\s+${name}\\s*=\\s*\\[([^\\]]+)\\]`));
    assert.ok(match);
    return [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1]);
  };
  assert.deepEqual(declared('scriptNames'), scripts);
  assert.deepEqual(declared('stylesheetNames'), styles);
  assert.equal(scripts.filter(file => file === 'material-flow.js').length, 1);
  assert.ok(scripts.indexOf('demo-data.js') < scripts.indexOf('material-flow.js'));
  assert.ok(scripts.indexOf('material-flow.js') < scripts.indexOf('chart-motion.js'));
  assert.ok(scripts.indexOf('chart-motion.js') < scripts.indexOf('preview.js'));
  assert.deepEqual(styles.slice(-12), ['material-flow.css', 'interaction-refinement-v1.8.css', 'interaction-refinement-v1.9.css', 'interaction-refinement-v1.10.css', 'interaction-refinement-v1.11.css', 'interaction-refinement-v1.12.css', 'interaction-refinement-v1.13.css', 'sidebar-click-v1.14.css', 'workspace-v1.14.css', 'sidebar-alignment-v1.15.css', 'kpi-drafts-v1.15.css', 'workspace-v1.15.css']);
  assert.match(packager, /RRCC-Hantang-4-Center-Preview-v1\.15\.html/);
});

const failed = results.filter(result => result.status === 'FAIL');
console.log(JSON.stringify({
  suite: 'RRCC v1.8 material-flow integration',
  evidenceTier: 'STATIC_SOURCE_AND_ISOLATED_FAKE_DOM_NOT_BROWSER_ACCEPTANCE',
  total: results.length, passed: results.length - failed.length, failed: failed.length, results
}, null, 2));
if (failed.length) process.exitCode = 1;
