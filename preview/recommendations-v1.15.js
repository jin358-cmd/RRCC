/* Owner-supplied reduction-management categories; not an emissions calculation. */
(() => {
  'use strict';
  const id = n => `RRCC-KPI-${String(n).padStart(3,'0')}`;
  const groups = [
    {id:'design',label:'設計與材料用量',scope:'C1',cards:[1,2,3,4,5,6,7],work:'比對材料清單、採購量、實際用量、庫存及損耗，提出改善方案',boundary:'材料量與損耗是管理線索，不直接等於已減少的碳排量。'},
    {id:'procurement',label:'材料與設備採購',scope:'C1；自用資本設備 C2 待評估',cards:[8,9,10,12],work:'審核材質、來源、碳足跡、價格、交期與業主准入條件',boundary:'須先確認性能合格與低碳證據；原 Demo 隱含碳估算並非認證排放結果。'},
    {id:'manufacturing',label:'供應商製造',scope:'C1',cards:[8,9,12],work:'蒐集產品數據、設定改善任務，追蹤改善是否反映到交付產品',boundary:'材料指標不能取代供應商製程／能源實測，仍需取得交付產品證據。'},
    {id:'logistics',label:'物流與配送',scope:'C4／C9，依交易與運輸安排判定',cards:[5,11],work:'協調交貨排程、運輸方式與路線，保留重量、里程和承運資料',boundary:'調撥與流向憑證僅支援追蹤；缺少里程、承運與裝載資料，不計算運輸排放或減量。'},
    {id:'waste',label:'剩料與工程廢棄物',scope:'C1／C5',cards:[4,5,6,7,11],work:'建立剩料庫，確認所有權與適用規格，追蹤清運及最終處理',boundary:'跨案調度需先確認所有權、規格與合法流向，不將回收量直接視為減碳量。'},
    {id:'lifecycle',label:'交付後的系統與設備',scope:'C11／C12，須先確認適用邊界',cards:[],work:'建立設備履歷與使用情境，取得運轉資料，評估全生命週期效果',boundary:'現有 12 張正式 KPI 未涵蓋設備運轉能效及交付後生命週期；保留資料對應缺口，不虛構新卡或數值。'}
  ].map(group => Object.freeze({...group,cardIds:Object.freeze(group.cards.map(id))}));
  const mapping = new Map(Array.from({length:12},(_,index)=>{
    const cardId=id(index+1),matches=groups.filter(group=>group.cardIds.includes(cardId));
    return [cardId,Object.freeze({cardId,groups:Object.freeze(matches),label:'減碳管理建議',basis:'Owner 提供的管理環節對照；非核准盤查邊界或已驗證減碳成果'})];
  }));
  window.RRCC_RECOMMENDATIONS=Object.freeze({version:'v1.15',groups:Object.freeze(groups),forCard:card=>mapping.get(typeof card==='string'?card:card?.cardId)||null});
})();
