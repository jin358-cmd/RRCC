/** Deterministic, explicitly synthetic presentation fixture. Never reads or edits V1/V2. */
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
import {createHash} from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const months = ['2026-07','2026-08','2026-09','2026-10'];
const materialCounts = [2148,2240,2360,2486], supplierCounts = [40,42,45,48], userCounts = [152,160,174,186];
const pendingCounts = [120,110,104,86];
const caseCounts = [{verified:342,pending:38,returned:7,abnormal:3},{verified:374,pending:36,returned:7,abnormal:3},{verified:403,pending:35,returned:7,abnormal:3},{verified:428,pending:32,returned:6,abnormal:3}];
const categories = ['製程管材','機電設備','潔淨室建材','化學品系統','消防與安控','其他材料'];
const materialNames = ['UHP 316L 不鏽鋼管材','FFU 高效過濾機組','潔淨室高架地板','PFA 高純度閥件','消防監控模組','工程支撐組件'];
const roles = ['供應商申報','工程管理','材料管理','驗證審查','管理主管','平台管理員'];
const rolePattern = [...Array(78).fill(0),...Array(45).fill(1),...Array(26).fill(2),...Array(19).fill(3),...Array(13).fill(4),...Array(5).fill(5)];
const dates = (month, n = 0) => `${month}-${String(13-(n%10)).padStart(2,'0')}`;
const createdMonth = (n, counts) => months[counts.findIndex(count => n < count)];
const projects = ['台南 A 案','新竹 B 案','台中 C 案','高雄 D 案','桃園 E 案','竹南 F 案','嘉義 G 案','南科 H 案'].map((name,i) => ({
  id:String.fromCharCode(65+i), name, short:name, type:['無塵室新建','機電整合','製程擴建','廠務系統'][i%4],
  organizationId:`ORG-${String(i+1).padStart(2,'0')}`, organization:['廠務工程一部','機電工程部','製程系統部','廠務工程二部','設備整合部','專案工程部','環安工程部','自動化工程部'][i],
  scheduledCompletion:['2026-12','2027-03','2027-06','2026-11','2027-08','2027-05','2027-07','2027-09'][i],
  progressByMonth:Object.fromEntries(months.map((m,j) => [m, Math.min(96,Math.max(12,[65,42,28,80,35,51,32,24][i]-((3-j)*5)))]))
}));
const organizations = projects.map(p => ({id:p.organizationId, name:p.organization, project:p.id, createdMonth:months[0], status:'active'}));
const suppliers = Array.from({length:48},(_,i) => ({id:`SUP-${String(i+1).padStart(3,'0')}`, name:`示範${['精密材料','潔淨科技','流體工程','機電整合','環控設備','工程配件'][i%6]} ${String(i+1).padStart(2,'0')}`, category:categories[i%6], createdMonth:createdMonth(i,supplierCounts), status:'active', projectIds:[projects[i%8].id]}));
const users = Array.from({length:186},(_,i) => ({id:`USR-${String(i+1).padStart(3,'0')}`, name:`示範人員 ${String(i+1).padStart(3,'0')}`, role:roles[rolePattern[(i*79)%186]], organizationId:organizations[i%8].id, project:projects[i%8].id, createdMonth:createdMonth(i,userCounts), status:'active'}));
const materials = Array.from({length:2486},(_,i) => {
  const created = createdMonth(i,materialCounts), project = projects[i%8].id;
  const eligibleSuppliers = suppliers.filter(s=>s.createdMonth<=created&&s.projectIds.includes(project));
  const supplier = eligibleSuppliers[Math.floor(i/8)%eligibleSuppliers.length];
  return {id:`MAT-${String(i+1).padStart(5,'0')}`, name:`${materialNames[i%6]} ${String((i%32)+1).padStart(2,'0')}型`, category:categories[i%6], unit:['m','組','m²','個','組','個'][i%6], specification:['SEMI F20 / 316L','H14 / 0.3 μm','Class 1 潔淨室','PFA / 高純度','智慧消防介面','SUS304'][i%6], project, supplierId:supplier.id, createdMonth:created};
});
const declarations = [], documents = [], verificationCases = [], materialIssues = [], managementActivities = [], systemEvents = [], managementTasks = [], permissionReminders = [], systemHealth = [], rules = [];
months.forEach((month,j) => {
  const activeMaterials = materials.slice(0,materialCounts[j]);
  const complete = activeMaterials.length-pendingCounts[j];
  const reviewers = users.filter(user=>user.createdMonth<=month&&user.role==='驗證審查');
  activeMaterials.forEach((material,i) => {
    const status = i < complete ? 'declared' : 'pending', id = `DEC-${month.replace('-','')}-${material.id.slice(4)}`;
    declarations.push({id,month,materialId:material.id,project:material.project,supplierId:material.supplierId,status,submittedAt:status==='declared'?`${dates(month,i)} ${String(8+i%9).padStart(2,'0')}:${String(i%60).padStart(2,'0')}`:null,dueAt:`${month}-20`});
    if(status==='declared')documents.push({id:`DOC-${month.replace('-','')}-${material.id.slice(4)}`,month,materialId:material.id,declarationId:id,project:material.project,supplierId:material.supplierId,name:`${material.id} 材質／合規證明`,type:['材質證明','型式試驗報告','原產地證明','合規聲明'][i%4],revision:`Rev.${1+i%3}`,status:'complete',updatedAt:dates(month,i)});
  });
  Object.entries(caseCounts[j]).forEach(([status,count]) => {
    for(let i=0;i<count;i++){
      const index = verificationCases.filter(c=>c.month===month).length;
      const material=activeMaterials[index*5%complete];
      verificationCases.push({id:`VER-${month.replace('-','')}-${String(index+1).padStart(4,'0')}`,month,materialId:material.id,documentId:`DOC-${month.replace('-','')}-${material.id.slice(4)}`,project:material.project,supplierId:material.supplierId,title:`${material.name} ${['材質證明','效能測試','合規聲明'][index%3]}`,status,reviewerId:reviewers[index%reviewers.length].id,dueAt:`${month}-${String(14+(index%8)).padStart(2,'0')}`,updatedAt:`${dates(month,index)} ${String(9+index%8).padStart(2,'0')}:${String(index%60).padStart(2,'0')}`,reason:status==='returned'?'文件版本待補正':status==='abnormal'?'批次證明資料待複核':'文件資料齊備'});
    }
  });
  for(let i=0;i<7;i++){
    const material = activeMaterials[complete-1-i*17];
    materialIssues.push({id:`MIS-${month.replace('-','')}-${i+1}`,month,materialId:material.id,project:material.project,supplierId:material.supplierId,reason:['文件版次待更新','批次數量待複核','證明附件待補正'][i%3],dueAt:`${month}-${15+i}`,status:i%2?'review':'pending'});
  }
  for(let i=0;i<12;i++){
    const user = users[(j*7+i*11)%userCounts[j]], project = projects[i%8];
    managementActivities.push({id:`ACT-${month.replace('-','')}-${i+1}`,month,project:project.id,actorId:user.id,organizationId:project.organizationId,action:['調整案場檢視權限','完成帳號定期複核','更新供應商組織資料','檢核材料申報規則'][i%4],at:`${dates(month,i)} ${String(10+i%6).padStart(2,'0')}:${String(i*7%60).padStart(2,'0')}`,status:'completed'});
  }
  for(let i=0;i<16;i++)systemEvents.push({id:`EVT-${month.replace('-','')}-${i+1}`,month,project:projects[i%8].id,at:`${dates(month,i)} ${String(8+i%10).padStart(2,'0')}:00`,event:['資料備份檢核完成','排程報表產生完成','材料索引同步完成','存取權限檢核完成'][i%4],service:['備份服務','報表服務','資料服務','存取控制'][i%4],status:'normal'});
  for(let i=0;i<4;i++)managementTasks.push({id:`TSK-${month.replace('-','')}-${i+1}`,month,projectIds:projects.slice(i*2,i*2+2).map(p=>p.id),title:['供應商組織資料複核','季度帳號權限複核','申報規則版本確認','資料備份還原演練'][i],owner:organizations[i*2].name,dueAt:`${month}-${15+i}`,status:i%2?'inProgress':'pending'});
  for(let i=0;i<2;i++)permissionReminders.push({id:`PER-${month.replace('-','')}-${i+1}`,month,projectIds:projects.slice(i*4,i*4+4).map(p=>p.id),userId:users[5+i].id,title:i?'供應商角色異動複核':'跨案場檢視申請複核',status:'pending',dueAt:`${month}-16`});
  systemHealth.push({id:`SYS-${month.replace('-','')}`,month,scope:'platform',availabilityPercent:[99.95,99.97,99.98,99.98][j],targetPercent:99.9,status:'normal',responseTimeMs:[192,185,181,176][j],backupStatus:'verified',pendingTasks:4});
});
for(let i=0;i<12;i++)rules.push({id:`RULE-${String(i+1).padStart(3,'0')}`,name:['申報必填欄位檢核','供應商合規文件檢核','驗證到期提醒','跨案場存取權限檢核'][i%4],version:`1.${i%3}`,status:'enabled',projectIds:projects.map(p=>p.id),createdMonth:months[0]});
const fixture = {
  datasetId:'rrcc-hantang-presentation-demo-v1',schemaVersion:'1.0',kind:'synthetic',generatedAt:'2026-10-13T00:00:00+08:00',
  disclaimer:'合成展示資料（Demo）｜僅供四中心互動預覽，不是漢唐實際營運、碳盤查、驗證或系統監控資料；不覆寫 V1 / V2 與合併 JSON。',
  sources:[{id:'presentation-demo',path:'data/demo/rrcc-hantang-presentation-demo.json',kind:'synthetic',generator:'scripts/generate-presentation-demo.mjs'}],
  months,categories,roles,
  definitions:{declarationCompletion:'當月 declared 材料筆數 / 當月全部材料申報筆數 × 100',verificationCompletion:'當月 verified 案件 / 當月全部驗證案件 × 100',availability:'專供視覺預覽的合成月度平台可用率，不是即時監控',periodScope:'材料、供應商、使用者以 createdMonth <= 所選月份；交易、案件及活動以 month = 所選月份；案場以 project 或 projectIds 篩選；平台健康為全域值',targetPolicy:'介面目標僅為合成示範情境，不構成實際 SLA 或業務承諾'},
  data:{projects,organizations,suppliers,users,materials,declarations,documents,verificationCases,materialIssues,managementActivities,systemEvents,managementTasks,permissionReminders,systemHealth,rules}
};
const json = JSON.stringify(fixture,null,2)+'\n';
const javascript = '/* Generated synthetic presentation fixture. Never actual operational data. */\nwindow.RRCC_PRESENTATION_TEMPLATE = JSON.parse(JSON.stringify(window.CENTER_DATA));\nwindow.RRCC_PRESENTATION = '+JSON.stringify(fixture)+';\n';
const outputs = [['data/demo/rrcc-hantang-presentation-demo.json',json],['preview/presentation-data.js',javascript]];
for(const [relative,content] of outputs){
  const path = resolve(root,relative);
  if(process.argv.includes('--check')){
    if(await readFile(path,'utf8')!==content)throw new Error(`Generated output differs: ${relative}`);
  }else{await mkdir(dirname(path),{recursive:true});await writeFile(path,content);}
}
const sha256=createHash('sha256').update(json).digest('hex');
console.log(JSON.stringify({status:'PASS',mode:process.argv.includes('--check')?'check':'generate',datasetId:fixture.datasetId,sha256,counts:Object.fromEntries(Object.entries(fixture.data).map(([k,v])=>[k,v.length])),october:{materials:2486,declared:2400,pendingDeclarations:86,suppliers:48,users:186,organizations:8,verification:caseCounts[3],availabilityPercent:99.98,managementTasks:4,permissionReminders:2}},null,2));
