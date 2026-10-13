/* ================================================================
   v1.6.1 防误点、研习引导、开局宗门、战斗爽（Claude）
   1. 确认步骤：属性加点改为「先选后确认」；离开坊市、放弃此世弹出确认框。
   2. 技能树引导：有未用研习点时出发——首次强制打开技能树，之后弹出提醒。
   3. 开局宗门：除青云剑宗外，天符宗、金刚寺默认开放。
   4. 战斗爽：杂兵（成群、好杀）按难度与章节追加；兽潮外圈加一圈杂兵。
   5. 流派共鸣：主动技能分五个流派（锋、域、控、护、灵），
      单修（同流派 ≥3）与混搭（≥3 个不同流派）各有成型加成和招牌爽点。
   数值都在下面的 V161 常量里。
   ================================================================ */
const V161 = {
  // 杂兵追加比例（相对原刷怪速度），按章节 [第一章, 第二章, 第三章]
  fodderEasy:[0.30, 0.60, 0.80], fodderStd:[0.20, 0.45, 0.60], fodderJie:0.15,
  fodderHp:0.55, fodderDmg:0.7, fodderXp:0.5,
  // 兽潮外圈杂兵（相对本波数量）
  ringEasy:[0.25, 0.50, 0.50], ringStd:[0.18, 0.35, 0.35], ringJie:0.15, waveCap:70,
  cap:330, freeSects:['fu', 'jingang'],
};

document.head.insertAdjacentHTML('beforeend', `<style id="v161-style">
#v161-modal{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(5,12,14,.66);padding:16px}
#v161-modal .box{max-width:420px;width:100%;background:#13272a;border:1px solid #e6c879;border-radius:10px;padding:18px 16px;color:#f1ead6;box-shadow:0 10px 40px #000a;text-align:center}
#v161-modal h3{margin:0 0 8px;color:#e6c879}#v161-modal p{margin:0 0 14px;line-height:1.6}
#v161-modal .actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}#v161-modal .btn{min-height:44px}
.attr .pend{color:#e6c879;font-weight:700;margin-left:4px}
.flow-panel{margin:10px 0;padding:10px 12px;border:1px solid #e6c87988;border-radius:8px;background:rgba(230,200,121,.08);text-align:left}
.flow-panel b{color:#e6c879}.flow-panel p{margin:4px 0}
.flow-tag{display:inline-block;margin-left:6px;padding:0 6px;border-radius:9px;font-size:12px;line-height:18px;border:1px solid currentColor;vertical-align:middle}
.flow-guide{margin:8px 0;padding:10px 12px;border:1px solid #e6c879;border-radius:8px;background:rgba(230,200,121,.14);text-align:left}
#flow-hud{font-size:12px;color:#e6c879;margin-top:2px;text-shadow:0 1px 2px #000}
</style>`);

/* ---------------- 通用确认框 ---------------- */
function askConfirm(title, text, buttons){
  closeConfirm();
  const box = document.createElement('div'); box.id = 'v161-modal'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
  box.innerHTML = `<div class="box"><h3>${title}</h3><p>${text}</p><div class="actions">${buttons.map((b, i) => `<button class="btn ${b.cls || 'ghost'}" data-i="${i}">${b.label}</button>`).join('')}</div></div>`;
  box.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (!b){ if (e.target === box) closeConfirm(); return; }
    e.stopPropagation(); const f = buttons[+b.dataset.i].fn; closeConfirm();
    try { audioInit(); sfx('click'); } catch (err) {}
    if (f) f();
  });
  document.body.appendChild(box);
  box.querySelector('button')?.focus();
}
function closeConfirm(){ document.getElementById('v161-modal')?.remove(); }
document.addEventListener('keydown', e => {
  if (!document.getElementById('v161-modal')) return;
  if (e.code === 'Escape'){ e.preventDefault(); e.stopImmediatePropagation(); closeConfirm(); }
  else if (!['Enter', 'Space', 'Tab'].includes(e.code)) e.stopImmediatePropagation();
}, true);

/* ---------------- 属性加点：先选后确认 ---------------- */
let ATTRQ = {};
const attrPending = () => Object.values(ATTRQ).reduce((a, b) => a + b, 0);
function commitAttr(){
  const n = attrPending(); if (!n || !P) return;
  for (const k in ATTRQ){ const v = Math.min(ATTRQ[k], P.attrPts); if (v > 0){ P.attrPts -= v; P.attr[k] = (P.attr[k] || 0) + v; } }
  ATTRQ = {}; recalc();
  try { persistLoadout(); } catch (e) {}
  toast(`加点完成：共 ${n} 点。`);
}
const _showAttr161 = showAttr;
showAttr = function(back){
  if (back) ATTRQ = {};
  const r = _showAttr161(back);
  try {
    const pend = attrPending(), avail = (P.attrPts || 0) - pend, keys = Object.keys(ATTRS);
    overlay.querySelectorAll('.attrs .attr').forEach((row, i) => {
      const k = keys[i], p = ATTRQ[k] || 0, b = row.querySelector('b');
      if (p && b) b.insertAdjacentHTML('beforeend', `<span class="pend">+${p}</span>`);
      const add = row.querySelector('[data-act="addattr"]'); if (add) add.disabled = avail <= 0;
    });
    const pts = overlay.querySelector('.panel .pts');
    if (pts) pts.innerHTML = `可用属性点<b>${avail}</b>${pend ? `　<span style="color:#e6c879">待确认 ${pend} 点</span>` : ''}`;
    const back = overlay.querySelector('[data-act="attrback"]');
    if (back && pend) back.insertAdjacentHTML('beforebegin', `${btn('attr-commit', `确认加点（${pend}）`, null, 'red')}${btn('attr-reset', '重置', null, 'ghost')}`);
    if (back && !pend && (P.attrPts || 0) > 0) back.insertAdjacentHTML('beforebegin', '<p class="help" style="width:100%">点「+」先选好，再按「确认加点」才会生效。</p>');
  } catch (e) {}
  return r;
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  const a = b.dataset.act, k = b.dataset.k;
  if (!['addattr', 'attr-commit', 'attr-reset', 'attrback'].includes(a) || state !== 'attr' || !P) return;
  if (a === 'attrback' && !attrPending()) return;
  e.stopImmediatePropagation(); try { audioInit(); sfx('click'); } catch (err) {}
  if (a === 'addattr'){ if ((P.attrPts || 0) - attrPending() > 0) ATTRQ[k] = (ATTRQ[k] || 0) + 1; return showAttr(); }
  if (a === 'attr-reset'){ ATTRQ = {}; return showAttr(); }
  if (a === 'attr-commit'){ commitAttr(); return showAttr(); }
  const leave = () => { const f = attrBack; attrBack = null; return f ? f() : showMap(); };
  askConfirm('还有加点没有确认', `你选了 ${attrPending()} 个属性点，还没有确认。`, [
    { label:'确认加点并返回', cls:'red', fn:() => { commitAttr(); leave(); } },
    { label:'放弃这次加点', fn:() => { ATTRQ = {}; leave(); } },
    { label:'继续调整' } ]);
}, true);

/* ---------------- 离开坊市、放弃此世：确认 ---------------- */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  const a = b.dataset.act;
  if (a === 'leave-node' && state === 'shop' && typeof SHOP !== 'undefined' && SHOP){
    e.stopImmediatePropagation();
    askConfirm('离开坊市？', `离开后这家坊市就关闭了，不能再回来购买。当前灵石 ${P.stones}。`, [
      { label:'离开坊市', cls:'red', fn:() => completeNode(SHOP.node) }, { label:'再看看' } ]);
  } else if (a === 'quit'){
    e.stopImmediatePropagation();
    askConfirm('放弃此世？', '这一世的修行会立刻结束，按当前进度结算轮回点，无法撤销。', [
      { label:'放弃此世', cls:'red', fn:() => gameOver(false) }, { label:'继续修行' } ]);
  }
}, true);

/* ---------------- 技能树引导：首次强制，之后提醒 ---------------- */
let TREE_GUIDE = false;
function goTree(){ TREE_GUIDE = true; try { showTree(showMap); } finally { TREE_GUIDE = false; } }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act="node"]'); if (!b || state !== 'map' || !P || !RUN) return;
  const pts = P.treePoints || 0; if (pts <= 0) return;
  if (META.treeGuided && RUN.treeRemindOff) return;
  e.stopImmediatePropagation();
  const k = b.dataset.k;
  if (!META.treeGuided){
    META.treeGuided = true; saveMeta(); try { persist(); } catch (err) {}
    return goTree();
  }
  askConfirm(`还有 ${pts} 个研习点没用`, '研习点可以在技能树里直接学新技能或提升重数，出发前用掉更好打。', [
    { label:'去研习', cls:'red', fn:goTree },
    { label:'仍然出发', fn:() => enterNode(k) },
    { label:'本世不再提醒', fn:() => { RUN.treeRemindOff = true; enterNode(k); } } ]);
}, true);

/* ---------------- 开局宗门：天符宗、金刚寺默认开放 ---------------- */
for (const k of V161.freeSects) if (SECTS[k]) SECTS[k].cost = 0;
function ensureSects(){ if (META){ META.sects = META.sects || {}; META.sects.jian = true; for (const k of V161.freeSects) META.sects[k] = true; } }
ensureSects();
const _applySave161 = applySave;
applySave = function(...a){ const r = _applySave161(...a); ensureSects(); return r; };
const _showSetup161 = showSetup;
showSetup = function(...a){ ensureSects(); return _showSetup161(...a); };

/* ================================================================
   流派共鸣
   ================================================================ */
const FLOW_TAGS = {
  feng:{ n:'锋', name:'剑锋', col:'#9fe3ff', desc:'直接伤害' },
  yu:  { n:'域', name:'震域', col:'#d9a35b', desc:'范围伤害' },
  kong:{ n:'控', name:'镇封', col:'#a9d8ff', desc:'定身减速' },
  hu:  { n:'护', name:'护元', col:'#72ccab', desc:'护盾回复' },
  ling:{ n:'灵', name:'御灵', col:'#b597dc', desc:'召唤' },
};
const FLOW_OF = {
  sword:'feng', jian_line:'feng', jian_rain:'feng', jian_guard:'hu', jian_return:'yu',
  ice:'kong', wind:'yu', wood:'hu', thunder:'yu', meteor:'yu',
  fist:'feng', staff:'yu', aura:'yu', ti_guard:'hu', ti_quake:'yu',
  banner:'ling', drain:'hu', seal:'kong', hun_fire:'kong', hun_prison:'kong',
  sonic:'yu', yue_heal:'hu', yue_shield:'hu', yue_slow:'yu', yue_wave:'yu',
  zhenpan:'kong', array_spring:'hu', array_flame:'yu', array_prison:'kong', array_storm:'kong',
  fire:'feng', hushen:'hu', zhenyao:'kong', fu_chain:'kong', fu_burst:'kong',
  dart:'feng', miasma:'yu', gu:'ling', rot:'yu', du_seed:'yu',
};
function flowOf(k){
  if (FLOW_OF[k]) return FLOW_OF[k];
  const s = SK[k]; if (!s || s.cat === 'p') return null;
  if (s.summon || s.kind || (V7_OWNER && ['yushou', 'kuilei'].includes(V7_OWNER[k]))) return 'ling';
  return 'feng';
}
// 专精：[成型, 大成]；招牌爽点每斩 every 只触发
const FLOW_SPEC = {
  feng:{ st:[{ dmg:0.15, crit:0.05 }, { dmg:0.25, crit:0.08 }], every:20, proc:'万剑齐发', pdesc:'每斩 20 只，向四周射出 8 道剑芒（大成 12 道）' },
  yu:  { st:[{ area:0.15 }, { area:0.25 }], every:0, proc:'连环爆', pdesc:'击杀时 12% 几率原地爆炸，可连锁引爆（大成 18%）' },
  kong:{ st:[{ cd:0.10 }, { cd:0.15 }], every:25, proc:'镇压', pdesc:'被定身或减速的妖物受伤 +25%（大成 +40%）；每斩 25 只放出震慑波' },
  hu:  { st:[{ hp:0.15, regen:1 }, { hp:0.25, regen:2 }], every:25, proc:'金身', pdesc:'每斩 25 只获得护盾并震退周围妖物' },
  ling:{ st:[{ pet:0.25 }, { pet:0.40 }], every:30, proc:'万灵齐啸', pdesc:'每斩 30 只，召唤物伤害 ×1.6，持续 5 秒' },
};
const FLOW_MIX = [
  { need:3, name:'三才', st:{ dmg:0.08, cd:0.06 }, every:35, heal:0.04, pdesc:'每斩 35 只触发「万象归一」：大范围冲击、短暂定身、回复 4% 气血' },
  { need:4, name:'四象', st:{ dmg:0.12, cd:0.10, area:0.08 }, every:25, heal:0.06, pdesc:'每斩 25 只触发「万象归一」：大范围冲击、短暂定身、回复 6% 气血' },
];
const FLOW = { spec:null, specTier:0, mix:null, sig:'', kills:0, mixKills:0, booms:[], frenzyT:0 };
function flowCalc(){
  const cnt = {}, lvs = {};
  if (!P || !P.sk) return { cnt, lvs, spec:null, specTier:0, mix:null };
  for (const k of Object.keys(P.sk)){ const t = (P.sk[k] > 0) && flowOf(k); if (!t) continue; cnt[t] = (cnt[t] || 0) + 1; lvs[t] = (lvs[t] || 0) + P.sk[k]; }
  let spec = null; for (const t in cnt) if (cnt[t] >= 3 && (!spec || cnt[t] > cnt[spec] || (cnt[t] === cnt[spec] && lvs[t] > lvs[spec]))) spec = t;
  const specTier = spec ? (cnt[spec] >= 4 || lvs[spec] >= 12 ? 2 : 1) : 0;
  const kinds = Object.keys(cnt).length, mix = kinds >= 4 ? FLOW_MIX[1] : kinds >= 3 ? FLOW_MIX[0] : null;
  return { cnt, lvs, spec, specTier, mix };
}
function flowLabel(f){
  const out = [];
  if (f.spec) out.push(`${FLOW_TAGS[f.spec].name}${f.specTier > 1 ? '大成' : '专精'}`);
  if (f.mix) out.push(`混搭·${f.mix.name}`);
  return out.join(' + ');
}
const _recalc161 = recalc;
recalc = function(...a){
  const prev = P && P.st ? P.st.maxHp : 0;
  const r = _recalc161(...a);
  try {
    const f = flowCalc(); FLOW.spec = f.spec; FLOW.specTier = f.specTier; FLOW.mix = f.mix;
    const add = { dmg:0, crit:0, area:0, cd:0, hp:0, regen:0, pet:0 };
    if (f.spec) Object.entries(FLOW_SPEC[f.spec].st[f.specTier - 1]).forEach(([k, v]) => add[k] += v);
    if (f.mix) Object.entries(f.mix.st).forEach(([k, v]) => add[k] += v);
    const s = P.st, baseMax = s.maxHp;
    s.dmg *= 1 + add.dmg; s.crit = Math.min(0.75, s.crit + add.crit); s.area *= 1 + add.area;
    s.cdMul = Math.max(0.35, s.cdMul * (1 - add.cd)); s.regen += add.regen;
    s.petMul *= (1 + add.pet) * (FLOW.frenzyT > 0 ? 1.6 : 1);
    if (add.hp){ s.maxHp = Math.round(s.maxHp * (1 + add.hp)); if (prev && s.maxHp > prev) P.hp += s.maxHp - Math.max(prev, baseMax); }
    P.hp = Math.min(P.hp, s.maxHp);
    const sig = flowLabel(f);
    if (FLOW.pRef !== P){ FLOW.pRef = P; FLOW.sig = sig; }
    if (sig !== FLOW.sig){ const was = FLOW.sig; FLOW.sig = sig; if (sig && P.lvl > 0 && (!was || sig.length >= was.length) && ['play', 'levelup', 'skill-tree', 'attr', 'map'].includes(state)) { try { banner('流派成型 · ' + sig); } catch (e) {} } }
  } catch (e) {}
  return r;
};
const _addSkill161 = addSkill;
addSkill = function(k, ...a){ const r = _addSkill161(k, ...a); try { if (SK[k] && SK[k].cat !== 'p') recalc(); } catch (e) {} return r; };

function procBase(){ return (10 + 1.5 * (P.lvl || 1)) * (1 + 0.8 * (STAGE ? STAGE.ch : 0)); }
function flowFloat(t, col){ if (texts.length < 90) texts.push({ x:P.x, y:P.y - 46, v:t, t:0, crit:true, color:col }); }
function procSpec(){
  const t = FLOW.spec, big = FLOW.specTier > 1, base = procBase(), area = P.st.area;
  if (t === 'feng'){
    const n = big ? 12 : 8, off = Math.random() * Math.PI;
    for (let i = 0; i < n; i++){ const a = off + i / n * Math.PI * 2; line(P.x, P.y, a, 330 * area, 16, base * 1.2, 90, 'w');  }
    emitUltArt('feng',P.x,P.y,330 * area,.6); flowFloat('万剑齐发'); try { sfx('evo'); } catch (e) {}
  } else if (t === 'kong'){
    const r = 210 * area; aoe(P.x, P.y, r, base * 0.6, 160, 'g', { stun:0.8, slow:1.5 }); emitUltArt(t,P.x,P.y,r,.5);
    flowFloat('镇压');
  } else if (t === 'hu'){
    addShield(P.st.maxHp * (big ? 0.12 : 0.08), 0); const r = 140 * area; aoe(P.x, P.y, r, base * 0.9, 240, 'g'); emitUltArt(t,P.x,P.y,r,.5);
    flowFloat('金身');
  } else if (t === 'ling'){
    FLOW.frenzyT = 5; recalc(); emitUltArt('ling',P.x,P.y,180 * area,.7); flowFloat('万灵齐啸');
  }
}
function procMix(){
  const m = FLOW.mix, r = 260 * P.st.area;
  aoe(P.x, P.y, r, procBase() * 1.6, 220, 'g', { stun:0.6 });
  emitUltArt('mix',P.x,P.y,r,.6);
  heal(P.st.maxHp * m.heal, true); flowFloat('万象归一'); try { sfx('evo'); } catch (e) {}
}
const _kill161 = kill;
kill = function(e, ...a){
  const was = e && e.dead, r = _kill161(e, ...a);
  try {
    if (!was && e && e.dead && STAGE && !STAGE.done && state === 'play'){
      if (FLOW.spec === 'yu'){ if (Math.random() < (FLOW.specTier > 1 ? 0.18 : 0.12) && FLOW.booms.length < 24) FLOW.booms.push({ x:e.x, y:e.y }); }
      else if (FLOW.spec){ FLOW.kills++; const ev = FLOW_SPEC[FLOW.spec].every; if (ev && FLOW.kills >= ev){ FLOW.kills = 0; procSpec(); } }
      if (FLOW.mix){ FLOW.mixKills++; if (FLOW.mixKills >= FLOW.mix.every){ FLOW.mixKills = 0; procMix(); } }
    }
  } catch (err) {}
  return r;
};
const _hit161 = hit;
hit = function(e, dmg, ...a){
  if (FLOW.spec === 'kong' && e && !e.dead && (e.stunT > 0 || e.slowT > 0)) dmg *= FLOW.specTier > 1 ? 1.4 : 1.25;
  return _hit161(e, dmg, ...a);
};

/* ---------------- 杂兵与兽潮 ---------------- */
function byCh(arr){ return arr[Math.min(2, STAGE ? STAGE.ch : 0)]; }
function fodderRate(){ if (!RUN) return 0; let k = RUN.jie > 0 ? V161.fodderJie : byCh(RUN.easy ? V161.fodderEasy : V161.fodderStd); if (typeof PERF !== 'undefined' && PERF.done) k *= 0.5; return k; }
function ringRate(){ if (!RUN) return 0; let k = RUN.jie > 0 ? V161.ringJie : byCh(RUN.easy ? V161.ringEasy : V161.ringStd); if (typeof PERF !== 'undefined' && PERF.done) k *= 0.5; return k; }
function spawnFodder(beh, x, y){
  const e = spawn(beh, x, y, { afxN:0 });
  if (e){ e.fodder = true; e.hp *= V161.fodderHp; e.maxHp = e.hp; e.dmg *= V161.fodderDmg; e.xp *= V161.fodderXp; }
  return e;
}
function fodderGroup(n){
  const a = Math.random() * Math.PI * 2, R = Math.hypot(W, H) / 2 + 50, beh = STAGE.ch >= 1 && Math.random() < 0.5 ? 'swarm' : 'chase';
  for (let i = 0; i < n; i++) spawnFodder(beh, P.x + Math.cos(a) * R + rand(-26, 26), P.y + Math.sin(a) * R + rand(-26, 26));
}
function waveRing(extra){
  const s = STAGE; if (!s || s.done) return;
  extra = Math.min(V161.waveCap, Math.round(extra));
  if (extra <= 0) return;
  const R = Math.min(W, H) / 2 + 170, off = Math.random();
  for (let i = 0; i < extra && enemies.length < V161.cap + 40; i++){ const a = (i + off) / extra * Math.PI * 2; spawnFodder(s.wave >= 3 ? 'fast' : 'swarm', P.x + Math.cos(a) * R, P.y + Math.sin(a) * R); }
  FLOW.ringWave = s.wave;
}
const _assault161 = assault;
assault = function(...a){
  const s = STAGE, before = s ? s.wave : 0, r = _assault161(...a);
  try {
    if (s && s.wave > before && !s.done){
      const raw = 14 + s.wave * 4 + s.ch * 4, spawned = Math.min(44, raw), overflow = Math.max(0, Math.min(V161.waveCap, raw) - 44);
      waveRing(spawned * ringRate() + overflow);
    }
  } catch (e) {}
  return r;
};
const _updStage161 = updStage;
updStage = function(dt, ...a){
  const s = STAGE, before = s ? s.wave : 0;
  const r = _updStage161(dt, ...a);
  try {
    if (s && !s.done && state === 'play'){
      if (s.wave > before && FLOW.ringWave !== s.wave) waveRing((24 + s.wave * 4 + s.ch * 6) * ringRate());
      const base = Math.min(13, 1.4 + s.t / 20 + s.ch * 1.2 + s.wave * 0.6) * (s.boss ? 0.6 : 1);
      FLOW.acc = (FLOW.acc || 0) + base * fodderRate() * dt;
      while (FLOW.acc >= 4){ FLOW.acc -= 4; if (enemies.length >= V161.cap){ FLOW.acc = 0; break; } fodderGroup(randi(3, 5)); }
    }
    let n = 0;
    while (FLOW.booms.length && n < 6){
      const b = FLOW.booms.shift(), rr = 72 * P.st.area; n++;
      aoe(b.x, b.y, rr, procBase() * 0.8, 70, 'g'); fx.push({ k:'ring', x:b.x, y:b.y, r:rr, t:0, dur:0.35 });
    }
    if (FLOW.frenzyT > 0){ FLOW.frenzyT -= dt; if (FLOW.frenzyT <= 0){ FLOW.frenzyT = 0; recalc(); } }
  } catch (e) {}
  return r;
};
const _startStage161 = startStage;
startStage = function(...a){
  FLOW.kills = 0; FLOW.mixKills = 0; FLOW.booms = []; FLOW.acc = 0; FLOW.ringWave = -1;
  if (FLOW.frenzyT){ FLOW.frenzyT = 0; }
  const r = _startStage161(...a);
  try { recalc(); } catch (e) {}
  return r;
};

/* ---------------- 界面：战斗计数、技能树流派面板、升级卡流派标签 ---------------- */
const _hud161 = hud;
hud = function(...a){
  const r = _hud161(...a);
  try {
    let el = document.getElementById('flow-hud');
    if (!el){ const o = document.getElementById('obj'); if (!o) return r; o.insertAdjacentHTML('afterend', '<div id="flow-hud"></div>'); el = document.getElementById('flow-hud'); }
    const parts = [];
    if (FLOW.spec){ const S = FLOW_SPEC[FLOW.spec]; parts.push(S.every ? `${S.proc} ${FLOW.kills}/${S.every}` : `${FLOW_TAGS[FLOW.spec].name}·${S.proc}`); }
    if (FLOW.mix) parts.push(`万象 ${FLOW.mixKills}/${FLOW.mix.every}`);
    if (FLOW.frenzyT > 0) parts.push(`齐啸 ${Math.ceil(FLOW.frenzyT)}s`);
    el.textContent = parts.join(' · '); el.hidden = !parts.length;
  } catch (e) {}
  return r;
};
function flowTag(k){ const t = flowOf(k); if (!t) return ''; const T = FLOW_TAGS[t]; return `<span class="flow-tag" style="color:${T.col}" title="${T.name}流：${T.desc}">${T.n}</span>`; }
function flowStatText(o){
  const N = { dmg:'伤害', crit:'暴击', area:'范围', cd:'冷却缩减', hp:'气血上限', regen:'回复/秒', pet:'灵兽伤害' };
  return Object.entries(o).map(([k, v]) => `${N[k]} +${k === 'regen' ? v : Math.round(v * 100) + '%'}`).join('，');
}
function flowPanel(){
  const f = flowCalc(), have = Object.keys(f.cnt).map(t => `${FLOW_TAGS[t].n}×${f.cnt[t]}`).join('　') || '尚无主动技能';
  const lines = [];
  if (f.spec) lines.push(`<p><b>单修 · ${FLOW_TAGS[f.spec].name}${f.specTier > 1 ? '大成' : '专精'}</b>：${flowStatText(FLOW_SPEC[f.spec].st[f.specTier - 1])}。${FLOW_SPEC[f.spec].pdesc}。</p>`);
  if (f.mix) lines.push(`<p><b>混搭 · ${f.mix.name}</b>：${flowStatText(f.mix.st)}。${f.mix.pdesc}。</p>`);
  if (!lines.length) lines.push('<p>同一流派学满 3 个主动技能 →「单修专精」（4 个或总重数 12 →「大成」）；学会 3 种不同流派 →「混搭三才」（4 种 →「四象」）。两者可以同时成立。</p>');
  return `<section class="flow-panel"><p><b>流派共鸣</b>　当前：${have}</p>${lines.join('')}<p class="help" style="margin:4px 0 0">锋＝直接伤害　域＝范围　控＝定身减速　护＝护盾回复　灵＝召唤</p></section>`;
}
const _showTree161 = showTree;
showTree = function(...a){
  const r = _showTree161(...a);
  try {
    const h = overlay.querySelector('.panel h2');
    if (h){
      h.insertAdjacentHTML('afterend', flowPanel());
      if (TREE_GUIDE) h.insertAdjacentHTML('afterend', `<div class="flow-guide"><b style="color:#e6c879">出发前先研习</b>：你还有 ${P.treePoints || 0} 个研习点。点技能下方的「研习」就能学会或升重，用完点「返回」回到地图。</div>`);
    }
    overlay.querySelectorAll('[data-act="v7-learn"]').forEach(b => { const k = b.dataset.k, h3 = b.closest('article')?.querySelector('h3'); if (h3 && !h3.querySelector('.flow-tag')) h3.insertAdjacentHTML('beforeend', flowTag(k)); });
  } catch (e) {}
  return r;
};
const _renderLv161 = renderLevelUp;
renderLevelUp = function(...a){
  const r = _renderLv161(...a);
  try { overlay.querySelectorAll('.card[data-act="lv"]').forEach(c => { const k = curOpts[+c.dataset.k]; if (typeof k === 'string' && SK[k] && SK[k].cat !== 'p'){ const em = c.querySelector('em'); if (em) em.insertAdjacentHTML('beforeend', flowTag(k)); } }); } catch (e) {}
  return r;
};

/* ================================================================
   PC 视角与性能、首领 / 精英方位指示
   - 电脑（精细指针）上把视野缩放到短边约 600 逻辑像素，接近手机视角的 1.5 倍；
     画布像素总量限制在约 240 万（流畅模式 100 万），大屏高分辨率不再拖慢。
   - 修灵气结晶：去掉每颗结晶的阴影模糊（构建时替换），场上结晶超过 140 颗自动合并。
   - 首领、镇守、精英在屏幕外时，屏幕边缘显示箭头、名字和距离。
   ================================================================ */
const VIEW = { short:600, budget:2.4e6, budgetSlow:1.0e6, zoom:1 };
const _resize161 = resize;
resize = function(...a){
  _resize161(...a);
  try {
    const iw = innerWidth, ih = innerHeight, fine = !matchMedia('(pointer: coarse)').matches;
    const slow = typeof PERF !== 'undefined' && PERF.done;
    const z = fine ? Math.max(1, Math.min(iw, ih) / VIEW.short) : 1;
    const sp = slow ? 1 : Math.min(Math.min(2, devicePixelRatio || 1), Math.sqrt((slow ? VIEW.budgetSlow : VIEW.budget) / (iw * ih)));
    VIEW.zoom = z; W = iw / z; H = ih / z; DPR = sp * z;
    cvs.width = Math.round(iw * sp); cvs.height = Math.round(ih * sp);
    cvs.style.width = iw + 'px'; cvs.style.height = ih + 'px';
  } catch (e) {}
};
addEventListener('resize', () => resize());
resize();
const _dropOrb161 = dropOrb;
dropOrb = function(x, y, v){
  if (orbs.length > 140){ for (let i = 0; i < 6; i++){ const o = orbs[Math.floor(Math.random() * orbs.length)]; if (o && o.v){ o.v += v; return; } } }
  return _dropOrb161(x, y, v);
};
const _draw161 = draw;
draw = function(...a){
  const r = _draw161(...a);
  try {
    if (!P || !STAGE || MENU_STATES.includes(state)) return r;
    const list = enemies.filter(e => !e.dead && (e.boss || e.elite));
    if (!list.length) return r;
    list.sort((p, q) => (q.boss || q.guardian ? 1 : 0) - (p.boss || p.guardian ? 1 : 0) || d2(p, P) - d2(q, P));
    const c = ctx, m = 30, camX = P.x - W / 2, camY = P.y - H / 2;
    c.save(); c.setTransform(DPR, 0, 0, DPR, 0, 0);
    for (const e of list.slice(0, 4)){
      const sx = e.x - camX, sy = e.y - camY;
      if (sx > -e.r && sx < W + e.r && sy > -e.r && sy < H + e.r) continue;
      const dx = sx - W / 2, dy = sy - H / 2, k = Math.min((W / 2 - m) / Math.abs(dx || 1e-6), (H / 2 - m - 40) / Math.abs(dy || 1e-6));
      const x = W / 2 + dx * k, y = H / 2 + dy * k, ang = Math.atan2(dy, dx), big = e.boss || e.guardian;
      const col = e.boss ? '#ff6b5b' : big ? '#ffb347' : '#e6c879', pulse = 0.75 + 0.25 * Math.sin(performance.now() / 160);
      c.translate(x, y); c.rotate(ang); c.globalAlpha = pulse; c.fillStyle = col; c.strokeStyle = '#000a'; c.lineWidth = 2;
      const s = big ? 16 : 11; c.beginPath(); c.moveTo(s, 0); c.lineTo(-s * 0.7, s * 0.75); c.lineTo(-s * 0.35, 0); c.lineTo(-s * 0.7, -s * 0.75); c.closePath(); c.stroke(); c.fill();
      c.setTransform(DPR, 0, 0, DPR, 0, 0); c.globalAlpha = 1;
      const lx = x - Math.cos(ang) * (s + 16), ly = y - Math.sin(ang) * (s + 16);
      c.font = `${big ? 700 : 400} ${big ? 13 : 11}px "Noto Serif SC",serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      const label = `${big ? (e.name || '首领') : '精英'} ${Math.round(Math.sqrt(d2(e, P)) / 10)} 丈`;
      const tw = c.measureText(label).width / 2 + s + 8, cx = Math.max(tw, Math.min(W - tw, lx)), cy = Math.max(s + 50, Math.min(H - s - 50, ly));
      c.lineWidth = 3; c.strokeStyle = '#000c'; c.strokeText(label, cx, cy); c.fillStyle = col; c.fillText(label, cx, cy);
    }
    c.restore(); c.textBaseline = 'alphabetic';
  } catch (e) {}
  return r;
};
