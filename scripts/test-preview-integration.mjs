/**
 * Static integration contracts for the authored v1.6 preview sources.
 * These checks do not execute UI code, load a browser, prove visual geometry,
 * verify public-report contents or certify native pointer/touch dragging.
 */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const files = ['index.html', 'package-preview.mjs', 'preview.js', 'kpi-catalog.js', 'kpi-settings.js', 'kpi-settings.css', 'kpi-library-binding.js', 'kpi-library.js', 'full-data-view.js', 'full-data-view.css', 'chart-motion.js', 'sidebar.js', 'responsive.css'];
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
const expectedScripts = ['center-data.js', 'demo-data.js', 'presentation-data.js', 'merged-center-data.js', 'presentation-center-data.js', 'reference-data.js', 'kpi-catalog.js', 'kpi-settings.js', 'kpi-library-data.js', 'kpi-library-binding.js', 'tsmc-reference-data.js', 'tsmc-sustainability.js', 'recommendations-v1.15.js', 'kpi-library.js', 'full-data-view.js', 'material-flow.js', 'chart-motion.js', 'genie.js', 'panel-motion.js', 'preview.js', 'sidebar.js', 'view-footers-v1.15.js'];
const expectedStyles = ['preview.css', 'panel-motion.css', 'sidebar.css', 'presentation-mode.css', 'responsive.css', 'kpi-settings.css', 'chart-motion.css', 'full-data-view.css', 'kpi-library.css', 'kpi-library-integration.css', 'workspace-refinement.css', 'material-flow.css', 'interaction-refinement-v1.8.css', 'interaction-refinement-v1.9.css', 'interaction-refinement-v1.10.css', 'interaction-refinement-v1.11.css', 'interaction-refinement-v1.12.css', 'interaction-refinement-v1.13.css', 'sidebar-click-v1.14.css', 'workspace-v1.14.css', 'sidebar-alignment-v1.15.css', 'kpi-drafts-v1.15.css', 'workspace-v1.15.css'];

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
  assert.match(source['package-preview.mjs'], /RRCC-Hantang-4-Center-Preview-v1\.15\.html/);
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
  assert.match(comparison, /if\(r\.publicReference\|\|r\.libraryData\)return;/);
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
test('Accessible KPI entry opens the current Center/mode Library instead of the legacy settings dialog', () => {
  assert.match(html, /<button id="kpi-settings-button"[^>]*aria-label="設定 KPI 卡片"[^>]*aria-haspopup="dialog"/);
  assert.match(app, /RRCC_KPI_LIBRARY\.open\(state\.center,current\(\)\.kpis,\{mode:layoutMode\(\)/);
  assert.doesNotMatch(app, /RRCC_KPI_SETTINGS\.open\(/);
  assert.match(app, /\$\('kpi-settings-button'\)\.setAttribute\('aria-label','開啟 KPI 卡片櫃'\)/);
  assert.match(app, /\$\('kpi-settings-button'\)\.addEventListener\('click',openLibrary\)/);
  assert.match(source['kpi-library.js'], /RRCC_KPI_LIBRARY/);
});
test('Legacy six-card settings implementation remains retained, not overwritten as Library evidence', () => {
  assert.match(source['kpi-settings.js'], /dialog\.setAttribute\('aria-labelledby','kpi-settings-title'\)/);
});
test('Legacy catalog remains retained while active twelve-slot cards use stable saved IDs', () => {
  assert.match(source['kpi-catalog.js'], /maxVisible:\s*12,\s*availablePerCenter:\s*8/);
  assert.match(source['kpi-settings.js'], /const limit=12/);
  assert.match(app, /visibleMetrics=window\.RRCC_KPI_SETTINGS\?\.visible\(state\.center,data\.kpis,layoutMode\(\)\)/);
  assert.match(app, /\$\('kpis'\)\.innerHTML=kpiSlots\.map\(\(i,slot\)=>/);
  assert.match(app, /data-metric-id="\$\{escape\(k\.metricId\|\|i\)\}"/);
});
test('Retained legacy settings still has main/reserve, list/keyboard alternatives and its original save gate', () => {
  const settings = source['kpi-settings.js'];
  for (const zone of ['main', 'reserve']) assert.ok(settings.includes(`data-kpi-zone="${zone}"`));
  for (const operation of ['remove', 'add', 'up', 'down']) assert.ok(settings.includes(`data-kpi-operation="${operation}"`));
  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) assert.ok(settings.includes(`'${key}'`));
  assert.match(settings, /write\(context\.key,draft\)/);
  assert.doesNotMatch(settings, /if\(draft\.length!==limit\)return;/);
  assert.match(settings, /key:`\$\{mode\}\/\$\{center\}`/);
});
test('Canonical library binding resolves one shared card per ID/scope and excludes unnamed pending definitions', () => {
  const binding = source['kpi-library-binding.js'];
  assert.match(binding, /const bind\s*=\s*window\.RRCC_BIND_DATA/);
  assert.match(binding, /\.filter\(card\s*=>\s*card\.formalName\)/);
  assert.match(binding, /library\.resolve\(card\.cardId,\s*context\.period,\s*context\.project\)/);
  assert.match(binding, /for\s*\(const center of Object\.values\(window\.CENTER_DATA\)\)/);
  assert.match(binding, /center\.kpis\s*=\s*\[\.\.\.center\.kpis\.filter\([^;]+,\s*\.\.\.cards\]/);
});
test('Canonical right branch precedes generic progress/chart content and exposes honest calculation details', () => {
  const right = section(app, 'function renderRight()', 'function applyMetricComparison()');
  const branch = right.indexOf('if(r.libraryData){renderLibraryRight(data.kpis[state.metric]);return;}');
  const generic = right.indexOf("if(active==='summary')");
  assert.ok(branch >= 0 && generic > branch);
  const canonical = section(app, 'function renderLibraryRight(', 'function openLibraryDetail(');
  assert.match(canonical, /typeof info\.numericValue==='number'&&Number\.isFinite\(info\.numericValue\)/);
  assert.match(canonical, /此卡僅使用 V1／V2 整合來源，不引用合成展示值/);
  assert.match(canonical, /data-library-detail/);
  assert.match(canonical, /data-library-source/);
  assert.doesNotMatch(canonical, /right-targets|r\.completion/);
  assert.match(canonical, /\$\{valuePresent\?`[^`]*class="right-spark">\$\{spark\(k\.series,k\.seriesMonths\)\}/);
  assert.match(canonical, /RRCC_CHART_MOTION\?\.refresh\(\$\('right-panel'\)\)/);
});
test('Root Library source action is scoped to the right panel so the Library source-month entry keeps its own handler', () => {
  assert.match(app, /if\(b\.hasAttribute\('data-library-source'\)&&b\.closest\('#right-panel'\)\)/);
  assert.match(app, /if\(k\.detail\?\.libraryData\)dialog\(/);
  assert.doesNotMatch(app, /if\(b\.hasAttribute\('data-library-source'\)\)\{/);
  assert.match(source['kpi-library.js'], /if\s*\(button\.hasAttribute\('data-library-source'\)\)\s*\{\s*const action = context\.useSource;\s*cancelEditing\(\);\s*action\?\.\(\)/);
});
test('Library calculation modal retains all original calculation rows and raw record definitions', () => {
  const details = section(app, 'function openLibraryDetail()', 'function renderRight()');
  assert.match(details, /columns\s*:\s*info\.columns\s*\|\|\s*\[\]/);
  assert.match(details, /rows\s*:\s*info\.rows\s*\|\|\s*\[\]/);
  assert.match(details, /rowProvenance\s*[,}]/);
  assert.match(details, /libraryData\s*:\s*info/);
  assert.match(details, /openDetail\('external'\)/);
  assert.match(details, /JSON\.stringify\(\{definition:info\.definition,source:info\.source,[^}]*records:info\.rawRecords[^}]*\}/);
  assert.match(details, /schema:info\.schema/);
  assert.match(details, /materials:info\.materialRecords/);
});
test('Canonical per-row provenance resolves batch identity against actual merged indices and original source references', () => {
  const details = section(app, 'function openLibraryDetail()', 'function renderRight()');
  const mapping = section(details, 'const rowProvenance=', 'externalTable=');
  assert.match(mapping, /info\.rawRecords\s*\|\|\s*\[\]/);
  assert.match(mapping, /\.map\(record\s*=>/);
  assert.match(mapping, /RRCC_MERGED\.data\.rows\.findIndex\(row\s*=>\s*row\.id\s*===\s*record\.id\)/);
  assert.match(mapping, /canonicalPointers\s*:\s*index\s*>=\s*0\s*\?\s*\[`\/data\/rows\/\$\{index\}`\]\s*:\s*\[\]/);
  assert.match(mapping, /sourceReferences\s*:\s*window\.RRCC_MERGED\.provenance\?\.rows\?\.\[record\.id\]\?\.recordSources\s*\|\|\s*\[\]/);
});
test('Opening a canonical detail row preserves its complete raw batch, joined material, source, and row provenance', () => {
  const details = section(app, 'function openDetail(', 'function openSidebar(');
  const canonical = section(details, 'if(t.libraryData){', 'if(detailProvenance)');
  assert.match(canonical, /rawRecords\[rowIndex\]/);
  assert.match(canonical, /materialRecords\.find\(record\s*=>\s*record\.id\s*===\s*raw\?\.material\)/);
  assert.match(canonical, /JSON\.stringify\(\{[^}]*record\s*:\s*raw[^}]*material[^}]*source\s*:\s*t\.libraryData\.source[^}]*provenance\s*:\s*detailProvenance[^}]*\}/);
  assert.doesNotMatch(canonical, /rawRecords\[rowIndex\]\s*=|delete\s|\.splice\(/);
});
test('Complete table dialogs use a full viewer and original row indices rather than dashboard preview limits', () => {
  const details = section(app, 'function openDetail(', 'function openSidebar(');
  assert.match(details, /RRCC_FULL_TABLE\.render\(t,kind,\{cell,scope:[^\n]+onExport:exportCSV\}\)/);
  assert.match(details, /const row=t\.rows\[rowIndex\]/);
  assert.match(details, /detailProvenance=t\.rowProvenance\?\.\[rowIndex\]/);
  const viewer = source['full-data-view.js'];
  assert.match(viewer, /entries:\s*rows\.map\(\(row, index\)\s*=>\s*\(\{row, index,/);
  assert.match(viewer, /data-row-index="\$\{entry\.index\}"/);
  assert.match(viewer, /state\.onExport\(state\.table\)/);
  assert.doesNotMatch(viewer, /previewLimit/);
});
test('Complete data modal has a bounded wide viewport and wraps original values without ellipsis', () => {
  const css = source['full-data-view.css'];
  assert.match(css, /#detail-dialog\s*\{[^}]*width:\s*min\(1600px, 96vw\)/);
  assert.match(css, /max-height:\s*93dvh/);
  assert.match(css, /\.full-table-scroll\s*\{[^}]*overflow:\s*auto/);
  assert.match(css, /white-space:\s*normal/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /\.person small\s*\{\s*display:\s*block/);
  assert.doesNotMatch(css, /text-overflow:\s*ellipsis/);
});
test('An empty personalized Dashboard keeps a Library recovery entry and disables stale panel restore', () => {
  assert.match(app, /visibleMetrics\[0\]\?\?0/);
  assert.match(app, /class="kpi-slot-empty"[^\n]+data-open-library/);
  assert.match(app, /\$\('right-panel-trigger'\)\.disabled=!visibleMetrics\.length/);
  assert.match(app, /if\(resetPanel\|\|!visibleMetrics\.length\)panelMotion\?\.reset/);
  assert.match(app, /if\(b\.hasAttribute\('data-open-library'\)\)\{openLibrary\(\);return;\}/);
  assert.match(app, /if\s*\(visibleMetrics\.length\)\s*\{\s*renderRight\(\);\s*applyMetricComparison\(\);\s*\}/);
  assert.match(app, /else\s*\{\s*\$\('right-panel'\)\.innerHTML\s*=\s*'';\s*\$\('right-panel'\)\.dataset\.sourceTitle\s*=\s*'';\s*\}/);
});
test('KPI requests and restore only open metrics still present in the saved Center/mode configuration', () => {
  const request = section(app, 'if(b.dataset.metric!==undefined)', 'if(b.dataset.sidebar!==undefined)');
  const restore = section(app, "if(b.hasAttribute('data-restore-right'))", "if(b.hasAttribute('data-open-activity'))");
  for (const [branch, metric] of [[request, 'metric'], [restore, 'state.metric']]) {
    assert.match(branch, /RRCC_KPI_SETTINGS\.visible\(state\.center,\s*current\(\)\.kpis,\s*layoutMode\(\)\)/);
    const escaped = metric.replace('.', '\\.');
    assert.match(branch, new RegExp(`\\.includes\\(${escaped}\\)\\)\\s*panelMotion\\.request\\(${escaped},`));
  }
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
console.log(JSON.stringify({suite: 'RRCC v1.6 authored preview static integration contracts', evidenceTier: 'STATIC_SOURCE_CONTRACT_NOT_RUNTIME_OR_BROWSER_ACCEPTANCE', total: results.length, passed: results.length - failed.length, failed: failed.length, results}, null, 2));
if (failed.length) process.exitCode = 1;
