
/* ================================================================
   更新公告（Claude）：老玩家打开游戏时显示本次更新内容。
   「知道了」：本版本不再显示；「以后不再弹出」：之后都不自动弹出（首页仍可手动查看）。
   新增版本时，在 NOTICES 最前面加一条即可。
   ================================================================ */
const NOTICES = [
  { v:'1.6.1', title:'流派共鸣与防误点', items:[
    '新增「流派共鸣」：主动技能分为锋（直伤）、域（范围）、控（定身减速）、护（护盾回复）、灵（召唤）五个流派，技能树和升级卡片上都有标记。',
    '单修专精：同一流派学会 3 个主动技能即成型（4 个或总重数 12 为大成），获得属性加成和招牌效果——万剑齐发、连环爆、镇压、金身、万灵齐啸。',
    '混搭三才 / 四象：学会 3 / 4 种不同流派，伤害与冷却提升，并定期触发「万象归一」大范围冲击并回血。专精与混搭可以同时成立。',
    '战斗更爽：新增成群出现的「杂兵」（血少、好杀），兽潮外圈多一圈妖物，从容与标准难度的中后期最明显；卡顿设备会自动减量。',
    '防误点：属性加点改为先选好再按「确认加点」；离开坊市、放弃此世都会先弹出确认。',
    '有未用的研习点时出发：第一次会先打开技能树，之后会提醒（可选本世不再提醒）。',
    '开局宗门：除青云剑宗外，天符宗、金刚寺也默认开放，不用非得选剑。',
    '电脑版：修复战斗越打越卡的问题（灵气结晶的发光效果在大屏上非常耗性能，已去掉并自动合并），画面像素量限制在合理范围；视角拉近到接近手机的 1.5 倍。',
    '妖王、镇守和精英在屏幕外时，屏幕边缘会显示箭头、名字和距离，方便找到它们过关。',
    '手机界面：卡片和按钮更紧凑好点，暂停菜单「继续」放到底部，鸣钟 / 引妖有触屏按钮，修复暂停菜单重复弹出，落剑、雷阵等技能特效重绘。' ] },
  { v:'1.6.0', title:'轻功', items:[
    '新增轻功：电脑按空格，手机快速双击屏幕，朝移动方向短距离冲刺，起步瞬间无敌，可以闪避妖王的范围攻击和落雷。',
    '轻功次数随境界增加（金丹、化神各 +1，最多 3 次），用完后自动回复；气血条旁显示剩余次数。',
    '仙品、神品云履可以延长无敌时间；轮回殿「道果」新增「凌波」：轻功次数 +1。',
    '轻功联动：学会本职业核心技能后，轻功会附带职业效果。剑修剑气穿行、法修寒霜步、体修崩山落、魂修噬魂步、乐修惊弦、阵修阵步、符箓师遁符、驭兽师唤灵、傀儡师替身傀、毒师毒影；技能重数越高、进化后越强。',
    '云履新增轻功词条：宝品以上可能出现，神品必定带有。穿影（路径伤害）、焰踪（路径起火）、护体（冲刺后护盾）、回风（30% 不耗次数），可与职业轻功叠加。',
    '鸣钟赏：提前迎战（F 键或鸣钟按钮）现在有奖励——每提前 1 秒都得灵石，残余妖物多时再 ×1.5；每次鸣钟叠一层战意（伤害 +5%、修为 +8%，最多 5 层）；提前召唤首领或战意 3 层以上，战利品装备品质 +1；节省的时间还能换轮回点。',
    '新增「引妖」（G 键或战斗中的按钮）：本关妖物翻倍，修为更多，战意 +1，通关额外奖励灵石。',
    '新增「从容」难度：妖物血量和伤害大幅降低，适合新手（轮回点减半）；前三世默认选择从容。',
    '地图出发前会提醒未分配的属性点、行囊里更好的装备和未用的研习点。',
    '平衡调整：剑修气血 +30、减伤 +5%；毒师毒素叠加上限降低，腐骨散毒性与传染数量下调。',
    '修复：地图区域无法上下滑动；加点页说明属性没有上限但收益递减；道基进度改为数字显示；回风剑轮等环身技能新增清楚的范围特效；画面卡顿时自动切换流畅模式。',
    '新增更新公告：每次更新后首次打开时显示一次。' ] },
  { v:'1.5.1', title:'修复与道果', items:[
    '修复召唤流加点无效：青狼、火鸦、木傀、机关蛛、蛊虫每升一重都多一只；「统御」每重 +1 只。升级卡片会写明「青狼 2→3 只」。',
    '修复技能树、属性加点、行囊、坊市等页面操作后跳回顶部、折叠区自动收起的问题。',
    '轮回殿新增「道果 · 高阶修习」：宿慧、本命温养、先天道体、护道、福泽、道基，攒下的轮回点终于有用处了。' ] },
  { v:'1.5.0', title:'配乐', items:[
    '新增 10 首场景配乐：首页、三大地域的地图与战斗、妖王决战、剧情回忆、结局，随场景自动切换。',
    '手机上需要先点一下屏幕才会出声；设置中可以关闭音乐。' ] },
];
const verNum = v => v.split('.').reduce((a, n) => a * 1000 + (+n || 0), 0);
const NOTICE_LATEST = NOTICES[0].v;
function unseenNotices(){ const seen = settings.noticeSeen || '0.0.0'; return NOTICES.filter(n => verNum(n.v) > verNum(seen)); }
function isVeteran(){ return (META.runs || 0) > 0 || !!(META.karma && META.karma.life > 0) || (typeof hasRun === 'function' && hasRun()); }
function showNotice(list, auto){
  const items = (list && list.length ? list : NOTICES.slice(0, 1));
  state = 'notice';
  showOverlay(`<div class="panel"><p class="journey-kicker">更新公告</p><h2>问道篇 v${items[0].v}</h2>
    ${items.map(n => `<section class="journey-banner" style="text-align:left"><h3>v${n.v} · ${n.title}</h3>${n.items.map(t => `<p>· ${t}</p>`).join('')}</section>`).join('')}
    <p class="help">如果画面仍是旧版，请在网址后加上 ?v=${NOTICE_LATEST.replace(/\./g, '')} 重新打开。</p>
    <div class="actions">${btn('notice-ok', '知道了', null, 'red')}${auto ? btn('notice-never', '以后不再弹出', null, 'ghost') : ''}</div></div>`);
}
function closeNotice(never){
  settings.noticeSeen = NOTICE_LATEST;
  if (never) settings.noticeNever = true;
  try { persist(); } catch (e) {}
  showTitle();
}
const _showTitleNotice = showTitle;
showTitle = function(...a){
  const r = _showTitleNotice(...a);
  try {
    const anchor = overlay.querySelector('[data-act="setup"]') || overlay.querySelector('[data-act="continue"]');
    if (anchor && !overlay.querySelector('[data-act="notice-open"]')) anchor.insertAdjacentHTML('afterend', btn('notice-open', '更新公告', null, 'ghost'));
    if (!settings.noticeSeen && !isVeteran()){ settings.noticeSeen = NOTICE_LATEST; try { persist(); } catch (e) {} return r; }
    const list = unseenNotices();
    if (list.length && !settings.noticeNever) showNotice(list, true);
  } catch (e) {}
  return r;
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  const a = b.dataset.act; if (!['notice-ok', 'notice-never', 'notice-open'].includes(a)) return;
  e.stopImmediatePropagation(); try { audioInit(); sfx('click'); } catch (err) {}
  if (a === 'notice-open') showNotice(NOTICES.slice(0, 3), false);
  else closeNotice(a === 'notice-never');
}, true);
