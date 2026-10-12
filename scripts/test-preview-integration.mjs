/**
 * Static integration contracts for the authored v1.4 preview sources.
 * These checks do not execute UI code, load a browser, prove visual geometry,
 * verify public-report contents or certify native pointer/touch dragging.
 */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const files = ['index.html', 'package-preview.mjs', 'preview.js', 'kpi-catalog.js', 'kpi-settings.js', 'kpi-settings.css', 'chart-motion.js', 'sidebar.js', 'responsive.css'];
const source = Object.fromEntries(await Promise.all(files.map(async file => [file, await readFile(new URL(`../preview/${file}`, import.meta.url), 'utf8')])));
const html = source['index.html'], app = source['preview.js'];
const results = [];
function test(name, check) {
  try {check(); results.push({name, status: 'PASS'});}
  catch (error) {results.push({name, status: 'FAIL', error: error.message});}
}
function section(text, begin, end) {
  const start = text.indexOf(begin), finish = text.indexOf(end, start + begin.length);
  assert.ok(start >= 0 && finish > start, `missing source section: ${begin} -> ${end}`);
  return text.slice(start, finish);
}
function declaredFiles(variable) {
  const match = source['package-preview.mjs'].match(new RegExp(`const\\s+${variable}\\s*=\\s*\\[([^\\]]+)\\]`));
  assert.ok(match, `missing packaging ${variable}`);
  return [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1]);
}
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"\s+defer><\/script>/g)].map(item => item[1]);
const styles = [...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)">/g)].map(item => item[1]);
const expectedScripts = ['center-data.js', 'demo-data.js', 'presentation-data.js', 'merged-center-data.js', 'presentation-center-data.js', 'reference-data.js', 'kpi-catalog.js', 'kpi-settings.js', 'chart-motion.js', 'genie.js', 'panel-motion.js', 'preview.js', 'sidebar.js'];
const expectedStyles = ['preview.css', 'panel-motion.css', 'sidebar.css', 'presentation-mode.css', 'responsive.css', 'kpi-settings.css', 'chart-motion.css'];

test('Deferred script order binds canonical/demo/reference data before catalog and UI consumers', () => {
  assert.deepEqual(scripts, expectedScripts);
  assert.equal(new Set(scripts).size, scripts.length);
});
test('Stylesheet order retains baseline then applies responsive, green selection and chart lifecycle', () => {
  assert.deepEqual(styles, expectedStyles);
  assert.equal(new Set(styles).size, styles.length);
});
test('Offline packaging embeds exactly the same ordered scripts and styles as index.html', () => {
  assert.deepEqual(declaredFiles('scriptNames'), scripts);
  assert.deepEqual(declaredFiles('stylesheetNames'), styles);
  assert.match(source['package-preview.mjs'], /RRCC-Hantang-4-Center-Preview-v1\.4\.html/);
});
test('Right-panel tab content has one complete wrapper after the persistent tab navigation', () => {
  const right = section(app, 'function renderRight()', 'function applyMetricComparison()');
  assert.match(right, /<\/nav><div class="right-content">\$\{body\}<\/div><\/div><div class="right-collapsed-message">/);
  assert.match(right, /querySelector\('\.right-body'\)\.lastElementChild/);
});
test('Public-reference originalMetric handles null before reading its label', () => {
  const publicContent = section(app, 'if(r.publicReference){', 'function applyMetricComparison()');
  assert.match(publicContent, /const original=r\.publicReference\.originalMetric/);
  assert.match(publicContent, /original\s*&&\s*typeof original\s*===\s*'object'\s*\?\s*original\.label\s*:\s*original/);
});
test('Public reference replaces complete tab content without a fabricated progress bar or monthly chart', () => {
  const publicContent = section(app, 'if(r.publicReference){', 'function applyMetricComparison()');
  assert.match(publicContent, /content\.innerHTML\s*=/);
  assert.match(publicContent, /referenceMarkup\(ids\)/);
  assert.doesNotMatch(publicContent, /right-spark|right-targets|\$\{spark\(|\$\{r\.completion\}/);
  const comparison = section(app, 'function applyMetricComparison()', 'let panelMotion');
  assert.match(comparison, /if\(r\.publicReference\)return;/);
});
test('Public source-dialog routing does not resolve public pointers against the V1/V2 dataset', () => {
  const sourceDialog = section(app, 'function sourceDialog(', 'function openDetail(');
  assert.match(sourceDialog, /if\(prov\?\.dataset==='public-reference'\)\{dialog\([^;]+referenceMarkup\(prov\.referenceIds\)\);return;\}/);
  assert.match(app, /公開產業參考，非 RRCC／漢唐營運數據/);
});
test('Both detailed trend and donut charts are covered by the chart-motion roots', () => {
  const details = section(app, 'function openDetail(', 'function openSidebar(');
  assert.match(details, /class="metric-detail-chart"/);
  assert.match(details, /class="distribution-chart"\s+data-chart-motion/);
  assert.match(source['chart-motion.js'], /const ROOTS\s*=\s*'[^']*\.metric-detail-chart[^']*\[data-chart-motion\]/);
});
test('Dialog chart refresh runs after showModal so hidden-dialog detection cannot skip the first read', () => {
  const dialog = section(app, 'function dialog(', 'function sourceDialog(');
  const show = dialog.indexOf("$('detail-dialog').showModal()");
  const refresh = dialog.indexOf("RRCC_CHART_MOTION?.refresh($('detail-dialog'))");
  assert.ok(show >= 0 && refresh > show);
});
test('Main and right regions explicitly refresh chart lifecycle after rendering/comparison', () => {
  const right = section(app, 'function renderRight()', 'function applyMetricComparison()');
  assert.ok(right.indexOf('applyMetricComparison();') < right.indexOf("RRCC_CHART_MOTION?.refresh($('right-panel'))"));
  assert.match(app, /RRCC_CHART_MOTION\?\.refresh\(document\.querySelector\('\.dashboard-main'\)\)/);
});
test('KPI settings entry is an accessible dialog button and opens the current Center/mode catalog', () => {
  assert.match(html, /<button id="kpi-settings-button"[^>]*aria-label="設定 KPI 卡片"[^>]*aria-haspopup="dialog"/);
  assert.match(app, /RRCC_KPI_SETTINGS\.open\(state\.center,current\(\)\.kpis,\{mode:window\.RRCC_DATA_MODE/);
  assert.match(source['kpi-settings.js'], /dialog\.setAttribute\('aria-labelledby','kpi-settings-title'\)/);
});
test('The six-visible catalog is rendered via saved indices with stable metric IDs', () => {
  assert.match(source['kpi-catalog.js'], /maxVisible:\s*6,\s*availablePerCenter:\s*8/);
  assert.match(source['kpi-settings.js'], /const limit=6/);
  assert.match(app, /visibleMetrics=window\.RRCC_KPI_SETTINGS\?\.visible\(state\.center,data\.kpis,window\.RRCC_DATA_MODE\)/);
  assert.match(app, /\$\('kpis'\)\.innerHTML=visibleMetrics\.map\(i=>/);
  assert.match(app, /data-metric-id="\$\{escape\(k\.metricId\|\|i\)\}"/);
});
test('Settings includes main/reserve drop zones and list/keyboard alternatives with six-card save gate', () => {
  const settings = source['kpi-settings.js'];
  for (const zone of ['main', 'reserve']) assert.ok(settings.includes(`data-kpi-zone="${zone}"`));
  for (const operation of ['remove', 'add', 'up', 'down']) assert.ok(settings.includes(`data-kpi-operation="${operation}"`));
  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) assert.ok(settings.includes(`'${key}'`));
  assert.match(settings, /if\(draft\.length!==limit\)return;/);
  assert.match(settings, /key:`\$\{mode\}\/\$\{center\}`/);
});
test('Selected KPI is green and long numerical units can wrap under responsive CSS', () => {
  assert.match(source['kpi-settings.css'], /\.kpi-card\.selected\s*\{[^}]*background:linear-gradient\([^)]*#009d7a[^)]*#13af8e/);
  assert.match(source['responsive.css'], /\.kpi-value\s*\{[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere/);
  assert.match(source['responsive.css'], /\.kpi-unit\s*\{[^}]*display:\s*inline-block;[^}]*max-width:\s*100%/);
});
test('Left menu-toggle button is absent while business navigation and focusable Center entry remain', () => {
  assert.doesNotMatch(html + source['sidebar.js'], /sidebar-toggle/);
  assert.doesNotMatch(source['sidebar.js'], /createElement\('button'\)/);
  assert.match(html, /id="business-nav"/);
  assert.match(source['sidebar.js'], /marker\.tabIndex\s*=\s*0/);
  assert.match(source['sidebar.js'], /marker\.addEventListener\('keydown', onMarkerKeyDown\)/);
});

const failed = results.filter(result => result.status === 'FAIL');
console.log(JSON.stringify({suite: 'RRCC v1.4 authored preview static integration contracts', evidenceTier: 'STATIC_SOURCE_CONTRACT_NOT_RUNTIME_OR_BROWSER_ACCEPTANCE', total: results.length, passed: results.length - failed.length, failed: failed.length, results}, null, 2));
if (failed.length) process.exitCode = 1;
