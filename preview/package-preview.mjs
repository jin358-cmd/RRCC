// Generate a self-contained review artifact from the authored preview sources.
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const dir=path.dirname(fileURLToPath(import.meta.url));
execFileSync(process.execPath,[path.join(dir,'../scripts/generate-presentation-demo.mjs')],{stdio:'inherit'});
let html=await readFile(path.join(dir,'index.html'),'utf8');
const stylesheetNames=['preview.css','panel-motion.css','sidebar.css','presentation-mode.css','responsive.css','kpi-settings.css','chart-motion.css'];
let css=(await Promise.all(stylesheetNames.map(file=>readFile(path.join(dir,file),'utf8')))).join('\n');
const baseline=await readFile(path.join(dir,'../New/RRCC範疇三永續管理儀表板-1C.png'));
css=css.replaceAll("url('../New/RRCC範疇三永續管理儀表板-1C.png')",`url('data:image/png;base64,${baseline.toString('base64')}')`);
const merged=JSON.parse(await readFile(path.join(dir,'../data/demo/rrcc-hantang-merged-v1-v2.json'),'utf8'));
await writeFile(path.join(dir,'demo-data.js'),`/* Generated from the canonical merged JSON; do not edit. */\nwindow.RRCC_MERGED=${JSON.stringify(merged)};\n`,'utf8');
const references=JSON.parse(await readFile(path.join(dir,'../data/demo/rrcc-public-references.json'),'utf8'));
await writeFile(path.join(dir,'reference-data.js'),`/* Public reference values, not RRCC operating data. */\nwindow.RRCC_PUBLIC_REFERENCES=${JSON.stringify(references)};\n`,'utf8');
const scriptNames=['center-data.js','demo-data.js','presentation-data.js','merged-center-data.js','presentation-center-data.js','reference-data.js','kpi-catalog.js','kpi-settings.js','chart-motion.js','genie.js','panel-motion.js','preview.js','sidebar.js'];
const scripts=await Promise.all(scriptNames.map(file=>readFile(path.join(dir,file),'utf8')));
html=html.replace('<link rel="stylesheet" href="preview.css">',`<style>${css}</style>`)
  .replace('  <link rel="stylesheet" href="panel-motion.css">\n','')
  .replace('  <link rel="stylesheet" href="sidebar.css">\n','')
  .replace('  <link rel="stylesheet" href="presentation-mode.css">\n','');
for(const file of scriptNames) html=html.replace(`  <script src="${file}" defer></script>\n`,'');
for(const file of stylesheetNames.slice(4))html=html.replace(`  <link rel="stylesheet" href="${file}">\n`,'');
html=html.replace('</body>',scripts.map(js=>`<script>${js.replaceAll('</script','<\\/script')}</script>`).join('\n')+'\n</body>');
const output=path.join(dir,'RRCC-Hantang-4-Center-Preview-v1.4.html');
await writeFile(output,html,'utf8');
console.log(`Self-contained offline preview: ${output}`);
