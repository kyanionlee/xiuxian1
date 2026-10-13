/* ================================================================
   v1.6.2 试玩反馈（Claude）
   - 加点页「−」号；炼器师上限 +8（每次 +2 不浪费），修复炼器师 +5 后按钮变灰。
   - 新手指引不再自动弹出长说明，改为第一场战斗里的三句提示。
   - 首领限时：超时狂暴；限时内击杀得「速斩赏」。首领招式命中时加冲击特效。
   - 难度：悟性的修为加成递减；标准难度中后期妖物更强，终局妖王血量提高。
   - 引妖可叠加（最多 3 次）；坊市新增研习玉简、洗髓丹、精元丹。
   数值都在 V162。
   ================================================================ */
const V162 = {
  smithCap:8,
  bossLimit:[100, 120, 140], guardLimit:[70, 85, 100], enrageDmg:1.8, enrageSpd:1.3,
  fastKill:[40, 80, 140],                       // 速斩赏灵石（按章节）
  stdHp:[1, 1.12, 1.25], stdDmg:[1, 1.15, 1.3], finalBossHp:1.35,
  lureMax:3, lureExtra:0.5,                       // 第 2、3 次引妖各再 +50% 妖物
};

/* ---------------- 加点「−」号 ---------------- */
const _showAttr162 = showAttr;
showAttr = function(...a){
  const r = _showAttr162(...a);
  try {
    const keys = Object.keys(ATTRS);
    overlay.querySelectorAll('.attrs .attr').forEach((row, i) => {
      const k = keys[i], add = row.querySelector('[data-act="addattr"]');
      if (add && (ATTRQ[k] || 0) > 0) add.insertAdjacentHTML('beforebegin', btn('attr-minus', '−', k, 'ghost'));
    });
  } catch (e) {}
  return r;
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act="attr-minus"]'); if (!b || state !== 'attr') return;
  e.stopImmediatePropagation(); const k = b.dataset.k;
  if (ATTRQ[k] > 0){ ATTRQ[k]--; if (!ATTRQ[k]) delete ATTRQ[k]; }
  try { sfx('click'); } catch (err) {}
  showAttr();
}, true);

/* ---------------- 炼器师：上限 +8，按钮不再在 +5 变灰 ---------------- */
const _showBag162 = showBag;
showBag = function(...a){
  const r = _showBag162(...a);
  try {
    if (P && P.prof === 'smith' && bagForge && bagSel && bagSel.eq){
      const it = P.eq[bagSel.eq], b = overlay.querySelector('[data-act="forge"]');
      if (it && b){ const full = it.lvl >= V162.smithCap; b.disabled = full; b.textContent = full ? '炼器 · 已满 +' + V162.smithCap : `炼器 +2（+${it.lvl} → +${Math.min(V162.smithCap, it.lvl + 2)}）`; }
    }
  } catch (e) {}
  return r;
};
if (PROFS.smith) PROFS.smith.desc = PROFS.smith.desc.replace('+7', '+' + V162.smithCap);

/* ---------------- 新手指引：改为战斗内提示 ---------------- */
const _beginRun162 = beginRun;
beginRun = function(...a){
  const seen = settings.guideSeen131; settings.guideSeen131 = true;   // 不再自动弹出长指引（首页、地图、暂停仍可打开）
  const r = _beginRun162(...a);
  if (!seen){ try { persist(); } catch (e) {} }
  return r;
};
const HINTS = [
  [1.5, '移动躲开妖物，角色会自动攻击。电脑 WASD / 方向键，手机按住拖动。'],
  [9, '打败妖物会掉灵气结晶，走过去吸收就能升级选技能。'],
  [18, '看顶部的本关目标。空格 / 双击：轻功；F：提前迎战；G：引妖。'] ];

/* ---------------- 首领限时、狂暴、速斩 ---------------- */
function finalFoe(s){ return s && (s.boss || s.guardian); }
function limitFor(s){ return (s.obj === 'boss' ? V162.bossLimit : V162.guardLimit)[Math.min(2, s.ch)]; }
const _updStage162 = updStage;
updStage = function(dt, ...a){
  const s = STAGE;
  const r = _updStage162(dt, ...a);
  try {
    if (!s || state !== 'play') return r;
    if (!META.hintsDone){ s.hintT = (s.hintT || 0) + dt; s.hintI = s.hintI || 0; const h = HINTS[s.hintI];
      if (h && s.hintT >= h[0]){ toast(h[1]); s.hintI++; if (s.hintI >= HINTS.length){ META.hintsDone = true; saveMeta(); } } }
    const f = finalFoe(s);
    if (f && !f.dead && !s.done){
      s.foeT = (s.foeT || 0) + dt;
      if (!s.enraged && s.foeT >= limitFor(s)){
        s.enraged = true; f.enraged = true; f.dmg *= V162.enrageDmg; f.spd *= V162.enrageSpd;
        banner(`${f.name || '首领'}狂暴 · 伤害大增`); try { sfx('boss'); } catch (e) {}
      }
      if (f.enraged && f.bossNext > 0) f.bossNext -= dt * 0.6;
    }
  } catch (e) {}
  return r;
};
const _finish162 = finishStage;
finishStage = function(win, ...a){
  const s = STAGE;
  try {
    if (win && s && finalFoe(s) && !s.enraged){ s.fastStones = V162.fastKill[Math.min(2, s.ch)]; P.stones += s.fastStones; }
    if (win && s && (s.lureN || 0) > 1){ const extra = Math.round(25 * (1 + s.ch) * (s.lureN - 1)); s.lureStones = (s.lureStones || 0) + extra; P.stones += extra; }
  } catch (e) {}
  return _finish162(win, ...a);
};
const _reward162 = showReward;
showReward = function(...a){
  const r = _reward162(...a);
  try { const s = STAGE; if (s && s.fastStones){ const sub = overlay.querySelector('.panel .sub'); if (sub) sub.insertAdjacentHTML('afterend', `<p class="help" style="color:#e6c879">速斩赏：限时内击败首领，灵石 +${s.fastStones}</p>`); } } catch (e) {}
  return r;
};

/* ---------------- 首领招式冲击特效 ---------------- */
const BFX = [];
if (typeof executeBoss === 'function'){
  const _exec162 = executeBoss;
  executeBoss = function(e, a, ...rest){
    try {
      const col = e.enraged ? '#ff4d3d' : ({ fox:'#ffaf69', drought:'#ff7a3d', wuchang:'#c4a1ff', demon:'#b07cff', bear:'#d9a35b', general:'#e6c879' })[e.pattern] || '#ff8a5b';
      BFX.push({ artSeq:++ULT_ART.seq, ...a, spots:a.spots ? a.spots.map(p => ({ ...p })) : null, ex:e.x, ey:e.y, col, t:0, dur:0.7 });
      if (BFX.length > 12) BFX.shift();
      shake = Math.max(shake || 0, a.shape === 'fan' || a.shape === 'summon' ? 3 : 7);
      // Particles are drawn procedurally by drawBossArt within the shared 120 budget.
      if (texts.length < 90) texts.push({ x:e.x, y:e.y - (e.r || 36) - 26, v:a.label || '妖术', t:0, crit:true });
    } catch (err) {}
    return _exec162(e, a, ...rest);
  };
}
function drawBFX(){
  const c=ctx,camX=P.x-W/2,camY=P.y-H/2;
  c.save();c.setTransform(DPR,0,0,DPR,-camX*DPR,-camY*DPR);
  for(const f of BFX){if(ULT_ART.left--<=0)break;drawBossArt(f);}
  // Persistent enrage status stays readable; no transient particles or blur.
  c.strokeStyle='#ff7665';c.lineWidth=2;c.globalAlpha=.65;
  for(const e of enemies){if(e.dead||!e.enraged)continue;c.beginPath();c.moveTo(e.x-10,e.y-e.r-12);c.lineTo(e.x,e.y-e.r-22);c.lineTo(e.x+10,e.y-e.r-12);c.stroke();}
  c.restore();
}
const _draw162 = draw;
draw = function(...a){
  const r = _draw162(...a);
  try { if (P && STAGE && !MENU_STATES.includes(state)) drawBFX(); } catch (e) {}
  return r;
};
const _update162 = update;
update = function(dt, ...a){
  const r = _update162(dt, ...a);
  for (const f of BFX) f.t += dt; for (let i = BFX.length - 1; i >= 0; i--) if (BFX[i].t >= BFX[i].dur) BFX.splice(i, 1);
  return r;
};
const _startStage162 = startStage;
startStage = function(...a){ BFX.length = 0; return _startStage162(...a); };

/* ---------------- 难度 ---------------- */
const _recalc162 = recalc;
recalc = function(...a){
  const r = _recalc162(...a);
  try {
    const n = (P.attr && P.attr.wu) || 0, full = 0.04 * n;
    const eff = 0.04 * Math.min(n, 10) + 0.02 * Math.min(Math.max(n - 10, 0), 10) + 0.01 * Math.max(n - 20, 0);
    P.st.xpMul = Math.max(1, P.st.xpMul - (full - eff));
  } catch (e) {}
  return r;
};
if (ATTRS.wu) ATTRS.wu.desc = '修为获取 +4%（10 点后 +2%，20 点后 +1%），冷却 -1.5%';
const _stageMult162 = stageMult, _dmgMult162 = dmgMult;
stageMult = function(){ const m = _stageMult162(); return RUN && !RUN.easy && STAGE ? m * V162.stdHp[Math.min(2, STAGE.ch)] : m; };
dmgMult = function(){ const m = _dmgMult162(); return RUN && !RUN.easy && STAGE ? m * V162.stdDmg[Math.min(2, STAGE.ch)] : m; };

/* ---------------- 引妖叠加（最多 3 次） ---------------- */
lure = function(){
  const s = STAGE; if (state !== 'play' || !s || s.done) return;
  const n = s.lureN || (s.lured ? 1 : 0); if (n >= V162.lureMax) return;
  s.lureN = n + 1; s.lured = true; s.zhanyi = Math.min(5, (s.zhanyi || 0) + 1);
  banner(`引妖 ×${s.lureN} · 妖物 ${['', '翻倍', '×2.5', '×3'][s.lureN]}`); try { sfx('drum'); } catch (e) {}
  toast(s.lureN < V162.lureMax ? `妖物更多，战意 +1，通关灵石更多。还能再引 ${V162.lureMax - s.lureN} 次。` : '已引妖三次：妖物 ×3，量力而行！');
  try { captureBattle(); } catch (e) {}
};
const _spawn162 = spawn;
spawn = function(beh, x, y, extra){
  const e = _spawn162(beh, x, y, extra), s = STAGE;
  try {
    if (e && beh === 'boss' && s && s.ch === 2 && RUN && !RUN.easy){ e.hp *= V162.finalBossHp; e.maxHp = e.hp; }
    const n = s && s.lureN || 0;
    if (n > 1 && !s.done && !LURE.inside && !['boss', 'elite'].includes(beh) && enemies.length < 380 && Math.random() < V162.lureExtra * (n - 1)){
      LURE.inside = true;
      try { _spawn162(beh, x === undefined ? undefined : x + rand(-24, 24), y === undefined ? undefined : y + rand(-24, 24), extra); } finally { LURE.inside = false; }
    }
  } catch (err) {}
  return e;
};
const _hud162 = hud;
hud = function(...a){
  const r = _hud162(...a);
  try {
    const s = STAGE; if (!s) return r;
    const b = document.getElementById('lure-btn'), n = s.lureN || (s.lured ? 1 : 0);
    if (b){ b.disabled = n >= V162.lureMax || !!s.done; b.textContent = n ? (n >= V162.lureMax ? '引妖 ×3 · 已满' : `再引妖 ×${n + 1} [G]`) : '引妖 · 妖物翻倍 [G]'; }
    const f = finalFoe(s), el = document.getElementById('flow-hud');
    if (f && !f.dead && !s.done && el){
      const left = Math.max(0, limitFor(s) - (s.foeT || 0));
      el.textContent = (s.enraged ? '首领狂暴中' : `速斩 ${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`) + (el.textContent ? ' · ' + el.textContent : '');
      el.hidden = false;
    }
  } catch (e) {}
  return r;
};

/* ---------------- 坊市：灵石的用途 ---------------- */
const _shopGoods162 = shopGoods;
shopGoods = function(...a){
  const g = _shopGoods162(...a);
  try {
    const m = (1 + 1.2 * RUN.ch) * (P.st.tianji ? 0.9 : 1);
    g.push({ k:'v162-tree', name:'研习玉简', desc:'研习点 +1（可在技能树学技能或升重）', price:Math.round(80 * m) });
    g.push(shuffle([
      { k:'v162-wash', name:'洗髓丹', desc:'已加的属性点全部退回，重新分配', price:Math.round(40 * m) },
      { k:'v162-core', name:'精元丹', desc:'所有伤害 +8%，气血上限 +30', price:Math.round(150 * m) } ])[0]);
  } catch (e) {}
  return g;
};
const _shopBuy162 = shopBuy;
shopBuy = function(i, ...a){
  const g = SHOP && SHOP.goods[i];
  if (!g || !String(g.k || '').startsWith('v162-')) return _shopBuy162(i, ...a);
  if (g.sold || P.stones < g.price) return;
  P.stones -= g.price; g.sold = true; try { sfx('coin'); } catch (e) {}
  let msg = '';
  if (g.k === 'v162-tree'){ P.treePoints = (P.treePoints || 0) + 1; msg = '研习点 +1。'; }
  else if (g.k === 'v162-wash'){ let n = 0; for (const k in P.attr){ n += P.attr[k] || 0; P.attr[k] = 0; } P.attrPts += n; recalc(); msg = `洗髓完成：退回 ${n} 个属性点。`; }
  else if (g.k === 'v162-core'){ P.bonus.dmg = (P.bonus.dmg || 0) + 0.08; bonus('hp', 30); msg = '所有伤害 +8%，气血上限 +30。'; }
  renderShop(msg);
};
