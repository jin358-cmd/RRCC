/* Explicit synthetic presentation mode. Source mode remains the unmodified V1/V2 binder. */
(() => {
  'use strict';
  const fixture=window.RRCC_PRESENTATION, sourceRoot=window.RRCC_MERGED;
  if(!fixture||!window.RRCC_BIND_DATA)return;
  const originalBinder=window.RRCC_BIND_DATA, sourceMonths=[...window.RRCC_DATA_MONTHS], names=window.RRCC_PROJECT_NAMES, sourceNames={...names};
  const template=window.RRCC_PRESENTATION_TEMPLATE, data=fixture.data, months=fixture.months;
  let bindingProject='all';
  const colors=['#2e8bfa','#2c83b8','#ffad44','#ed8765','#9472dc','#70aafa','#49b6a8','#7f9ab8'];
  const indexMaps=Object.fromEntries(Object.entries(data).map(([key,records])=>[key,new Map(records.map((r,i)=>[r.id,i]))]));
  const projectMap=Object.fromEntries(data.projects.map(p=>[p.id,p])), supplierMap=Object.fromEntries(data.suppliers.map(p=>[p.id,p])), materialMap=Object.fromEntries(data.materials.map(p=>[p.id,p])), userMap=Object.fromEntries(data.users.map(p=>[p.id,p])), organizationMap=Object.fromEntries(data.organizations.map(p=>[p.id,p]));
  const format=(n,d=0)=>Number(n).toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:d});
  const percent=n=>`${format(n,1)}%`;
  const rate=(n,d)=>d?n/d*100:0;
  const badge=(text,tone='green')=>({type:'badge',text,tone});
  const statusNames={declared:'申報完成',pending:'待處理',verified:'驗證通過',returned:'退回補件',abnormal:'異常追蹤',complete:'文件齊備',normal:'運作正常',completed:'已完成',inProgress:'進行中',review:'複核中',enabled:'已啟用',active:'已啟用'};
  const statusBadge=status=>badge(statusNames[status]||status,['declared','verified','complete','normal','completed','enabled','active'].includes(status)?'green':status==='abnormal'?'red':status==='returned'?'orange':'blue');
  const scoped=(r,project)=>project==='all'||r.project===project||r.projectIds?.includes(project);
  const active=(key,period,project)=>data[key].filter(r=>(!r.createdMonth||r.createdMonth<=period)&&(key==='projects'?(project==='all'||r.id===project):scoped(r,project)));
  const monthly=(key,period,project)=>data[key].filter(r=>r.month===period&&scoped(r,project));
  function provenance(key,records,fields=[]){
    return {dataset:'presentation-demo',collection:`/data/${key}`,synthetic:true,canonicalPointers:records.length?records.flatMap(r=>{const p=`/data/${key}/${indexMaps[key].get(r.id)}`;return fields.length?fields.map(f=>`${p}/${f}`):[p];}):[`/data/${key}`],sourceReferences:[]};
  }
  function combined(...parts){return {dataset:'presentation-demo',synthetic:true,collection:[...new Set(parts.map(p=>p.collection))].join(' + '),canonicalPointers:[...new Set(parts.flatMap(p=>p.canonicalPointers||[]))],sourceReferences:[]};}
  function recordProvenance(key,record){
    const parts=[provenance(key,[record])];
    for(const [field,collection,map] of [['materialId','materials',materialMap],['supplierId','suppliers',supplierMap],['actorId','users',userMap],['reviewerId','users',userMap],['userId','users',userMap],['organizationId','organizations',organizationMap]])if(record[field]&&map[record[field]])parts.push(provenance(collection,[map[record[field]]]));
    if(record.project&&projectMap[record.project])parts.push(provenance('projects',[projectMap[record.project]]));
    return combined(...parts);
  }
  function fullSeriesProvenance(p){
    const keys=[...new Set([...p.collection.matchAll(/\/data\/(\w+)/g)].map(match=>match[1]))];
    return combined(p,...keys.map(key=>provenance(key,data[key].filter(r=>key==='systemHealth'||(key==='projects'?(bindingProject==='all'||r.id===bindingProject):scoped(r,bindingProject))))));
  }
  function table(title,columns,rows,key,records,previewLimit=5){const rowProvenance=records.map(r=>recordProvenance(key,r)),p=records.length?combined(...rowProvenance):provenance(key,records);return {title,columns,rows,provenance:p,rowProvenance,sourceTitle:`${title} · ${p.collection}`,previewLimit};}
  function distribution(title,total,unit,parts,p){const sum=parts.reduce((n,x)=>n+x.amount,0);return {title,total:format(total),unit,items:parts.filter(x=>x.amount>0).map((x,i)=>({...x,value:rate(x.amount,sum),color:colors[i%colors.length]})),provenance:p};}
  function trend(title,unit,bars,line,legend,p){const greatest=Math.max(1,...bars,...line),magnitude=10**Math.floor(Math.log10(greatest)),max=Math.ceil(greatest/magnitude)*magnitude;return {title,unit,months:[...months],bars,line,previous:[],legend,max,ticks:[0,max/4,max/2,max*3/4,max],provenance:fullSeriesProvenance(p)};}
  const series=(project,calc)=>months.map(m=>calc(m,project));
  function getStats(period,project){
    const projects=active('projects',period,project),materials=active('materials',period,project),suppliers=active('suppliers',period,project),users=active('users',period,project),organizations=active('organizations',period,project);
    const declarations=monthly('declarations',period,project),cases=monthly('verificationCases',period,project),permissions=monthly('permissionReminders',period,project),tasks=monthly('managementTasks',period,project),health=data.systemHealth.find(r=>r.month===period);
    return {projects,materials,suppliers,users,organizations,declarations,cases,permissions,tasks,health,declared:declarations.filter(r=>r.status==='declared'),pendingDeclarations:declarations.filter(r=>r.status==='pending'),pending:cases.filter(r=>r.status==='pending'),verified:cases.filter(r=>r.status==='verified'),returned:cases.filter(r=>r.status==='returned'),abnormal:cases.filter(r=>r.status==='abnormal')};
  }
  function card(label,value,unit,icon,color,values,p,notes,actions,period,details={}){
    p=fullSeriesProvenance(p);
    const position=months.indexOf(period),deltaValue=position>0?values[position]-values[position-1]:null;
    const delta=details.delta||(deltaValue===null?'本期展示':`${deltaValue>=0?'↑':'↓'} ${format(Math.abs(deltaValue),details.rate?1:0)}${details.rate?' pp':''}`);
    const completion=Math.max(0,Math.min(100,details.completion??rate(Number(String(value).replace(/[,％%]/g,'')),details.target||100)));
    const detail={title:'KPI 詳細資訊',kpiLabel:label,value:String(value).replace(/%$/,''),unit:unit||(details.rate?'%':''),delta,target:String(details.target??100),targetLabel:details.targetLabel||'本期展示目標',completion,comparisonLabel:details.comparisonLabel||'目標達成率',comparisonValue:details.comparisonValue||percent(completion),comparisonColor:'#14b59b',trendTitle:'近四個月趨勢',spark:values,sparkMonths:[...months],notesTitle:'業務重點',notes:[...notes,'合成展示資料（Demo）｜非漢唐實際營運資料。','資料來源：data/demo/rrcc-hantang-presentation-demo.json'],activityTitle:'近期動態',activities:[],alert:{title:'整體運作正常',body:'少量待辦依流程追蹤；所有數值及事件均為離線合成情境。'},quickTitle:'快速檢視操作',actions,provenance:p,sourceTitle:`${label} · ${p.collection}`,synthetic:true,unavailable:false};
    return {label,value:String(value),unit,icon,color,delta,deltaType:details.deltaType||'neutral',foot:position>0?'vs. 上月':'本期數值',series:values,seriesMonths:[...months],provenance:p,sourceTitle:detail.sourceTitle,detail};
  }
  function base(id,kpis,charts,tables,actions,activities,alert,sidebarViews,quickViews,period,project,counts={}){
    const b=template[id],rightIndex=id==='overview'?0:3;
    const right={...kpis[rightIndex].detail,activities,activityTitle:id==='management'?'系統通知':`近期${id==='overview'?'平台':id==='material'?'材料':'驗證'}動態`,alert,actions};
    kpis.forEach(k=>{k.detail.activities=activities;k.detail.activityTitle=right.activityTitle;k.detail.alert=alert;k.detail.actions=actions;});
    return {...b,subtitle:b.subtitle,kpis,trend:charts.trend,distribution:charts.distribution,...tables,right,sidebar:b.sidebar.map((s,i)=>({icon:s.icon,label:s.label,...(counts[i]!==undefined?{count:counts[i]}:{})})),sidebarViews,quickViews,activity:activities.slice(0,3).map(a=>({time:a.time,text:a.title,status:'good'})),provenance:{synthetic:true,dataset:'presentation-demo',period,project,disclaimer:fixture.disclaimer}};
  }
  window.RRCC_BIND_DATA_SOURCE=originalBinder;
  window.RRCC_SET_DATA_MODE=function(mode){
    window.RRCC_DATA_MODE=mode==='source'?'source':'demo';
    Object.keys(names).forEach(key=>delete names[key]);
    if(window.RRCC_DATA_MODE==='source'){
      window.RRCC_DATA_MONTHS=[...sourceMonths];Object.assign(names,sourceNames);window.RRCC_ACTIVE_DATASET=sourceRoot;
    }else{
      window.RRCC_DATA_MONTHS=[...months];Object.assign(names,{all:'全部案場',...Object.fromEntries(data.projects.map(p=>[p.id,p.name]))});window.RRCC_ACTIVE_DATASET=fixture;
    }
    return window.RRCC_DATA_MODE;
  };
  window.RRCC_BIND_DATA=function(period,project='all'){
    if(window.RRCC_DATA_MODE==='source'){const result=originalBinder(period,project);window.RRCC_DATA_CONTEXT.mode='source';window.RRCC_ACTIVE_DATASET=sourceRoot;return result;}
    period=months.includes(period)?period:months.at(-1);project=project==='all'||projectMap[project]?project:'all';
    bindingProject=project;
    const s=getStats(period,project),allStats=months.map(m=>getStats(m,project));
    const pProjects=provenance('projects',s.projects),pMaterials=provenance('materials',s.materials),pSuppliers=provenance('suppliers',s.suppliers),pUsers=provenance('users',s.users),pOrganizations=provenance('organizations',s.organizations),pDeclarations=provenance('declarations',s.declarations),pCases=provenance('verificationCases',s.cases),pPermissions=provenance('permissionReminders',s.permissions),pHealth=provenance('systemHealth',[s.health]);
    const dRate=rate(s.declared.length,s.declarations.length),vRate=rate(s.verified.length,s.cases.length);
    const projectSeries=allStats.map(t=>t.projects.length),materialSeries=allStats.map(t=>t.materials.length),supplierSeries=allStats.map(t=>t.suppliers.length),userSeries=allStats.map(t=>t.users.length),declarationSeries=allStats.map(t=>rate(t.declared.length,t.declarations.length)),pendingSeries=allStats.map(t=>t.pending.length),verifiedSeries=allStats.map(t=>t.verified.length),issueSeries=allStats.map(t=>t.returned.length+t.abnormal.length),verificationSeries=allStats.map(t=>rate(t.verified.length,t.cases.length));
    const allMaterialTable=table('材料清單',['材料編號／名稱','材料分類','規格','供應商','案場'],s.materials.map(r=>[`${r.id} · ${r.name}`,r.category,r.specification,supplierMap[r.supplierId].name,projectMap[r.project].name]),'materials',s.materials);
    const orderedDeclarations=[...s.declared].sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt)).concat(s.pendingDeclarations);
    const declarationTable=table('最近材料申報',['材料編號／名稱','供應商','案場','申報日期','狀態'],orderedDeclarations.map(r=>[`${r.materialId} · ${materialMap[r.materialId].name}`,supplierMap[r.supplierId].name,projectMap[r.project].name,r.submittedAt?.slice(5,10)||`期限 ${r.dueAt.slice(5)}`,statusBadge(r.status)]),'declarations',orderedDeclarations);
    const supplierTable=table('供應商申報狀態',['供應商','材料數','完成率','狀態'],s.suppliers.map(r=>{const records=s.declarations.filter(d=>d.supplierId===r.id);return [r.name,format(records.length),{type:'progress',value:Number(rate(records.filter(d=>d.status==='declared').length,records.length).toFixed(1))},badge('正常')];}),'suppliers',s.suppliers,3);
    supplierTable.rowProvenance=s.suppliers.map(r=>combined(provenance('suppliers',[r]),provenance('declarations',s.declarations.filter(d=>d.supplierId===r.id))));
    supplierTable.provenance=combined(...supplierTable.rowProvenance);supplierTable.sourceTitle=`供應商申報狀態 · ${supplierTable.provenance.collection}`;
    const projectsTable=table('進行中工程案',['案場名稱','工程類型','進度','負責單位','預計完工'],s.projects.map(r=>[r.name,r.type,{type:'progress',value:r.progressByMonth[period]},r.organization,r.scheduledCompletion]),'projects',s.projects);
    const caseTable=(title,records,limit=5)=>table(title,['案件編號／內容','案場','審查人','到期日','狀態'],records.map(r=>[`${r.id} · ${r.title}`,projectMap[r.project].name,userMap[r.reviewerId].name,r.dueAt.slice(5),statusBadge(r.status)]),'verificationCases',records,limit);
    const orderedVerified=[...s.verified].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
    const allCases=caseTable('驗證案件',s.cases),pendingTable=caseTable('待驗證案件',s.pending),verifiedTable=table('最近驗證紀錄',['時間','驗證項目','審查人','結果'],orderedVerified.map(r=>[r.updatedAt.slice(5),r.title,userMap[r.reviewerId].name,statusBadge(r.status)]),'verificationCases',orderedVerified,3);
    const problemCases=[...s.returned,...s.abnormal];
    const issueCaseTable=table('退件與異常追蹤',['案件','原因','期限','狀態'],problemCases.map(r=>[r.id,r.reason,r.dueAt.slice(5),statusBadge(r.status)]),'verificationCases',problemCases,3);
    const abnormalTable=table('近期異常案件',['日期','案場','異常類型','狀態'],s.abnormal.map(r=>[r.updatedAt.slice(5,10),projectMap[r.project].name,r.reason,statusBadge(r.status)]),'verificationCases',s.abnormal,3);
    const materialIssueRecords=monthly('materialIssues',period,project);
    const materialIssueTable=table('材料異常追蹤',['材料','異常項目','到期日','狀態'],materialIssueRecords.map(r=>[materialMap[r.materialId].name,r.reason,r.dueAt.slice(5),statusBadge(r.status)]),'materialIssues',materialIssueRecords,3);
    const documents=monthly('documents',period,project);
    const documentTable=table('材料文件索引',['文件名稱','文件類型','版次','更新日期','狀態'],documents.map(r=>[r.name,r.type,r.revision,r.updatedAt.slice(5),statusBadge(r.status)]),'documents',documents);
    const tasksTable=table('管理待辦事項',['事項','負責單位','期限','狀態'],s.tasks.map(r=>[r.title,r.owner,r.dueAt.slice(5),statusBadge(r.status)]),'managementTasks',s.tasks,3);
    const activities=monthly('managementActivities',period,project),events=monthly('systemEvents',period,project),rules=active('rules',period,project);
    const orderedActivities=[...activities].sort((a,b)=>b.at.localeCompare(a.at)),orderedEvents=[...events].sort((a,b)=>b.at.localeCompare(a.at));
    const activityTable=table('最近管理活動',['操作項目','操作人員','所屬組織','時間','狀態'],orderedActivities.map(r=>[r.action,userMap[r.actorId].name,organizationMap[r.organizationId].name,r.at.slice(5),statusBadge(r.status)]),'managementActivities',orderedActivities);
    const eventsTable=table('系統事件',['時間','事件','來源','狀態'],orderedEvents.map(r=>[r.at.slice(5),r.event,r.service,statusBadge(r.status)]),'systemEvents',orderedEvents,3);
    const usersTable=table('使用者管理',['使用者','角色','所屬組織','案場','狀態'],s.users.map(r=>[r.name,r.role,organizationMap[r.organizationId].name,projectMap[r.project].name,statusBadge(r.status)]),'users',s.users);
    const organizationsTable=table('組織管理',['組織名稱','案場','使用者數','狀態'],s.organizations.map(r=>[r.name,projectMap[r.project].name,format(s.users.filter(u=>u.organizationId===r.id).length),statusBadge(r.status)]),'organizations',s.organizations);
    organizationsTable.rowProvenance=s.organizations.map(r=>combined(provenance('organizations',[r]),provenance('users',s.users.filter(u=>u.organizationId===r.id))));organizationsTable.provenance=combined(...organizationsTable.rowProvenance);
    const rolesTable=table('角色與權限',['使用者','目前角色','案場','狀態'],s.users.map(r=>[r.name,r.role,projectMap[r.project].name,badge('權限正常')]),'users',s.users);
    const permissionTable=table('權限提醒',['提醒事項','使用者','期限','狀態'],s.permissions.map(r=>[r.title,userMap[r.userId].name,r.dueAt.slice(5),statusBadge(r.status)]),'permissionReminders',s.permissions,3);
    const rulesTable=table('規則設定',['規則 ID','規則名稱','版本','狀態'],rules.map(r=>[r.id,r.name,r.version,statusBadge(r.status)]),'rules',rules);
    const healthTable=table('平台系統狀態',['指標','數值','目標','狀態'],[[`平台可用率（合成）`,`${format(s.health.availabilityPercent,2)}%`,`${format(s.health.targetPercent,2)}%`,badge('運作正常')]],'systemHealth',[s.health]);
    const overviewActions=[{icon:'report',label:'匯出案場總覽'},{icon:'building',label:'檢視工程案場'},{icon:'shield',label:'檢視待驗證案件'},{icon:'file',label:'查看材料文件'}];
    const materialActions=[{icon:'file',label:'檢視材料申報'},{icon:'box',label:'查看材料清單'},{icon:'users',label:'檢視供應商資料'},{icon:'report',label:'匯出材料報表'}];
    const verificationActions=[{icon:'clock',label:'檢視待驗證案件'},{icon:'file',label:'查看文件索引'},{icon:'return',label:'追蹤退件與異常'},{icon:'report',label:'匯出驗證紀錄'}];
    const managementActions=[{icon:'users',label:'檢視使用者'},{icon:'shield',label:'檢視角色與權限'},{icon:'building',label:'查看組織資料'},{icon:'history',label:'開啟系統事件'}];
    const targetMaterials=Math.ceil(s.materials.length*1.05),targetSites=s.projects.length;
    const overviewKpis=[card('案場數量',format(s.projects.length),'案場','building','green',projectSeries,pProjects,[`${s.projects.length} 個工程案場進行中；案場進度依同一份資料篩選。`],overviewActions,period,{target:targetSites,targetLabel:'本期納管案場',completion:100}),card('材料總數',format(s.materials.length),'項','box','blue',materialSeries,pMaterials,[`${s.materials.length} 項材料納入生命週期管理，對應供應商及案場。`],overviewActions,period,{target:targetMaterials,targetLabel:'本期材料納管目標'}),card('待驗證案件',format(s.pending.length),'件','clock','orange',pendingSeries,provenance('verificationCases',s.pending),[`${s.pending.length} 件依到期日排程驗證；${s.abnormal.length} 件異常追蹤中。`],overviewActions,period,{target:Math.max(40,s.pending.length),targetLabel:'待驗證容量上限',deltaType:'good'}),card('申報完成率',percent(dRate),'','check','purple',declarationSeries,pDeclarations,[`${s.declared.length} / ${s.declarations.length} 項材料已完成申報。`,'計算：已申報材料筆數 ÷ 當月全部材料申報筆數 × 100。'],overviewActions,period,{rate:true,target:98,targetLabel:'申報目標（%）',completion:dRate,comparisonLabel:'申報完成率',comparisonValue:percent(dRate)})];
    const materialKpis=[card('材料總數',format(s.materials.length),'項','box','blue',materialSeries,pMaterials,[`${s.materials.length} 項材料，涵蓋 ${new Set(s.materials.map(m=>m.category)).size} 類工程材料。`],materialActions,period,{target:targetMaterials}),card('待申報材料',format(s.pendingDeclarations.length),'項','file','orange',allStats.map(t=>t.pendingDeclarations.length),provenance('declarations',s.pendingDeclarations),[`${s.pendingDeclarations.length} 項待申報材料已列入本期追蹤清單。`],materialActions,period,{target:Math.max(100,s.pendingDeclarations.length),targetLabel:'待辦容量上限',deltaType:'good'}),card('供應商數量',format(s.suppliers.length),'家','users','purple',supplierSeries,pSuppliers,[`${s.suppliers.length} 家協作供應商，文件及材料申報狀態可查看。`],materialActions,period,{target:s.suppliers.length,targetLabel:'本期協作供應商',completion:100}),card('申報完成率',percent(dRate),'','check','green',declarationSeries,pDeclarations,[`${s.declared.length} 項已申報，${s.pendingDeclarations.length} 項待申報。`,'材料總數及申報狀態採同一資料集合。'],materialActions,period,{rate:true,target:98,targetLabel:'申報目標（%）',completion:dRate,comparisonLabel:'申報完成率',comparisonValue:percent(dRate)})];
    const verificationKpis=[card('待驗證案件',format(s.pending.length),'件','clock','blue',pendingSeries,provenance('verificationCases',s.pending),[`${s.pending.length} 件待驗證，採先到期先審查排程。`],verificationActions,period,{target:Math.max(40,s.pending.length),targetLabel:'待驗證容量上限',deltaType:'good'}),card('已驗證案件',format(s.verified.length),'件','shield','green',verifiedSeries,provenance('verificationCases',s.verified),[`${s.verified.length} 件已通過驗證，相關文件與材料可追溯。`],verificationActions,period,{target:Math.ceil(s.cases.length*.95),targetLabel:'本期已驗證目標'}),card('退件／異常',format(problemCases.length),'件','alert','orange',issueSeries,provenance('verificationCases',problemCases),[`${s.returned.length} 件退回補件、${s.abnormal.length} 件異常追蹤。`],verificationActions,period,{target:Math.max(10,problemCases.length),targetLabel:'追蹤容量上限',deltaType:'good'}),card('驗證完成率',percent(vRate),'','check','purple',verificationSeries,pCases,[`${s.verified.length} / ${s.cases.length} 件完成驗證。`,'計算：已驗證案件 ÷ 全部驗證案件（含待驗證、退件、異常）× 100。'],verificationActions,period,{rate:true,target:95,targetLabel:'驗證目標（%）',completion:vRate,comparisonLabel:'驗證完成率',comparisonValue:percent(vRate)})];
    const managementKpis=[card('使用者數量',format(s.users.length),'人','users','blue',userSeries,pUsers,[`${s.users.length} 位啟用使用者，依角色及案場授權。`],managementActions,period,{target:Math.ceil(s.users.length*1.1),targetLabel:'本期帳號規劃容量'}),card('組織／供應商',format(s.organizations.length+s.suppliers.length),'個','building','purple',allStats.map(t=>t.organizations.length+t.suppliers.length),combined(pOrganizations,pSuppliers),[`${s.organizations.length} 個工程組織與 ${s.suppliers.length} 家供應商。`],managementActions,period,{target:s.organizations.length+s.suppliers.length,targetLabel:'本期協作單位',completion:100}),card('權限提醒',format(s.permissions.length),'件','alert','orange',allStats.map(t=>t.permissions.length),pPermissions,[`${s.permissions.length} 件權限異動待複核，${s.tasks.length} 項管理待辦。`,'提醒屬正常治理流程，不代表正式系統發生安全事件。'],managementActions,period,{target:Math.max(5,s.permissions.length),targetLabel:'治理待辦容量上限',deltaType:'good'}),card('系統可用率',`${format(s.health.availabilityPercent,2)}%`,'','shield','green',allStats.map(t=>t.health.availabilityPercent),pHealth,['平台全域合成可用率，切換案場仍顯示同一平台健康情境。','此值僅供視覺展示，不是即時監控或實際 SLA 證據。'],managementActions,period,{rate:true,target:99.9,targetLabel:'展示服務目標（%）',completion:s.health.availabilityPercent,comparisonLabel:'展示服務狀態',comparisonValue:'運作正常',delta:'運作正常',deltaType:'good'})];
    const caseActivity=(records)=>[...records].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,3).map(r=>({time:r.updatedAt.slice(11),title:`${projectMap[r.project].name} · ${statusNames[r.status]}`,meta:r.id}));
    const materialActivity=[...s.declared].sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt)).slice(0,3).map(r=>({time:r.submittedAt.slice(11),title:`${projectMap[r.project].name} ${materialMap[r.materialId].name} 申報完成`,meta:r.id}));
    const managementActivity=orderedEvents.slice(0,3).map(r=>({time:r.at.slice(11),title:r.event,meta:r.service}));
    const engineeringParts=[...new Set(s.projects.map(r=>r.type))].map(label=>({label,amount:s.projects.filter(r=>r.type===label).length}));
    const materialParts=fixture.categories.map(label=>({label,amount:s.materials.filter(r=>r.category===label).length}));
    const verificationParts=['verified','pending','returned','abnormal'].map(status=>({label:statusNames[status],amount:s.cases.filter(r=>r.status===status).length}));
    const rolesParts=fixture.roles.map(label=>({label,amount:s.users.filter(r=>r.role===label).length}));
    const oDist=distribution('工程案場類型分布',s.projects.length,'個案場',engineeringParts,pProjects),mDist=distribution('材料類別分布',s.materials.length,'項材料',materialParts,pMaterials),vDist=distribution('驗證結果分布',s.cases.length,'件案件',verificationParts,pCases),gDist=distribution('權限角色分布',s.users.length,'位使用者',rolesParts,pUsers);
    const declarationTrend=trend('材料申報趨勢','材料筆數',allStats.map(t=>t.declared.length),allStats.map(t=>t.pendingDeclarations.length),['申報完成','待申報'],pDeclarations),verificationTrend=trend('驗證案件趨勢','驗證件數',verifiedSeries,pendingSeries,['已驗證','待驗證'],pCases),managementTrend=trend('使用者／供應商趨勢','啟用數量',userSeries,supplierSeries,['啟用使用者','協作供應商'],combined(pUsers,pSuppliers));
    const oAlert={title:`${s.pending.length} 件待驗證 · ${s.abnormal.length} 件異常`,body:`申報完成 ${percent(dRate)}；少量異常已列入追蹤，所有紀錄均為合成展示情境。`};
    const mAlert={title:`${s.pendingDeclarations.length} 項待申報 · ${materialIssueRecords.length} 項提醒`,body:'供應商及材料文件依流程持續補齊；數值為合成展示情境。'};
    const vAlert={title:`${s.returned.length} 件補件 · ${s.abnormal.length} 件異常追蹤`,body:`${s.pending.length} 件待驗證依到期日排程，請使用檢視操作查看合成案件。`};
    const gAlert={title:`${s.permissions.length} 件權限提醒 · ${s.tasks.length} 項待辦`,body:'平台展示狀態正常；權限異動屬例行複核，並非實際安全事件。'};
    window.CENTER_DATA={
      overview:base('overview',overviewKpis,{trend:declarationTrend,distribution:oDist},{table:projectsTable,secondary:abnormalTable,tertiary:tasksTable},overviewActions,caseActivity(s.verified),oAlert,[projectsTable,projectsTable,declarationTable,declarationTable,allCases,abnormalTable,'trend'],['export',projectsTable,pendingTable,documentTable],period,project,{1:s.projects.length,4:s.pending.length,5:s.abnormal.length}),
      material:base('material',materialKpis,{trend:declarationTrend,distribution:mDist},{table:declarationTable,secondary:supplierTable,tertiary:materialIssueTable},materialActions,materialActivity,mAlert,[allMaterialTable,supplierTable,declarationTable,documentTable,'distribution',materialIssueTable,'trend'],[declarationTable,allMaterialTable,supplierTable,'export'],period,project,{1:s.suppliers.length,2:s.pendingDeclarations.length,5:materialIssueRecords.length}),
      verification:base('verification',verificationKpis,{trend:verificationTrend,distribution:vDist},{table:pendingTable,secondary:verifiedTable,tertiary:issueCaseTable},verificationActions,caseActivity(s.verified),vAlert,[pendingTable,allCases,documentTable,caseTable('退件管理',s.returned),caseTable('異常追蹤',s.abnormal),verifiedTable,'trend'],[pendingTable,documentTable,issueCaseTable,'export'],period,project,{0:s.pending.length,2:documents.length,3:s.returned.length,4:s.abnormal.length}),
      management:base('management',managementKpis,{trend:managementTrend,distribution:gDist},{table:activityTable,secondary:eventsTable,tertiary:tasksTable},managementActions,managementActivity,gAlert,[usersTable,organizationsTable,supplierTable,rolesTable,rulesTable,healthTable,'trend'],[usersTable,rolesTable,organizationsTable,eventsTable],period,project,{3:s.permissions.length,5:s.tasks.length})
    };
    window.CENTER_DATA.management.permissionTable=permissionTable;
    window.RRCC_ACTIVE_DATASET=fixture;
    window.RRCC_DATA_CONTEXT={mode:'demo',synthetic:true,datasetId:fixture.datasetId,period,project,months:[...months],materialCount:s.materials.length,declarationCount:s.declarations.length,declaredCount:s.declared.length,pendingDeclarationCount:s.pendingDeclarations.length,verificationCount:s.cases.length,pendingVerificationCount:s.pending.length,verifiedCount:s.verified.length,returnedCount:s.returned.length,abnormalCount:s.abnormal.length,supplierCount:s.suppliers.length,userCount:s.users.length,organizationCount:s.organizations.length,permissionReminderCount:s.permissions.length,managementTaskCount:s.tasks.length,availabilityPercent:s.health.availabilityPercent,disclaimer:fixture.disclaimer};
    return window.CENTER_DATA;
  };
  window.RRCC_SET_DATA_MODE(new URLSearchParams(window.location.search).get('data-mode')==='source'?'source':'demo');
  window.RRCC_BIND_DATA(window.RRCC_DATA_MONTHS.at(-1),'all');
})();
