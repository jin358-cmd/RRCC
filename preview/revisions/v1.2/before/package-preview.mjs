// Generate a self-contained review artifact from the authored preview sources.
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
let html=await readFile(path.join(dir,'index.html'),'utf8');
let css=await readFile(path.join(dir,'preview.css'),'utf8');
const baseline=await readFile(path.join(dir,'../New/RRCC範疇三永續管理儀表板-1C.png'));
css=css.replaceAll("url('../New/RRCC範疇三永續管理儀表板-1C.png')",`url('data:image/png;base64,${baseline.toString('base64')}')`);
const data=await readFile(path.join(dir,'center-data.js'),'utf8');
const js=await readFile(path.join(dir,'preview.js'),'utf8');
html=html.replace('<link rel="stylesheet" href="preview.css">',`<style>${css}</style>`)
  .replace('  <script src="center-data.js" defer></script>\n','')
  .replace('  <script src="preview.js" defer></script>\n','')
  .replace('</body>',`<script>${data.replaceAll('</script','<\\/script')}</script>\n<script>${js.replaceAll('</script','<\\/script')}</script>\n</body>`);
const output=path.join(dir,'RRCC-Hantang-4-Center-Preview.html');
await writeFile(output,html,'utf8');
console.log(`Self-contained offline preview: ${output}`);
