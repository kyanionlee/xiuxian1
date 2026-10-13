/* ================================================================
   v1.6.3 二十层引妖（Claude）
   G 键 / 按钮最多叠 20 层。第 1 层妖物 ×2，之后每层 +20%（20 层约 ×5.8）。
   引妖期间刷出的妖物每层：血量 +8%、伤害 +6%、移速 +2%（20 层 ×2.6 / ×2.2 / ×1.4）。
   5 层起混入精英，10 层起每次引妖召来「妖潮头领」。场上数量到上限后，层数只加强妖物。
   奖励：通关灵石随层数增加；10 层以上额外一件装备；15 层以上轮回点 +1。
   ================================================================ */
const LURE20 = { max:20, per:0.2, hp:0.08, dmg:0.06, spd:0.02, cap:380, eliteCap:12 };
V162.lureMax = LURE20.max; V162.lureExtra = 0;
function lureN(s){ return s ? (s.lureN || (s.lured ? 1 : 0)) : 0; }
lure = function(){
  const s = STAGE; if (state !== 'play' || !s || s.done) return;
  const n = lureN(s); if (n >= LURE20.max) return toast('已引妖 20 层，妖潮已至极限。');
  s.lureN = n + 1; s.lured = true; s.zhanyi = Math.min(5, (s.zhanyi || 0) + 1);
  const m = s.lureN;
  banner(`引妖 ${m} 层 · 妖物 ×${(2 + LURE20.per * (m - 1)).toFixed(1)}`); try { sfx('drum'); } catch (e) {}
  if (m >= 10){
    try { const h = spawn('elite', undefined, undefined, { afxN:Math.min(3, 1 + Math.floor(m / 7)), lureBoss:true });
      if (h){ h.hp *= 2.5 + 0.15 * m; h.maxHp = h.hp; h.dmg *= 1.3; h.name = '妖潮头领'; } } catch (e) {}
  }
  if (m === 5) toast('引妖 5 层：妖潮中开始混入精英。');
  else if (m === 10) toast('引妖 10 层：每次引妖都会召来妖潮头领；通关额外得一件装备。');
  else if (m === 15) toast('引妖 15 层：通关额外 +1 轮回点。');
  try { captureBattle(); } catch (e) {}
};
const _spawn163 = spawn;
spawn = function(beh, x, y, extra){
  const e = _spawn163(beh, x, y, extra), s = STAGE, n = lureN(s);
  try {
    if (e && n && s && !s.done && !e.boss && !(extra && extra.lureBoss)){
      e.hp *= 1 + LURE20.hp * n; e.maxHp = e.hp; e.dmg *= 1 + LURE20.dmg * n; e.spd *= 1 + LURE20.spd * n;
    }
    if (e && n > 1 && s && !s.done && !LURE.inside && !['boss', 'elite'].includes(beh)){
      let extraCopies = LURE20.per * (n - 1); const copies = Math.floor(extraCopies) + (Math.random() < extraCopies % 1 ? 1 : 0);
      LURE.inside = true;
      try {
        for (let i = 0; i < copies && enemies.length < LURE20.cap; i++) _spawn163(beh, x === undefined ? undefined : x + rand(-30, 30), y === undefined ? undefined : y + rand(-30, 30), extra);
        if (n >= 5 && Math.random() < 0.01 * (n - 4) && enemies.filter(q => !q.dead && q.elite).length < LURE20.eliteCap) _spawn163('elite');
      } finally { LURE.inside = false; }
    }
  } catch (err) {}
  return e;
};
const _finish163 = finishStage;
finishStage = function(win, ...a){
  const s = STAGE, n = lureN(s);
  try {
    if (win && s && n >= 10){ const it = genItem(null, rollRarity(s.ch, 1.2), s.ch); s.lureLoot = addToBag(it); }
    if (win && s && n >= 15){ META.pts = (META.pts || 0) + 1; s.lurePt = 1; saveMeta(); }
  } catch (e) {}
  return _finish163(win, ...a);
};
const _reward163 = showReward;
showReward = function(...a){
  const r = _reward163(...a);
  try { const s = STAGE, n = lureN(s); if (s && n >= 10 && !RW?.fail){ const sub = overlay.querySelector('.panel .sub'); if (sub) sub.insertAdjacentHTML('afterend', `<p class="help" style="color:#ff8a5b">引妖 ${n} 层：${s.lureLoot || '额外装备'}${s.lurePt ? '；轮回点 +1' : ''}</p>`); } } catch (e) {}
  return r;
};
const _hud163 = hud;
hud = function(...a){
  const r = _hud163(...a);
  try {
    const s = STAGE, b = document.getElementById('lure-btn'); if (!s || !b) return r;
    const n = lureN(s), heat = Math.min(1, n / LURE20.max);
    b.disabled = n >= LURE20.max || !!s.done;
    b.textContent = n ? (n >= LURE20.max ? '引妖 20/20 · 极限' : `引妖 ${n}/20 · 再引 [G]`) : '引妖 · 妖物翻倍 [G]';
    b.style.borderColor = n ? `rgb(${200 + 55 * heat},${170 - 120 * heat},${110 - 80 * heat})` : '';
    b.style.color = n ? `rgb(255,${235 - 120 * heat},${200 - 150 * heat})` : '';
  } catch (e) {}
  return r;
};
