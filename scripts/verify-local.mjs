// Run reproducible local checks and append versioned machine-readable evidence.
import {spawnSync} from 'node:child_process';
import {mkdir, writeFile, readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const commands=[
 ['scripts/merge-demo-data.mjs','--test'],
 ['scripts/merge-demo-data.mjs','--check'],
 ['scripts/test-center-bindings.mjs'],
 ['scripts/test-presentation-demo.mjs'],
 ['scripts/test-panel-motion.mjs'],
 ['scripts/test-sidebar.mjs'],
 ['scripts/test-responsive.mjs'],
 ['scripts/test-kpi-catalog.mjs'],
 ['scripts/test-kpi-settings.mjs'],
 ['scripts/test-chart-motion.mjs'],
 ['scripts/test-preview-integration.mjs'],
 ['scripts/test-full-data-view.mjs'],
 ['scripts/test-kpi-library-data.mjs'],
 ['scripts/test-kpi-library-ui.mjs'],
 ['scripts/test-kpi-library-integration.mjs'],
 ['scripts/test-workspace-refinement.mjs'],
 ['scripts/test-brand-alignment.mjs'],
 ['scripts/test-vercel-preview.mjs'],
 ['scripts/test-material-flow.mjs'],
 ['scripts/test-material-flow-integration.mjs'],
 ['scripts/test-interaction-refinement-v1.8.mjs'],
 ...['preview.js','merged-center-data.js','presentation-center-data.js','panel-motion.js','genie.js','sidebar.js','kpi-catalog.js','kpi-settings.js','chart-motion.js','full-data-view.js','kpi-library-data.js','kpi-library-binding.js','kpi-library.js','material-flow.js'].map(f=>['--check',`preview/${f}`])
];
const results=commands.map(args=>{
 const p=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8'});
 return {command:`node ${args.join(' ')}`,status:p.status===0?'PASS':'FAIL',exitCode:p.status,stdout:p.stdout,stderr:p.stderr};
});
const preserved={
 'v1.0/RRCC_Hantang_V1_Embedded_Demo_Data.json':'c19d3c335fa0c038b8fb3001cd6397260af5d5c33663c413a56be0b4c7565e2b',
 'v2.0/RRCC_Hantang_Embedded_Demo_Data.json':'9c2b53273c43c731d1e33d0b9aecd3a6a031fdd3aa990217ccd613b835bf8514',
 'v1.0/rrcc_hantang_demo_v1_OFFLINE.html':'100c3a4770d5a2505c2fd30144bd9b1618c69e1702c1f97374539f99bdaf0bd2',
 'v2.0/rrcc_hantang_dashboard_v2_OFFLINE.html':'e9c48862848a52dc50fb8f96c8d223ec1328bbfd0dd5a21bf5f63a5d9f496a7d',
 'New/RRCC範疇三永續管理儀表板-1C.png':'98ef889f526b0ad5bd891c15573852ed18c7df643670d44dc939bcfa1363c040',
 'preview/QA.md':'4b3217a0f5a24d35b9dec396cb41f72c20978f494f9e335edd985ee4227fec6e',
 'preview/qa-results.json':'d8ebe3f7edccc7a8d94007bbfadd67a0b7e5094ac1fee1e0d16c6dc68c3e6cfa',
 'preview/RRCC-Hantang-4-Center-Preview.html':'5c344354b409e01fc214cf09a3ff7129f74b7f5100108bdcb7a5066210884ae8',
 'preview/RRCC-Hantang-4-Center-Preview-v1.5.html':'01c3adc1f64bd0fc843634778f8cfc11c0c4f854079bba3801268ebcc5a5a852',
 'preview/RRCC-Hantang-4-Center-Preview-v1.6.html':'60b147b974f341bd601a60dda4c2320c2b077edcafdf797ddda22dc0f1252dc9',
 'preview/RRCC-Hantang-4-Center-Preview-v1.7.html':'0b67d1e20a5442f82a5389bc80e7d77d002b1d3c449ba03545bd5110e161895a',
 'preview/RRCC-Hantang-4-Center-Demonstration.zip':'66bf7c372afc72adc470b03e1a41e5a9b946e75e432610b8779be583f1371975'
};
const preservation=[];
for(const [file,expected] of Object.entries(preserved)){
 const actual=createHash('sha256').update(await readFile(path.join(root,file))).digest('hex');
 preservation.push({file,expected,actual,status:actual===expected?'PASS':'FAIL'});
}
const evidence={revision:'RRCC V2 material flow and interaction refinement v1.8',verifiedAt:new Date().toISOString(),scope:'Node VM/unit, build contracts and source preservation; browser evidence is separate; no deployment',results,preservation};
const outputArgument=process.argv.find(argument=>argument.startsWith('--output='));
const destination=path.resolve(root,outputArgument?.slice('--output='.length)||'preview/revisions/v1.8/local-test-evidence.json');
const evidenceRoot=path.join(root,'preview/revisions/v1.8')+path.sep;
if(!destination.startsWith(evidenceRoot))throw new Error('Local evidence must remain inside preview/revisions/v1.8.');
await mkdir(path.dirname(destination),{recursive:true});
// Evidence is append-only: select a fresh output filename for a later rerun.
await writeFile(destination,JSON.stringify(evidence,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({commands:results.map(({command,status})=>({command,status})),preservation:preservation.map(({file,status})=>({file,status}))},null,2));
if([...results,...preservation].some(r=>r.status!=='PASS'))process.exitCode=1;
