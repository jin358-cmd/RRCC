/* RRCC × 漢唐集成 4-Center Demonstration Preview — illustrative data only. */
window.CENTER_DATA = {
  overview: {
    en: 'Overview Center',
    title: '總覽全局',
    subtitle: '一頁掌握整體狀態，快速發現重點，支援深入追蹤',
    sectionLabel: '全局工作區',
    sidebar: [
      { icon: 'chart', label: '總覽儀表板' },
      { icon: 'building', label: '案場總覽', count: 8 },
      { icon: 'box', label: '材料與供應鏈' },
      { icon: 'file', label: '申報進度' },
      { icon: 'shield', label: '驗證概況', count: 32 },
      { icon: 'alert', label: '異常追蹤', count: 3 },
      { icon: 'report', label: '管理報表' }
    ],
    kpis: [
      { label: '總碳排放量（範疇三）', value: '12,420', unit: 'tCO₂e', delta: '↓ 8.2%', deltaType: 'good', foot: 'vs. 上月', icon: 'leaf', color: 'green' },
      { label: '進行中工程案', value: '8', unit: '件', delta: '↑ 2', deltaType: 'neutral', foot: 'vs. 上月', icon: 'building', color: 'blue' },
      { label: '異常案件', value: '3', unit: '件', delta: '↓ 40%', deltaType: 'good', foot: 'vs. 上月', icon: 'alert', color: 'orange' },
      { label: '證據完整率', value: '92%', unit: '', delta: '↑ 5%', deltaType: 'good', foot: 'vs. 上月', icon: 'file', color: 'purple' }
    ],
    trend: {
      title: '碳排放趨勢', unit: 'tCO₂e',
      bars: [10420, 10680, 10820, 13140, 10960, 13520, 11840, 10260, 11920, 12420, 10480, 13280],
      line: [11900, 11860, 11890, 11910, 11940, 12350, 12480, 12420, 14800, 15280, 12840, 11260],
      previous: [15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15300, 15500, 15500],
      max: 20000, ticks: [0, 5000, 10000, 15000, 20000], legend: ['排放量', '目標值', '去年同期']
    },
    distribution: {
      title: '排放結構（範疇三）', total: '12,420', unit: 'tCO₂e',
      items: [
        { label: '採購材料', value: 48, color: '#2e8bfa' },
        { label: '資本財', value: 22, color: '#2c83b8' },
        { label: '上游運輸', value: 15, color: '#ffad44' },
        { label: '廢棄物處理', value: 8, color: '#ed8765' },
        { label: '商務旅行', value: 4, color: '#9472dc' },
        { label: '其他', value: 3, color: '#70aafa' }
      ]
    },
    table: {
      title: '進行中工程案', columns: ['案場名稱', '工程類型', '進度', '負責單位', '預計完工'],
      rows: [
        ['台南 A 案', '無塵室新建', { type: 'progress', value: 65 }, '廠務工程一部', '2026-12'],
        ['新竹 B 案', '機電整合', { type: 'progress', value: 42 }, '機電工程部', '2027-03'],
        ['台中 C 案', '製程擴建', { type: 'progress', value: 28 }, '製程系統部', '2027-06'],
        ['高雄 D 案', '潔淨室改造', { type: 'progress', value: 80 }, '廠務工程二部', '2026-11'],
        ['桃園 E 案', '機台設備', { type: 'progress', value: 15 }, '設備整合部', '2027-08']
      ]
    },
    secondary: {
      title: '近期異常案件', columns: ['日期', '案場', '異常類型', '狀態'],
      rows: [
        ['10-12', '新竹 B 案', '材料數量差異', { type: 'badge', text: '處理中', tone: 'red' }],
        ['10-10', '台南 A 案', '供應商文件缺失', { type: 'badge', text: '待確認', tone: 'orange' }],
        ['10-08', '台中 C 案', '排放係數異常', { type: 'badge', text: '處理中', tone: 'red' }]
      ]
    },
    tertiary: {
      title: '待辦事項', columns: ['項目', '負責人', '到期日', '狀態'],
      rows: [
        ['B 案供應商資料補件', '王小明', '10-15', { type: 'badge', text: '進行中', tone: 'blue' }],
        ['C 案排放計算確認', '李怡君', '10-18', { type: 'badge', text: '待處理', tone: 'orange' }],
        ['第三方查證文件準備', '陳志宏', '10-20', { type: 'badge', text: '未開始', tone: 'blue' }]
      ]
    },
    right: {
      title: 'KPI 詳細資訊', kpiLabel: '總碳排放量（範疇三）', value: '12,420', unit: 'tCO₂e', delta: '↓ 8.2%',
      target: '15,000', targetLabel: '目標值', completion: 82.8,
      trendTitle: '近 6 個月趨勢', spark: [13850, 13520, 13270, 12980, 13530, 12420],
      notesTitle: '重點說明',
      notes: ['本月排放量較上月下降 8.2%', '主要來自 A 案材料與用電減少', '仍需關注 B 案化學品相關排放'],
      activityTitle: '近期平台動態',
      activities: [
        { time: '09:42', title: '台南 A 案材料申報已更新', meta: '陳志宏 · 供應鏈管理' },
        { time: '09:18', title: '高雄 D 案驗證完成', meta: '林佳穎 · 驗證管理' },
        { time: '08:56', title: '10 月工程彙整報表已產生', meta: '平台排程 · 報表中心' }
      ],
      alert: { title: '3 件異常待追蹤', body: '新竹 B 案材料數量差異，請於 10/15 前完成確認。' },
      quickTitle: '快速操作',
      actions: [{ icon: 'report', label: '匯出總覽報表' }, { icon: 'building', label: '檢視工程案場' }, { icon: 'shield', label: '開啟待驗證案件' }, { icon: 'file', label: '查看佐證文件' }]
    },
    activity: [
      { time: '09:42', text: '台南 A 案更新 12 筆材料申報', status: 'blue' },
      { time: '09:18', text: '高雄 D 案完成第三方文件驗證', status: 'good' },
      { time: '08:56', text: '新竹 B 案新增材料數量差異提醒', status: 'warn' }
    ]
  },
  material: {
    en: 'Material Center', title: '材料生命週期',
    subtitle: '串聯材料、供應商與申報文件，掌握晶圓廠工程供應鏈',
    sectionLabel: '材料工作區',
    sidebar: [
      { icon: 'box', label: '材料清單' },
      { icon: 'users', label: '供應商管理', count: 48 },
      { icon: 'file', label: '材料申報', count: 86 },
      { icon: 'folder', label: '文件管理' },
      { icon: 'layers', label: '材料分類' },
      { icon: 'alert', label: '異常處理', count: 7 },
      { icon: 'chart', label: '報表分析' }
    ],
    kpis: [
      { label: '材料總數', value: '2,486', unit: '項', delta: '↑ 126', deltaType: 'neutral', foot: 'vs. 上月', icon: 'box', color: 'blue' },
      { label: '待申報材料', value: '86', unit: '項', delta: '↓ 24', deltaType: 'good', foot: 'vs. 上月', icon: 'file', color: 'orange' },
      { label: '供應商數量', value: '48', unit: '家', delta: '↑ 3', deltaType: 'neutral', foot: 'vs. 上月', icon: 'users', color: 'purple' },
      { label: '申報完成率', value: '96.5%', unit: '', delta: '↑ 2.1%', deltaType: 'good', foot: 'vs. 上月', icon: 'check', color: 'green' }
    ],
    trend: {
      title: '材料申報趨勢', unit: '申報筆數',
      bars: [142, 158, 176, 196, 185, 218, 236, 221, 264, 286, 252, 278],
      line: [130, 150, 170, 190, 190, 210, 230, 230, 250, 270, 270, 290],
      previous: [128, 136, 151, 165, 172, 183, 196, 205, 213, 224, 238, 246],
      max: 320, ticks: [0, 80, 160, 240, 320], legend: ['申報數量', '申報目標', '去年同期']
    },
    distribution: {
      title: '材料類別分布', total: '2,486', unit: '項材料',
      items: [
        { label: '製程管材', value: 32, color: '#2e8bfa' },
        { label: '機電設備', value: 24, color: '#2c83b8' },
        { label: '潔淨室建材', value: 18, color: '#ffad44' },
        { label: '化學品系統', value: 12, color: '#ed8765' },
        { label: '消防與安控', value: 8, color: '#9472dc' },
        { label: '其他材料', value: 6, color: '#70aafa' }
      ]
    },
    table: {
      title: '最近材料申報', columns: ['材料編號／名稱', '供應商', '案場', '申報日期', '狀態'],
      rows: [
        ['MAT-02486 · UHP 316L 管材', '精誠特材', '台南 A 案', '10-13', { type: 'badge', text: '待驗證', tone: 'blue' }],
        ['MAT-02485 · FFU 過濾機組', '潔能科技', '新竹 B 案', '10-13', { type: 'badge', text: '申報完成', tone: 'green' }],
        ['MAT-02484 · PFA 高純度閥件', '日盛流體', '台中 C 案', '10-12', { type: 'badge', text: '待補件', tone: 'orange' }],
        ['MAT-02483 · 高架地板模組', '宏穩建材', '高雄 D 案', '10-12', { type: 'badge', text: '申報完成', tone: 'green' }],
        ['MAT-02482 · 低壓配電盤', '啟源機電', '桃園 E 案', '10-11', { type: 'badge', text: '待驗證', tone: 'blue' }]
      ]
    },
    secondary: {
      title: '供應商申報狀態', columns: ['供應商', '材料數', '完成率', '狀態'],
      rows: [
        ['精誠特材', '186', { type: 'progress', value: 98 }, { type: 'badge', text: '正常', tone: 'green' }],
        ['潔能科技', '124', { type: 'progress', value: 95 }, { type: 'badge', text: '正常', tone: 'green' }],
        ['日盛流體', '92', { type: 'progress', value: 84 }, { type: 'badge', text: '待補件', tone: 'orange' }]
      ]
    },
    tertiary: {
      title: '材料異常追蹤', columns: ['材料', '異常項目', '到期日', '狀態'],
      rows: [
        ['PFA 高純度閥件', '原產地證明缺漏', '10-15', { type: 'badge', text: '待補件', tone: 'orange' }],
        ['UHP 不鏽鋼接頭', '批次數量不符', '10-16', { type: 'badge', text: '處理中', tone: 'red' }],
        ['化學品供應模組', '碳係數待更新', '10-18', { type: 'badge', text: '待確認', tone: 'blue' }]
      ]
    },
    right: {
      title: '材料 KPI 詳細資訊', kpiLabel: '材料申報完成率', value: '96.5', unit: '%', delta: '↑ 2.1%',
      target: '98', targetLabel: '申報目標（%）', completion: 96.5,
      trendTitle: '近 6 個月申報完成率', spark: [89.2, 90.8, 92.4, 93.6, 94.4, 96.5],
      notesTitle: '材料重點',
      notes: ['2,400 項材料已完成本期申報', '86 項待申報，7 項異常追蹤中', '優先補齊高純度管件原產地證明'],
      activityTitle: '近期材料動態',
      activities: [
        { time: '10:26', title: '精誠特材新增 12 筆管材申報', meta: '台南 A 案 · 製程管材' },
        { time: '09:54', title: 'FFU 過濾機組文件已齊備', meta: '潔能科技 · 新竹 B 案' },
        { time: '09:12', title: 'PFA 閥件退回補充原產地證明', meta: '日盛流體 · 台中 C 案' }
      ],
      alert: { title: '7 項材料異常', body: '3 項文件缺漏、2 項數量差異、2 項排放係數待確認。' },
      quickTitle: '快速材料操作',
      actions: [{ icon: 'file', label: '新增材料申報' }, { icon: 'box', label: '匯入材料清單' }, { icon: 'users', label: '開啟供應商資料' }, { icon: 'report', label: '匯出材料報表' }]
    },
    activity: [
      { time: '10:26', text: '精誠特材新增 12 筆高純度管材申報', status: 'blue' },
      { time: '09:54', text: '新竹 B 案 FFU 機組完成文件申報', status: 'good' },
      { time: '09:12', text: '台中 C 案 PFA 閥件待補原產地證明', status: 'warn' }
    ]
  },
  verification: {
    en: 'Verification Center', title: '驗證與合規',
    subtitle: '整合材料證據、文件審查與驗證流程，讓每項判定可追溯',
    sectionLabel: '驗證工作區',
    sidebar: [
      { icon: 'clock', label: '待驗證', count: 32 },
      { icon: 'shield', label: '驗證案件' },
      { icon: 'file', label: '文件審查', count: 18 },
      { icon: 'return', label: '退件管理', count: 6 },
      { icon: 'alert', label: '異常追蹤', count: 3 },
      { icon: 'history', label: '驗證紀錄' },
      { icon: 'chart', label: '報表分析' }
    ],
    kpis: [
      { label: '待驗證案件', value: '32', unit: '件', delta: '↓ 8', deltaType: 'good', foot: 'vs. 上月', icon: 'clock', color: 'blue' },
      { label: '已驗證案件', value: '428', unit: '件', delta: '↑ 56', deltaType: 'good', foot: 'vs. 上月', icon: 'shield', color: 'green' },
      { label: '退件／異常', value: '9', unit: '件', delta: '↓ 4', deltaType: 'good', foot: '退件 6 · 異常 3', icon: 'alert', color: 'orange' },
      { label: '驗證完成率', value: '93%', unit: '', delta: '↑ 3.8%', deltaType: 'good', foot: 'vs. 上月', icon: 'check', color: 'purple' }
    ],
    trend: {
      title: '驗證案件趨勢', unit: '驗證件數',
      bars: [24, 28, 30, 35, 32, 39, 42, 40, 46, 56, 49, 54],
      line: [25, 28, 30, 32, 35, 38, 40, 42, 45, 50, 52, 55],
      previous: [20, 23, 24, 27, 28, 31, 33, 35, 38, 41, 42, 44],
      max: 64, ticks: [0, 16, 32, 48, 64], legend: ['完成驗證', '驗證目標', '去年同期']
    },
    distribution: {
      title: '驗證結果分布', total: '460', unit: '件案件',
      items: [
        { label: '驗證通過', value: 82, color: '#2e8bfa' },
        { label: '條件通過', value: 11, color: '#2c83b8' },
        { label: '待審查', value: 3, color: '#ffad44' },
        { label: '文件補件', value: 2, color: '#ed8765' },
        { label: '已退件', value: 1, color: '#9472dc' },
        { label: '異常追蹤', value: 1, color: '#70aafa' }
      ]
    },
    table: {
      title: '待驗證案件', columns: ['案件編號／內容', '案場', '審查人', '到期日', '狀態'],
      rows: [
        ['VER-00461 · UHP 管材材質證明', '台南 A 案', '林佳穎', '10-14', { type: 'badge', text: '待審查', tone: 'blue' }],
        ['VER-00460 · FFU 效能測試報告', '新竹 B 案', '張立行', '10-14', { type: 'badge', text: '審查中', tone: 'blue' }],
        ['VER-00459 · PFA 閥件原產地', '台中 C 案', '林佳穎', '10-15', { type: 'badge', text: '待補件', tone: 'orange' }],
        ['VER-00458 · 供應商合規聲明', '高雄 D 案', '吳宜庭', '10-16', { type: 'badge', text: '待審查', tone: 'blue' }],
        ['VER-00457 · 低壓盤型式試驗', '桃園 E 案', '張立行', '10-17', { type: 'badge', text: '審查中', tone: 'blue' }]
      ]
    },
    secondary: {
      title: '最近驗證紀錄', columns: ['時間', '驗證項目', '審查人', '結果'],
      rows: [
        ['10-13 09:18', '高架地板防火證明', '林佳穎', { type: 'badge', text: '通過', tone: 'green' }],
        ['10-12 16:32', '潔淨室板材碳足跡', '吳宜庭', { type: 'badge', text: '通過', tone: 'green' }],
        ['10-12 14:05', 'PFA 閥件原產地', '張立行', { type: 'badge', text: '退回補件', tone: 'orange' }]
      ]
    },
    tertiary: {
      title: '退件與異常追蹤', columns: ['案件', '原因', '期限', '優先度'],
      rows: [
        ['VER-00459', '原產地證明缺頁', '10-15', { type: 'badge', text: '高', tone: 'red' }],
        ['VER-00442', '測試報告版本不符', '10-16', { type: 'badge', text: '中', tone: 'orange' }],
        ['VER-00438', '排放係數來源待查', '10-18', { type: 'badge', text: '中', tone: 'orange' }]
      ]
    },
    right: {
      title: '驗證 KPI 詳細資訊', kpiLabel: '驗證完成率', value: '93', unit: '%', delta: '↑ 3.8%',
      target: '95', targetLabel: '驗證目標（%）', completion: 93,
      trendTitle: '近 6 個月驗證完成率', spark: [82.1, 85.4, 88.2, 90.1, 89.2, 93],
      notesTitle: '驗證重點',
      notes: ['本期 428 件已完成，32 件待驗證', '6 件退回補件，3 件異常追蹤中', '優先審查 10/14 到期的材料證明'],
      activityTitle: '近期驗證動態',
      activities: [
        { time: '09:18', title: '高架地板防火證明驗證通過', meta: '林佳穎 · 高雄 D 案' },
        { time: '08:52', title: 'FFU 效能報告進入文件審查', meta: '張立行 · 新竹 B 案' },
        { time: '昨日', title: 'PFA 閥件證明退回補件', meta: 'VER-00459 · 台中 C 案' }
      ],
      alert: { title: '2 件案件明日到期', body: 'UHP 管材材質證明、FFU 效能測試報告，請優先完成審查。' },
      quickTitle: '快速驗證操作',
      actions: [{ icon: 'clock', label: '處理待驗證案件' }, { icon: 'file', label: '開啟文件審查' }, { icon: 'return', label: '追蹤退件補件' }, { icon: 'report', label: '匯出驗證紀錄' }]
    },
    activity: [
      { time: '09:18', text: '高雄 D 案防火證明驗證通過', status: 'good' },
      { time: '08:52', text: '新竹 B 案 FFU 效能報告開始審查', status: 'blue' },
      { time: '昨日', text: 'VER-00459 原產地證明退回補件', status: 'warn' }
    ]
  },
  management: {
    en: 'Management Center', title: '平台治理管理',
    subtitle: '統一組織、帳號與權限治理，維持工程協作及系統運作秩序',
    sectionLabel: '管理工作區',
    sidebar: [
      { icon: 'users', label: '使用者管理' },
      { icon: 'building', label: '組織管理' },
      { icon: 'box', label: '供應商管理' },
      { icon: 'shield', label: '角色與權限', count: 2 },
      { icon: 'rules', label: '規則設定' },
      { icon: 'settings', label: '系統設定', count: 5 },
      { icon: 'report', label: '報表中心' }
    ],
    kpis: [
      { label: '使用者數量', value: '186', unit: '人', delta: '↑ 12', deltaType: 'neutral', foot: 'vs. 上月', icon: 'users', color: 'blue' },
      { label: '組織／供應商', value: '56', unit: '個', delta: '↑ 3', deltaType: 'neutral', foot: '8 組織 · 48 供應商', icon: 'building', color: 'purple' },
      { label: '權限異常', value: '2', unit: '件', delta: '↓ 3', deltaType: 'good', foot: '5 項系統待辦', icon: 'alert', color: 'orange' },
      { label: '系統可用率', value: '99.98%', unit: '', delta: '運作正常', deltaType: 'good', foot: '本月展示狀態', icon: 'shield', color: 'green' }
    ],
    trend: {
      title: '使用者／供應商趨勢', unit: '啟用使用者',
      bars: [104, 112, 118, 126, 132, 144, 152, 160, 174, 186, 192, 204],
      line: [30, 31, 32, 34, 36, 38, 40, 42, 45, 48, 50, 52],
      previous: [82, 86, 90, 96, 101, 108, 114, 120, 126, 134, 140, 148],
      max: 240, ticks: [0, 60, 120, 180, 240], legend: ['啟用使用者', '協作供應商', '去年使用者']
    },
    distribution: {
      title: '權限角色分布', total: '186', unit: '位使用者',
      items: [
        { label: '供應商申報', value: 42, color: '#2e8bfa' },
        { label: '工程管理', value: 24, color: '#2c83b8' },
        { label: '材料管理', value: 14, color: '#ffad44' },
        { label: '驗證審查', value: 10, color: '#ed8765' },
        { label: '管理主管', value: 7, color: '#9472dc' },
        { label: '平台管理員', value: 3, color: '#70aafa' }
      ]
    },
    table: {
      title: '最近管理活動', columns: ['操作項目', '操作人員', '所屬組織', '時間', '狀態'],
      rows: [
        ['新增供應商申報帳號', '陳志宏', '精誠特材', '10-13 10:05', { type: 'badge', text: '已完成', tone: 'green' }],
        ['調整 B 案工程檢視權限', 'Jin Chen', '機電工程部', '10-13 09:36', { type: 'badge', text: '已套用', tone: 'green' }],
        ['啟用材料文件必填規則', '吳宜庭', '永續管理室', '10-13 09:10', { type: 'badge', text: '已生效', tone: 'green' }],
        ['供應商組織資料審核', '林佳穎', '潔能科技', '10-12 16:48', { type: 'badge', text: '待核准', tone: 'orange' }],
        ['停用離職人員帳號', 'Jin Chen', '廠務工程一部', '10-12 15:22', { type: 'badge', text: '已完成', tone: 'green' }]
      ]
    },
    secondary: {
      title: '系統事件', columns: ['時間', '事件', '來源', '狀態'],
      rows: [
        ['10:00', '排程報表產生完成', '報表服務', { type: 'badge', text: '正常', tone: 'green' }],
        ['09:32', '供應商登入權限檢查', '存取控制', { type: 'badge', text: '待確認', tone: 'orange' }],
        ['08:00', '每日資料備份完成', '備份服務', { type: 'badge', text: '正常', tone: 'green' }]
      ]
    },
    tertiary: {
      title: '管理待辦事項', columns: ['事項', '負責單位', '期限', '狀態'],
      rows: [
        ['供應商帳號權限複核', '平台管理組', '10-15', { type: 'badge', text: '待處理', tone: 'orange' }],
        ['潔能科技組織資料核准', '採購管理部', '10-16', { type: 'badge', text: '待核准', tone: 'blue' }],
        ['季度角色權限檢視', '資訊管理部', '10-20', { type: 'badge', text: '進行中', tone: 'blue' }]
      ]
    },
    right: {
      title: '管理 KPI 詳細資訊', kpiLabel: '系統可用率', value: '99.98', unit: '%', delta: '運作正常',
      target: '99.9', targetLabel: '服務目標（%）', completion: 99.98,
      trendTitle: '近 6 個月可用率', spark: [99.92, 99.96, 99.94, 99.98, 99.97, 99.98],
      notesTitle: '平台治理重點',
      notes: ['186 位使用者，56 個協作組織', '2 件權限異常待複核與確認', '5 項管理待辦，含供應商資料核准'],
      activityTitle: '系統通知',
      activities: [
        { time: '10:05', title: '精誠特材申報帳號已啟用', meta: '陳志宏 · 使用者管理' },
        { time: '09:36', title: '新竹 B 案工程權限更新', meta: 'Jin Chen · 角色與權限' },
        { time: '08:00', title: '每日資料備份程序完成', meta: '平台排程 · 系統設定' }
      ],
      alert: { title: '2 件權限異常待確認', body: '1 個跨案場存取申請、1 個供應商角色異動，請進行權限複核。' },
      quickTitle: '快速管理操作',
      actions: [{ icon: 'users', label: '新增使用者' }, { icon: 'shield', label: '檢視角色與權限' }, { icon: 'building', label: '核准組織資料' }, { icon: 'history', label: '開啟系統稽核紀錄' }]
    },
    activity: [
      { time: '10:05', text: '精誠特材新增 2 位供應商申報人員', status: 'good' },
      { time: '09:36', text: '新竹 B 案工程檢視權限已更新', status: 'blue' },
      { time: '09:32', text: '2 件權限異常已加入複核清單', status: 'warn' }
    ]
  }
};
