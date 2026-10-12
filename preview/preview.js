/* Browser-local demonstration only. No network calls or production mutations. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const escape = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons = {
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3.5"/>',
    box:'<path d="m12 3 9 5v9l-9 5-9-5V8l9-5Z"/><path d="m3 8 9 5 9-5M12 13v9M7.5 5.5l9 5"/>',
    shield:'<path d="M12 3c3 2 6 3 9 3v6c0 5-5 8-9 10-4-2-9-5-9-10V6c3 0 6-1 9-3Z"/><path d="m8 12 3 3 5-6"/>',
    settings:'<path d="m9 3-.5 3-2 1.2L3.7 6 2 9l2.4 1.8v2.4L2 15l1.7 3 2.8-1.2 2 1.2.5 3h6l.5-3 2-1.2 2.8 1.2 1.7-3-2.4-1.8v-2.4L22 9l-1.7-3-2.8 1.2-2-1.2L15 3H9Z"/><circle cx="12" cy="12" r="3.3"/>',
    search:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9ZM10 21h4M12 2v1"/>',
    building:'<path d="M3 21h18M5 21V5h10v16M15 10h4v11M8 8h1m3 0h1M8 11h1m3 0h1M8 14h1m3 0h1M9 21v-4h3v4"/>',
    leaf:'<path d="M20 3C8 2 3 8 4 14c1 6 7 7 11 3 4-4 4-10 5-14Z"/><path d="M3 22 15 9M8 17l-1-6m5 2 5 1"/>',
    alert:'<path d="M10.3 3.6 1.8 18.3A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-2.7L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v5m0 3h.01"/>',
    file:'<path d="M14 2H5v20h14V7l-5-5Z"/><path d="M14 2v5h5M8 11h8M8 15h8M8 18h5"/>',
    folder:'<path d="M3 6V4h7l2 3h9v14H3V6Z"/><path d="M3 10h18"/>',
    users:'<circle cx="9" cy="7" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M16 4a3 3 0 0 1 0 6m3 11v-3a7 7 0 0 0-3-5"/>',
    layers:'<path d="m12 3 10 5-10 5L2 8l10-5Zm-9 10 9 5 9-5M3 18l9 5 9-5"/>',
    chart:'<path d="M4 3v18h18M8 17v-5m5 5V8m5 9V5"/>',
    database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0"/>',
    clipboard:'<path d="M8 4H4v18h16V4h-4M8 2h8v5H8zM8 12h8M8 16h5"/>',
    list:'<path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>',
    clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>',
    return:'<path d="m8 3-5 5 5 5M3 8h12a6 6 0 0 1 0 12H8"/>',
    history:'<path d="M3 10a9 9 0 1 1 1 7M3 3v7h7M12 7v5l3 2"/>',
    report:'<path d="M14 2H4v20h16V8l-6-6Z"/><path d="M14 2v6h6M8 17v-3m4 3v-6m4 6v-4"/>',
    rules:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="white"/><circle cx="16" cy="12" r="2" fill="white"/><circle cx="10" cy="18" r="2" fill="white"/>',
    calendar:'<rect x="3" y="5" width="18" height="17" rx="2"/><path d="M7 2v6M17 2v6M3 11h18M7 15h2m4 0h2M7 18h2"/>',
    chevron:'<path d="m6 9 6 6 6-6"/>',
    download:'<path d="M12 2v13m-5-5 5 5 5-5M4 15v6h16v-6"/>',
    close:'<path d="m5 5 14 14M19 5 5 19"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    external:'<path d="M14 3h7v7M21 3 10 14M10 3H3v18h18v-7"/>',
    plus:'<path d="M12 4v16M4 12h16"/>'
  };
  const icon = (name, cls='') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.file}</svg>`;
  const centers = [
    {id:'overview',label:'總覽中心',icon:'eye',number:'01'},
    {id:'material',label:'材料中心',icon:'box',number:'02'},
    {id:'verification',label:'驗證中心',icon:'shield',number:'03'},
    {id:'management',label:'管理中心',icon:'settings',number:'04'}
  ];
  const defaults = {overview:0,material:3,verification:3,management:3};
  const state = {center:'overview',metric:0,sidebar:0,rightTab:'summary',period:window.RRCC_DATA_MONTHS?.at(-1)||'2026-09',project:'all'};
  const projectNames = window.RRCC_PROJECT_NAMES||{all:'全部案場'};
  let toastTimer,externalTable,detailProvenance;
  function toast(message) { $('toast').textContent=message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3100); }
  function resize() {
    for(const key of ['transform','left','top','width','height'])$('stage').style[key]='';
  }
  function current() { return window.CENTER_DATA[state.center]; }
  function isPresentation() {return window.RRCC_DATA_MODE==='demo';}
  function referenceMarkup(ids) {
    const root=window.RRCC_PUBLIC_REFERENCES,records=(root?.records||[]).filter(r=>!ids?.length||ids.includes(r.id));
    return `<p class="public-reference-note">公開產業參考，非 RRCC／漢唐營運數據。年度、單位與報告範圍不同，不與本平台材料、帳號、驗證案件相加，也不代表本平台實績。</p><div class="reference-values">${records.map(r=>`<article class="reference-value"><h3>${escape(r.label)}</h3><strong>${escape(Number(r.value).toLocaleString('en-US',{minimumFractionDigits:r.decimals||0,maximumFractionDigits:r.decimals||0}))} <small>${escape(r.unit)}</small></strong><p>${escape(r.organization)} · ${escape(r.year)}<br>${escape(r.scope||r.definition||'依官方報告口徑')}</p><a href="${escape(r.url)}" target="_blank" rel="noopener noreferrer">官方來源 ↗</a></article>`).join('')}</div>`;
  }
  function cell(value) {
    if (typeof value !== 'object' || value === null) return `<span title="${escape(value)}">${escape(value)}</span>`;
    if (value.type==='progress') return `<span class="progress-cell"><span class="progress-track"><i class="${value.value>=60?'good':''}" style="width:${value.value}%"></i></span>${value.value}%</span>`;
    if (value.type==='badge') return `<span class="badge ${escape(value.tone)}">${escape(value.text)}</span>`;
    if (value.type==='person') return `<span class="person"><span class="person-avatar">${escape(value.initial)}</span><span><strong>${escape(value.name)}</strong><small>${escape(value.role)}</small></span></span>`;
    return '';
  }
  function filteredRows(table) {
    if(window.RRCC_BIND_DATA)return table.rows;
    if(state.project==='all') return table.rows;
    const aliases={tainan:['台南 A 案','A 案','精誠特材','VER-00461'],hsinchu:['新竹 B 案','B 案','潔能科技','VER-00460','VER-00442'],taichung:['台中 C 案','C 案','日盛流體','PFA','VER-00459','VER-00438']};
    const allAliases=Object.values(aliases).flat();
    const rowText=r=>r.filter(v=>typeof v==='string').join(' ');
    const scoped=table.rows.some(r=>allAliases.some(a=>rowText(r).includes(a)));
    // Governance and aggregate tables without an identifiable project remain platform-wide.
    if(state.center==='management'||!scoped) return table.rows;
    return table.rows.filter(r=>aliases[state.project].some(a=>rowText(r).includes(a)));
  }
  function tableMarkup(table, kind,preview=false) {
    const allRows=filteredRows(table),rows=preview?allRows.slice(0,table.previewLimit||5):allRows;
    const widths={overview:{table:[22,22,23,19,14],secondary:[18,22,41,19],tertiary:[44,18,18,20]},material:{table:[36,20,17,12,15],secondary:[33,17,31,19],tertiary:[31,35,15,19]},verification:{table:[38,18,16,13,15],secondary:[24,42,17,17],tertiary:[26,40,17,17]},management:{table:[34,16,22,14,14],secondary:[16,43,23,18],tertiary:[42,24,17,17]}};
    const cols=table.widths||widths[state.center][kind]||(table.columns.length===5?[36,20,17,12,15]:[30,25,25,20]);
    return `<table aria-label="${escape(table.title)}"><thead><tr>${table.columns.map((c,i)=>`<th scope="col" style="width:${cols[i]}%">${escape(c)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr tabindex="0" data-row="${kind}" data-row-index="${table.rows.indexOf(r)}" aria-label="查看${escape(typeof r[0]==='string'?r[0]:table.title)}">${r.map(v=>`<td>${cell(v)}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${table.columns.length}" style="text-align:center;color:#647e98;height:65px">${isPresentation()?'本範圍目前無待處理項目':'原始來源未提供此工作流紀錄'}</td></tr>`}</tbody></table>${!rows.length&&!isPresentation()?`<button type="button" class="text-link" data-public-reference>檢視有來源的產業參考數據 ↗</button>`:''}`;
  }
  function renderTrend(data, highlight=true) {
    const w=640,h=200,x0=57,x1=622,y0=15,y1=173;
    const months=data.months||Array.from({length:data.bars.length},(_,i)=>`2026-${String(i+1).padStart(2,'0')}`);
    const step=(x1-x0)/Math.max(1,months.length);
    const x=(i)=>x0+step*(i+.5), y=(v)=>y1-v/data.max*(y1-y0);
    const currentMonth=months.indexOf(state.period);
    const line=(arr)=>arr.map((v,i)=>typeof v==='number'?`${x(i).toFixed(1)},${y(v).toFixed(1)}`:null).filter(Boolean).join(' ');
    const monthLabel=i=>`${Number(months[i]?.slice(-2))}月`;
    const bars=data.bars.map((v,i)=>typeof v==='number'?`<rect x="${x(i)-step*.22}" y="${y(v)}" width="${step*.44}" height="${y1-y(v)}" rx="2" fill="url(#bar-fill-${state.center})" opacity="${i===currentMonth?1:.78}"><title>${escape(months[i])} ${escape(data.legend[0])}：${v.toLocaleString('en-US')}</title></rect>`:'').join('');
    const curve=(values,color,dashed='')=>values.some(v=>typeof v!=='number')?'':`<polyline points="${line(values)}" fill="none" stroke="${color}" stroke-width="1.8" stroke-dasharray="${dashed}"/>${values.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="${color}"/>`).join('')}`;
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${escape(data.title)}，${escape(months.join('、'))}來源資料"><defs><linearGradient id="bar-fill-${state.center}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#479afa"/><stop offset="1" stop-color="#8ac2ff"/></linearGradient></defs><text x="9" y="9" class="chart-unit">${escape(data.unit)}</text>${data.ticks.map(v=>`<line x1="${x0}" y1="${y(v)}" x2="${x1}" y2="${y(v)}" stroke="#e8eff8"/><text x="${x0-11}" y="${y(v)+4}" text-anchor="end" class="chart-text">${Number(v).toLocaleString('en-US')}</text>`).join('')}${bars}${curve(data.previous,'#a8bad2','4 3')}${curve(data.line,'#16b393')}${months.map((_,i)=>`<text x="${x(i)}" y="192" text-anchor="middle" class="chart-text" style="${highlight&&i===currentMonth?'fill:#2479ce;font-weight:700':''}">${monthLabel(i)}</text>`).join('')}</svg>`;
  }
  function renderDonut(data) {
    const c=2*Math.PI*78;let offset=0;
    const arcs=data.items.map(item=>{const a=`<circle cx="103" cy="103" r="78" fill="none" stroke="${item.color}" stroke-width="35" stroke-dasharray="${item.value*c/100} ${c}" stroke-dashoffset="${-offset*c/100}"><title>${escape(item.label)} ${item.value}%</title></circle>`;offset+=item.value;return a;}).join('');
    return `<div class="donut"><svg viewBox="0 0 206 206" role="img" aria-label="${escape(data.title)}">${arcs}</svg><div class="donut-center"><strong>${escape(data.total)}</strong><span>${escape(data.unit)}</span></div></div><div class="distribution-legend">${data.items.map(item=>`<div><i style="background:${item.color}"></i><span>${escape(item.label)}</span><strong>${Number(item.value.toFixed(1))}%</strong></div>`).join('')}</div>`;
  }
  function spark(values,months=window.RRCC_DATA_MONTHS) {
    if(!values.length||values.some(v=>typeof v!=='number'))return '<div class="source-empty">來源未列跨月時間序列；不將年度數值插補成月資料。</div>';
    const low=Math.min(...values),high=Math.max(...values),pad=Math.max((high-low)*.35,.01),min=low-pad,max=high+pad;
    const points=values.map((v,i)=>[16+i*290/Math.max(1,values.length-1),52-(v-min)/(max-min||1)*40]);
    const coords=points.map(p=>p.join(',')).join(' ');
    const month=Number(state.period.slice(-2));
    return `<svg viewBox="0 0 322 86" role="img" aria-label="來源月份趨勢"><defs><linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2eb5a0" stop-opacity=".12"/><stop offset="1" stop-color="#2eb5a0" stop-opacity="0"/></linearGradient></defs><path d="M16 55H306M16 27H306" stroke="#e6eff8"/><path d="M${points[0].join(',')} L${points.slice(1).map(p=>p.join(',')).join(' L')} L306 55H16Z" fill="url(#spark-fill)"/><polyline points="${coords}" stroke="#15a68d" fill="none" stroke-width="1.7"/>${points.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="#25b69c"/>`).join('')}${points.map(([x],i)=>`<text x="${x}" y="75" text-anchor="middle" class="chart-text">${months?.[i]?Number(months[i].slice(-2)):i+1}月</text>`).join('')}</svg>`;
  }
  function selectedRight() {
    const data=current(),k=data.kpis[state.metric];
    if(k.detail)return k.detail;
    if(state.metric===defaults[state.center]) return state.center==='management'?{...data.right,comparisonLabel:'本月可用率',comparisonValue:'99.98%',comparisonColor:'#15b69a'}:data.right;
    const targets={overview:['15,000','10','0','100'],material:['2,600','0','50','98'],verification:['0','460','0','95'],management:['200','60','0','99.9']};
    const notes={overview:[['追蹤供應鏈材料與工程相關排放','彙整跨案場資料及佐證來源','本期排放量較上月下降 8.2%'],['8 件工程案納入跨案場管理','涵蓋無塵室、機電與製程建設','優先追蹤進度落後及文件缺漏'],['3 件跨案場異常持續追蹤','材料數量、文件及係數各 1 件','最近到期日為 10/15'],['證據文件依案件關聯管理','查核版本與證明有效日期','本期證據完整率提高 5%']],material:[['本期納入 2,486 項工程材料','製程管材占 32%，為最大類別','支援依供應商與材料批次追蹤'],['86 項材料仍待完成申報','較上月減少 24 項待申報材料','優先補齊材證與原產地證明'],['48 家供應商參與材料申報','本月新增 3 家合格供應商','日盛流體尚有待補件資料'],['本期申報完成率為 96.5%','申報目標為 98%','7 項材料異常仍在追蹤']],verification:[['32 件驗證案件尚待處理','2 件案件將於明日到期','以材料材證與效能報告優先'],['428 件案件已完成驗證','本月完成數增加 56 件','驗證結果可追溯至審查人員'],['6 件退件與 3 件異常追蹤','優先補正原產地證明缺頁','檢查測試報告與係數來源'],['本期驗證完成率為 93%','距離 95% 目標尚差 2%','所有判定保留版本與紀錄']],management:[['186 位使用者已啟用','含工程、材料、供應商與驗證人員','本月新增 12 位使用者'],['8 個內部組織與 48 家供應商','帳號與組織關聯統一管理','潔能科技組織資料待核准'],['2 件權限異常待複核','1 個跨案場存取與 1 個角色異動','季度角色權限檢視於 10/20 到期'],['本月系統可用率為 99.98%','服務目標為 99.9%','每日備份與排程報表運作正常']]};
    const series={overview:[[13850,13520,13270,12980,13530,12420],[4,5,5,6,6,8],[8,7,6,6,5,3],[81,83,84,86,87,92]],material:[[1902,2015,2164,2268,2360,2486],[142,133,128,119,110,86],[39,41,43,44,45,48],[89.2,90.8,92.4,93.6,94.4,96.5]],verification:[[48,45,43,41,40,32],[230,268,309,341,372,428],[21,18,17,15,13,9],[82.1,85.4,88.2,90.1,89.2,93]],management:[[132,144,152,160,174,186],[42,44,48,50,53,56],[8,7,5,6,5,2],[99.92,99.96,99.94,99.98,99.97,99.98]]};
    const target=targets[state.center][state.metric],value=parseFloat(k.value.replace(/,/g,'')),zeroTarget=Number(target)===0;
    return {...data.right,kpiLabel:k.label,value:k.value,unit:k.unit,delta:k.delta,target,targetLabel:zeroTarget?'待處理目標':'管理目標',completion:zeroTarget?0:Math.min(100,Math.round(value/parseFloat(target.replace(/,/g,''))*1000)/10),comparisonLabel:zeroTarget?'待處理':null,comparisonValue:zeroTarget?`${k.value} ${k.unit}`:null,notes:notes[state.center][state.metric],spark:series[state.center][state.metric],trendTitle:`近 6 個月${k.label.replace('（範疇三）','')}趨勢`};
  }
  function librarySourceMarkup(k,info) {
    const definition=window.RRCC_KPI_LIBRARY_DATA.registry.cards.find(card=>card.cardId===k.cardId);
    return `<div class="audit-banner">${escape(k.cardId)} · 唯一 KPI 定義／跨中心引用<br>資料狀態：${escape(info.status)} · 不將來源缺值轉成 0</div><h3>核准卡片定義</h3><pre class="library-source-json">${escape(JSON.stringify(definition,null,2))}</pre><h3>本次計算與範圍</h3><pre class="library-source-json">${escape(JSON.stringify({definition:info.definition,requestedScope:info.requestedScope,availableScope:info.availableScope,numericValue:info.numericValue,source:info.source,provenance:k.provenance},null,2))}</pre><p>V1／V2 原始資料未覆寫；同一實體已去重，不重複加總。完整計算列可由 KPI 明細匯出。</p>`;
  }
  function renderLibraryRight(k) {
    const info=k.detail.libraryData;
    const valuePresent=typeof info.numericValue==='number'&&Number.isFinite(info.numericValue);
    $('right-panel').innerHTML=`<div class="right-heading"><h2>KPI 詳細資訊</h2><button data-collapse-right aria-label="收合詳細資訊">${icon('close')}</button></div><div class="right-body"><div class="right-kpi-label">${icon(k.icon)}${escape(k.label)}</div><div class="library-kpi-id">${escape(k.cardId)} · V2 原始定義</div><div class="right-content"><div class="right-current"><div><small>${valuePresent?'來源計算值':'此範圍尚無可用來源'}</small><div class="right-value library-metric-value">${escape(k.value)}<span>${escape(k.unit)}</span></div></div></div><div class="audit-banner">${escape(info.status)}<br>要求範圍：${escape(state.period)} / ${escape(projectNames[state.project])}<br>此卡僅使用 V1／V2 整合來源，不引用合成展示值。</div><h3 class="right-section-title">計算規則</h3><pre class="library-rule">${escape(info.definition?.definition||info.definition)}\n${escape(info.formula||info.definition?.formula||'尚未提供')}</pre>${valuePresent?`<h3 class="right-section-title">來源月份趨勢<span>2026-07～09</span></h3><div class="right-spark">${spark(k.series,k.seriesMonths)}</div>`:''}<h3 class="right-section-title">來源與可追溯性</h3><p class="library-panel-note">${valuePresent?`${info.rows?.length||0} 列計算明細，保留原始欄位及資料位置。`:escape(info.reason||'不自動改用其他月份、案場或虛構示範值。請在卡片櫃明確選擇「檢視 V1／V2 來源月份」。')}</p><button class="primary-button" data-library-detail>完整數據與計算明細</button><button class="text-link library-source-button" data-library-source>完整來源、SHA-256 與卡片定義 ↗</button><p class="library-panel-note">跨中心引用同一 Card ID；卡片設定不會複製資料來源。材料隱含碳僅為原 Demo 估算，不是認證排放結果。</p></div></div>`;
    $('right-panel').dataset.sourceTitle='V1／V2 Canonical KPI Registry';
    window.RRCC_CHART_MOTION?.refresh($('right-panel'));
  }
  function openLibraryDetail() {
    const k=current().kpis[state.metric],info=k.detail.libraryData;
    const rowProvenance=(info.rawRecords||[]).map(record=>{
      const index=window.RRCC_MERGED.data.rows.findIndex(row=>row.id===record.id);
      return {...k.provenance,canonicalPointers:index>=0?[`/data/rows/${index}`]:[],sourceReferences:window.RRCC_MERGED.provenance?.rows?.[record.id]?.recordSources||[]};
    });
    externalTable={title:`${k.label} · 完整來源計算列`,columns:info.columns||[],rows:info.rows||[],rowProvenance,provenance:k.provenance,libraryData:info,sourceTitle:`${k.cardId} / ${info.status}`};
    openDetail('external');
    $('dialog-content').insertAdjacentHTML('beforeend',`<details class="library-raw-details"><summary>完整原始紀錄（${info.rawRecords?.length||0} 筆）與計算定義</summary><pre class="library-source-json">${escape(JSON.stringify({definition:info.definition,source:info.source,schema:info.schema,records:info.rawRecords,materials:info.materialRecords},null,2))}</pre></details>`);
  }
  function renderRight() {
    const data=current(),r=selectedRight(),active=state.rightTab;
    if(r.libraryData){renderLibraryRight(data.kpis[state.metric]);return;}
    let body='';
    if(active==='summary') body=`<div class="right-current"><div><small>當前數值</small><div class="right-value">${escape(r.value)}<span>${escape(r.unit)}</span></div></div><div class="right-delta"><span class="delta">${escape(r.delta)}</span><small>vs. 上月</small></div></div><div class="right-targets"><div><small>${escape(r.targetLabel)}</small><strong>${escape(r.target)} <span>${r.targetLabel.includes('%')?'':escape(r.unit)}</span></strong></div><div><small>${state.center==='overview'&&state.metric===0?'達成率':'完成率'}</small><strong>${r.completion}%</strong><div class="right-progress"><i style="width:${r.completion}%"></i></div></div></div><h3 class="right-section-title">${escape(r.trendTitle)}<span>2026</span></h3><div class="right-spark">${spark(r.spark)}</div><h3 class="right-section-title">${escape(r.notesTitle)}</h3><ul class="right-notes">${r.notes.map(n=>`<li>${escape(n)}</li>`).join('')}</ul><h3 class="right-section-title">${escape(r.activityTitle)}<button class="text-link" data-open-activity>查看全部 ›</button></h3><div class="right-activity">${r.activities.map(a=>`<div class="right-activity-item"><i></i><div><strong>${escape(a.title)}</strong><small>${escape(a.meta)}</small></div><time>${escape(a.time)}</time></div>`).join('')}</div><button class="right-alert" data-open-alert>${icon('alert')}<div><strong>${escape(r.alert.title)}</strong><p>${escape(r.alert.body)}</p></div></button><h3 class="right-section-title">${escape(r.quickTitle)}</h3><div class="quick-actions">${r.actions.map((a,i)=>`<button data-action="${i}">${icon(a.icon)}${escape(a.label)}</button>`).join('')}</div>`;
    else if(active==='distribution') body=`<div class="right-tab-content"><h3>${escape(data.distribution.title)}</h3>${data.distribution.items.map(v=>`<div class="evidence-link"><i class="legend-dot" style="background:${v.color}"></i><span>${escape(v.label)}</span><strong>${Number(v.value.toFixed(1))}%</strong></div>`).join('')}<h3>管理範圍</h3><p>${escape(data.subtitle)}</p><div class="audit-banner">目前範圍：${escape(projectNames[state.project])}<br>資料期間：${escape(state.period)}</div></div>`;
    else if(active==='exceptions') {const kind=state.center==='overview'?'secondary':'tertiary';body=`<div class="right-tab-content"><h3>${escape(r.alert.title)}</h3><p>${escape(r.alert.body)}</p><h3>${escape(data[kind].title)}</h3><div class="data-table compact">${tableMarkup(data[kind],kind)}</div><h3>處理重點</h3><ul class="right-notes">${r.notes.map(n=>`<li>${escape(n)}</li>`).join('')}</ul></div>`;}
    else body=`<div class="right-tab-content"><h3>${escape(centers.find(c=>c.id===state.center).label)}關聯文件</h3>${['本期管理摘要.pdf','案件與材料明細.xlsx','審查與異常追蹤紀錄.pdf','資料來源與版本索引'].map((n,i)=>`<button class="evidence-link" data-evidence="${i}">${icon(i===1?'report':'file')}<span>${escape(state.period)} ${escape(n)}</span>${icon('external')}</button>`).join('')}<div class="audit-banner">展示文件索引可查看內容與關聯資訊。</div></div>`;
    $('right-panel').innerHTML=`<div class="right-heading"><h2>${escape(r.title)}</h2><button data-collapse-right aria-label="收合詳細資訊">${icon('close')}</button></div><div class="right-body"><div class="right-kpi-label">${icon(data.kpis[state.metric].icon)}${escape(r.kpiLabel)}</div><nav class="right-tabs" aria-label="詳細資訊分頁">${[['summary','摘要'],['distribution',state.center==='management'?'角色分布':'分類分布'],['exceptions',state.center==='management'?'管理提醒':'異常分析'],['evidence','證據文件']].map(([id,label])=>`<button data-right-tab="${id}" class="${id===active?'active':''}" aria-selected="${id===active}">${label}</button>`).join('')}</nav><div class="right-content">${body}</div></div><div class="right-collapsed-message">${escape(centers.find(c=>c.id===state.center).label)}<br>選擇上方 KPI 以查看詳細資訊<button class="primary-button" data-restore-right>展開詳細資訊</button></div>`;
    if(window.RRCC_MERGED&&!isPresentation()){
      const tabs=$('right-panel').querySelectorAll('[data-right-tab]');tabs[1].textContent='來源分布';tabs[2].textContent='資料限制';tabs[3].textContent='來源索引';
      if(active==='evidence')$('right-panel').querySelector('.right-body').lastElementChild.innerHTML=`<h3>原始 JSON 與欄位追溯</h3>${window.RRCC_MERGED.sources.map((s,i)=>`<button class="evidence-link" data-evidence="${i}">${icon('file')}<span>${escape(s.path)}<br>SHA256 ${escape(s.sha256.slice(0,20))}…</span>${icon('external')}</button>`).join('')}<div class="audit-banner">${escape(r.sourceTitle)}<br>來源索引可查看原始欄位與完整 SHA256，沒有虛構 PDF 文件。</div>`;
      const foot=$('right-panel').querySelector('.right-delta small');if(foot)foot.textContent='來源標記，非同比';
      const target=$('right-panel').querySelector('.right-targets>div:first-child strong');if(target)target.textContent='原始來源未列目標';
      $('right-panel').dataset.sourceTitle=r.sourceTitle;
    }
    if(isPresentation()){
      const tabs=$('right-panel').querySelectorAll('[data-right-tab]');tabs[3].textContent='展示資料來源';
      if(active==='evidence')$('right-panel').querySelector('.right-body').lastElementChild.innerHTML=`<h3>合成展示資料集</h3><button class="evidence-link" data-evidence="0">${icon('database')}<span>RRCC 四中心展示資料 v1.3<br>非實際營運、申報或合規結果</span>${icon('external')}</button><div class="audit-banner">KPI、圖表與表格由同一份合成資料計算；原始 V1／V2 JSON 未修改。可用頁尾按鈕切回原始來源模式。</div>`;
      $('right-panel').dataset.sourceTitle=r.sourceTitle||'合成展示資料';
    }
    if(r.publicReference){
      const tabs=$('right-panel').querySelectorAll('[data-right-tab]');['摘要','範疇定義','原始缺口','官方來源'].forEach((label,i)=>tabs[i].textContent=label);
      const ids=r.provenance?.referenceIds||[];
      const original=r.publicReference.originalMetric;
      const originalLabel=original&&typeof original==='object'?original.label:original;
      const content=$('right-panel').querySelector('.right-body').lastElementChild;
      content.innerHTML=`<div class="right-tab-content"><h3>${active==='exceptions'?'原始來源缺口與參考界線':'公開報告參考值'}</h3>${originalLabel?`<p class="public-reference-note">原「${escape(originalLabel)}」的 RRCC 業務紀錄仍未提供。此卡改用明確標名的外部報告指標，並非補造原始營運數字。</p>`:''}${referenceMarkup(ids)}<button type="button" class="text-link" data-public-reference>查看全部公開參考與口徑 ↗</button></div>`;
      $('right-panel').dataset.sourceTitle=r.sourceTitle;
    }
    applyMetricComparison();
    window.RRCC_CHART_MOTION?.refresh($('right-panel'));
  }
  function applyMetricComparison() {
    const r=selectedRight();
    if(r.publicReference||r.libraryData)return;
    if(!r.comparisonLabel||state.rightTab!=='summary') return;
    const box=$('right-panel').querySelector('.right-targets>div:nth-child(2)');
    box.querySelector('small').textContent=r.comparisonLabel;
    box.querySelector('strong').textContent=r.comparisonValue;
    const bar=box.querySelector('.right-progress i');bar.style.width=r.comparisonColor?`${r.completion}%`:parseFloat(r.value)>0?'100%':'0';bar.style.background=r.comparisonColor||'#f3a25c';
    if(window.RRCC_MERGED&&!isPresentation())box.querySelector('.right-progress').hidden=true;
    if(r.comparisonColor&&(!isPresentation()||(state.center==='management'&&state.metric===3)))$('right-panel').querySelector('.right-delta small').textContent='服務狀態';
  }
  let panelMotion;
  function metricSource(metric=state.metric) {return {id:`kpi-${state.center}-${metric}`};}
  function render(resetPanel=false) {
    if(!resetPanel)panelMotion?.settle();
    window.RRCC_BIND_DATA?.(state.period,state.project);
    if(window.RRCC_DATA_CONTEXT){state.period=window.RRCC_DATA_CONTEXT.period;state.project=window.RRCC_DATA_CONTEXT.project;}
    const data=current(),meta=centers.find(c=>c.id===state.center);
    const visibleMetrics=window.RRCC_KPI_SETTINGS?.visible(state.center,data.kpis,window.RRCC_DATA_MODE)||data.kpis.map((_,i)=>i);
    if(!visibleMetrics.includes(state.metric))state.metric=visibleMetrics[0]??0;
    document.title=`${meta.label}｜RRCC × 漢唐集成 4-Center Preview`;
    $('stage').dataset.center=state.center;
    $('stage').dataset.dataMode=isPresentation()?'demo':'source';
    $('period-select').value=state.period;$('project-select').value=state.project;
    const modeButton=$('data-mode-toggle');if(modeButton){modeButton.textContent=isPresentation()?'DEMO 合成展示資料 · 切換來源':'V1／V2 原始來源 · 切換展示';modeButton.setAttribute('aria-pressed',String(isPresentation()));}
    $('center-nav').innerHTML=centers.map(c=>`<a href="#${c.id}" class="center-tab ${c.id===state.center?'active':''}" data-center="${c.id}" aria-current="${c.id===state.center?'page':'false'}" aria-label="${c.label} ${window.CENTER_DATA[c.id].en}">${icon(c.icon)}<span>${c.label}</span></a>`).join('');
    $('center-number').textContent=meta.number;
    $('center-title').innerHTML=`${escape(data.en)} <span class="zh-title">${escape(data.title)}</span>`;
    $('center-subtitle').textContent='— '+data.subtitle;
    $('sidebar-label').textContent=data.sectionLabel;$('sidebar-code').textContent=meta.number;
    $('business-nav').innerHTML=data.sidebar.map((s,i)=>`<button data-sidebar="${i}" class="${state.sidebar===i?'active':''}" aria-current="${state.sidebar===i?'page':'false'}">${icon(s.icon)}<span class="nav-label">${escape(s.label)}</span>${s.count?`<span class="nav-count">${s.count}</span>`:''}</button>`).join('');
    $('kpis').style.setProperty('--kpi-count',Math.max(1,visibleMetrics.length));
    $('kpis').innerHTML=visibleMetrics.map(i=>{const k=data.kpis[i];return `<button id="kpi-${state.center}-${i}" class="kpi-card ${i===state.metric?'selected':''}" data-metric="${i}" data-metric-id="${escape(k.metricId||i)}" aria-label="${escape(k.label)} ${escape(k.value)} ${escape(k.unit)}，查看詳細資訊"><span class="kpi-icon ${escape(k.color)}">${icon(k.icon)}</span><div class="kpi-body"><div class="kpi-name">${escape(k.label).replace('（範疇三）','<br>（範疇三）')}</div><div class="kpi-value ${k.color==='orange'?'orange':''}">${escape(k.value)}${k.unit?`<span class="kpi-unit">${escape(k.unit)}</span>`:''}</div><div class="kpi-foot"><span class="delta ${k.deltaType==='bad'?'bad':k.deltaType==='neutral'?'neutral':''}">${escape(k.delta)}</span><span>${escape(k.foot)}</span></div></div><span class="kpi-open">↗</span></button>`;}).join('')||'<div class="kpi-empty">此中心尚未選取 KPI。<button class="text-link" data-open-library>開啟 KPI 卡片櫃</button></div>';
    $('right-panel-trigger').disabled=!visibleMetrics.length;
    $('trend-title').textContent=data.trend.title;
    $('trend-legend').innerHTML=data.trend.legend.map((l,i)=>`<span><i class="${i===0?'legend-dot':i===1?'legend-line':'legend-line dashed'}"></i>${escape(l)}</span>`).join('');
    $('trend-chart').innerHTML=renderTrend(data.trend);
    $('distribution-title').textContent=data.distribution.title;
    $('distribution-chart').innerHTML=renderDonut(data.distribution);
    ['table','secondary','tertiary'].forEach((key,i)=>{$(i===0?'table-title':`${key}-title`).textContent=data[key].title;const target=$(i===0?'primary-table':`${key}-table`);target.innerHTML=tableMarkup(data[key],key,true);target.title=`${data[key].sourceTitle} · 預覽 ${Math.min(data[key].rows.length,data[key].previewLimit||5)} / ${data[key].rows.length} 筆；查看全部與匯出保留完整資料`;});
    $('activity-strip').innerHTML=data.activity.map(a=>`<div class="activity-item"><i class="${escape(a.status)}"></i><time>${escape(a.time)}</time><span title="${escape(a.text)}">${escape(a.text)}</span></div>`).join('');
    $('scope-button').innerHTML=`${escape(projectNames[state.project])}${icon('chevron')}`;
    if(visibleMetrics.length){renderRight();applyMetricComparison();}
    else{$('right-panel').innerHTML='';$('right-panel').dataset.sourceTitle='';}
    if(resetPanel||!visibleMetrics.length)panelMotion?.reset(state.metric,metricSource());else panelMotion?.sync();
    window.RRCC_CHART_MOTION?.refresh(document.querySelector('.dashboard-main'));
  }
  function switchCenter(id, updateHash=true) {
    if(!window.CENTER_DATA[id]) id='overview';
    state.center=id;state.metric=defaults[id];state.sidebar=0;state.rightTab='summary';
    if(updateHash && location.hash!==`#${id}`) history.replaceState(null,'',`#${id}`);
    render(true);
  }
  function dialog(title,html) {
    $('dialog-context').textContent=current().en.toUpperCase();
    $('dialog-title').textContent=title;$('dialog-content').innerHTML=html;
    if(!$('detail-dialog').open) $('detail-dialog').showModal();
    window.RRCC_CHART_MOTION?.refresh($('detail-dialog'));
  }
  function sourceDialog(prov=current().kpis[state.metric].provenance) {
    if(prov?.dataset==='canonical-v1-v2'&&current().kpis[state.metric].detail?.libraryData){
      const k=current().kpis[state.metric],info=k.detail.libraryData;
      dialog(`${k.label} · 定義與來源`,librarySourceMarkup(k,info));return;
    }
    if(prov?.dataset==='public-reference'){dialog('公開參考數據與官方依據',referenceMarkup(prov.referenceIds));return;}
    const refs=prov?.sourceReferences||[],pointers=prov?.canonicalPointers||[];
    const dataset=isPresentation()?window.RRCC_ACTIVE_DATASET:window.RRCC_MERGED;
    const lookup=pointer=>pointer.split('/').slice(1).reduce((value,key)=>value?.[key.replace(/~1/g,'/').replace(/~0/g,'~')],dataset);
    dialog(isPresentation()?'合成展示資料與欄位追溯':'JSON 來源與欄位追溯',`<h3>${escape(prov?.collection||'資料集')}</h3>${(dataset.sources||[]).map(s=>`<div class="source-reference"><strong>${escape(s.id)} · ${escape(s.path)}</strong><code>${escape(s.sha256||(isPresentation()?'SYNTHETIC DEMO · 非實際營運資料':'來源識別'))}</code></div>`).join('')}<p>${isPresentation()?'本頁為 Owner 要求的正常數值展示情境，獨立合成資料不屬於 V1／V2 實際來源。以下列出前 8 個資料位置。':'唯一實體合併去重；相同數值未跨版相加。以下列出前 8 個欄位，完整 provenance 保存在合併 JSON。'}</p>${pointers.slice(0,8).map(p=>`<div class="source-reference"><strong>${escape(p)}</strong><pre>${escape(JSON.stringify(lookup(p),null,2)??'NO DATA')}</pre></div>`).join('')||'<div class="source-empty">資料集層級摘要；計算定義見展示資料檔。</div>'}<div class="audit-banner">${isPresentation()?'合成展示資料':`${refs.length} 個原始來源參照`} · ${pointers.length} 個資料位置 · 非實際營運資料</div>`);
  }
  function openDetail(kind, rowIndex) {
    const data=current();
    if(['table','secondary','tertiary','external'].includes(kind)) {
      const t=kind==='external'?externalTable:data[kind];
      if(rowIndex!==undefined) {
        const row=t.rows[rowIndex];
        detailProvenance=t.rowProvenance?.[rowIndex];
        dialog(typeof row[0]==='string'?row[0]:t.title,`<h3>${escape(t.title)} · 案件詳情</h3>${t.columns.map((c,i)=>`<div class="action-step"><strong style="width:155px">${escape(c)}</strong><div>${cell(row[i])}</div></div>`).join('')}<div class="audit-banner">${escape(centers.find(c=>c.id===state.center).label)} / ${escape(state.period)} / ${escape(projectNames[state.project])}</div>`);
        if(t.libraryData){
          const raw=t.libraryData.rawRecords[rowIndex],material=t.libraryData.materialRecords.find(record=>record.id===raw?.material);
          $('dialog-content').insertAdjacentHTML('beforeend',`<h3>完整原始批次、材料主檔與來源</h3><pre class="library-source-json">${escape(JSON.stringify({record:raw,material,source:t.libraryData.source,provenance:detailProvenance},null,2))}</pre>`);
        }
        if(detailProvenance)$('dialog-content').insertAdjacentHTML('beforeend','<button class="primary-button" data-row-provenance>查看此列原始 JSON 來源</button>');
      } else dialog(t.title,window.RRCC_FULL_TABLE.render(t,kind,{cell,scope:`${centers.find(c=>c.id===state.center).label} / ${state.period} / ${projectNames[state.project]}`,onExport:exportCSV}));
    } else if(kind==='trend') dialog(data.trend.title,`<div class="chart-legend">${data.trend.legend.map((l,i)=>`<span><i class="${i===0?'legend-dot':'legend-line'}"></i>${escape(l)}</span>`).join('')}</div><div class="metric-detail-chart">${renderTrend(data.trend)}</div><div class="dialog-notice">${isPresentation()?'合成展示情境 · '+window.RRCC_DATA_MONTHS.join('、')+' · 非實際營運趨勢':'僅呈現原始 JSON 的 2026-07、08、09 來源月份，不補造其他月份。'}</div>`);
    else if(kind==='distribution') dialog(data.distribution.title,`<div class="distribution-chart" data-chart-motion style="height:auto;justify-content:center">${renderDonut(data.distribution)}</div>`);
  }
  function openSidebar(index) {
    state.sidebar=index;
    document.querySelectorAll('[data-sidebar]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.sidebar)===index);b.setAttribute('aria-current',Number(b.dataset.sidebar)===index?'page':'false');});
    const data=current(),item=data.sidebar[index];
    if(isPresentation()){
      const view=data.sidebarViews?.[index]||'table';
      if(typeof view==='object'){externalTable=view;openDetail('external');}
      else openDetail(view);
      return;
    }
    if(window.RRCC_MERGED){
      const routes={overview:{0:'table',1:'table',2:'material',6:'trend'},material:{0:'table',4:'distribution',6:'trend'},verification:{6:'trend'},management:{6:'trend'}};
      const route=routes[state.center][index];
      if(route==='material'){externalTable=window.CENTER_DATA.material.table;openDetail('external');return;}
      if(route){openDetail(route);return;}
      dialog(item.label,`<p>Version 1 / Version 2 JSON 未提供「${escape(item.label)}」所需的業務實體或工作流。以下提供有依據的產業參考，非本平台案件清單。</p>${referenceMarkup()}<div class="audit-banner">目前仍為 Demonstration Preview，未串接後端；原始缺口仍保留在資料與追溯紀錄，不以外部數字冒充營運值。</div>`);return;
    }
    if(index===0) {toast(`${item.label} · ${projectNames[state.project]}`);return;}
    if(state.center==='overview'&&[2,3,4].includes(index)) {
      const source=index===4?window.CENTER_DATA.verification:window.CENTER_DATA.material;externalTable=source.table;
      dialog(item.label,`<h3>${escape(source.table.title)}</h3><div class="data-table">${tableMarkup(source.table,'external')}</div><div class="dialog-notice">全局概況 · ${escape(source.en)} · ${escape(state.period)}</div>`);return;
    }
    const map={overview:['table','table','table','table','secondary','secondary','trend'],material:['table','secondary','table','table','distribution','tertiary','trend'],verification:['table','table','table','tertiary','tertiary','secondary','trend'],management:['table','table','table','tertiary','tertiary','secondary','trend']};
    const kind=map[state.center][index];
    if(kind==='trend'||kind==='distribution') {openDetail(kind);return;}
    dialog(item.label,`<h3>${escape(data[kind].title)}</h3><div class="data-table">${tableMarkup(data[kind],kind)}</div><div class="dialog-notice">${escape(data.en)} · ${escape(item.label)} · ${escape(state.period)}</div>`);
  }
  function exportCSV(selectedTable) {
    const data=current(),flat=(v)=>v===null?'null':v===undefined?'':typeof v==='object'?(v.text??(v.type==='person'?`${v.name} / ${v.role}`:v.name)??(v.type==='progress'?`${v.value}%`:JSON.stringify(v))):v;
    const table=selectedTable?.columns?selectedTable:data.table;
    const lines=[table.columns,...filteredRows(table).map(r=>r.map(flat))].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\ufeff'+lines],{type:'text/csv;charset=utf-8;'}));
    const a=document.createElement('a');a.href=url;a.download=`RRCC_${state.center}_${state.project}_${state.period}_${isPresentation()?'SYNTHETIC':'SOURCE'}_DEMO.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);toast(`${table.title}已匯出為 CSV（展示資料）`);
  }
  function openActivity() {
    const r=current().right;
    dialog(r.activityTitle,`${r.activities.map(a=>`<div class="action-step"><span>${icon('history')}</span><div><strong>${escape(a.title)}</strong><p style="font-size:12px">${escape(a.meta)} · ${escape(a.time)}</p></div></div>`).join('')}<h3 style="margin-top:20px">${escape(r.alert.title)}</h3><p>${escape(r.alert.body)}</p>`);
  }
  function quickAction(index) {
    if(selectedRight().publicReference){sourceDialog(current().kpis[state.metric].provenance);return;}
    const data=current(),a=data.right.actions[index],label=a.label;
    if(label.includes('匯出')){exportCSV(isPresentation()&&state.center==='verification'&&label.includes('紀錄')?data.secondary:undefined);return;}
    if(isPresentation()){
      const view=data.quickViews?.[index]||'table';
      if(view==='source'){sourceDialog();return;}
      if(view==='verification'){switchCenter('verification');openDetail('table');return;}
      if(typeof view==='object'){externalTable=view;openDetail('external');return;}
      openDetail(view);return;
    }
    if(window.RRCC_MERGED){
      if(label.includes('來源索引')||(state.center==='management'&&index===0)){sourceDialog();return;}
      if(state.center==='overview'&&index===2){switchCenter('verification');openDetail('table');return;}
      const routes={overview:['table','table','table','table'],material:['table','table','secondary','table'],verification:['table','secondary','tertiary','table'],management:['table','secondary','tertiary','table']};
      openDetail(routes[state.center][index]);return;
    }
    if(state.center==='overview'&&index===2){switchCenter('verification');openDetail('table');return;}
    if(state.center==='overview'&&index===3){state.rightTab='evidence';renderRight();return;}
    if(label.includes('新增')||label.includes('匯入')) {
      const isUser=state.center==='management',isImport=label.includes('匯入');
      dialog(label,`<p>${escape(data.subtitle)}</p><form class="preview-form" id="preview-form"><div class="form-row"><div><label>${isUser?'使用者姓名':isImport?'資料批次名稱':'材料名稱'}</label><input required placeholder="${isUser?'請輸入姓名':isImport?'2026-10 工程材料清單':'例如：UHP 316L 高純度管材'}" name="name"></div><div><label>${isUser?'所屬組織':'所屬案場'}</label><select name="scope"><option>${isUser?'廠務工程一部':'台南 A 案'}</option><option>${isUser?'精誠特材':'新竹 B 案'}</option><option>${isUser?'潔能科技':'台中 C 案'}</option></select></div></div><label>${isUser?'角色':'備註'}</label><input name="note" placeholder="${isUser?'例如：供應商申報人員':'輸入本次申報或資料批次說明'}"><button type="submit" class="primary-button">儲存預覽草稿</button><p class="field-note">草稿只保留在本次瀏覽器工作階段，供展示流程使用。</p><div id="draft-result" role="status"></div></form>`);
    } else {
      const routes={overview:['table','table','table','table'],material:['table','table','secondary','table'],verification:['table','table','tertiary','secondary'],management:['table','tertiary','tertiary','secondary']};
      const kind=routes[state.center][index];
      dialog(label,`<h3>${escape(data[kind].title)}</h3><div class="data-table">${tableMarkup(data[kind],kind)}</div><div class="audit-banner">目前工作中心：${escape(data.en)}<br>快速操作：${escape(label)}</div>`);
    }
  }
  let results=[];
  function search(query='') {
    const q=query.trim().toLowerCase();results=[];
    for(const c of centers) {
      const data=window.CENTER_DATA[c.id];
      if(!q||`${c.label} ${data.en} ${data.title}`.toLowerCase().includes(q)) results.push({center:c.id,label:`${c.label} · ${data.en}`,icon:c.icon});
      if(q) data.sidebar.forEach((s,i)=>{if(s.label.toLowerCase().includes(q))results.push({center:c.id,label:s.label,index:i,icon:s.icon});});
      if(q) data.table.rows.forEach((r,i)=>{if(r.some(v=>typeof v==='string'&&v.toLowerCase().includes(q)))results.push({center:c.id,label:String(r[0]),row:i,icon:'file'});});
    }
    results=results.slice(0,9);
    $('search-results').innerHTML=results.length?results.map((r,i)=>`<button class="search-result" data-search-result="${i}">${icon(r.icon)}<span>${escape(r.label)}</span><small>${escape(centers.find(c=>c.id===r.center).label)} ↵</small></button>`).join(''):'<div class="empty-result">沒有符合的中心、功能或材料。試試「管材」或「驗證」。</div>';
  }
  function openSearch() {search();$('search-input').value='';$('search-dialog').showModal();$('search-input').focus();}
  function openLibrary(){
    panelMotion?.settle();
    window.RRCC_KPI_LIBRARY.open(state.center,current().kpis,{mode:window.RRCC_DATA_MODE,centerLabel:centers.find(c=>c.id===state.center).label,apply:(visible,persisted)=>{if(!visible.includes(state.metric))state.metric=visible[0]??0;render(true);toast(persisted?'已儲存此中心 KPI 配置；僅影響本瀏覽器的 Preview 身分。':'已套用配置；瀏覽器禁止儲存，重新整理後將恢復預設。');},useSource:()=>{setDataMode('source');openLibrary();}});
  }
  $('search-button').innerHTML=icon('search');$('notification-button').innerHTML=icon('bell');$('calendar-icon').innerHTML=icon('calendar');$('export-button').innerHTML=icon('download')+'匯出報表';$('dialog-close').innerHTML=icon('close');$('search-icon').innerHTML=icon('search');$('kpi-settings-button').innerHTML=icon('settings')+'KPI 卡片櫃';
  $('kpi-settings-button').setAttribute('aria-label','開啟 KPI 卡片櫃');
  $('kpi-settings-button').addEventListener('click',openLibrary);
  $('public-reference-button').addEventListener('click',()=>dialog('公開參考數據與官方依據',referenceMarkup()));
  document.querySelectorAll('[data-common]').forEach(b=>b.insertAdjacentHTML('afterbegin',icon(b.dataset.icon)));
  document.addEventListener('click',event=>{
    const b=event.target.closest('button,a');if(!b)return;
    if(b.hasAttribute('data-public-reference')){dialog('公開參考數據與官方依據',referenceMarkup());return;}
    if(b.hasAttribute('data-open-library')){openLibrary();return;}
    if(b.hasAttribute('data-library-detail')){openLibraryDetail();return;}
    if(b.hasAttribute('data-library-source')&&b.closest('#right-panel')){const k=current().kpis[state.metric];if(k.detail?.libraryData)dialog(`${k.label} · 完整來源與定義`,librarySourceMarkup(k,k.detail.libraryData));return;}
    if(b.dataset.center){event.preventDefault();switchCenter(b.dataset.center);return;}
    if(b.dataset.metric!==undefined){const metric=Number(b.dataset.metric);if(window.RRCC_KPI_SETTINGS.visible(state.center,current().kpis,window.RRCC_DATA_MODE).includes(metric))panelMotion.request(metric,metricSource(metric));return;}
    if(b.dataset.sidebar!==undefined){openSidebar(Number(b.dataset.sidebar));return;}
    if(b.dataset.rightTab){state.rightTab=b.dataset.rightTab;renderRight();applyMetricComparison();return;}
    if(b.dataset.detail){openDetail(b.dataset.detail);return;}
    if(b.hasAttribute('data-row-provenance')){sourceDialog(detailProvenance);return;}
    if(b.dataset.action!==undefined){quickAction(Number(b.dataset.action));return;}
    if(b.hasAttribute('data-collapse-right')){panelMotion.close();return;}
    if(b.hasAttribute('data-restore-right')){if(window.RRCC_KPI_SETTINGS.visible(state.center,current().kpis,window.RRCC_DATA_MODE).includes(state.metric))panelMotion.request(state.metric,{id:'right-panel-trigger'});return;}
    if(b.hasAttribute('data-open-activity')){openActivity();return;}
    if(b.hasAttribute('data-open-alert')){openDetail(state.center==='overview'?'secondary':'tertiary');return;}
    if(b.dataset.evidence!==undefined){sourceDialog();return;}
    if(b.dataset.searchResult!==undefined){const r=results[Number(b.dataset.searchResult)];$('search-dialog').close();switchCenter(r.center);if(r.index!==undefined)openSidebar(r.index);if(r.row!==undefined)openDetail('table',r.row);return;}
    if(b.dataset.common){if(b.dataset.common==='通知訊息')openActivity();else if(b.dataset.common==='我的任務'){if(isPresentation()){externalTable=window.CENTER_DATA.overview.tertiary;openDetail('external');}else dialog('我的任務',`<p>原始 JSON 未提供本平台待辦紀錄；以下為獨立公開參考。</p>${referenceMarkup()}`);}else sourceDialog();}
  });
  document.addEventListener('click',e=>{const r=e.target.closest('tr[data-row]');if(r)openDetail(r.dataset.row,Number(r.dataset.rowIndex));});
  document.addEventListener('click',e=>{
    if(!e.target.closest('.workspace')||e.target.closest('#right-panel,dialog,button,a,input,select,textarea,label,summary,[role="button"],[tabindex],tr[data-row]'))return;
    panelMotion.close();
  });
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!$('search-dialog').open)openSearch();}
    if(e.key==='Enter'&&e.target.matches('tr[data-row]'))openDetail(e.target.dataset.row,Number(e.target.dataset.rowIndex));
    if($('search-dialog').open&&['ArrowDown','ArrowUp'].includes(e.key)) {e.preventDefault();const items=Array.from(document.querySelectorAll('.search-result'));const i=items.indexOf(document.activeElement);items[(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();}
    if($('search-dialog').open&&e.key==='Enter'&&document.activeElement===$('search-input'))document.querySelector('.search-result')?.click();
  });
  document.addEventListener('submit',e=>{
    if(e.target.id!=='preview-form')return;e.preventDefault();const form=new FormData(e.target);const draft={center:state.center,name:form.get('name'),scope:form.get('scope'),note:form.get('note')};
    try{sessionStorage.setItem('rrcc-preview-draft',JSON.stringify(draft));}catch{}
    $('draft-result').innerHTML=`<div class="audit-banner">已儲存預覽草稿：${escape(draft.name)} · ${escape(draft.scope)}</div>`;
  });
  $('search-button').addEventListener('click',openSearch);$('search-input').addEventListener('input',e=>search(e.target.value));$('search-close').addEventListener('click',()=>$('search-dialog').close());
  $('notification-button').addEventListener('click',openActivity);
  $('profile-button').addEventListener('click',()=>dialog('Jin Chen · 漢唐集成',`<div class="action-step"><span>JC</span><div><strong>Baseline 展示身分</strong><p>此身分為既有設計識別，尚未串接實際帳號服務。</p></div></div><div class="dialog-metrics"><div><small>工作中心</small><strong>4</strong></div><div><small>${isPresentation()?'展示案場':'來源案場'}</small><strong>${(window.RRCC_ACTIVE_DATASET||window.RRCC_MERGED).data.projects.length}</strong></div><div><small>${isPresentation()?'展示帳號':'帳號資料'}</small><strong>${isPresentation()?window.CENTER_DATA.management.kpis[0].value:'未串接'}</strong></div></div>`));
  $('export-button').addEventListener('click',exportCSV);
  $('scope-button').addEventListener('click',()=>dialog('選擇檢視案場',`<p>選擇一個案場以檢視對應的案件清單。</p><div style="margin-top:15px">${Object.entries(projectNames).map(([key,label])=>`<button class="search-result" data-project="${key}">${icon('building')}<span>${escape(label)}</span>${key===state.project?'✓':''}</button>`).join('')}</div>`));
  document.addEventListener('click',e=>{const b=e.target.closest('[data-project]');if(b){state.project=b.dataset.project;$('project-select').value=state.project;$('detail-dialog').close();render();toast(`檢視範圍：${projectNames[state.project]}`);}});
  $('project-select').addEventListener('change',e=>{state.project=e.target.value;render();toast(`檢視範圍：${projectNames[state.project]} · 來源 KPI 與表格已更新`);});
  $('period-select').addEventListener('change',e=>{state.period=e.target.value;render();toast(`來源月份：${state.period} · KPI 與來源表格已更新`);});
  [$('dialog-close'),$('dialog-done')].forEach(b=>b.addEventListener('click',()=>$('detail-dialog').close()));
  for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
  window.addEventListener('hashchange',()=>switchCenter(location.hash.slice(1),false));window.addEventListener('resize',resize);
  $('period-select').innerHTML=window.RRCC_DATA_MONTHS.map(month=>`<option value="${month}" ${month===state.period?'selected':''}>${month}</option>`).join('');
  $('project-select').innerHTML=Object.entries(projectNames).map(([id,label])=>`<option value="${id}">${escape(label)}</option>`).join('');
  function setDataMode(mode){
    window.RRCC_SET_DATA_MODE?.(mode);
    state.period=window.RRCC_DATA_MONTHS.at(-1);state.project='all';state.metric=defaults[state.center];state.rightTab='summary';state.sidebar=0;
    $('period-select').innerHTML=window.RRCC_DATA_MONTHS.map(month=>`<option value="${month}">${month}</option>`).join('');
    $('project-select').innerHTML=Object.entries(projectNames).map(([id,label])=>`<option value="${id}">${escape(label)}</option>`).join('');
    const url=new URL(location.href);url.searchParams.set('data-mode',isPresentation()?'demo':'source');history.replaceState(null,'',url.pathname+url.search+url.hash);
    render(true);toast(isPresentation()?'已切換合成展示資料：非實際營運資料':'已切回原始來源與獨立公開參考；缺口未改寫。');
  }
  $('data-mode-toggle')?.addEventListener('click',()=>setDataMode(isPresentation()?'source':'demo'));
  document.querySelectorAll('.common-nav .count').forEach(b=>b.remove());
  $('notification-button').classList.remove('notification-button');$('notification-button').setAttribute('aria-label','資料來源通知');
  panelMotion=new window.RightPanelMotion({panel:$('right-panel'),stage:$('stage'),layout:document.querySelector('.content-layout'),trigger:$('right-panel-trigger'),commit:metric=>{state.metric=metric;state.rightTab='summary';renderRight();applyMetricComparison();}});
  resize();switchCenter(location.hash.slice(1)||'overview');
  window.RRCC_PREVIEW={getState:()=>({...state}),centers:centers.map(c=>c.id)};
})();
